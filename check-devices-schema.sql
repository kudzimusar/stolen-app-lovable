-- Check the current devices table schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'devices'
AND column_name IN (
  'device_name',
  'brand',
  'model',
  'color',
  'storage_capacity',
  'ram_gb',
  'processor',
  'screen_size_inch',
  'battery_health_percentage',
  'device_condition'
)
ORDER BY ordinal_position;
