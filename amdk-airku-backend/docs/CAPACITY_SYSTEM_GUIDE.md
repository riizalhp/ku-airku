# 📦 Panduan Sistem Kapasitas Armada

## 🎯 Konsep Dasar

Sistem ini memungkinkan armada mengangkut:

1. **Produk Homogen**: 1 jenis produk saja
2. **Produk Heterogen**: Berbagai jenis produk dalam 1 perjalanan

## 🧮 Cara Kerja

### Produk Homogen (1 Jenis Produk)

- Menggunakan **capacityUnit** = 1.0
- Contoh: Armada kapasitas 200, produk 240ml dengan capacityUnit = 1.0
- **Dapat mengangkut**: 200 ÷ 1.0 = **200 unit**

### Produk Heterogen (Berbagai Jenis Produk)

- Menggunakan **capacityConversionHeterogeneous**
- Contoh: Armada kapasitas 200
  - Produk 240ml: conversion = 1.0 → max 200 unit
  - Produk 120ml: conversion = 0.5 → max 400 unit
  - Kombinasi: Bisa 100 unit 240ml + 200 unit 120ml = (100×1.0) + (200×0.5) = 200 kapasitas

## 📊 Contoh Kasus Nyata

### Kasus 1: Mobil Lecy (Kapasitas: 200)

**Skenario A: Hanya 240ml**

- Produk: 240ml
- capacityUnit: 1.0
- capacityConversionHeterogeneous: 1.0
- **Hasil**: Bisa angkut 200 unit

**Skenario B: Hanya 120ml**

- Produk: 120ml
- capacityUnit: 1.0
- capacityConversionHeterogeneous: 0.5
- **Hasil**: Bisa angkut 200 unit (karena homogen, pakai capacityUnit)

**Skenario C: Campur 240ml + 120ml**

- 240ml (conversion 1.0): 100 unit = 100 kapasitas
- 120ml (conversion 0.5): 200 unit = 100 kapasitas
- **Total**: 200 kapasitas ✅ MUAT

## 🛠️ Cara Input Data Produk

### Opsi 1: Input Manual (Recommended untuk User Non-Teknis)

```
Nama Produk: Air Mineral 240ml
Kapasitas Unit: 1.0 (biarkan default)
Konversi Heterogen: [Klik "Auto Calculate" berdasarkan nama]
```

### Opsi 2: Input dengan Helper API

**Request:**

```bash
GET /api/products/capacity-recommendation?productName=240ml
```

**Response:**

```json
{
  "productName": "240ml",
  "recommendation": {
    "capacityUnit": 1.0,
    "capacityConversionHeterogeneous": 1.0,
    "explanation": "Produk 240ml memiliki konversi 1.0 (dibandingkan dengan baseline 19L)",
    "sizeInLiter": 0.24
  },
  "guide": {
    "capacityUnit": "Selalu gunakan 1.0 untuk produk homogen",
    "capacityConversionHeterogeneous": "Konversi yang digunakan saat produk dicampur dengan produk lain",
    "example": "Armada kapasitas 200 bisa mengangkut: 200 unit (homogen) atau berbagai kombinasi (heterogen)"
  }
}
```

### Opsi 3: Sistem Auto-Calculate

Saat menambah produk, sistem akan otomatis menghitung berdasarkan nama produk:

- "240ml" → conversion 1.0
- "120ml" → conversion 0.5
- "600ml" → conversion 2.0
- "19L" atau "19 liter" → conversion 1.0 (baseline)

## 🔍 Validasi Kapasitas Order

### Validasi Single Order

**Request:**

```bash
POST /api/orders/validate-capacity
{
  "orderId": "xxx-xxx",
  "vehicleId": "yyy-yyy"
}
```

**Response:**

```json
{
  "orderId": "xxx-xxx",
  "vehicleId": "yyy-yyy",
  "vehicleName": "Suzuki R3 (AB 1234 CD)",
  "vehicleCapacity": 200,
  "totalCapacityUsed": 150,
  "remainingCapacity": 50,
  "isHomogeneous": false,
  "canFit": true,
  "utilizationPercentage": 75,
  "capacityDetails": [
    {
      "productId": "prod-1",
      "productName": "240ml",
      "quantity": 100,
      "conversionRate": 1.0,
      "capacityNeeded": 100
    },
    {
      "productId": "prod-2",
      "productName": "120ml",
      "quantity": 100,
      "conversionRate": 0.5,
      "capacityNeeded": 50
    }
  ],
  "recommendation": "Order dapat dimuat dalam armada ini. Sisa kapasitas: 50"
}
```

### Validasi Multiple Orders

**Request:**

