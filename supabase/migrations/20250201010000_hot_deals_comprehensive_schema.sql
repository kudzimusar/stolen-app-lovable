-- Hot Deals Comprehensive Database Schema
-- This migration creates all necessary tables for advanced Hot Deals functionality

-- =====================================================
-- 1. HOT DEALS CORE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hot_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Deal Timing & Urgency
    urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('today-only', '48-hours', '1-week', 'negotiable', 'lightning', 'flash')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    time_left_seconds INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - NOW()))) STORED,
    auto_expire BOOLEAN DEFAULT true,
    
    -- Pricing & Bidding
    original_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    minimum_price DECIMAL(10,2),
    reserve_price DECIMAL(10,2),
    price_drop_percentage DECIMAL(5,2) DEFAULT 0,
    dynamic_pricing_enabled BOOLEAN DEFAULT false,
    bidding_enabled BOOLEAN DEFAULT false,
    
    -- Performance Metrics
    view_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    bid_count INTEGER DEFAULT 0,
    conversion_score DECIMAL(5,2) DEFAULT 0,
    
    -- AI & ML Data
    ai_price_suggestion DECIMAL(10,2),
    demand_prediction_score INTEGER DEFAULT 0 CHECK (demand_prediction_score >= 0 AND demand_prediction_score <= 100),
    optimal_timing_score INTEGER DEFAULT 0 CHECK (optimal_timing_score >= 0 AND optimal_timing_score <= 100),
    fraud_risk_score INTEGER DEFAULT 0 CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 100),
    
    -- Status & Flags
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'sold', 'cancelled')),
    featured BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    boost_level INTEGER DEFAULT 0 CHECK (boost_level >= 0 AND boost_level <= 3),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for performance
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_pricing CHECK (current_price > 0 AND minimum_price >= 0)
);

-- =====================================================
-- 2. HOT DEALS BOOST ANALYTICS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hot_deals_boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.hot_deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Boost Details
    boost_type VARCHAR(20) NOT NULL CHECK (boost_type IN ('priority', 'premium', 'lightning')),
    boost_level INTEGER NOT NULL CHECK (boost_level >= 1 AND boost_level <= 3),
    duration_hours INTEGER NOT NULL,
    price_paid DECIMAL(10,2) NOT NULL,
    
    -- Performance Analytics
    views_before INTEGER DEFAULT 0,
    views_after INTEGER DEFAULT 0,
    clicks_before INTEGER DEFAULT 0,
    clicks_after INTEGER DEFAULT 0,
    messages_before INTEGER DEFAULT 0,
    messages_after INTEGER DEFAULT 0,
    conversion_improvement DECIMAL(5,2) DEFAULT 0,
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_intent_id VARCHAR(255),
    
    CONSTRAINT valid_boost_duration CHECK (end_time > start_time)
);

