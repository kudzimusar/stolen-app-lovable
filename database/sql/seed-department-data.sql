-- Seed Data for Department Admin Portals
-- Creates realistic test data for all 5 departments

-- =====================================================
-- 1. MARKETPLACE LISTINGS (Retailer Dept)
-- =====================================================

-- Insert 50+ marketplace listings with various statuses
INSERT INTO public.marketplace_listings (
  id, device_id, seller_id, title, description, price, currency, 
  status, condition_rating, warranty_remaining_months, 
  negotiable, featured, view_count, created_at
)
SELECT 
  uuid_generate_v4(),
  d.id,
  u.id,
  CASE 
    WHEN d.brand = 'Apple' THEN d.brand || ' ' || d.model || ' - ' || d.color || ' - Excellent Condition'
    WHEN d.brand = 'Samsung' THEN d.brand || ' ' || d.model || ' - ' || d.color || ' - Like New'
    ELSE d.brand || ' ' || d.model || ' - ' || d.color || ' - Good Condition'
  END,
  'High-quality ' || d.brand || ' ' || d.model || ' in ' || d.color || '. ' ||
  CASE 
    WHEN d.brand = 'Apple' THEN 'Original packaging and accessories included. Perfect for daily use.'
    WHEN d.brand = 'Samsung' THEN 'Well-maintained device with original charger. Great value for money.'
    ELSE 'Reliable device in good working condition. Tested and verified.'
  END,
  CASE 
    WHEN d.brand = 'Apple' THEN (500 + (random() * 1000))::DECIMAL(10,2)
    WHEN d.brand = 'Samsung' THEN (300 + (random() * 700))::DECIMAL(10,2)
    ELSE (200 + (random() * 500))::DECIMAL(10,2)
  END,
  'USD',
  CASE 
    WHEN random() < 0.7 THEN 'active'
    WHEN random() < 0.9 THEN 'sold'
    ELSE 'removed'
  END,
  (3 + (random() * 2))::INTEGER,
  (0 + (random() * 12))::INTEGER,
  CASE WHEN random() < 0.8 THEN true ELSE false END,
  CASE WHEN random() < 0.1 THEN true ELSE false END,
  (0 + (random() * 100))::INTEGER,
  NOW() - (random() * INTERVAL '90 days')
FROM public.devices d
CROSS JOIN (
  SELECT id FROM public.users 
  WHERE role = 'retailer' 
  LIMIT 1
) u
WHERE d.status = 'active'
LIMIT 50;

-- =====================================================
-- 2. REPAIR ORDERS (Repair Shop Dept)
-- =====================================================

-- Insert 30+ repair orders
INSERT INTO public.repair_orders (
  id, repair_shop_id, customer_id, device_id, repair_type, issue_description,
  diagnosis, labor_cost, parts_cost, status, priority, 
  estimated_completion, technician_name, rating, created_at
)
SELECT 
  uuid_generate_v4(),
  u_shop.id,
  u_customer.id,
  d.id,
  CASE 
    WHEN random() < 0.3 THEN 'screen'
    WHEN random() < 0.5 THEN 'battery'
    WHEN random() < 0.7 THEN 'water_damage'
    WHEN random() < 0.9 THEN 'software'
    ELSE 'other'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'Screen cracked, needs replacement'
    WHEN random() < 0.5 THEN 'Battery not holding charge'
    WHEN random() < 0.7 THEN 'Water damage, device not turning on'
    WHEN random() < 0.9 THEN 'Software issues, frequent crashes'
    ELSE 'General maintenance and cleaning'
  END,
  CASE 
    WHEN random() < 0.5 THEN 'Issue diagnosed, parts ordered'
    ELSE 'Diagnosis complete, ready for repair'
  END,
  (50 + (random() * 150))::DECIMAL(10,2),
  (20 + (random() * 100))::DECIMAL(10,2),
  CASE 
    WHEN random() < 0.3 THEN 'pending'
    WHEN random() < 0.6 THEN 'in_progress'
    WHEN random() < 0.9 THEN 'completed'
    ELSE 'cancelled'
  END,
  CASE 
    WHEN random() < 0.7 THEN 'normal'
    WHEN random() < 0.9 THEN 'high'
    ELSE 'urgent'
  END,
  NOW() + (random() * INTERVAL '7 days'),
  CASE 
    WHEN random() < 0.5 THEN 'John Smith'
    WHEN random() < 0.8 THEN 'Sarah Johnson'
    ELSE 'Mike Wilson'
  END,
  CASE 
    WHEN random() < 0.8 THEN (3 + (random() * 2))::INTEGER
    ELSE NULL
  END,
  NOW() - (random() * INTERVAL '60 days')
