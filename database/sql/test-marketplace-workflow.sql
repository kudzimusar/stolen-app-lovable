-- Test Marketplace Workflow - Comprehensive Diagnostic
-- This script will help identify issues with the marketplace integration

-- 1. Check if the enum values are working
SELECT 
    'Enum Test' as test,
    'pending'::listing_status as pending_test,
    'approved'::listing_status as approved_test,
    'rejected'::listing_status as rejected_test;

-- 2. Check all marketplace listings with their current status
SELECT 
    'All Listings' as section,
    id,
    title,
    price,
    status,
    seller_id,
    device_id,
    created_at,
    updated_at
FROM public.marketplace_listings 
ORDER BY created_at DESC;

-- 3. Check the specific listing that should be visible
SELECT 
    'Specific Listing Check' as section,
    ml.id,
    ml.title,
    ml.price,
    ml.status,
    ml.seller_id,
    ml.device_id,
    ml.created_at,
    d.device_name,
    d.brand,
    d.model,
    d.current_owner_id,
    d.status as device_status
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
WHERE ml.seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY ml.created_at DESC;

-- 4. Check if the marketplace_listings table has the expected columns
SELECT 
    'Table Schema Check' as section,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'marketplace_listings'
ORDER BY ordinal_position;

-- 5. Check RLS policies for marketplace_listings
SELECT 
    'RLS Policies' as section,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'marketplace_listings';

-- 6. Test if we can update the listing status
-- This will help us manually approve the listing for testing
UPDATE public.marketplace_listings 
SET status = 'approved', updated_at = NOW()
WHERE seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
AND status = 'pending'
RETURNING id, title, status;

-- 7. Verify the update worked
SELECT 
    'After Update Check' as section,
    id,
    title,
    price,
    status,
    updated_at
FROM public.marketplace_listings 
WHERE seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
ORDER BY updated_at DESC;
