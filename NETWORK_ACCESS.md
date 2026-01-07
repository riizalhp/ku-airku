# Panduan Akses Aplikasi dari Jaringan Lokal (WiFi)

Aplikasi AMDK Airku sudah dikonfigurasi untuk dapat diakses dari perangkat lain di jaringan WiFi yang sama.

## Cara Menjalankan

### 1. Jalankan Backend

```bash
cd amdk-airku-backend
npm run dev
```

Backend akan berjalan di `0.0.0.0:3001` dan dapat diakses dari jaringan lokal.

### 2. Jalankan Frontend

```bash
cd amdk-airku-frontend
npm run dev
```

Frontend akan berjalan di `0.0.0.0:5173` dan dapat diakses dari jaringan lokal.

## Cara Mengakses dari Perangkat Lain

### Langkah 1: Cari IP Address Komputer Host

**Windows (PowerShell):**

```powershell
ipconfig
```

Cari bagian "IPv4 Address" di adapter WiFi Anda (biasanya seperti `192.168.x.x` atau `10.0.x.x`)

**macOS/Linux:**

```bash
ifconfig
# atau
ip addr show
```

### Langkah 2: Akses dari Perangkat Lain

Misalkan IP address komputer host adalah `192.168.1.100`:

- **Frontend:** Buka browser dan akses `http://192.168.1.100:5173`
- **Backend API:** `http://192.168.1.100:3001`

Frontend akan otomatis mendeteksi dan menggunakan backend di IP yang sama.

## Konfigurasi Manual API URL (Opsional)

Jika perlu mengatur URL API secara manual:

1. Salin file `.env.example` menjadi `.env`:

   ```bash
   cd amdk-airku-frontend
   cp .env.example .env
   ```

2. Edit `.env` dan set `VITE_API_URL`:

   ```env
   VITE_API_URL=http://192.168.1.100:3001/api
   ```

3. Restart development server

## Troubleshooting

### Tidak Bisa Akses dari Perangkat Lain

1. **Firewall Windows**: Pastikan port 3001 dan 5173 diizinkan

   - Buka Windows Defender Firewall
   - Klik "Advanced settings"
   - Tambah "Inbound Rules" untuk port 3001 (TCP) dan 5173 (TCP)

2. **Perangkat Harus di WiFi yang Sama**: Pastikan semua perangkat terhubung ke router WiFi yang sama

3. **Cek IP Address Benar**: Pastikan menggunakan IP yang benar dengan `ipconfig`

### Menambahkan Firewall Rule via PowerShell (Administrator)

```powershell
# Izinkan port backend (3001)
New-NetFirewallRule -DisplayName "AMDK Airku Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow

# Izinkan port frontend (5173)
New-NetFirewallRule -DisplayName "AMDK Airku Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

## Keamanan

⚠️ **Penting:** Konfigurasi ini hanya untuk development di jaringan lokal yang terpercaya. Untuk production:

- Gunakan HTTPS
- Implementasi proper CORS policy
- Gunakan environment variable yang aman
- Deploy di server production dengan konfigurasi keamanan yang tepat

## Testing

Setelah menjalankan kedua server, test dari komputer host:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Test dari perangkat lain di WiFi yang sama (ganti dengan IP Anda):

- Frontend: http://192.168.1.100:5173
- Backend: http://192.168.1.100:3001

API frontend akan otomatis terhubung ke backend menggunakan IP yang sama.
