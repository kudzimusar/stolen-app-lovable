-- UNDO the damage from the populate-device-details.sql script
-- Restore the iPhone 8 Plus to its correct model

UPDATE devices
SET 
  model = 'iPhone 8 Plus',
  processor = NULL,  -- Clear fake data
  screen_size_inch = NULL,  -- Clear fake data
  battery_health_percentage = NULL,  -- Clear fake data if not originally set
  ram_gb = NULL  -- Clear fake data
WHERE device_name = 'iPhone 8plus';

-- Remove devices that were not actually registered by the user
-- Keep only devices that have real registration data
DELETE FROM devices
WHERE device_name IN ('iPhone 14 Pro', 'MacBook Air M2', 'AirPods Pro 2')
AND created_at > (SELECT created_at FROM devices WHERE device_name = 'iPhone 8plus');

-- Verify the correct data
SELECT 
  id,
  device_name,
  brand,
  model,
  color,
  storage_capacity,
  serial_number,
  imei,
  current_owner_id,
  created_at
FROM devices
WHERE device_name = 'iPhone 8plus';

