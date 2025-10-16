-- Create device_verifications table for detailed verification history
-- This table stores all verification events for devices (QR scans, serial lookups, etc.)

CREATE TABLE IF NOT EXISTS public.device_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('QR_SCAN', 'SERIAL_LOOKUP', 'DOCUMENT_REVIEW', 'BLOCKCHAIN_ANCHOR', 'IMEI_CHECK', 'MANUFACTURER_VERIFY')),
    verifier_name TEXT NOT NULL, -- 'STOLEN Platform', 'TechDeals Pro', etc.
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    verification_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'verified' CHECK (status IN ('verified', 'failed', 'pending', 'expired')),
    verification_details JSONB, -- Store tags like ["QR Code", "Serial Number Match", "Blockchain Record"]
    blockchain_tx_id TEXT,
    verified_by_user_id UUID REFERENCES auth.users(id),
    error_message TEXT, -- Store error details if verification failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view verifications for their devices" ON public.device_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view public device verifications" ON public.device_verifications
    FOR SELECT USING (status = 'verified');

CREATE POLICY "System can insert verifications" ON public.device_verifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update verifications" ON public.device_verifications
    FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_verifications_device_id ON public.device_verifications(device_id);
CREATE INDEX IF NOT EXISTS idx_device_verifications_method ON public.device_verifications(verification_method);
CREATE INDEX IF NOT EXISTS idx_device_verifications_status ON public.device_verifications(status);
CREATE INDEX IF NOT EXISTS idx_device_verifications_timestamp ON public.device_verifications(verification_timestamp);
CREATE INDEX IF NOT EXISTS idx_device_verifications_confidence ON public.device_verifications(confidence_score);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_device_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_verifications_updated_at
    BEFORE UPDATE ON public.device_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_device_verifications_updated_at();

-- Create function to calculate overall trust score based on verifications
CREATE OR REPLACE FUNCTION calculate_device_trust_score(device_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    avg_confidence INTEGER;
    verification_count INTEGER;
    trust_score INTEGER;
BEGIN
    -- Get average confidence score and count of verified verifications
    SELECT 
        COALESCE(AVG(confidence_score), 0)::INTEGER,
        COUNT(*)
    INTO avg_confidence, verification_count
    FROM public.device_verifications
    WHERE device_id = device_uuid AND status = 'verified';
    
    -- Calculate trust score based on average confidence and number of verifications
    -- More verifications = higher trust score
    trust_score := avg_confidence;
    
    -- Bonus points for multiple verifications
    IF verification_count >= 3 THEN
        trust_score := LEAST(100, trust_score + 10);
    ELSIF verification_count >= 2 THEN
        trust_score := LEAST(100, trust_score + 5);
    END IF;
    
    RETURN GREATEST(0, LEAST(100, trust_score));
END;
$$ LANGUAGE plpgsql;
