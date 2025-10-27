# Test Koordinat Wilayah DIY

## 🎯 Tujuan Testing

Memverifikasi akurasi deteksi wilayah untuk 5 kabupaten/kota di DIY dengan menggunakan koordinat landmark terkenal.

---

## 📍 1. KOTA YOGYAKARTA (Central City)

**Karakteristik:** Area terkecil (~32.5 km²), pusat kota bersejarah  
**Bounding Box (UPDATED v2.2):** lat **-7.825 to -7.775**, lng 110.345 to 110.425  
**Perubahan:** Batas utara disesuaikan dari -7.745 ke **-7.775** agar tidak termasuk Depok

### Test Cases:

| No  | Lokasi                   | Latitude | Longitude | Expected Result    |
| --- | ------------------------ | -------- | --------- | ------------------ |
| 1   | Malioboro                | -7.7956  | 110.3695  | ✅ Kota Yogyakarta |
| 2   | Alun-alun Utara (Kraton) | -7.7983  | 110.3642  | ✅ Kota Yogyakarta |
| 3   | Tugu Jogja               | -7.7828  | 110.3668  | ✅ Kota Yogyakarta |
| 4   | Stasiun Tugu             | -7.7891  | 110.3636  | ✅ Kota Yogyakarta |
| 5   | Pakualaman               | -7.8050  | 110.3700  | ✅ Kota Yogyakarta |

### Link Google Maps untuk Testing:

```
https://www.google.com/maps?q=-7.7956,110.3695 (Malioboro)
https://www.google.com/maps?q=-7.7983,110.3642 (Alun-alun Utara)
https://www.google.com/maps?q=-7.7828,110.3668 (Tugu Jogja)
```

---

## 📍 2. SLEMAN (Northern DIY)

**Karakteristik:** Bagian utara DIY (~574.82 km²), sampai lereng Merapi  
**Bounding Box:** lat -7.80 to -7.50, lng 110.25 to 110.60  
**INCLUDES:** Depok, Caturtunggal, UGM area (lat < -7.775)

### Test Cases:

| No  | Lokasi                          | Latitude | Longitude | Expected Result |
| --- | ------------------------------- | -------- | --------- | --------------- |
| 1   | UGM (Universitas Gadjah Mada)   | -7.7710  | 110.3775  | ✅ Sleman       |
| 2   | Depok Sleman                    | -7.7630  | 110.3974  | ✅ Sleman       |
| 3   | Caturtunggal                    | -7.7555  | 110.3973  | ✅ Sleman       |
| 4   | Condongcatur                    | -7.7555  | 110.3973  | ✅ Sleman       |
| 5   | Kaliurang                       | -7.5953  | 110.4345  | ✅ Sleman       |
| 6   | Monjali (Monumen Jogja Kembali) | -7.7491  | 110.3703  | ✅ Sleman       |
| 7   | Terminal Jombor                 | -7.7478  | 110.3728  | ✅ Sleman       |
| 8   | Pasar Sleman                    | -7.7155  | 110.3544  | ✅ Sleman       |

### Link Google Maps untuk Testing:

```
https://www.google.com/maps?q=-7.7710,110.3775 (UGM)
https://www.google.com/maps?q=-7.5953,110.4345 (Kaliurang)
https://www.google.com/maps?q=-7.7491,110.3703 (Monjali)
```

---

## 📍 3. BANTUL (Southern DIY)

**Karakteristik:** Bagian selatan DIY (~506.85 km²), sampai Laut Selatan  
**Bounding Box:** lat -8.20 to -7.825, lng 110.20 to 110.50

### Test Cases:

| No  | Lokasi               | Latitude | Longitude | Expected Result |
| --- | -------------------- | -------- | --------- | --------------- |
| 1   | Alun-alun Bantul     | -7.8878  | 110.3289  | ✅ Bantul       |
| 2   | Parangtritis Beach   | -8.0228  | 110.3290  | ✅ Bantul       |
| 3   | Imogiri (Makam Raja) | -7.9302  | 110.3969  | ✅ Bantul       |
| 4   | Piyungan             | -7.8616  | 110.4347  | ✅ Bantul       |
| 5   | Srandakan            | -7.9399  | 110.2680  | ✅ Bantul       |

