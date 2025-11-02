@echo off
echo ================================================
echo Adding assignmentStatus Column to route_plans
echo ================================================
echo.
echo This will add assignmentStatus column to track:
echo - unassigned: Route belum ditugaskan
echo - assigned: Route sudah ditugaskan ke driver/vehicle
echo - departed: Driver sudah berangkat
echo - completed: Route selesai
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

mysql -u root -p amdk_airku_db < add_assignmentStatus_to_routes.sql

echo.
echo ================================================
echo Migration completed!
echo ================================================
echo.
echo Sekarang sistem route planning bisa digunakan.
echo Silakan test: Admin -^> Manajemen Pesanan -^> Tugaskan Pemesanan
echo.
pause
