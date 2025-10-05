-- Diagnose Admin Issue
-- This script helps identify what's wrong with the admin system

-- 1. Check if user exists in auth system
SELECT 
    'AUTH USER CHECK' as diagnostic,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'kudzimusar@gmail.com') 
        THEN 'USER EXISTS IN AUTH'
        ELSE 'USER NOT FOUND IN AUTH'
    END as result;

-- 2. Check if admin_roles table exists
SELECT 
    'ADMIN ROLES TABLE' as diagnostic,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_roles' AND table_schema = 'public') 
        THEN 'TABLE EXISTS'
        ELSE 'TABLE MISSING'
    END as result;

-- 3. Check if admin_users table exists
SELECT 
    'ADMIN USERS TABLE' as diagnostic,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users' AND table_schema = 'public') 
        THEN 'TABLE EXISTS'
        ELSE 'TABLE MISSING'
    END as result;

-- 4. Check if super_admin role exists
SELECT 
    'SUPER ADMIN ROLE' as diagnostic,
    CASE 
        WHEN EXISTS (SELECT 1 FROM admin_roles WHERE role_name = 'super_admin') 
        THEN 'ROLE EXISTS'
        ELSE 'ROLE MISSING'
    END as result;

-- 5. Check if admin user exists
SELECT 
    'ADMIN USER' as diagnostic,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users au
            JOIN auth.users u ON au.user_id = u.id
            WHERE u.email = 'kudzimusar@gmail.com'
        ) 
        THEN 'ADMIN USER EXISTS'
        ELSE 'ADMIN USER MISSING'
    END as result;

-- 6. Get detailed user info
SELECT 
    'DETAILED USER INFO' as diagnostic,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    au.role,
    au.is_active,
    au.department
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.user_id
WHERE u.email = 'kudzimusar@gmail.com';
