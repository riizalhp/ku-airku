/**
 * Utility untuk menghitung kapasitas armada
 * 
 * Logika:
 * - Produk Homogen (1 jenis): Gunakan capacityUnit (konversi = 1)
 * - Produk Heterogen (berbagai jenis): Gunakan capacityConversionHeterogeneous
 */

/**
 * Menghitung total kapasitas yang dibutuhkan untuk order items
 * @param {Array} orderItems - Array of {productId, quantity, product: {capacityUnit, capacityConversionHeterogeneous, name}}
 * @param {number} vehicleCapacity - Kapasitas maksimal armada
 * @returns {Object} - {totalCapacityUsed, remainingCapacity, isHomogeneous, capacityDetails, canFit}
 */
const calculateOrderCapacity = (orderItems, vehicleCapacity) => {
    if (!orderItems || orderItems.length === 0) {
        return {
            totalCapacityUsed: 0,
            remainingCapacity: vehicleCapacity,
            isHomogeneous: true,
            capacityDetails: [],
            canFit: true,
            utilizationPercentage: 0
        };
    }

    // Cek apakah produk homogen
    // Homogen jika: hanya 1 jenis produk ATAU hanya 1 item (1 toko, 1 pesanan, 1 produk)
    const uniqueProducts = new Set(orderItems.map(item => item.productId));
    const isHomogeneous = uniqueProducts.size === 1 || orderItems.length === 1;

    let totalCapacityUsed = 0;
    const capacityDetails = [];

    orderItems.forEach(item => {
        const product = item.product;
        const quantity = item.quantity;
        
        // Tentukan konversi yang digunakan
        let conversionRate;
        if (isHomogeneous) {
            // Produk homogen: gunakan capacityUnit (biasanya 1.0)
            conversionRate = product.capacityUnit || 1.0;
        } else {
            // Produk heterogen: gunakan capacityConversionHeterogeneous
            conversionRate = product.capacityConversionHeterogeneous || product.capacityUnit || 1.0;
        }

        // Hitung kapasitas yang dibutuhkan untuk item ini
        const capacityNeeded = quantity * conversionRate;
        totalCapacityUsed += capacityNeeded;

        capacityDetails.push({
            productId: item.productId,
            productName: product.name,
            quantity: quantity,
            conversionRate: conversionRate,
            capacityNeeded: capacityNeeded,
            isHomogeneous: isHomogeneous
        });
    });

    const remainingCapacity = vehicleCapacity - totalCapacityUsed;
    const canFit = totalCapacityUsed <= vehicleCapacity;
    const utilizationPercentage = (totalCapacityUsed / vehicleCapacity * 100).toFixed(2);

    return {
        totalCapacityUsed: Math.round(totalCapacityUsed * 100) / 100, // Round to 2 decimal
        remainingCapacity: Math.round(remainingCapacity * 100) / 100,
        isHomogeneous,
        capacityDetails,
        canFit,
        utilizationPercentage: parseFloat(utilizationPercentage)
    };
};

/**
 * Menghitung berapa banyak unit produk yang bisa dimuat dalam armada
 * @param {Object} product - {capacityUnit, capacityConversionHeterogeneous}
 * @param {number} vehicleCapacity - Kapasitas maksimal armada
 * @param {boolean} isHomogeneous - Apakah produk akan dimuat sendiri (homogen) atau campur
 * @returns {number} - Maximum units yang bisa dimuat
 */
const calculateMaxUnits = (product, vehicleCapacity, isHomogeneous = true) => {
    const conversionRate = isHomogeneous 
        ? (product.capacityUnit || 1.0)
        : (product.capacityConversionHeterogeneous || product.capacityUnit || 1.0);
    
    return Math.floor(vehicleCapacity / conversionRate);
};

/**
 * Validasi apakah kombinasi orders bisa dimuat dalam 1 armada
 * @param {Array} orders - Array of orders with items
 * @param {number} vehicleCapacity - Kapasitas maksimal armada
 * @returns {Object} - {canFit, totalCapacity, details}
 */
const validateMultipleOrders = (orders, vehicleCapacity) => {
    // Gabungkan semua order items
    const allItems = [];
    
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                // Cek jika produk sudah ada, tambahkan quantity
                const existingItem = allItems.find(i => i.productId === item.productId);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    allItems.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        product: item.product
                    });
                }
            });
        }
    });

    // Hitung kapasitas total
    const capacityResult = calculateOrderCapacity(allItems, vehicleCapacity);

    return {
        canFit: capacityResult.canFit,
        totalCapacity: capacityResult.totalCapacityUsed,
        remainingCapacity: capacityResult.remainingCapacity,
        utilizationPercentage: capacityResult.utilizationPercentage,
        isHomogeneous: capacityResult.isHomogeneous,
        details: capacityResult.capacityDetails,
        orderCount: orders.length,
        productTypes: allItems.length
    };
};

