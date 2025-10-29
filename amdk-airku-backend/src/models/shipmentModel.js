const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Shipment = {
    /**
     * Get all shipments with optional filters
     */
    async getAll(filters = {}) {
        let query = `
            SELECT 
                s.*,
                u.name as driver_name,
                v.plate_number as vehicle_plate,
                v.model as vehicle_model
            FROM shipments s
            LEFT JOIN users u ON s.driver_id = u.id
            LEFT JOIN vehicles v ON s.vehicle_id = v.id
        `;
        
        const conditions = [];
        const params = [];

        if (filters.date) {
            conditions.push('s.date = ?');
            params.push(filters.date);
        }

        if (filters.status) {
            conditions.push('s.status = ?');
            params.push(filters.status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY s.date DESC, s.created_at DESC';

        const [shipments] = await db.query(query, params);

        // Fetch orders for each shipment
        for (let shipment of shipments) {
            const [orders] = await db.query(`
                SELECT 
                    o.*,
                    s.name as store_name,
                    s.address,
                    s.location,
                    JSON_OBJECT('id', u.id, 'name', u.name, 'role', u.role) as ordered_by
                FROM orders o
                JOIN stores s ON o.store_id = s.id
                JOIN users u ON o.ordered_by_id = u.id
                WHERE o.shipment_id = ?
                ORDER BY o.order_date DESC
            `, [shipment.id]);

            // Parse JSON fields
            shipment.orders = orders.map(order => ({
                ...order,
                items: JSON.parse(order.items),
                location: JSON.parse(order.location),
                orderedBy: JSON.parse(order.ordered_by),
                storeName: order.store_name
            }));
        }

        return shipments.map(s => ({
            id: s.id,
            name: s.name,
            date: s.date,
            status: s.status,
            driverId: s.driver_id,
            vehicleId: s.vehicle_id,
            routePlanId: s.route_plan_id,
            region: s.region,
            createdAt: s.created_at,
            orders: s.orders
        }));
    },

    /**
     * Get shipment by ID
     */
    async getById(id) {
        const [rows] = await db.query(`
            SELECT 
                s.*,
                u.name as driver_name,
                v.plate_number as vehicle_plate,
                v.model as vehicle_model
            FROM shipments s
            LEFT JOIN users u ON s.driver_id = u.id
            LEFT JOIN vehicles v ON s.vehicle_id = v.id
            WHERE s.id = ?
        `, [id]);

        if (rows.length === 0) return null;

        const shipment = rows[0];

        // Fetch orders
        const [orders] = await db.query(`
            SELECT 
                o.*,
                s.name as store_name,
                s.address,
                s.location,
                JSON_OBJECT('id', u.id, 'name', u.name, 'role', u.role) as ordered_by
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            JOIN users u ON o.ordered_by_id = u.id
            WHERE o.shipment_id = ?
            ORDER BY o.order_date DESC
        `, [shipment.id]);

        shipment.orders = orders.map(order => ({
            ...order,
            items: JSON.parse(order.items),
            location: JSON.parse(order.location),
            orderedBy: JSON.parse(order.ordered_by),
            storeName: order.store_name
        }));

        return {
            id: shipment.id,
            name: shipment.name,
            date: shipment.date,
            status: shipment.status,
            driverId: shipment.driver_id,
            vehicleId: shipment.vehicle_id,
            routePlanId: shipment.route_plan_id,
            region: shipment.region,
            createdAt: shipment.created_at,
            orders: shipment.orders
        };
    },

    /**
     * Create new shipment
     */
    async create(shipmentData) {
        const id = uuidv4();
        const { name, date, region = null } = shipmentData;

        await db.query(`
            INSERT INTO shipments (id, name, date, region, status)
            VALUES (?, ?, ?, ?, 'unassigned')
        `, [id, name, date, region]);

        return await this.getById(id);
    },

    /**
     * Add order to shipment
     */
    async addOrder(shipmentId, orderId) {
        // Update order with shipment_id
        await db.query(`
            UPDATE orders 
            SET shipment_id = ?
            WHERE id = ?
        `, [shipmentId, orderId]);

        return true;
    },

    /**
     * Remove order from shipment
     */
    async removeOrder(shipmentId, orderId) {
        await db.query(`
            UPDATE orders 
            SET shipment_id = NULL
            WHERE id = ? AND shipment_id = ?
        `, [orderId, shipmentId]);

        return true;
    },

    /**
     * Assign driver and vehicle to shipment (will trigger route creation)
     */
    async assign(shipmentId, driverId, vehicleId) {
        await db.query(`
            UPDATE shipments 
            SET driver_id = ?, vehicle_id = ?, status = 'assigned'
            WHERE id = ?
        `, [driverId, vehicleId, shipmentId]);

        return true;
    },

    /**
     * Link route plan to shipment
     */
    async linkRoutePlan(shipmentId, routePlanId) {
        await db.query(`
            UPDATE shipments 
            SET route_plan_id = ?
            WHERE id = ?
        `, [routePlanId, shipmentId]);

        return true;
    },

    /**
     * Update shipment status
     */
    async updateStatus(shipmentId, status) {
        await db.query(`
            UPDATE shipments 
            SET status = ?
            WHERE id = ?
        `, [status, shipmentId]);

        return true;
    },

    /**
     * Delete shipment (and unlink all orders)
     */
    async delete(id) {
        // First, unlink all orders
        await db.query(`
            UPDATE orders 
            SET shipment_id = NULL, status = 'Pending'
            WHERE shipment_id = ?
        `, [id]);

        // Delete the shipment
        const [result] = await db.query('DELETE FROM shipments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Shipment;
