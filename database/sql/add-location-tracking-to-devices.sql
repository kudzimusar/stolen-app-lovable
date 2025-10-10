-- Add location tracking columns to devices table
-- This enables geolocation functionality like the Lost & Found feature

ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS registration_location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS registration_location_lng NUMERIC,
ADD COLUMN IF NOT EXISTS registration_location_address TEXT,
ADD COLUMN IF NOT EXISTS last_seen_location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS last_seen_location_lng NUMERIC;

-- Add indexes for location queries
CREATE INDEX IF NOT EXISTS idx_devices_registration_location ON public.devices(registration_location_lat, registration_location_lng);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen_location ON public.devices(last_seen_location_lat, last_seen_location_lng);

-- Add comments explaining the columns
COMMENT ON COLUMN public.devices.registration_location_lat IS 'Latitude where device was initially registered';
COMMENT ON COLUMN public.devices.registration_location_lng IS 'Longitude where device was initially registered';
COMMENT ON COLUMN public.devices.registration_location_address IS 'Human-readable address where device was registered';
COMMENT ON COLUMN public.devices.last_seen_location_lat IS 'Latitude of last known device location';
COMMENT ON COLUMN public.devices.last_seen_location_lng IS 'Longitude of last known device location';

-- Update existing devices to have default location if none exists
UPDATE public.devices 
SET 
  registration_location_address = COALESCE(last_seen_location, 'Location not specified'),
  registration_location_lat = -26.2041, -- Default to Johannesburg, South Africa
  registration_location_lng = 28.0473
WHERE registration_location_address IS NULL OR registration_location_address = '';
