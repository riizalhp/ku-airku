# Analisis Komprehensif: Masalah Implementasi Homogen

## 🔴 MASALAH UTAMA

Sistem capacity calculation **TIDAK** mengimplementasikan logika homogen dengan benar di frontend `FleetManagement.tsx`, menyebabkan **SEMUA** rute selalu dihitung dengan `capacityConversionHeterogeneous`, bahkan untuk muatan homogen (1 jenis produk).

---

## 📊 ANALISIS ROOT CAUSE

### 1. **Backend: SUDAH BENAR ✅**

File: `amdk-airku-backend/src/utils/capacityCalculator.js`

```javascript
// Logika backend SUDAH IMPLEMENTASI HOMOGEN dengan benar
const calculateOrderCapacity = (orderItems, vehicleCapacity) => {
  // Cek apakah produk homogen
  const uniqueProducts = new Set(orderItems.map((item) => item.productId));
  const isHomogeneous = uniqueProducts.size === 1 || orderItems.length === 1;

  orderItems.forEach((item) => {
    let conversionRate;
    if (isHomogeneous) {
      // ✅ HOMOGEN: Gunakan capacityUnit (= 1.0)
      conversionRate = product.capacityUnit || 1.0;
    } else {
      // ✅ HETEROGEN: Gunakan capacityConversionHeterogeneous
      conversionRate =
        product.capacityConversionHeterogeneous || product.capacityUnit || 1.0;
    }
    // ...
  });
};
```

**Status Backend:** ✅ **BENAR** - Backend sudah implement logika homogen/heterogen dengan sempurna.

---

### 2. **Frontend: SALAH ❌ (SEBELUM FIX)**

File: `amdk-airku-frontend/src/components/admin/FleetManagement.tsx`

**KODE LAMA (SALAH):**

```typescript
// ❌ MASALAH: Selalu gunakan capacityConversionHeterogeneous
route.stops.forEach((stop) => {
  const order = orders.find((o) => o.id === stop.orderId);
  if (order && order.items) {
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        // ❌ SALAH: Selalu gunakan heterogeneous conversion
        const conversionRate = product.capacityConversionHeterogeneous || 1.0;
        totalCapacityUsed += item.quantity * conversionRate;
      }
    });
  }
});
```

**DAMPAK:**

- Rute dengan 1 jenis produk (homogen) tetap dihitung dengan `capacityConversionHeterogeneous`
- Contoh: 100 pcs Air 240ml homogen seharusnya = 100 unit, tapi dihitung = 330 unit
- Menyebabkan overestimation kapasitas yang dibutuhkan
- Armada terlihat "penuh" padahal masih banyak ruang

---

### 3. **Penyebab Teknis**

#### A. **Tidak Ada Field `capacityUsed` dari Backend**

Backend **TIDAK** mengirim field `capacityUsed` dalam response route:

```javascript
// routeController.js - TIDAK ADA capacityUsed di response
const routeData = {
  id: routeId,
  region: region,
  date: deliveryDate,
  stops: stopsData,
  // ❌ TIDAK ADA: capacityUsed
  // ❌ TIDAK ADA: isHomogeneous
};
```

#### B. **Frontend Harus Hitung Sendiri**

Karena backend tidak kirim `capacityUsed`, frontend harus calculate di `useMemo`:

```typescript
const routesWithDistance = useMemo<RouteWithCapacity[]>(() => {
  return routes.map((route) => {
    // Frontend calculate capacity di sini
    let totalCapacityUsed = 0;
    // ...
  });
}, [routes, orders, products]);
```

#### C. **Frontend Tidak Cek Homogen/Heterogen**

Kode lama **TIDAK PERNAH** cek apakah rute homogen atau heterogen:

```typescript
// ❌ TIDAK ADA CEK HOMOGEN
// Langsung pakai capacityConversionHeterogeneous untuk semua
const conversionRate = product.capacityConversionHeterogeneous || 1.0;
```

---

## ✅ SOLUSI YANG SUDAH DIIMPLEMENTASIKAN

### **KODE BARU (BENAR):**

```typescript
// ✅ FIX: Tambahkan logika homogen/heterogen di frontend
const routesWithDistance = useMemo<RouteWithCapacity[]>(() => {
  return routes.map((route) => {
    // Step 1: Collect semua produk dalam rute ini
    const allProductsInRoute: string[] = [];
    route.stops.forEach((stop) => {
      const order = orders.find((o) => o.id === stop.orderId);
      if (order && order.items) {
        order.items.forEach((item) => {
          allProductsInRoute.push(item.productId);
        });
      }
    });

    // Step 2: Tentukan apakah rute ini homogen
    const uniqueProductIds = new Set(allProductsInRoute);
    const isHomogeneous =
      uniqueProductIds.size === 1 || allProductsInRoute.length === 1;

    // Step 3: Hitung kapasitas dengan logika yang benar
    let totalCapacityUsed = 0;
    route.stops.forEach((stop) => {
      const order = orders.find((o) => o.id === stop.orderId);
      if (order && order.items) {
        order.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            // ✅ BENAR: Gunakan logika homogen/heterogen
            const conversionRate = isHomogeneous
              ? product.capacityUnit || 1.0 // Homogen
              : product.capacityConversionHeterogeneous || 1.0; // Heterogen

            totalCapacityUsed += item.quantity * conversionRate;
          }
        });
      }
    });

    return {
      ...route,
      capacityUsed: Math.round(totalCapacityUsed * 10) / 10,
    };
  });
}, [routes, orders, products]);
```

