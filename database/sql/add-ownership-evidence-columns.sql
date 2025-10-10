-- Add Ownership Evidence Columns to Devices Table
-- This migration adds columns for systematic document categorization

-- Add new columns for ownership evidence
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS user_identity_url TEXT,
ADD COLUMN IF NOT EXISTS warranty_document_url TEXT,
ADD COLUMN IF NOT EXISTS registration_certificate_url TEXT;

-- Add indexes for better performance on document URL searches
CREATE INDEX IF NOT EXISTS idx_devices_user_identity_url ON public.devices(user_identity_url) WHERE user_identity_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_warranty_document_url ON public.devices(warranty_document_url) WHERE warranty_document_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_registration_certificate_url ON public.devices(registration_certificate_url) WHERE registration_certificate_url IS NOT NULL;

-- Add comments explaining the purpose of each column
COMMENT ON COLUMN public.devices.user_identity_url IS 'URL to user identity verification document (national ID, passport, driver license) - stored for ownership verification';
COMMENT ON COLUMN public.devices.warranty_document_url IS 'URL to warranty or insurance document - optional but recommended for enhanced credibility';
COMMENT ON COLUMN public.devices.registration_certificate_url IS 'URL to previous registration certificate - for secondary sellers to prove transfer rights';

-- Update existing devices to migrate receipt_url to proof_of_purchase_url if needed
-- (This is a compatibility step - the edge function already handles this mapping)
UPDATE public.devices 
SET receipt_url = receipt_url 
WHERE receipt_url IS NOT NULL;

-- Add RLS policies for the new columns (they should follow the same pattern as existing columns)
-- These are already covered by existing policies since they're just additional columns on the devices table

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'devices' 
  AND table_schema = 'public'
  AND column_name IN ('user_identity_url', 'warranty_document_url', 'registration_certificate_url')
ORDER BY column_name;