FROM public.devices d
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'repair_shop' LIMIT 1
) u_shop
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'individual' LIMIT 10
) u_customer
LIMIT 30;

-- =====================================================
-- 3. INSURANCE POLICIES & CLAIMS (Insurance Dept)
-- =====================================================

-- Insert 20+ insurance policies
INSERT INTO public.insurance_policies (
  id, policy_number, provider_id, policyholder_id, device_id,
  policy_type, coverage_type, coverage_limit, premium_amount, deductible,
  status, start_date, end_date, payment_frequency, created_at
)
SELECT 
  uuid_generate_v4(),
  'POL-' || (1000 + row_number() OVER ())::TEXT,
  u_provider.id,
  u_policyholder.id,
  d.id,
  CASE 
    WHEN random() < 0.4 THEN 'theft'
    WHEN random() < 0.7 THEN 'damage'
    WHEN random() < 0.9 THEN 'comprehensive'
    ELSE 'warranty_extension'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'basic'
    WHEN random() < 0.7 THEN 'premium'
    ELSE 'platinum'
  END,
  (500 + (random() * 2000))::DECIMAL(12,2),
  (20 + (random() * 80))::DECIMAL(10,2),
  (50 + (random() * 200))::DECIMAL(10,2),
  CASE 
    WHEN random() < 0.8 THEN 'active'
    WHEN random() < 0.95 THEN 'pending'
    ELSE 'expired'
  END,
  NOW() - (random() * INTERVAL '365 days'),
  NOW() + (random() * INTERVAL '365 days'),
  CASE 
    WHEN random() < 0.4 THEN 'monthly'
    WHEN random() < 0.7 THEN 'quarterly'
    ELSE 'annually'
  END,
  NOW() - (random() * INTERVAL '30 days')
FROM public.devices d
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'insurance' LIMIT 1
) u_provider
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'individual' LIMIT 15
) u_policyholder
LIMIT 20;

-- Insert 15+ insurance claims
INSERT INTO public.insurance_claims (
  id, claim_number, policy_id, insurance_provider_id, claimant_id, device_id,
  incident_type, incident_date, incident_location, claim_amount, approved_amount,
  status, submission_date, review_date, created_at
)
SELECT 
  uuid_generate_v4(),
  'CLM-' || (1000 + row_number() OVER ())::TEXT,
  ip.id,
  ip.provider_id,
  ip.policyholder_id,
  ip.device_id,
  CASE 
    WHEN random() < 0.3 THEN 'theft'
    WHEN random() < 0.5 THEN 'loss'
    WHEN random() < 0.7 THEN 'accidental_damage'
    WHEN random() < 0.9 THEN 'water_damage'
    ELSE 'screen_damage'
  END,
  NOW() - (random() * INTERVAL '30 days'),
  CASE 
    WHEN random() < 0.3 THEN 'Downtown Office'
    WHEN random() < 0.6 THEN 'Shopping Mall'
    ELSE 'Public Transport'
  END,
  (200 + (random() * 800))::DECIMAL(12,2),
  CASE 
    WHEN random() < 0.7 THEN (200 + (random() * 800))::DECIMAL(12,2)
    ELSE NULL
  END,
  CASE 
    WHEN random() < 0.3 THEN 'pending'
    WHEN random() < 0.6 THEN 'under_review'
    WHEN random() < 0.8 THEN 'approved'
    WHEN random() < 0.9 THEN 'rejected'
    ELSE 'paid'
  END,
  NOW() - (random() * INTERVAL '15 days'),
  CASE 
    WHEN random() < 0.6 THEN NOW() - (random() * INTERVAL '5 days')
    ELSE NULL
  END,
  NOW() - (random() * INTERVAL '10 days')
FROM public.insurance_policies ip
LIMIT 15;

-- =====================================================
-- 3. STOLEN REPORTS (Law Enforcement Dept)
-- =====================================================

