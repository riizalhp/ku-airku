const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

// GET /api/shipments - Get all shipments (with optional filters)
router.get('/', shipmentController.getShipments);

// GET /api/shipments/:id - Get shipment by ID
router.get('/:id', shipmentController.getShipmentById);

// POST /api/shipments - Create new shipment
router.post('/', shipmentController.createShipment);

// POST /api/shipments/:id/orders - Add order to shipment
router.post('/:id/orders', shipmentController.addOrderToShipment);

// DELETE /api/shipments/:id/orders/:orderId - Remove order from shipment
router.delete('/:id/orders/:orderId', shipmentController.removeOrderFromShipment);

// POST /api/shipments/:id/assign - Assign driver & vehicle (creates route)
router.post('/:id/assign', shipmentController.assignShipment);

// DELETE /api/shipments/:id - Delete shipment
router.delete('/:id', shipmentController.deleteShipment);

module.exports = router;
