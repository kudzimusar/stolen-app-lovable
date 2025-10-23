/**
 * Test Script for Notification System
 * Run this script to test the notification system functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  // Test 1: Check if database tables exist
  console.log('1. Testing Database Tables...');
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['universal_notifications', 'notification_preferences', 'email_templates']);

    if (error) {
      console.log('❌ Error checking tables:', error.message);
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name));
    }
  } catch (err) {
    console.log('❌ Database connection failed:', err.message);
    return;
  }

  // Test 2: Test unified-notifications function
  console.log('\n2. Testing Unified Notifications Function...');
  try {
    const testNotification = {
      user_id: 'test-user-123',
      notification_type: 'test_notification',
      category: 'device',
      title: 'Test Notification',
      message: 'This is a test notification from the testing script',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      },
      priority: 5
    };

    const { data, error } = await supabase.functions.invoke('unified-notifications', {
      body: testNotification
    });

    if (error) {
      console.log('❌ Function error:', error.message);
    } else {
      console.log('✅ Function response:', data);
    }
  } catch (err) {
    console.log('❌ Function call failed:', err.message);
  }

  // Test 3: Test notification preferences
  console.log('\n3. Testing Notification Preferences...');
  try {
    const testPreferences = {
      preferences: [
        {
          category: 'device',
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true,
          in_app_enabled: true,
          frequency: 'immediate',
          filters: {}
        }
      ]
    };

    const { data, error } = await supabase.functions.invoke('unified-notifications', {
      body: testPreferences,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.log('❌ Preferences error:', error.message);
    } else {
      console.log('✅ Preferences response:', data);
    }
  } catch (err) {
    console.log('❌ Preferences test failed:', err.message);
  }

  // Test 4: Test email templates
  console.log('\n4. Testing Email Templates...');
  try {
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('template_name, category')
      .limit(5);

    if (error) {
      console.log('❌ Templates error:', error.message);
    } else {
      console.log('✅ Email templates found:', templates.length);
      templates.forEach(t => console.log(`   - ${t.template_name} (${t.category})`));
    }
  } catch (err) {
    console.log('❌ Templates test failed:', err.message);
  }

  // Test 5: Test notification storage
  console.log('\n5. Testing Notification Storage...');
  try {
    const { data: notifications, error } = await supabase
      .from('universal_notifications')
      .select('id, notification_type, category, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('❌ Notifications error:', error.message);
    } else {
      console.log('✅ Notifications found:', notifications.length);
      notifications.forEach(n => console.log(`   - ${n.notification_type}: ${n.title}`));
    }
  } catch (err) {
    console.log('❌ Notifications test failed:', err.message);
  }

  console.log('\n🎉 Notification System Test Complete!');
}

// Run the test
testNotificationSystem().catch(console.error);
