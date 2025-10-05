-- Check Admin Users and Super Admin Status
-- This script will help us understand the current admin setup

-- 1. Check all admin users
SELECT 
    'Admin Users' as check_type,
    au.id,
    au.user_id,
    au.role,
    au.permissions,
    au.is_active,
    au.created_at,
    u.email,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', 'No Name') as display_name
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at DESC;

-- 2. Check if kudzimusar@gmail.com exists in auth.users
SELECT 
    'Auth Users Check' as check_type,
    id,
    email,
    created_at,
    raw_user_meta_data->>'display_name' as display_name,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'kudzimusar@gmail.com';

-- 3. Check admin roles table
SELECT 
    'Admin Roles' as check_type,
    id,
    role_name,
    permissions,
    description
FROM admin_roles
ORDER BY id;

-- 4. Check if super admin role exists
SELECT 
    'Super Admin Role Check' as check_type,
    COUNT(*) as super_admin_count
FROM admin_roles 
WHERE role_name = 'super_admin';

-- 5. Check admin_users table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'admin_users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
