const express = require('express');
const router = express.Router();
const { getSalesRoutes, createSalesRoute, deleteSalesRoute } = require('../controllers/salesVisitRouteController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes for sales visit planning
router.route('/')
    .get(protect, getSalesRoutes)
    .post(protect, admin, createSalesRoute);

router.route('/:id')
    .delete(protect, admin, deleteSalesRoute);

module.exports = router;