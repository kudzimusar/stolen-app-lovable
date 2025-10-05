-- ============================================================================
-- DIAGNOSE ADMIN TABLES - CHECK CURRENT STATE
-- ============================================================================

-- Check if admin_onboarding_log table exists and its structure
SELECT 
    'admin_onboarding_log table structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admin_onboarding_log'
ORDER BY ordinal_position;

-- Check if admin_users table exists
SELECT 
    'admin_users table structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- Check if admin_roles table exists
SELECT 
    'admin_roles table structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'admin_roles'
ORDER BY ordinal_position;

-- Check existing functions
SELECT 
    'existing functions' as check_type,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%admin%'
ORDER BY routine_name;

-- Check table constraints
SELECT 
    'table constraints' as check_type,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name IN ('admin_onboarding_log', 'admin_users', 'admin_roles')
ORDER BY tc.table_name, tc.constraint_name;
