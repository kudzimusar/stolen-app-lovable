-- Test marketplace listings query to debug the 500 error

-- First, check if marketplace_listings table exists and has data
SELECT 
    COUNT(*) as total_listings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
FROM public.marketplace_listings;

-- Check a sample listing
SELECT 
    id,
    device_id,
    seller_id,
    title,
    price,
    status,
    created_at
FROM public.marketplace_listings
LIMIT 1;

-- Test the join with devices (this should work)
SELECT 
    ml.id,
    ml.title,
    ml.price,
    ml.status,
    d.device_name,
    d.brand,
    d.model
FROM public.marketplace_listings ml
LEFT JOIN public.devices d ON ml.device_id = d.id
LIMIT 1;

-- Test the problematic auth.users join
SELECT 
    ml.id,
    ml.title,
    ml.seller_id,
    u.id as user_id,
    u.email,
    u.raw_user_meta_data
FROM public.marketplace_listings ml
LEFT JOIN auth.users u ON ml.seller_id = u.id
LIMIT 1;

