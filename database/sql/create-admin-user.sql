-- CREATE ADMIN USER QUICKLY
-- This creates a new admin user for immediate access

BEGIN;

-- Insert a new user into auth.users (this would normally be done through Supabase Auth)
-- For testing purposes, we'll assume the user exists and just add them to admin_users

-- Add current user as admin (replace with actual user ID if needed)
INSERT INTO admin_users (user_id, role, permissions, created_at, updated_at)
SELECT 
    id as user_id,
    'super_admin' as role,
    '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:financial"]'::jsonb as permissions,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users
WHERE email = 'musarurwa@stolen.com'  -- Change this to your email
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = EXCLUDED.updated_at;

-- Show current admin users
SELECT 
    'Admin Users' as table_name,
    au.user_id,
    u.email,
    u.display_name,
    au.role,
    au.permissions
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at DESC;

COMMIT;
