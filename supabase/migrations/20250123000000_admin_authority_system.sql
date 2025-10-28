-- Admin Authority System Migration
-- Creates comprehensive admin permission system, approval workflows, task management, and audit logging

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin permission levels
DO $$ BEGIN
    CREATE TYPE admin_permission_level AS ENUM (
      'view', 'edit', 'approve', 'reject', 'suspend', 'delete', 'escalate', 'super'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Approval workflow status
DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM (
      'pending', 'approved', 'rejected', 'escalated', 'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Task status
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
      'assigned', 'in_progress', 'completed', 'cancelled', 'delegated', 'escalated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Admin permissions table
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'super_admin', 'retailer', 'repair_shop', etc.
  resource_type TEXT NOT NULL, -- 'users', 'listings', 'claims', 'reports', etc.
  permissions admin_permission_level[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast permission lookups
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user ON admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_role ON admin_permissions(role);

-- Approval workflows table
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL, -- 'user_registration', 'listing', 'claim', 'report', etc.
  entity_id UUID NOT NULL, -- ID of the item being approved
  entity_table TEXT NOT NULL, -- Table name of the entity
  submitted_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id), -- Department admin
  current_status approval_status DEFAULT 'pending',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  value_amount DECIMAL(12,2), -- For high-value escalation rules
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  review_date TIMESTAMPTZ,
  approval_date TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  admin_notes TEXT,
  escalation_reason TEXT,
  sla_deadline TIMESTAMPTZ, -- Auto-escalate if not reviewed by this time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(current_status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_assigned ON approval_workflows(assigned_to);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_type ON approval_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_sla ON approval_workflows(sla_deadline) WHERE current_status = 'pending';

-- Admin tasks table
CREATE TABLE IF NOT EXISTS admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- 'review', 'investigation', 'verification', 'follow_up', etc.
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  delegated_to UUID REFERENCES users(id),
  status task_status DEFAULT 'assigned',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  related_entity_id UUID, -- Link to approval_workflow or other entity
  related_entity_table TEXT,
  due_date TIMESTAMPTZ,
  sla_hours INTEGER DEFAULT 48, -- Auto-escalate after this many hours
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  escalation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_tasks_assigned ON admin_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_status ON admin_tasks(status);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_due ON admin_tasks(due_date) WHERE status IN ('assigned', 'in_progress');

-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id), -- Who performed the action
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'suspend', 'create', 'update', 'delete', 'escalate', etc.
  target_type TEXT NOT NULL, -- 'user', 'listing', 'claim', 'task', etc.
  target_id UUID,
  target_table TEXT,
  old_values JSONB, -- Previous state
  new_values JSONB, -- New state
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- Add approval fields to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add approval fields to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending';
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;

-- Add approval fields to insurance_claims
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'pending';
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;

-- Add approval fields to repair_orders
ALTER TABLE repair_orders ADD COLUMN IF NOT EXISTS verification_status approval_status DEFAULT 'pending';
ALTER TABLE repair_orders ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE repair_orders ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;

-- Add approval fields to lost_found_reports  
ALTER TABLE lost_found_reports ADD COLUMN IF NOT EXISTS moderation_status approval_status DEFAULT 'approved'; -- Auto-approve unless flagged
ALTER TABLE lost_found_reports ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id);
ALTER TABLE lost_found_reports ADD COLUMN IF NOT EXISTS moderation_date TIMESTAMPTZ;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION check_admin_permission(
  p_user_id UUID,
  p_resource_type TEXT,
  p_required_permission admin_permission_level
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role TEXT;
  v_permissions admin_permission_level[];
BEGIN
  -- Get user role
  SELECT role INTO v_user_role FROM users WHERE id = p_user_id;
  
  -- Super admin has all permissions
  IF v_user_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permissions
  SELECT permissions INTO v_permissions
  FROM admin_permissions
  WHERE user_id = p_user_id
    AND role = v_user_role
    AND resource_type = p_resource_type;
  
  -- Check if required permission exists in array
  RETURN p_required_permission = ANY(v_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-escalate overdue items
CREATE OR REPLACE FUNCTION auto_escalate_overdue_workflows()
RETURNS void AS $$
BEGIN
  -- Escalate workflows past SLA deadline
  UPDATE approval_workflows
  SET 
    current_status = 'escalated',
    escalation_reason = 'SLA deadline exceeded (48 hours)',
    assigned_to = (
      SELECT id FROM users WHERE role = 'super_admin' LIMIT 1
    ),
    updated_at = NOW()
  WHERE current_status = 'pending'
    AND sla_deadline < NOW()
    AND sla_deadline IS NOT NULL;
    
  -- Escalate tasks past due date
  UPDATE admin_tasks
  SET 
    status = 'escalated',
    escalation_count = escalation_count + 1,
    assigned_to = (
      SELECT id FROM users WHERE role = 'super_admin' LIMIT 1
    ),
    updated_at = NOW()
  WHERE status IN ('assigned', 'in_progress')
    AND due_date < NOW()
    AND due_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert audit log entry
  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_table,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    (SELECT role FROM users WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_TABLE_NAME::TEXT,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS audit_marketplace_listings ON marketplace_listings;
CREATE TRIGGER audit_marketplace_listings AFTER INSERT OR UPDATE OR DELETE ON marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

DROP TRIGGER IF EXISTS audit_insurance_claims ON insurance_claims;
CREATE TRIGGER audit_insurance_claims AFTER INSERT OR UPDATE OR DELETE ON insurance_claims
  FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- Insert default admin permissions for super_admin
INSERT INTO admin_permissions (user_id, role, resource_type, permissions)
SELECT 
  u.id,
  u.role,
  'all',
  ARRAY['super']::admin_permission_level[]
FROM users u 
WHERE u.role = 'super_admin'
ON CONFLICT DO NOTHING;

-- Insert default permissions for department admins
INSERT INTO admin_permissions (user_id, role, resource_type, permissions)
SELECT 
  u.id,
  u.role,
  CASE u.role
    WHEN 'retailer' THEN 'listings'
    WHEN 'repair_shop' THEN 'repairs'
    WHEN 'insurance' THEN 'claims'
    WHEN 'law_enforcement' THEN 'reports'
    WHEN 'ngo' THEN 'donations'
    ELSE 'users'
  END,
  ARRAY['view', 'edit', 'approve', 'reject']::admin_permission_level[]
FROM users u 
WHERE u.role IN ('retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo')
ON CONFLICT DO NOTHING;
