-- Create device_repairs table for repair history
-- This table stores all repair records for devices

CREATE TABLE IF NOT EXISTS public.device_repairs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    repair_type VARCHAR(100) NOT NULL, -- 'Screen replacement', 'Battery replacement', 'Water damage repair', etc.
    service_provider TEXT, -- 'FixIt Pro', 'Apple Store', 'Local Repair Shop', etc.
    repair_date DATE NOT NULL,
    cost DECIMAL(10,2),
    receipt_url TEXT,
    description TEXT,
    warranty_after_repair_months INTEGER DEFAULT 0, -- Warranty provided after this repair
    repair_notes TEXT, -- Additional notes about the repair
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'failed')),
    verified_by_user_id UUID REFERENCES auth.users(id), -- Admin or system user who verified
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_repairs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view repairs for their devices" ON public.device_repairs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert repairs for their devices" ON public.device_repairs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own repair records" ON public.device_repairs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "System can verify repairs" ON public.device_repairs
    FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_repairs_device_id ON public.device_repairs(device_id);
CREATE INDEX IF NOT EXISTS idx_device_repairs_repair_date ON public.device_repairs(repair_date);
CREATE INDEX IF NOT EXISTS idx_device_repairs_repair_type ON public.device_repairs(repair_type);
CREATE INDEX IF NOT EXISTS idx_device_repairs_verification_status ON public.device_repairs(verification_status);
CREATE INDEX IF NOT EXISTS idx_device_repairs_service_provider ON public.device_repairs(service_provider);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_device_repairs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_repairs_updated_at
    BEFORE UPDATE ON public.device_repairs
    FOR EACH ROW
    EXECUTE FUNCTION update_device_repairs_updated_at();

-- Create function to get repair summary for a device
CREATE OR REPLACE FUNCTION get_device_repair_summary(device_uuid UUID)
RETURNS TABLE (
    total_repairs INTEGER,
    total_repair_cost DECIMAL,
    last_repair_date DATE,
    major_repairs INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_repairs,
        COALESCE(SUM(cost), 0) as total_repair_cost,
        MAX(repair_date) as last_repair_date,
        COUNT(*) FILTER (WHERE cost > 1000)::INTEGER as major_repairs
    FROM public.device_repairs
    WHERE device_id = device_uuid AND verification_status = 'verified';
END;
$$ LANGUAGE plpgsql;

-- Create function to check if device has major repairs
CREATE OR REPLACE FUNCTION has_major_repairs(device_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    major_repair_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO major_repair_count
    FROM public.device_repairs
    WHERE device_id = device_uuid 
    AND verification_status = 'verified'
    AND (cost > 1000 OR repair_type IN ('Screen replacement', 'Motherboard replacement', 'Water damage repair'));
    
    RETURN major_repair_count > 0;
END;
$$ LANGUAGE plpgsql;
