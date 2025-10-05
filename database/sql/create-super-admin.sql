-- CREATE SUPER ADMIN SYSTEM
-- This creates a comprehensive admin system with proper role-based access

BEGIN;

-- 1. CREATE ADMIN ROLES TABLE
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(100) NOT NULL UNIQUE,
    role_description TEXT,
    permissions JSONB NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. INSERT DEFAULT ADMIN ROLES
INSERT INTO admin_roles (role_name, role_description, permissions, department) VALUES
('super_admin', 'Super Administrator - Full system access', 
 '["admin:full", "admin:users", "admin:lost-found", "admin:marketplace", "admin:financial", "admin:security", "admin:system", "admin:reports"]'::jsonb, 
 'System Administration'),
('admin', 'Administrator - Department management access', 
 '["admin:users", "admin:lost-found", "admin:marketplace", "admin:reports"]'::jsonb, 
 'General Administration'),
('lost_found_admin', 'Lost & Found Administrator', 
 '["admin:lost-found", "admin:reports"]'::jsonb, 
 'Lost & Found Department'),
('marketplace_admin', 'Marketplace Administrator', 
 '["admin:marketplace", "admin:financial", "admin:reports"]'::jsonb, 
 'Marketplace Department'),
('security_admin', 'Security Administrator', 
 '["admin:security", "admin:users", "admin:reports"]'::jsonb, 
 'Security Department'),
('financial_admin', 'Financial Administrator', 
 '["admin:financial", "admin:marketplace", "admin:reports"]'::jsonb, 
 'Financial Department')
ON CONFLICT (role_name) DO NOTHING;

-- 3. ENHANCE EXISTING ADMIN USERS TABLE
-- Add missing columns to existing admin_users table with proper error handling
DO $$
DECLARE
    v_column_exists BOOLEAN;
BEGIN
    -- Add admin_role_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'admin_role_id'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN admin_role_id UUID REFERENCES admin_roles(id);
        RAISE NOTICE 'Added admin_role_id column to admin_users table';
    END IF;
    
    -- Add employee_id column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'employee_id'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN employee_id VARCHAR(50);
        -- Add unique constraint separately to avoid conflicts
        BEGIN
            ALTER TABLE admin_users ADD CONSTRAINT unique_employee_id UNIQUE (employee_id);
        EXCEPTION
            WHEN duplicate_object THEN
                RAISE NOTICE 'Unique constraint on employee_id already exists';
        END;
        RAISE NOTICE 'Added employee_id column to admin_users table';
    END IF;
    
    -- Add department column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'department'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN department VARCHAR(100);
        RAISE NOTICE 'Added department column to admin_users table';
    END IF;
    
    -- Add position column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'position'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN position VARCHAR(100);
        RAISE NOTICE 'Added position column to admin_users table';
    END IF;
    
    -- Add is_active column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        -- Update existing records to be active
        UPDATE admin_users SET is_active = TRUE WHERE is_active IS NULL;
        RAISE NOTICE 'Added is_active column to admin_users table';
    END IF;
    
    -- Add last_login column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'last_login'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP;
        RAISE NOTICE 'Added last_login column to admin_users table';
    END IF;
    
    -- Add created_by column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added created_by column to admin_users table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE admin_users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        -- Update existing records
        UPDATE admin_users SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at column to admin_users table';
    END IF;
    
    RAISE NOTICE 'Admin users table enhancement completed successfully';
END $$;

-- 4. CREATE SUPER ADMIN USER
-- First, let's find or create the user
DO $$
DECLARE
    v_user_id UUID;
    v_super_admin_role_id UUID;
BEGIN
    -- Get the super admin role
    SELECT id INTO v_super_admin_role_id FROM admin_roles WHERE role_name = 'super_admin';
    
    -- Find existing user by email (replace with your actual email)
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'musarurwa@stolen.com';
    
    -- If user doesn't exist, we'll need to create them through Supabase Auth
    -- For now, let's assume they exist and add them as super admin
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
            
        RAISE NOTICE 'Super admin user created/updated: %', v_user_id;
    ELSE
        RAISE NOTICE 'User not found. Please create user through Supabase Auth first.';
    END IF;
END $$;

-- 5. CREATE ADMIN LOGIN TRACKING
CREATE TABLE IF NOT EXISTS admin_login_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    login_time TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    login_successful BOOLEAN DEFAULT TRUE,
    failure_reason TEXT
);

