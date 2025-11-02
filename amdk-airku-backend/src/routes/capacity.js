const express = require('express');
const router = express.Router();
const capacityController = require('../controllers/capacityController');
const { protect } = require('../middleware/authMiddleware');

// Semua endpoint capacity memerlukan autentikasi
router.use(protect);

// POST /api/capacity/calculate - Hitung kapasitas kendaraan
router.post('/calculate', capacityController.calculateCapacity);

// GET /api/capacity/vehicle-info/:vehicleType - Info kapasitas kendaraan
router.get('/vehicle-info/:vehicleType', capacityController.getVehicleInfo);

module.exports = router;
