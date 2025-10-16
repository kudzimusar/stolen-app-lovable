-- Test script to verify the schema fix works
-- This is a simplified version to test the syntax

-- Test 1: Check if table exists and current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 2: Check current listings
SELECT 
    id,
    title,
    device_id,
    seller_id,
    price,
    currency,
    status,
    created_at
FROM public.marketplace_listings
ORDER BY created_at DESC
LIMIT 5;

-- Test 3: Check if your device exists
SELECT 
    id,
    device_name,
    brand,
    model,
    serial_number,
    current_owner_id,
    storage_capacity,
    device_photos,
    blockchain_hash
FROM public.devices
WHERE current_owner_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY created_at DESC;
