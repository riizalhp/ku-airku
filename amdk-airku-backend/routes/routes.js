const express = require('express');
const router = express.Router();
const { 
    getRoutes,
    createRoutePlan,
    deleteRoute,
    updateStopStatus,
    startOrCompleteTrip,
    moveOrder
} = require('../controllers/routeController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
router.route('/')
    .get(protect, getRoutes)
    .post(protect, admin, createRoutePlan);

router.route('/plan')
    .post(protect, admin, createRoutePlan);

router.route('/:id')
    .delete(protect, admin, deleteRoute);

router.route('/stops/:stopId/status')
    .put(protect, admin, updateStopStatus);

router.route('/move-order')
    .post(protect, admin, moveOrder);

router.route('/:vehicleId/trip-status')
    .post(protect, admin, startOrCompleteTrip);

module.exports = router;