-- =====================================================
-- 3. REAL-TIME BIDDING SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hot_deals_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.hot_deals(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Bid Details
    bid_amount DECIMAL(10,2) NOT NULL,
    max_bid DECIMAL(10,2), -- For auto-bidding
    bid_type VARCHAR(20) DEFAULT 'manual' CHECK (bid_type IN ('manual', 'auto', 'reserve')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'winning', 'won', 'cancelled')),
    is_winning_bid BOOLEAN DEFAULT false,
    
    -- AI Analysis
    bid_confidence_score INTEGER DEFAULT 0 CHECK (bid_confidence_score >= 0 AND bid_confidence_score <= 100),
    market_competitiveness DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- 4. NOTIFICATIONS & ALERTS SYSTEM
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hot_deals_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.hot_deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN (
        'deal_created', 'price_drop', 'time_running_out', 'bid_placed', 
        'outbid', 'deal_ending', 'deal_expired', 'deal_sold', 'new_message'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery Channels
    push_notification BOOLEAN DEFAULT true,
    email_notification BOOLEAN DEFAULT false,
    sms_notification BOOLEAN DEFAULT false,
    in_app_notification BOOLEAN DEFAULT true,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- 5. AI ANALYTICS & PREDICTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hot_deals_ai_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.hot_deals(id) ON DELETE CASCADE,
    
    -- Demand Prediction
    predicted_demand INTEGER DEFAULT 0 CHECK (predicted_demand >= 0 AND predicted_demand <= 100),
    demand_trend VARCHAR(20) DEFAULT 'stable' CHECK (demand_trend IN ('rising', 'stable', 'falling')),
    peak_demand_time TIMESTAMP WITH TIME ZONE,
    market_saturation DECIMAL(5,2) DEFAULT 0,
    
    -- Pricing Analysis
    optimal_price DECIMAL(10,2),
    price_elasticity DECIMAL(5,2) DEFAULT 0,
    competitor_price_avg DECIMAL(10,2),
    price_recommendation VARCHAR(20) CHECK (price_recommendation IN ('increase', 'decrease', 'maintain')),
    
    -- Timing Optimization
    optimal_listing_time TIME,
    optimal_ending_time TIME,
    best_day_of_week INTEGER CHECK (best_day_of_week >= 0 AND best_day_of_week <= 6),
    seasonal_factor DECIMAL(5,2) DEFAULT 1.0,
    
    -- Performance Prediction
    predicted_views INTEGER DEFAULT 0,
    predicted_bids INTEGER DEFAULT 0,
    predicted_sale_probability DECIMAL(5,2) DEFAULT 0,
    predicted_sale_time TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model_version VARCHAR(20) DEFAULT 'v1.0',
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- =====================================================
-- 6. DYNAMIC PRICING HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hot_deals_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.hot_deals(id) ON DELETE CASCADE,
    
    -- Price Change Details
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    price_change_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN old_price > 0 THEN ((new_price - old_price) / old_price) * 100
            ELSE 0
        END
    ) STORED,
    
    -- Reason for Change
    change_reason VARCHAR(50) CHECK (change_reason IN (
        'ai_optimization', 'manual_adjustment', 'bid_pressure', 'time_pressure', 
        'demand_surge', 'competitor_matching', 'inventory_clearance'
    )),
    ai_triggered BOOLEAN DEFAULT false,
    
    -- Performance Impact
    views_before_change INTEGER DEFAULT 0,
    views_after_change INTEGER DEFAULT 0,
    bids_before_change INTEGER DEFAULT 0,
    bids_after_change INTEGER DEFAULT 0,
    
    -- Metadata
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES public.users(id),
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- 7. FLASH SALES & LIMITED TIME OFFERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flash_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Flash Sale Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_items INTEGER,
    items_sold INTEGER DEFAULT 0,
    
    -- Pricing
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    minimum_discount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    
    -- Targeting
    target_categories TEXT[] DEFAULT '{}',
    target_locations TEXT[] DEFAULT '{}',
    target_user_types TEXT[] DEFAULT '{}',
    
    -- Performance
    total_views INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    CONSTRAINT valid_flash_sale_time CHECK (end_time > start_time)
);

