-- ============================================
-- Migration: Add Shipments Table
-- Date: 2025-10-29
-- Description: Create shipments table for load/shipment management
-- ============================================

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status ENUM(
        'unassigned',
        'assigned',
        'departed',
        'completed'
    ) DEFAULT 'unassigned',
    driver_id VARCHAR(36) NULL,
    vehicle_id VARCHAR(36) NULL,
    route_plan_id VARCHAR(36) NULL,
    region VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users (id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE SET NULL,
    INDEX idx_shipment_date (date),
    INDEX idx_shipment_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Add shipment_id column to orders table
ALTER TABLE orders
ADD COLUMN shipment_id VARCHAR(36) NULL AFTER assigned_vehicle_id,
ADD FOREIGN KEY (shipment_id) REFERENCES shipments (id) ON DELETE SET NULL;

-- Add shipment_id column to route_plans table
ALTER TABLE route_plans
ADD COLUMN shipment_id VARCHAR(36) NULL AFTER assignment_status,
ADD FOREIGN KEY (shipment_id) REFERENCES route_plans (id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_order_shipment ON orders (shipment_id);

CREATE INDEX idx_route_shipment ON route_plans (shipment_id);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if shipments table was created
SELECT 'Shipments table created successfully' AS status
FROM information_schema.tables
WHERE
    table_schema = DATABASE()
    AND table_name = 'shipments';

-- Check if columns were added
SELECT
    'orders.shipment_id' AS column_check,
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.columns
WHERE
    table_schema = DATABASE()
    AND table_name = 'orders'
    AND column_name = 'shipment_id';

SELECT
    'route_plans.shipment_id' AS column_check,
    COLUMN_NAME,
    DATA_TYPE
FROM information_schema.columns
WHERE
    table_schema = DATABASE()
    AND table_name = 'route_plans'
    AND column_name = 'shipment_id';

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_shipment;
-- ALTER TABLE orders DROP COLUMN shipment_id;
-- ALTER TABLE route_plans DROP FOREIGN KEY route_plans_ibfk_shipment;
-- ALTER TABLE route_plans DROP COLUMN shipment_id;
-- DROP TABLE IF EXISTS shipments;