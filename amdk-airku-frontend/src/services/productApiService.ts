import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

// Helper to map DB snake_case to frontend camelCase
const mapToProduct = (data: any): Product => ({
    id: data.id,
    sku: data.sku,
    name: data.name,
    price: data.price,
    stock: data.stock,
    reservedStock: data.reserved_stock,
    capacityUnit: data.capacity_unit,
    capacityConversionHeterogeneous: data.capacity_conversion_heterogeneous,
    capacityConversionHomogeneous: data.capacity_conversion_homogeneous, // Added finding in type definition line 43
});

// Helper to map frontend camelCase to DB snake_case for insert/update
const mapToDb = (data: Partial<Product>) => {
    const dbData: any = { ...data };
    if (data.reservedStock !== undefined) dbData.reserved_stock = data.reservedStock;
    if (data.capacityUnit !== undefined) dbData.capacity_unit = data.capacityUnit;
    if (data.capacityConversionHeterogeneous !== undefined) dbData.capacity_conversion_heterogeneous = data.capacityConversionHeterogeneous;
    if (data.capacityConversionHomogeneous !== undefined) dbData.capacity_conversion_homogeneous = data.capacityConversionHomogeneous;

    // Remove camelCase keys
    delete dbData.reservedStock;
    delete dbData.capacityUnit;
    delete dbData.capacityConversionHeterogeneous;
    delete dbData.capacityConversionHomogeneous;

    return dbData;
};

export const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(mapToProduct);
};

export const createProduct = async (productData: Omit<Product, 'id' | 'reservedStock'>): Promise<Product> => {
    const dbPayload = mapToDb({ ...productData, reservedStock: 0 }); // Default reservedStock
    const { data, error } = await supabase.from('products').insert(dbPayload).select().single();
    if (error) throw new Error(error.message);
    return mapToProduct(data);
};

export const updateProduct = async (productData: Product): Promise<Product> => {
    const { id, ...updateData } = productData;
    const dbPayload = mapToDb(updateData);
    const { data, error } = await supabase.from('products').update(dbPayload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapToProduct(data);
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
};