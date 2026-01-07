const { calculateVehicleLoad, getVehicleCapacityInfo } = require('../utils/capacityCalculator');

/**
 * POST /api/capacity/calculate
 * Body: { products: [{productType, quantity}], vehicleType: 'L300' | 'Cherry Box' }
 */
const calculateCapacity = async (req, res) => {
    try {
        const { products, vehicleType } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Field products harus berupa array dan tidak boleh kosong'
            });
        }

        // Validasi setiap produk
        for (const product of products) {
            if (!product.productType || typeof product.quantity !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'Setiap produk harus memiliki productType dan quantity (number)'
                });
            }
        }

        const result = calculateVehicleLoad(products, vehicleType || 'L300');

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error calculating capacity:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal menghitung kapasitas'
        });
    }
};

/**
 * GET /api/capacity/vehicle-info/:vehicleType
 */
const getVehicleInfo = async (req, res) => {
    try {
        const { vehicleType } = req.params;
        
        const info = getVehicleCapacityInfo(vehicleType || 'L300');

        res.json({
            success: true,
            data: {
                vehicleType: vehicleType || 'L300',
                ...info
            }
        });
    } catch (error) {
        console.error('Error getting vehicle info:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal mengambil info kendaraan'
        });
    }
};

module.exports = {
    calculateCapacity,
    getVehicleInfo
};
