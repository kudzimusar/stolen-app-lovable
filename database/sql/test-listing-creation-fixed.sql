-- Test script to check if your listing was created
-- This version uses correct enum values based on actual database schema

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

-- 2. Check if any marketplace listings exist for your device
SELECT 
    'Listing Check' as test_type,
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

-- 3. Check all marketplace listings (if any) with their actual status values
SELECT 
    'All Listings' as test_type,
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

-- 4. Check table status using actual enum values (will be determined by step 1)
-- This will be updated after we know the correct enum values
SELECT 
    'Table Status' as test_type,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review_count
FROM public.marketplace_listings;
