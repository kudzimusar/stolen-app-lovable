-- Debug Admin Approval Issue
-- Check if admin_users table exists and has data

-- 1. Check if admin_users table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'admin_users'
) as table_exists;

-- 2. Check admin_users data
SELECT * FROM admin_users LIMIT 5;

-- 3. Check if current user exists in admin_users
-- Replace 'USER_ID_HERE' with the actual user ID from the error
SELECT * FROM admin_users WHERE user_id = 'USER_ID_HERE';

-- 4. Check lost_found_reports table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lost_found_reports' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if the specific report exists
SELECT id, user_id, status, verification_status, created_at 
FROM lost_found_reports 
WHERE id = 'b33ccb6d-4f08-4dec-af26-267fdd73ca74';

-- 6. Add current user as admin if not exists
-- First, get the user ID from auth.users
SELECT id, email FROM auth.users LIMIT 5;

-- Then insert into admin_users (replace with actual user ID)
-- INSERT INTO admin_users (user_id, role, permissions) 
-- VALUES ('USER_ID_HERE', 'admin', '["admin:full"]')
-- ON CONFLICT (user_id) DO NOTHING;
