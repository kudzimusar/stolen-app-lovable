-- Create device_risk_assessment table for risk analysis
-- This table stores risk assessment data for devices

CREATE TABLE IF NOT EXISTS public.device_risk_assessment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_status VARCHAR(20) DEFAULT 'clean' CHECK (risk_status IN ('clean', 'low_risk', 'medium_risk', 'high_risk')),
    risk_factors JSONB, -- Array of risk factors detected: ["theft_report", "multiple_owners", "repair_history", "suspicious_activity"]
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by VARCHAR(100), -- 'System', 'Admin User', 'AI Analysis', etc.
    assessment_notes TEXT, -- Additional notes about the assessment
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true, -- Whether this is the current active assessment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_risk_assessment ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view risk assessment for their devices" ON public.device_risk_assessment
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view public risk assessments" ON public.device_risk_assessment
    FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage risk assessments" ON public.device_risk_assessment
    FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_device_id ON public.device_risk_assessment(device_id);
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_risk_score ON public.device_risk_assessment(risk_score);
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_risk_status ON public.device_risk_assessment(risk_status);
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_assessment_date ON public.device_risk_assessment(assessment_date);
CREATE INDEX IF NOT EXISTS idx_device_risk_assessment_is_active ON public.device_risk_assessment(is_active);

-- Create function to perform comprehensive risk assessment
CREATE OR REPLACE FUNCTION perform_device_risk_assessment(device_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    risk_factors JSONB := '[]'::jsonb;
    device_status TEXT;
    theft_reports INTEGER;
    ownership_count INTEGER;
    repair_count INTEGER;
    verification_count INTEGER;
    blockchain_verified BOOLEAN;
BEGIN
    -- Get device status
    SELECT status INTO device_status
    FROM public.devices
    WHERE id = device_uuid;
    
    -- Check for theft reports
    SELECT COUNT(*) INTO theft_reports
    FROM public.lost_found_reports
    WHERE device_id = device_uuid AND status IN ('lost', 'stolen');
    
    -- Count ownership transfers
    SELECT COUNT(*) INTO ownership_count
    FROM public.device_ownership_history
    WHERE device_id = device_uuid;
    
    -- Count repairs
    SELECT COUNT(*) INTO repair_count
    FROM public.device_repairs
    WHERE device_id = device_uuid AND verification_status = 'verified';
    
    -- Count verifications
    SELECT COUNT(*) INTO verification_count
    FROM public.device_verifications
    WHERE device_id = device_uuid AND status = 'verified';
    
    -- Check blockchain verification
    SELECT blockchain_hash IS NOT NULL INTO blockchain_verified
    FROM public.devices
    WHERE id = device_uuid;
    
    -- Calculate risk score based on factors
    -- Start with base score of 100 (no risk)
    risk_score := 100;
    
    -- Deduct points for negative factors
    IF device_status IN ('lost', 'stolen') THEN
        risk_score := risk_score - 50;
        risk_factors := risk_factors || '"device_status_compromised"';
    END IF;
    
    IF theft_reports > 0 THEN
        risk_score := risk_score - 30;
        risk_factors := risk_factors || '"theft_reports"';
    END IF;
    
    IF ownership_count > 3 THEN
        risk_score := risk_score - 15;
        risk_factors := risk_factors || '"multiple_ownership_transfers"';
    END IF;
    
    IF repair_count > 2 THEN
        risk_score := risk_score - 10;
        risk_factors := risk_factors || '"extensive_repair_history"';
    END IF;
    
    -- Add points for positive factors
    IF blockchain_verified THEN
        risk_score := risk_score + 5;
    END IF;
    
    IF verification_count >= 3 THEN
        risk_score := risk_score + 10;
    END IF;
    
    -- Ensure score is within bounds
    risk_score := GREATEST(0, LEAST(100, risk_score));
    
    -- Insert or update risk assessment
    INSERT INTO public.device_risk_assessment (
        device_id,
        risk_score,
        risk_status,
        risk_factors,
        assessed_by,
        is_active
    ) VALUES (
        device_uuid,
        risk_score,
        CASE 
            WHEN risk_score >= 90 THEN 'clean'
            WHEN risk_score >= 70 THEN 'low_risk'
            WHEN risk_score >= 50 THEN 'medium_risk'
            ELSE 'high_risk'
        END,
        risk_factors,
        'System Assessment',
        true
    )
    ON CONFLICT (device_id) DO UPDATE SET
        risk_score = EXCLUDED.risk_score,
        risk_status = EXCLUDED.risk_status,
        risk_factors = EXCLUDED.risk_factors,
        assessment_date = NOW(),
        assessed_by = EXCLUDED.assessed_by,
        last_updated = NOW(),
        is_active = true;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Create function to get current risk status
CREATE OR REPLACE FUNCTION get_device_risk_status(device_uuid UUID)
RETURNS TABLE (
    risk_score INTEGER,
    risk_status VARCHAR(20),
    risk_factors JSONB,
    assessment_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dra.risk_score,
        dra.risk_status,
        dra.risk_factors,
        dra.assessment_date
    FROM public.device_risk_assessment dra
    WHERE dra.device_id = device_uuid 
    AND dra.is_active = true
    ORDER BY dra.assessment_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
