
const pool = require('../config/db');
const { randomUUID } = require('crypto');

const Vehicle = {
    getAll: async () => {
        const query = 'SELECT * FROM vehicles';
        const [rows] = await pool.query(query);
        return rows;
    },

    getById: async (id) => {
        const query = 'SELECT * FROM vehicles WHERE id = ?';
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    },

    create: async (vehicleData) => {
        const { plateNumber, model, capacity, status } = vehicleData;
        const id = randomUUID();
        const query = 'INSERT INTO vehicles (id, plateNumber, model, capacity, status) VALUES (?, ?, ?, ?, ?)';
        
        await pool.query(query, [id, plateNumber, model, capacity, status]);
        const [newVehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
        return newVehicle[0];
    },

    update: async (id, vehicleData) => {
        const { plateNumber, model, capacity, status } = vehicleData;
        const query = 'UPDATE vehicles SET plateNumber = ?, model = ?, capacity = ?, status = ? WHERE id = ?';
        
        await pool.query(query, [plateNumber, model, capacity, status, id]);
        return { id, ...vehicleData };
    },

    delete: async (id) => {
        const query = 'DELETE FROM vehicles WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    },

    checkDependencies: async (vehicleId) => {
        try {
            const orderQuery = 'SELECT id FROM orders WHERE assignedVehicleId = ? LIMIT 1';
            const [orders] = await pool.query(orderQuery, [vehicleId]);
            if (orders.length > 0) return true;

            const routeQuery = 'SELECT id FROM route_plans WHERE vehicleId = ? LIMIT 1';
            const [routes] = await pool.query(routeQuery, [vehicleId]);
            if (routes.length > 0) return true;

            return false;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                console.warn(`Dependency check failed because a table doesn't exist: ${error.message}`);
                return false;
            }
            throw error;
        }
    }
};

module.exports = Vehicle;;