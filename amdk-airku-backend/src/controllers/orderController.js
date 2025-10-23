
const Order = require('../models/orderModel');
const Vehicle = require('../models/vehicleModel');
const { calculateOrderCapacity, validateMultipleOrders } = require('../utils/capacityCalculator');

const getOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }
    } catch (error) {
        console.error(`Error getting order ${req.params.id}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const createOrder = async (req, res) => {
    const { storeId, items, desiredDeliveryDate } = req.body;
    
    if (!storeId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Harap sediakan ID toko dan item pesanan.' });
    }

    try {
        const creatorId = req.user.id; // Dapatkan ID pengguna dari token yang sudah diverifikasi

        const newOrder = await Order.create({ storeId, items, desiredDeliveryDate, creatorId });
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('DETAIL ERROR SAAT CREATE ORDER:', error);
        // Periksa pesan error spesifik dari model
        if (error.message.startsWith('Stok tidak mencukupi') || error.message.includes('login kembali')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Gagal membuat pesanan, terjadi kesalahan pada server.' });
    }
};

const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.getById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        const updatedOrder = await Order.update(orderId, req.body);
        res.json(updatedOrder);
    } catch (error) {
        console.error(`Error updating order ${req.params.id}:`, error);
        if (error.message.startsWith('Stok tidak mencukupi')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Gagal memperbarui pesanan, terjadi kesalahan pada server.' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Hanya pesanan dengan status "Pending" yang dapat dihapus.' });
        }

        const success = await Order.delete(req.params.id);
        if (success) {
            res.json({ message: 'Pesanan berhasil dihapus.' });
        } else {
            res.status(500).json({ message: 'Gagal menghapus pesanan.' });
        }
    } catch (error) {
        console.error(`Error deleting order ${req.params.id}:`, error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        const order = await Order.getById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        const updatedOrder = await Order.updateStatus(orderId, status, order.items);
        res.json(updatedOrder);
    } catch (error) {
         console.error(`Error updating order status ${req.params.id}:`, error);
        res.status(500).json({ message: 'Gagal memperbarui status pesanan.' });
    }
};

const batchAssignOrders = async (req, res) => {
    const { orderIds, vehicleId, deliveryDate } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !vehicleId || !deliveryDate) {
        return res.status(400).json({ message: 'Harap sediakan ID pesanan, ID armada, dan tanggal pengiriman.' });
    }

    try {
        const result = await Order.batchAssign(orderIds, vehicleId, deliveryDate);
        res.json({ message: `${result.affectedRows} pesanan berhasil ditugaskan.` });
    } catch (error) {
        console.error('Error in batchAssignOrders controller:', error);
        res.status(500).json({ message: 'Gagal menugaskan pesanan secara massal.' });
    }
};

// Endpoint untuk validasi kapasitas order sebelum assign ke armada
const validateOrderCapacity = async (req, res) => {
    const { orderId, vehicleId } = req.body;

    if (!orderId || !vehicleId) {
        return res.status(400).json({ message: 'ID pesanan dan ID armada diperlukan.' });
    }

    try {
        // Ambil data order dengan items dan products
        const order = await Order.getById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Ambil data vehicle
        const vehicle = await Vehicle.getById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Armada tidak ditemukan.' });
        }

        // Hitung kapasitas
        const capacityResult = calculateOrderCapacity(order.items, vehicle.capacity);

        res.json({
            orderId,
            vehicleId,
            vehicleName: `${vehicle.model} (${vehicle.plateNumber})`,
            vehicleCapacity: vehicle.capacity,
            ...capacityResult,
            recommendation: capacityResult.canFit 
                ? `Order dapat dimuat dalam armada ini. Sisa kapasitas: ${capacityResult.remainingCapacity}`
                : `Order TIDAK DAPAT dimuat dalam armada ini. Kelebihan: ${Math.abs(capacityResult.remainingCapacity)}`
        });
    } catch (error) {
        console.error('Error validating order capacity:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// Endpoint untuk validasi multiple orders dalam 1 armada
const validateMultipleOrdersCapacity = async (req, res) => {
    const { orderIds, vehicleId } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !vehicleId) {
        return res.status(400).json({ message: 'Array ID pesanan dan ID armada diperlukan.' });
    }

    try {
        // Ambil data vehicle
        const vehicle = await Vehicle.getById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Armada tidak ditemukan.' });
        }

        // Ambil semua orders
        const orders = [];
        for (const orderId of orderIds) {
            const order = await Order.getById(orderId);
            if (order) {
                orders.push(order);
            }
        }

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Tidak ada pesanan yang ditemukan.' });
        }

        // Validasi kombinasi orders
        const validationResult = validateMultipleOrders(orders, vehicle.capacity);

        res.json({
            vehicleId,
            vehicleName: `${vehicle.model} (${vehicle.plateNumber})`,
            vehicleCapacity: vehicle.capacity,
            ordersCount: orders.length,
            ...validationResult,
            recommendation: validationResult.canFit 
                ? `✅ ${orders.length} pesanan dapat dimuat dalam armada ini. Sisa kapasitas: ${validationResult.remainingCapacity} (${100 - validationResult.utilizationPercentage}% kosong)`
                : `❌ ${orders.length} pesanan TIDAK DAPAT dimuat dalam armada ini. Kelebihan: ${Math.abs(validationResult.remainingCapacity)}. Kurangi jumlah pesanan atau gunakan armada dengan kapasitas lebih besar.`
        });
    } catch (error) {
        console.error('Error validating multiple orders capacity:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    batchAssignOrders,
    validateOrderCapacity,
    validateMultipleOrdersCapacity
};
