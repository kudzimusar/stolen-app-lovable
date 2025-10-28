-- MANUAL DEPLOYMENT: Fix Notification Preferences
-- Run these commands in your Supabase SQL Editor

-- 1. Create notification preferences table with correct structure
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(30) NOT NULL CHECK (category IN (
    'device', 'marketplace', 'insurance', 'repair', 'payment', 
    'security', 'admin', 'lost_found', 'community', 'transfer'
  )),
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  
  -- Frequency
  frequency VARCHAR(20) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Filters
  filters JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, category)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(category);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_category ON notification_preferences(user_id, category);

-- 3. Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert notification preferences for admin users
INSERT INTO notification_preferences (user_id, category, email_enabled, push_enabled, sms_enabled, in_app_enabled)
SELECT 
  u.id,
  'admin',
  true,
  true,
  false,
  true
FROM users u 
WHERE u.role IN ('super_admin', 'admin', 'retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo')
ON CONFLICT (user_id, category) DO UPDATE SET
  email_enabled = true,
  push_enabled = true,
  sms_enabled = false,
  in_app_enabled = true;

-- 5. Create notification templates
INSERT INTO notification_templates (type, title_template, message_template, is_active)
VALUES 
  ('admin_approval', 'New {{workflow_type}} Pending Review', 'You have a new {{workflow_type}} awaiting your approval. Priority: {{priority}}', true),
  ('approval_update', '{{workflow_type}} Status Updated', 'Your {{workflow_type}} has been {{status}}. {{#if admin_notes}}Notes: {{admin_notes}}{{/if}}', true),
  ('task_assignment', 'New Task: {{title}}', 'You have been assigned a new task: {{title}}. Due: {{due_date}}', true),
  ('escalation', 'Item Escalated', 'A {{workflow_type}} has been escalated and requires your attention. Reason: {{escalation_reason}}', true),
  ('sla_warning', 'SLA Warning: {{workflow_type}}', 'You have {{time_remaining}} hours remaining to review this {{workflow_type}}', true),
  ('admin_summary', 'Daily Admin Summary', 'Pending: {{pending_count}}, Overdue: {{overdue_count}}, Escalated: {{escalated_count}}', true)
ON CONFLICT (type) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  is_active = EXCLUDED.is_active;

