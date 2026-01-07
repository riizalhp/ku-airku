@echo off
echo ================================================
echo Running Migration: Deprecate capacityUnit Field
echo ================================================
echo.
echo This will:
echo 1. Make capacityUnit nullable (deprecated)
echo 2. Update conversion rates for heterogeneous loads
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

mysql -u root -p amdk_airku_db < deprecate_capacity_unit.sql

echo.
echo ================================================
echo Migration completed!
echo ================================================
echo.
echo Next steps:
echo 1. Check the results in your database
echo 2. Verify products have correct capacityConversionHeterogeneous values
echo 3. Test the capacity calculator in the admin panel
echo.
pause