### Link Google Maps untuk Testing:

```
https://www.google.com/maps?q=-7.8878,110.3289 (Alun-alun Bantul)
https://www.google.com/maps?q=-8.0228,110.3290 (Parangtritis)
https://www.google.com/maps?q=-7.9302,110.3969 (Imogiri)
```

---

## 📍 4. KULON PROGO (Western DIY)

**Karakteristik:** Bagian barat DIY (~586.27 km²), ada Bandara YIA  
**Bounding Box:** lat -8.00 to -7.67, lng 110.00 to 110.30  
**Sub-region:** Timur/Barat dibagi oleh lng 110.1486773 (PDAM)

### Test Cases - TIMUR:

| No  | Lokasi              | Latitude   | Longitude   | Expected Result        |
| --- | ------------------- | ---------- | ----------- | ---------------------- |
| 1   | PDAM Tirta Binangun | -7.8664161 | 110.1486773 | ✅ Kulon Progo - Timur |
| 2   | Wates (Ibukota)     | -7.8564    | 110.1599    | ✅ Kulon Progo - Timur |
| 3   | Terminal Wates      | -7.8572    | 110.1644    | ✅ Kulon Progo - Timur |

### Test Cases - BARAT:

| No  | Lokasi        | Latitude | Longitude | Expected Result        |
| --- | ------------- | -------- | --------- | ---------------------- |
| 1   | Bandara YIA   | -7.9000  | 110.0561  | ✅ Kulon Progo - Barat |
| 2   | Pantai Glagah | -7.8826  | 110.0389  | ✅ Kulon Progo - Barat |
| 3   | Temon         | -7.8553  | 110.0878  | ✅ Kulon Progo - Barat |

### Link Google Maps untuk Testing:

```
https://www.google.com/maps?q=-7.8664161,110.1486773 (PDAM - Timur)
https://www.google.com/maps?q=-7.8564,110.1599 (Wates - Timur)
https://www.google.com/maps?q=-7.9000,110.0561 (YIA - Barat)
```

---

## 📍 5. GUNUNG KIDUL (Eastern DIY)

**Karakteristik:** Bagian timur DIY, terluas (~1,485.36 km²), area karst  
**Bounding Box:** lat -8.20 to -7.60, lng 110.45 to 110.90

### Test Cases:

| No  | Lokasi             | Latitude | Longitude | Expected Result |
| --- | ------------------ | -------- | --------- | --------------- |
| 1   | Wonosari (Ibukota) | -7.9655  | 110.6027  | ✅ Gunung Kidul |
| 2   | Pantai Baron       | -8.1245  | 110.5614  | ✅ Gunung Kidul |
| 3   | Pantai Indrayanti  | -8.1492  | 110.6214  | ✅ Gunung Kidul |
| 4   | Alun-alun Wonosari | -7.9656  | 110.6029  | ✅ Gunung Kidul |
| 5   | Playen             | -7.8669  | 110.5347  | ✅ Gunung Kidul |

### Link Google Maps untuk Testing:

```
https://www.google.com/maps?q=-7.9655,110.6027 (Wonosari)
https://www.google.com/maps?q=-8.1245,110.5614 (Baron Beach)
https://www.google.com/maps?q=-8.1492,110.6214 (Indrayanti)
```

---

## 🧪 Test Cases - Perbatasan (Border Cases)

### Perbatasan Kota Yogya - Sleman:

| No  | Lokasi                  | Latitude | Longitude | Expected               | Notes               |
| --- | ----------------------- | -------- | --------- | ---------------------- | ------------------- |
| 1   | Ringroad Utara (border) | -7.7500  | 110.3800  | Sleman atau Kota Yogya | Tepat di perbatasan |
| 2   | Condongcatur            | -7.7555  | 110.3973  | Sleman                 | Sedikit di utara    |

