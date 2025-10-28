-- Fix notification preferences migration
-- This migration fixes the notification preferences table structure and data

-- First, let's check if the notification_preferences table exists and has the right structure
-- If not, we'll create it properly

-- Create notification preferences table if it doesn't exist with correct structure
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(category);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_category ON notification_preferences(user_id, category);

-- Create notification templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert notification preferences for admin users
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

-- Create notification templates
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


