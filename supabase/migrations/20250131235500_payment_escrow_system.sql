-- Payment and Escrow System Enhancement
-- This migration adds comprehensive payment processing and escrow functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Payment Intent Types
CREATE TYPE payment_method_type AS ENUM ('stripe', 'paypal', 's-pay', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');
CREATE TYPE escrow_status AS ENUM ('pending', 'held', 'released', 'refunded', 'disputed');

-- Enhanced Payment Intents Table
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    payment_method payment_method_type NOT NULL,
    status payment_status DEFAULT 'pending',
    metadata JSONB,
    escrow_enabled BOOLEAN DEFAULT false,
    stripe_client_secret TEXT,
    paypal_order_id TEXT,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Escrow Transactions Table
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_intent_id TEXT REFERENCES public.payment_intents(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    status escrow_status DEFAULT 'pending',
    release_conditions TEXT[] DEFAULT ARRAY['Device delivered', 'Buyer confirmation'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_release_date TIMESTAMP WITH TIME ZONE,
    actual_release_date TIMESTAMP WITH TIME ZONE,
    released_by UUID REFERENCES public.users(id),
    release_reason TEXT,
    dispute_reason TEXT,
    
    CONSTRAINT positive_escrow_amount CHECK (amount > 0)
);

-- Wallet Balances Table
CREATE TABLE IF NOT EXISTS public.wallet_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    available_balance DECIMAL(12,2) DEFAULT 0,
    pending_balance DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'ZAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT non_negative_available CHECK (available_balance >= 0),
    CONSTRAINT non_negative_pending CHECK (pending_balance >= 0)
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    payment_intent_id TEXT REFERENCES public.payment_intents(id),
    transaction_type TEXT NOT NULL, -- 'credit', 'debit', 'transfer', 'escrow_hold', 'escrow_release'
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'ZAR',
    balance_after DECIMAL(12,2) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT non_zero_amount CHECK (amount != 0)
);

-- Payment Method Management Table
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    payment_method_type payment_method_type NOT NULL,
    stripe_payment_method_id TEXT,
    paypal_account_id TEXT,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one default per user per type
    UNIQUE(user_id, payment_method_type, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Enhanced Marketplace Orders Table
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_intent_id TEXT REFERENCES public.payment_intents(id),
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.marketplace_listings(id),
    device_id UUID REFERENCES public.devices(id),
    
    -- Order details
    order_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed'
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- Delivery information
    delivery_method TEXT, -- 'courier', 'collection', 'meetup'
    delivery_address JSONB,
    delivery_notes TEXT,
    tracking_number TEXT,
    
    -- Important dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_completed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_unit_price CHECK (unit_price > 0),
    CONSTRAINT positive_total_amount CHECK (total_amount > 0)
);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.users(id),
    change_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispute Management Table
CREATE TABLE IF NOT EXISTS public.payment_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_intent_id TEXT REFERENCES public.payment_intents(id),
    order_id UUID REFERENCES public.marketplace_orders(id),
    initiated_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dispute_reason TEXT NOT NULL,
    dispute_details TEXT,
    evidence JSONB,
    admin_notes TEXT,
    resolution TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON public.payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON public.payment_intents(created_at);

CREATE INDEX IF NOT EXISTS idx_escrow_transactions_payment_intent_id ON public.escrow_transactions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON public.escrow_transactions(status);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id ON public.marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_id ON public.marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON public.marketplace_orders(order_status);

-- Functions for wallet balance management
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the wallet balance after a transaction
    IF TG_OP = 'INSERT' THEN
        UPDATE public.wallet_balances 
        SET 
            available_balance = NEW.balance_after,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Create wallet record if it doesn't exist
        IF NOT FOUND THEN
            INSERT INTO public.wallet_balances (user_id, available_balance)
            VALUES (NEW.user_id, NEW.balance_after);
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet balance updates
DROP TRIGGER IF EXISTS trigger_update_wallet_balance ON public.wallet_transactions;
CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT ON public.wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_balance();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers
DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON public.payment_intents;
CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON public.payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_transactions_updated_at ON public.escrow_transactions;
CREATE TRIGGER update_escrow_transactions_updated_at
    BEFORE UPDATE ON public.escrow_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallet_balances_updated_at ON public.wallet_balances;
CREATE TRIGGER update_wallet_balances_updated_at
    BEFORE UPDATE ON public.wallet_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_orders_updated_at ON public.marketplace_orders;
CREATE TRIGGER update_marketplace_orders_updated_at
    BEFORE UPDATE ON public.marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;

-- Payment Intents Policies
CREATE POLICY "Users can view own payment intents" ON public.payment_intents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment intents" ON public.payment_intents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payment intents" ON public.payment_intents
    FOR UPDATE USING (true); -- Service key updates

-- Wallet Policies
CREATE POLICY "Users can view own wallet balance" ON public.wallet_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Order Policies
CREATE POLICY "Users can view orders as buyer or seller" ON public.marketplace_orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" ON public.marketplace_orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Seed some test data for wallet balances (optional)
INSERT INTO public.wallet_balances (user_id, available_balance, currency)
SELECT id, 10000.00, 'ZAR'
FROM public.users
WHERE email LIKE '%test%' OR email LIKE '%demo%'
ON CONFLICT (user_id) DO NOTHING;

-- Comment on tables
COMMENT ON TABLE public.payment_intents IS 'Stores payment intentions and processing status for all payment methods';
COMMENT ON TABLE public.escrow_transactions IS 'Manages escrow fund holding and release for secure transactions';
COMMENT ON TABLE public.wallet_balances IS 'User wallet balances for S-Pay system';
COMMENT ON TABLE public.wallet_transactions IS 'Transaction history for wallet operations';
COMMENT ON TABLE public.marketplace_orders IS 'Complete order management for marketplace transactions';
COMMENT ON TABLE public.payment_disputes IS 'Dispute resolution system for payment and delivery issues';
