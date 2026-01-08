const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Send notification to driver about new route
 */
const notifyDriverAboutRoute = async (driverId, routeId, orderCount, deliveryDate) => {
    try {
        const { error } = await supabase.from('driver_notifications').insert({
            driver_id: driverId,
            route_id: routeId,
            message: `Rute pengiriman baru untuk ${deliveryDate}: ${orderCount} pesanan menunggu pengiriman Anda`,
            type: 'new_route',
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error inserting driver notification:', error);
            return false;
        }
        console.log(`✅ Notification sent to driver ${driverId} for route ${routeId}`);
        return true;
    } catch (err) {
        console.error('Failed to notify driver:', err);
        return false;
    }
};

/**
 * Get unread notifications for driver
 */
const getDriverNotifications = async (driverId) => {
    try {
        const { data, error } = await supabase
            .from('driver_notifications')
            .select('*')
            .eq('driver_id', driverId)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching driver notifications:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Error in getDriverNotifications:', err);
        return [];
    }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId) => {
    try {
        const { error } = await supabase
            .from('driver_notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', notificationId);

        if (error) {
            console.error('Error updating notification:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error in markNotificationAsRead:', err);
        return false;
    }
};

/**
 * Verify inventory before creating order
 */
const verifyInventory = async (items) => {
    try {
        for (const item of items) {
            const { data: product, error } = await supabase
                .from('products')
                .select('id, stock, reserved_stock')
                .eq('id', item.product_id)
                .single();

            if (error || !product) {
                return {
                    valid: false,
                    message: `Produk ${item.product_id} tidak ditemukan`
                };
            }

            const availableStock = product.stock - (product.reserved_stock || 0);
            if (availableStock < item.quantity) {
                return {
                    valid: false,
                    message: `Stok ${product.id} tidak cukup. Tersedia: ${availableStock}, Diminta: ${item.quantity}`
                };
            }
        }

        return { valid: true };
    } catch (err) {
        console.error('Error verifying inventory:', err);
        return { valid: false, message: 'Gagal memverifikasi stok' };
    }
};

module.exports = {
    notifyDriverAboutRoute,
    getDriverNotifications,
    markNotificationAsRead,
    verifyInventory
};
