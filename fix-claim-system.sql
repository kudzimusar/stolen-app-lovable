-- Fix Claim System - Ensure device_claims table has proper structure
-- This script ensures the device_claims table has all necessary columns

BEGIN;

-- 1. Ensure device_claims table has all required columns
DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'report_id') THEN
        ALTER TABLE device_claims ADD COLUMN report_id UUID REFERENCES lost_found_reports(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'claimant_id') THEN
        ALTER TABLE device_claims ADD COLUMN claimant_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'claimant_name') THEN
        ALTER TABLE device_claims ADD COLUMN claimant_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'claimant_email') THEN
        ALTER TABLE device_claims ADD COLUMN claimant_email TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'claimant_phone') THEN
        ALTER TABLE device_claims ADD COLUMN claimant_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'serial_number_provided') THEN
        ALTER TABLE device_claims ADD COLUMN serial_number_provided TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'imei_number_provided') THEN
        ALTER TABLE device_claims ADD COLUMN imei_number_provided TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'purchase_date') THEN
        ALTER TABLE device_claims ADD COLUMN purchase_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'purchase_location') THEN
        ALTER TABLE device_claims ADD COLUMN purchase_location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'additional_proof') THEN
        ALTER TABLE device_claims ADD COLUMN additional_proof TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'receipt_file_url') THEN
        ALTER TABLE device_claims ADD COLUMN receipt_file_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'police_report_file_url') THEN
        ALTER TABLE device_claims ADD COLUMN police_report_file_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'additional_files_urls') THEN
        ALTER TABLE device_claims ADD COLUMN additional_files_urls TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'claim_status') THEN
        ALTER TABLE device_claims ADD COLUMN claim_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'submitted_at') THEN
        ALTER TABLE device_claims ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'reviewed_at') THEN
        ALTER TABLE device_claims ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'reviewed_by') THEN
        ALTER TABLE device_claims ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'device_claims' AND column_name = 'review_notes') THEN
        ALTER TABLE device_claims ADD COLUMN review_notes TEXT;
    END IF;
    
    RAISE NOTICE 'Device claims table structure updated successfully';
END $$;

-- 2. Create storage bucket for claim documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'claim-documents',
    'claim-documents',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760, -- Update existing bucket to 10MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- 3. Create RLS policies for device_claims table
ALTER TABLE device_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own claims (drop first if exists)
DROP POLICY IF EXISTS "Users can view own claims" ON device_claims;
CREATE POLICY "Users can view own claims" ON device_claims
    FOR SELECT USING (claimant_id = auth.uid());

-- Policy: Users can insert their own claims (drop first if exists)
DROP POLICY IF EXISTS "Users can insert own claims" ON device_claims;
CREATE POLICY "Users can insert own claims" ON device_claims
    FOR INSERT WITH CHECK (claimant_id = auth.uid());

-- Policy: Admins can view all claims (drop first if exists)
DROP POLICY IF EXISTS "Admins can view all claims" ON device_claims;
CREATE POLICY "Admins can view all claims" ON device_claims
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- 4. Create RLS policies for claim-documents storage bucket
-- Drop existing policies first to prevent conflicts
DROP POLICY IF EXISTS "Users can upload claim documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own claim documents" ON storage.objects;

CREATE POLICY "Users can upload claim documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'claim-documents' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can view own claim documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'claim-documents' 
        AND auth.uid() IS NOT NULL
    );

-- Drop admin policy first to prevent conflicts
DROP POLICY IF EXISTS "Admins can view all claim documents" ON storage.objects;

CREATE POLICY "Admins can view all claim documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'claim-documents' 
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- 5. Verify the setup
SELECT 
    'Claim System Setup Complete' as status,
    'Device claims table and storage bucket configured' as message;

-- Show table structure
SELECT 
    'Device Claims Table Structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'device_claims' 
ORDER BY ordinal_position;

COMMIT;
