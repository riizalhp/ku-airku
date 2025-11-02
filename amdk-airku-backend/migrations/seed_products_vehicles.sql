-- ================================================
-- Seed Data: Products and Vehicles
-- Date: 2025-11-02
-- Description: Insert/Update produk dan armada untuk sistem KU AIRKU
-- ================================================

-- ================================================
-- CLEAR EXISTING DATA
-- ================================================
-- NOTE: We need to delete in order due to foreign key constraints:
-- order_items → orders → products
-- routes/stops → orders
-- shipments → routes

-- Step 1: Delete order_items that reference products we want to replace
DELETE FROM order_items
WHERE
    productId IN (
        SELECT id
        FROM products
        WHERE
            sku IN (
                'AIR-240ML',
                'AIR-120ML',
                'AIR-600ML',
                'AIR-330ML',
                'GALON-19L',
                'G-19'
            )
    );

-- Step 2: Delete route stops and routes that might reference orders
DELETE FROM route_stops
WHERE
    routeId IN (
        SELECT id
        FROM routes
        WHERE
            id IN (
                SELECT assignedVehicleId
                FROM orders
                WHERE
                    assignedVehicleId IS NOT NULL
            )
    );

-- Step 3: Delete routes
DELETE FROM routes;

-- Step 4: Delete shipments
DELETE FROM shipments;

-- Step 5: Delete orders that have the old products
DELETE FROM orders
WHERE
    id IN (
        SELECT DISTINCT
            orderId
        FROM order_items
        WHERE
            productId IN (
                SELECT id
                FROM products
                WHERE
                    sku IN (
                        'AIR-240ML',
                        'AIR-120ML',
                        'AIR-600ML',
                        'AIR-330ML',
                        'GALON-19L',
                        'G-19'
                    )
            )
    );

-- Step 6: Now safe to delete old products
DELETE FROM products
WHERE
    sku IN (
        'AIR-240ML',
        'AIR-120ML',
        'AIR-600ML',
        'AIR-330ML',
        'GALON-19L',
        'G-19'
    );

-- ================================================
-- INSERT/UPDATE PRODUCTS
-- ================================================

-- Insert new products with correct capacity conversion rates
INSERT INTO
    products (
        id,
        sku,
        name,
        price,
        stock,
        reservedStock,
        capacityUnit,
        capacityConversionHeterogeneous
    )
VALUES (
        'p-001-240ml',
        'AIR-240ML',
        'Air Mineral 240ml',
        3000,
        500,
        0,
        NULL,
        1.0
    ),
    (
        'p-002-120ml',
        'AIR-120ML',
        'Air Mineral 120ml',
        2000,
        800,
        0,
        NULL,
        0.571
    ),
    (
        'p-003-600ml',
        'AIR-600ML',
        'Air Mineral 600ml',
        5000,
        300,
        0,
        NULL,
        1.6
    ),
    (
        'p-004-330ml',
        'AIR-330ML',
        'Air Mineral 330ml',
        4000,
        600,
        0,
        NULL,
        1.0
    ),
    (
        'p-005-19L',
        'GALON-19L',
        'Galon 19L',
        20000,
        200,
        0,
        NULL,
        3.33
    );

-- ================================================
-- INSERT/UPDATE VEHICLES
-- ================================================

-- Delete existing vehicles first (to ensure clean data)
DELETE FROM vehicles
WHERE
    plateNumber IN ('AB-1234-CD', 'AB-5678-EF');

-- Insert new vehicles
INSERT INTO
    vehicles (
        id,
        plateNumber,
        model,
        capacity,
        status,
        vehicleType
    )
VALUES (
        'v-001-l300',
        'AB-1234-CD',
        'L300',
        200,
        'Idle',
        'L300'
    ),
    (
        'v-002-cherrybox',
        'AB-5678-EF',
        'Cherry Box',
        170,
        'Idle',
        'Cherry Box'
    );

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check inserted products
SELECT
    sku,
    name,
    price as 'Harga (Rp)',
    stock as 'Stok',
    capacityUnit as 'CapacityUnit (DEPRECATED)',
    capacityConversionHeterogeneous as 'Konversi Heterogen'
FROM products
WHERE
    sku IN (
        'AIR-240ML',
        'AIR-120ML',
        'AIR-600ML',
        'AIR-330ML',
        'GALON-19L'
    )
ORDER BY
    capacityConversionHeterogeneous;

-- Check inserted vehicles
SELECT
    plateNumber as 'Plat Nomor',
    model as 'Model',
    vehicleType as 'Jenis Armada',
    capacity as 'Kapasitas',
    status as 'Status'
FROM vehicles
WHERE
    plateNumber IN ('AB-1234-CD', 'AB-5678-EF')
ORDER BY capacity DESC;

-- ================================================
-- CAPACITY REFERENCE TABLE
-- ================================================
-- Homogeneous Capacity (1 product type only):
--
-- | Produk    | L300 (200) | Cherry Box (170) |
-- |-----------|------------|------------------|
-- | 240ml     | 200 unit   | 170 unit         |
-- | 120ml     | 350 unit   | 300 unit         |
-- | 600ml     | 150 unit   | 100 unit         |
-- | 330ml     | 200 unit   | 170 unit         |
-- | 19L       | 60 unit    | 50 unit          |
--
-- Heterogeneous Capacity (mixed products):
-- Uses capacityConversionHeterogeneous:
-- - 240ml = 1.0
-- - 120ml = 0.571
-- - 600ml = 1.6
-- - 330ml = 1.0
-- - 19L = 3.33
-- ================================================