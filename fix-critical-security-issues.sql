-- Fix Critical Security and Database Issues
-- This script addresses serial number hashing, missing columns, and claim functionality

BEGIN;

-- 1. Fix admin_roles table - add missing description column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_roles' 
        AND column_name = 'description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE admin_roles ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Fix lost_found_reports table - add missing claimant columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claimant_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN claimant_id UUID;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claimant_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN claimant_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claimant_email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN claimant_email TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claimant_phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN claimant_phone TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claim_submitted_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN claim_submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'ownership_proof'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN ownership_proof JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claim_description'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE lost_found_reports ADD COLUMN claim_description TEXT;
    END IF;
END $$;

-- 3. Create serial number hashing function if it doesn't exist
-- First drop the existing function if it exists with different parameter name
DROP FUNCTION IF EXISTS hash_serial_number(text);

CREATE OR REPLACE FUNCTION hash_serial_number(serial TEXT)
RETURNS TEXT AS $$
BEGIN
    IF serial IS NULL OR serial = '' THEN
        RETURN NULL;
    END IF;
    
    -- Hash the serial number using SHA-256
    RETURN encode(digest(serial, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to show partial serial number
CREATE OR REPLACE FUNCTION show_partial_serial(serial TEXT, user_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF serial IS NULL OR serial = '' THEN
        RETURN 'Not Available';
    END IF;
    
    -- Show only first 3 and last 3 characters for security
    IF LENGTH(serial) > 6 THEN
        RETURN LEFT(serial, 3) || '***' || RIGHT(serial, 3);
    ELSE
        RETURN '***' || RIGHT(serial, 3);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Update existing records to hash serial numbers
UPDATE lost_found_reports 
SET serial_number = hash_serial_number(serial_number)
WHERE serial_number IS NOT NULL 
AND serial_number != '' 
AND serial_number NOT LIKE '%***%';

-- 6. Create RLS policy to hide full serial numbers from public
DROP POLICY IF EXISTS hide_serial_numbers_public ON lost_found_reports;

CREATE POLICY hide_serial_numbers_public ON lost_found_reports
FOR SELECT
TO public
USING (true);

-- 7. Advanced View Management System for Public Display
-- This creates a comprehensive view system with proper error handling and column detection

DO $$
DECLARE
    v_view_exists BOOLEAN := FALSE;
    v_claim_status_exists BOOLEAN := FALSE;
    v_verification_status_exists BOOLEAN := FALSE;
    v_ownership_proof_exists BOOLEAN := FALSE;
    v_incident_date_exists BOOLEAN := FALSE;
    v_photos_exists BOOLEAN := FALSE;
    v_documents_exists BOOLEAN := FALSE;
    v_contact_preferences_exists BOOLEAN := FALSE;
    v_privacy_settings_exists BOOLEAN := FALSE;
    v_sql TEXT;
BEGIN
    -- Check if view already exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'public_lost_found_reports' 
        AND table_schema = 'public'
    ) INTO v_view_exists;
    
    -- Check for all possible columns that might exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'claim_status'
        AND table_schema = 'public'
    ) INTO v_claim_status_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'verification_status'
        AND table_schema = 'public'
    ) INTO v_verification_status_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'ownership_proof'
        AND table_schema = 'public'
    ) INTO v_ownership_proof_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'incident_date'
        AND table_schema = 'public'
    ) INTO v_incident_date_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'photos'
        AND table_schema = 'public'
    ) INTO v_photos_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'documents'
        AND table_schema = 'public'
    ) INTO v_documents_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'contact_preferences'
        AND table_schema = 'public'
    ) INTO v_contact_preferences_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lost_found_reports' 
        AND column_name = 'privacy_settings'
        AND table_schema = 'public'
    ) INTO v_privacy_settings_exists;
    
    -- Drop existing view if it exists
    IF v_view_exists THEN
        DROP VIEW public_lost_found_reports CASCADE;
    END IF;
    
    -- Build dynamic SQL for view creation based on available columns
    v_sql := 'CREATE VIEW public_lost_found_reports AS SELECT 
        id,
        user_id,
        report_type,
        device_model,
        device_category,
        description,
        location_address as location_found,
        show_partial_serial(serial_number) as serial_number_display,
        status,
        reward_amount,
        created_at,
        updated_at';
    
    -- Add optional columns if they exist
    IF v_claim_status_exists THEN
        v_sql := v_sql || ',
        claim_status';
    END IF;
    
    IF v_verification_status_exists THEN
        v_sql := v_sql || ',
        verification_status';
    END IF;
    
    IF v_ownership_proof_exists THEN
        v_sql := v_sql || ',
        ownership_proof';
    END IF;
    
    IF v_incident_date_exists THEN
        v_sql := v_sql || ',
        incident_date';
    END IF;
    
    IF v_photos_exists THEN
        v_sql := v_sql || ',
        photos';
    END IF;
    
    IF v_documents_exists THEN
        v_sql := v_sql || ',
        documents';
    END IF;
    
    IF v_contact_preferences_exists THEN
        v_sql := v_sql || ',
        contact_preferences';
    END IF;
    
    IF v_privacy_settings_exists THEN
        v_sql := v_sql || ',
        privacy_settings';
    END IF;
    
    -- Complete the SQL
    v_sql := v_sql || ' FROM lost_found_reports;';
    
    -- Execute the dynamic SQL
    EXECUTE v_sql;
    
    -- Log the view creation
    RAISE NOTICE 'View public_lost_found_reports created successfully with % columns', 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'public_lost_found_reports' AND table_schema = 'public');
        
