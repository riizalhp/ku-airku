const Product = require('../models/productModel');
const { getCapacityRecommendation } = require('../utils/capacityCalculator');

const getProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
    } catch (error) {
        console.error(`Error getting product ${req.params.id}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const createProduct = async (req, res) => {
    const { sku, name, price, stock, capacityUnit, capacityConversionHeterogeneous } = req.body;
    if (!sku || !name || price === undefined || stock === undefined) {
        return res.status(400).json({ message: 'Harap isi semua kolom yang diperlukan.' });
    }
    
    try {
        // Auto-calculate capacity conversion jika tidak diisi dan ada info ukuran di nama
        let finalCapacityUnit = capacityUnit || 1.0;
        let finalConversionHeterogeneous = capacityConversionHeterogeneous;
        
        // Jika capacityConversionHeterogeneous tidak diisi, coba hitung otomatis dari nama produk
        if (!finalConversionHeterogeneous) {
            const recommendation = getCapacityRecommendation(name);
            finalConversionHeterogeneous = recommendation.capacityConversionHeterogeneous;
        }
        
        const newProduct = await Product.create({ 
            sku, 
            name, 
            price, 
            stock, 
            capacityUnit: finalCapacityUnit,
            capacityConversionHeterogeneous: finalConversionHeterogeneous
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
        
        const updatedProductData = { ...product, ...req.body };
        const result = await Product.update(req.params.id, updatedProductData);
        res.json(result);
    } catch (error) {
        console.error(`Error updating product ${req.params.id}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
        
        // Check if product is used in any orders
        const pool = require('../config/db');
        const [orderItems] = await pool.query(
            'SELECT COUNT(*) as count FROM order_items WHERE productId = ?',
            [req.params.id]
        );
        
        if (orderItems[0].count > 0) {
            return res.status(400).json({ 
                message: `Produk tidak dapat dihapus karena sudah digunakan dalam ${orderItems[0].count} pesanan. Hapus pesanan terkait terlebih dahulu.` 
            });
        }

        const success = await Product.delete(req.params.id);
        if(success) {
            res.json({ message: 'Produk berhasil dihapus.' });
        } else {
            res.status(500).json({ message: 'Gagal menghapus produk.' });
        }
    } catch (error) {
        console.error(`Error deleting product ${req.params.id}:`, error);
        
        // Check if it's a foreign key constraint error
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                message: 'Produk tidak dapat dihapus karena masih digunakan di pesanan. Hapus pesanan terkait terlebih dahulu.' 
            });
        }
        
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// Helper endpoint untuk mendapatkan rekomendasi kapasitas berdasarkan nama/ukuran produk
const getCapacityRecommendationAPI = async (req, res) => {
    const { productName } = req.query;
    
    if (!productName) {
        return res.status(400).json({ message: 'Parameter productName diperlukan.' });
    }
    
    try {
        const recommendation = getCapacityRecommendation(productName);
        res.json({
            productName,
            recommendation,
            guide: {
                capacityUnit: 'Selalu gunakan 1.0 untuk produk homogen (saat hanya mengangkut 1 jenis produk)',
                capacityConversionHeterogeneous: 'Konversi yang digunakan saat produk dicampur dengan produk lain. Contoh: 240ml=1.0, 120ml=0.5',
                example: 'Armada kapasitas 200 bisa mengangkut: 200 unit (homogen) atau berbagai kombinasi (heterogen) sesuai konversi'
            }
        });
    } catch (error) {
        console.error('Error getting capacity recommendation:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCapacityRecommendationAPI
};
