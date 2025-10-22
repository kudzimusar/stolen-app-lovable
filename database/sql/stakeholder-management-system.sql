-- ================================================================
-- STAKEHOLDER MANAGEMENT SYSTEM
-- Advanced stakeholder tables that integrate with existing admin system
-- ================================================================

BEGIN;

-- ================================================================
-- 1. STAKEHOLDER-SPECIFIC TABLES
-- ================================================================

-- Retailers Table
CREATE TABLE IF NOT EXISTS public.retailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT DEFAULT 'electronics_retailer',
    license_number TEXT UNIQUE,
    tax_id TEXT,
    business_address JSONB,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    certification_status TEXT DEFAULT 'pending' CHECK (certification_status IN ('pending', 'approved', 'rejected', 'suspended', 'expired')),
    certification_level TEXT DEFAULT 'basic' CHECK (certification_level IN ('basic', 'premium', 'enterprise')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    admin_notes TEXT,
    business_documents TEXT[], -- URLs to business registration, licenses, etc.
    api_access_enabled BOOLEAN DEFAULT FALSE,
    bulk_upload_limit INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Repair Shops Table
CREATE TABLE IF NOT EXISTS public.repair_shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    shop_type TEXT DEFAULT 'mobile_repair' CHECK (shop_type IN ('mobile_repair', 'fixed_location', 'authorized_service_center')),
    license_number TEXT,
    certification_level TEXT DEFAULT 'pending' CHECK (certification_level IN ('pending', 'basic', 'certified', 'authorized', 'suspended')),
    specializations TEXT[] DEFAULT '{}', -- ['smartphone', 'laptop', 'tablet', 'gaming_console']
    service_areas TEXT[] DEFAULT '{}', -- Geographic areas served
    business_address JSONB,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended', 'expired')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    admin_notes TEXT,
    certifications TEXT[], -- URLs to repair certifications
    insurance_coverage BOOLEAN DEFAULT FALSE,
    warranty_provided BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Law Enforcement Table
CREATE TABLE IF NOT EXISTS public.law_enforcement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    agency_type TEXT DEFAULT 'police' CHECK (agency_type IN ('police', 'fbi', 'customs', 'border_patrol', 'sheriff')),
    badge_number TEXT UNIQUE,
    officer_rank TEXT,
    jurisdiction TEXT, -- City, County, State
    clearance_level TEXT DEFAULT 'pending' CHECK (clearance_level IN ('pending', 'basic', 'confidential', 'secret', 'top_secret')),
    authorization_code TEXT UNIQUE,
    supervisor_name TEXT,
    supervisor_badge TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended', 'expired')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    admin_notes TEXT,
    verification_documents TEXT[], -- Badge photo, authorization letters
    access_level TEXT DEFAULT 'basic' CHECK (access_level IN ('basic', 'advanced', 'investigation', 'full')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Insurance Partners Table
CREATE TABLE IF NOT EXISTS public.insurance_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_type TEXT DEFAULT 'insurance_provider' CHECK (company_type IN ('insurance_provider', 'broker', 'underwriter', 'reinsurer')),
    license_number TEXT UNIQUE,
    regulatory_body TEXT,
    coverage_types TEXT[] DEFAULT '{}', -- ['device_insurance', 'theft_protection', 'extended_warranty']
    business_address JSONB,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended', 'expired')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    admin_notes TEXT,
    business_documents TEXT[], -- Insurance licenses, regulatory approvals
    api_integration_enabled BOOLEAN DEFAULT FALSE,
    claim_processing_enabled BOOLEAN DEFAULT FALSE,
    premium_calculation_method TEXT DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- NGOs Table
CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    organization_type TEXT DEFAULT 'non_profit' CHECK (organization_type IN ('non_profit', 'charity', 'foundation', 'community_organization')),
    registration_number TEXT UNIQUE,
    tax_exempt_status BOOLEAN DEFAULT TRUE,
    focus_areas TEXT[] DEFAULT '{}', -- ['digital_inclusion', 'education', 'disaster_relief', 'community_development']
    geographic_focus TEXT[] DEFAULT '{}', -- Areas of operation
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended', 'expired')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.users(id),
    admin_notes TEXT,
    verification_documents TEXT[], -- Registration certificates, tax exemption letters
    donation_tracking_enabled BOOLEAN DEFAULT TRUE,
    impact_reporting_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ================================================================
-- 2. STAKEHOLDER AUDIT LOG TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.stakeholder_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stakeholder_type TEXT NOT NULL CHECK (stakeholder_type IN ('retailer', 'repair_shop', 'law_enforcement', 'insurance_partner', 'ngo')),
    stakeholder_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'approved', 'rejected', 'suspended', 'activated', 'expired')),
    action_details JSONB,
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Retailers indexes
CREATE INDEX IF NOT EXISTS idx_retailers_user_id ON public.retailers(user_id);
CREATE INDEX IF NOT EXISTS idx_retailers_certification_status ON public.retailers(certification_status);
CREATE INDEX IF NOT EXISTS idx_retailers_approval_date ON public.retailers(approval_date);

