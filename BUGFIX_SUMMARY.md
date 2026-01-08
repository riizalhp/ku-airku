# PERBAIKAN MASALAH SISTEM PENGIRIMAN & INVENTORY

## Tanggal: 7 Januari 2026

### ⚠️ MASALAH YANG DIPERBAIKI

#### 1. ERROR: "Could not find the 'stop_order' column"

**Gejala:** PGRST204 error saat membuat rute pengiriman
**Penyebab:** Frontend menggunakan `stop_order` tapi database schema menggunakan `sequence`
**Solusi:**

- ✅ Ubah `stop_order` → `sequence` di [routeApiService.ts](amdk-airku-frontend/src/services/routeApiService.ts#L96)
- ✅ Buat migration SQL di [fix_schema_issues.sql](amdk-airku-backend/fix_schema_issues.sql) untuk:
  - Drop kolom `stop_order` jika ada
  - Pastikan kolom `sequence` ada di `route_stops`

#### 2. DRIVER TIDAK MENERIMA NOTIFIKASI PENGIRIMAN

**Gejala:** Saat admin membuat rute, driver tidak diberitahu
**Penyebab:** Tidak ada sistem notifikasi terintegrasi
**Solusi:**

- ✅ Buat tabel `driver_notifications` dengan RLS policies
- ✅ Tambah function `notifyDriverAboutRoute` di [notificationService.js](amdk-airku-backend/services/notificationService.js)
- ✅ Integrasikan notifikasi ke [routeApiService.ts](amdk-airku-frontend/src/services/routeApiService.ts) saat driver diassign

#### 3. STOK PRODUK TIDAK BERKURANG SAAT TAMBAH PESANAN

**Gejala:** Menambah order tidak mengurangi stock di products table
**Penyebab:** Trigger inventory tidak berjalan atau order_items tidak ter-insert dengan benar
**Solusi:**

- ✅ Perbaiki trigger `manage_inventory` di [fix_schema_issues.sql](amdk-airku-backend/fix_schema_issues.sql)
- ✅ Tambah inventory verification sebelum order creation di [orderApiService.ts](amdk-airku-frontend/src/services/orderApiService.ts#L70)
- ✅ Pastikan `order_items` insert triggers the function properly
- ✅ Tambah `reserved_stock` tracking untuk accurate inventory

---

## FILE YANG DIUBAH

### Backend

1. **amdk-airku-backend/fix_schema_issues.sql** (BARU)

   - Create/fix `driver_notifications` table dengan RLS
   - Perbaiki `route_stops` schema (remove `stop_order`, ensure `sequence`)
   - Recreate `manage_inventory` trigger dengan proper reserved_stock logic
   - Ensure `order_items` table exists dengan indices

2. **amdk-airku-backend/services/notificationService.js** (BARU)
   - `notifyDriverAboutRoute()` - kirim notif ke driver
   - `getDriverNotifications()` - ambil notif driver
   - `markNotificationAsRead()` - mark notif sebagai dibaca
   - `verifyInventory()` - validasi stok sebelum order

### Frontend

1. **amdk-airku-frontend/src/services/routeApiService.ts**
   - ✅ Line 96: `stop_order` → `sequence`
   - ✅ Line 99-114: Tambah driver notification logic
2. **amdk-airku-frontend/src/services/orderApiService.ts**
   - ✅ Line 70-78: Tambah inventory verification sebelum order creation
   - Trigger otomatis berkurang stok via database trigger saat `order_items` inserted

---

## LANGKAH IMPLEMENTASI

### 1. RUN MIGRATION SQL

```bash
# Execute fix_schema_issues.sql di Supabase Dashboard SQL Editor
# atau melalui backend utility
node amdk-airku-backend/migrations/run_fix_schema.js
```

### 2. VERIFY DATABASE

```bash
# Check trigger is running
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public' AND event_object_table = 'order_items';

# Check notification table exists
SELECT * FROM driver_notifications LIMIT 1;

# Check route_stops has sequence column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'route_stops';
```

### 3. TEST FLOW

```
1. Create Order → Verify stok berkurang
2. Create Route & Assign Driver → Verify driver dapat notifikasi
3. Get Delivery Routes → Verify list routes keluar dengan benar (no PGRST204)
```

---

## TRIGGER LOGIC EXPLANATION

### manage_inventory() Trigger

```sql
ON INSERT → stock -= quantity, reserved_stock += quantity
ON DELETE → stock += quantity, reserved_stock -= quantity
ON UPDATE → stock -= (new_qty - old_qty), reserved_stock += (new_qty - old_qty)
```

**Contoh:**

- Order 10 produk → stock: 100 → 90, reserved: 0 → 10
- Cancel order → stock: 90 → 100, reserved: 10 → 0
- Update quantity 10 → 15 → stock: 90 → 85, reserved: 10 → 15

---

## FOLLOW-UP TASKS

- [ ] Test order creation dengan berbagai quantity
- [ ] Verify inventory berkurang di products table
- [ ] Test route creation dan driver notification
- [ ] Test route list tidak error PGRST204
- [ ] Monitor logs untuk notification failures
- [ ] Add email/SMS notification ke driver (optional future enhancement)

---

## KONTAK & DEBUG

Jika masih ada error:

1. Check Supabase logs untuk trigger errors
2. Verify order_items insert permissions
3. Check driver_notifications RLS policies
4. Monitor browser console untuk API errors
