-- Admin Onboarding System
-- This script sets up the complete admin system and creates initial admin users

BEGIN;

-- 1. Create admin_roles table first
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    permissions JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin_users table
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

-- 3. Create comprehensive admin roles if they don't exist
INSERT INTO admin_roles (role_name, permissions, description, created_at, updated_at)
VALUES 
    ('super_admin', 
     '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings", "admin:security", "admin:audit"]'::jsonb,
     'Super Administrator with full system access and control',
     NOW(), NOW()),
    ('admin_manager', 
     '["admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics"]'::jsonb,
     'Administrative Manager with oversight of core features',
     NOW(), NOW()),
    ('lost_found_admin', 
     '["admin:lost-found", "admin:users"]'::jsonb,
     'Lost and Found specialist administrator',
     NOW(), NOW()),
    ('marketplace_admin', 
     '["admin:marketplace", "admin:users"]'::jsonb,
     'Marketplace and trading administrator',
     NOW(), NOW()),
    ('support_admin', 
     '["admin:users", "admin:analytics"]'::jsonb,
     'Customer support and user management administrator',
     NOW(), NOW()),
    ('security_admin', 
     '["admin:security", "admin:audit", "admin:users"]'::jsonb,
     'Security and compliance administrator',
     NOW(), NOW()),
    ('s_pay_admin', 
     '["admin:s-pay", "admin:payments", "admin:transactions", "admin:users"]'::jsonb,
     'S-Pay payment system administrator',
     NOW(), NOW()),
    ('law_enforcement_admin', 
     '["admin:law-enforcement", "admin:lost-found", "admin:security", "admin:audit"]'::jsonb,
     'Law Enforcement integration administrator',
     NOW(), NOW()),
    ('insurance_admin', 
     '["admin:insurance", "admin:claims", "admin:users", "admin:analytics"]'::jsonb,
     'Insurance and claims administrator',
     NOW(), NOW()),
    ('repair_admin', 
     '["admin:repairs", "admin:technicians", "admin:users", "admin:analytics"]'::jsonb,
     'Repair and technician management administrator',
     NOW(), NOW()),
    ('community_admin', 
     '["admin:community", "admin:tips", "admin:users", "admin:moderation"]'::jsonb,
     'Community engagement and tips administrator',
     NOW(), NOW()),
    ('analytics_admin', 
     '["admin:analytics", "admin:reports", "admin:dashboard", "admin:data"]'::jsonb,
     'Analytics and reporting administrator',
     NOW(), NOW()),
    ('system_admin', 
     '["admin:system", "admin:settings", "admin:maintenance", "admin:backup"]'::jsonb,
     'System maintenance and configuration administrator',
     NOW(), NOW()),
    ('finance_admin', 
     '["admin:finance", "admin:payments", "admin:transactions", "admin:reports"]'::jsonb,
     'Financial operations and transaction administrator',
     NOW(), NOW()),
    ('customer_support_admin', 
     '["admin:support", "admin:tickets", "admin:users", "admin:communication"]'::jsonb,
     'Customer support and ticket management administrator',
     NOW(), NOW()),
    ('retailer_admin', 
     '["admin:retailers", "admin:inventory", "admin:orders", "admin:users", "admin:analytics"]'::jsonb,
     'Retailer and inventory management administrator',
     NOW(), NOW())
ON CONFLICT (role_name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

-- 4. Create initial admin users
-- Note: These users need to exist in auth.users first
-- We'll create them with placeholder data that can be updated

-- Super Admin (kudzimusar@gmail.com)
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
    '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings", "admin:security", "admin:audit"]'::jsonb as permissions,
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

-- 5. Create admin onboarding log table with proper structure
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'admin_onboarding_log' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE admin_onboarding_log (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            admin_user_id UUID,
            onboarding_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            onboarding_method TEXT DEFAULT 'manual',
            onboarding_notes TEXT,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Add the admin_user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_onboarding_log' 
        AND column_name = 'admin_user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE admin_onboarding_log ADD COLUMN admin_user_id UUID;
    END IF;
END $$;

-- 6. Add foreign key constraint to admin_onboarding_log after admin_users table exists
DO $$
BEGIN
    -- Only add foreign key if admin_users table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'admin_users' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'admin_onboarding_log' 
            AND constraint_name = 'admin_onboarding_log_admin_user_id_fkey'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE admin_onboarding_log DROP CONSTRAINT admin_onboarding_log_admin_user_id_fkey;
        END IF;
        
        -- Add the foreign key constraint
        ALTER TABLE admin_onboarding_log 
        ADD CONSTRAINT admin_onboarding_log_admin_user_id_fkey 
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. Create admin session management table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_description TEXT NOT NULL,
    target_table TEXT,
    target_record_id UUID,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at);

-- 10. Add RLS policies for admin tables
ALTER TABLE admin_onboarding_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin onboarding log policies
CREATE POLICY admin_onboarding_log_policy ON admin_onboarding_log
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

-- Admin sessions policies
CREATE POLICY admin_sessions_policy ON admin_sessions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

-- Admin activity log policies
CREATE POLICY admin_activity_log_policy ON admin_activity_log
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

-- 11. Create admin onboarding function
CREATE OR REPLACE FUNCTION onboard_admin_user(
    p_user_email TEXT,
    p_role_name TEXT,
    p_employee_id TEXT,
    p_department TEXT,
    p_position TEXT,
    p_onboarding_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_admin_user_id UUID;
    v_result JSON;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_user_email;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found in auth system'
        );
    END IF;
    
    -- Get role ID
    SELECT id INTO v_role_id
    FROM admin_roles
    WHERE role_name = p_role_name;
    
    IF v_role_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Admin role not found'
        );
    END IF;
    
    -- Check if admin user already exists
    SELECT id INTO v_admin_user_id
    FROM admin_users
    WHERE user_id = v_user_id;
    
    -- Insert or update admin user
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
            p_role_name,
            (SELECT permissions FROM admin_roles WHERE id = v_role_id),
            p_employee_id,
            p_department,
            p_position,
            true,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_admin_user_id;
    ELSE
        -- Update existing admin user
        UPDATE admin_users SET
            admin_role_id = v_role_id,
            role = p_role_name,
            permissions = (SELECT permissions FROM admin_roles WHERE id = v_role_id),
            employee_id = p_employee_id,
            department = p_department,
            position = p_position,
            is_active = true,
            updated_at = NOW()
        WHERE id = v_admin_user_id;
    END IF;
    
    -- Log onboarding (only if we have a valid admin_user_id)
    IF v_admin_user_id IS NOT NULL THEN
        INSERT INTO admin_onboarding_log (
            admin_user_id,
            onboarding_notes,
            created_by
        )
        VALUES (
            v_admin_user_id,
            p_onboarding_notes,
            v_user_id
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'admin_user_id', v_admin_user_id,
        'message', 'Admin user onboarded successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- 12. Final verification
SELECT 
    'FINAL ADMIN SYSTEM VERIFICATION' as check_type,
    'Admin Roles Created' as component,
    COUNT(*) as count,
    string_agg(role_name, ', ') as roles
FROM admin_roles;

SELECT 
    'FINAL ADMIN SYSTEM VERIFICATION' as check_type,
    'Admin Users Created' as component,
    COUNT(*) as count,
    string_agg(au.role || ' (' || u.email || ')', ', ') as users
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id;

SELECT 
    'FINAL ADMIN SYSTEM VERIFICATION' as check_type,
    'Supporting Tables' as component,
    COUNT(*) as count,
    string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_name IN ('admin_onboarding_log', 'admin_sessions', 'admin_activity_log')
AND table_schema = 'public';

COMMIT;
