-- ================================================================
-- ADMIN STAKEHOLDERS VIEW
-- Unified view for admin stakeholder management
-- Fixed to avoid duplicate column errors by prefixing type-specific fields
-- ================================================================

-- Drop the view if it exists to ensure clean creation
DROP VIEW IF EXISTS admin_stakeholders_view CASCADE;

-- ================================================================
-- 1. CREATE UNIFIED STAKEHOLDERS VIEW
-- ================================================================

CREATE VIEW admin_stakeholders_view AS
SELECT 
    -- User base information
    u.id as user_id,
    u.email,
    u.display_name,
    u.role,
    u.verification_status,
    u.phone,
    u.address,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,
    
    -- Unified stakeholder core fields (using COALESCE to merge across types)
    COALESCE(r.id, rs.id, le.id, ip.id, n.id) as stakeholder_id,
    COALESCE(r.business_name, rs.shop_name, le.department, ip.company_name, n.organization_name) as business_name,
    COALESCE(r.business_type, rs.shop_type, le.agency_type, ip.company_type, n.organization_type) as business_type,
    COALESCE(r.license_number, rs.license_number, ip.license_number) as license_number,
    COALESCE(r.certification_status, rs.approval_status, le.approval_status, ip.approval_status, n.approval_status) as approval_status,
    COALESCE(r.certification_level, rs.certification_level, le.clearance_level) as approval_level,
    COALESCE(r.approval_date, rs.approval_date, le.approval_date, ip.approval_date, n.approval_date) as approval_date,
    COALESCE(r.approved_by, rs.approved_by, le.approved_by, ip.approved_by, n.approved_by) as approved_by,
    COALESCE(r.admin_notes, rs.admin_notes, le.admin_notes, ip.admin_notes, n.admin_notes) as admin_notes,
    COALESCE(r.contact_person, rs.contact_person, ip.contact_person, n.contact_person) as contact_person,
    COALESCE(r.contact_phone, rs.contact_phone, le.contact_phone, ip.contact_phone, n.contact_phone) as contact_phone,
    COALESCE(r.contact_email, rs.contact_email, le.contact_email, ip.contact_email, n.contact_email) as contact_email,
    COALESCE(r.updated_at, rs.updated_at, le.updated_at, ip.updated_at, n.updated_at) as stakeholder_updated_at,
    
    -- Retailer-specific fields (prefixed with retailer_)
    r.business_documents as retailer_business_documents,
    r.api_access_enabled as retailer_api_access_enabled,
    r.bulk_upload_limit as retailer_bulk_upload_limit,
    r.tax_id as retailer_tax_id,
    r.business_address as retailer_business_address,
    r.certification_level as retailer_certification_level,
    
    -- Repair shop-specific fields (prefixed with repair_)
    rs.specializations as repair_specializations,
    rs.service_areas as repair_service_areas,
    rs.certifications as repair_certifications,
    rs.insurance_coverage as repair_insurance_coverage,
    rs.warranty_provided as repair_warranty_provided,
    rs.shop_type as repair_shop_type,
    rs.business_address as repair_business_address,
    
    -- Law enforcement-specific fields (prefixed with law_)
    le.badge_number as law_badge_number,
    le.officer_rank as law_officer_rank,
    le.jurisdiction as law_jurisdiction,
    le.authorization_code as law_authorization_code,
    le.supervisor_name as law_supervisor_name,
    le.supervisor_badge as law_supervisor_badge,
    le.access_level as law_access_level,
    le.verification_documents as law_verification_documents,
    le.agency_type as law_agency_type,
    le.clearance_level as law_clearance_level,
    
    -- Insurance partner-specific fields (prefixed with insurance_)
    ip.coverage_types as insurance_coverage_types,
    ip.regulatory_body as insurance_regulatory_body,
    ip.api_integration_enabled as insurance_api_integration_enabled,
    ip.claim_processing_enabled as insurance_claim_processing_enabled,
    ip.business_documents as insurance_business_documents,
    ip.company_type as insurance_company_type,
    ip.business_address as insurance_business_address,
    ip.premium_calculation_method as insurance_premium_calculation_method,
    
    -- NGO-specific fields (prefixed with ngo_)
    n.registration_number as ngo_registration_number,
    n.focus_areas as ngo_focus_areas,
    n.geographic_focus as ngo_geographic_focus,
    n.tax_exempt_status as ngo_tax_exempt_status,
    n.donation_tracking_enabled as ngo_donation_tracking_enabled,
    n.impact_reporting_enabled as ngo_impact_reporting_enabled,
    n.verification_documents as ngo_verification_documents,
    n.organization_type as ngo_organization_type,
    
    -- Statistics (subqueries for counts)
    (SELECT COUNT(*) FROM devices d WHERE d.current_owner_id = u.id) as device_count,
    (SELECT COUNT(*) FROM lost_found_reports lfr WHERE lfr.user_id = u.id) as report_count,
    (SELECT COUNT(*) FROM marketplace_listings ml WHERE ml.seller_id = u.id) as listing_count
    
FROM users u
LEFT JOIN retailers r ON u.id = r.user_id AND u.role = 'retailer'
LEFT JOIN repair_shops rs ON u.id = rs.user_id AND u.role = 'repair_shop'
LEFT JOIN law_enforcement le ON u.id = le.user_id AND u.role = 'law_enforcement'
LEFT JOIN insurance_partners ip ON u.id = ip.user_id AND u.role = 'insurance'
LEFT JOIN ngos n ON u.id = n.user_id AND u.role = 'ngo'
WHERE u.role IN ('retailer', 'repair_shop', 'law_enforcement', 'insurance', 'ngo');

-- Grant permissions on the view
GRANT SELECT ON admin_stakeholders_view TO authenticated;

