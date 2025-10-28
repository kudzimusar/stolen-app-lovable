-- Escalation Rules Migration
-- Creates high-value auto-escalation triggers and escalation rules

-- Function to check and auto-escalate high-value items
CREATE OR REPLACE FUNCTION check_high_value_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-escalate insurance claims > $5,000
  IF NEW.workflow_type = 'insurance_claim' AND NEW.value_amount > 5000 THEN
    NEW.assigned_to := (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);
    NEW.priority := 'urgent';
    NEW.escalation_reason := 'High-value claim (>$5,000) - requires Super Admin approval';
  END IF;
  
  -- Auto-escalate marketplace listings > $10,000
  IF NEW.workflow_type = 'marketplace_listing' AND NEW.value_amount > 10000 THEN
    NEW.assigned_to := (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);
    NEW.priority := 'high';
    NEW.escalation_reason := 'High-value listing (>$10,000) - requires Super Admin approval';
  END IF;
  
  -- Auto-escalate repair orders > $3,000
  IF NEW.workflow_type = 'repair_order' AND NEW.value_amount > 3000 THEN
    NEW.assigned_to := (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);
    NEW.priority := 'high';
    NEW.escalation_reason := 'High-value repair (>$3,000) - requires Super Admin approval';
  END IF;
  
  -- Auto-escalate user registrations for business accounts
  IF NEW.workflow_type = 'user_registration' AND NEW.priority = 'high' THEN
    NEW.assigned_to := (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);
    NEW.escalation_reason := 'Business account registration - requires Super Admin approval';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for high-value auto-escalation
DROP TRIGGER IF EXISTS auto_escalate_high_value ON approval_workflows;
CREATE TRIGGER auto_escalate_high_value
BEFORE INSERT ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION check_high_value_escalation();

-- Function to check for overdue items and escalate
CREATE OR REPLACE FUNCTION check_overdue_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if item is overdue (past SLA deadline)
  IF NEW.current_status = 'pending' AND NEW.sla_deadline IS NOT NULL AND NEW.sla_deadline < NOW() THEN
    NEW.current_status := 'escalated';
    NEW.escalation_reason := 'SLA deadline exceeded - auto-escalated to Super Admin';
    NEW.assigned_to := (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);
    NEW.priority := 'urgent';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for overdue escalation
DROP TRIGGER IF EXISTS auto_escalate_overdue ON approval_workflows;
CREATE TRIGGER auto_escalate_overdue
BEFORE UPDATE ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION check_overdue_escalation();

-- Function to set SLA deadlines based on priority
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Set SLA deadline based on priority
  IF NEW.priority = 'urgent' THEN
    NEW.sla_deadline := NOW() + INTERVAL '4 hours';
  ELSIF NEW.priority = 'high' THEN
    NEW.sla_deadline := NOW() + INTERVAL '12 hours';
  ELSIF NEW.priority = 'normal' THEN
    NEW.sla_deadline := NOW() + INTERVAL '48 hours';
  ELSIF NEW.priority = 'low' THEN
    NEW.sla_deadline := NOW() + INTERVAL '72 hours';
  ELSE
    NEW.sla_deadline := NOW() + INTERVAL '48 hours'; -- Default
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set SLA deadlines
DROP TRIGGER IF EXISTS set_sla_deadline_trigger ON approval_workflows;
CREATE TRIGGER set_sla_deadline_trigger
BEFORE INSERT ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION set_sla_deadline();

-- Function to escalate tasks that are overdue
CREATE OR REPLACE FUNCTION escalate_overdue_tasks()
RETURNS void AS $$
BEGIN
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
    
  -- Log escalation in audit log
  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_table,
    reason,
    created_at
  )
  SELECT 
    (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1),
    'system',
    'escalate',
    'task',
    id,
    'admin_tasks',
    'Auto-escalated due to overdue status',
    NOW()
  FROM admin_tasks
  WHERE status = 'escalated'
    AND escalation_count = 1; -- Only log first escalation
END;
$$ LANGUAGE plpgsql;

-- Function to escalate overdue workflows
CREATE OR REPLACE FUNCTION escalate_overdue_workflows()
RETURNS void AS $$
BEGIN
  -- Escalate workflows past SLA deadline
  UPDATE approval_workflows
  SET 
    current_status = 'escalated',
    escalation_reason = 'SLA deadline exceeded - auto-escalated to Super Admin',
    assigned_to = (
      SELECT id FROM users WHERE role = 'super_admin' LIMIT 1
    ),
    updated_at = NOW()
  WHERE current_status = 'pending'
    AND sla_deadline < NOW()
    AND sla_deadline IS NOT NULL;
    
  -- Log escalation in audit log
  INSERT INTO admin_audit_log (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    target_table,
    reason,
    created_at
  )
  SELECT 
    (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1),
    'system',
    'escalate',
    'workflow',
    id,
    'approval_workflows',
    'Auto-escalated due to SLA deadline exceeded',
    NOW()
  FROM approval_workflows
  WHERE current_status = 'escalated'
    AND escalation_reason LIKE '%SLA deadline exceeded%';
END;
$$ LANGUAGE plpgsql;

-- Create a combined escalation function
CREATE OR REPLACE FUNCTION run_auto_escalation()
RETURNS void AS $$
BEGIN
  -- Escalate overdue workflows
  PERFORM escalate_overdue_workflows();
  
  -- Escalate overdue tasks
  PERFORM escalate_overdue_tasks();
END;
$$ LANGUAGE plpgsql;

-- Insert default escalation rules
INSERT INTO admin_permissions (user_id, role, resource_type, permissions)
SELECT 
  u.id,
  'super_admin',
  'escalation',
  ARRAY['super']::admin_permission_level[]
FROM users u 
WHERE u.role = 'super_admin'
ON CONFLICT DO NOTHING;

-- Grant escalation permissions to department admins for their scope
INSERT INTO admin_permissions (user_id, role, resource_type, permissions)
SELECT 
  u.id,
  u.role,
  'escalation',
  ARRAY['escalate']::admin_permission_level[]
FROM users u 
WHERE u.role IN ('retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo')
ON CONFLICT DO NOTHING;