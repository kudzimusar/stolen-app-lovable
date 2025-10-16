-- Discover the actual enum values that exist in your database
-- This will tell us exactly what status values we can use

-- 1. First, check if the marketplace_listings table exists
SELECT 
    'Table Existence Check' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as table_status;

-- 2. Check the actual enum type definition for the status column
SELECT 
    'Enum Type Definition' as info,
    t.typname as enum_type_name,
    e.enumlabel as valid_enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%listing%' 
   OR t.typname LIKE '%status%'
   OR t.typname LIKE '%marketplace%'
ORDER BY t.typname, e.enumsortorder;

-- 3. Check the marketplace_listings table structure
SELECT 
    'Table Column Info' as info,
    column_name, 
    data_type, 
    udt_name,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
    AND column_name = 'status'
ORDER BY ordinal_position;

-- 4. Check what status values are actually being used (if any data exists)
SELECT 
    'Actual Status Values in Use' as info,
    status,
    COUNT(*) as usage_count,
    MIN(created_at) as first_used,
    MAX(created_at) as last_used
FROM public.marketplace_listings
GROUP BY status
ORDER BY usage_count DESC;

-- 5. Show sample of any existing data
SELECT 
    'Sample Data' as info,
    id,
    title,
    price,
    status,
    created_at
FROM public.marketplace_listings
ORDER BY created_at DESC
LIMIT 5;
