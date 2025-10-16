-- Enhance devices table for marketplace listing with missing fields
-- This adds storage capacity, condition, warranty info without duplicating existing columns

-- Add storage capacity column (e.g., "128GB", "256GB", "512GB", "1TB")
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS storage_capacity TEXT;

-- Add device condition rating (user-assessed or calculated)
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS device_condition TEXT CHECK (device_condition IN ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor'));

-- Add warranty information
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 0 CHECK (warranty_months >= 0);

ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS warranty_expiry_date DATE;

-- Add ownership evidence columns (if not already added by previous migration)
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS proof_of_purchase_url TEXT,
ADD COLUMN IF NOT EXISTS user_identity_url TEXT,
ADD COLUMN IF NOT EXISTS warranty_document_url TEXT,
ADD COLUMN IF NOT EXISTS registration_certificate_url TEXT;

-- Add location tracking columns (if not already added)
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS registration_location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS registration_location_lng NUMERIC,
ADD COLUMN IF NOT EXISTS registration_location_address TEXT,
ADD COLUMN IF NOT EXISTS last_seen_location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS last_seen_location_lng NUMERIC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_devices_storage_capacity ON public.devices(storage_capacity);
CREATE INDEX IF NOT EXISTS idx_devices_condition ON public.devices(device_condition);
CREATE INDEX IF NOT EXISTS idx_devices_warranty_expiry ON public.devices(warranty_expiry_date) WHERE warranty_expiry_date IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.devices.storage_capacity IS 'Device storage capacity (e.g., "128GB", "256GB", "512GB", "1TB")';
COMMENT ON COLUMN public.devices.device_condition IS 'User-assessed or calculated device condition: Excellent, Very Good, Good, Fair, or Poor';
COMMENT ON COLUMN public.devices.warranty_months IS 'Remaining warranty duration in months (0 if expired)';
COMMENT ON COLUMN public.devices.warranty_expiry_date IS 'Warranty expiration date (NULL if no warranty)';
COMMENT ON COLUMN public.devices.proof_of_purchase_url IS 'URL to proof of purchase (receipt) document';
COMMENT ON COLUMN public.devices.registration_location_lat IS 'Latitude where device was registered';
COMMENT ON COLUMN public.devices.registration_location_lng IS 'Longitude where device was registered';
COMMENT ON COLUMN public.devices.registration_location_address IS 'Human-readable address where device was registered';
COMMENT ON COLUMN public.devices.last_seen_location_lat IS 'Last known latitude of device';
COMMENT ON COLUMN public.devices.last_seen_location_lng IS 'Last known longitude of device';