---

## 🎯 HASIL SETELAH FIX

### **SEBELUM FIX:**

```
Rute A (Homogen - hanya Air 240ml):
- 100 pcs Air 240ml
- Dihitung: 100 × 3.3 = 330 unit ❌ SALAH
- Armada L300 (200 unit): OVERLOAD! (165%)
```

### **SETELAH FIX:**

```
Rute A (Homogen - hanya Air 240ml):
- 100 pcs Air 240ml
- Dihitung: 100 × 1.0 = 100 unit ✅ BENAR
- Armada L300 (200 unit): 50% terisi ✅
```

---

## 📋 CHECKLIST IMPLEMENTASI

### ✅ Yang Sudah Benar:

1. ✅ Backend `capacityCalculator.js` - Logic homogen/heterogen SUDAH BENAR
2. ✅ Backend routing algorithm - Menggunakan capacity calculator dengan benar
3. ✅ Database products - Field `capacityUnit` dan `capacityConversionHeterogeneous` ada
4. ✅ Frontend calculation logic - SUDAH DIPERBAIKI dengan logika homogen/heterogen

### ⚠️ Yang Perlu Diperhatikan:

1. ⚠️ **Console Log**: Tambahkan log untuk debugging
2. ⚠️ **Testing**: Test dengan berbagai skenario (homogen, heterogen, mixed)
3. ⚠️ **Validation**: Pastikan `capacityUnit` di database terisi dengan benar (default 1.0)

---

## 🧪 SKENARIO TESTING

### Test Case 1: Rute Homogen Murni

```
Input:
- Toko A: 50 pcs Air 240ml
- Toko B: 30 pcs Air 240ml
- Toko C: 20 pcs Air 240ml

Expected:
- isHomogeneous: true
- Total: 100 × 1.0 = 100 unit
- Armada APV (100 unit): 100% ✅
```

### Test Case 2: Rute Heterogen

```
Input:
- Toko A: 30 pcs Air 240ml + 20 pcs Air 120ml
- Toko B: 40 pcs Air 240ml + 10 pcs Air 600ml

Expected:
- isHomogeneous: false
- Total: (30×3.3 + 20×1.65 + 40×3.3 + 10×9.9) = 363 unit
- Armada L300 (200 unit): OVERLOAD ⚠️
```

### Test Case 3: Single Item (Edge Case)

```
Input:
- Toko A: 10 pcs Air 240ml (1 pesanan, 1 produk)

Expected:
- isHomogeneous: true (karena orderItems.length === 1)
- Total: 10 × 1.0 = 10 unit ✅
```

---

## 🔍 DEBUGGING TIPS

### Console Log Output:

```javascript
console.log(`Route ${route.id} (${route.region}):`, {
  totalItems: allProductsInRoute.length,
  uniqueProducts: uniqueProductIds.size,
  isHomogeneous: isHomogeneous,
});

// Per item:
console.log(
  `  - ${product.name}: ${item.quantity} × ${conversionRate} = ${capacity}`
);

// Total:
console.log(
  `  Total capacity: ${totalCapacityUsed} (${
    isHomogeneous ? "HOMOGEN" : "HETEROGEN"
  })`
);
```

### Cara Test:

1. Buka browser DevTools → Console
2. Buat rute dengan pesanan homogen (1 jenis produk saja)
3. Lihat log: harus muncul `isHomogeneous: true`
4. Cek nilai `conversionRate`: harus 1.0 untuk homogen
5. Cek `Total capacity`: harus sesuai dengan quantity × 1.0

---

## 📝 KESIMPULAN

### Penyebab Utama:

1. ❌ Frontend **TIDAK** mengimplementasikan logika homogen/heterogen
2. ❌ Frontend **SELALU** menggunakan `capacityConversionHeterogeneous`
3. ❌ Backend tidak mengirim field `capacityUsed`, jadi frontend harus hitung sendiri

### Solusi:

1. ✅ Tambahkan deteksi homogen di frontend (cek unique products)
2. ✅ Gunakan `capacityUnit` untuk homogen, `capacityConversionHeterogeneous` untuk heterogen
3. ✅ Tambahkan console log untuk debugging
4. ✅ Tambahkan detail pesanan di setiap pemberhentian

### Impact:

- ✅ Kapasitas rute homogen dihitung dengan benar (lebih rendah)
- ✅ Tidak ada overload palsu untuk muatan homogen
- ✅ Assignment armada lebih optimal
- ✅ User dapat melihat detail produk di setiap toko

---

## 🚀 NEXT STEPS

1. **Test End-to-End:**

   - Buat pesanan dengan 1 jenis produk (homogen)
   - Buat rute optimal
   - Verifikasi kapasitas dihitung dengan benar

2. **Validasi Data:**

   - Pastikan semua produk punya `capacityUnit` = 1.0
   - Pastikan `capacityConversionHeterogeneous` terisi

3. **Monitor Production:**
   - Cek console log di production
   - Monitor overload warnings
   - Collect feedback dari user

---

_Dokumen ini dibuat: 2 November 2025_
_Status: ✅ FIXED - Logika homogen sudah diimplementasikan dengan benar_
