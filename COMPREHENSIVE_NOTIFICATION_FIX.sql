-- COMPREHENSIVE NOTIFICATION SYSTEM FIX
-- This maintains the full complexity while fixing the existing table structure

-- First, let's check the existing table structure and fix it properly
-- Step 1: Check if notification_preferences table exists and what columns it has
DO $$
BEGIN
    -- Check if the table exists and has the right structure
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'category'
    ) THEN
        -- The table exists but doesn't have the category column
        -- Let's add the missing column
        ALTER TABLE notification_preferences 
        ADD COLUMN IF NOT EXISTS category VARCHAR(30) DEFAULT 'admin';
        
        -- Add the check constraint
        ALTER TABLE notification_preferences 
        ADD CONSTRAINT notification_preferences_category_check 
        CHECK (category IN (
            'device', 'marketplace', 'insurance', 'repair', 'payment', 
            'security', 'admin', 'lost_found', 'community', 'transfer'
        ));
        
        -- Add the unique constraint
        ALTER TABLE notification_preferences 
        ADD CONSTRAINT notification_preferences_user_category_unique 
        UNIQUE (user_id, category);
    END IF;
END $$;

-- Step 2: Ensure all required columns exist with correct names
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'email_enabled'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN email_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'push_enabled'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN push_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'sms_enabled'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN sms_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'in_app_enabled'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN in_app_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'frequency'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN frequency VARCHAR(20) DEFAULT 'immediate';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'quiet_hours_start'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN quiet_hours_start TIME;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'quiet_hours_end'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN quiet_hours_end TIME;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'filters'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN filters JSONB DEFAULT '{}';
    END IF;
END $$;

-- Step 3: Create the notification_templates table with full complexity
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create comprehensive notification functions
CREATE OR REPLACE FUNCTION notify_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_type TEXT;
  v_template RECORD;
  v_processed_title TEXT;
  v_processed_message TEXT;
BEGIN
  -- Get the notification template
  SELECT * INTO v_template 
  FROM notification_templates 
  WHERE type = CASE 
    WHEN TG_TABLE_NAME = 'approval_workflows' AND TG_OP = 'INSERT' THEN 'admin_approval'
    WHEN TG_TABLE_NAME = 'approval_workflows' AND TG_OP = 'UPDATE' AND NEW.current_status != OLD.current_status THEN 'approval_update'
    WHEN TG_TABLE_NAME = 'admin_tasks' AND TG_OP = 'INSERT' THEN 'task_assignment'
    WHEN TG_TABLE_NAME = 'admin_tasks' AND TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN 'task_update'
  END;
  
  -- Process template with variables
  IF v_template.id IS NOT NULL THEN
    v_processed_title := v_template.title_template;
    v_processed_message := v_template.message_template;
    
    -- Replace template variables
    IF TG_TABLE_NAME = 'approval_workflows' THEN
      v_processed_title := REPLACE(v_processed_title, '{{workflow_type}}', COALESCE(NEW.workflow_type, 'Unknown'));
      v_processed_title := REPLACE(v_processed_title, '{{priority}}', COALESCE(NEW.priority, 'normal'));
      v_processed_message := REPLACE(v_processed_message, '{{workflow_type}}', COALESCE(NEW.workflow_type, 'Unknown'));
      v_processed_message := REPLACE(v_processed_message, '{{status}}', COALESCE(NEW.current_status, 'Unknown'));
      v_processed_message := REPLACE(v_processed_message, '{{admin_notes}}', COALESCE(NEW.admin_notes, ''));
    ELSIF TG_TABLE_NAME = 'admin_tasks' THEN
      v_processed_title := REPLACE(v_processed_title, '{{title}}', COALESCE(NEW.title, 'Unknown Task'));
      v_processed_message := REPLACE(v_processed_message, '{{title}}', COALESCE(NEW.title, 'Unknown Task'));
      v_processed_message := REPLACE(v_processed_message, '{{due_date}}', COALESCE(NEW.due_date::text, 'Not set'));
    END IF;
    
    -- Insert notification for assigned admin
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
      v_processed_title,
      v_processed_message,
      v_template.type,
      NEW.id,
      TG_TABLE_NAME,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create escalation notification function with full complexity
CREATE OR REPLACE FUNCTION notify_escalation()
RETURNS TRIGGER AS $$
DECLARE
  v_template RECORD;
  v_processed_title TEXT;
  v_processed_message TEXT;
