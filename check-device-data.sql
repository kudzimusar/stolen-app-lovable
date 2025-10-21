-- Check what data is actually in the devices table
SELECT 
  id,
  device_name,
  brand,
  model,
  serial_number,
  color,
  storage_capacity,
  ram_gb,
  processor,
  screen_size_inch,
  battery_health_percentage,
  device_condition,
  blockchain_hash,
  current_owner_id,
  created_at
FROM devices
LIMIT 5;

-- Check if there are any marketplace listings
SELECT 
  ml.id,
  ml.title,
  ml.device_id,
  ml.seller_id,
  ml.status,
  d.brand,
  d.model,
  d.color,
  d.storage_capacity
FROM marketplace_listings ml
LEFT JOIN devices d ON ml.device_id = d.id
LIMIT 5;
