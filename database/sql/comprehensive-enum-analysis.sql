-- Comprehensive enum analysis for marketplace_listings table
-- This will tell us exactly what status values are valid

-- 1. Check all enum types in the database
SELECT 
    'All Enum Types' as analysis_type,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%listing%' 
   OR t.typname LIKE '%status%'
   OR t.typname LIKE '%marketplace%'
ORDER BY t.typname, e.enumsortorder;

-- 2. Check the marketplace_listings table structure in detail
SELECT 
    'Table Structure Analysis' as analysis_type,
    column_name, 
    data_type, 
    udt_name,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if the table exists and has any data
SELECT 
    'Table Existence Check' as analysis_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings' AND table_schema = 'public') 
        THEN 'EXISTS' 
        ELSE 'DOES NOT EXIST' 
    END as table_status;

-- 4. If table exists, check what status values are actually being used
SELECT 
    'Actual Status Values in Use' as analysis_type,
    status,
    COUNT(*) as usage_count,
    MIN(created_at) as first_used,
    MAX(created_at) as last_used
FROM public.marketplace_listings
GROUP BY status
ORDER BY usage_count DESC;

-- 5. Check constraints on the status column
SELECT 
    'Status Column Constraints' as analysis_type,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'marketplace_listings'
    AND kcu.column_name = 'status';
