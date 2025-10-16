-- Create device_ownership_history table for detailed ownership transfer history
-- This table stores all ownership changes for devices including transfers and sales

CREATE TABLE IF NOT EXISTS public.device_ownership_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id), -- The owner after this transfer
    previous_owner_id UUID REFERENCES auth.users(id), -- The owner before this transfer (null for initial purchase)
    transfer_from_entity TEXT, -- 'Apple Store Sandton', 'John Doe', etc.
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transfer_method VARCHAR(20) DEFAULT 'purchase' CHECK (transfer_method IN ('purchase', 'sale', 'gift', 'inheritance', 'trade', 'other')),
    blockchain_tx_id TEXT UNIQUE, -- Blockchain transaction hash for this specific transfer
    verification_status VARCHAR(20) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'failed')),
    -- Document URLs for this specific transfer
    receipt_url TEXT,
    warranty_card_url TEXT,
    sales_agreement_url TEXT,
    device_report_url TEXT,
    certificate_url TEXT, -- For ownership transfer certificates
    ownership_proof_url TEXT, -- Additional proof of ownership
    transfer_notes TEXT, -- Additional notes about the transfer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.device_ownership_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view ownership history for their devices" ON public.device_ownership_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        ) OR
        owner_id = auth.uid() OR
        previous_owner_id = auth.uid()
    );

CREATE POLICY "Users can insert ownership history" ON public.device_ownership_history
    FOR INSERT WITH CHECK (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.devices 
            WHERE id = device_id AND current_owner_id = auth.uid()
        )
    );

CREATE POLICY "System can update ownership history" ON public.device_ownership_history
    FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_device_id ON public.device_ownership_history(device_id);
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_owner_id ON public.device_ownership_history(owner_id);
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_previous_owner_id ON public.device_ownership_history(previous_owner_id);
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_transfer_date ON public.device_ownership_history(transfer_date);
CREATE INDEX IF NOT EXISTS idx_device_ownership_history_blockchain_tx_id ON public.device_ownership_history(blockchain_tx_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_device_ownership_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_ownership_history_updated_at
    BEFORE UPDATE ON public.device_ownership_history
    FOR EACH ROW
    EXECUTE FUNCTION update_device_ownership_history_updated_at();

-- Create function to get current owner count for a device
CREATE OR REPLACE FUNCTION get_device_owner_count(device_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    owner_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT owner_id)
    INTO owner_count
    FROM public.device_ownership_history
    WHERE device_id = device_uuid;
    
    RETURN COALESCE(owner_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get ownership chain for a device
CREATE OR REPLACE FUNCTION get_device_ownership_chain(device_uuid UUID)
RETURNS TABLE (
    owner_name TEXT,
    transfer_date TIMESTAMP WITH TIME ZONE,
    transfer_method VARCHAR(20),
    verification_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(u.raw_user_meta_data->>'full_name', u.email) as owner_name,
        doh.transfer_date,
        doh.transfer_method,
        doh.verification_status
    FROM public.device_ownership_history doh
    JOIN auth.users u ON doh.owner_id = u.id
    WHERE doh.device_id = device_uuid
    ORDER BY doh.transfer_date ASC;
END;
$$ LANGUAGE plpgsql;
