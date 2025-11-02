-- ================================================
-- Migration: Deprecate capacityUnit Field
-- Date: 2025-11-02
-- Description:
--   capacityUnit field in products table is deprecated because
--   homogeneous capacity depends on VEHICLE TYPE + PRODUCT TYPE,
--   not just product type alone.
--
--   Example: 240ml product
--   - L300 can carry 200 units
--   - Cherry Box can carry 170 units
--
--   This data is now hardcoded in VEHICLE_CAPACITY_DATA in the backend.
--   Only capacityConversionHeterogeneous is needed for mixed loads.
-- ================================================

-- Step 1: Make capacityUnit nullable (for backward compatibility)
-- This column may already be NULL in some rows, or it may have default values
ALTER TABLE products
MODIFY COLUMN capacityUnit DECIMAL(5, 2) NULL COMMENT 'DEPRECATED: Homogeneous capacity now depends on vehicle type (see VEHICLE_CAPACITY_DATA in backend)';

-- Step 2: Set capacityUnit to NULL for all products (optional - if you want to clean existing data)
-- Uncomment the line below if you want to clear all capacityUnit values
-- UPDATE products SET capacityUnit = NULL;

-- Step 3: Update conversion rates for existing products
-- These conversion rates are used for HETEROGENEOUS loads (mixed products)
-- Base: 240ml = 1.0

-- Update based on product names (adjust product names to match your actual data)
UPDATE products
SET
    capacityConversionHeterogeneous = 1.0
WHERE
    name LIKE '%240%ml%'
    OR name LIKE '%240ml%';

UPDATE products
SET
    capacityConversionHeterogeneous = 0.571
WHERE
    name LIKE '%120%ml%'
    OR name LIKE '%120ml%';

UPDATE products
SET
    capacityConversionHeterogeneous = 1.6
WHERE
    name LIKE '%600%ml%'
    OR name LIKE '%600ml%';

UPDATE products
SET
    capacityConversionHeterogeneous = 1.0
WHERE
    name LIKE '%330%ml%'
    OR name LIKE '%330ml%';

UPDATE products
SET
    capacityConversionHeterogeneous = 3.33
WHERE
    name LIKE '%19%L%'
    OR name LIKE '%19L%'
    OR name LIKE '%galon%';

-- Step 4: Ensure capacityConversionHeterogeneous has default value for new products
ALTER TABLE products
MODIFY COLUMN capacityConversionHeterogeneous DECIMAL(5, 2) NULL DEFAULT 1.0 COMMENT 'Conversion rate for heterogeneous loads (relative to 240ml = 1.0)';

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check all products with their conversion rates
SELECT
    id,
    name,
    capacityUnit as 'capacityUnit (DEPRECATED)',
    capacityConversionHeterogeneous as 'Heterogeneous Conversion'
FROM products
ORDER BY name;

-- ================================================
-- ROLLBACK (if needed)
-- ================================================
-- If you need to rollback this migration:
--
-- ALTER TABLE products MODIFY COLUMN capacityUnit DECIMAL(5,2) NOT NULL DEFAULT 1.00
-- COMMENT 'Bobot kapasitas per item untuk perhitungan muatan';
--
-- UPDATE products SET capacityUnit = 1.0 WHERE capacityUnit IS NULL;
-- ================================================