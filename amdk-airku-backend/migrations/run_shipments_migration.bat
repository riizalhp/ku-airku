@echo off
echo ============================================
echo Running Shipments Migration
echo ============================================
echo.

REM Set database connection details
set DB_HOST=localhost
set DB_USER=root
set DB_PASS=
set DB_NAME=amdk_airku_db

echo Connecting to database: %DB_NAME%
echo.

REM Run migration
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% < add_shipments_table.sql

if %ERRORLEVEL% == 0 (
    echo.
    echo ============================================
    echo Migration completed successfully!
    echo ============================================
) else (
    echo.
    echo ============================================
    echo Migration failed! Please check the error above.
    echo ============================================
)

echo.
pause
