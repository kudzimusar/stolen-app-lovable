-- ============================================================================
-- TEST ADMIN DATABASE STATE
-- ============================================================================
-- This script checks if the admin system is properly set up
-- ============================================================================

-- Check if admin tables exist
SELECT 
    'Table Check' as test_type,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_roles', 'admin_users', 'admin_onboarding_log', 'admin_sessions', 'admin_activity_log')
ORDER BY table_name;

-- Check if admin_roles has data
SELECT 
    'Admin Roles Count' as test_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS_DATA' ELSE 'EMPTY' END as status
FROM admin_roles;

-- Check if admin_users has data
SELECT 
    'Admin Users Count' as test_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN 'HAS_DATA' ELSE 'EMPTY' END as status
FROM admin_users;

-- Check if kudzimusar@gmail.com exists in auth.users
SELECT 
    'Auth User Check' as test_type,
    email,
    'EXISTS' as status
FROM auth.users 
WHERE email = 'kudzimusar@gmail.com';

-- Check if kudzimusar@gmail.com is an admin
SELECT 
    'Admin User Check' as test_type,
    u.email,
    au.role,
    au.is_active,
    'ADMIN_EXISTS' as status
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'kudzimusar@gmail.com';

-- Check RLS policies
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
AND tablename IN ('admin_roles', 'admin_users', 'admin_onboarding_log', 'admin_sessions', 'admin_activity_log')
ORDER BY tablename, policyname;
