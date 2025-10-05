-- Test Admin Login
-- This script tests if the admin system is working

-- 1. Check if tables exist
SELECT 
    'TABLE CHECK' as test_type,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_name IN ('admin_roles', 'admin_users')
AND table_schema = 'public'
ORDER BY table_name;

-- 2. Check admin roles
SELECT 
    'ROLE CHECK' as test_type,
    role_name,
    jsonb_array_length(permissions) as permission_count
FROM admin_roles
ORDER BY role_name;

-- 3. Check admin users
SELECT 
    'USER CHECK' as test_type,
    au.role,
    u.email,
    au.employee_id,
    au.department,
    au.is_active
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at;

-- 4. Test super admin specifically
SELECT 
    'SUPER ADMIN TEST' as test_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users au
            JOIN auth.users u ON au.user_id = u.id
            WHERE u.email = 'kudzimusar@gmail.com' 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        ) THEN 'SUPER ADMIN READY FOR LOGIN'
        ELSE 'SUPER ADMIN NOT READY'
    END as login_status;

-- 5. Check auth users
SELECT 
    'AUTH USER CHECK' as test_type,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'kudzimusar@gmail.com';
