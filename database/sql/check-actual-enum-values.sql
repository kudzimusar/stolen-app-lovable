-- Simple script to check what enum values actually exist
-- This will tell us exactly what status values we can use

-- 1. Check all enum types in the database
SELECT 
    'All Enum Types' as info,
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
ORDER BY t.typname, e.enumsortorder;

-- 2. Check marketplace_listings table structure specifically
SELECT 
    'marketplace_listings columns' as info,
    column_name, 
    data_type, 
    udt_name,
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
    AND column_name = 'status';

-- 3. Check if table exists and has any data
SELECT 
    'Table exists check' as info,
    COUNT(*) as total_rows
FROM public.marketplace_listings;
