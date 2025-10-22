-- Fix user_role enum to include super_admin and admin
-- The enum is missing these admin roles

-- Add missing enum values if they don't exist
DO $$
BEGIN
  -- Add 'admin' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'admin' 
    AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
    RAISE NOTICE '✅ Added "admin" to user_role enum';
  ELSE
    RAISE NOTICE 'ℹ️  "admin" already exists in user_role enum';
  END IF;
  
  -- Add 'super_admin' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'super_admin' 
    AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'super_admin';
    RAISE NOTICE '✅ Added "super_admin" to user_role enum';
  ELSE
    RAISE NOTICE 'ℹ️  "super_admin" already exists in user_role enum';
  END IF;
END $$;

-- Verify the enum now has all values
DO $$
DECLARE
  enum_values TEXT;
BEGIN
  SELECT string_agg(enumlabel, ', ' ORDER BY enumlabel) 
  INTO enum_values
  FROM pg_enum 
  WHERE enumtypid = 'user_role'::regtype;
  
  RAISE NOTICE '✅ Current user_role enum values: %', enum_values;
END $$;

