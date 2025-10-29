# Shipment-Based Load Management System - Migration Guide

## 🎯 Overview

Sistem telah direfactor dari **vehicle-centric** menjadi **shipment-centric** untuk load management yang lebih fleksibel.

## 📋 Perubahan Utama

### **BEFORE (Old System):**

```
1. Admin membuat rute di "Perencanaan Rute"
2. Pilih tanggal → Pilih armada & driver → Generate rute
3. Pesanan langsung ter-assign ke armada
```

### **AFTER (New System):**

```
1. Admin membuat "Muatan" di "Manajemen Muatan & Armada"
2. Tambah pesanan ke muatan dari "Manajemen Pesanan"
3. Assign driver & armada ke muatan → Auto-generate rute optimal
```

---

## 🗄️ **STEP 1: DATABASE MIGRATION**

### **Option A: Using Batch Script (Windows)**

```bash
cd amdk-airku-backend/migrations
.\run_shipments_migration.bat
```

**IMPORTANT:** Edit `run_shipments_migration.bat` jika database password Anda bukan kosong:

```batch
set DB_PASS=your_password_here
```

### **Option B: Manual via MySQL Workbench**

1. Buka MySQL Workbench
2. Connect ke database `amdk_airku_db`
3. File → Open SQL Script → Pilih `add_shipments_table.sql`
4. Execute (⚡ icon atau Ctrl+Shift+Enter)

### **Option C: Manual via Command Line**

```bash
mysql -u root -p amdk_airku_db < amdk-airku-backend/migrations/add_shipments_table.sql
```

---

## ✅ **STEP 2: VERIFY MIGRATION**

Jalankan query ini di MySQL:

```sql
-- Check if shipments table exists
SHOW TABLES LIKE 'shipments';

-- Check shipments table structure
DESCRIBE shipments;

-- Check if shipment_id column added to orders
DESCRIBE orders;

-- Should show: shipment_id column exists
```

Expected output:

```
+-------------+--------------+------+-----+---------+-------+
| Field       | Type         | Null | Key | Default | Extra |
+-------------+--------------+------+-----+---------+-------+
| id          | varchar(36)  | NO   | PRI | NULL    |       |
| name        | varchar(255) | NO   |     | NULL    |       |
| date        | date         | NO   |     | NULL    |       |
| status      | enum(...)    | YES  |     | unassigned |    |
| driver_id   | varchar(36)  | YES  | MUL | NULL    |       |
| vehicle_id  | varchar(36)  | YES  | MUL | NULL    |       |
| ...         | ...          | ...  | ... | ...     | ...   |
+-------------+--------------+------+-----+---------+-------+
```

---

## 🚀 **STEP 3: START BACKEND**

```bash
cd amdk-airku-backend
npm start
```

Verify backend started successfully:

```
Server is running on port 3001
Successfully connected to database.
```

---

## 🎨 **STEP 4: START FRONTEND**

```bash
cd amdk-airku-frontend
npm run dev
```

Access: http://localhost:5173

---

## 📖 **NEW WORKFLOW**

### **A. Membuat Muatan Baru**

1. Login sebagai Admin
2. Buka menu **"Manajemen Muatan & Armada"**
3. Klik **"Buat Muatan Baru"**
4. Isi nama (contoh: "Pengiriman Bantul 29 Okt") dan tanggal
5. Klik **"Buat Muatan"**

### **B. Menambah Pesanan ke Muatan**

1. Buka menu **"Manajemen Pesanan"**
2. Klik **"Tambah Pesanan"** atau edit pesanan existing
3. Pilih **"Muatan"** dari dropdown (akan muncul list muatan yang ada)
4. Isi detail pesanan lainnya
5. Simpan

**NOTE:** Pesanan hanya bisa ditambahkan ke muatan dengan status **"Belum Ditugaskan"**

### **C. Menugaskan Driver & Armada**

1. Kembali ke **"Manajemen Muatan & Armada"**
2. Pada card muatan yang sudah ada pesanan, klik **"Tugaskan"**
3. Pilih **Armada** (yang idle)
4. Pilih **Driver**
5. Klik **"Tugaskan & Buat Rute"**

**Result:**

- Status muatan berubah jadi **"Sudah Ditugaskan"**
- Rute optimal otomatis dibuat menggunakan Clarke-Wright Algorithm
- Pesanan berubah status dari **Pending** → **Routed**
- Armada status berubah dari **Idle** → **Delivering**

---

## 🔄 **ROLLBACK (Jika Ada Masalah)**

Jika perlu rollback migration:

```sql
-- Remove foreign keys first
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_shipment;
ALTER TABLE route_plans DROP FOREIGN KEY route_plans_ibfk_shipment;

-- Drop columns
ALTER TABLE orders DROP COLUMN shipment_id;
ALTER TABLE route_plans DROP COLUMN shipment_id;

-- Drop table
DROP TABLE IF EXISTS shipments;
```

---

## 🐛 **TROUBLESHOOTING**

### **Error: Can't connect to MySQL server**

- Pastikan MySQL service running
- Windows: Services → MySQL80 → Start
- Linux/Mac: `sudo systemctl start mysql`

### **Error: Table 'shipments' already exists**

- Migration sudah pernah dijalankan
- Skip atau jalankan rollback script terlebih dahulu

### **Error: Column 'shipment_id' doesn't exist**

- Migration belum dijalankan
- Jalankan migration script

### **Frontend Error: Cannot read properties of undefined**

- Backend belum running
- Pastikan backend di port 3001 sudah aktif

### **No shipments showing in Fleet Management**

- Belum ada muatan yang dibuat
- Klik "Buat Muatan Baru" terlebih dahulu

---

## 📊 **DATABASE SCHEMA**

### **New Table: shipments**

```sql
CREATE TABLE shipments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status ENUM('unassigned', 'assigned', 'departed', 'completed'),
    driver_id VARCHAR(36),
    vehicle_id VARCHAR(36),
    route_plan_id VARCHAR(36),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Updated Table: orders**

```sql
ALTER TABLE orders
ADD COLUMN shipment_id VARCHAR(36) NULL;
```

### **Updated Table: route_plans**

```sql
ALTER TABLE route_plans
ADD COLUMN shipment_id VARCHAR(36) NULL;
```

---

## 📝 **NOTES**

1. **Menu "Perencanaan Rute" dihapus** - Fungsinya digabung ke "Manajemen Muatan & Armada"
2. **Pesanan tidak lagi langsung ke armada** - Harus melalui muatan dulu
3. **Rute dibuat otomatis** saat muatan ditugaskan (tidak manual lagi)
4. **Satu muatan = Satu rute perjalanan** (untuk kesederhanaan)
5. **Muatan hanya bisa di-edit sebelum ditugaskan** (status = unassigned)

---

## ✅ **SUCCESS CRITERIA**

Migration berhasil jika:

- ✅ Table `shipments` ada di database
- ✅ Column `shipment_id` ada di table `orders` dan `route_plans`
- ✅ Backend bisa start tanpa error
- ✅ Frontend menu "Manajemen Muatan & Armada" bisa dibuka
- ✅ Bisa membuat muatan baru
- ✅ Bisa assign driver & armada ke muatan

---

**Dibuat:** 29 Oktober 2025  
**Developer:** KU AIRKU Dev Team  
**Status:** ✅ Ready for Testing
