-- Migration: Add preferred_datetime column to maintenance_requests
-- Run this script on your SQL Server database

ALTER TABLE maintenance_requests
ADD preferred_datetime DATETIME NULL;

GO

-- Verify the column was added
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'maintenance_requests'
  AND COLUMN_NAME = 'preferred_datetime';
