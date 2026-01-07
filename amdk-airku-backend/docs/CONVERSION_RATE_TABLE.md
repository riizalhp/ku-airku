# 📊 Tabel Conversion Rate Kapasitas Produk

## 🎯 Conversion Rate Standar

Berikut adalah conversion rate yang sudah ditentukan untuk setiap ukuran produk:

| Ukuran Produk | Conversion Rate | Keterangan           |
| ------------- | --------------- | -------------------- |
| **120 ml**    | 0.57            | Botol kecil          |
| **240 ml**    | 1.00            | **Baseline/Standar** |
| **330 ml**    | 1.00            | Botol sedang         |
| **600 ml**    | 1.60            | Botol besar          |
| **19 L**      | 3.30            | Galon besar          |

---

## 🧮 Cara Perhitungan Kapasitas Armada

### Formula:

```
Kapasitas Tersedia = Kapasitas Armada ÷ Conversion Rate
```

### Contoh: Armada dengan Kapasitas 200 Unit

| Produk | Conversion | Perhitungan | Kapasitas Max   |
| ------ | ---------- | ----------- | --------------- |
| 120ml  | 0.57       | 200 ÷ 0.57  | **≈ 351 botol** |
| 240ml  | 1.00       | 200 ÷ 1.00  | **200 botol**   |
| 330ml  | 1.00       | 200 ÷ 1.00  | **200 botol**   |
| 600ml  | 1.60       | 200 ÷ 1.60  | **125 botol**   |
| 19L    | 3.30       | 200 ÷ 3.30  | **≈ 61 galon**  |

---

## 🚛 Contoh Skenario Pengiriman

### Skenario 1: Produk Homogen (1 jenis)

**Armada:** Lecy (Kapasitas 200)  
**Produk:** Hanya 240ml

**Perhitungan:**

- Conversion Rate: 1.00 (homogen selalu 1.0)
- Max unit: 200 ÷ 1.00 = **200 botol** ✅

---

### Skenario 2: Produk Heterogen (Mix)

**Armada:** Lecy (Kapasitas 200)  
**Produk:**

- 100 botol 240ml (conversion 1.0)
- 50 botol 600ml (conversion 1.6)

**Perhitungan:**

```
Kapasitas 240ml: 100 × 1.0 = 100
Kapasitas 600ml: 50 × 1.6 = 80
─────────────────────────────────
Total Kapasitas: 180
Sisa: 200 - 180 = 20 ✅
```

---

### Skenario 3: Kombinasi Berbagai Ukuran

**Armada:** Lecy (Kapasitas 200)  
**Produk:**

- 50 botol 120ml (conversion 0.57)
- 80 botol 240ml (conversion 1.0)
- 30 botol 330ml (conversion 1.0)

**Perhitungan:**

```
Kapasitas 120ml: 50 × 0.57 = 28.5
Kapasitas 240ml: 80 × 1.0 = 80
Kapasitas 330ml: 30 × 1.0 = 30
──────────────────────────────────
Total Kapasitas: 138.5
Sisa: 200 - 138.5 = 61.5 ✅
```

---

### Skenario 4: Galon Besar

**Armada:** Lecy (Kapasitas 200)  
**Produk:** 19L Galon

**Perhitungan:**

```
Max galon: 200 ÷ 3.3 = 60.6 galon
Atau maksimal 60 galon ✅
```

---

## 🎨 Contoh di UI

### Form Input Produk:

```
┌──────────────────────────────────────┐
│ Nama Produk: [Air Mineral 600ml   ] │
│                                      │
│ ✅ Auto-Detected:                    │
│    Volume: 600ml                     │
│    Conversion Rate: 1.6              │
│                                      │
│ 📊 Preview Kapasitas:                │
│    Armada 200 dapat angkut:         │
│    • Homogen: 200 botol              │
│    • Heterogen: 125 botol            │
└──────────────────────────────────────┘
```

### Validasi Order:

```
┌──────────────────────────────────────┐
│ 📦 Validasi Kapasitas                │
│ Armada: Lecy (Kapasitas 200)        │
│                                      │
│ Order Items:                         │
│ • 100x 240ml → 100.0 kapasitas      │
│ • 50x 600ml → 80.0 kapasitas        │
│ ────────────────────────────────    │
│ Total: 180.0 / 200                   │
│                                      │
│ [████████████████████░░] 90%         │
│                                      │
│ ✅ DAPAT DIMUAT                      │
│ Sisa kapasitas: 20 unit              │
└──────────────────────────────────────┘
```

---

## 📝 Catatan Penting

### 1. **Produk Homogen vs Heterogen**

- **Homogen** (1 jenis produk): Conversion selalu **1.0**
- **Heterogen** (mix produk): Gunakan conversion rate sesuai tabel

### 2. **Kapasitas Armada Otomatis Menyesuaikan**

Sistem akan otomatis menghitung berdasarkan:

- Kapasitas armada yang dipilih
- Conversion rate produk
- Jumlah unit yang dipesan

### 3. **Update Conversion Rate**

Jika ada perubahan conversion rate:

1. Update di database tabel `products`
2. Update di file `capacityCalculator.js`
3. Restart backend

### 4. **Produk Baru**

Untuk produk dengan ukuran baru (selain 5 standar di atas):

- Sistem akan hitung otomatis berdasarkan proporsi ke 240ml
- Atau admin bisa input manual di form

---

## 🧪 Test Cases

### Test 1: Single Product

```sql
-- Insert order 100 botol 240ml di armada kapasitas 200
-- Expected: ✅ Muat, sisa 100
```

### Test 2: Mix Products

```sql
-- Insert order:
-- 80 botol 240ml (80 × 1.0 = 80)
-- 50 botol 600ml (50 × 1.6 = 80)
-- Total: 160
-- Expected: ✅ Muat, sisa 40
```

### Test 3: Overload

```sql
-- Insert order:
-- 150 botol 600ml (150 × 1.6 = 240)
-- Total: 240
-- Expected: ❌ Tidak muat, kelebihan 40
```

---

## 📞 FAQ

**Q: Kenapa 240ml dan 330ml sama-sama 1.0?**  
A: Karena kedua ukuran ini dianggap standar untuk kemudahan distribusi.

**Q: Bisa ubah conversion rate?**  
A: Ya, update di database dan restart backend.

**Q: Bagaimana jika ada produk 500ml?**  
A: Sistem akan auto-calculate: 500 ÷ 240 ≈ 2.08

**Q: Kapasitas armada bisa berbeda-beda?**  
A: Ya, setiap armada punya kapasitas sendiri di tabel `vehicles`.

---

**Last Updated:** 23 Oktober 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