```bash
POST /api/orders/validate-multiple-capacity
{
  "orderIds": ["order-1", "order-2", "order-3"],
  "vehicleId": "vehicle-1"
}
```

**Response:**

```json
{
  "vehicleId": "vehicle-1",
  "vehicleName": "Suzuki R3 (AB 1234 CD)",
  "vehicleCapacity": 200,
  "ordersCount": 3,
  "canFit": true,
  "totalCapacity": 180,
  "remainingCapacity": 20,
  "utilizationPercentage": 90,
  "isHomogeneous": false,
  "productTypes": 2,
  "recommendation": "✅ 3 pesanan dapat dimuat dalam armada ini. Sisa kapasitas: 20 (10% kosong)"
}
```

## 🎨 UI/UX Recommendations

### Form Tambah Produk

```
┌─────────────────────────────────────┐
│ Tambah Produk Baru                  │
├─────────────────────────────────────┤
│ SKU: [_____________]                │
│ Nama: [240ml Air Mineral_]          │
│ Harga: [20000___________]           │
│ Stok: [1000__________]              │
│                                     │
│ ⚙️ Pengaturan Kapasitas             │
│ (Opsional - sistem akan hitung      │
│  otomatis berdasarkan nama)         │
│                                     │
│ ☑️ Hitung Otomatis                  │
│                                     │
│ Atau input manual:                  │
│ Konversi: [1.0____] [i]             │
│                                     │
│ 💡 Preview: Armada 200 dapat        │
│    mengangkut 200 unit produk ini   │
│                                     │
│ [Simpan] [Batal]                    │
└─────────────────────────────────────┘

[i] Tooltip:
"Konversi adalah bobot produk dalam armada.
- 240ml = 1.0 (standar)
- 120ml = 0.5 (setengah dari standar)
- Semakin kecil ukuran, semakin kecil konversi"
```

### Form Assign Order ke Armada

```
┌─────────────────────────────────────┐
│ Assign Order ke Armada              │
├─────────────────────────────────────┤
│ Armada: [Suzuki R3 (AB 1234 CD) ▼] │
│         Kapasitas: 200              │
│                                     │
│ Order yang akan di-assign:          │
│ ☑️ Order #001 - Toko A              │
│    2x 240ml (kapasitas: 2)          │
│ ☑️ Order #002 - Toko B              │
│    5x 120ml (kapasitas: 2.5)        │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Total Kapasitas: 4.5 / 200          │
│ Sisa: 195.5 (97.75% kosong)         │
│ Status: ✅ DAPAT DIMUAT              │
│                                     │
│ [Validate] [Assign Orders]          │
└─────────────────────────────────────┘
```

## 📱 Integration dengan Frontend

### TypeScript Types

```typescript
interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  capacityUnit: number; // Default 1.0
  capacityConversionHeterogeneous: number; // Auto atau manual
}

interface CapacityValidationResult {
  totalCapacityUsed: number;
  remainingCapacity: number;
  isHomogeneous: boolean;
  canFit: boolean;
  utilizationPercentage: number;
  capacityDetails: CapacityDetail[];
  recommendation: string;
}

interface CapacityDetail {
  productId: string;
  productName: string;
  quantity: number;
  conversionRate: number;
  capacityNeeded: number;
  isHomogeneous: boolean;
}
```

### API Service Example

```typescript
// services/capacityApiService.ts
export const getCapacityRecommendation = async (productName: string) => {
  const response = await api.get(
    `/products/capacity-recommendation?productName=${encodeURIComponent(
      productName
    )}`
  );
  return response.data;
};

export const validateOrderCapacity = async (
  orderId: string,
  vehicleId: string
) => {
  const response = await api.post("/orders/validate-capacity", {
    orderId,
    vehicleId,
  });
  return response.data;
};

export const validateMultipleOrdersCapacity = async (
  orderIds: string[],
  vehicleId: string
) => {
  const response = await api.post("/orders/validate-multiple-capacity", {
    orderIds,
    vehicleId,
  });
  return response.data;
};
```

## 🔧 Database Migration

Jalankan SQL migration sebelum menggunakan fitur ini:

```bash
mysql -u root -p amdk_airku_db < migrations/add_capacity_conversion.sql
```

## ✅ Checklist Implementasi

- [x] Database migration
- [x] Backend models update
- [x] Capacity calculator utility
- [x] Product controller dengan auto-calculate
- [x] Order validation endpoints
- [x] API routes
- [ ] Frontend UI untuk input produk
- [ ] Frontend validasi kapasitas
- [ ] Testing & validation

## 📞 Support

Jika ada pertanyaan atau butuh bantuan implementasi UI, silakan hubungi tim development.

---

**Last Updated:** 23 Oktober 2025
