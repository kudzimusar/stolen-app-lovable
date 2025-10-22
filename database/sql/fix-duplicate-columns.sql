-- ================================================================
-- FIX DUPLICATE COLUMNS IN STAKEHOLDER TABLES
-- This script checks for and removes any duplicate columns
-- ================================================================

DO $$
DECLARE
    v_table_name TEXT;
    v_column_name TEXT;
    v_count INTEGER;
BEGIN
    -- Check insurance_partners table for duplicate column definitions
    RAISE NOTICE 'Checking insurance_partners table...';
    
    -- List all columns in insurance_partners
    FOR v_column_name IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'insurance_partners'
        ORDER BY column_name
    LOOP
        RAISE NOTICE 'Column found: %', v_column_name;
    END LOOP;
    
    -- Check for duplicate columns in all stakeholder tables
    FOR v_table_name IN 
        SELECT DISTINCT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('retailers', 'repair_shops', 'law_enforcement', 'insurance_partners', 'ngos')
    LOOP
        RAISE NOTICE 'Checking table: %', v_table_name;
        
        -- Count occurrences of each column
        FOR v_column_name, v_count IN
            SELECT column_name, COUNT(*) as cnt
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = v_table_name
            GROUP BY column_name
            HAVING COUNT(*) > 1
        LOOP
            RAISE WARNING 'DUPLICATE FOUND: Table % has column % defined % times', v_table_name, v_column_name, v_count;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Duplicate column check completed.';
END $$;

-- ================================================================
-- Now create a clean version of the view
-- ================================================================

-- Drop the view completely
DROP VIEW IF EXISTS admin_stakeholders_view CASCADE;

-- Recreate with explicit column selection to avoid ambiguity
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
    
    -- Unified stakeholder core fields
    COALESCE(r.id, rs.id, le.id, ip.id, n.id) as stakeholder_id,
    COALESCE(r.business_name, rs.shop_name, le.department, ip.company_name, n.organization_name) as business_name,
    COALESCE(r.business_type, rs.shop_type, le.agency_type, ip.company_type, n.organization_type) as business_type,
    COALESCE(r.license_number, rs.license_number, ip.license_number) as license_number,
    COALESCE(r.certification_status, rs.approval_status, le.approval_status, ip.approval_status, n.approval_status) as approval_status,
    COALESCE(r.certification_level, rs.certification_level, le.clearance_level) as approval_level,
    COALESCE(r.approval_date, rs.approval_date, le.approval_date, ip.approval_date, n.approval_date) as approval_date,
    COALESCE(r.approved_by, rs.approved_by, le.approved_by, ip.approved_by, n.approved_by) as approved_by,
    COALESCE(r.admin_notes, rs.admin_notes, le.admin_notes, ip.admin_notes, n.admin_notes) as admin_notes,
    COALESCE(r.contact_person, rs.contact_person, le.officer_rank, ip.contact_person, n.contact_person) as contact_person,
    COALESCE(r.contact_phone, rs.contact_phone, le.contact_phone, ip.contact_phone, n.contact_phone) as contact_phone,
    COALESCE(r.contact_email, rs.contact_email, le.contact_email, ip.contact_email, n.contact_email) as contact_email,
    COALESCE(r.updated_at, rs.updated_at, le.updated_at, ip.updated_at, n.updated_at) as stakeholder_updated_at,
    
    -- Retailer-specific fields (prefixed with retailer_)
    r.business_documents as retailer_business_documents,
    r.api_access_enabled as retailer_api_access_enabled,
    r.bulk_upload_limit as retailer_bulk_upload_limit,
    r.tax_id as retailer_tax_id,
    r.business_address as retailer_business_address,
    
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

-- Grant permissions
GRANT SELECT ON admin_stakeholders_view TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ admin_stakeholders_view created successfully with prefixed columns!';
END $$;
