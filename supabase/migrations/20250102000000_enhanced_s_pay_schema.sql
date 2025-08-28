-- Enhanced S-Pay Wallet System Database Schema
-- This migration adds comprehensive wallet functionality, transaction fees, payment methods, and withdrawal support

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enhanced wallet table with multiple balance types
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS available_balance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS escrow_balance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS total_rewards DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(12,2) DEFAULT 1000.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(12,2) DEFAULT 10000.00;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS last_transaction_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS daily_transaction_count INTEGER DEFAULT 0;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS monthly_transaction_count INTEGER DEFAULT 0;

-- Transaction fees table
CREATE TABLE IF NOT EXISTS public.transaction_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type TEXT NOT NULL,
    fee_percentage DECIMAL(5,4) DEFAULT 0.00,
    fixed_fee DECIMAL(10,2) DEFAULT 0.00,
    min_fee DECIMAL(10,2) DEFAULT 0.00,
    max_fee DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL CHECK (method_type IN ('bank_account', 'credit_card', 'crypto_wallet', 'paypal')),
    method_name TEXT NOT NULL,
    method_data JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method_id UUID REFERENCES public.payment_methods(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS net_amount DECIMAL(12,2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS escrow_id UUID REFERENCES public.escrow_accounts(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS dispute_id UUID;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Transaction disputes table
CREATE TABLE IF NOT EXISTS public.transaction_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    initiator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL CHECK (dispute_type IN ('fraud', 'item_not_received', 'item_not_as_described', 'duplicate_charge', 'other')),
    reason TEXT NOT NULL,
    evidence JSONB,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    resolution TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet verification table
CREATE TABLE IF NOT EXISTS public.wallet_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'address', 'phone', 'email')),
    verification_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction limits table
CREATE TABLE IF NOT EXISTS public.transaction_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    limit_type TEXT NOT NULL CHECK (limit_type IN ('daily', 'monthly', 'single_transaction')),
    limit_amount DECIMAL(12,2) NOT NULL,
    current_usage DECIMAL(12,2) DEFAULT 0.00,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_verified ON public.wallets(user_id, is_verified);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON public.wallets(available_balance DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(from_wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON public.transactions(transaction_type, status);
CREATE INDEX IF NOT EXISTS idx_transactions_escrow ON public.transactions(escrow_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.payment_methods(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON public.withdrawal_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_disputes_transaction ON public.transaction_disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_disputes_status ON public.transaction_disputes(status);
CREATE INDEX IF NOT EXISTS idx_wallet_verifications_user ON public.wallet_verifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transaction_limits_user ON public.transaction_limits(user_id, limit_type);

-- Create functions for balance calculations
CREATE OR REPLACE FUNCTION calculate_wallet_balance(wallet_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_balance DECIMAL;
BEGIN
    SELECT 
        COALESCE(available_balance, 0) + 
        COALESCE(escrow_balance, 0) + 
        COALESCE(pending_balance, 0)
    INTO total_balance
    FROM public.wallets
    WHERE id = wallet_id;
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate transaction fees
CREATE OR REPLACE FUNCTION calculate_transaction_fee(amount DECIMAL, transaction_type TEXT)
RETURNS DECIMAL AS $$
DECLARE
    fee_info RECORD;
    calculated_fee DECIMAL;
BEGIN
    SELECT fee_percentage, fixed_fee, min_fee, max_fee
    INTO fee_info
    FROM public.transaction_fees
    WHERE transaction_type = $2 AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0.00;
    END IF;
    
    -- Calculate percentage fee
    calculated_fee = (amount * fee_info.fee_percentage) + fee_info.fixed_fee;
    
    -- Apply min/max constraints
    IF calculated_fee < fee_info.min_fee THEN
        calculated_fee = fee_info.min_fee;
    ELSIF calculated_fee > fee_info.max_fee THEN
        calculated_fee = fee_info.max_fee;
    END IF;
    
    RETURN calculated_fee;
END;
$$ LANGUAGE plpgsql;

-- Function to validate transaction limits
CREATE OR REPLACE FUNCTION validate_transaction_limits(user_id UUID, amount DECIMAL, transaction_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    wallet_info RECORD;
    daily_usage DECIMAL;
    monthly_usage DECIMAL;
BEGIN
    -- Get wallet information
    SELECT daily_limit, monthly_limit, daily_transaction_count, monthly_transaction_count
    INTO wallet_info
    FROM public.wallets
    WHERE user_id = $1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check daily limit
    IF amount > wallet_info.daily_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Check monthly limit
    IF amount > wallet_info.monthly_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Check daily transaction count (limit to 50 transactions per day)
    IF wallet_info.daily_transaction_count >= 50 THEN
        RETURN FALSE;
    END IF;
    
    -- Check monthly transaction count (limit to 500 transactions per month)
    IF wallet_info.monthly_transaction_count >= 500 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update wallet balance when transaction is completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update sender balance
        IF NEW.from_wallet_id IS NOT NULL THEN
            UPDATE public.wallets 
            SET 
                available_balance = available_balance - NEW.amount - NEW.fee_amount,
                last_transaction_date = NOW(),
                daily_transaction_count = CASE 
                    WHEN DATE(last_transaction_date) = CURRENT_DATE THEN daily_transaction_count + 1
                    ELSE 1
                END,
                monthly_transaction_count = CASE 
                    WHEN DATE_TRUNC('month', last_transaction_date) = DATE_TRUNC('month', CURRENT_DATE) THEN monthly_transaction_count + 1
                    ELSE 1
                END
            WHERE id = NEW.from_wallet_id;
        END IF;
        
        -- Update recipient balance
        IF NEW.to_wallet_id IS NOT NULL THEN
            UPDATE public.wallets 
            SET 
                available_balance = available_balance + NEW.amount,
                last_transaction_date = NOW()
            WHERE id = NEW.to_wallet_id;
        END IF;
    END IF;
    
    -- Handle escrow transactions
    IF NEW.transaction_type = 'escrow_hold' AND NEW.status = 'completed' THEN
        UPDATE public.wallets 
        SET 
            available_balance = available_balance - NEW.amount,
            escrow_balance = escrow_balance + NEW.amount
        WHERE id = NEW.from_wallet_id;
    END IF;
    
    -- Handle escrow release
    IF NEW.transaction_type = 'escrow_release' AND NEW.status = 'completed' THEN
        UPDATE public.wallets 
        SET 
            escrow_balance = escrow_balance - NEW.amount,
            available_balance = available_balance + NEW.amount
        WHERE id = NEW.to_wallet_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily limits
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
    UPDATE public.wallets 
    SET daily_transaction_count = 0
    WHERE DATE(last_transaction_date) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly limits
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
    UPDATE public.wallets 
    SET monthly_transaction_count = 0
    WHERE DATE_TRUNC('month', last_transaction_date) < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER IF NOT EXISTS trigger_update_wallet_balance
    AFTER INSERT OR UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Create scheduled jobs for limit resets (requires pg_cron extension)
-- SELECT cron.schedule('reset-daily-limits', '0 0 * * *', 'SELECT reset_daily_limits();');
-- SELECT cron.schedule('reset-monthly-limits', '0 0 1 * *', 'SELECT reset_monthly_limits();');

-- Insert default transaction fees
INSERT INTO public.transaction_fees (transaction_type, fee_percentage, fixed_fee, min_fee, max_fee) VALUES
('transfer', 0.005, 0.10, 0.10, 5.00),
('escrow', 0.01, 0.50, 0.50, 10.00),
('marketplace', 0.03, 0.00, 0.50, 25.00),
('withdrawal', 0.02, 1.00, 1.00, 15.00),
('reward', 0.00, 0.00, 0.00, 0.00),
('refund', 0.00, 0.00, 0.00, 0.00)
ON CONFLICT (transaction_type) DO UPDATE SET
    fee_percentage = EXCLUDED.fee_percentage,
    fixed_fee = EXCLUDED.fixed_fee,
    min_fee = EXCLUDED.min_fee,
    max_fee = EXCLUDED.max_fee,
    updated_at = NOW();

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_transaction_fees_updated_at 
    BEFORE UPDATE ON public.transaction_fees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_payment_methods_updated_at 
    BEFORE UPDATE ON public.payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_withdrawal_requests_updated_at 
    BEFORE UPDATE ON public.withdrawal_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_transaction_disputes_updated_at 
    BEFORE UPDATE ON public.transaction_disputes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_wallet_verifications_updated_at 
    BEFORE UPDATE ON public.wallet_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_transaction_limits_updated_at 
    BEFORE UPDATE ON public.transaction_limits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transaction_fees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawal_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transaction_disputes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transaction_limits TO authenticated;

-- Enable Row Level Security (RLS)
ALTER TABLE public.transaction_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view transaction fees" ON public.transaction_fees
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own withdrawal requests" ON public.withdrawal_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transaction disputes" ON public.transaction_disputes
    FOR SELECT USING (auth.uid() = initiator_id);

CREATE POLICY "Users can create transaction disputes" ON public.transaction_disputes
    FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Users can manage their own wallet verifications" ON public.wallet_verifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transaction limits" ON public.transaction_limits
    FOR ALL USING (auth.uid() = user_id);

-- Update existing wallets to have proper balance structure
UPDATE public.wallets 
SET 
    available_balance = COALESCE(balance, 0.00),
    escrow_balance = 0.00,
    pending_balance = 0.00,
    total_rewards = 0.00
WHERE available_balance IS NULL;

-- Create default transaction limits for existing users
INSERT INTO public.transaction_limits (user_id, limit_type, limit_amount, reset_date)
SELECT 
    w.user_id,
    'daily',
    w.daily_limit,
    CURRENT_DATE + INTERVAL '1 day'
FROM public.wallets w
WHERE NOT EXISTS (
    SELECT 1 FROM public.transaction_limits tl 
    WHERE tl.user_id = w.user_id AND tl.limit_type = 'daily'
);

INSERT INTO public.transaction_limits (user_id, limit_type, limit_amount, reset_date)
SELECT 
    w.user_id,
    'monthly',
    w.monthly_limit,
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
FROM public.wallets w
WHERE NOT EXISTS (
    SELECT 1 FROM public.transaction_limits tl 
    WHERE tl.user_id = w.user_id AND tl.limit_type = 'monthly'
);

INSERT INTO public.transaction_limits (user_id, limit_type, limit_amount, reset_date)
SELECT 
    w.user_id,
    'single_transaction',
    5000.00,
    CURRENT_DATE + INTERVAL '1 day'
FROM public.wallets w
WHERE NOT EXISTS (
    SELECT 1 FROM public.transaction_limits tl 
    WHERE tl.user_id = w.user_id AND tl.limit_type = 'single_transaction'
);
