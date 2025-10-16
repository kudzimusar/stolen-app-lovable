-- Debug script to check marketplace listings data and schema

-- 1. Check if marketplace_listings table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current listings in the database
SELECT 
    id,
    title,
    device_id,
    seller_id,
    price,
    currency,
    status,
    condition_rating,
    featured,
    created_at
FROM public.marketplace_listings
ORDER BY created_at DESC;

-- 3. Check if there are any listings for your device
SELECT 
    ml.id as listing_id,
    ml.title,
    ml.price,
    ml.status,
    ml.created_at,
    d.device_name,
    d.brand,
    d.model,
    d.serial_number,
    d.current_owner_id
FROM public.marketplace_listings ml
JOIN public.devices d ON ml.device_id = d.id
WHERE d.current_owner_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY ml.created_at DESC;

-- 4. Check your devices
SELECT 
    id,
    device_name,
    brand,
    model,
    serial_number,
    current_owner_id,
    status,
    created_at
FROM public.devices
WHERE current_owner_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY created_at DESC;
