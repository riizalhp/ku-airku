# Deteksi Wilayah DIY (Yogyakarta) - Update Algoritma

## 📍 Overview

Sistem deteksi wilayah telah diupgrade untuk mendeteksi seluruh wilayah DIY (Daerah Istimewa Yogyakarta), bukan hanya Kulon Progo.

## 🗺️ Wilayah yang Terdeteksi

### 1. **Kabupaten Kulon Progo**

- **Sub-wilayah:** Timur dan Barat
- **Pembagi:** Garis bujur PDAM Tirta Binangun (110.1486773)
- **Bounding Box:** lat -8.00 to -7.67, lng 110.00 to 110.30
- **Hasil Deteksi:**
  - `Kulon Progo - Timur` (longitude > 110.1486773)
  - `Kulon Progo - Barat` (longitude ≤ 110.1486773)

### 2. **Kabupaten Bantul**

- **Lokasi:** Bagian selatan DIY
- **Bounding Box:** lat -8.20 to -7.75, lng 110.20 to 110.50
- **Hasil Deteksi:** `Bantul`

### 3. **Kota Yogyakarta**

- **Lokasi:** Pusat kota DIY
- **Bounding Box:** lat -7.85 to -7.74, lng 110.35 to 110.43
- **Hasil Deteksi:** `Kota Yogyakarta`

### 4. **Kabupaten Sleman**

- **Lokasi:** Bagian utara DIY
- **Bounding Box:** lat -7.80 to -7.50, lng 110.25 to 110.60
- **Hasil Deteksi:** `Sleman`

### 5. **Kabupaten Gunung Kidul**

- **Lokasi:** Bagian timur DIY
- **Bounding Box:** lat -8.20 to -7.60, lng 110.40 to 110.90
- **Hasil Deteksi:** `Gunung Kidul`

### 6. **Luar DIY**

- **Bounding Box DIY:** lat -8.20 to -7.50, lng 110.00 to 110.90
- **Hasil Deteksi:** `Bukan di DIY`

## 🔧 Implementasi Teknis

### Backend (`geminiService.js`)

#### 1. Fungsi Fallback (Tanpa AI)

```javascript
function fallbackClassifyStoreRegion(storeLocation) {
  const { lat, lng } = storeLocation;

  // Cek bounding box DIY
  if (lat < -8.2 || lat > -7.5 || lng < 110.0 || lng > 110.9) {
    return { region: "Bukan di DIY" };
  }

  // Klasifikasi per kabupaten/kota
  // ... (lihat kode lengkap di geminiService.js)
}
```

#### 2. Fungsi AI-Powered (Menggunakan Gemini)

```javascript
async function classifyStoreRegion(storeLocation) {
  // Prompt AI dengan informasi 5 kabupaten/kota DIY
  // Fallback ke fungsi manual jika AI gagal
}
```

### Frontend (`StoreManagement.tsx`)

#### 1. Filter Dropdown - Updated

Menambahkan pilihan filter untuk semua wilayah:

- Kulon Progo - Timur
- Kulon Progo - Barat
- Bantul
- Kota Yogyakarta
- Sleman
- Gunung Kidul
- Bukan di DIY

#### 2. UI Feedback - Enhanced

```tsx
// Warna coding untuk setiap wilayah
- Bukan di DIY: bg-yellow-100 (warning)
- Kulon Progo: bg-blue-100 (primary area)
- Lainnya: bg-gray-100 (normal)
```

#### 3. Info Card - Comprehensive

Menampilkan informasi lengkap tentang 5 wilayah DIY dengan penjelasan klasifikasi.

## 📊 Contoh Hasil Deteksi

| Koordinat               | Wilayah Terdeteksi  |
| ----------------------- | ------------------- |
| -7.8664161, 110.1486773 | Kulon Progo - Timur |
| -7.8700000, 110.1400000 | Kulon Progo - Barat |
| -7.9000000, 110.3500000 | Bantul              |
| -7.7970000, 110.3700000 | Kota Yogyakarta     |
| -7.7000000, 110.4000000 | Sleman              |
| -7.9500000, 110.6000000 | Gunung Kidul        |
| -6.9000000, 107.6000000 | Bukan di DIY        |