-- Insert 15+ stolen reports
INSERT INTO public.stolen_reports (
  id, device_id, reporter_id, report_type, incident_date, incident_location,
  police_report_number, description, reward_amount, status, created_at
)
SELECT 
  uuid_generate_v4(),
  d.id,
  u.id,
  CASE 
    WHEN random() < 0.7 THEN 'stolen'
    ELSE 'lost'
  END,
  NOW() - (random() * INTERVAL '30 days'),
  POINT(
    -74.006 + (random() * 0.1),  -- NYC area
    40.7128 + (random() * 0.1)
  ),
  'PR-' || (10000 + (random() * 90000))::INTEGER::TEXT,
  CASE 
    WHEN random() < 0.3 THEN 'Device stolen from car while parked'
    WHEN random() < 0.6 THEN 'Lost device during commute'
    WHEN random() < 0.8 THEN 'Theft from public place'
    ELSE 'Device missing from home'
  END,
  CASE 
    WHEN random() < 0.5 THEN (100 + (random() * 400))::DECIMAL(10,2)
    ELSE NULL
  END,
  CASE 
    WHEN random() < 0.4 THEN 'active'
    WHEN random() < 0.7 THEN 'resolved'
    ELSE 'closed'
  END,
  NOW() - (random() * INTERVAL '20 days')
FROM public.devices d
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'individual' LIMIT 10
) u
WHERE d.status IN ('stolen', 'lost')
LIMIT 15;

-- =====================================================
-- 4. DEVICE DONATIONS (NGO Dept)
-- =====================================================

-- Insert 10+ device donations
INSERT INTO public.device_donations (
  id, ngo_id, donor_id, recipient_id, device_id, donation_type,
  donation_value, status, donation_date, created_at
)
SELECT 
  uuid_generate_v4(),
  u_ngo.id,
  u_donor.id,
  u_recipient.id,
  d.id,
  CASE 
    WHEN random() < 0.4 THEN 'direct_donation'
    WHEN random() < 0.7 THEN 'refurbished'
    ELSE 'educational'
  END,
  (100 + (random() * 500))::DECIMAL(10,2),
  CASE 
    WHEN random() < 0.6 THEN 'completed'
    WHEN random() < 0.8 THEN 'pending'
    ELSE 'in_transit'
  END,
  NOW() - (random() * INTERVAL '15 days'),
  NOW() - (random() * INTERVAL '20 days')
FROM public.devices d
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'ngo' LIMIT 1
) u_ngo
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'individual' LIMIT 5
) u_donor
CROSS JOIN (
  SELECT id FROM public.users WHERE role = 'individual' LIMIT 8
) u_recipient
WHERE d.status = 'active'
LIMIT 10;

-- =====================================================
-- 5. UPDATE DEVICE STATUSES FOR REALISM
-- =====================================================

-- Update some devices to stolen/lost status for reports
UPDATE public.devices 
SET status = 'stolen'
WHERE id IN (
  SELECT id FROM public.devices 
  WHERE status = 'active' 
  ORDER BY random() 
  LIMIT 5
);

UPDATE public.devices 
SET status = 'lost'
WHERE id IN (
  SELECT id FROM public.devices 
  WHERE status = 'active' 
  ORDER BY random() 
  LIMIT 3
);

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Show data counts by department
SELECT 
  'Marketplace Listings' as data_type,
  COUNT(*) as count,
  'Retailer Dept' as department
FROM public.marketplace_listings
UNION ALL
SELECT 
  'Repair Orders' as data_type,
  COUNT(*) as count,
  'Repair Shop Dept' as department
FROM public.repair_orders
UNION ALL
SELECT 
  'Insurance Policies' as data_type,
  COUNT(*) as count,
  'Insurance Dept' as department
FROM public.insurance_policies
UNION ALL
SELECT 
  'Insurance Claims' as data_type,
  COUNT(*) as count,
  'Insurance Dept' as department
FROM public.insurance_claims
UNION ALL
SELECT 
  'Stolen Reports' as data_type,
  COUNT(*) as count,
  'Law Enforcement Dept' as department
FROM public.stolen_reports
UNION ALL
SELECT 
  'Device Donations' as data_type,
  COUNT(*) as count,
  'NGO Dept' as department
FROM public.device_donations;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data created successfully';
  RAISE NOTICE '🏪 Retailer Dept: 50+ marketplace listings';
  RAISE NOTICE '🔧 Repair Shop Dept: 30+ repair orders';
  RAISE NOTICE '🛡️ Insurance Dept: 20+ policies, 15+ claims';
  RAISE NOTICE '👮 Law Enforcement Dept: 15+ stolen reports';
  RAISE NOTICE '❤️ NGO Dept: 10+ device donations';
  RAISE NOTICE '📊 All departments now have realistic test data';
END $$;
