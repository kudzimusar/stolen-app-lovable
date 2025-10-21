-- FIX: Restore the iPhone 8 Plus to its original correct data
-- and remove any fake devices that were created

-- Step 1: Fix the iPhone 8 Plus model
UPDATE devices
SET 
  model = 'iPhone 8 Plus',  -- Correct model
  processor = NULL,  -- Remove fake data
  screen_size_inch = NULL,  -- Remove fake data
  battery_health_percentage = NULL,  -- Remove fake data
  ram_gb = NULL  -- Remove fake data
WHERE device_name = 'iPhone 8plus'
AND id = '30e1752a-afda-4cbd-bd00-b0c90cad077a';

-- Step 2: Check if the other devices were created by the same user or are test data
-- Only delete if they were created after the iPhone 8 Plus and by the populate script
SELECT 
  id,
  device_name,
  brand,
  model,
  current_owner_id,
  created_at,
  'Will be checked for deletion' as action
FROM devices
WHERE device_name IN ('iPhone 14 Pro', 'MacBook Air M2', 'AirPods Pro 2');

-- Step 3: If you want to delete the fake devices, run this:
-- DELETE FROM devices
-- WHERE device_name IN ('iPhone 14 Pro', 'MacBook Air M2', 'AirPods Pro 2')
-- AND model = 'iPhone 15 Pro Max';  -- Only delete if they have the wrong model

-- Step 4: Verify the corrected data
SELECT 
  id,
  device_name,
  brand,
  model,
  color,
  storage_capacity,
  serial_number,
  imei,
  device_condition,
  current_owner_id,
  created_at
FROM devices
WHERE device_name = 'iPhone 8plus';

-- Step 5: Show all devices for the current user
SELECT 
  id,
  device_name,
  brand,
  model,
  color,
  storage_capacity,
  device_condition,
  created_at
FROM devices
WHERE current_owner_id = (SELECT current_owner_id FROM devices WHERE device_name = 'iPhone 8plus')
ORDER BY created_at DESC;

