require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('\n=== Checking Pending/Failed Orders ===\n');
        
        const [orders] = await conn.query(`
            SELECT id, storeId, status, desiredDeliveryDate, assignedVehicleId, priority, orderDate
            FROM orders 
            WHERE status IN ('Pending', 'Failed')
            ORDER BY orderDate DESC 
            LIMIT 10
        `);
        
        console.log('Total Pending/Failed Orders:', orders.length);
        console.table(orders);

        console.log('\n=== Testing findRoutableOrders Query (NEW) ===\n');
        const testDate = '2025-10-22';
        
        const [routableOrders] = await conn.query(`
            SELECT
                o.id,
                o.storeId,
                o.desiredDeliveryDate,
                o.assignedVehicleId,
                o.priority,
                s.name as storeName,
                s.address,
                s.lat,
                s.lng,
                SUM(oi.quantity * p.capacityUnit) as demand
            FROM orders o
            JOIN stores s ON o.storeId = s.id
            JOIN order_items oi ON o.id = oi.orderId
            JOIN products p ON oi.productId = p.id
            LEFT JOIN route_stops rs ON o.id = rs.orderId
            LEFT JOIN route_plans rp ON rs.routeId = rp.id AND rp.date = ?
            WHERE
                o.status IN ('Pending', 'Failed') AND
                (o.desiredDeliveryDate <= ? OR o.desiredDeliveryDate IS NULL) AND
                (o.assignedVehicleId IS NULL OR rs.id IS NULL OR rp.id IS NULL)
            GROUP BY o.id
            ORDER BY o.priority DESC, o.desiredDeliveryDate ASC
        `, [testDate, testDate]);
        
        console.log(`Routable Orders for date <= ${testDate} (NEW QUERY):`, routableOrders.length);
        console.table(routableOrders);

        await conn.end();
    } catch (error) {
        console.error('Error:', error);
    }
})();