-- 6. CREATE ADMIN SESSION MANAGEMENT
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- 7. CREATE ADMIN PERMISSION FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin_user(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = p_user_id 
        AND au.is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_admin_permissions(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_permissions JSONB;
BEGIN
    SELECT au.permissions INTO v_permissions
    FROM admin_users au
    WHERE au.user_id = p_user_id 
    AND au.is_active = TRUE;
    
    RETURN COALESCE(v_permissions, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_admin_permission(p_user_id UUID, p_permission VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
BEGIN
    v_permissions := get_admin_permissions(p_user_id);
    RETURN v_permissions ? p_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE ADMIN DASHBOARD STATS FUNCTION
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(p_admin_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_permissions JSONB;
    v_stats JSON;
BEGIN
    -- Get the user ID from admin user ID
    SELECT user_id INTO v_user_id FROM admin_users WHERE id = p_admin_user_id;
    
    -- Get permissions
    v_permissions := get_admin_permissions(v_user_id);
    
    -- Build stats based on permissions
    v_stats := json_build_object(
        'total_users', (
            CASE WHEN v_permissions ? 'admin:users' OR v_permissions ? 'admin:full' 
            THEN (SELECT COUNT(*) FROM auth.users) 
            ELSE 0 END
        ),
        'active_reports', (
            CASE WHEN v_permissions ? 'admin:lost-found' OR v_permissions ? 'admin:full' 
            THEN (SELECT COUNT(*) FROM lost_found_reports WHERE status != 'deleted') 
            ELSE 0 END
        ),
        'pending_approvals', (
            CASE WHEN v_permissions ? 'admin:lost-found' OR v_permissions ? 'admin:full' 
            THEN (SELECT COUNT(*) FROM lost_found_reports WHERE status = 'pending_verification') 
            ELSE 0 END
        ),
        'total_transactions', (
            CASE WHEN v_permissions ? 'admin:financial' OR v_permissions ? 'admin:full' 
            THEN 0 -- TODO: Add when marketplace is ready
            ELSE 0 END
        ),
        'revenue', (
            CASE WHEN v_permissions ? 'admin:financial' OR v_permissions ? 'admin:full' 
            THEN 0 -- TODO: Add when payment system is ready
            ELSE 0 END
        ),
        'recovery_rate', (
            CASE WHEN v_permissions ? 'admin:lost-found' OR v_permissions ? 'admin:full' 
            THEN (
                SELECT CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    ELSE ROUND((COUNT(*) FILTER (WHERE status = 'reunited')::DECIMAL / COUNT(*)) * 100, 2)
                END
                FROM lost_found_reports 
                WHERE status IN ('reunited', 'active', 'contacted', 'pending_verification')
            )
            ELSE 0 END
        )
    );
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_login_log_admin_user ON admin_login_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- 10. CREATE ROW LEVEL SECURITY
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Admin users can only see their own records unless they're super admin
CREATE POLICY admin_users_policy ON admin_users
    FOR ALL USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.permissions ? 'admin:full'
        )
    );

-- 11. FINAL VERIFICATION
SELECT 
    'Super Admin System Created' as status,
    'Admin system with role-based access implemented' as message,
    NOW() as completion_time;

-- Show admin roles
SELECT 
    'Admin Roles' as table_name,
    role_name,
    role_description,
    department
FROM admin_roles
ORDER BY role_name;

-- Show current admin users with comprehensive details
SELECT 
    'Current Admin Users' as table_name,
    au.employee_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', 'No Name') as display_name,
    ar.role_name,
    ar.role_description,
    au.department,
    au.position,
    au.permissions,
    au.is_active,
    au.last_login,
    au.created_at,
    au.updated_at
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
ORDER BY au.created_at DESC;

-- Show admin system statistics
SELECT 
    'Admin System Statistics' as report_type,
    (SELECT COUNT(*) FROM admin_roles) as total_roles,
    (SELECT COUNT(*) FROM admin_users WHERE is_active = TRUE) as active_admins,
    (SELECT COUNT(*) FROM admin_users WHERE is_active = FALSE) as inactive_admins,
    (SELECT COUNT(*) FROM admin_login_log WHERE login_successful = TRUE) as successful_logins,
    (SELECT COUNT(*) FROM admin_login_log WHERE login_successful = FALSE) as failed_logins;

COMMIT;
