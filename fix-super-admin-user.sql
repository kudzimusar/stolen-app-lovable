-- Fix Super Admin User Setup
-- This script will ensure kudzimusar@gmail.com is properly set up as a super admin

BEGIN;

-- 1. First, check if the user exists in auth.users
SELECT 
    'Checking if kudzimusar@gmail.com exists in auth.users' as step,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'kudzimusar@gmail.com';

-- 2. If user doesn't exist, we need to create them
-- Note: This would typically be done through the auth system, but we can check if they exist

-- 3. Check if admin_roles table has super_admin role
SELECT 
    'Checking admin_roles table' as step,
    id,
    role_name,
    permissions
FROM admin_roles 
WHERE role_name = 'super_admin';

-- 4. If super_admin role doesn't exist, create it
INSERT INTO admin_roles (role_name, permissions, description, created_at, updated_at)
SELECT 
    'super_admin',
    '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings"]'::jsonb,
    'Super Administrator with full system access',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM admin_roles WHERE role_name = 'super_admin'
);

-- 5. Get the super_admin role ID
SELECT 
    'Super Admin Role ID' as step,
    id as super_admin_role_id
FROM admin_roles 
WHERE role_name = 'super_admin';

-- 6. Insert or update admin user for kudzimusar@gmail.com
-- This assumes the user exists in auth.users
INSERT INTO admin_users (
    user_id, 
    admin_role_id, 
    role, 
    permissions, 
    employee_id, 
    department, 
    position, 
    is_active, 
    created_at, 
    updated_at
)
SELECT 
    u.id as user_id,
    ar.id as admin_role_id,
    'super_admin' as role,
    '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings"]'::jsonb as permissions,
    'SUPER-001' as employee_id,
    'IT' as department,
    'Super Administrator' as position,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
CROSS JOIN admin_roles ar
WHERE u.email = 'kudzimusar@gmail.com'
AND ar.role_name = 'super_admin'
ON CONFLICT (user_id) DO UPDATE SET
    admin_role_id = EXCLUDED.admin_role_id,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    employee_id = EXCLUDED.employee_id,
    department = EXCLUDED.department,
    position = EXCLUDED.position,
    is_active = EXCLUDED.is_active,
    updated_at = EXCLUDED.updated_at;

-- 7. Verify the super admin user setup
SELECT 
    'Final Verification' as step,
    au.id,
    au.user_id,
    au.role,
    au.permissions,
    au.is_active,
    u.email,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', 'No Name') as display_name,
    ar.role_name as admin_role_name
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
WHERE u.email = 'kudzimusar@gmail.com';

-- 8. Test admin permissions function
SELECT 
    'Testing Admin Permissions' as step,
    is_admin_user((SELECT id FROM auth.users WHERE email = 'kudzimusar@gmail.com')) as is_admin,
    get_admin_permissions((SELECT id FROM auth.users WHERE email = 'kudzimusar@gmail.com')) as permissions;

COMMIT;
