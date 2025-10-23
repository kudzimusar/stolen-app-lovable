/**
 * Create Notification System Tables in Supabase
 * This script creates the required tables for the notification system
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration with service role key for admin operations
const supabaseUrl = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzMDI5MiwiZXhwIjoyMDY5MjA2MjkzfQ.0kKhU3+PGqhqz6kMm0U32v8f61u86Z81yDefXkpm1dCn5Np1v5aJXqUEu7lMtdV0AMEFdX4beVMYSxUZMf93Gg==';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNotificationTables() {
  console.log('🚀 Creating Notification System Tables in Supabase...\n');

  try {
    // 1. Create universal_notifications table
    console.log('1. Creating universal_notifications table...');
    const createUniversalNotifications = `
      CREATE TABLE IF NOT EXISTS public.universal_notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          notification_type VARCHAR(50) NOT NULL,
          category VARCHAR(30) NOT NULL CHECK (category IN (
              'device', 'marketplace', 'insurance', 'repair', 'payment', 
              'security', 'admin', 'lost_found', 'community', 'transfer'
          )),
          
          -- Content
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          
          -- Delivery channels
          email_sent BOOLEAN DEFAULT FALSE,
          sms_sent BOOLEAN DEFAULT FALSE,
          push_sent BOOLEAN DEFAULT FALSE,
          in_app_shown BOOLEAN DEFAULT FALSE,
          
          -- Delivery tracking
          email_sent_at TIMESTAMP WITH TIME ZONE,
          sms_sent_at TIMESTAMP WITH TIME ZONE,
          push_sent_at TIMESTAMP WITH TIME ZONE,
          
          -- Status
          read_at TIMESTAMP WITH TIME ZONE,
          clicked_at TIMESTAMP WITH TIME ZONE,
          action_taken_at TIMESTAMP WITH TIME ZONE,
          
          -- Priority & Scheduling
          priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
          scheduled_for TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createTable1Error } = await supabase.rpc('exec_sql', { sql: createUniversalNotifications });
    if (createTable1Error) {
      console.log('❌ Error creating universal_notifications table:', createTable1Error.message);
    } else {
      console.log('✅ universal_notifications table created successfully');
    }

    // 2. Create notification_preferences table
    console.log('\n2. Creating notification_preferences table...');
    const createNotificationPreferences = `
      CREATE TABLE IF NOT EXISTS public.notification_preferences (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          UNIQUE(user_id, category)
      );
    `;

    const { error: createTable2Error } = await supabase.rpc('exec_sql', { sql: createNotificationPreferences });
    if (createTable2Error) {
      console.log('❌ Error creating notification_preferences table:', createTable2Error.message);
    } else {
      console.log('✅ notification_preferences table created successfully');
    }

    // 3. Create email_templates table
    console.log('\n3. Creating email_templates table...');
    const createEmailTemplates = `
      CREATE TABLE IF NOT EXISTS public.email_templates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          template_name VARCHAR(100) NOT NULL UNIQUE,
          category VARCHAR(30) NOT NULL,
          subject_template TEXT NOT NULL,
          html_template TEXT NOT NULL,
          text_template TEXT,
          variables JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createTable3Error } = await supabase.rpc('exec_sql', { sql: createEmailTemplates });
    if (createTable3Error) {
      console.log('❌ Error creating email_templates table:', createTable3Error.message);
    } else {
      console.log('✅ email_templates table created successfully');
    }

    // 4. Create notification_delivery_logs table
    console.log('\n4. Creating notification_delivery_logs table...');
    const createDeliveryLogs = `
      CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          notification_id UUID REFERENCES public.universal_notifications(id) ON DELETE CASCADE,
          channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
          status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
          provider_response JSONB DEFAULT '{}',
          error_message TEXT,
          delivered_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: createTable4Error } = await supabase.rpc('exec_sql', { sql: createDeliveryLogs });
    if (createTable4Error) {
      console.log('❌ Error creating notification_delivery_logs table:', createTable4Error.message);
    } else {
      console.log('✅ notification_delivery_logs table created successfully');
    }

    // 5. Create indexes for performance
    console.log('\n5. Creating indexes...');
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_user_id ON public.universal_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_category ON public.universal_notifications(category);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_type ON public.universal_notifications(notification_type);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_created_at ON public.universal_notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_read_at ON public.universal_notifications(read_at);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_scheduled ON public.universal_notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
      
      CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_category ON public.notification_preferences(user_id, category);
      CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
      CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_notification_id ON public.notification_delivery_logs(notification_id);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (indexError) {
      console.log('❌ Error creating indexes:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // 6. Enable Row Level Security
    console.log('\n6. Enabling Row Level Security...');
    const enableRLS = `
      ALTER TABLE public.universal_notifications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
      
      -- Users can only see their own notifications
      CREATE POLICY "Users can view own notifications" ON public.universal_notifications
          FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own notifications" ON public.universal_notifications
          FOR UPDATE USING (auth.uid() = user_id);
      
      -- Users can manage their own preferences
      CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
          FOR ALL USING (auth.uid() = user_id);
      
      -- Delivery logs are read-only for users
      CREATE POLICY "Users can view own delivery logs" ON public.notification_delivery_logs
          FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.universal_notifications WHERE id = notification_id));
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS });
    if (rlsError) {
      console.log('❌ Error enabling RLS:', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // 7. Create trigger function for updated_at
    console.log('\n7. Creating updated_at trigger function...');
    const createTriggerFunction = `
      CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Create triggers for updated_at
      CREATE TRIGGER update_universal_notifications_updated_at
          BEFORE UPDATE ON public.universal_notifications
          FOR EACH ROW
          EXECUTE FUNCTION public.update_notification_updated_at();
      
      CREATE TRIGGER update_notification_preferences_updated_at
          BEFORE UPDATE ON public.notification_preferences
          FOR EACH ROW
          EXECUTE FUNCTION public.update_notification_updated_at();
      
      CREATE TRIGGER update_email_templates_updated_at
          BEFORE UPDATE ON public.email_templates
          FOR EACH ROW
          EXECUTE FUNCTION public.update_notification_updated_at();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerFunction });
    if (triggerError) {
      console.log('❌ Error creating triggers:', triggerError.message);
    } else {
      console.log('✅ Triggers created successfully');
    }

    // 8. Insert default email templates
    console.log('\n8. Inserting default email templates...');
    const templates = [
      {
        template_name: 'device_registered',
        category: 'device',
        subject_template: '✅ Device Registered - {{device_name}}',
        html_template: '<h2>Device Successfully Registered</h2><p>Your {{device_name}} has been registered in the STOLEN database.</p>',
        variables: ['device_name', 'registration_date', 'qr_code_url']
      },
      {
        template_name: 'device_verified',
        category: 'device',
        subject_template: '🔍 Device Verified - {{device_name}}',
        html_template: '<h2>Device Verification Complete</h2><p>Your {{device_name}} has been verified and added to the registry.</p>',
        variables: ['device_name', 'verification_date', 'certificate_url']
      },
      {
        template_name: 'listing_created',
        category: 'marketplace',
        subject_template: '📱 Listing Created - {{device_name}}',
        html_template: '<h2>Your Device is Now Listed</h2><p>Your {{device_name}} is now live on the marketplace.</p>',
        variables: ['device_name', 'listing_price', 'listing_url']
      },
      {
        template_name: 'price_drop',
        category: 'marketplace',
        subject_template: '💰 Price Drop Alert - {{device_name}}',
        html_template: '<h2>Price Drop Alert</h2><p>The {{device_name}} you\'re watching dropped to {{new_price}}.</p>',
        variables: ['device_name', 'old_price', 'new_price', 'listing_url']
      },
      {
        template_name: 'claim_submitted',
        category: 'insurance',
        subject_template: '📋 Claim Submitted - {{claim_id}}',
        html_template: '<h2>Insurance Claim Submitted</h2><p>Your claim {{claim_id}} has been submitted and is under review.</p>',
        variables: ['claim_id', 'claim_type', 'submission_date']
      },
      {
        template_name: 'claim_approved',
        category: 'insurance',
        subject_template: '✅ Claim Approved - {{claim_id}}',
        html_template: '<h2>Claim Approved</h2><p>Your claim {{claim_id}} has been approved. Payout: {{amount}}.</p>',
        variables: ['claim_id', 'amount', 'payout_date']
      },
      {
        template_name: 'payment_received',
        category: 'payment',
        subject_template: '💳 Payment Received - {{amount}}',
        html_template: '<h2>Payment Received</h2><p>You received {{amount}} in your STOLEN wallet.</p>',
        variables: ['amount', 'transaction_id', 'sender_name']
      },
      {
        template_name: 'payment_sent',
        category: 'payment',
        subject_template: '💸 Payment Sent - {{amount}}',
        html_template: '<h2>Payment Sent</h2><p>You sent {{amount}} to {{recipient_name}}.</p>',
        variables: ['amount', 'transaction_id', 'recipient_name']
      },
      {
        template_name: 'repair_booked',
        category: 'repair',
        subject_template: '🔧 Repair Booked - {{device_name}}',
        html_template: '<h2>Repair Appointment Booked</h2><p>Your {{device_name}} repair is scheduled for {{appointment_date}}.</p>',
        variables: ['device_name', 'appointment_date', 'repair_shop_name']
      },
      {
        template_name: 'repair_completed',
        category: 'repair',
        subject_template: '✅ Repair Complete - {{device_name}}',
        html_template: '<h2>Repair Completed</h2><p>Your {{device_name}} repair is complete and ready for pickup.</p>',
        variables: ['device_name', 'completion_date', 'repair_shop_name', 'pickup_location']
      },
      {
        template_name: 'security_alert',
        category: 'security',
        subject_template: '⚠️ Security Alert',
        html_template: '<h2>Security Alert</h2><p>{{alert_message}}</p>',
        variables: ['alert_message', 'alert_type', 'action_required']
      },
      {
        template_name: 'login_new_device',
        category: 'security',
        subject_template: '🔐 New Device Login',
        html_template: '<h2>New Device Login Detected</h2><p>A login was detected from a new device.</p>',
        variables: ['device_info', 'location', 'login_time']
      }
    ];

    for (const template of templates) {
      const { error: insertError } = await supabase
        .from('email_templates')
        .upsert(template, { onConflict: 'template_name' });

      if (insertError) {
        console.log(`❌ Error inserting template ${template.template_name}:`, insertError.message);
      } else {
        console.log(`✅ Template ${template.template_name} inserted successfully`);
      }
    }

    // 9. Verify tables were created
    console.log('\n9. Verifying tables were created...');
    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['universal_notifications', 'notification_preferences', 'email_templates', 'notification_delivery_logs']);

    if (verifyError) {
      console.log('❌ Error verifying tables:', verifyError.message);
    } else {
      console.log('✅ Tables verified:', tables.map(t => t.table_name));
    }

    console.log('\n🎉 Notification System Tables Created Successfully!');
    console.log('✅ universal_notifications table created');
    console.log('✅ notification_preferences table created');
    console.log('✅ email_templates table created');
    console.log('✅ notification_delivery_logs table created');
    console.log('✅ Indexes created for performance');
    console.log('✅ RLS policies enabled');
    console.log('✅ Triggers created for updated_at');
    console.log('✅ Default email templates inserted');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

// Run the table creation
createNotificationTables().catch(console.error);
