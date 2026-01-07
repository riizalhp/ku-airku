# Perubahan Algoritma Routing: Pure Clarke-Wright

## 📋 Ringkasan Perubahan

**Tanggal:** 2 November 2025

**Perubahan:** Menghapus clustering regional dan menggunakan **PURE Clarke-Wright Savings Matrix** untuk optimasi rute.

---

## 🔄 SEBELUM (Two-Level Optimization)

### Algoritma Lama:

```
1. CLUSTERING BY REGION
   └─ Group orders berdasarkan field 'region'
   └─ Pisahkan: Sleman, Bantul, Kota Yogyakarta, etc.

2. CLARKE-WRIGHT PER REGION
   └─ Run savings matrix untuk SETIAP region
   └─ Generate routes DALAM region yang sama

3. RESULT
   └─ Rute tidak pernah cross-region
   └─ Optimal PER region, tapi tidak global optimal
```

### Masalah:

- ❌ Rute tidak bisa crossing region meskipun lebih efisien
- ❌ Jika 1 region punya banyak order, akan banyak rute
- ❌ Jika region lain sedikit order, akan sedikit rute
- ❌ **Tidak globally optimal**, hanya locally optimal per region
- ❌ Bisa menghasilkan rute yang tidak balanced

### Contoh Masalah:

```
Region Sleman: 15 toko → 3 rute (5-5-5 toko)
Region Bantul: 3 toko → 1 rute (3 toko)

Padahal mungkin lebih optimal:
Rute 1: 6 toko dari Sleman Selatan + 2 toko Bantul Utara
Rute 2: 5 toko dari Sleman Tengah
Rute 3: 4 toko dari Sleman Utara
Rute 4: 3 toko dari Bantul
```

---

## ✅ SESUDAH (Pure Clarke-Wright)

### Algoritma Baru:

```
1. COLLECT ALL ORDERS
   └─ Kumpulkan SEMUA orders tanpa memandang region
   └─ Group by store (combine orders ke toko yang sama)

2. CLARKE-WRIGHT GLOBALLY
   └─ Run savings matrix untuk SEMUA toko sekaligus
   └─ Algorithm akan otomatis group berdasarkan:
      * Distance (proximity)
      * Capacity constraints
      * Savings (cost reduction)

3. RESULT
   └─ Routes bisa cross-region jika lebih efisien
   └─ Globally optimal solution
   └─ Lebih balanced distribution
```

### Keuntungan:

- ✅ **Globally optimal** - Tidak terbatas region
- ✅ Rute bisa crossing region untuk efisiensi maksimal
- ✅ Lebih fleksibel dalam distribusi beban
- ✅ Algorithm Clarke-Wright akan natural grouping by proximity
- ✅ Lebih sedikit rute dengan utilization lebih tinggi

### Contoh Hasil Baru:

```
Semua 18 toko dioptimasi bersama:

Rute 1: 7 toko (Sleman Selatan + Bantul Utara yang dekat)
Rute 2: 6 toko (Sleman Tengah)
Rute 3: 5 toko (Sleman Utara + Bantul)

✅ Lebih optimal
✅ Rute lebih seimbang
✅ Jarak total lebih pendek
```

---

## 🔧 Technical Changes

### File Modified: `routeController.js`

#### 1. **createUnassignedRoutes()** - Hapus Regional Clustering

**BEFORE:**

```javascript
// Step 1: Cluster by region
const regionClusters = clusterOrdersByRegion(orders);

// Step 2: Process each region
for (const [region, regionOrders] of Object.entries(regionClusters)) {
    // Group orders by store in this region
    const storeStops = regionOrders.reduce(...);

    // Run Clarke-Wright for this region only
    const calculatedTrips = calculateSavingsMatrixRoutes(nodes, depotLocation, capacity);
}
```

**AFTER:**

```javascript
// Step 1: Group ALL orders by store (no regional filtering)
const storeStops = orders.reduce((acc, order) => {
  // Combine all orders to same store
  // Keep track of region for labeling only
}, {});

// Step 2: Run Clarke-Wright for ALL stores at once
const calculatedTrips = calculateSavingsMatrixRoutes(
  nodes,
  depotLocation,
  capacity
);

// Step 3: Create routes from results
// Region determined by most common region in trip
```

#### 2. **createAssignedRoutes()** - Sama, Hapus Clustering

**BEFORE:**

```javascript
// Cluster orders by region first
const regionClusters = clusterOrdersByRegion(remainingOrders);

for (const assignment of assignments) {
  // Process each region separately for this vehicle
  for (const [region, regionOrders] of Object.entries(regionClusters)) {
    // Clarke-Wright per region
  }
}
```

**AFTER:**