-- 6. Create notification functions for admin actions
CREATE OR REPLACE FUNCTION notify_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_type TEXT;
BEGIN
  -- Determine notification content based on trigger
  IF TG_TABLE_NAME = 'approval_workflows' THEN
    IF TG_OP = 'INSERT' THEN
      v_notification_title := 'New Item Pending Review';
      v_notification_message := 'You have a new ' || NEW.workflow_type || ' awaiting your approval';
      v_notification_type := 'admin_approval';
    ELSIF TG_OP = 'UPDATE' AND NEW.current_status != OLD.current_status THEN
      v_notification_title := 'Approval Status Updated';
      v_notification_message := 'Your ' || NEW.workflow_type || ' has been ' || NEW.current_status;
      v_notification_type := 'approval_update';
    END IF;
  ELSIF TG_TABLE_NAME = 'admin_tasks' THEN
    IF TG_OP = 'INSERT' THEN
      v_notification_title := 'New Task Assigned';
      v_notification_message := 'You have been assigned a new task: ' || NEW.title;
      v_notification_type := 'task_assignment';
    ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
      v_notification_title := 'Task Status Updated';
      v_notification_message := 'Task "' || NEW.title || '" status changed to ' || NEW.status;
      v_notification_type := 'task_update';
    END IF;
  END IF;
  
  -- Insert notification for assigned admin
  IF v_notification_title IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      related_type,
      created_at
    ) VALUES (
      NEW.assigned_to,
      v_notification_title,
      v_notification_message,
      v_notification_type,
      NEW.id,
      TG_TABLE_NAME,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create notification triggers
DROP TRIGGER IF EXISTS notify_new_approval ON approval_workflows;
CREATE TRIGGER notify_new_approval
AFTER INSERT ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION notify_admin_action();

DROP TRIGGER IF EXISTS notify_approval_update ON approval_workflows;
CREATE TRIGGER notify_approval_update
AFTER UPDATE ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION notify_admin_action();

DROP TRIGGER IF EXISTS notify_new_task ON admin_tasks;
CREATE TRIGGER notify_new_task
AFTER INSERT ON admin_tasks
FOR EACH ROW EXECUTE FUNCTION notify_admin_action();

DROP TRIGGER IF EXISTS notify_task_update ON admin_tasks;
CREATE TRIGGER notify_task_update
AFTER UPDATE ON admin_tasks
FOR EACH ROW EXECUTE FUNCTION notify_admin_action();

-- 8. Create escalation notification function
CREATE OR REPLACE FUNCTION notify_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify Super Admin about escalated items
  IF NEW.current_status = 'escalated' AND OLD.current_status != 'escalated' THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      related_type,
      created_at
    ) VALUES (
      NEW.assigned_to,
      'Item Escalated for Review',
      'A ' || NEW.workflow_type || ' has been escalated and requires your attention',
      'escalation',
      NEW.id,
      'approval_workflows',
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create escalation notification trigger
DROP TRIGGER IF EXISTS notify_escalation_trigger ON approval_workflows;
CREATE TRIGGER notify_escalation_trigger
AFTER UPDATE ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION notify_escalation();

-- 10. Create daily summary function
CREATE OR REPLACE FUNCTION send_daily_admin_summary()
RETURNS void AS $$
DECLARE
  v_pending_count INTEGER;
  v_overdue_count INTEGER;
  v_escalated_count INTEGER;
  v_super_admin_id UUID;
BEGIN
  -- Get Super Admin ID
  SELECT id INTO v_super_admin_id FROM users WHERE role = 'super_admin' LIMIT 1;
  
  IF v_super_admin_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Count pending items
  SELECT COUNT(*) INTO v_pending_count
  FROM approval_workflows
  WHERE current_status = 'pending';
  
  -- Count overdue items
  SELECT COUNT(*) INTO v_overdue_count
  FROM approval_workflows
  WHERE current_status = 'pending' 
    AND sla_deadline < NOW()
    AND sla_deadline IS NOT NULL;
  
  -- Count escalated items
  SELECT COUNT(*) INTO v_escalated_count
  FROM approval_workflows
  WHERE current_status = 'escalated';
  
  -- Send summary notification
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    created_at
  ) VALUES (
    v_super_admin_id,
    'Daily Admin Summary',
    'Pending: ' || v_pending_count || ', Overdue: ' || v_overdue_count || ', Escalated: ' || v_escalated_count,
    'admin_summary',
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- 11. Create SLA warning function
CREATE OR REPLACE FUNCTION send_sla_warnings()
RETURNS void AS $$
DECLARE
  v_warning_time TIMESTAMPTZ;
  v_workflow_record RECORD;
BEGIN
  -- Set warning time to 2 hours before SLA deadline
  v_warning_time := NOW() + INTERVAL '2 hours';
  
  -- Find workflows approaching SLA deadline
  FOR v_workflow_record IN
    SELECT wf.*, u.email as assignee_email
    FROM approval_workflows wf
    JOIN users u ON u.id = wf.assigned_to
    WHERE wf.current_status = 'pending'
      AND wf.sla_deadline IS NOT NULL
      AND wf.sla_deadline <= v_warning_time
      AND wf.sla_deadline > NOW()
  LOOP
    -- Send warning notification
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      related_id,
      related_type,
      created_at
    ) VALUES (
      v_workflow_record.assigned_to,
      'SLA Warning: ' || v_workflow_record.workflow_type,
      'You have ' || EXTRACT(EPOCH FROM (v_workflow_record.sla_deadline - NOW()))/3600 || ' hours remaining to review this item',
      'sla_warning',
      v_workflow_record.id,
      'approval_workflows',
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 12. Verify the setup
SELECT 'Notification system setup complete!' as status;
