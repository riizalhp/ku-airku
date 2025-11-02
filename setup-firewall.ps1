# Script untuk menambahkan firewall rules agar aplikasi dapat diakses dari jaringan lokal
# Jalankan PowerShell sebagai Administrator, lalu jalankan script ini

Write-Host "Menambahkan Firewall Rules untuk AMDK Airku..." -ForegroundColor Green

# Hapus rules lama jika ada
Remove-NetFirewallRule -DisplayName "AMDK Airku Backend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "AMDK Airku Frontend" -ErrorAction SilentlyContinue

# Tambah rule untuk Backend (Port 3001)
New-NetFirewallRule -DisplayName "AMDK Airku Backend" `
                    -Direction Inbound `
                    -LocalPort 3001 `
                    -Protocol TCP `
                    -Action Allow `
                    -Profile Private,Domain `
                    -Description "Allow access to AMDK Airku Backend API on port 3001"

Write-Host "✓ Backend port 3001 dibuka" -ForegroundColor Green

# Tambah rule untuk Frontend (Port 5173)
New-NetFirewallRule -DisplayName "AMDK Airku Frontend" `
                    -Direction Inbound `
                    -LocalPort 5173 `
                    -Protocol TCP `
                    -Action Allow `
                    -Profile Private,Domain `
                    -Description "Allow access to AMDK Airku Frontend on port 5173"

Write-Host "✓ Frontend port 5173 dibuka" -ForegroundColor Green

Write-Host ""
Write-Host "Firewall rules berhasil ditambahkan!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Untuk mendapatkan IP address Anda, jalankan:" -ForegroundColor Cyan
Write-Host "  ipconfig" -ForegroundColor White
Write-Host ""
Write-Host "Lalu cari 'IPv4 Address' di adapter WiFi Anda" -ForegroundColor Cyan
Write-Host "Contoh: 192.168.1.100" -ForegroundColor White
Write-Host ""
Write-Host "Akses aplikasi dari perangkat lain:" -ForegroundColor Cyan
Write-Host "  Frontend: http://[IP-ANDA]:5173" -ForegroundColor White
Write-Host "  Backend:  http://[IP-ANDA]:3001" -ForegroundColor White
Write-Host ""
