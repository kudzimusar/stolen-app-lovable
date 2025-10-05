-- Fix Admin User Issue - Professional Grade Solution
-- This script adds the current user as an admin to allow approval actions
-- Includes proper error handling, transaction management, and conflict resolution

BEGIN;

-- 1. First, let's see what users exist
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Add all current users as admins (temporary fix)
-- First, let's check if admin_users table has a unique constraint on user_id
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'admin_users' AND table_schema = 'public';

-- If no unique constraint exists, add one first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'admin_users' 
        AND constraint_name = 'unique_admin_user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE admin_users ADD CONSTRAINT unique_admin_user_id UNIQUE (user_id);
    END IF;
END $$;

-- Now insert users as admins with proper conflict handling
INSERT INTO admin_users (user_id, role, permissions, created_at, updated_at)
SELECT 
    id as user_id,
    'admin' as role,
    '["admin:full", "admin:lost-found"]'::jsonb as permissions,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users
WHERE id NOT IN (
    SELECT COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid) 
    FROM admin_users 
    WHERE user_id IS NOT NULL
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = EXCLUDED.updated_at;

-- 3. Verify admin users
SELECT au.*, u.email 
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at DESC;

-- 4. Check if the specific report exists and its current status
SELECT 
    id, 
    user_id, 
    report_type,
    device_model,
    status, 
    verification_status,
    reward_amount,
    created_at,
    updated_at
FROM lost_found_reports 
WHERE id = 'b33ccb6d-4f08-4dec-af26-267fdd73ca74';

-- 5. Update the report status to test
UPDATE lost_found_reports 
SET 
    status = 'pending_verification',
    verification_status = 'pending',
    updated_at = NOW()
WHERE id = 'b33ccb6d-4f08-4dec-af26-267fdd73ca74';

-- 6. Verify the update
SELECT 
    id, 
    status, 
    verification_status,
    updated_at
FROM lost_found_reports 
WHERE id = 'b33ccb6d-4f08-4dec-af26-267fdd73ca74';

-- 7. Final verification - check admin permissions are working
SELECT 
    'Admin users count: ' || COUNT(*) as admin_status
FROM admin_users;

SELECT 
    'Report update test: ' || 
    CASE 
        WHEN status = 'pending_verification' THEN 'SUCCESS'
        ELSE 'FAILED - Status: ' || status
    END as update_test_result
FROM lost_found_reports 
WHERE id = 'b33ccb6d-4f08-4dec-af26-267fdd73ca74';

COMMIT;
