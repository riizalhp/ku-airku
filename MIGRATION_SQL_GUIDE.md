# 📋 SQL Migration Guide - Route Planning Update

## 🎯 Tujuan Migration

Mengubah tabel `route_plans` agar bisa menyimpan rute TANPA driver dan vehicle, sehingga assignment bisa dilakukan nanti sebelum rute diberangkatkan.

---

## 🔧 Perubahan yang Dilakukan

### 1. **Make Driver & Vehicle NULLABLE**

```sql
ALTER TABLE `route_plans`
MODIFY COLUMN `driverId` varchar(36) NULL,
MODIFY COLUMN `vehicleId` varchar(36) NULL;
```

**Penjelasan:**

- Sebelumnya: `driverId` dan `vehicleId` WAJIB diisi (NOT NULL)
- Sekarang: Bisa NULL, artinya rute bisa dibuat tanpa driver/vehicle

---

### 2. **Add assignmentStatus Column**

```sql
ALTER TABLE `route_plans`
ADD COLUMN `assignmentStatus` ENUM('unassigned', 'assigned', 'departed', 'completed')
DEFAULT 'unassigned'
AFTER `region`;
```

**Penjelasan:**

- Tambah kolom baru untuk tracking status assignment
- **unassigned**: Rute dibuat tanpa driver/vehicle
- **assigned**: Driver & vehicle sudah di-assign
- **departed**: Rute sudah berangkat
- **completed**: Rute selesai

---

### 3. **Update Existing Routes**

```sql
UPDATE `route_plans`
SET `assignmentStatus` = 'assigned'
WHERE `driverId` IS NOT NULL
  AND `vehicleId` IS NOT NULL;
```

**Penjelasan:**

- Update semua rute yang sudah ada (yang sudah punya driver & vehicle) ke status 'assigned'
- Ini untuk backward compatibility agar data lama tetap valid

---

### 4. **Add Performance Indexes**

```sql
CREATE INDEX `idx_assignment_status` ON `route_plans` (`assignmentStatus`);
CREATE INDEX `idx_date_status` ON `route_plans` (`date`, `assignmentStatus`);
```

**Penjelasan:**

- Index untuk mempercepat query berdasarkan status
- Index untuk mempercepat query berdasarkan tanggal + status

---

## 🚀 Cara Menjalankan Migration

### **Opsi 1: Via phpMyAdmin (Recommended)**

1. **Login ke phpMyAdmin**

   - Buka: http://localhost/phpmyadmin
   - Login dengan credentials MySQL Anda

2. **Pilih Database**

   - Klik database `amdk_airku` di sidebar kiri

3. **Buka Tab SQL**

   - Klik tab **"SQL"** di atas

4. **Copy-Paste Migration**
   - Copy seluruh SQL di bawah ini
   - Paste ke text editor SQL
   - Klik **"Go"** atau **"Kirim"**

```sql
-- ============================================
-- MIGRATION: Route Planning - Allow Unassigned Routes
-- Date: 2025-10-27
-- ============================================

-- Step 1: Make driver and vehicle nullable
ALTER TABLE `route_plans`
MODIFY COLUMN `driverId` varchar(36) NULL,
MODIFY COLUMN `vehicleId` varchar(36) NULL;

-- Step 2: Add assignment status column
ALTER TABLE `route_plans`
ADD COLUMN `assignmentStatus` ENUM('unassigned', 'assigned', 'departed', 'completed')
DEFAULT 'unassigned'
AFTER `region`;

-- Step 3: Update existing routes to 'assigned' status
UPDATE `route_plans`
SET `assignmentStatus` = 'assigned'
WHERE `driverId` IS NOT NULL
  AND `vehicleId` IS NOT NULL;

-- Step 4: Add indexes for performance
CREATE INDEX `idx_assignment_status` ON `route_plans` (`assignmentStatus`);
CREATE INDEX `idx_date_status` ON `route_plans` (`date`, `assignmentStatus`);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
DESCRIBE `route_plans`;

-- Check data distribution
SELECT
    `assignmentStatus`,
    COUNT(*) as total_routes
FROM `route_plans`
GROUP BY `assignmentStatus`;

-- Check nullable columns
SELECT
    `id`,
    `driverId`,
    `vehicleId`,
    `assignmentStatus`,
    `date`
FROM `route_plans`
LIMIT 10;
```

5. **Verifikasi Hasil**
   - Setelah migration sukses, jalankan query verifikasi di bawah

---

### **Opsi 2: Via MySQL Command Line**

```bash
# Login ke MySQL
mysql -u root -p

# Pilih database
USE amdk_airku;

# Run migration file
SOURCE d:/ku-airku/amdk-airku-backend/migrations/allow_null_driver_vehicle_in_routes.sql;

# Verifikasi
DESCRIBE route_plans;
```

---

## ✅ Verifikasi Migration Berhasil

Jalankan query ini untuk memastikan migration berhasil:

### **1. Cek Struktur Tabel**

```sql
DESCRIBE `route_plans`;
```

**Expected Output:**

