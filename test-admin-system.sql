-- Test Admin System
-- This script tests the admin system functionality

-- 1. Check if all required tables exist
SELECT 
    'TABLE CHECK' as test_type,
    table_name,
    CASE 
        WHEN table_name IN ('admin_roles', 'admin_users', 'admin_onboarding_log', 'admin_sessions', 'admin_activity_log') 
        THEN 'REQUIRED TABLE'
        ELSE 'OPTIONAL TABLE'
    END as table_status
FROM information_schema.tables 
WHERE table_name LIKE 'admin_%'
AND table_schema = 'public'
ORDER BY table_name;

-- 2. Check admin roles
SELECT 
    'ADMIN ROLES CHECK' as test_type,
    role_name,
    jsonb_array_length(permissions) as permission_count,
    description
FROM admin_roles
ORDER BY role_name;

-- 3. Check admin users
SELECT 
    'ADMIN USERS CHECK' as test_type,
    au.role,
    u.email,
    au.employee_id,
    au.department,
    au.position,
    au.is_active,
    au.created_at
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at;

-- 4. Test the onboard_admin_user function
SELECT 
    'FUNCTION TEST' as test_type,
    'onboard_admin_user function exists' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'onboard_admin_user' 
            AND routine_schema = 'public'
        ) THEN 'FUNCTION EXISTS'
        ELSE 'FUNCTION MISSING'
    END as test_result;

-- 5. Check if super admin exists
SELECT 
    'SUPER ADMIN CHECK' as test_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users au
            JOIN auth.users u ON au.user_id = u.id
            WHERE u.email = 'kudzimusar@gmail.com' 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        ) THEN 'SUPER ADMIN READY'
        ELSE 'SUPER ADMIN MISSING'
    END as super_admin_status;

-- 6. Check table constraints
SELECT 
    'CONSTRAINT CHECK' as test_type,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name LIKE 'admin_%'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