BEGIN
  -- Notify Super Admin about escalated items
  IF NEW.current_status = 'escalated' AND OLD.current_status != 'escalated' THEN
    -- Get escalation template
    SELECT * INTO v_template 
    FROM notification_templates 
    WHERE type = 'escalation';
    
    IF v_template.id IS NOT NULL THEN
      v_processed_title := v_template.title_template;
      v_processed_message := v_template.message_template;
      
      -- Replace template variables
      v_processed_message := REPLACE(v_processed_message, '{{workflow_type}}', COALESCE(NEW.workflow_type, 'Unknown'));
      v_processed_message := REPLACE(v_processed_message, '{{escalation_reason}}', COALESCE(NEW.escalation_reason, 'Auto-escalated'));
      
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
        v_processed_title,
        v_processed_message,
        'escalation',
        NEW.id,
        'approval_workflows',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create SLA warning function with template processing
CREATE OR REPLACE FUNCTION send_sla_warnings()
RETURNS void AS $$
DECLARE
  v_warning_time TIMESTAMPTZ;
  v_workflow_record RECORD;
  v_template RECORD;
  v_processed_title TEXT;
  v_processed_message TEXT;
  v_hours_remaining NUMERIC;
BEGIN
  -- Set warning time to 2 hours before SLA deadline
  v_warning_time := NOW() + INTERVAL '2 hours';
  
  -- Get SLA warning template
  SELECT * INTO v_template 
  FROM notification_templates 
  WHERE type = 'sla_warning';
  
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
    -- Calculate hours remaining
    v_hours_remaining := EXTRACT(EPOCH FROM (v_workflow_record.sla_deadline - NOW()))/3600;
    
    IF v_template.id IS NOT NULL THEN
      v_processed_title := v_template.title_template;
      v_processed_message := v_template.message_template;
      
      -- Replace template variables
      v_processed_title := REPLACE(v_processed_title, '{{workflow_type}}', COALESCE(v_workflow_record.workflow_type, 'Unknown'));
      v_processed_message := REPLACE(v_processed_message, '{{workflow_type}}', COALESCE(v_workflow_record.workflow_type, 'Unknown'));
      v_processed_message := REPLACE(v_processed_message, '{{time_remaining}}', ROUND(v_hours_remaining, 1)::text);
      
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
        v_processed_title,
        v_processed_message,
        'sla_warning',
        v_workflow_record.id,
        'approval_workflows',
        NOW()
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create daily summary function with template processing
CREATE OR REPLACE FUNCTION send_daily_admin_summary()
RETURNS void AS $$
DECLARE
  v_pending_count INTEGER;
  v_overdue_count INTEGER;
  v_escalated_count INTEGER;
  v_super_admin_id UUID;
  v_template RECORD;
  v_processed_title TEXT;
  v_processed_message TEXT;
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
  
  -- Get admin summary template
  SELECT * INTO v_template 
  FROM notification_templates 
  WHERE type = 'admin_summary';
  
  IF v_template.id IS NOT NULL THEN
    v_processed_title := v_template.title_template;
    v_processed_message := v_template.message_template;
    
    -- Replace template variables
    v_processed_message := REPLACE(v_processed_message, '{{pending_count}}', v_pending_count::text);
    v_processed_message := REPLACE(v_processed_message, '{{overdue_count}}', v_overdue_count::text);
    v_processed_message := REPLACE(v_processed_message, '{{escalated_count}}', v_escalated_count::text);
    
    -- Send summary notification
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      created_at
    ) VALUES (
      v_super_admin_id,
      v_processed_title,
      v_processed_message,
      'admin_summary',
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create all notification triggers
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

DROP TRIGGER IF EXISTS notify_escalation_trigger ON approval_workflows;
CREATE TRIGGER notify_escalation_trigger
AFTER UPDATE ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION notify_escalation();

-- Step 9: Insert notification preferences for admin users
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

-- Step 10: Create comprehensive notification templates
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

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(category);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_category ON notification_preferences(user_id, category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active) WHERE is_active = true;

-- Step 12: Verify the comprehensive setup
SELECT 
  'Comprehensive notification system setup complete!' as status,
  (SELECT COUNT(*) FROM notification_preferences) as preferences_count,
  (SELECT COUNT(*) FROM notification_templates) as templates_count,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name LIKE 'notify_%') as triggers_count;
