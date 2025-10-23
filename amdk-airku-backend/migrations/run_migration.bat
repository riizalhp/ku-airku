@echo off
REM Script untuk menjalankan migration database
REM Jalankan script ini dari command prompt

echo ================================================
echo   Migration Script - Capacity System
echo ================================================
echo.
echo PENTING: Pastikan Anda sudah backup database!
echo.
pause

echo.
echo Menjalankan migration...
echo.

REM Ganti 'root' dengan username MySQL Anda jika berbeda
REM Ganti 'amdk_airku_db' dengan nama database Anda jika berbeda

mysql -u root -p amdk_airku_db < add_capacity_conversion.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   Migration BERHASIL!
    echo ================================================
    echo.
    echo Silakan verifikasi dengan menjalankan:
    echo   mysql -u root -p -e "DESCRIBE products;" amdk_airku_db
    echo.
) else (
    echo.
    echo ================================================
    echo   Migration GAGAL!
    echo ================================================
    echo.
    echo Silakan cek error di atas dan:
    echo 1. Pastikan MySQL service berjalan
    echo 2. Pastikan username dan password benar
    echo 3. Pastikan database 'amdk_airku_db' ada
    echo.
    echo Atau jalankan manual via phpMyAdmin/MySQL Workbench
    echo.
)

pause
