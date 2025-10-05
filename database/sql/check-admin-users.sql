-- CHECK CURRENT ADMIN USERS
-- Run this to see all admin users and their credentials

-- Check all users
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', 'No Name') as display_name,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check admin users specifically
SELECT 
    au.user_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', 'No Name') as display_name,
    au.role,
    au.permissions,
    au.created_at
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at DESC;

-- Check if current user is admin
SELECT 
    'Current User Admin Status' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid()
        ) THEN 'IS ADMIN'
        ELSE 'NOT ADMIN'
    END as status;
