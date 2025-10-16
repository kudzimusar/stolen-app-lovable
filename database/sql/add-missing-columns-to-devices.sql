-- Add missing columns to devices table for comprehensive product detail page support

-- Add columns for enhanced device specifications
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS serial_status VARCHAR(20) DEFAULT 'clean' CHECK (serial_status IN ('clean', 'reported_lost', 'reported_stolen', 'blacklisted'));
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS ram_gb INTEGER;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS processor TEXT;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS screen_size_inch DECIMAL(4,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS battery_health_percentage INTEGER CHECK (battery_health_percentage >= 0 AND battery_health_percentage <= 100);

-- Add columns for enhanced tracking
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS last_seen_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS device_age_months INTEGER;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS depreciation_rate DECIMAL(3,2) DEFAULT 0.10;

-- Add columns for enhanced verification
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'basic' CHECK (verification_level IN ('basic', 'standard', 'premium', 'enterprise'));
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS blockchain_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS last_risk_assessment_date TIMESTAMP WITH TIME ZONE;

-- Add columns for enhanced marketplace integration
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS is_marketplace_eligible BOOLEAN DEFAULT true;
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS marketplace_restrictions TEXT[];
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS recommended_price DECIMAL(10,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS price_range_min DECIMAL(10,2);
ALTER TABLE public.devices ADD COLUMN IF NOT EXISTS price_range_max DECIMAL(10,2);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_devices_last_verified_date ON public.devices(last_verified_date);
CREATE INDEX IF NOT EXISTS idx_devices_trust_score ON public.devices(trust_score);
CREATE INDEX IF NOT EXISTS idx_devices_serial_status ON public.devices(serial_status);
CREATE INDEX IF NOT EXISTS idx_devices_verification_level ON public.devices(verification_level);
CREATE INDEX IF NOT EXISTS idx_devices_marketplace_eligible ON public.devices(is_marketplace_eligible);
CREATE INDEX IF NOT EXISTS idx_devices_estimated_value ON public.devices(estimated_value);

-- Create function to calculate device age in months
CREATE OR REPLACE FUNCTION calculate_device_age(device_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    device_age INTEGER;
    purchase_date_val DATE;
    registration_date_val TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get purchase date or registration date
    SELECT purchase_date, registration_date
    INTO purchase_date_val, registration_date_val
    FROM public.devices
    WHERE id = device_uuid;
    
    -- Calculate age based on purchase date if available, otherwise registration date
    IF purchase_date_val IS NOT NULL THEN
        device_age := EXTRACT(EPOCH FROM (CURRENT_DATE - purchase_date_val)) / (30 * 24 * 60 * 60);
    ELSIF registration_date_val IS NOT NULL THEN
        device_age := EXTRACT(EPOCH FROM (CURRENT_DATE - registration_date_val::DATE)) / (30 * 24 * 60 * 60);
    ELSE
        device_age := 0;
    END IF;
    
    RETURN GREATEST(0, device_age::INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate estimated value with depreciation
CREATE OR REPLACE FUNCTION calculate_estimated_value(device_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    original_price DECIMAL;
    device_age_months INTEGER;
    depreciation_rate DECIMAL;
    estimated_value DECIMAL;
BEGIN
    -- Get original price and age
    SELECT purchase_price, device_age_months, depreciation_rate
    INTO original_price, device_age_months, depreciation_rate
    FROM public.devices
    WHERE id = device_uuid;
    
    -- Calculate estimated value with depreciation
    IF original_price IS NOT NULL AND device_age_months IS NOT NULL THEN
        estimated_value := original_price * POWER(1 - COALESCE(depreciation_rate, 0.10), device_age_months / 12.0);
    ELSE
        estimated_value := NULL;
    END IF;
    
    RETURN estimated_value;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate device age and estimated value
CREATE OR REPLACE FUNCTION update_device_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate device age in months
    NEW.device_age_months := calculate_device_age(NEW.id);
    
    -- Calculate estimated value
    NEW.estimated_value := calculate_estimated_value(NEW.id);
    
    -- Set recommended price range (estimated value ± 20%)
    IF NEW.estimated_value IS NOT NULL THEN
        NEW.price_range_min := NEW.estimated_value * 0.8;
        NEW.price_range_max := NEW.estimated_value * 1.2;
        NEW.recommended_price := NEW.estimated_value;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new and updated devices
CREATE TRIGGER trigger_update_device_calculated_fields
    BEFORE INSERT OR UPDATE ON public.devices
    FOR EACH ROW
    EXECUTE FUNCTION update_device_calculated_fields();

-- Update existing devices with calculated values
UPDATE public.devices 
SET 
    device_age_months = calculate_device_age(id),
    estimated_value = calculate_estimated_value(id)
WHERE device_age_months IS NULL OR estimated_value IS NULL;
