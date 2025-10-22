DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'user_role'::regtype) THEN ALTER TYPE user_role ADD VALUE 'admin'; END IF; IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = 'user_role'::regtype) THEN ALTER TYPE user_role ADD VALUE 'super_admin'; END IF; END $$;

