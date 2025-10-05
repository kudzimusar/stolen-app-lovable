-- FIX ADMIN ACCESS WITH CORRECT EMAIL
-- Set up kudzimusar@gmail.com as Super Admin

BEGIN;

-- 0. FIRST, ENSURE ADMIN ROLES EXIST
INSERT INTO admin_roles (role_name, permissions, description) VALUES
('super_admin', '["admin:full"]', 'Super Administrator with full system access'),
('admin', '["admin:users", "admin:lost-found", "admin:marketplace", "admin:reports"]', 'General Administrator'),
('lost_found_admin', '["admin:lost-found", "admin:reports"]', 'Lost & Found Administrator'),
('marketplace_admin', '["admin:marketplace", "admin:financial", "admin:reports"]', 'Marketplace Administrator'),
('security_admin', '["admin:security", "admin:users", "admin:reports"]', 'Security Administrator'),
('financial_admin', '["admin:financial", "admin:marketplace", "admin:reports"]', 'Financial Administrator')
ON CONFLICT (role_name) DO NOTHING;

-- 0.1. ENSURE admin_role_id COLUMN EXISTS IN admin_users TABLE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'admin_role_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN admin_role_id UUID REFERENCES admin_roles(id);
        RAISE NOTICE 'Added admin_role_id column to admin_users table';
    END IF;
END $$;

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
            role,
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
            'super_admin',
            'SUPER-001',
            'System Administration',
            'Super Administrator',
            '["admin:full", "admin:users", "admin:lost-found", "admin:marketplace", "admin:financial", "admin:security", "admin:system", "admin:reports"]'::jsonb,
            TRUE,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            admin_role_id = EXCLUDED.admin_role_id,
            role = EXCLUDED.role,
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

-- 4. FIX RLS POLICIES TO PREVENT INFINITE RECURSION
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view all data" ON admin_users;
DROP POLICY IF EXISTS "admin_users_policy" ON admin_users;

-- Create a simple, non-recursive policy for admin_users
CREATE POLICY "admin_users_access_policy" ON admin_users
    FOR ALL USING (
        -- Allow access if user is authenticated and either:
        -- 1. They are accessing their own admin record, OR
        -- 2. They are a super admin (but we can't check this without recursion)
        auth.uid() = user_id
    );

-- 5. VERIFY THE FIX
SELECT 
    'RLS Policy Fix Applied' as status,
    'Admin users table policies updated to prevent recursion' as message;

COMMIT;
