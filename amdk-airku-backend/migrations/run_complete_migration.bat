@echo off
echo ================================================
echo Complete Migration: Full System Update
echo ================================================
echo.
echo Langkah yang akan dijalankan:
echo 1. Allow NULL driver/vehicle in routes (for unassigned routes)
echo 2. Deprecate capacityUnit field (make nullable)
echo 3. Update capacityConversionHeterogeneous default
echo 4. Insert 5 produk air mineral
echo 5. Insert 2 armada (L300 dan Cherry Box)
echo.
echo PERINGATAN: 
echo - Data produk dan armada lama akan DITIMPA
echo - capacityUnit akan di-set NULL (deprecated)
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

echo.
echo [1/3] Running allow_null_driver_vehicle_in_routes.sql...
mysql -u root -p amdk_airku_db < allow_null_driver_vehicle_in_routes.sql

echo.
echo [2/3] Running deprecate_capacity_unit.sql...
mysql -u root -p amdk_airku_db < deprecate_capacity_unit.sql

echo.
echo [3/3] Running seed_products_vehicles.sql...
mysql -u root -p amdk_airku_db < seed_products_vehicles.sql

echo.
echo ================================================
echo Migration Complete!
echo ================================================
echo.
echo Sekarang Anda bisa:
echo 1. Restart backend (npm run dev)
echo 2. Test di Admin Panel:
echo    - Manajemen Produk (5 produk)
echo    - Manajemen Armada (2 armada)
echo    - Kalkulator Kapasitas (test homogen/heterogen)
echo    - Manajemen Pesanan ^> Tugaskan Pemesanan (route planning)
echo    - Pantau Muatan (assign driver/vehicle ke routes)
echo.
pause
