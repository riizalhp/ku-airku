const { getSalesVisitRoutes, createSalesVisitRoute, deleteSalesVisitRoute } = require('../services/salesVisitRouteService');

const getSalesRoutes = async (req, res) => {
    try {
        const { salesPersonId, date } = req.query;
        const filters = {};
        
        if (salesPersonId) filters.salesPersonId = salesPersonId;
        if (date) filters.date = date;
        
        const routes = await getSalesVisitRoutes(filters);
        res.json(routes);
    } catch (error) {
        console.error('Error getting sales routes:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const createSalesRoute = async (req, res) => {
    try {
        const { salesPersonId, visitDate } = req.body;
        
        if (!salesPersonId || !visitDate) {
            return res.status(400).json({ message: 'Sales person ID dan tanggal kunjungan wajib diisi.' });
        }
        
        const result = await createSalesVisitRoute({ salesPersonId, visitDate });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating sales route:', error);
        res.status(500).json({ message: error.message || 'Gagal membuat rencana kunjungan.' });
    }
};

const deleteSalesRoute = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: 'ID rute kunjungan wajib diisi.' });
        }
        
        await deleteSalesVisitRoute(id);
        res.json({ message: 'Rencana kunjungan berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting sales route:', error);
        res.status(500).json({ message: 'Gagal menghapus rencana kunjungan.' });
    }
};

module.exports = { getSalesRoutes, createSalesRoute, deleteSalesRoute };