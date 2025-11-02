

const express = require('express');
const router = express.Router();
const { 
    createPlan, 
    getRoutePlans, 
    getRoutePlanById, 
    updateStopStatus,
    deleteRoutePlan,
    moveOrder,
    assignDriverVehicle,
    unassignDriverVehicle
} = require('../controllers/routeController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST api/routes/plan
// @desc    Create a new route plan (with or without driver/vehicle assignment)
// @access  Private/Admin
router.post('/plan', protect, admin, createPlan);

// @route   PUT api/routes/:routeId/assign
// @desc    Assign driver and vehicle to an unassigned route
// @access  Private/Admin
router.put('/:routeId/assign', protect, admin, assignDriverVehicle);

// @route   PUT api/routes/:routeId/unassign
// @desc    Unassign driver and vehicle from a route
// @access  Private/Admin
router.put('/:routeId/unassign', protect, admin, unassignDriverVehicle);

// @route   POST api/routes/move-order
// @desc    Move an order to a different route or set to pending
// @access  Private/Admin
router.post('/move-order', protect, admin, moveOrder);

// @route   GET api/routes
// @desc    Get route plans. Admins get all, Drivers get their own.
// @access  Private
router.get('/', protect, getRoutePlans);

// @route   GET api/routes/:id
// @desc    Get a single route plan by ID
// @access  Private
router.get('/:id', protect, getRoutePlanById);

// @route   DELETE api/routes/:id
// @desc    Delete a route plan and revert associated orders
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteRoutePlan);

// @route   PUT api/routes/stops/:id/status
// @desc    Update the status of a specific stop in a route
// @access  Private (Driver/Admin)
router.put('/stops/:id/status', protect, updateStopStatus);


module.exports = router;
