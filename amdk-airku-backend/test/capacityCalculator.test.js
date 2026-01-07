/**
 * Test untuk Capacity Calculator
 * Jalankan dengan: node test/capacityCalculator.test.js
 */

const { calculateVehicleLoad, getVehicleCapacityInfo } = require('../src/utils/capacityCalculator');

console.log('=== TEST CAPACITY CALCULATOR ===\n');

// TEST 1: Homogeneous Load - L300 dengan 240ml
console.log('TEST 1: L300 dengan 200 unit 240ml (homogeneous, tepat batas)');
const test1 = calculateVehicleLoad([
    { productType: '240ml', quantity: 200 }
], 'L300');
console.log(JSON.stringify(test1, null, 2));
console.log('\n---\n');

// TEST 2: Homogeneous Load - L300 dengan 120ml melebihi
console.log('TEST 2: L300 dengan 400 unit 120ml (homogeneous, melebihi batas 350)');
const test2 = calculateVehicleLoad([
    { productType: '120ml', quantity: 400 }
], 'L300');
console.log(JSON.stringify(test2, null, 2));
console.log('\n---\n');

// TEST 3: Heterogeneous Load - L300 dengan campuran produk
console.log('TEST 3: L300 dengan campuran 100x240ml + 50x600ml (heterogeneous)');
const test3 = calculateVehicleLoad([
    { productType: '240ml', quantity: 100 },
    { productType: '600ml', quantity: 50 }
], 'L300');
console.log(JSON.stringify(test3, null, 2));
console.log('Expected: 100*1 + 50*1.6 = 100 + 80 = 180 (fit)');
console.log('\n---\n');

// TEST 4: Heterogeneous Load - Melebihi kapasitas
console.log('TEST 4: L300 dengan campuran melebihi (150x240ml + 50x600ml)');
const test4 = calculateVehicleLoad([
    { productType: '240ml', quantity: 150 },
    { productType: '600ml', quantity: 50 }
], 'L300');
console.log(JSON.stringify(test4, null, 2));
console.log('Expected: 150*1 + 50*1.6 = 150 + 80 = 230 > 200 (perlu pengurangan proporsional)');
console.log('\n---\n');

// TEST 5: Cherry Box dengan 19L
console.log('TEST 5: Cherry Box dengan 60 unit 19L (homogeneous, melebihi batas 50)');
const test5 = calculateVehicleLoad([
    { productType: '19L', quantity: 60 }
], 'Cherry Box');
console.log(JSON.stringify(test5, null, 2));
console.log('\n---\n');

// TEST 6: Cherry Box dengan campuran
console.log('TEST 6: Cherry Box dengan 100x240ml + 20x19L (heterogeneous)');
const test6 = calculateVehicleLoad([
    { productType: '240ml', quantity: 100 },
    { productType: '19L', quantity: 20 }
], 'Cherry Box');
console.log(JSON.stringify(test6, null, 2));
console.log('Expected: 100*1 + 20*3.33 = 100 + 66.6 = 166.6 < 170 (fit)');
console.log('\n---\n');

// TEST 7: Info Kendaraan
console.log('TEST 7: Info Kapasitas L300');
const infoL300 = getVehicleCapacityInfo('L300');
console.log(JSON.stringify(infoL300, null, 2));
console.log('\n---\n');

console.log('=== SEMUA TEST SELESAI ===');
