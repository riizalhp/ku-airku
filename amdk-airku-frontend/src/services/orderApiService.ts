import { supabase } from '../lib/supabaseClient';
import { Order } from '../types';

type CreateOrderPayload = {
    storeId: string;
    items: { productId: string, quantity: number, specialPrice?: number }[];
    desiredDeliveryDate?: string;
}

type UpdateOrderPayload = {
    id: string;
    items: { productId: string, quantity: number, specialPrice?: number }[];
    assignedVehicleId: string | null;
    desiredDeliveryDate?: string;
}

type BatchAssignPayload = {
    orderIds: string[];
    vehicleId: string;
    deliveryDate: string;
};

// Map DB response to Frontend Order type
// This needs to fetch related items, store, user. 
// Supabase query deep nesting: select('*, store:store_id(*), items:order_items(*, product:products(*)), orderedBy:ordered_by_id(*)')
const mapToOrder = (data: any): Order => ({
    id: data.id,
    storeId: data.store_id,
    storeName: data.store?.name || 'Unknown Store',
    items: (data.items || []).map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        originalPrice: item.original_price, // Fetch from JOIN
        specialPrice: item.special_price
    })),
    totalAmount: data.total_amount,
    status: data.status,
    orderDate: data.order_date,
    desiredDeliveryDate: data.desired_delivery_date,
    location: data.store?.location, // Inherit from store
    assignedVehicleId: data.assigned_vehicle_id,
    shipmentId: null, // Not yet in DB schema
    orderedBy: {
        id: data.ordered_by_id,
        name: data.orderedBy?.name || 'Unknown',
        role: data.orderedBy?.role || 'Unknown'
    },
    priority: data.priority
});

export const getOrders = async (): Promise<Order[]> => {
    // Extensive join to reconstruct Order object
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            store:store_id (name, location),
            items:order_items (
                product_id, quantity, original_price, special_price,
                product:product_id (name, price) 
            ),
            orderedBy:ordered_by_id (name, role)
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(mapToOrder);
};

export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
    // 0. VERIFY INVENTORY FIRST
    for (const item of orderData.items) {
        const { data: product } = await supabase.from('products').select('stock, reserved_stock').eq('id', item.productId).single();
        if (!product) throw new Error(`Product ${item.productId} tidak ditemukan`);

        const availableStock = product.stock - (product.reserved_stock || 0);
        if (availableStock < item.quantity) {
            throw new Error(`Stok ${item.productId} tidak cukup. Tersedia: ${availableStock}, Diminta: ${item.quantity}`);
        }
    }

    // 1. Calculate Total Amount (Need product prices)
    // For simplicity, fetching all products relevant or just trusted client input (bad practice but for migration step ok)
    // Better: Fetch products prices from DB first.
    let totalAmount = 0;
    const itemsPayload: any[] = [];

    for (const item of orderData.items) {
        const { data: product } = await supabase.from('products').select('price').eq('id', item.productId).single();
        if (!product) throw new Error(`Product ${item.productId} tidak ditemukan`);

        const price = item.specialPrice || product.price;
        totalAmount += price * item.quantity;
        itemsPayload.push({
            product_id: item.productId,
            quantity: item.quantity,
            original_price: product.price,
            special_price: item.specialPrice
        });
    }

    // 2. Insert Order
    const user = await supabase.auth.getUser();
    const { data: order, error: orderError } = await supabase.from('orders').insert({
        store_id: orderData.storeId,
        total_amount: totalAmount,
        status: 'Pending',
        order_date: new Date().toISOString(),
        desired_delivery_date: orderData.desiredDeliveryDate,
        ordered_by_id: user.data.user?.id
    }).select().single();

    if (orderError) throw new Error(orderError.message);

    // 3. Insert Items (This will trigger inventory update via database trigger)
    const itemsWithOrderId = itemsPayload.map(i => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId);

    if (itemsError) {
        // Rollback order? Hard without transaction. 
        console.error('Failed to insert items, orphan order created:', order.id);
        throw new Error(itemsError.message);
    }

    // Fetch full object to return
    const { data: fullOrder } = await supabase.from('orders').select(`
            *,
            store:store_id (name, location),
            items:order_items (
                product_id, quantity, original_price, special_price
            ),
            orderedBy:ordered_by_id (name, role)
    `).eq('id', order.id).single();

    return mapToOrder(fullOrder);
};

export const updateOrder = async (orderData: UpdateOrderPayload): Promise<Order> => {
    // Complex update: might change items. 
    // Delete old items and insert new ones? Or intelligent merge? 
    // Simple approach: Delete all items, re-insert.

    // 1. Calculate new total
    let totalAmount = 0;
    const itemsPayload: any[] = [];
    for (const item of orderData.items) {
        const { data: product } = await supabase.from('products').select('price').eq('id', item.productId).single();
        if (!product) continue;
        const price = item.specialPrice || product.price;
        totalAmount += price * item.quantity;
        itemsPayload.push({
            product_id: item.productId,
            quantity: item.quantity,
            original_price: product.price,
            special_price: item.specialPrice,
            order_id: orderData.id
        });
    }

    // 2. Update Order Details
    const { error: updateError } = await supabase.from('orders').update({
        total_amount: totalAmount,
        assigned_vehicle_id: orderData.assignedVehicleId,
        desired_delivery_date: orderData.desiredDeliveryDate
    }).eq('id', orderData.id);
    if (updateError) throw new Error(updateError.message);

    // 3. Replace Items
    await supabase.from('order_items').delete().eq('order_id', orderData.id);
    await supabase.from('order_items').insert(itemsPayload);

    return (await getOrders()).find(o => o.id === orderData.id)!;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
    // Cascade delete handles items if configured in DB.
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw new Error(error.message);
};

export const batchAssignOrders = async (payload: BatchAssignPayload): Promise<{ message: string }> => {
    const { error } = await supabase.from('orders').update({
        assigned_vehicle_id: payload.vehicleId,
        // desired_delivery_date: payload.deliveryDate // Logic might differ, keeping simple assignment
    }).in('id', payload.orderIds);

    if (error) throw new Error(error.message);
    return { message: 'Orders assigned successfully' };
};