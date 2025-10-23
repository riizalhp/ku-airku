# 🚀 Panduan Migrasi Database - Sistem Kapasitas

## 📋 Prerequisites

- MySQL/MariaDB sudah terinstall
- Database `amdk_airku_db` sudah ada
- Akses ke terminal/command prompt
- User database dengan privilege CREATE, ALTER, UPDATE

## 🔧 Langkah-Langkah Migrasi

### 1. Backup Database (PENTING!)

Sebelum melakukan migrasi, selalu backup database Anda:

```bash
# Windows (PowerShell)
mysqldump -u root -p amdk_airku_db > backup_amdk_airku_db_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Atau di Command Prompt
mysqldump -u root -p amdk_airku_db > backup_amdk_airku_db_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### 2. Jalankan Migration

Ada 2 cara untuk menjalankan migration:

#### Opsi A: Via Command Line (Recommended)

```bash
# Masuk ke directory migrations
cd d:\ku-airku\amdk-airku-backend\migrations

# Jalankan migration
mysql -u root -p amdk_airku_db < add_capacity_conversion.sql

# Masukkan password MySQL Anda ketika diminta
```

#### Opsi B: Via MySQL Workbench atau phpMyAdmin

1. Buka file `add_capacity_conversion.sql`
2. Copy seluruh isinya
3. Paste di MySQL Workbench/phpMyAdmin query editor
4. Execute/Run query

### 3. Verifikasi Migration

Setelah migration berhasil, verifikasi dengan query berikut:

```sql
-- Cek struktur tabel products
DESCRIBE products;

-- Harusnya muncul kolom baru:
-- capacityConversionHeterogeneous | decimal(5,2) | NO | | 1.00

-- Cek index yang baru dibuat
SHOW INDEX FROM products WHERE Key_name = 'idx_products_capacity';

-- Cek data existing products
SELECT
    id,
    sku,
    name,
    capacityUnit,
    capacityConversionHeterogeneous
FROM products;
```

### 4. Update Data Produk (Opsional)

Jika Anda sudah memiliki produk existing, update nilai `capacityConversionHeterogeneous` sesuai ukuran produk:

```sql
-- Contoh update untuk berbagai ukuran produk

-- Produk 19L (baseline)
UPDATE products
SET capacityConversionHeterogeneous = 1.0
WHERE name LIKE '%19L%' OR name LIKE '%19 L%';

-- Produk 240ml
UPDATE products
SET capacityConversionHeterogeneous = 1.0
WHERE name LIKE '%240%ml%';

-- Produk 600ml
UPDATE products
SET capacityConversionHeterogeneous = 2.0
WHERE name LIKE '%600%ml%';

-- Produk 120ml
UPDATE products
SET capacityConversionHeterogeneous = 0.5
WHERE name LIKE '%120%ml%';

-- Produk 330ml (botol kecil)
UPDATE products
SET capacityConversionHeterogeneous = 0.8
WHERE name LIKE '%330%ml%';

-- Cek hasil update
SELECT sku, name, capacityUnit, capacityConversionHeterogeneous
FROM products
ORDER BY capacityConversionHeterogeneous DESC;
```

## 🧪 Testing

Setelah migration, test sistem dengan:

### 1. Test API Endpoint

```bash
# Test capacity recommendation (butuh token auth)
curl -X GET "http://localhost:5000/api/products/capacity-recommendation?productName=240ml" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
{
  "productName": "240ml",
  "recommendation": {
    "capacityUnit": 1.0,
    "capacityConversionHeterogeneous": 1.0,
    "explanation": "...",
    "sizeInLiter": 0.24
  },
  "guide": {...}
}
```

### 2. Test Product Creation

```bash
# Create product dengan auto-calculation
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "G-240",
    "name": "Air Mineral 240ml",
    "price": 15000,
    "stock": 1000
  }'

# System akan otomatis menghitung capacityConversionHeterogeneous
```

### 3. Test Order Validation

```bash
# Validate single order capacity
curl -X POST "http://localhost:5000/api/orders/validate-capacity" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "vehicleId": "YOUR_VEHICLE_ID"
  }'
```

## 🔄 Rollback (Jika Diperlukan)

Jika terjadi masalah dan perlu rollback:

```sql
-- Hapus index
DROP INDEX idx_products_capacity ON products;

-- Hapus kolom
ALTER TABLE products DROP COLUMN capacityConversionHeterogeneous;

-- Atau restore dari backup
-- mysql -u root -p amdk_airku_db < backup_amdk_airku_db_XXXXXX.sql
```

## ⚠️ Troubleshooting

### Error: Column already exists

Jika kolom sudah ada:

```sql
-- Cek apakah kolom sudah ada
SHOW COLUMNS FROM products LIKE 'capacityConversionHeterogeneous';

-- Jika ada, skip migration atau ubah ke ALTER COLUMN
```

### Error: Access denied

Pastikan user MySQL Anda punya privilege:

```sql
GRANT ALL PRIVILEGES ON amdk_airku_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Table doesn't exist

Pastikan Anda di database yang benar:

```sql
USE amdk_airku_db;
SHOW TABLES;
```

## 📊 Expected Changes Summary

| Tabel         | Perubahan | Keterangan                                       |
| ------------- | --------- | ------------------------------------------------ |
| `products`    | +1 kolom  | `capacityConversionHeterogeneous`                |
| `products`    | +1 index  | `idx_products_capacity` untuk optimasi           |
| Data existing | Update    | Semua produk existing mendapat nilai default 1.0 |

## ✅ Checklist Post-Migration

- [ ] Backup database berhasil
- [ ] Migration script berhasil dijalankan
- [ ] Verifikasi kolom baru ada di tabel `products`
- [ ] Verifikasi index baru dibuat
- [ ] Data existing products ter-update
- [ ] Test API endpoint berfungsi
- [ ] Test create product dengan auto-calculation
- [ ] Test order capacity validation
- [ ] Backend server berjalan tanpa error
- [ ] Log tidak ada error terkait database schema

## 📞 Support

Jika mengalami masalah saat migration, hubungi:

- Database Admin
- Backend Developer Team
- Check logs di: `amdk-airku-backend/logs/` (jika ada)

---

**Migration Version:** 1.0  
**Date:** 23 Oktober 2025  
**Author:** System Admin
