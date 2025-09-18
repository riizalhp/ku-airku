const express = require('express');
const router = express.Router();
const {
    getStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    classifyRegion,
    createSalesStore
} = require('../controllers/storeController');
const { protect, admin, sales } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getStores)
    .post(protect, admin, createStore);

router.route('/sales')
    .post(protect, sales, createSalesStore);

router.route('/:id')
    .get(protect, getStoreById)
    .put(protect, admin, updateStore)
    .delete(protect, admin, deleteStore);

// Route for AI-based region classification
router.post('/classify-region', protect, classifyRegion);

module.exports = router;