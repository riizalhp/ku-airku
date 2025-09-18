const pool = require('../src/config/db');
const { randomUUID } = require('crypto');

const getSalesVisitRoutes = async (filters = {}) => {
    let query = 'SELECT * FROM sales_visit_route_plans WHERE 1=1';
    const params = [];
    
    if (filters.salesPersonId) {
        query += ' AND salesPersonId = ?';
        params.push(filters.salesPersonId);
    }
    
    if (filters.date) {
        query += ' AND date = ?';
        params.push(filters.date);
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
};

const createSalesVisitRoute = async ({ salesPersonId, visitDate }) => {
    // Check if sales person exists
    const [userRows] = await pool.query('SELECT id FROM users WHERE id = ? AND role = "Sales"', [salesPersonId]);
    if (userRows.length === 0) {
        throw new Error('Sales person tidak ditemukan atau tidak valid.');
    }
    
    // Check if there's already a route for this sales person on this date
    const [existingRows] = await pool.query(
        'SELECT id FROM sales_visit_route_plans WHERE salesPersonId = ? AND date = ?', 
        [salesPersonId, visitDate]
    );
    
    if (existingRows.length > 0) {
        throw new Error('Rencana kunjungan untuk sales person ini pada tanggal tersebut sudah ada.');
    }
    
    // Create the route plan (in a real app, you would generate stops here)
    const routeId = randomUUID();
    
    await pool.query(
        'INSERT INTO sales_visit_route_plans (id, salesPersonId, date) VALUES (?, ?, ?)',
        [routeId, salesPersonId, visitDate]
    );
    
    // Return the created route
    const [routeRows] = await pool.query('SELECT * FROM sales_visit_route_plans WHERE id = ?', [routeId]);
    
    // Get stops for this route
    const [stops] = await pool.query('SELECT * FROM sales_visit_route_stops WHERE planId = ?', [routeId]);
    
    return {
        success: true,
        message: 'Rencana kunjungan berhasil dibuat',
        plan: {
            ...routeRows[0],
            stops: stops
        }
    };
};

const deleteSalesVisitRoute = async (routeId) => {
    // First check if the route exists
    const [routeRows] = await pool.query('SELECT id FROM sales_visit_route_plans WHERE id = ?', [routeId]);
    if (routeRows.length === 0) {
        throw new Error('Rencana kunjungan tidak ditemukan.');
    }
    
    // Delete the route
    await pool.query('DELETE FROM sales_visit_route_plans WHERE id = ?', [routeId]);
    return true;
};

module.exports = {
    getSalesVisitRoutes,
    createSalesVisitRoute,
    deleteSalesVisitRoute
};