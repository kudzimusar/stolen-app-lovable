-- Test SQL Fixes - Simplified Version
-- This script tests the critical security fixes

-- 1. Check if functions exist
SELECT 
    'Function Existence Check' as test_type,
    proname as function_name,
    CASE 
        WHEN proname = 'hash_serial_number' THEN 'Serial hashing function'
        WHEN proname = 'show_partial_serial' THEN 'Partial serial display function'
        ELSE 'Other function'
    END as function_description
FROM pg_proc 
WHERE proname IN ('hash_serial_number', 'show_partial_serial')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 2. Test functions if they exist
DO $$
BEGIN
    -- Test hash_serial_number function
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'hash_serial_number' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE 'hash_serial_number function exists and works: %', hash_serial_number('TEST123456789');
    ELSE
        RAISE NOTICE 'hash_serial_number function does not exist yet';
    END IF;
    
    -- Test show_partial_serial function
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'show_partial_serial' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE 'show_partial_serial function exists and works: %', show_partial_serial('TEST123456789');
    ELSE
        RAISE NOTICE 'show_partial_serial function does not exist yet';
    END IF;
END $$;

-- 3. Check if admin_roles table has description column
SELECT 
    'Admin roles table structure' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'admin_roles' 
AND column_name = 'description'
AND table_schema = 'public';

-- 4. Check if lost_found_reports has claimant columns
SELECT 
    'Lost found reports claimant columns' as test_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports' 
AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof')
AND table_schema = 'public'
ORDER BY column_name;

-- 5. Check if ownership_verification table exists
SELECT 
    'Ownership verification table' as test_type,
    COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'ownership_verification' 
AND table_schema = 'public';

-- 6. Check super_admin role exists
SELECT 
    'Super admin role check' as test_type,
    role_name,
    description
FROM admin_roles 
WHERE role_name = 'super_admin';

-- 7. Test serial number hashing on existing data
SELECT 
    'Serial number hashing test' as test_type,
    id,
    device_model,
    serial_number,
    CASE 
        WHEN serial_number LIKE '%***%' THEN 'Already hashed/partial'
        WHEN LENGTH(serial_number) > 10 THEN 'Needs hashing'
        ELSE 'Short serial'
    END as serial_status
FROM lost_found_reports 
WHERE serial_number IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