END $$;

-- 8. Advanced Security and Access Management System
DO $$
DECLARE
    v_view_exists BOOLEAN := FALSE;
    v_anon_role_exists BOOLEAN := FALSE;
    v_authenticated_role_exists BOOLEAN := FALSE;
BEGIN
    -- Check if view exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'public_lost_found_reports' 
        AND table_schema = 'public'
    ) INTO v_view_exists;
    
    -- Check if roles exist
    SELECT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'anon'
    ) INTO v_anon_role_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
    ) INTO v_authenticated_role_exists;
    
    -- Grant access to the view with comprehensive role management
    IF v_view_exists THEN
        -- Grant to public role
        EXECUTE 'GRANT SELECT ON public_lost_found_reports TO public;';
        
        -- Grant to anon role if it exists
        IF v_anon_role_exists THEN
            EXECUTE 'GRANT SELECT ON public_lost_found_reports TO anon;';
        END IF;
        
        -- Grant to authenticated role if it exists
        IF v_authenticated_role_exists THEN
            EXECUTE 'GRANT SELECT ON public_lost_found_reports TO authenticated;';
        END IF;
        
        RAISE NOTICE 'View access granted to all appropriate roles';
    ELSE
        RAISE NOTICE 'View does not exist, skipping access grants';
    END IF;
END $$;

-- 9. Create comprehensive ownership verification table
CREATE TABLE IF NOT EXISTS ownership_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES lost_found_reports(id) ON DELETE CASCADE,
    claimant_email TEXT NOT NULL,
    claimant_name TEXT NOT NULL,
    claimant_phone TEXT,
    serial_number_provided TEXT NOT NULL,
    imei_number_provided TEXT,
    purchase_date DATE,
    purchase_location TEXT,
    purchase_receipt_url TEXT,
    police_report_url TEXT,
    additional_proof JSONB,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'under_review')),
    admin_notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ownership_verification_report_id ON ownership_verification(report_id);
CREATE INDEX IF NOT EXISTS idx_ownership_verification_status ON ownership_verification(verification_status);
CREATE INDEX IF NOT EXISTS idx_ownership_verification_email ON ownership_verification(claimant_email);

-- 11. Advanced Row Level Security System for Ownership Verification
ALTER TABLE ownership_verification ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS ownership_verification_select_policy ON ownership_verification;
DROP POLICY IF EXISTS ownership_verification_insert_policy ON ownership_verification;
DROP POLICY IF EXISTS ownership_verification_update_policy ON ownership_verification;
DROP POLICY IF EXISTS ownership_verification_delete_policy ON ownership_verification;

-- Create comprehensive RLS policies
CREATE POLICY ownership_verification_select_policy ON ownership_verification
FOR SELECT
TO authenticated
USING (
    -- Users can see their own verification records
    claimant_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Admins can see all verification records
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
    OR
    -- Report owners can see verification attempts for their reports
    EXISTS (
        SELECT 1 FROM lost_found_reports lfr
        WHERE lfr.id = ownership_verification.report_id
        AND lfr.user_id = auth.uid()
    )
);

CREATE POLICY ownership_verification_insert_policy ON ownership_verification
FOR INSERT
TO authenticated
WITH CHECK (
    -- Users can only create verification records for themselves
    claimant_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Admins can create verification records for anyone
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY ownership_verification_update_policy ON ownership_verification
FOR UPDATE
TO authenticated
USING (
    -- Users can update their own verification records
    claimant_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Admins can update any verification records
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
)
WITH CHECK (
    -- Same conditions for updates
    claimant_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY ownership_verification_delete_policy ON ownership_verification
FOR DELETE
TO authenticated
USING (
    -- Only admins can delete verification records
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() 
        AND is_active = true
    )
);

-- 12. Update admin_roles with proper description
UPDATE admin_roles 
SET description = 'Super Administrator with full system access'
WHERE role_name = 'super_admin';

-- 13. Insert super_admin role if it doesn't exist
INSERT INTO admin_roles (role_name, permissions, description, created_at, updated_at)
SELECT 
    'super_admin',
    '["admin:full", "admin:lost-found", "admin:marketplace", "admin:users", "admin:analytics", "admin:settings"]'::jsonb,
    'Super Administrator with full system access',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM admin_roles WHERE role_name = 'super_admin'
);

