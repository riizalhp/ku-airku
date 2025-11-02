-- ================================================
-- Migration: Add assignmentStatus to route_plans
-- Date: 2025-11-02
-- Description: Add assignmentStatus column to track route assignment status
-- ================================================

-- Add assignmentStatus column to route_plans table
ALTER TABLE route_plans
ADD COLUMN assignmentStatus ENUM(
    'unassigned',
    'assigned',
    'departed',
    'completed'
) NOT NULL DEFAULT 'unassigned' COMMENT 'Status penugasan rute: unassigned, assigned, departed, completed';

-- Update existing routes to 'assigned' if they have driver and vehicle
UPDATE route_plans
SET
    assignmentStatus = 'assigned'
WHERE
    driverId IS NOT NULL
    AND vehicleId IS NOT NULL;

-- ================================================
-- VERIFICATION QUERY
-- ================================================

-- Check the table structure
DESCRIBE route_plans;

-- Check assignment status distribution
SELECT assignmentStatus as 'Status', COUNT(*) as 'Jumlah Rute'
FROM route_plans
GROUP BY
    assignmentStatus;

-- ================================================
-- ROLLBACK (if needed)
-- ================================================
-- If you need to rollback this migration:
--
-- ALTER TABLE route_plans DROP COLUMN assignmentStatus;
-- ================================================