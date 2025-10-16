-- Create device_certificates table for warranties and certificates
-- This table stores all certificates and warranties associated with devices

CREATE TABLE IF NOT EXISTS public.device_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL CHECK (certificate_type IN ('warranty', 'authenticity', 'ownership', 'insurance', 'service_agreement', 'extended_warranty')),
    issuer TEXT NOT NULL, -- 'Apple Inc.', 'STOLEN Platform', 'Insurance Company', etc.
    certificate_number TEXT, -- Certificate serial number or ID
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT, -- URL to the actual certificate document
    certificate_data JSONB, -- Additional certificate-specific data
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'failed', 'expired')),
    verified_by_user_id UUID REFERENCES auth.users(id), -- Who verified this certificate
    verification_notes TEXT,
    is_active BOOLEAN DEFAULT true, -- Whether this certificate is currently active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view certificates for their devices" ON public.device_certificates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert certificates for their devices" ON public.device_certificates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "System can verify certificates" ON public.device_certificates
    FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_certificates_device_id ON public.device_certificates(device_id);
CREATE INDEX IF NOT EXISTS idx_device_certificates_type ON public.device_certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_device_certificates_issuer ON public.device_certificates(issuer);
CREATE INDEX IF NOT EXISTS idx_device_certificates_issue_date ON public.device_certificates(issue_date);
CREATE INDEX IF NOT EXISTS idx_device_certificates_expiry_date ON public.device_certificates(expiry_date);
CREATE INDEX IF NOT EXISTS idx_device_certificates_verification_status ON public.device_certificates(verification_status);
CREATE INDEX IF NOT EXISTS idx_device_certificates_is_active ON public.device_certificates(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_device_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_certificates_updated_at
    BEFORE UPDATE ON public.device_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_device_certificates_updated_at();

-- Create function to get active warranty for a device
CREATE OR REPLACE FUNCTION get_active_warranty(device_uuid UUID)
RETURNS TABLE (
    warranty_type VARCHAR(50),
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    days_remaining INTEGER,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.certificate_type,
        dc.issuer,
        dc.issue_date,
        dc.expiry_date,
        CASE 
            WHEN dc.expiry_date IS NOT NULL THEN 
                (dc.expiry_date - CURRENT_DATE)::INTEGER
            ELSE NULL
        END as days_remaining,
        CASE 
            WHEN dc.expiry_date IS NULL THEN true
            WHEN dc.expiry_date >= CURRENT_DATE THEN true
            ELSE false
        END as is_valid
    FROM public.device_certificates dc
    WHERE dc.device_id = device_uuid 
    AND dc.certificate_type = 'warranty'
    AND dc.is_active = true
    AND dc.verification_status = 'verified'
    ORDER BY dc.issue_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get all active certificates for a device
CREATE OR REPLACE FUNCTION get_device_active_certificates(device_uuid UUID)
RETURNS TABLE (
    certificate_type VARCHAR(50),
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    verification_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.certificate_type,
        dc.issuer,
        dc.issue_date,
        dc.expiry_date,
        dc.certificate_url,
        dc.verification_status
    FROM public.device_certificates dc
    WHERE dc.device_id = device_uuid 
    AND dc.is_active = true
    AND dc.verification_status = 'verified'
    ORDER BY dc.certificate_type, dc.issue_date DESC;
END;
$$ LANGUAGE plpgsql;
