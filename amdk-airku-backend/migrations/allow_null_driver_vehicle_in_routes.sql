-- Migration: Allow NULL driver and vehicle in route_plans
-- Date: 2025-10-27
-- Purpose: Enable route creation without driver/vehicle assignment

-- Modify route_plans table to allow NULL for driverId and vehicleId
ALTER TABLE `route_plans`
MODIFY COLUMN `driverId` varchar(36) NULL,
MODIFY COLUMN `vehicleId` varchar(36) NULL;

-- Add status column to track route assignment status
ALTER TABLE `route_plans`
ADD COLUMN `assignmentStatus` ENUM(
    'unassigned',
    'assigned',
    'departed',
    'completed'
) DEFAULT 'unassigned' AFTER `region`;

-- Update existing routes to 'assigned' status (backward compatibility)
UPDATE `route_plans`
SET
    `assignmentStatus` = 'assigned'
WHERE
    `driverId` IS NOT NULL
    AND `vehicleId` IS NOT NULL;

-- Add index for better query performance
CREATE INDEX `idx_assignment_status` ON `route_plans` (`assignmentStatus`);

CREATE INDEX `idx_date_status` ON `route_plans` (`date`, `assignmentStatus`);

-- Verification queries (comment out after verification)
-- SELECT * FROM route_plans WHERE driverId IS NULL OR vehicleId IS NULL;
-- SELECT COUNT(*) as total_routes, assignmentStatus FROM route_plans GROUP BY assignmentStatus;