## ✨ Fitur Baru

### 1. **Dual Classification System**

- **Primary:** AI-powered (Gemini 2.5 Flash)
- **Fallback:** Rule-based dengan bounding box

### 2. **Smart Validation**

- Lokasi tetap bisa disimpan meskipun "Bukan di DIY"
- Warning visual (kuning) untuk lokasi di luar DIY
- Success feedback (hijau) untuk lokasi valid

### 3. **Enhanced Filtering**

- Filter berdasarkan kabupaten/kota spesifik
- Pencarian tetap berfungsi normal
- Filter status mitra tetap tersedia

## 🚀 Cara Menggunakan

### Menambah Toko Baru:

1. Klik tombol **"Tambah Toko"**
2. Isi informasi toko (nama, pemilik, alamat, dll)
3. **Paste link Google Maps** di field yang disediakan
4. Klik **"Deteksi Wilayah"**
5. Sistem akan otomatis mendeteksi wilayah berdasarkan koordinat
6. Hasil deteksi muncul di field "Wilayah" dengan warna:
   - **Biru:** Kulon Progo (area utama)
   - **Abu-abu:** Kabupaten/kota lain di DIY
   - **Kuning:** Di luar DIY (tetap bisa disimpan)
7. Lengkapi data lain dan klik **"Tambah Toko"**

### Filter Toko Berdasarkan Wilayah:

1. Gunakan dropdown **"Wilayah"** di bagian pencarian
2. Pilih wilayah spesifik yang ingin ditampilkan
3. Tabel akan otomatis filter sesuai pilihan

## 🔄 Migrasi dari Sistem Lama

### Perubahan Label:

- `Timur` → `Kulon Progo - Timur`
- `Barat` → `Kulon Progo - Barat`
- `Bukan di Kulon Progo` → `Bukan di DIY` (atau nama kabupaten jika dalam DIY)

### Database:

Tidak perlu migrasi database. Field `region` sudah mendukung string dinamis.

### Backward Compatibility:

✅ Data lama dengan label "Timur"/"Barat" tetap valid  
✅ Filter masih berfungsi untuk label lama  
⚠️ Rekomendasi: Update data lama secara manual atau bulk update

## 🛠️ Troubleshooting

### AI Service Error

Jika Gemini API gagal, sistem otomatis menggunakan fallback mechanism berbasis bounding box.

### Koordinat Tidak Terdeteksi

- Pastikan link Google Maps valid
- Cek format koordinat (latitude, longitude)
- Jika masih gagal, gunakan koordinat manual

### Wilayah Salah Terdeteksi

Bounding box adalah perkiraan kasar. Untuk akurasi tinggi, gunakan:

- Reverse geocoding API
- Administrative boundary data
- Manual correction

## 📝 Update History

**Version 2.0** (Oktober 2025)

- ✅ Deteksi seluruh wilayah DIY (5 kabupaten/kota)
- ✅ Sub-klasifikasi Kulon Progo (Timur/Barat)
- ✅ AI-powered classification dengan Gemini
- ✅ Fallback mechanism rule-based
- ✅ Enhanced UI dengan color coding
- ✅ Comprehensive filtering options

**Version 1.0** (Sebelumnya)

- Hanya deteksi Kulon Progo (Timur/Barat)
- Blocking untuk lokasi di luar Kulon Progo

## 🎯 Roadmap

- [ ] Integrasi dengan Google Geocoding API untuk akurasi lebih tinggi
- [ ] Deteksi kecamatan/desa di setiap kabupaten
- [ ] Export/import data toko dengan wilayah
- [ ] Visualisasi peta dengan color-coded regions
- [ ] Analitik berdasarkan distribusi wilayah

---

**Dibuat:** 27 Oktober 2025  
**Developer:** KU AIRKU Dev Team  
**Status:** ✅ Production Ready
