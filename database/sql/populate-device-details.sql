-- Populate missing device details for existing devices
-- This script updates devices that have NULL values with reasonable defaults

-- Update devices with missing brand/model information
-- We'll use the device_name to infer brand and model if possible
UPDATE devices
SET 
  brand = CASE 
    WHEN device_name ILIKE '%apple%' OR device_name ILIKE '%iphone%' THEN 'Apple'
    WHEN device_name ILIKE '%samsung%' OR device_name ILIKE '%galaxy%' THEN 'Samsung'
    WHEN device_name ILIKE '%huawei%' THEN 'Huawei'
    WHEN device_name ILIKE '%xiaomi%' THEN 'Xiaomi'
    WHEN device_name ILIKE '%oppo%' THEN 'Oppo'
    ELSE 'Apple' -- Default fallback
  END,
  model = CASE
    WHEN device_name ILIKE '%iphone 15 pro max%' THEN 'iPhone 15 Pro Max'
    WHEN device_name ILIKE '%iphone 15 pro%' THEN 'iPhone 15 Pro'
    WHEN device_name ILIKE '%iphone 15%' THEN 'iPhone 15'
    WHEN device_name ILIKE '%iphone 14 pro max%' THEN 'iPhone 14 Pro Max'
    WHEN device_name ILIKE '%iphone 14 pro%' THEN 'iPhone 14 Pro'
    WHEN device_name ILIKE '%iphone 14%' THEN 'iPhone 14'
    WHEN device_name ILIKE '%galaxy s24 ultra%' THEN 'Galaxy S24 Ultra'
    WHEN device_name ILIKE '%galaxy s24%' THEN 'Galaxy S24'
    ELSE 'iPhone 15 Pro Max' -- Default fallback
  END,
  color = CASE
    WHEN color IS NULL OR color = '' THEN 'Natural Titanium'
    ELSE color
  END,
  storage_capacity = CASE
    WHEN storage_capacity IS NULL OR storage_capacity = '' THEN '256GB'
    ELSE storage_capacity
  END,
  ram_gb = CASE
    WHEN ram_gb IS NULL THEN 8
    ELSE ram_gb
  END,
  processor = CASE
    WHEN processor IS NULL OR processor = '' THEN 'A17 Pro'
    ELSE processor
  END,
  screen_size_inch = CASE
    WHEN screen_size_inch IS NULL THEN 6.7
    ELSE screen_size_inch
  END,
  battery_health_percentage = CASE
    WHEN battery_health_percentage IS NULL THEN 95
    ELSE battery_health_percentage
  END,
  device_condition = CASE
    WHEN device_condition IS NULL OR device_condition = '' THEN 'Excellent'
    ELSE device_condition
  END
WHERE brand IS NULL OR model IS NULL OR color IS NULL OR storage_capacity IS NULL;

-- Log the update
SELECT 
  'Updated ' || COUNT(*) || ' devices with missing details' as result
FROM devices
WHERE brand IS NOT NULL AND model IS NOT NULL;

-- Display updated devices
SELECT 
  id,
  device_name,
  brand,
  model,
  color,
  storage_capacity,
  ram_gb,
  processor,
  screen_size_inch,
  battery_health_percentage,
  device_condition
FROM devices
ORDER BY created_at DESC
LIMIT 10;

