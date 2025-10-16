-- Complete marketplace debugging script
-- Run this to understand the current state

-- 1. Check if marketplace_listings table exists and its structure
SELECT 
    'Table Structure' as check_type,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there are any listings
SELECT 
    'Current Listings' as check_type,
    COUNT(*) as total_listings,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_listings
FROM public.marketplace_listings;

-- 3. Check specific listing data if any exist
SELECT 
    'Listing Details' as check_type,
    id,
    device_id,
    seller_id,
    title,
    price,
    status,
    created_at,
    expires_at
FROM public.marketplace_listings
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check if your device exists
SELECT 
    'Your Device' as check_type,
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

-- 5. Check RLS policies on marketplace_listings
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'marketplace_listings';

-- 6. Check if there are any foreign key constraints
SELECT 
    'Foreign Keys' as check_type,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='marketplace_listings';
