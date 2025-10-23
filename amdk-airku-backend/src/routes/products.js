const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCapacityRecommendationAPI
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Helper route untuk mendapatkan rekomendasi kapasitas (untuk membantu user input)
router.get('/capacity-recommendation', protect, getCapacityRecommendationAPI);

// Rute untuk mendapatkan semua produk dan membuat produk baru
router.route('/')
    .get(protect, getProducts) // Semua pengguna terotentikasi bisa melihat produk
    .post(protect, admin, createProduct); // Hanya admin yang bisa membuat produk

// Rute untuk mendapatkan, memperbarui, dan menghapus produk berdasarkan ID
router.route('/:id')
    .get(protect, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
