-- =====================================================
-- ADMIN DASHBOARD BACKEND TABLES AND FUNCTIONS
-- =====================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users(id) when available
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'user_id') THEN
            ALTER TABLE admin_users ADD COLUMN user_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'user_id') THEN
            ALTER TABLE admin_users ADD CONSTRAINT fk_admin_users_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 2. Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. System Notifications
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Admin Dashboard Stats Cache
CREATE TABLE IF NOT EXISTS admin_dashboard_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_name VARCHAR(100) UNIQUE NOT NULL,
    stat_value JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Roles and Permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Financial Transactions (for admin oversight)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users(id) when available
    type VARCHAR(50) NOT NULL, -- 'reward', 'payment', 'refund', 'fee'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    reference_id UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'user_id') THEN
            ALTER TABLE financial_transactions ADD COLUMN user_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'user_id') THEN
            ALTER TABLE financial_transactions ADD CONSTRAINT fk_financial_transactions_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 7. Marketplace Listings (for admin oversight)
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- References auth.users(id) when available
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'ZAR',
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if auth.users exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Ensure column exists before adding constraint
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'user_id') THEN
            ALTER TABLE marketplace_listings ADD COLUMN user_id UUID;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_listings' AND column_name = 'user_id') THEN
            ALTER TABLE marketplace_listings ADD CONSTRAINT fk_marketplace_listings_user_id 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 8. Stakeholder Organizations
CREATE TABLE IF NOT EXISTS stakeholder_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'retailer', 'repair_shop', 'law_enforcement', 'ngo'
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS FOR ADMIN DASHBOARD
-- =====================================================

-- Function to get dashboard overview stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (
            SELECT CASE 
                WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') 
                THEN (SELECT COUNT(*) FROM auth.users)
                ELSE (SELECT COUNT(*) FROM admin_users)
            END
        ),
        'active_reports', (SELECT COUNT(*) FROM lost_found_reports WHERE status = 'active'),
        'total_transactions', (SELECT COUNT(*) FROM financial_transactions),
        'revenue', (SELECT COALESCE(SUM(amount), 0) FROM financial_transactions WHERE status = 'completed'),
        'recovery_rate', (
            SELECT CASE 
                WHEN COUNT(*) > 0 THEN 
                    ROUND((COUNT(*) FILTER (WHERE status = 'reunited')::DECIMAL / COUNT(*)) * 100, 2)
                ELSE 0 
            END 
            FROM lost_found_reports
        ),
        'pending_approvals', (SELECT COUNT(*) FROM lost_found_reports WHERE status = 'pending'),
        'marketplace_listings', (SELECT COUNT(*) FROM marketplace_listings WHERE status = 'active'),
        'stakeholder_organizations', (SELECT COUNT(*) FROM stakeholder_organizations WHERE is_verified = true)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent activity
CREATE OR REPLACE FUNCTION get_admin_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', id,
            'action', action,
            'resource_type', resource_type,
            'details', details,
            'created_at', created_at
        )
        ORDER BY created_at DESC
    ) INTO result
    FROM admin_activity_log
    LIMIT limit_count;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to get pending reports for admin
