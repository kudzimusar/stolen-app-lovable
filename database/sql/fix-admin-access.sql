-- FIX ADMIN ACCESS WITH CORRECT EMAIL
-- Set up kudzimusar@gmail.com as Super Admin

BEGIN;

-- 1. UPDATE EXISTING ADMIN USER WITH CORRECT EMAIL
DO $$
DECLARE
    v_user_id UUID;
    v_super_admin_role_id UUID;
BEGIN
    -- Get the super admin role
    SELECT id INTO v_super_admin_role_id FROM admin_roles WHERE role_name = 'super_admin';
    
    -- Find existing user by correct email
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'kudzimusar@gmail.com';
    
    -- If user exists, update them as super admin
    IF v_user_id IS NOT NULL THEN
        -- Insert or update super admin with comprehensive data
        INSERT INTO admin_users (
            user_id, 
            admin_role_id, 
            employee_id, 
            department, 
            position, 
            permissions, 
            is_active,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            v_super_admin_role_id,
            'SUPER-001',
            'System Administration',
            'Super Administrator',
            '["admin:full", "admin:users", "admin:lost-found", "admin:marketplace", "admin:financial", "admin:security", "admin:system", "admin:reports"]'::jsonb,
            TRUE,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            admin_role_id = EXCLUDED.admin_role_id,
            employee_id = EXCLUDED.employee_id,
            department = EXCLUDED.department,
            position = EXCLUDED.position,
            permissions = EXCLUDED.permissions,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
            
        RAISE NOTICE 'Super admin user updated: %', v_user_id;
    ELSE
        RAISE NOTICE 'User kudzimusar@gmail.com not found. Please ensure the user is registered first.';
    END IF;
END $$;

-- 2. VERIFY ADMIN ACCESS
SELECT 
    'Admin Access Verification' as status,
    u.email,
    au.employee_id,
    ar.role_name,
    au.permissions,
    au.is_active
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
WHERE u.email = 'kudzimusar@gmail.com';

-- 3. SHOW ADMIN LOGIN INSTRUCTIONS
SELECT 
    'Admin Login Instructions' as info,
    'Email: kudzimusar@gmail.com' as email,
    'Use your existing password' as password,
    'Access: /admin/login' as login_url,
    'Dashboard: /admin/dashboard' as dashboard_url;

COMMIT;
