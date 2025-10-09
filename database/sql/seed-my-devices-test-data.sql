-- Seed My Devices Test Data
-- This script converts the mock data from MyDevices.tsx into real database records
-- Run this script when logged in to populate test devices for the current user

-- Step 1: Get the current authenticated user (you must be logged in)
-- Replace YOUR_USER_ID_HERE with your actual user ID from auth.users
-- To get your user ID, run: SELECT auth.uid();

-- For this script to work automatically, we'll use a variable approach
DO $$
DECLARE
  current_user_id UUID;
  device_id_1 UUID;
  device_id_2 UUID;
  device_id_3 UUID;
BEGIN
  -- Get the current authenticated user (works for ANY user)
  -- This is the correct approach for production apps
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found. Please create a user account first.';
  END IF;

  RAISE NOTICE 'Seeding devices for user: %', current_user_id;

  -- Device 1: iPhone 14 Pro
  INSERT INTO public.devices (
    id,
    serial_number,
    imei,
    device_name,
    brand,
    model,
    color,
    purchase_date,
    purchase_price,
    current_owner_id,
    status,
    registration_date,
    device_photos,
    blockchain_hash,
    insurance_policy_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'F2LLD123ABC',
    '356789012345678',
    'iPhone 14 Pro',
    'Apple',
    'iPhone 14 Pro',
    'Space Black',
    '2024-01-15',
    18999.00,
    current_user_id,
    'active',
    '2024-01-15 10:30:00',
    ARRAY['https://images.unsplash.com/photo-1678652449299-160fe4ca8204?w=400', 
          'https://images.unsplash.com/photo-1678652449491-11e5e3d2e6e0?w=400',
          'https://images.unsplash.com/photo-1678652449669-d9b7c70c5e0c?w=400'],
    '0x' || encode(gen_random_bytes(32), 'hex'),
    'INS-2024-001',
    NOW(),
    NOW()
  ) RETURNING id INTO device_id_1;

  -- Create ownership history for iPhone
  INSERT INTO public.ownership_history (
    device_id,
    previous_owner_id,
    new_owner_id,
    transfer_date,
    transfer_type,
    blockchain_hash,
    verified
  ) VALUES (
    device_id_1,
    NULL,
    current_user_id,
    '2024-01-15 10:30:00',
    'initial_registration',
    '0x' || encode(gen_random_bytes(32), 'hex'),
    TRUE
  );

  RAISE NOTICE 'Created device: iPhone 14 Pro (ID: %)', device_id_1;

  -- Device 2: MacBook Air M2
  INSERT INTO public.devices (
    id,
    serial_number,
    device_name,
    brand,
    model,
    color,
    purchase_date,
    purchase_price,
    current_owner_id,
    status,
    registration_date,
    device_photos,
    blockchain_hash,
    insurance_policy_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'C02YL456DEF',
    'MacBook Air M2',
    'Apple',
    'MacBook Air',
    'Midnight',
    '2023-11-20',
    22999.00,
    current_user_id,
    'active',
    '2023-11-20 14:15:00',
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
    '0x' || encode(gen_random_bytes(32), 'hex'),
    NULL,
    NOW(),
    NOW()
  ) RETURNING id INTO device_id_2;

  -- Create ownership history for MacBook
  INSERT INTO public.ownership_history (
    device_id,
    previous_owner_id,
    new_owner_id,
    transfer_date,
    transfer_type,
    blockchain_hash,
    verified
  ) VALUES (
    device_id_2,
    NULL,
    current_user_id,
    '2023-11-20 14:15:00',
    'initial_registration',
    '0x' || encode(gen_random_bytes(32), 'hex'),
    TRUE
  );

  RAISE NOTICE 'Created device: MacBook Air M2 (ID: %)', device_id_2;

  -- Device 3: AirPods Pro 2 (Reported Lost)
  INSERT INTO public.devices (
    id,
    serial_number,
    device_name,
    brand,
    model,
    color,
    purchase_date,
    purchase_price,
    current_owner_id,
    status,
    registration_date,
    last_seen_location,
    device_photos,
    blockchain_hash,
    insurance_policy_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'GLDM789GHI',
    'AirPods Pro 2',
    'Apple',
    'AirPods Pro',
    'White',
    '2024-02-10',
    4999.00,
    current_user_id,
    'lost',
    '2024-02-10 09:00:00',
    POINT(-26.2041, 28.0473), -- Johannesburg coordinates
    ARRAY['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'],
    '0x' || encode(gen_random_bytes(32), 'hex'),
    'INS-2024-003',
    NOW(),
    NOW()
  ) RETURNING id INTO device_id_3;

  -- Create ownership history for AirPods
  INSERT INTO public.ownership_history (
    device_id,
    previous_owner_id,
    new_owner_id,
    transfer_date,
    transfer_type,
    blockchain_hash,
    verified
  ) VALUES (
    device_id_3,
    NULL,
    current_user_id,
    '2024-02-10 09:00:00',
    'initial_registration',
    '0x' || encode(gen_random_bytes(32), 'hex'),
    TRUE
  );

  -- Create a stolen/lost report for the AirPods
  INSERT INTO public.stolen_reports (
    device_id,
    reporter_id,
    report_type,
    incident_date,
    incident_location,
    description,
    reward_amount,
    status,
    created_at,
    updated_at
  ) VALUES (
    device_id_3,
    current_user_id,
    'lost',
    '2024-03-15',
    POINT(-26.2041, 28.0473),
    'Lost AirPods Pro 2 at Sandton City Mall. White case with custom engraving.',
    500.00,
    'active',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created device: AirPods Pro 2 (ID: %) - Marked as LOST', device_id_3;

  -- Summary
  RAISE NOTICE '================================';
  RAISE NOTICE 'Successfully seeded 3 test devices for user: %', current_user_id;
  RAISE NOTICE '1. iPhone 14 Pro (Active, Insured)';
  RAISE NOTICE '2. MacBook Air M2 (Active, Insurance Expired)';
  RAISE NOTICE '3. AirPods Pro 2 (Lost/Reported)';
  RAISE NOTICE '================================';

END $$;

-- Verify the inserted data
SELECT 
  d.device_name,
  d.serial_number,
  d.status,
  d.purchase_price,
  d.blockchain_hash,
  COUNT(oh.id) as transfer_count,
  array_length(d.device_photos, 1) as photo_count
FROM public.devices d
LEFT JOIN public.ownership_history oh ON d.id = oh.device_id
WHERE d.serial_number IN ('F2LLD123ABC', 'C02YL456DEF', 'GLDM789GHI')
GROUP BY d.id, d.device_name, d.serial_number, d.status, d.purchase_price, d.blockchain_hash;

-- Show the current authenticated user's devices
SELECT 
  u.email,
  u.raw_user_meta_data->>'full_name' as display_name,
  COUNT(d.id) as device_count,
  SUM(d.purchase_price) as total_value
FROM auth.users u
LEFT JOIN public.devices d ON d.current_owner_id = u.id
WHERE u.id = auth.uid() AND d.serial_number IN ('F2LLD123ABC', 'C02YL456DEF', 'GLDM789GHI')
GROUP BY u.id, u.email, u.raw_user_meta_data->>'full_name';

