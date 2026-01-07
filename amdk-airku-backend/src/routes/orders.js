
const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    batchAssignOrders,
    validateOrderCapacity,
    validateMultipleOrdersCapacity
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan semua pesanan dan membuat pesanan baru
router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder); // Sales dan Admin dapat membuat pesanan

// Rute baru untuk penugasan massal
router.post('/batch-assign', protect, admin, batchAssignOrders);

// Rute untuk validasi kapasitas order
router.post('/validate-capacity', protect, admin, validateOrderCapacity);
router.post('/validate-multiple-capacity', protect, admin, validateMultipleOrdersCapacity);

// Rute spesifik dengan parameter '/:id/status' harus didefinisikan SEBELUM rute umum '/:id'
router.route('/:id/status')
    .put(protect, admin, updateOrderStatus); // Hanya admin yang bisa mengubah status

// Rute untuk mendapatkan, memperbarui, dan menghapus pesanan berdasarkan ID
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, admin, updateOrder) // Hanya Admin yang bisa edit
    .delete(protect, admin, deleteOrder); // Hanya Admin yang bisa hapus


module.exports = router;
