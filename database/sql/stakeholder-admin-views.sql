-- Role-Specific Admin Views
-- Provides aggregated statistics for each stakeholder admin role
-- Used by stakeholder admin dashboards to show their specific data

-- =====================================================
-- RETAILER ADMIN VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.retailer_admin_stats AS
SELECT 
  u.id as retailer_id,
  u.email,
  u.display_name,
  COUNT(DISTINCT ml.id) as total_listings,
  COUNT(DISTINCT CASE WHEN ml.status = 'active' THEN ml.id END) as active_listings,
  COUNT(DISTINCT CASE WHEN ml.status = 'sold' THEN ml.id END) as sold_listings,
  COUNT(DISTINCT d.id) as total_devices,
  COALESCE(SUM(CASE WHEN mt.status = 'completed' THEN mt.amount ELSE 0 END), 0) as total_revenue,
  COUNT(DISTINCT mt.id) as total_transactions,
  COUNT(DISTINCT CASE WHEN mt.created_at >= NOW() - INTERVAL '30 days' THEN mt.id END) as transactions_last_30_days
FROM public.users u
LEFT JOIN public.marketplace_listings ml ON ml.seller_id = u.id
LEFT JOIN public.devices d ON d.current_owner_id = u.id
LEFT JOIN public.marketplace_transactions mt ON mt.seller_id = u.id
WHERE u.role = 'retailer'
GROUP BY u.id, u.email, u.display_name;

-- =====================================================
-- REPAIR SHOP ADMIN VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.repair_shop_admin_stats AS
SELECT 
  u.id as repair_shop_id,
  u.email,
  u.display_name,
  COUNT(DISTINCT ro.id) as total_repairs,
  COUNT(DISTINCT CASE WHEN ro.status = 'pending' THEN ro.id END) as pending_repairs,
  COUNT(DISTINCT CASE WHEN ro.status = 'completed' THEN ro.id END) as completed_repairs,
  COUNT(DISTINCT ro.customer_id) as total_customers,
  COALESCE(SUM(ro.total_cost), 0) as total_revenue,
  COUNT(DISTINCT CASE WHEN ro.created_at >= NOW() - INTERVAL '30 days' THEN ro.id END) as repairs_last_30_days,
  ROUND(AVG(ro.rating), 2) as average_rating
FROM public.users u
LEFT JOIN public.repair_orders ro ON ro.repair_shop_id = u.id
WHERE u.role = 'repair_shop'
GROUP BY u.id, u.email, u.display_name;

-- =====================================================
-- INSURANCE ADMIN VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.insurance_admin_stats AS
SELECT 
  u.id as insurance_id,
  u.email,
  u.display_name,
  COUNT(DISTINCT ip.id) as total_policies,
  COUNT(DISTINCT CASE WHEN ip.status = 'active' THEN ip.id END) as active_policies,
  COUNT(DISTINCT ic.id) as total_claims,
  COUNT(DISTINCT CASE WHEN ic.status = 'pending' THEN ic.id END) as pending_claims,
  COUNT(DISTINCT CASE WHEN ic.status = 'approved' THEN ic.id END) as approved_claims,
  COALESCE(SUM(CASE WHEN ic.status = 'approved' THEN ic.claim_amount ELSE 0 END), 0) as total_payouts,
  COUNT(DISTINCT CASE WHEN ic.created_at >= NOW() - INTERVAL '30 days' THEN ic.id END) as claims_last_30_days
FROM public.users u
LEFT JOIN public.insurance_policies ip ON ip.provider_id = u.id
LEFT JOIN public.insurance_claims ic ON ic.insurance_provider_id = u.id
WHERE u.role = 'insurance'
GROUP BY u.id, u.email, u.display_name;

-- =====================================================
-- LAW ENFORCEMENT ADMIN VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.law_enforcement_admin_stats AS
SELECT 
  u.id as law_enforcement_id,
  u.email,
  u.display_name,
  COUNT(DISTINCT sr.id) as total_cases,
  COUNT(DISTINCT CASE WHEN sr.status = 'active' THEN sr.id END) as active_cases,
  COUNT(DISTINCT CASE WHEN sr.status = 'resolved' THEN sr.id END) as resolved_cases,
  COUNT(DISTINCT CASE WHEN sr.status = 'closed' THEN sr.id END) as closed_cases,
  COUNT(DISTINCT lfr.id) as total_reports_accessed,
  COUNT(DISTINCT CASE WHEN sr.created_at >= NOW() - INTERVAL '30 days' THEN sr.id END) as cases_last_30_days,
  ROUND(
    (COUNT(DISTINCT CASE WHEN sr.status = 'resolved' THEN sr.id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT sr.id), 0)) * 100, 
    2
  ) as resolution_rate
