-- Check what enum values are valid for listing_status
-- This will tell us exactly what status values we can use

SELECT 
    'Enum Values for listing_status' as info,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%listing%' OR t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- Also check the marketplace_listings table structure
SELECT 
    'marketplace_listings table structure' as info,
    column_name, 
    data_type, 
    udt_name,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing listings and their status values
SELECT 
    'Existing listing statuses' as info,
    status,
    COUNT(*) as count
FROM public.marketplace_listings
GROUP BY status
ORDER BY count DESC;