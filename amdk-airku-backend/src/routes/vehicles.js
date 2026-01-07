
const express = require('express');
const router = express.Router();
const {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    updateTripStatus
} = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVehicles)
    .post(protect, admin, createVehicle);

router.route('/:id')
    .get(protect, getVehicleById)
    .put(protect, admin, updateVehicle)
    .delete(protect, admin, deleteVehicle);

router.post('/:id/trip-status', protect, updateTripStatus);

module.exports = router;
