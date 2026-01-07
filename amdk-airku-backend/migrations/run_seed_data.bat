@echo off
echo ================================================
echo Seeding Data: Products and Vehicles
echo ================================================
echo.
echo Data yang akan dimasukkan:
echo.
echo PRODUK:
echo - Air 240ml: Stok 500, Konversi 1.0
echo - Air 120ml: Stok 800, Konversi 0.571
echo - Air 600ml: Stok 300, Konversi 1.6
echo - Air 330ml: Stok 600, Konversi 1.0
echo - Galon 19L: Stok 200, Konversi 3.33
echo.
echo ARMADA:
echo - L300 (AB-1234-CD): Kapasitas 200
echo - Cherry Box (AB-5678-EF): Kapasitas 170
echo.
echo PERINGATAN: Data produk dan armada yang ada akan DITIMPA!
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

mysql -u root -p amdk_airku_db < seed_products_vehicles.sql

echo.
echo ================================================
echo Data berhasil dimasukkan!
echo ================================================
echo.
echo Silakan cek di aplikasi:
echo 1. Admin - Manajemen Produk (ada 5 produk)
echo 2. Admin - Manajemen Armada (ada 2 armada)
echo 3. Admin - Kalkulator Kapasitas (test capacity)
echo.
pause