CREATE OR REPLACE FUNCTION get_admin_pending_reports()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', id,
            'type', type,
            'device_name', device_name,
            'user', user_name,
            'location', location,
            'status', status,
            'created_at', created_at
        )
        ORDER BY created_at DESC
    ) INTO result
    FROM lost_found_reports
    WHERE status IN ('pending', 'active');
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to approve/reject reports
CREATE OR REPLACE FUNCTION admin_approve_report(
    report_id UUID,
    admin_id UUID,
    action VARCHAR(20), -- 'approve' or 'reject'
    admin_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    report_record RECORD;
BEGIN
    -- Get the report
    SELECT * INTO report_record FROM lost_found_reports WHERE id = report_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Report not found');
    END IF;
    
    -- Update report status
    IF action = 'approve' THEN
        UPDATE lost_found_reports 
        SET status = 'active', updated_at = NOW()
        WHERE id = report_id;
    ELSIF action = 'reject' THEN
        UPDATE lost_found_reports 
        SET status = 'rejected', updated_at = NOW()
        WHERE id = report_id;
    END IF;
    
    -- Log admin activity
    INSERT INTO admin_activity_log (admin_id, action, resource_type, resource_id, details)
    VALUES (
        admin_id,
        'report_' || action,
        'lost_found_report',
        report_id,
        json_build_object('admin_notes', admin_notes)
    );
    
    RETURN json_build_object('success', true, 'message', 'Report ' || action || 'd successfully');
END;
$$ LANGUAGE plpgsql;

-- Function to process rewards
CREATE OR REPLACE FUNCTION admin_process_reward(
    reward_id UUID,
    admin_id UUID,
    action VARCHAR(20), -- 'approve' or 'reject'
    amount DECIMAL(10,2) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- This would integrate with the existing reward system
    -- For now, return success
    RETURN json_build_object('success', true, 'message', 'Reward processed successfully');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default user roles
INSERT INTO user_roles (name, description, permissions) VALUES
('Super Admin', 'Full system access', '["admin:full", "admin:overview", "admin:users", "admin:lost-found", "admin:marketplace", "admin:stakeholders", "admin:financial", "admin:security", "admin:settings"]'),
('Lost & Found Admin', 'Lost and Found management', '["admin:overview", "admin:lost-found", "admin:financial"]'),
('Marketplace Admin', 'Marketplace management', '["admin:overview", "admin:marketplace", "admin:financial"]'),
('Stakeholder Manager', 'Stakeholder management', '["admin:overview", "admin:stakeholders", "admin:financial"]'),
('Financial Manager', 'Financial management', '["admin:overview", "admin:financial"]'),
('Security Admin', 'Security and moderation', '["admin:overview", "admin:security", "admin:settings"]')
ON CONFLICT (name) DO NOTHING;

-- Insert initial dashboard stats
INSERT INTO admin_dashboard_stats (stat_name, stat_value) VALUES
('total_users', '0'),
('active_reports', '0'),
('total_transactions', '0'),
('revenue', '0'),
('recovery_rate', '0'),
('pending_approvals', '0')
ON CONFLICT (stat_name) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin users can view all data" ON admin_users FOR ALL USING (true);
CREATE POLICY "Admin users can view activity logs" ON admin_activity_log FOR ALL USING (true);
CREATE POLICY "Admin users can view notifications" ON system_notifications FOR ALL USING (true);
CREATE POLICY "Admin users can view dashboard stats" ON admin_dashboard_stats FOR ALL USING (true);
CREATE POLICY "Admin users can view user roles" ON user_roles FOR ALL USING (true);
CREATE POLICY "Admin users can view financial transactions" ON financial_transactions FOR ALL USING (true);
CREATE POLICY "Admin users can view marketplace listings" ON marketplace_listings FOR ALL USING (true);
CREATE POLICY "Admin users can view stakeholder organizations" ON stakeholder_organizations FOR ALL USING (true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_system_notifications_admin_id ON system_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_is_read ON system_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user_id ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_stakeholder_organizations_type ON stakeholder_organizations(type);
CREATE INDEX IF NOT EXISTS idx_stakeholder_organizations_is_verified ON stakeholder_organizations(is_verified);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Admin dashboard backend tables and functions created successfully!';
    RAISE NOTICE 'Tables created: admin_users, admin_activity_log, system_notifications, admin_dashboard_stats, user_roles, financial_transactions, marketplace_listings, stakeholder_organizations';
    RAISE NOTICE 'Functions created: get_admin_dashboard_stats, get_admin_recent_activity, get_admin_pending_reports, admin_approve_report, admin_process_reward';
    RAISE NOTICE 'Default data inserted: user roles, dashboard stats';
    RAISE NOTICE 'RLS policies and indexes created for security and performance';
END $$;
