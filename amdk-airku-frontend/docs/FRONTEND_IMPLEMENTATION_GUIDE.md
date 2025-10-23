# 🎨 Frontend Implementation Guide - Sistem Kapasitas

## 📁 File-File Yang Sudah Dibuat

### ✅ 1. TypeScript Types (`src/types.ts`)

```typescript
export interface Product {
  // ... existing fields
  capacityUnit: number;
  capacityConversionHeterogeneous?: number; // NEW
}

export interface CapacityDetail {
  productId: string;
  productName: string;
  quantity: number;
  conversionRate: number;
  capacityNeeded: number;
  isHomogeneous: boolean;
}

export interface CapacityValidationResult {
  totalCapacityUsed: number;
  remainingCapacity: number;
  isHomogeneous: boolean;
  canFit: boolean;
  utilizationPercentage: number;
  capacityDetails: CapacityDetail[];
  recommendation?: string;
}

// ... more types
```

### ✅ 2. API Service (`src/services/capacityApiService.ts`)

```typescript
// Functions available:
-getCapacityRecommendation(productName) -
  validateOrderCapacity(orderId, vehicleId) -
  validateMultipleOrdersCapacity(orderIds, vehicleId) -
  estimateConversionRate(productName) -
  formatCapacity(capacity) -
  getCapacityStatusIcon(canFit);
```

### ✅ 3. UI Components

#### a. `CapacityValidator.tsx` - Component utama untuk validasi

- Auto-validate saat order/vehicle berubah
- Tampilkan capacity bar
- Detail breakdown per produk
- Rekomendasi

#### b. `CapacityIndicator.tsx` - Simple progress bar

- Reusable di mana saja
- Auto-color based on percentage
- Show remaining capacity

### ✅ 4. Updated `ProductManagement.tsx`

- Auto-calculate capacity dari nama produk
- Toggle auto/manual calculation
- Preview capacity untuk user
- Support field `capacityConversionHeterogeneous`

---

## 🚀 Cara Menggunakan Components

### 1. ProductManagement - Sudah Terintegrasi ✅

Form tambah/edit produk sudah otomatis:

- Deteksi ukuran dari nama (240ml, 120ml, dll)
- Hitung conversion rate
- Show preview capacity
- User bisa override manual jika perlu

**Tidak perlu action tambahan!**

### 2. OrderManagement - Perlu Integrasi

Add CapacityValidator ke OrderManagement component:

```tsx
import { CapacityValidator } from '../ui/CapacityValidator';

// Inside OrderManagement component
const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
const [validationResult, setValidationResult] = useState(null);

// Render in JSX (before or after batch assign form)
<CapacityValidator
  selectedOrders={selectedOrders}
  vehicleId={selectedVehicle}
  vehicles={vehicles}
  onValidationComplete={(result) => {
    setValidationResult(result);
    // Optionally: disable assign button if !result.canFit
  }}
/>

// Conditional assign button
<button
  disabled={validationResult && !validationResult.canFit}
  className={validationResult && !validationResult.canFit ? 'opacity-50 cursor-not-allowed' : ''}
>
  {validationResult && !validationResult.canFit ? '❌ Kapasitas Tidak Cukup' : 'Assign Orders'}
</button>
```

### 3. Capacity Indicator - Usage Examples

**Example 1: Show vehicle utilization**

```tsx
<CapacityIndicator used={150} total={200} showDetails={true} />
```

**Example 2: In a list of vehicles**

```tsx
{
  vehicles.map((vehicle) => (
    <div key={vehicle.id}>
      <h3>{vehicle.model}</h3>
      <CapacityIndicator
        used={vehicle.currentLoad || 0}
        total={vehicle.capacity}
        showDetails={false}
        className="my-2"
      />
    </div>
  ));
}
```

---

## 📋 Integration Checklist

### ProductManagement ✅ DONE

- [x] Import capacityApiService
- [x] Add auto-calculate toggle
- [x] Add capacityConversionHeterogeneous field
- [x] Show capacity preview
- [x] Update form state

### OrderManagement 🔄 TODO

- [ ] Import CapacityValidator component
- [ ] Add state for selectedOrders
- [ ] Add state for validationResult
- [ ] Render CapacityValidator in batch assign section
- [ ] Disable assign button if capacity exceeded
- [ ] Show warning message if overloaded

### RoutePlanning 🔄 TODO (Optional Enhancement)

- [ ] Show capacity indicator per route
- [ ] Validate before creating route
- [ ] Warning if route exceeds vehicle capacity

