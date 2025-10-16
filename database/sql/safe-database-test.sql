-- Safe database test that doesn't assume any enum values
-- This will work regardless of what enum values exist

-- 1. Check if your device exists
SELECT 
    'Device Check' as test_type,
    id,
    device_name,
    brand,
    model,
    current_owner_id,
    status,
    created_at
FROM public.devices
WHERE current_owner_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY created_at DESC;

-- 2. Check if marketplace_listings table exists and has data
SELECT 
    'Marketplace Table Status' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as table_exists;

-- 3. If table exists, show basic info without assuming enum values
SELECT 
    'Basic Table Info' as test_type,
    COUNT(*) as total_rows
FROM public.marketplace_listings;

-- 4. Show all unique status values (whatever they are)
SELECT 
    'All Status Values' as test_type,
    status,
    COUNT(*) as count
FROM public.marketplace_listings
GROUP BY status
ORDER BY count DESC;

-- 5. Check if any listings exist for your device (regardless of status)
SELECT 
    'Your Listings' as test_type,
    ml.id,
    ml.device_id,
    ml.title,
    ml.price,
    ml.status,
    ml.created_at,
    d.device_name,
    d.brand,
    d.model
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
WHERE ml.seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY ml.created_at DESC;

-- 6. Show recent listings (if any exist)
SELECT 
    'Recent Listings' as test_type,
    id,
    device_id,
    seller_id,
    title,
    price,
    status,
    created_at
FROM public.marketplace_listings
ORDER BY created_at DESC
LIMIT 10;