FROM public.users u
LEFT JOIN public.stolen_reports sr ON sr.reporter_id = u.id OR sr.assigned_officer_id = u.id
LEFT JOIN public.lost_found_reports lfr ON lfr.user_id = u.id
WHERE u.role = 'law_enforcement'
GROUP BY u.id, u.email, u.display_name;

-- =====================================================
-- NGO ADMIN VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.ngo_admin_stats AS
SELECT 
  u.id as ngo_id,
  u.email,
  u.display_name,
  COUNT(DISTINCT dd.id) as total_donations,
  COUNT(DISTINCT CASE WHEN dd.status = 'pending' THEN dd.id END) as pending_donations,
  COUNT(DISTINCT CASE WHEN dd.status = 'completed' THEN dd.id END) as completed_donations,
  COUNT(DISTINCT dd.donor_id) as total_donors,
  COUNT(DISTINCT dd.recipient_id) as total_beneficiaries,
  COUNT(DISTINCT d.id) as devices_managed,
  COUNT(DISTINCT CASE WHEN dd.created_at >= NOW() - INTERVAL '30 days' THEN dd.id END) as donations_last_30_days
FROM public.users u
LEFT JOIN public.device_donations dd ON dd.ngo_id = u.id
LEFT JOIN public.devices d ON d.current_owner_id = u.id
WHERE u.role = 'ngo'
GROUP BY u.id, u.email, u.display_name;

-- =====================================================
-- STAKEHOLDER ADMIN REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stakeholder_admin_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL,
  requested_admin_access BOOLEAN DEFAULT TRUE,
  business_justification TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  CONSTRAINT valid_stakeholder_role CHECK (
    user_role IN ('retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo')
  )
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_stakeholder_admin_requests_user ON public.stakeholder_admin_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_admin_requests_status ON public.stakeholder_admin_requests(status);

-- RLS for stakeholder_admin_requests
ALTER TABLE public.stakeholder_admin_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own requests
CREATE POLICY stakeholder_admin_requests_own ON public.stakeholder_admin_requests
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own requests
CREATE POLICY stakeholder_admin_requests_insert ON public.stakeholder_admin_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Super admins can see and manage all requests
CREATE POLICY stakeholder_admin_requests_admin ON public.stakeholder_admin_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to approve stakeholder admin request
CREATE OR REPLACE FUNCTION approve_stakeholder_admin_request(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_approval_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
BEGIN
  -- Verify reviewer is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_reviewer_id
    AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only super admins can approve requests');
  END IF;
  
  -- Get request details
  SELECT user_id, user_role
  INTO v_user_id, v_user_role
  FROM public.stakeholder_admin_requests
  WHERE id = p_request_id
  AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Update request status
  UPDATE public.stakeholder_admin_requests
  SET 
    status = 'approved',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    approval_notes = p_approval_notes
  WHERE id = p_request_id;
  
  -- Note: We don't change the user's role - they keep their role (retailer, repair_shop, etc.)
  -- Admin access is granted through the approval, not role change
  
  RETURN json_build_object(
    'success', true,
    'message', 'Stakeholder admin access approved',
    'user_id', v_user_id,
    'role', v_current_role
  );
END;
$$;

-- Function to reject stakeholder admin request
CREATE OR REPLACE FUNCTION reject_stakeholder_admin_request(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_rejection_notes TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify reviewer is super admin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_reviewer_id
    AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only super admins can reject requests');
  END IF;
  
  -- Update request status
  UPDATE public.stakeholder_admin_requests
  SET 
    status = 'rejected',
    reviewed_by = p_reviewer_id,
    reviewed_at = NOW(),
    approval_notes = p_rejection_notes
  WHERE id = p_request_id
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Stakeholder admin request rejected');
END;
$$;

-- Function to check if user has stakeholder admin access
CREATE OR REPLACE FUNCTION has_stakeholder_admin_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.stakeholder_admin_requests
    WHERE user_id = p_user_id
    AND status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_user_id
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- Grant permissions
GRANT SELECT ON public.retailer_admin_stats TO authenticated;
GRANT SELECT ON public.repair_shop_admin_stats TO authenticated;
GRANT SELECT ON public.insurance_admin_stats TO authenticated;
GRANT SELECT ON public.law_enforcement_admin_stats TO authenticated;
GRANT SELECT ON public.ngo_admin_stats TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Role-specific admin views created successfully';
  RAISE NOTICE '📊 Views: retailer_admin_stats, repair_shop_admin_stats, insurance_admin_stats, law_enforcement_admin_stats, ngo_admin_stats';
  RAISE NOTICE '✅ Stakeholder admin request system created';
  RAISE NOTICE '🔐 Functions: approve_stakeholder_admin_request, reject_stakeholder_admin_request, has_stakeholder_admin_access';
END $$;