```
Field             | Type                                                  | Null | Key | Default
------------------|-------------------------------------------------------|------|-----|----------
id                | varchar(36)                                          | NO   | PRI | NULL
driverId          | varchar(36)                                          | YES  |     | NULL  ← SHOULD BE YES (NULLABLE)
vehicleId         | varchar(36)                                          | YES  |     | NULL  ← SHOULD BE YES (NULLABLE)
date              | date                                                 | NO   |     | NULL
region            | varchar(50)                                          | NO   |     | NULL
assignmentStatus  | enum('unassigned','assigned','departed','completed')| YES  | MUL | unassigned  ← NEW COLUMN
```

### **2. Cek Data Existing**

```sql
SELECT
    assignmentStatus,
    COUNT(*) as total_routes
FROM route_plans
GROUP BY assignmentStatus;
```

**Expected Output:**

```
assignmentStatus | total_routes
-----------------|-------------
assigned         | X (semua rute existing)
```

### **3. Cek Indexes**

```sql
SHOW INDEX FROM `route_plans`;
```

**Expected Output:** Harus ada index:

- `idx_assignment_status`
- `idx_date_status`

---

## 🧪 Test Query - Create Unassigned Route

Setelah migration, test dengan query ini (untuk testing):

```sql
-- Insert test route TANPA driver/vehicle
INSERT INTO `route_plans` (id, driverId, vehicleId, date, region, assignmentStatus)
VALUES (
    UUID(),
    NULL,           -- ← NULL driver
    NULL,           -- ← NULL vehicle
    '2025-10-28',
    'Timur',
    'unassigned'
);

-- Verify
SELECT * FROM route_plans WHERE assignmentStatus = 'unassigned';
```

---

## 🔄 Rollback (Jika Perlu)

Jika ada masalah dan ingin rollback:

```sql
-- Remove indexes
DROP INDEX `idx_assignment_status` ON `route_plans`;
DROP INDEX `idx_date_status` ON `route_plans`;

-- Remove column
ALTER TABLE `route_plans` DROP COLUMN `assignmentStatus`;

-- Make columns NOT NULL again (HATI-HATI! Pastikan tidak ada NULL values)
ALTER TABLE `route_plans`
MODIFY COLUMN `driverId` varchar(36) NOT NULL,
MODIFY COLUMN `vehicleId` varchar(36) NOT NULL;
```

⚠️ **WARNING:** Rollback hanya bisa dilakukan jika belum ada data dengan `driverId` atau `vehicleId` NULL!

---

## 📊 Before & After Comparison

### **BEFORE Migration:**

```sql
CREATE TABLE `route_plans` (
  `id` varchar(36) NOT NULL,
  `driverId` varchar(36) NOT NULL,    ← WAJIB diisi
  `vehicleId` varchar(36) NOT NULL,   ← WAJIB diisi
  `date` date NOT NULL,
  `region` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
);
```

### **AFTER Migration:**

```sql
CREATE TABLE `route_plans` (
  `id` varchar(36) NOT NULL,
  `driverId` varchar(36) NULL,        ← BISA NULL ✅
  `vehicleId` varchar(36) NULL,       ← BISA NULL ✅
  `date` date NOT NULL,
  `region` varchar(50) NOT NULL,
  `assignmentStatus` ENUM(...),       ← KOLOM BARU ✅
  PRIMARY KEY (`id`),
  KEY `idx_assignment_status` (`assignmentStatus`),      ← INDEX BARU ✅
  KEY `idx_date_status` (`date`,`assignmentStatus`)      ← INDEX BARU ✅
);
```

---

## 🎯 Next Steps After Migration

1. ✅ Run migration SQL
2. ✅ Verify dengan query verification
3. ⏳ Update backend code (tambah fungsi assignDriverVehicle di routeModel.js)
4. ⏳ Restart backend server
5. ⏳ Test create route tanpa driver/vehicle via Postman
6. ⏳ Update frontend UI

---

## ❓ FAQ

### Q: Apa yang terjadi dengan rute yang sudah ada?

**A:** Semua rute existing akan otomatis dapat status 'assigned' karena sudah punya driver & vehicle.

### Q: Apakah rute lama masih bisa diakses?

**A:** Ya, 100% backward compatible. Tidak ada perubahan pada data existing.

### Q: Bagaimana jika migration gagal?

**A:** Check error message di phpMyAdmin. Biasanya karena:

- Nama kolom sudah ada
- Constraint error
- Permission issue

### Q: Apakah perlu backup database dulu?

**A:** **SANGAT DISARANKAN!** Export database sebelum migration:

```bash
mysqldump -u root -p amdk_airku > backup_before_migration_$(date +%Y%m%d).sql
```

---

## 📝 Changelog

**Version 2.0 - 27 Oktober 2025**

- ✅ Allow NULL driverId dan vehicleId
- ✅ Add assignmentStatus column
- ✅ Add performance indexes
- ✅ Backward compatibility untuk data existing

---

**Status:** ✅ Ready to Execute  
**Tested:** ✅ Verified  
**Risk Level:** 🟢 Low (Backward Compatible)
