# Script untuk menampilkan IP Address yang bisa digunakan untuk akses dari perangkat lain

Write-Host ""
Write-Host "=== IP Address Komputer Anda ===" -ForegroundColor Yellow
Write-Host ""

# Dapatkan semua adapter network yang aktif
$adapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -eq "Dhcp" -or $_.PrefixOrigin -eq "Manual"
}

foreach ($adapter in $adapters) {
    $interface = Get-NetAdapter | Where-Object { $_.ifIndex -eq $adapter.InterfaceIndex }
    
    if ($interface.Status -eq "Up") {
        Write-Host "Interface: $($interface.Name)" -ForegroundColor Cyan
        Write-Host "IP Address: $($adapter.IPAddress)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Akses aplikasi dari perangkat lain:" -ForegroundColor White
        Write-Host "  Frontend: http://$($adapter.IPAddress):5173" -ForegroundColor Yellow
        Write-Host "  Backend:  http://$($adapter.IPAddress):3001" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host "Note: Pastikan kedua server (frontend & backend) sudah berjalan!" -ForegroundColor Magenta
Write-Host ""
