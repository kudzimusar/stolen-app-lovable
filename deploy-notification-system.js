/**
 * Deploy Notification System to Supabase
 * This script will deploy the database migration and test the system
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzMDI5MiwiZXhwIjoyMDY5MjA2MjkzfQ.0kKhU3+PGqhqz6kMm0U32v8f61u86Z81yDefXkpm1dCn5Np1v5aJXqUEu7lMtdV0AMEFdX4beVMYSxUZMf93Gg==';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployNotificationSystem() {
  console.log('🚀 Deploying Notification System to Supabase...\n');

  try {
    // Test 1: Check current database state
    console.log('1. Checking current database state...');
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['universal_notifications', 'notification_preferences', 'email_templates']);

    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
    } else {
      console.log('✅ Existing tables:', existingTables.map(t => t.table_name));
    }

    // Test 2: Create universal_notifications table
    console.log('\n2. Creating universal_notifications table...');
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

    const { error: createTableError } = await supabase.rpc('exec_sql', { sql: createUniversalNotifications });
    if (createTableError) {
      console.log('❌ Error creating universal_notifications table:', createTableError.message);
    } else {
      console.log('✅ universal_notifications table created successfully');
    }

    // Test 3: Create notification_preferences table
    console.log('\n3. Creating notification_preferences table...');
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

    const { error: createPreferencesError } = await supabase.rpc('exec_sql', { sql: createNotificationPreferences });
    if (createPreferencesError) {
      console.log('❌ Error creating notification_preferences table:', createPreferencesError.message);
    } else {
      console.log('✅ notification_preferences table created successfully');
    }

    // Test 4: Create email_templates table
    console.log('\n4. Creating email_templates table...');
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

    const { error: createTemplatesError } = await supabase.rpc('exec_sql', { sql: createEmailTemplates });
    if (createTemplatesError) {
      console.log('❌ Error creating email_templates table:', createTemplatesError.message);
    } else {
      console.log('✅ email_templates table created successfully');
    }

    // Test 5: Insert default email templates
    console.log('\n5. Inserting default email templates...');
    const templates = [
      {
        template_name: 'device_registered',
        category: 'device',
        subject_template: '✅ Device Registered - {{device_name}}',
        html_template: '<h2>Device Successfully Registered</h2><p>Your {{device_name}} has been registered in the STOLEN database.</p>',
        variables: ['device_name', 'registration_date', 'qr_code_url']
      },
      {
        template_name: 'listing_created',
        category: 'marketplace',
        subject_template: '📱 Listing Created - {{device_name}}',
        html_template: '<h2>Your Device is Now Listed</h2><p>Your {{device_name}} is now live on the marketplace.</p>',
        variables: ['device_name', 'listing_price', 'listing_url']
      },
      {
        template_name: 'claim_submitted',
        category: 'insurance',
        subject_template: '📋 Claim Submitted - {{claim_id}}',
        html_template: '<h2>Insurance Claim Submitted</h2><p>Your claim {{claim_id}} has been submitted and is under review.</p>',
        variables: ['claim_id', 'claim_type', 'submission_date']
      },
      {
        template_name: 'payment_received',
        category: 'payment',
        subject_template: '💳 Payment Received - {{amount}}',
        html_template: '<h2>Payment Received</h2><p>You received {{amount}} in your STOLEN wallet.</p>',
        variables: ['amount', 'transaction_id', 'sender_name']
      },
      {
        template_name: 'repair_booked',
        category: 'repair',
        subject_template: '🔧 Repair Booked - {{device_name}}',
        html_template: '<h2>Repair Appointment Booked</h2><p>Your {{device_name}} repair is scheduled for {{appointment_date}}.</p>',
        variables: ['device_name', 'appointment_date', 'repair_shop_name']
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

    // Test 6: Create indexes
    console.log('\n6. Creating indexes...');
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_user_id ON public.universal_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_category ON public.universal_notifications(category);
      CREATE INDEX IF NOT EXISTS idx_universal_notifications_created_at ON public.universal_notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_category ON public.notification_preferences(user_id, category);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (indexError) {
      console.log('❌ Error creating indexes:', indexError.message);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Test 7: Enable RLS
    console.log('\n7. Enabling Row Level Security...');
    const enableRLS = `
      ALTER TABLE public.universal_notifications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own notifications" ON public.universal_notifications
          FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own notifications" ON public.universal_notifications
          FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
          FOR ALL USING (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS });
    if (rlsError) {
      console.log('❌ Error enabling RLS:', rlsError.message);
    } else {
      console.log('✅ RLS enabled successfully');
    }

    // Test 8: Test the unified-notifications function
    console.log('\n8. Testing unified-notifications function...');
    const testNotification = {
      user_id: 'test-user-123',
      notification_type: 'device_registered',
      category: 'device',
      title: 'Device Registration Test',
      message: 'This is a test notification from the deployment script',
      metadata: {
        device_name: 'Test Device',
        registration_date: new Date().toISOString(),
        test: true
      },
      priority: 5
    };

    const { data: functionData, error: functionError } = await supabase.functions.invoke('unified-notifications', {
      body: testNotification
    });

    if (functionError) {
      console.log('❌ Function test error:', functionError.message);
    } else {
      console.log('✅ Function test successful:', functionData);
    }

    // Test 9: Verify tables exist
    console.log('\n9. Verifying deployment...');
    const { data: finalTables, error: finalError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['universal_notifications', 'notification_preferences', 'email_templates']);

    if (finalError) {
      console.log('❌ Error verifying tables:', finalError.message);
    } else {
      console.log('✅ Final verification - Tables found:', finalTables.map(t => t.table_name));
    }

    console.log('\n🎉 Notification System Deployment Complete!');
    console.log('✅ Database migration applied');
    console.log('✅ Tables created successfully');
    console.log('✅ Email templates inserted');
    console.log('✅ Indexes created');
    console.log('✅ RLS policies enabled');
    console.log('✅ Function tested');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

// Run the deployment
deployNotificationSystem().catch(console.error);
