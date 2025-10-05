-- Fix Critical Security and Database Issues - Simplified Version
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

-- 3. Create serial number hashing function
DO $$
BEGIN
    -- Drop existing function if it exists
    DROP FUNCTION IF EXISTS hash_serial_number(text);
    
    -- Create the function
    EXECUTE '
    CREATE OR REPLACE FUNCTION hash_serial_number(serial TEXT)
    RETURNS TEXT AS $func$
    BEGIN
        IF serial IS NULL OR serial = '''' THEN
            RETURN NULL;
        END IF;
        
        -- Hash the serial number using SHA-256
        RETURN encode(digest(serial, ''sha256''), ''hex'');
    END;
    $func$ LANGUAGE plpgsql;';
END $$;

-- 4. Create function to show partial serial number
DO $$
BEGIN
    -- Drop existing function if it exists
    DROP FUNCTION IF EXISTS show_partial_serial(text, uuid);
    
    -- Create the function
    EXECUTE '
    CREATE OR REPLACE FUNCTION show_partial_serial(serial TEXT, user_id UUID DEFAULT NULL)
    RETURNS TEXT AS $func$
    BEGIN
        IF serial IS NULL OR serial = '''' THEN
            RETURN ''Not Available'';
        END IF;
        
        -- Show only first 3 and last 3 characters for security
        IF LENGTH(serial) > 6 THEN
            RETURN LEFT(serial, 3) || ''***'' || RIGHT(serial, 3);
        ELSE
            RETURN ''***'' || RIGHT(serial, 3);
        END IF;
    END;
    $func$ LANGUAGE plpgsql;';
END $$;

-- 5. Create comprehensive ownership verification table
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

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ownership_verification_report_id ON ownership_verification(report_id);
CREATE INDEX IF NOT EXISTS idx_ownership_verification_status ON ownership_verification(verification_status);
CREATE INDEX IF NOT EXISTS idx_ownership_verification_email ON ownership_verification(claimant_email);

-- 7. Add RLS to ownership_verification
ALTER TABLE ownership_verification ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS ownership_verification_policy ON ownership_verification;

CREATE POLICY ownership_verification_policy ON ownership_verification
FOR ALL
TO authenticated
USING (true);

-- 8. Insert super_admin role if it doesn't exist
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

-- 9. Verify the fixes
SELECT 
    'Verification Results' as check_type,
    'Functions created' as fix,
    COUNT(*) as function_count
FROM pg_proc 
WHERE proname IN ('hash_serial_number', 'show_partial_serial')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

SELECT 
    'Table Structure Check' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports' 
AND column_name IN ('claimant_id', 'claimant_name', 'claimant_email', 'ownership_proof')
AND table_schema = 'public';

COMMIT;