```javascript
// No clustering - process all orders together
for (const assignment of assignments) {
    // Group ALL remaining orders by store
    const storeStops = remainingOrders.reduce(...);

    // Run Clarke-Wright for this vehicle with ALL orders
    const calculatedTrips = calculateSavingsMatrixRoutes(nodes, depotLocation, vehicle.capacity);
}
```

#### 3. **Import Changes**

**BEFORE:**

```javascript
const {
  calculateSavingsMatrixRoutes,
  clusterOrdersByRegion,
} = require("../services/routingService");
```

**AFTER:**

```javascript
const { calculateSavingsMatrixRoutes } = require("../services/routingService");
```

---

## 📊 Expected Impact

### Performance:

- ⚡ **Faster:** Single optimization run vs multiple per-region runs
- 📉 **Fewer routes:** Better consolidation
- 📈 **Higher utilization:** More balanced capacity usage

### Route Quality:

- 🎯 **Better optimization:** Global vs local optimum
- 🔀 **Cross-region efficiency:** Dapat combine region yang berdekatan
- 📏 **Shorter total distance:** Optimal pathfinding tanpa constraint regional

### Business Impact:

- 💰 **Lower fuel cost:** Rute lebih efisien
- 🚚 **Fewer vehicles needed:** Consolidation lebih baik
- ⏱️ **Faster delivery:** Rute lebih optimal
- 📊 **Better capacity utilization:** Armada terisi lebih penuh

---

## 🧪 Testing Scenarios

### Test Case 1: Cross-Region Optimization

```
Input:
- Toko A (Sleman Selatan): 50 unit
- Toko B (Bantul Utara, dekat A): 40 unit
- Toko C (Sleman Utara): 30 unit
- Vehicle capacity: 100 unit

OLD Result (with clustering):
- Rute 1 (Sleman): Toko A + C = 80 unit
- Rute 2 (Bantul): Toko B = 40 unit (underutilized)

NEW Result (pure Clarke-Wright):
- Rute 1: Toko A + B = 90 unit ✅ (better utilization)
- Rute 2: Toko C = 30 unit
```

### Test Case 2: Many Orders in One Region

```
Input:
- 15 toko di Sleman (demand varies)
- 3 toko di Bantul (dekat dengan beberapa toko Sleman)
- 3 armada available

OLD Result:
- Sleman terpaksa diproses terpisah dari Bantul
- Mungkin butuh 4-5 rute

NEW Result:
- Algorithm bisa combine Bantul + Sleman Selatan
- Lebih optimal, mungkin hanya 3-4 rute
```

### Test Case 3: Single Region

```
Input:
- 10 toko semua di Sleman
- No difference expected (sama saja)

Result:
- Same optimization as before
- No regression
```

---

## 📝 Notes

### Region Field Masih Ada

Field `region` di database **TIDAK DIHAPUS**, hanya tidak digunakan untuk clustering:

- Masih bisa digunakan untuk **reporting**
- Masih bisa digunakan untuk **analytics**
- Masih bisa digunakan untuk **manual filtering** jika diperlukan

### Clarke-Wright Algorithm Unchanged

Algoritma Clarke-Wright sendiri **TIDAK BERUBAH**:

- Masih menggunakan savings matrix
- Masih mempertimbangkan distance dan capacity
- Masih menghasilkan near-optimal solutions
- Hanya input yang berubah (all orders vs per-region)

### Console Logs Updated

Log messages updated untuk reflect new approach:

```javascript
console.log(
  "[Route Planning] Using PURE CLARKE-WRIGHT algorithm (NO regional clustering)"
);
console.log("[Route Planning] Total stores (nodes): ${nodes.length}");
console.log(
  "[Route Planning] Running Clarke-Wright Savings Matrix algorithm..."
);
```

---

## 🔄 Rollback Instructions

Jika perlu rollback ke algoritma lama:

1. Restore import:

   ```javascript
   const {
     calculateSavingsMatrixRoutes,
     clusterOrdersByRegion,
   } = require("../services/routingService");
   ```

2. Replace `createUnassignedRoutes()` dengan versi lama (ada di git history)

3. Replace `createAssignedRoutes()` dengan versi lama (ada di git history)

4. Commit dengan message: `Rollback: Restore regional clustering algorithm`

---

## 📌 Commit Message

```
refactor: Remove regional clustering, use pure Clarke-Wright optimization

- Remove clusterOrdersByRegion step from route planning
- Run Clarke-Wright Savings Matrix on all orders globally
- Allow cross-region routes for better optimization
- Update console logs to reflect algorithm change
- Globally optimal routes instead of per-region optimization

BREAKING: Routes can now span multiple regions
IMPACT: Better route efficiency, fewer vehicles needed
```

---

_Dokumentasi dibuat: 2 November 2025_
_Status: ✅ IMPLEMENTED - Pure Clarke-Wright active_
