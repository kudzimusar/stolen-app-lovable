import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// SendGrid Configuration (from environment variables)
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || ''
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL') || ''
const SENDGRID_FROM_NAME = 'STOLEN App'

// Twilio Configuration (from environment variables)
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') || ''

interface NotificationRequest {
  user_id: string
  feature_category: string
  notification_type: string
  title: string
  message: string
  metadata?: Record<string, any>
  priority?: number
  channels?: {
    email?: boolean
    sms?: boolean
    push?: boolean
    in_app?: boolean
  }
  action_link?: string
  expires_at?: string
}

interface UserPreferences {
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  frequency: string
  quiet_hours_start?: string
  quiet_hours_end?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request payload
    const notificationPayload: NotificationRequest = await req.json()

    // Validate required fields
    if (!notificationPayload.user_id || !notificationPayload.feature_category || !notificationPayload.notification_type) {
      throw new Error('Missing required fields: user_id, feature_category, notification_type')
    }

    // Get user preferences for this feature category
    const { data: preferences, error: prefError } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', notificationPayload.user_id)
      .eq('feature_category', notificationPayload.feature_category)
      .single()

    if (prefError && prefError.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', prefError)
    }

    // Get user email and phone for delivery
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('email, phone')
      .eq('id', notificationPayload.user_id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
    }

    // Determine which channels to use based on preferences and request
    const userPrefs: UserPreferences = preferences || {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      in_app_enabled: true,
      frequency: 'immediate'
    }

    const channels = {
      email: (notificationPayload.channels?.email ?? true) && userPrefs.email_enabled,
      sms: (notificationPayload.channels?.sms ?? false) && userPrefs.sms_enabled,
      push: (notificationPayload.channels?.push ?? true) && userPrefs.push_enabled,
      in_app: (notificationPayload.channels?.in_app ?? true) && userPrefs.in_app_enabled
    }

    // Insert notification into database
    const { data: notification, error: notificationError } = await supabaseClient
      .from('user_notifications')
      .insert({
        user_id: notificationPayload.user_id,
        notification_type: notificationPayload.notification_type,
        title: notificationPayload.title,
        message: notificationPayload.message,
        feature_category: notificationPayload.feature_category,
        feature_data: notificationPayload.metadata || {},
        priority_level: notificationPayload.priority || 5,
        action_link: notificationPayload.action_link,
        expires_at: notificationPayload.expires_at,
        email_sent: channels.email,
        sms_sent: channels.sms,
        push_sent: channels.push,
        in_app_shown: channels.in_app
      })
      .select()
      .single()

    if (notificationError) {
      console.error('Error inserting notification:', notificationError)
      throw new Error(`Failed to create notification: ${notificationError.message}`)
    }

    // Send email if enabled
    if (channels.email && userData?.email) {
      try {
        // Get email template
        const { data: template, error: templateError } = await supabaseClient
          .from('email_templates')
          .select('*')
          .eq('feature_category', notificationPayload.feature_category)
          .eq('notification_type', notificationPayload.notification_type)
          .single()

        let subject = notificationPayload.title
        let htmlContent = notificationPayload.message

        if (template && !templateError) {
          // Use template if available
          subject = template.subject_template
          htmlContent = template.html_template
          
          // Replace template variables
          const variables = { ...notificationPayload.metadata, ...notificationPayload }
          Object.keys(variables).forEach(key => {
            const value = variables[key] || ''
            subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value)
            htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value)
          })
        }

        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: userData.email }],
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
          })
        })

        if (emailResponse.ok) {
          // Log successful email delivery
          await supabaseClient
            .from('notification_delivery_logs')
            .insert({
              notification_id: notification.id,
              channel: 'email',
              status: 'sent',
              delivered_at: new Date().toISOString()
            })

          // Update notification record
          await supabaseClient
            .from('user_notifications')
            .update({ 
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('id', notification.id)
        } else {
          console.error('Email sending failed:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }

    // Send SMS if enabled
    if (channels.sms && userData?.phone) {
      try {
        const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: TWILIO_PHONE_NUMBER,
            To: userData.phone,
            Body: notificationPayload.message
          })
        })

        if (smsResponse.ok) {
          // Log successful SMS delivery
          await supabaseClient
            .from('notification_delivery_logs')
            .insert({
              notification_id: notification.id,
              channel: 'sms',
              status: 'sent',
              delivered_at: new Date().toISOString()
            })

          // Update notification record
          await supabaseClient
            .from('user_notifications')
            .update({ 
              sms_sent: true,
              sms_sent_at: new Date().toISOString()
            })
            .eq('id', notification.id)
        } else {
          console.error('SMS sending failed:', await smsResponse.text())
        }
      } catch (smsError) {
        console.error('SMS error:', smsError)
      }
    }

    // TODO: Implement push notifications (Firebase/OneSignal)
    if (channels.push) {
      // Placeholder for push notification implementation
      console.log('Push notification would be sent here')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
        data: {
          notification_id: notification.id,
          channels_used: Object.keys(channels).filter(key => channels[key]),
          feature_category: notificationPayload.feature_category
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    )

  } catch (error) {
    console.error('Error in send-unified-notification:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    )
  }
})