-- ================================================================
-- 2. CREATE STAKEHOLDER STATISTICS FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION get_admin_stakeholder_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_stakeholders', (
            SELECT COUNT(*) FROM admin_stakeholders_view
        ),
        'by_type', (
            SELECT json_object_agg(role, count)
            FROM (
                SELECT role, COUNT(*) as count
                FROM admin_stakeholders_view
                GROUP BY role
                ORDER BY role
            ) t
        ),
        'by_status', (
            SELECT json_object_agg(approval_status, count)
            FROM (
                SELECT approval_status, COUNT(*) as count
                FROM admin_stakeholders_view
                WHERE approval_status IS NOT NULL
                GROUP BY approval_status
                ORDER BY approval_status
            ) t
        ),
        'recent_approvals', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE approval_date > NOW() - INTERVAL '7 days'
        ),
        'pending_approvals', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE approval_status = 'pending'
        ),
        'approved_stakeholders', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE approval_status = 'approved'
        ),
        'suspended_stakeholders', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE approval_status = 'suspended'
        ),
        'retailers', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE role = 'retailer'
        ),
        'repair_shops', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE role = 'repair_shop'
        ),
        'law_enforcement', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE role = 'law_enforcement'
        ),
        'insurance_partners', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE role = 'insurance'
        ),
        'ngos', (
            SELECT COUNT(*)
            FROM admin_stakeholders_view
            WHERE role = 'ngo'
        ),
        'last_updated', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_admin_stakeholder_stats() TO authenticated;

-- ================================================================
-- 3. CREATE STAKEHOLDER LISTING FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION list_stakeholders(
    p_stakeholder_type TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    where_clause TEXT := 'WHERE 1=1';
    query_text TEXT;
BEGIN
    -- Build WHERE clause based on parameters
    IF p_stakeholder_type IS NOT NULL AND p_stakeholder_type != 'all' THEN
        where_clause := where_clause || format(' AND role = %L', p_stakeholder_type);
    END IF;
    
    IF p_status IS NOT NULL AND p_status != 'all' THEN
        where_clause := where_clause || format(' AND approval_status = %L', p_status);
    END IF;
    
    IF p_search IS NOT NULL AND p_search != '' THEN
        where_clause := where_clause || format(' AND (
            email ILIKE %L OR 
            display_name ILIKE %L OR 
            business_name ILIKE %L OR
            contact_person ILIKE %L OR
            contact_email ILIKE %L
        )', 
        '%' || p_search || '%',
        '%' || p_search || '%',
        '%' || p_search || '%',
        '%' || p_search || '%',
        '%' || p_search || '%'
        );
    END IF;
    
    -- Build the query
    query_text := format('
        SELECT COALESCE(json_agg(
            json_build_object(
                ''user_id'', user_id,
                ''email'', email,
                ''display_name'', display_name,
                ''role'', role,
                ''verification_status'', verification_status,
                ''phone'', phone,
                ''address'', address,
                ''created_at'', user_created_at,
                ''stakeholder_id'', stakeholder_id,
                ''business_name'', business_name,
                ''business_type'', business_type,
                ''license_number'', license_number,
                ''approval_status'', approval_status,
                ''approval_level'', approval_level,
                ''approval_date'', approval_date,
                ''approved_by'', approved_by,
                ''admin_notes'', admin_notes,
                ''contact_person'', contact_person,
                ''contact_phone'', contact_phone,
                ''contact_email'', contact_email,
                ''device_count'', device_count,
                ''report_count'', report_count,
                ''listing_count'', listing_count,
                ''stakeholder_updated_at'', stakeholder_updated_at
            )
        ), ''[]''::json)
        FROM (
            SELECT *
            FROM admin_stakeholders_view
            %s
            ORDER BY user_created_at DESC
            LIMIT %s OFFSET %s
        ) t
    ', where_clause, p_limit, p_offset);
    
    -- Execute the query
    EXECUTE query_text INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION list_stakeholders(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- ================================================================
-- 4. CREATE STAKEHOLDER DETAILS FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION get_stakeholder_details(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'stakeholder', (
            SELECT row_to_json(t)
            FROM (
                SELECT *
                FROM admin_stakeholders_view
                WHERE user_id = p_user_id
            ) t
        ),
        'audit_log', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', id,
                    'action_type', action_type,
                    'action_details', action_details,
                    'admin_notes', admin_notes,
                    'admin_id', admin_id,
                    'created_at', created_at
                )
            ), '[]'::json)
            FROM stakeholder_audit_log
            WHERE user_id = p_user_id
            ORDER BY created_at DESC
            LIMIT 20
        ),
        'recent_activity', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'type', 'device_registration',
                    'description', 'Registered device: ' || brand || ' ' || model,
                    'created_at', created_at
                )
            ), '[]'::json)
            FROM devices
            WHERE current_owner_id = p_user_id
            ORDER BY created_at DESC
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_stakeholder_details(UUID) TO authenticated;

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Admin Stakeholders View Created Successfully!';
    RAISE NOTICE '👁️  View created: admin_stakeholders_view';
    RAISE NOTICE '   - All type-specific fields prefixed to avoid duplicates';
    RAISE NOTICE '   - Core fields unified with COALESCE';
    RAISE NOTICE '🛠️  Functions created:';
    RAISE NOTICE '   - get_admin_stakeholder_stats()';
    RAISE NOTICE '   - list_stakeholders(type, status, search, limit, offset)';
    RAISE NOTICE '   - get_stakeholder_details(user_id)';
    RAISE NOTICE '🔒 All permissions granted to authenticated users';
    RAISE NOTICE '📊 View includes all stakeholder types with comprehensive data';
END $$;
