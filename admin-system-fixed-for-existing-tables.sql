-- ============================================================================
-- COMPREHENSIVE ADMIN SYSTEM SETUP SCRIPT - FIXED FOR EXISTING TABLES
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: BASE TABLE CREATION WITH COLUMN ADDITION LOGIC
-- ============================================================================

-- 1.1 Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT UNIQUE NOT NULL,
    permissions JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Create admin_users table
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

-- 1.3 Create admin_onboarding_log table
CREATE TABLE IF NOT EXISTS admin_onboarding_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarding_method TEXT DEFAULT 'manual',
    onboarding_notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRITICAL FIX: Add admin_user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'admin_onboarding_log' 
        AND column_name = 'admin_user_id'
    ) THEN
        ALTER TABLE admin_onboarding_log 
        ADD COLUMN admin_user_id UUID;
        
        RAISE NOTICE 'Added admin_user_id column to admin_onboarding_log';
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public'
        AND table_name = 'admin_onboarding_log' 
        AND constraint_name = 'admin_onboarding_log_admin_user_id_fkey'
    ) THEN
        ALTER TABLE admin_onboarding_log 
        ADD CONSTRAINT admin_onboarding_log_admin_user_id_fkey 
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for admin_user_id';
    END IF;
END $$;

-- 1.4 Create admin_sessions table
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

-- 1.5 Create admin_activity_log table
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

-- ============================================================================
-- SECTION 2: REFERENCE DATA INSERTION
-- ============================================================================

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

-- ============================================================================
-- SECTION 3: PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_onboarding_log_admin_user ON admin_onboarding_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_type ON admin_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created ON admin_activity_log(created_at);

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_onboarding_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_roles_policy ON admin_roles;
DROP POLICY IF EXISTS admin_users_policy ON admin_users;
DROP POLICY IF EXISTS admin_onboarding_log_policy ON admin_onboarding_log;
DROP POLICY IF EXISTS admin_sessions_policy ON admin_sessions;
DROP POLICY IF EXISTS admin_activity_log_policy ON admin_activity_log;

CREATE POLICY admin_roles_policy ON admin_roles
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY admin_users_policy ON admin_users
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY admin_onboarding_log_policy ON admin_onboarding_log
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY admin_sessions_policy ON admin_sessions
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY admin_activity_log_policy ON admin_activity_log
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

-- ============================================================================
-- SECTION 5: FUNCTIONS (CREATE OR REPLACE)
-- ============================================================================

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
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found in auth system', 'email', p_user_email);
    END IF;
    
    SELECT id INTO v_role_id FROM admin_roles WHERE role_name = p_role_name;
    
    IF v_role_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Admin role not found', 'role', p_role_name);
    END IF;
    
    SELECT id INTO v_admin_user_id FROM admin_users WHERE user_id = v_user_id;
    
    IF v_admin_user_id IS NULL THEN
        INSERT INTO admin_users (user_id, admin_role_id, role, permissions, employee_id, department, position, is_active, created_at, updated_at)
        VALUES (v_user_id, v_role_id, p_role_name, (SELECT permissions FROM admin_roles WHERE id = v_role_id), p_employee_id, p_department, p_position, true, NOW(), NOW())
        RETURNING id INTO v_admin_user_id;
        
        INSERT INTO admin_onboarding_log (admin_user_id, onboarding_method, onboarding_notes, created_by)
        VALUES (v_admin_user_id, 'function_onboard', COALESCE(p_onboarding_notes, 'Onboarded via onboard_admin_user function'), v_user_id);
        
        RETURN json_build_object('success', true, 'admin_user_id', v_admin_user_id, 'action', 'created', 'message', 'New admin user created successfully');
    ELSE
        UPDATE admin_users SET admin_role_id = v_role_id, role = p_role_name, permissions = (SELECT permissions FROM admin_roles WHERE id = v_role_id), 
               employee_id = p_employee_id, department = p_department, position = p_position, is_active = true, updated_at = NOW()
        WHERE id = v_admin_user_id;
        
        INSERT INTO admin_onboarding_log (admin_user_id, onboarding_method, onboarding_notes, created_by)
        VALUES (v_admin_user_id, 'function_update', COALESCE(p_onboarding_notes, 'Admin user updated'), v_user_id);
        
        RETURN json_build_object('success', true, 'admin_user_id', v_admin_user_id, 'action', 'updated', 'message', 'Admin user updated successfully');
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_active_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_user_id AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_user_id UUID, p_activity_type TEXT, p_activity_description TEXT,
    p_target_table TEXT DEFAULT NULL, p_target_record_id UUID DEFAULT NULL, p_activity_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE v_log_id UUID;
BEGIN
    INSERT INTO admin_activity_log (admin_user_id, activity_type, activity_description, target_table, target_record_id, activity_data)
    VALUES (p_admin_user_id, p_activity_type, p_activity_description, p_target_table, p_target_record_id, p_activity_data)
    RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 6: INITIAL ADMIN USER CREATION
-- ============================================================================

DO $$
DECLARE v_user_exists BOOLEAN; v_result JSON;
BEGIN
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'kudzimusar@gmail.com') INTO v_user_exists;
    
    IF v_user_exists THEN
        SELECT onboard_admin_user('kudzimusar@gmail.com', 'super_admin', 'SUPER-001', 'IT', 'Super Administrator', 'Initial setup') INTO v_result;
        RAISE NOTICE 'Super admin result: %', v_result;
    ELSE
        RAISE NOTICE 'User kudzimusar@gmail.com not found in auth.users';
    END IF;
END $$;

-- ============================================================================
-- SECTION 7: VERIFICATION
-- ============================================================================

DO $$
DECLARE v_roles_count INTEGER; v_users_count INTEGER; v_super_admin_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO v_roles_count FROM admin_roles;
    SELECT COUNT(*) INTO v_users_count FROM admin_users;
    SELECT EXISTS(SELECT 1 FROM admin_users au JOIN auth.users u ON au.user_id = u.id WHERE u.email = 'kudzimusar@gmail.com' AND au.role = 'super_admin') INTO v_super_admin_exists;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ADMIN SYSTEM SETUP COMPLETE';
    RAISE NOTICE 'Roles: % | Users: % | Super Admin: %', v_roles_count, v_users_count, v_super_admin_exists;
    RAISE NOTICE '========================================';
END $$;

SELECT 'Admin Roles' as category, role_name, description FROM admin_roles ORDER BY role_name;
SELECT 'Admin Users' as category, u.email, au.role, au.is_active FROM admin_users au JOIN auth.users u ON au.user_id = u.id;

COMMIT;