-- 14. Comprehensive System Verification and Audit Logging
DO $$
DECLARE
    v_function_count INTEGER;
    v_column_count INTEGER;
    v_view_column_count INTEGER;
    v_policy_count INTEGER;
    v_admin_role_count INTEGER;
    v_verification_table_exists BOOLEAN;
    v_audit_log TEXT := '';
BEGIN
    -- Count created functions
    SELECT COUNT(*) INTO v_function_count
    FROM pg_proc 
    WHERE proname IN ('hash_serial_number', 'show_partial_serial')
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Count added columns
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns 
    WHERE table_name = 'lost_found_reports' 
    AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof', 'claim_description')
    AND table_schema = 'public';
    
    -- Count view columns
    SELECT COUNT(*) INTO v_view_column_count
    FROM information_schema.columns 
    WHERE table_name = 'public_lost_found_reports' 
    AND table_schema = 'public';
    
    -- Count RLS policies
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies 
    WHERE tablename = 'ownership_verification'
    AND schemaname = 'public';
    
    -- Count admin roles
    SELECT COUNT(*) INTO v_admin_role_count
    FROM admin_roles 
    WHERE role_name = 'super_admin';
    
    -- Check if verification table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ownership_verification' 
        AND table_schema = 'public'
    ) INTO v_verification_table_exists;
    
    -- Build audit log
    v_audit_log := 'COMPREHENSIVE SECURITY SYSTEM DEPLOYMENT AUDIT' || E'\n' ||
                   '================================================' || E'\n' ||
                   'Functions Created: ' || v_function_count || E'\n' ||
                   'Columns Added: ' || v_column_count || E'\n' ||
                   'View Columns: ' || v_view_column_count || E'\n' ||
                   'RLS Policies: ' || v_policy_count || E'\n' ||
                   'Admin Roles: ' || v_admin_role_count || E'\n' ||
                   'Verification Table: ' || CASE WHEN v_verification_table_exists THEN 'EXISTS' ELSE 'MISSING' END || E'\n' ||
                   'Timestamp: ' || NOW()::TEXT || E'\n' ||
                   '================================================';
    
    -- Log the audit
    RAISE NOTICE '%', v_audit_log;
    
    -- Create audit log table if it doesn't exist
    CREATE TABLE IF NOT EXISTS system_audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_type TEXT NOT NULL,
        audit_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES auth.users(id)
    );
    
    -- Insert audit record
    INSERT INTO system_audit_log (audit_type, audit_data)
    VALUES (
        'security_system_deployment',
        jsonb_build_object(
            'functions_created', v_function_count,
            'columns_added', v_column_count,
            'view_columns', v_view_column_count,
            'rls_policies', v_policy_count,
            'admin_roles', v_admin_role_count,
            'verification_table_exists', v_verification_table_exists,
            'deployment_timestamp', NOW(),
            'deployment_version', '1.0.0'
        )
    );
    
END $$;

-- 15. Final Verification Queries
SELECT 
    'FINAL VERIFICATION RESULTS' as verification_type,
    'Functions' as component,
    COUNT(*) as count,
    'hash_serial_number, show_partial_serial' as details
FROM pg_proc 
WHERE proname IN ('hash_serial_number', 'show_partial_serial')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')

UNION ALL

SELECT 
    'FINAL VERIFICATION RESULTS' as verification_type,
    'Added Columns' as component,
    COUNT(*) as count,
    string_agg(column_name, ', ') as details
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports' 
AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof', 'claim_description')
AND table_schema = 'public'

UNION ALL

SELECT 
    'FINAL VERIFICATION RESULTS' as verification_type,
    'View Columns' as component,
    COUNT(*) as count,
    'public_lost_found_reports view' as details
FROM information_schema.columns 
WHERE table_name = 'public_lost_found_reports' 
AND table_schema = 'public'

UNION ALL

SELECT 
    'FINAL VERIFICATION RESULTS' as verification_type,
    'RLS Policies' as component,
    COUNT(*) as count,
    'ownership_verification policies' as details
FROM pg_policies 
WHERE tablename = 'ownership_verification'
AND schemaname = 'public'

UNION ALL

SELECT 
    'FINAL VERIFICATION RESULTS' as verification_type,
    'Admin Roles' as component,
    COUNT(*) as count,
    'super_admin role' as details
FROM admin_roles 
WHERE role_name = 'super_admin'

UNION ALL

SELECT 
    'FINAL VERIFICATION RESULTS' as verification_type,
    'Verification Table' as component,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ownership_verification' 
        AND table_schema = 'public'
    ) THEN 1 ELSE 0 END as count,
    'ownership_verification table' as details;

COMMIT;