-- Repair shops indexes
CREATE INDEX IF NOT EXISTS idx_repair_shops_user_id ON public.repair_shops(user_id);
CREATE INDEX IF NOT EXISTS idx_repair_shops_approval_status ON public.repair_shops(approval_status);
CREATE INDEX IF NOT EXISTS idx_repair_shops_specializations ON public.repair_shops USING GIN(specializations);

-- Law enforcement indexes
CREATE INDEX IF NOT EXISTS idx_law_enforcement_user_id ON public.law_enforcement(user_id);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_approval_status ON public.law_enforcement(approval_status);
CREATE INDEX IF NOT EXISTS idx_law_enforcement_badge_number ON public.law_enforcement(badge_number);

-- Insurance partners indexes
CREATE INDEX IF NOT EXISTS idx_insurance_partners_user_id ON public.insurance_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_partners_approval_status ON public.insurance_partners(approval_status);
CREATE INDEX IF NOT EXISTS idx_insurance_partners_license_number ON public.insurance_partners(license_number);

-- NGOs indexes
CREATE INDEX IF NOT EXISTS idx_ngos_user_id ON public.ngos(user_id);
CREATE INDEX IF NOT EXISTS idx_ngos_approval_status ON public.ngos(approval_status);
CREATE INDEX IF NOT EXISTS idx_ngos_registration_number ON public.ngos(registration_number);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_stakeholder_audit_stakeholder ON public.stakeholder_audit_log(stakeholder_type, stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_audit_action ON public.stakeholder_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_stakeholder_audit_created_at ON public.stakeholder_audit_log(created_at);

-- ================================================================
-- 4. CREATE TRIGGERS FOR AUDIT LOGGING
-- ================================================================

-- Function to log stakeholder actions
CREATE OR REPLACE FUNCTION log_stakeholder_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.stakeholder_audit_log (
            stakeholder_type,
            stakeholder_id,
            user_id,
            action_type,
            action_details,
            admin_id,
            created_at
        ) VALUES (
            TG_TABLE_NAME::TEXT,
            NEW.id,
            NEW.user_id,
            'created',
            row_to_json(NEW),
            NULL,
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.stakeholder_audit_log (
            stakeholder_type,
            stakeholder_id,
            user_id,
            action_type,
            action_details,
            admin_id,
            admin_notes,
            created_at
        ) VALUES (
            TG_TABLE_NAME::TEXT,
            NEW.id,
            NEW.user_id,
            'updated',
            json_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW),
                'changed_fields', (
                    SELECT json_object_agg(key, value)
                    FROM json_each(row_to_json(NEW))
                    WHERE key NOT IN (SELECT key FROM json_each(row_to_json(OLD)) WHERE value = json_each.value)
                )
            ),
            NULL,
            NULL,
            NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for all stakeholder tables
CREATE TRIGGER trigger_retailers_audit
    AFTER INSERT OR UPDATE ON public.retailers
    FOR EACH ROW EXECUTE FUNCTION log_stakeholder_action();

CREATE TRIGGER trigger_repair_shops_audit
    AFTER INSERT OR UPDATE ON public.repair_shops
    FOR EACH ROW EXECUTE FUNCTION log_stakeholder_action();

CREATE TRIGGER trigger_law_enforcement_audit
    AFTER INSERT OR UPDATE ON public.law_enforcement
    FOR EACH ROW EXECUTE FUNCTION log_stakeholder_action();

CREATE TRIGGER trigger_insurance_partners_audit
    AFTER INSERT OR UPDATE ON public.insurance_partners
    FOR EACH ROW EXECUTE FUNCTION log_stakeholder_action();

CREATE TRIGGER trigger_ngos_audit
    AFTER INSERT OR UPDATE ON public.ngos
    FOR EACH ROW EXECUTE FUNCTION log_stakeholder_action();

-- ================================================================
-- 5. CREATE ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all stakeholder tables
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_enforcement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_audit_log ENABLE ROW LEVEL SECURITY;

-- Retailers RLS policies
CREATE POLICY retailers_select_policy ON public.retailers
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY retailers_update_policy ON public.retailers
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY retailers_insert_policy ON public.retailers
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Repair shops RLS policies
CREATE POLICY repair_shops_select_policy ON public.repair_shops
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY repair_shops_update_policy ON public.repair_shops
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY repair_shops_insert_policy ON public.repair_shops
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Law enforcement RLS policies
CREATE POLICY law_enforcement_select_policy ON public.law_enforcement
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY law_enforcement_update_policy ON public.law_enforcement
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY law_enforcement_insert_policy ON public.law_enforcement
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Insurance partners RLS policies
CREATE POLICY insurance_partners_select_policy ON public.insurance_partners
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY insurance_partners_update_policy ON public.insurance_partners
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY insurance_partners_insert_policy ON public.insurance_partners
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- NGOs RLS policies
CREATE POLICY ngos_select_policy ON public.ngos
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY ngos_update_policy ON public.ngos
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        is_admin_user(auth.uid())
    );

