-- Simple Admin Setup - Bulletproof Version
-- This script creates the admin system step by step without any dependencies

-- Step 1: Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    permissions JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    permissions JSONB NOT NULL,
    employee_id TEXT,
    department TEXT,
    position TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert super_admin role
INSERT INTO admin_roles (role_name, permissions, description, created_at, updated_at)
VALUES (
    'super_admin', 
    '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings", "admin:security", "admin:audit"]'::jsonb,
    'Super Administrator with full system access and control',
    NOW(), NOW()
)
ON CONFLICT (role_name) DO NOTHING;

-- Step 4: Create super admin user for kudzimusar@gmail.com
DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- Get user ID for kudzimusar@gmail.com
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'kudzimusar@gmail.com';
    
    -- Get super_admin role ID
    SELECT id INTO v_role_id
    FROM admin_roles
    WHERE role_name = 'super_admin';
    
    -- If user exists, create admin user
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
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
        VALUES (
            v_user_id,
            v_role_id,
            'super_admin',
            '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings", "admin:security", "admin:audit"]'::jsonb,
            'SUPER-001',
            'IT',
            'Super Administrator',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            admin_role_id = EXCLUDED.admin_role_id,
            role = EXCLUDED.role,
            permissions = EXCLUDED.permissions,
            employee_id = EXCLUDED.employee_id,
            department = EXCLUDED.department,
            position = EXCLUDED.position,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at;
            
        RAISE NOTICE 'Super admin user created/updated for kudzimusar@gmail.com';
    ELSE
        IF v_user_id IS NULL THEN
            RAISE NOTICE 'User kudzimusar@gmail.com not found in auth.users table';
        END IF;
        IF v_role_id IS NULL THEN
            RAISE NOTICE 'super_admin role not found in admin_roles table';
        END IF;
    END IF;
END $$;

-- Step 5: Verification
SELECT 
    'ADMIN SETUP COMPLETE' as status,
    'Admin Roles' as component,
    COUNT(*) as count
FROM admin_roles;

SELECT 
    'ADMIN SETUP COMPLETE' as status,
    'Admin Users' as component,
    COUNT(*) as count,
    string_agg(au.role || ' (' || u.email || ')', ', ') as users
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id;

SELECT 
    'ADMIN SETUP COMPLETE' as status,
    'Super Admin Status' as component,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM admin_users au
            JOIN auth.users u ON au.user_id = u.id
            WHERE u.email = 'kudzimusar@gmail.com' 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        ) THEN 'SUPER ADMIN READY'
        ELSE 'SUPER ADMIN NOT FOUND'
    END as result;