### Dashboard 🔄 TODO (Optional Enhancement)

- [ ] Show vehicle utilization statistics
- [ ] Top vehicles by utilization
- [ ] Capacity trends chart

---

## 🎨 UI/UX Best Practices

### Colors

```css
Green (#10B981): 0-60% utilization (Aman)
Yellow (#F59E0B): 61-80% utilization (Perhatian)
Orange (#F97316): 81-100% utilization (Hampir Penuh)
Red (#EF4444): >100% utilization (Overload)
```

### Icons

- ✅ Can fit / Success
- ❌ Cannot fit / Error
- 🟢 Homogeneous load
- 🔵 Heterogeneous load
- 📦 Capacity/Package
- 🚛 Vehicle

### Messages

**Success:**

> ✅ 3 pesanan dapat dimuat dalam armada ini. Sisa kapasitas: 50 (25% kosong)

**Error:**

> ❌ 3 pesanan TIDAK DAPAT dimuat dalam armada ini. Kelebihan: 25. Kurangi jumlah pesanan atau gunakan armada dengan kapasitas lebih besar.

**Warning:**

> ⚠️ Kapasitas hampir penuh (95%). Pertimbangkan untuk menggunakan armada yang lebih besar.

---

## 🐛 Troubleshooting

### Problem: Auto-calculate tidak berjalan

**Solution:**

- Pastikan nama produk include size (240ml, 120ml, 19L)
- Check console untuk errors
- Pastikan `estimateConversionRate` function imported

### Problem: Validation selalu gagal

**Solution:**

- Check if token valid (login ulang)
- Check backend running
- Check console network tab untuk API errors
- Pastikan migration database sudah dijalankan

### Problem: Type errors

**Solution:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run dev
```

---

## 📱 Responsive Design

Components sudah responsive:

- Grid layout auto-adjust di mobile
- Table scroll horizontal di small screens
- Progress bar width 100%
- Font sizes responsive

Test di:

- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## 🧪 Testing Scenarios

### Scenario 1: Create Product

1. Buka Product Management
2. Klik "Tambah Produk"
3. Input nama: "Air Mineral 240ml"
4. Lihat auto-calculate: conversion = 1.0 ✅
5. Submit

### Scenario 2: Validate Single Order

1. Buka Order Management
2. Select 1 order
3. Select vehicle
4. See auto-validation result ✅

### Scenario 3: Validate Multiple Orders (Mix Products)

1. Select multiple orders with different products
2. Check "Heterogen" indicator
3. See different conversion rates per product ✅

### Scenario 4: Overload Warning

1. Select many orders
2. Choose small vehicle
3. See red warning "TIDAK DAPAT DIMUAT" ❌
4. Assign button disabled ✅

---

## 📞 Next Development Tasks

### High Priority

1. ✅ Integrate CapacityValidator to OrderManagement
2. ✅ Add validation before batch assign
3. ✅ Disable assign button if overloaded

### Medium Priority

1. Add capacity to RoutePlanning view
2. Show vehicle utilization in Dashboard
3. Add capacity history/trends

### Low Priority

1. Export capacity reports
2. Capacity optimization suggestions
3. Machine learning for better estimates

---

## 📚 API Reference

### GET `/api/products/capacity-recommendation`

**Query Params:**

- `productName`: string (e.g., "240ml")

**Response:**

```json
{
  "recommendation": {
    "capacityUnit": 1.0,
    "capacityConversionHeterogeneous": 1.0,
    "explanation": "..."
  }
}
```

### POST `/api/orders/validate-capacity`

**Body:**

```json
{
  "orderId": "uuid",
  "vehicleId": "uuid"
}
```

**Response:**

```json
{
  "canFit": true,
  "totalCapacityUsed": 150,
  "remainingCapacity": 50,
  "utilizationPercentage": 75,
  "recommendation": "..."
}
```

### POST `/api/orders/validate-multiple-capacity`

**Body:**

```json
{
  "orderIds": ["uuid1", "uuid2"],
  "vehicleId": "uuid"
}
```

**Response:**

```json
{
  "canFit": true,
  "ordersCount": 2,
  "productTypes": 3,
  "isHomogeneous": false,
  "totalCapacityUsed": 180,
  "remainingCapacity": 20,
  "utilizationPercentage": 90,
  "capacityDetails": [...],
  "recommendation": "..."
}
```

---

**Last Updated:** 23 Oktober 2025  
**Status:** Components Ready ✅ | Integration Pending 🔄  
**Version:** 1.0