/**
 * Menghasilkan rekomendasi kapasitas untuk user input produk
 * @param {string} productSize - Ukuran produk (misal: '240ml', '120ml', '19L')
 * @returns {Object} - {capacityUnit, capacityConversionHeterogeneous, explanation}
 */
const getCapacityRecommendation = (productSize) => {
    // Ekstrak angka dari ukuran
    const sizeMatch = productSize.match(/(\d+(?:\.\d+)?)\s*(ml|l|liter)/i);
    
    if (!sizeMatch) {
        return {
            capacityUnit: 1.0,
            capacityConversionHeterogeneous: 1.0,
            explanation: 'Ukuran tidak dikenali. Menggunakan nilai default.'
        };
    }

    const sizeValue = parseFloat(sizeMatch[1]);
    const sizeUnit = sizeMatch[2].toLowerCase();

    // Konversi ke ml untuk standardisasi
    let sizeInMl = sizeValue;
    if (sizeUnit === 'l' || sizeUnit === 'liter') {
        sizeInMl = sizeValue * 1000;
    }

    // Predefined conversion rates berdasarkan ukuran standar
    const conversionTable = {
        120: 0.57,   // 120ml
        240: 1.0,    // 240ml (baseline)
        330: 1.0,    // 330ml
        600: 1.6,    // 600ml
        19000: 3.3   // 19L (19000ml)
    };

    // Cek apakah ada exact match
    let conversion = conversionTable[sizeInMl];
    
    if (!conversion) {
        // Jika tidak ada exact match, cari yang terdekat atau hitung proporsional
        if (sizeInMl < 240) {
            // Untuk ukuran di bawah 240ml, gunakan proporsi ke 240ml
            conversion = Math.round((sizeInMl / 240) * 100) / 100;
        } else if (sizeInMl < 19000) {
            // Untuk ukuran antara 240ml - 19L, gunakan proporsi
            conversion = Math.round((sizeInMl / 240) * 100) / 100;
        } else {
            // Untuk ukuran di atas 19L
            conversion = Math.round((sizeInMl / 19000) * 3.3 * 100) / 100;
        }
    }

    const volumeFormatted = sizeInMl >= 1000 ? `${sizeInMl / 1000}L` : `${sizeInMl}ml`;

    return {
        capacityUnit: 1.0, // Selalu 1.0 untuk produk homogen
        capacityConversionHeterogeneous: conversion,
        explanation: `Produk ${volumeFormatted} memiliki konversi ${conversion}. ` +
                    `Saat dicampur dengan produk lain, akan menggunakan konversi ini.`,
        sizeInMl: sizeInMl,
        sizeFormatted: volumeFormatted,
        isStandardSize: !!conversionTable[sizeInMl]
    };
};

/**
 * Data kapasitas kendaraan berdasarkan jenis produk
 */
const VEHICLE_CAPACITY_DATA = {
    'L300': {
        maxCapacityEquivalent: 200, // Setara 240ml
        homogeneousCapacity: {
            '240ml': 200,
            '120ml': 350,
            '600ml': 150,
            '330ml': 200,
            '19L': 60
        },
        conversionRates: {
            '240ml': 1.0,
            '120ml': 0.571,
            '600ml': 1.6,
            '330ml': 1.0,
            '19L': 3.33
        }
    },
    'Cherry Box': {
        maxCapacityEquivalent: 170,
        homogeneousCapacity: {
            '240ml': 170,
            '120ml': 300,
            '600ml': 100,
            '330ml': 170,
            '19L': 50
        },
        conversionRates: {
            '240ml': 1.0,
            '120ml': 0.571,
            '600ml': 1.6,
            '330ml': 1.0,
            '19L': 3.33
        }
    }
};

/**
 * Menghitung kapasitas kendaraan dengan aturan homogeneous dan heterogeneous
 * @param {Array} products - Array of {productType: '240ml', quantity: number}
 * @param {string} vehicleType - 'L300' atau 'Cherry Box'
 * @returns {Object} - Detail perhitungan kapasitas
 */
