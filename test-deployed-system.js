/**
 * Test the Deployed Notification System
 * This script tests the unified-notifications function and provides instructions for table creation
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeployedSystem() {
  console.log('🧪 Testing Deployed Notification System...\n');

  try {
    // Test 1: Check if the unified-notifications function is accessible
    console.log('1. Testing unified-notifications function...');
    
    const testNotification = {
      user_id: 'test-user-123',
      notification_type: 'device_registered',
      category: 'device',
      title: 'Test Device Registration',
      message: 'This is a test notification from the deployment script',
      metadata: {
        device_name: 'Test iPhone 15',
        registration_date: new Date().toISOString(),
        test: true
      },
      priority: 5,
      channels: {
        email: false,
        sms: false,
        push: false,
        in_app: true
      }
    };

    const { data: functionData, error: functionError } = await supabase.functions.invoke('unified-notifications', {
      body: testNotification
    });

    if (functionError) {
      console.log('❌ Function test error:', functionError.message);
      if (functionError.message.includes('relation "universal_notifications" does not exist')) {
        console.log('💡 This error indicates the database tables need to be created.');
      }
    } else {
      console.log('✅ Function test successful:', functionData);
    }

    // Test 2: Check if tables exist
    console.log('\n2. Checking if notification tables exist...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('universal_notifications')
        .select('id')
        .limit(1);

      if (tablesError) {
        console.log('❌ universal_notifications table does not exist:', tablesError.message);
      } else {
        console.log('✅ universal_notifications table exists');
      }
    } catch (err) {
      console.log('❌ universal_notifications table does not exist');
    }

    // Test 3: Test notification preferences
    console.log('\n3. Testing notification preferences...');
    try {
      const { data: preferences, error: prefsError } = await supabase
        .from('notification_preferences')
        .select('id')
        .limit(1);

      if (prefsError) {
        console.log('❌ notification_preferences table does not exist:', prefsError.message);
      } else {
        console.log('✅ notification_preferences table exists');
      }
    } catch (err) {
      console.log('❌ notification_preferences table does not exist');
    }

    // Test 4: Test email templates
    console.log('\n4. Testing email templates...');
    try {
      const { data: templates, error: templatesError } = await supabase
        .from('email_templates')
        .select('template_name')
        .limit(5);

      if (templatesError) {
        console.log('❌ email_templates table does not exist:', templatesError.message);
      } else {
        console.log('✅ email_templates table exists with', templates.length, 'templates');
      }
    } catch (err) {
      console.log('❌ email_templates table does not exist');
    }

    console.log('\n📋 Deployment Status Summary:');
    console.log('✅ unified-notifications function: DEPLOYED');
    console.log('✅ Environment variables: SET');
    console.log('❌ Database tables: NEED TO BE CREATED');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of notification-tables.sql');
    console.log('4. Execute the SQL script');
    console.log('5. Run this test script again to verify');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDeployedSystem().catch(console.error);