CREATE POLICY ngos_insert_policy ON public.ngos
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Audit log RLS policies (admin only)
CREATE POLICY stakeholder_audit_select_policy ON public.stakeholder_audit_log
    FOR SELECT USING (
        is_admin_user(auth.uid())
    );

-- ================================================================
-- 6. GRANT PERMISSIONS
-- ================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.retailers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.repair_shops TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.law_enforcement TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.insurance_partners TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ngos TO authenticated;
GRANT SELECT ON public.stakeholder_audit_log TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- 7. CREATE UTILITY FUNCTIONS
-- ================================================================

-- Function to get stakeholder type by user ID
CREATE OR REPLACE FUNCTION get_stakeholder_type(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_user_role TEXT;
    v_stakeholder_type TEXT;
BEGIN
    -- Get user role from users table
    SELECT role INTO v_user_role FROM public.users WHERE id = p_user_id;
    
    -- Map role to stakeholder type
    CASE v_user_role
        WHEN 'retailer' THEN v_stakeholder_type := 'retailer';
        WHEN 'repair_shop' THEN v_stakeholder_type := 'repair_shop';
        WHEN 'law_enforcement' THEN v_stakeholder_type := 'law_enforcement';
        WHEN 'insurance' THEN v_stakeholder_type := 'insurance_partner';
        WHEN 'ngo' THEN v_stakeholder_type := 'ngo';
        ELSE v_stakeholder_type := NULL;
    END CASE;
    
    RETURN v_stakeholder_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get stakeholder ID by user ID
CREATE OR REPLACE FUNCTION get_stakeholder_id(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_stakeholder_type TEXT;
    v_stakeholder_id UUID;
BEGIN
    v_stakeholder_type := get_stakeholder_type(p_user_id);
    
    IF v_stakeholder_type IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get stakeholder ID based on type
    EXECUTE format('SELECT id FROM public.%I WHERE user_id = $1', v_stakeholder_type)
    INTO v_stakeholder_id
    USING p_user_id;
    
    RETURN v_stakeholder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update stakeholder status
CREATE OR REPLACE FUNCTION update_stakeholder_status(
    p_user_id UUID,
    p_status TEXT,
    p_admin_id UUID DEFAULT NULL,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_stakeholder_type TEXT;
    v_success BOOLEAN := FALSE;
BEGIN
    v_stakeholder_type := get_stakeholder_type(p_user_id);
    
    IF v_stakeholder_type IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update status based on stakeholder type
    CASE v_stakeholder_type
        WHEN 'retailer' THEN
            UPDATE public.retailers 
            SET certification_status = p_status,
                approved_by = p_admin_id,
                admin_notes = p_admin_notes,
                approval_date = CASE WHEN p_status = 'approved' THEN NOW() ELSE approval_date END,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            v_success := TRUE;
            
        WHEN 'repair_shop' THEN
            UPDATE public.repair_shops 
            SET approval_status = p_status,
                approved_by = p_admin_id,
                admin_notes = p_admin_notes,
                approval_date = CASE WHEN p_status = 'approved' THEN NOW() ELSE approval_date END,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            v_success := TRUE;
            
        WHEN 'law_enforcement' THEN
            UPDATE public.law_enforcement 
            SET approval_status = p_status,
                approved_by = p_admin_id,
                admin_notes = p_admin_notes,
                approval_date = CASE WHEN p_status = 'approved' THEN NOW() ELSE approval_date END,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            v_success := TRUE;
            
        WHEN 'insurance_partner' THEN
            UPDATE public.insurance_partners 
            SET approval_status = p_status,
                approved_by = p_admin_id,
                admin_notes = p_admin_notes,
                approval_date = CASE WHEN p_status = 'approved' THEN NOW() ELSE approval_date END,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            v_success := TRUE;
            
        WHEN 'ngo' THEN
            UPDATE public.ngos 
            SET approval_status = p_status,
                approved_by = p_admin_id,
                admin_notes = p_admin_notes,
                approval_date = CASE WHEN p_status = 'approved' THEN NOW() ELSE approval_date END,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            v_success := TRUE;
    END CASE;
    
    -- Log the action
    IF v_success THEN
        INSERT INTO public.stakeholder_audit_log (
            stakeholder_type,
            stakeholder_id,
            user_id,
            action_type,
            action_details,
            admin_id,
            admin_notes,
            created_at
        ) VALUES (
            v_stakeholder_type,
            get_stakeholder_id(p_user_id),
            p_user_id,
            p_status,
            json_build_object('status', p_status, 'admin_notes', p_admin_notes),
            p_admin_id,
            p_admin_notes,
            NOW()
        );
    END IF;
    
    RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION get_stakeholder_type(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_stakeholder_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_stakeholder_status(UUID, TEXT, UUID, TEXT) TO authenticated;

COMMIT;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Stakeholder Management System Created Successfully!';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '   - retailers (with certification levels)';
    RAISE NOTICE '   - repair_shops (with specializations)';
    RAISE NOTICE '   - law_enforcement (with clearance levels)';
    RAISE NOTICE '   - insurance_partners (with coverage types)';
    RAISE NOTICE '   - ngos (with focus areas)';
    RAISE NOTICE '   - stakeholder_audit_log (comprehensive audit trail)';
    RAISE NOTICE '🔒 RLS policies enabled for all tables';
    RAISE NOTICE '⚡ Triggers created for automatic audit logging';
    RAISE NOTICE '🛠️ Utility functions created:';
    RAISE NOTICE '   - get_stakeholder_type(user_id)';
    RAISE NOTICE '   - get_stakeholder_id(user_id)';
    RAISE NOTICE '   - update_stakeholder_status(user_id, status, admin_id, notes)';
    RAISE NOTICE '📈 All indexes created for optimal performance';
END $$;
