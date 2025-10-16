-- Test script to check if your listing was created
-- This version uses the actual enum values from your database

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

-- 4. Check table status using only the enum values that actually exist
-- Based on the error, we know 'active' exists, so let's check for common values
SELECT 
    'Table Status Analysis' as test_type,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_count,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
FROM public.marketplace_listings;

-- 5. Show all unique status values actually in use
SELECT 
    'Unique Status Values' as test_type,
    status,
    COUNT(*) as count
FROM public.marketplace_listings
GROUP BY status
ORDER BY count DESC;
