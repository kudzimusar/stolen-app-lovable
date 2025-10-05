-- ============================================================================
-- DIAGNOSE ADMIN LOGIN ISSUE
-- ============================================================================
-- This script will help identify why the admin login is still failing
-- ============================================================================

-- 1. Check if the user exists in auth.users
SELECT 
    'Auth User Check' as test_type,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'kudzimusar@gmail.com';

-- 2. Check if admin_users table exists and has data
SELECT 
    'Admin Users Table Check' as test_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM admin_users;

-- 3. Check if the specific user is in admin_users
SELECT 
    'Specific Admin User Check' as test_type,
    au.id,
    au.user_id,
    au.role,
    au.is_active,
    au.employee_id,
    au.department,
    u.email
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'kudzimusar@gmail.com';

-- 4. Check RLS policies on admin_users table
SELECT 
    'RLS Policy Check' as test_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 5. Test the exact query that's failing (simulate what the frontend does)
-- This will help us see if it's an RLS issue
SELECT 
    'Frontend Query Simulation' as test_type,
    au.*,
    ar.role_name,
    ar.permissions,
    ar.description
FROM admin_users au
LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
WHERE au.user_id = (
    SELECT id FROM auth.users WHERE email = 'kudzimusar@gmail.com'
)
AND au.is_active = true;

-- 6. Check if there are any foreign key constraint issues
SELECT 
    'Foreign Key Check' as test_type,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
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
AND tc.table_name = 'admin_users';

-- 7. Check if the user_id from the error matches what we have
-- The error showed: user_id=eq.f67127ff-3fee-4949-b60f-28b16e1027d3
SELECT 
    'User ID Match Check' as test_type,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM auth.users 
            WHERE id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
        ) THEN 'USER_ID_EXISTS'
        ELSE 'USER_ID_NOT_FOUND'
    END as user_id_status,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM admin_users 
            WHERE user_id = 'f67127ff-3fee-4949-b60f-28b16e1027d3'
        ) THEN 'ADMIN_RECORD_EXISTS'
        ELSE 'ADMIN_RECORD_NOT_FOUND'
    END as admin_record_status;
