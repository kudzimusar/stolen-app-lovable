-- Ensure Super Admin User Exists
-- This script creates the super admin user if it doesn't exist

BEGIN;

-- 1. Check if admin_roles table exists and has super_admin role
DO $$
BEGIN
    -- Create admin_roles table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'admin_roles' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE admin_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_name TEXT UNIQUE NOT NULL,
            permissions JSONB NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Insert super_admin role if it doesn't exist
    INSERT INTO admin_roles (role_name, permissions, description, created_at, updated_at)
    VALUES (
        'super_admin', 
        '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings", "admin:security", "admin:audit"]'::jsonb,
        'Super Administrator with full system access and control',
        NOW(), NOW()
    )
    ON CONFLICT (role_name) DO NOTHING;
END $$;

-- 2. Check if admin_users table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'admin_users' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE admin_users (
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
    END IF;
END $$;

-- 3. Create super admin user for kudzimusar@gmail.com
DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_admin_user_id UUID;
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
        -- Check if admin user already exists
        SELECT id INTO v_admin_user_id
        FROM admin_users
        WHERE user_id = v_user_id;
        
        IF v_admin_user_id IS NULL THEN
            -- Insert new admin user
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
            );
            
            RAISE NOTICE 'Super admin user created for kudzimusar@gmail.com';
        ELSE
            -- Update existing admin user to ensure it's active
            UPDATE admin_users SET
                admin_role_id = v_role_id,
                role = 'super_admin',
                permissions = '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings", "admin:security", "admin:audit"]'::jsonb,
                employee_id = 'SUPER-001',
                department = 'IT',
                position = 'Super Administrator',
                is_active = true,
                updated_at = NOW()
            WHERE id = v_admin_user_id;
            
            RAISE NOTICE 'Super admin user updated for kudzimusar@gmail.com';
        END IF;
    ELSE
        IF v_user_id IS NULL THEN
            RAISE NOTICE 'User kudzimusar@gmail.com not found in auth.users table';
        END IF;
        IF v_role_id IS NULL THEN
            RAISE NOTICE 'super_admin role not found in admin_roles table';
        END IF;
    END IF;
END $$;

-- 4. Verification
SELECT 
    'SUPER ADMIN VERIFICATION' as check_type,
    'Admin Roles' as component,
    COUNT(*) as count,
    string_agg(role_name, ', ') as roles
FROM admin_roles;

SELECT 
    'SUPER ADMIN VERIFICATION' as check_type,
    'Admin Users' as component,
    COUNT(*) as count,
    string_agg(au.role || ' (' || u.email || ')', ', ') as users
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id;

SELECT 
    'SUPER ADMIN VERIFICATION' as check_type,
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
    END as status;

COMMIT;
