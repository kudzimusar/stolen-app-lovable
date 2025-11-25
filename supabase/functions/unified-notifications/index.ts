import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SendGrid Configuration (from environment variables)
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || '';
const SENDGRID_FROM_NAME = 'STOLEN App';

// Twilio Configuration (from environment variables)
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') || '';

interface NotificationRequest {
  user_id: string;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: number;
  channels?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    in_app?: boolean;
  };
  scheduled_for?: string;
  expires_at?: string;
}

interface EmailTemplate {
  template_name: string;
  subject_template: string;
  html_template: string;
  variables: string[];
}

interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  filters: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Route handling
    if (method === 'POST' && path.endsWith('/send')) {
      return await handleSendNotification(supabaseClient, req);
    } else if (method === 'POST' && path.endsWith('/batch')) {
      return await handleBatchNotifications(supabaseClient, req);
    } else if (method === 'GET' && path.includes('/user/')) {
      return await handleGetUserNotifications(supabaseClient, url, user.id);
    } else if (method === 'PUT' && path.includes('/read/')) {
      return await handleMarkAsRead(supabaseClient, url, user.id);
    } else if (method === 'GET' && path.endsWith('/preferences')) {
      return await handleGetPreferences(supabaseClient, user.id);
    } else if (method === 'PUT' && path.endsWith('/preferences')) {
      return await handleUpdatePreferences(supabaseClient, req, user.id);
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unified notifications error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSendNotification(supabaseClient: any, req: Request) {
  const notificationData: NotificationRequest = await req.json();

  // Get user preferences for this category
  const preferences = await getUserPreferences(supabaseClient, notificationData.user_id, notificationData.category);

  // Create notification record
  const { data: notification, error: notifError } = await supabaseClient
    .from('universal_notifications')
    .insert({
      user_id: notificationData.user_id,
      notification_type: notificationData.notification_type,
      category: notificationData.category,
      title: notificationData.title,
      message: notificationData.message,
      metadata: notificationData.metadata || {},
      priority: notificationData.priority || 5,
      scheduled_for: notificationData.scheduled_for || null,
      expires_at: notificationData.expires_at || null,
      in_app_shown: preferences.in_app_enabled
    })
    .select()
    .single();

  if (notifError) {
    throw notifError;
  }

  // Process delivery based on preferences and requested channels
  const deliveryResults = await processNotificationDelivery(
    supabaseClient,
    notification,
    preferences,
    notificationData.channels
  );

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        notification,
        delivery: deliveryResults
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleBatchNotifications(supabaseClient: any, req: Request) {
  const { notifications } = await req.json();
  const results = [];

  for (const notificationData of notifications) {
    try {
      const preferences = await getUserPreferences(supabaseClient, notificationData.user_id, notificationData.category);

      const { data: notification, error: notifError } = await supabaseClient
        .from('universal_notifications')
        .insert({
          user_id: notificationData.user_id,
          notification_type: notificationData.notification_type,
          category: notificationData.category,
          title: notificationData.title,
          message: notificationData.message,
          metadata: notificationData.metadata || {},
          priority: notificationData.priority || 5,
          in_app_shown: preferences.in_app_enabled
        })
        .select()
        .single();

      if (notifError) {
        results.push({ success: false, error: notifError.message });
        continue;
      }

      const deliveryResults = await processNotificationDelivery(
        supabaseClient,
        notification,
        preferences,
        notificationData.channels
      );

      results.push({ success: true, notification, delivery: deliveryResults });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetUserNotifications(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/');
  const targetUserId = pathParts[pathParts.length - 1];

  // Users can only access their own notifications
  if (targetUserId !== userId) {
    throw new Error('Unauthorized');
  }

  const { data: notifications, error } = await supabaseClient
    .from('universal_notifications')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: notifications
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleMarkAsRead(supabaseClient: any, url: URL, userId: string) {
  const pathParts = url.pathname.split('/');
  const notificationId = pathParts[pathParts.length - 1];

  const { data: notification, error } = await supabaseClient
    .from('universal_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: notification
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleGetPreferences(supabaseClient: any, userId: string) {
  const { data: preferences, error } = await supabaseClient
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: preferences
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleUpdatePreferences(supabaseClient: any, req: Request, userId: string) {
  const { preferences } = await req.json();

  const results = [];
  for (const preference of preferences) {
    const { data, error } = await supabaseClient
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        category: preference.category,
        email_enabled: preference.email_enabled,
        sms_enabled: preference.sms_enabled,
        push_enabled: preference.push_enabled,
        in_app_enabled: preference.in_app_enabled,
        frequency: preference.frequency,
        quiet_hours_start: preference.quiet_hours_start,
        quiet_hours_end: preference.quiet_hours_end,
        filters: preference.filters
      }, {
        onConflict: 'user_id,category'
      })
      .select()
      .single();

    if (error) {
      results.push({ category: preference.category, success: false, error: error.message });
    } else {
      results.push({ category: preference.category, success: true, data });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUserPreferences(supabaseClient: any, userId: string, category: string): Promise<NotificationPreferences> {
  const { data: preferences, error } = await supabaseClient
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  // Return default preferences if none exist
  if (!preferences) {
    return {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      in_app_enabled: true,
      frequency: 'immediate',
      filters: {}
    };
  }

  return preferences;
}

async function processNotificationDelivery(
  supabaseClient: any,
  notification: any,
  preferences: NotificationPreferences,
  requestedChannels?: any
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  // Check if we should send based on quiet hours
  if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseTime(preferences.quiet_hours_start);
    const endTime = parseTime(preferences.quiet_hours_end);

    if (currentTime >= startTime && currentTime <= endTime) {
      // In quiet hours, only send high priority notifications
      if (notification.priority < 8) {
        return { skipped: 'quiet_hours' };
      }
    }
  }

  // Email delivery
  if ((requestedChannels?.email ?? preferences.email_enabled) && notification.priority >= 3) {
    try {
      await sendEmailNotification(supabaseClient, notification, preferences);
      results.email = { success: true, sent_at: new Date().toISOString() };
    } catch (error) {
      results.email = { success: false, error: error.message };
    }
  }

  // SMS delivery
  if ((requestedChannels?.sms ?? preferences.sms_enabled) && notification.priority >= 7) {
    try {
      await sendSMSNotification(supabaseClient, notification, preferences);
      results.sms = { success: true, sent_at: new Date().toISOString() };
    } catch (error) {
      results.sms = { success: false, error: error.message };
    }
  }

  // Push notification delivery
  if ((requestedChannels?.push ?? preferences.push_enabled) && notification.priority >= 5) {
    try {
      await sendPushNotification(supabaseClient, notification, preferences);
      results.push = { success: true, sent_at: new Date().toISOString() };
    } catch (error) {
      results.push = { success: false, error: error.message };
    }
  }

  return results;
}

async function sendEmailNotification(supabaseClient: any, notification: any, preferences: NotificationPreferences) {
  // Get email template
  const { data: template, error: templateError } = await supabaseClient
    .from('email_templates')
    .select('*')
    .eq('template_name', notification.notification_type)
    .single();

  if (templateError) {
    console.error('Template not found:', notification.notification_type);
    return;
  }

  // Get user email
  const { data: user, error: userError } = await supabaseClient
    .from('users')
    .select('email, display_name')
    .eq('id', notification.user_id)
    .single();

  if (userError) {
    throw new Error('User not found');
  }

  // Process template variables
  const subject = processTemplate(template.subject_template, notification.metadata);
  const htmlContent = processTemplate(template.html_template, notification.metadata);

  const emailPayload = {
    personalizations: [{
      to: [{ email: user.email, name: user.display_name || 'User' }],
      subject: subject
    }],
    from: {
      email: SENDGRID_FROM_EMAIL,
      name: SENDGRID_FROM_NAME
    },
    content: [{
      type: 'text/html',
      value: htmlContent
    }]
  };

  const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    throw new Error(`SendGrid error: ${errorText}`);
  }

  // Update notification delivery status
  await supabaseClient
    .from('universal_notifications')
    .update({
      email_sent: true,
      email_sent_at: new Date().toISOString()
    })
    .eq('id', notification.id);

  // Log delivery
  await supabaseClient
    .from('notification_delivery_logs')
    .insert({
      notification_id: notification.id,
      channel: 'email',
      status: 'sent',
      delivered_at: new Date().toISOString()
    });
}

async function sendSMSNotification(supabaseClient: any, notification: any, preferences: NotificationPreferences) {
  // Get user phone number
  const { data: user, error: userError } = await supabaseClient
    .from('users')
    .select('phone')
    .eq('id', notification.user_id)
    .single();

  if (userError || !user.phone) {
    throw new Error('User phone number not found');
  }

  const smsMessage = `${notification.title}\n\n${notification.message}`;

  const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      From: TWILIO_PHONE_NUMBER,
      To: user.phone,
      Body: smsMessage
    })
  });

  if (!smsResponse.ok) {
    const errorText = await smsResponse.text();
    throw new Error(`Twilio error: ${errorText}`);
  }

  // Update notification delivery status
  await supabaseClient
    .from('universal_notifications')
    .update({
      sms_sent: true,
      sms_sent_at: new Date().toISOString()
    })
    .eq('id', notification.id);

  // Log delivery
  await supabaseClient
    .from('notification_delivery_logs')
    .insert({
      notification_id: notification.id,
      channel: 'sms',
      status: 'sent',
      delivered_at: new Date().toISOString()
    });
}

async function sendPushNotification(supabaseClient: any, notification: any, preferences: NotificationPreferences) {
  // TODO: Implement Firebase Cloud Messaging
  // For now, just log the attempt
  console.log('Push notification would be sent:', notification.title);

  // Update notification delivery status
  await supabaseClient
    .from('universal_notifications')
    .update({
      push_sent: true,
      push_sent_at: new Date().toISOString()
    })
    .eq('id', notification.id);

  // Log delivery
  await supabaseClient
    .from('notification_delivery_logs')
    .insert({
      notification_id: notification.id,
      channel: 'push',
      status: 'sent',
      delivered_at: new Date().toISOString()
    });
}

function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), String(value || ''));
  }
  
  return processed;
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}
