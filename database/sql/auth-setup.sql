-- Authentication Setup for Department Admin Portals
-- Updates kudzimusar@gmail.com to super_admin and creates test department accounts

-- =====================================================
-- 1. UPDATE SUPER ADMIN ACCOUNT
-- =====================================================

-- Update kudzimusar@gmail.com to super_admin role
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'kudzimusar@gmail.com';

-- Verify the update
SELECT id, email, role, display_name, created_at 
FROM public.users 
WHERE email = 'kudzimusar@gmail.com';

-- =====================================================
-- 2. CREATE TEST DEPARTMENT ADMIN ACCOUNTS
-- =====================================================

-- Note: These accounts will be created in auth.users through Supabase Auth
-- We'll create the corresponding public.users entries here

-- Retailer Department Admin
INSERT INTO public.users (id, email, role, display_name, created_at)
VALUES (
  uuid_generate_v4(),
  'retailer.admin@stolenapp.com',
  'retailer',
  'Retailer Dept Admin',
  NOW()
);

-- Repair Shop Department Admin  
INSERT INTO public.users (id, email, role, display_name, created_at)
VALUES (
  uuid_generate_v4(),
  'repair.admin@stolenapp.com',
  'repair_shop',
  'Repair Dept Admin',
  NOW()
);

-- Insurance Department Admin
INSERT INTO public.users (id, email, role, display_name, created_at)
VALUES (
  uuid_generate_v4(),
  'insurance.admin@stolenapp.com',
  'insurance',
  'Insurance Dept Admin',
  NOW()
);

-- Law Enforcement Liaison Admin
INSERT INTO public.users (id, email, role, display_name, created_at)
VALUES (
  uuid_generate_v4(),
  'law.admin@stolenapp.com',
  'law_enforcement',
  'Law Enforcement Dept Admin',
  NOW()
);

-- NGO Partnership Admin
INSERT INTO public.users (id, email, role, display_name, created_at)
VALUES (
  uuid_generate_v4(),
  'ngo.admin@stolenapp.com',
  'ngo',
  'NGO Dept Admin',
  NOW()
);

-- =====================================================
-- 3. VERIFY ALL ACCOUNTS
-- =====================================================

-- Show all admin accounts
SELECT 
  id,
  email,
  role,
  display_name,
  created_at,
  CASE 
    WHEN role = 'super_admin' THEN '🔑 Super Admin'
    WHEN role = 'retailer' THEN '🏪 Retailer Dept'
    WHEN role = 'repair_shop' THEN '🔧 Repair Dept'
    WHEN role = 'insurance' THEN '🛡️ Insurance Dept'
    WHEN role = 'law_enforcement' THEN '👮 Law Enforcement Dept'
    WHEN role = 'ngo' THEN '❤️ NGO Dept'
    ELSE '❓ Unknown'
  END as department
FROM public.users 
WHERE role IN ('super_admin', 'retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo')
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'retailer' THEN 2
    WHEN 'repair_shop' THEN 3
    WHEN 'insurance' THEN 4
    WHEN 'law_enforcement' THEN 5
    WHEN 'ngo' THEN 6
  END;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Authentication setup completed successfully';
  RAISE NOTICE '🔑 Super Admin: kudzimusar@gmail.com';
  RAISE NOTICE '🏪 Retailer Dept: retailer.admin@stolenapp.com';
  RAISE NOTICE '🔧 Repair Dept: repair.admin@stolenapp.com';
  RAISE NOTICE '🛡️ Insurance Dept: insurance.admin@stolenapp.com';
  RAISE NOTICE '👮 Law Enforcement Dept: law.admin@stolenapp.com';
  RAISE NOTICE '❤️ NGO Dept: ngo.admin@stolenapp.com';
  RAISE NOTICE '📝 Note: Set passwords through Supabase Auth dashboard';
END $$;