### Perbatasan Kota Yogya - Bantul:

| No  | Lokasi            | Latitude | Longitude | Expected               | Notes               |
| --- | ----------------- | -------- | --------- | ---------------------- | ------------------- |
| 1   | Jl. Imogiri Timur | -7.8250  | 110.3900  | Bantul atau Kota Yogya | Tepat di perbatasan |
| 2   | Giwangan          | -7.8290  | 110.3950  | Bantul                 | Sedikit di selatan  |

---

## 📊 Hasil Testing

### Checklist Verifikasi:

- [ ] Kota Yogyakarta terdeteksi benar (5/5)
- [ ] Sleman terdeteksi benar (5/5)
- [ ] Bantul terdeteksi benar (5/5)
- [ ] Kulon Progo - Timur terdeteksi benar (3/3)
- [ ] Kulon Progo - Barat terdeteksi benar (3/3)
- [ ] Gunung Kidul terdeteksi benar (5/5)

### Known Issues:

- Area perbatasan antar wilayah mungkin masih ambigu
- Bounding box adalah perkiraan, bukan batas administratif resmi
- Untuk akurasi 100%, gunakan shapefile/GeoJSON batas wilayah resmi

---

## 🔧 Cara Testing Manual

1. **Buka aplikasi** → Login sebagai Admin
2. **Klik Management Toko** → Tambah Toko
3. **Copy link Google Maps** dari tabel di atas
4. **Paste di field link** → Klik "Deteksi Wilayah"
5. **Verifikasi hasil** sesuai dengan "Expected Result"

### Contoh Format Link Google Maps:

```
https://www.google.com/maps?q=-7.7956,110.3695
https://www.google.com/maps/place/-7.7956,110.3695
https://maps.google.com/?q=-7.7956,110.3695
```

---

## 🎯 Kriteria Sukses

| Kriteria             | Target | Status     |
| -------------------- | ------ | ---------- |
| Akurasi Kota Yogya   | > 95%  | ⏳ Testing |
| Akurasi Sleman       | > 90%  | ⏳ Testing |
| Akurasi Bantul       | > 90%  | ⏳ Testing |
| Akurasi Kulon Progo  | > 95%  | ⏳ Testing |
| Akurasi Gunung Kidul | > 90%  | ⏳ Testing |
| False Positive Rate  | < 5%   | ⏳ Testing |

---

## 📈 Update Log

**27 Oktober 2025 - v2.2:** 🆕

- ✅ **CRITICAL FIX:** Perbaikan batas Kota Yogya-Sleman
- ✅ Kota Yogyakarta batas utara: -7.745 → **-7.775** (TIDAK termasuk Depok)
- ✅ Sleman sekarang INCLUDES: Depok, Caturtunggal, UGM area (lat < -7.775)
- ✅ Update AI prompt dengan penjelasan eksplisit area Depok = Sleman
- ✅ Tambah 3 test cases Depok/Caturtunggal di dokumentasi
- ✅ Fallback mechanism tetap aktif saat Gemini API rate limit

**27 Oktober 2025 - v2.1:**

- ✅ Perbaikan urutan pengecekan (Kota Yogya prioritas pertama)
- ✅ Refinement bounding box Kota Yogyakarta (lat -7.825 to -7.745)
- ✅ Refinement bounding box Bantul (lat -7.825 to -8.20)
- ✅ Refinement bounding box Gunung Kidul (lng 110.45 mulai)
- ✅ Update AI prompt dengan landmark dan karakteristik spesifik
- ✅ Dokumentasi testing dengan 26 koordinat referensi

**27 Oktober 2025 - v2.0:**

- Implementasi deteksi seluruh wilayah DIY
- Deteksi 5 kabupaten/kota

---

**Catatan Penting:**  
Koordinat di atas adalah landmark terkenal yang sudah terverifikasi. Gunakan sebagai baseline untuk testing akurasi sistem deteksi wilayah.
