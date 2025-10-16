-- Verify marketplace listing exists and check its status

-- 1. Check if marketplace_listings table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings'
) as table_exists;

-- 2. Check total count and status breakdown
SELECT 
    COUNT(*) as total_listings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM public.marketplace_listings;

-- 3. Show all listings with their details
SELECT 
    id,
    device_id,
    seller_id,
    title,
    price,
    status,
    created_at,
    updated_at
FROM public.marketplace_listings
ORDER BY created_at DESC;

-- 4. Check if the device exists and is linked
SELECT 
    ml.id as listing_id,
    ml.title,
    ml.status as listing_status,
    ml.device_id,
    d.id as device_exists,
    d.device_name,
    d.current_owner_id,
    ml.seller_id,
    CASE 
        WHEN d.id IS NULL THEN 'Device not found'
        WHEN ml.seller_id != d.current_owner_id THEN 'Seller is not device owner'
        ELSE 'OK'
    END as validation_status
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
ORDER BY ml.created_at DESC;

-- 5. Check RLS policies on marketplace_listings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'marketplace_listings';

-- 6. Check if there are any listings for the specific user
SELECT 
    ml.*,
    d.device_name,
    d.current_owner_id
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
WHERE ml.seller_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
   OR d.current_owner_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3';

