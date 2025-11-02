@echo off
echo ================================================
echo Allow NULL Driver/Vehicle in route_plans
echo ================================================
echo.
echo This migration will:
echo 1. Allow NULL for driverId and vehicleId (for unassigned routes)
echo 2. Add assignmentStatus column (if not exists)
echo 3. Add indexes for better performance
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

mysql -u root -p amdk_airku_db < allow_null_driver_vehicle_in_routes.sql

echo.
echo ================================================
echo Migration completed!
echo ================================================
echo.
echo Sekarang route planning bisa membuat route unassigned.
echo Test: Admin -^> Manajemen Pesanan -^> Tugaskan Pemesanan
echo.
pause
