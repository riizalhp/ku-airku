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

    // Cek apakah produk homogen (hanya 1 jenis produk)
    const uniqueProducts = new Set(orderItems.map(item => item.productId));
    const isHomogeneous = uniqueProducts.size === 1;

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

module.exports = {
    calculateOrderCapacity,
    calculateMaxUnits,
    validateMultipleOrders,
    getCapacityRecommendation
};