-- Link flash sales to hot deals
CREATE TABLE IF NOT EXISTS public.flash_sale_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flash_sale_id UUID REFERENCES public.flash_sales(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.hot_deals(id) ON DELETE CASCADE,
    original_price DECIMAL(10,2) NOT NULL,
    flash_price DECIMAL(10,2) NOT NULL,
    quantity_limit INTEGER DEFAULT 1,
    sold_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(flash_sale_id, deal_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Hot Deals indexes
CREATE INDEX IF NOT EXISTS idx_hot_deals_urgency_status ON public.hot_deals(urgency_level, status);
CREATE INDEX IF NOT EXISTS idx_hot_deals_end_time ON public.hot_deals(end_time) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_hot_deals_seller ON public.hot_deals(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_hot_deals_featured ON public.hot_deals(featured, boost_level) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_hot_deals_pricing ON public.hot_deals(current_price, urgency_level);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.hot_deals_notifications(user_id, status) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_deal ON public.hot_deals_notifications(deal_id, notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.hot_deals_notifications(priority, created_at) WHERE status = 'pending';

-- Bidding indexes
CREATE INDEX IF NOT EXISTS idx_bids_deal_active ON public.hot_deals_bids(deal_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_bids_winning ON public.hot_deals_bids(deal_id) WHERE is_winning_bid = true;
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON public.hot_deals_bids(bidder_id, created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_ai_analytics_deal ON public.hot_deals_ai_analytics(deal_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_price_history_deal ON public.hot_deals_price_history(deal_id, changed_at);

-- Flash sales indexes
CREATE INDEX IF NOT EXISTS idx_flash_sales_active ON public.flash_sales(status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_flash_sale_deals ON public.flash_sale_deals(flash_sale_id, deal_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically expire deals
CREATE OR REPLACE FUNCTION expire_hot_deals()
RETURNS void AS $$
BEGIN
    UPDATE public.hot_deals 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND end_time <= NOW() 
    AND auto_expire = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update deal metrics
CREATE OR REPLACE FUNCTION update_deal_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update view count, interest, etc.
    IF TG_OP = 'INSERT' THEN
        CASE TG_TABLE_NAME
            WHEN 'hot_deals_bids' THEN
                UPDATE public.hot_deals 
                SET bid_count = bid_count + 1, updated_at = NOW()
                WHERE id = NEW.deal_id;
            WHEN 'hot_deals_notifications' THEN
                UPDATE public.hot_deals 
                SET message_count = message_count + 1, updated_at = NOW()
                WHERE id = NEW.deal_id;
        END CASE;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_deal_metrics_bids ON public.hot_deals_bids;
CREATE TRIGGER trigger_update_deal_metrics_bids
    AFTER INSERT ON public.hot_deals_bids
    FOR EACH ROW EXECUTE FUNCTION update_deal_metrics();

DROP TRIGGER IF EXISTS trigger_update_deal_metrics_notifications ON public.hot_deals_notifications;
CREATE TRIGGER trigger_update_deal_metrics_notifications
    AFTER INSERT ON public.hot_deals_notifications
    FOR EACH ROW EXECUTE FUNCTION update_deal_metrics();

-- Function to determine winning bid
CREATE OR REPLACE FUNCTION update_winning_bid()
RETURNS TRIGGER AS $$
BEGIN
    -- Clear previous winning bid
    UPDATE public.hot_deals_bids 
    SET is_winning_bid = false 
    WHERE deal_id = NEW.deal_id AND id != NEW.id;
    
    -- Set new winning bid
    UPDATE public.hot_deals_bids 
    SET is_winning_bid = true 
    WHERE id = (
        SELECT id FROM public.hot_deals_bids 
        WHERE deal_id = NEW.deal_id AND status = 'active'
        ORDER BY bid_amount DESC, created_at ASC
        LIMIT 1
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create winning bid trigger
DROP TRIGGER IF EXISTS trigger_update_winning_bid ON public.hot_deals_bids;
CREATE TRIGGER trigger_update_winning_bid
    AFTER INSERT OR UPDATE ON public.hot_deals_bids
    FOR EACH ROW EXECUTE FUNCTION update_winning_bid();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.hot_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_deals_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_deals_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_deals_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_deals_ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_deals_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_deals ENABLE ROW LEVEL SECURITY;

-- Policies for hot_deals
CREATE POLICY "Hot deals are viewable by everyone" ON public.hot_deals
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create hot deals" ON public.hot_deals
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their deals" ON public.hot_deals
    FOR UPDATE USING (auth.uid() = seller_id);

-- Policies for bidding
CREATE POLICY "Users can view all bids for transparency" ON public.hot_deals_bids
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can place bids" ON public.hot_deals_bids
    FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.hot_deals_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Default permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.hot_deals TO anon, authenticated;
GRANT SELECT ON public.hot_deals_bids TO anon, authenticated;
GRANT ALL ON public.hot_deals_boosts TO authenticated;
GRANT ALL ON public.hot_deals_notifications TO authenticated;
GRANT SELECT ON public.hot_deals_ai_analytics TO authenticated;
GRANT SELECT ON public.hot_deals_price_history TO authenticated;
GRANT SELECT ON public.flash_sales TO anon, authenticated;
GRANT SELECT ON public.flash_sale_deals TO anon, authenticated;