const calculateVehicleLoad = (products, vehicleType = 'L300') => {
    if (!VEHICLE_CAPACITY_DATA[vehicleType]) {
        throw new Error(`Vehicle type ${vehicleType} tidak dikenali`);
    }

    const vehicleData = VEHICLE_CAPACITY_DATA[vehicleType];
    const maxCapacity = vehicleData.maxCapacityEquivalent;
    
    // Cek apakah homogeneous
    // Homogen jika: hanya 1 jenis produk ATAU hanya 1 item total
    const uniqueProductTypes = new Set(products.map(p => p.productType));
    const isHomogeneous = uniqueProductTypes.size === 1 || products.length === 1;

    if (isHomogeneous) {
        // ATURAN 1 & 6: Hanya 1 jenis produk
        const product = products[0];
        const productType = product.productType;
        const requestedQuantity = product.quantity;
        const maxAllowed = vehicleData.homogeneousCapacity[productType];

        if (!maxAllowed) {
            throw new Error(`Product type ${productType} tidak dikenali untuk ${vehicleType}`);
        }

        // Batasi sampai kapasitas maksimal tanpa perhitungan proporsional
        const approvedQuantity = Math.min(requestedQuantity, maxAllowed);
        const conversionRate = vehicleData.conversionRates[productType];
        const totalLoad = approvedQuantity * conversionRate;
        const remainingCapacity = maxCapacity - totalLoad;

        return {
            isHomogeneous: true,
            vehicleType,
            maxCapacity,
            products: [{
                productType,
                requestedQuantity,
                approvedQuantity,
                conversionRate,
                loadEquivalent: totalLoad,
                isReduced: requestedQuantity > maxAllowed
            }],
            totalLoadEquivalent: Math.round(totalLoad * 100) / 100,
            remainingCapacity: Math.round(remainingCapacity * 100) / 100,
            utilizationPercentage: Math.round((totalLoad / maxCapacity) * 10000) / 100,
            canFit: approvedQuantity === requestedQuantity,
            message: requestedQuantity > maxAllowed 
                ? `Jumlah ${productType} dikurangi dari ${requestedQuantity} menjadi ${approvedQuantity} (batas maksimal ${vehicleType})`
                : `Semua ${productType} dapat dimuat (${approvedQuantity} unit)`
        };
    } else {
        // ATURAN 2, 3, 4: Beberapa jenis produk (heterogeneous)
        let totalLoad = 0;
        const productDetails = [];

        // Hitung total beban
        products.forEach(product => {
            const conversionRate = vehicleData.conversionRates[product.productType];
            if (!conversionRate) {
                throw new Error(`Product type ${product.productType} tidak dikenali`);
            }
            const load = product.quantity * conversionRate;
            totalLoad += load;
            productDetails.push({
                productType: product.productType,
                requestedQuantity: product.quantity,
                conversionRate,
                loadEquivalent: load
            });
        });

        // Cek apakah melebihi batas
        const exceedsCapacity = totalLoad > maxCapacity;

        if (exceedsCapacity) {
            // ATURAN 4: Kurangi secara proporsional
            const reductionFactor = maxCapacity / totalLoad;
            
            productDetails.forEach(detail => {
                detail.approvedQuantity = Math.floor(detail.requestedQuantity * reductionFactor);
                detail.loadEquivalent = detail.approvedQuantity * detail.conversionRate;
                detail.isReduced = true;
            });

            // Recalculate total load setelah pengurangan
            totalLoad = productDetails.reduce((sum, d) => sum + d.loadEquivalent, 0);
        } else {
            // Semua produk bisa dimuat
            productDetails.forEach(detail => {
                detail.approvedQuantity = detail.requestedQuantity;
                detail.isReduced = false;
            });
        }

        const remainingCapacity = maxCapacity - totalLoad;

        return {
            isHomogeneous: false,
            vehicleType,
            maxCapacity,
            products: productDetails,
            totalLoadEquivalent: Math.round(totalLoad * 100) / 100,
            remainingCapacity: Math.round(remainingCapacity * 100) / 100,
            utilizationPercentage: Math.round((totalLoad / maxCapacity) * 10000) / 100,
            canFit: !exceedsCapacity,
            message: exceedsCapacity
                ? `Muatan dikurangi secara proporsional agar sesuai kapasitas ${vehicleType} (${maxCapacity} setara 240ml)`
                : `Semua produk dapat dimuat dalam ${vehicleType}`
        };
    }
};

/**
 * Mendapatkan info kapasitas kendaraan
 * @param {string} vehicleType - 'L300' atau 'Cherry Box'
 * @returns {Object} - Info kapasitas kendaraan
 */
const getVehicleCapacityInfo = (vehicleType = 'L300') => {
    if (!VEHICLE_CAPACITY_DATA[vehicleType]) {
        throw new Error(`Vehicle type ${vehicleType} tidak dikenali`);
    }
    return VEHICLE_CAPACITY_DATA[vehicleType];
};

module.exports = {
    calculateOrderCapacity,
    calculateMaxUnits,
    validateMultipleOrders,
    getCapacityRecommendation,
    calculateVehicleLoad,
    getVehicleCapacityInfo,
    VEHICLE_CAPACITY_DATA
};
