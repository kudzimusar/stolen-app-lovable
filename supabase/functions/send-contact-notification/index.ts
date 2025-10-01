import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SendGrid Configuration
const SENDGRID_API_KEY = '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';
const SENDGRID_FROM_EMAIL = 'kudzimusar@gmail.com'; // Will be updated with verified sender
const SENDGRID_FROM_NAME = 'STOLEN App';

interface ContactNotification {
  report_id: string;
  finder_name: string;
  finder_email: string;
  finder_phone?: string;
  message: string;
  contact_method: 'email' | 'phone' | 'whatsapp';
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

    const contactData: ContactNotification = await req.json();

    // 1. Get the lost/found report details
    const { data: report, error: reportError } = await supabaseClient
      .from("lost_found_reports")
      .select(`
        *,
        users!lost_found_reports_user_id_fkey (
          id,
          email,
          display_name
        )
      `)
      .eq("id", contactData.report_id)
      .single();

    if (reportError || !report) {
      throw new Error("Report not found");
    }

    const ownerEmail = report.users?.email;
    const ownerName = report.users?.display_name || 'Device Owner';
    const deviceName = report.device_model || report.device_category;

    console.log('📧 Sending notifications:', {
      owner: ownerEmail,
      finder: contactData.finder_email,
      device: deviceName
    });

    // 2. Update report status to 'contacted' (someone found it!)
    const { error: statusError } = await supabaseClient
      .from("lost_found_reports")
      .update({ status: 'contacted' })
      .eq("id", contactData.report_id);

    if (statusError) {
      console.error('Error updating status:', statusError);
    } else {
      console.log('✅ Report status updated to: contacted');
    }

    // 3. Create a community tip record
    const { data: tip, error: tipError } = await supabaseClient
      .from("community_tips")
      .insert({
        report_id: contactData.report_id,
        tipster_id: user.id,
        tip_type: 'contact',
        tip_description: contactData.message,
        contact_method: contactData.contact_method,
        anonymous: false,
        verified: false
      })
      .select()
      .single();

    if (tipError) {
      console.error('Error creating tip:', tipError);
    }

    // 3. Create in-app notification for device owner
    const { error: notifError } = await supabaseClient
      .from("user_notifications")
      .insert({
        user_id: report.user_id,
        notification_type: report.report_type === 'lost' ? 'device_found' : 'owner_contact',
        preferences: {
          title: report.report_type === 'lost' 
            ? `Someone Found Your ${deviceName}!`
            : `Someone Wants to Contact You About ${deviceName}`,
          message: contactData.message,
          finder_name: contactData.finder_name,
          finder_contact: contactData.finder_email || contactData.finder_phone,
          report_id: contactData.report_id
        }
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // 4. Send email notification to owner
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Great News About Your ${deviceName}!</h1>
            </div>
            <div class="content">
              <p>Hello ${ownerName},</p>
              
              <p><strong>${contactData.finder_name}</strong> has contacted you about your ${report.report_type} device:</p>
              
              <div class="highlight">
                <strong>Device:</strong> ${deviceName}<br>
                <strong>Location:</strong> ${report.location_address || 'Not specified'}<br>
                <strong>Reported:</strong> ${new Date(report.created_at).toLocaleDateString()}
              </div>
              
              <h3>Message from ${contactData.finder_name}:</h3>
              <p style="background: white; padding: 15px; border-radius: 5px; font-style: italic;">
                "${contactData.message}"
              </p>
              
              <h3>Contact Information:</h3>
              <p>
                <strong>Name:</strong> ${contactData.finder_name}<br>
                ${contactData.finder_email ? `<strong>Email:</strong> ${contactData.finder_email}<br>` : ''}
                ${contactData.finder_phone ? `<strong>Phone:</strong> ${contactData.finder_phone}<br>` : ''}
                <strong>Preferred Method:</strong> ${contactData.contact_method}
              </p>
              
              <div style="text-align: center;">
                <a href="http://localhost:8080/lost-found/details/${contactData.report_id}" class="button">
                  View Full Details
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                💡 <strong>Next Steps:</strong><br>
                1. Reply to ${contactData.finder_name} via ${contactData.contact_method}<br>
                2. Arrange a safe meeting location<br>
                3. Verify device ownership<br>
                4. Mark as reunited once recovered
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by STOLEN App - Lost & Found Community</p>
              <p>If you didn't expect this email, please ignore it.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 5. Send email via SendGrid
    try {
      const emailPayload = {
        personalizations: [{
          to: [{ email: ownerEmail, name: ownerName }],
          subject: `🎉 Someone Found Your ${deviceName}!`
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME
        },
        content: [{
          type: 'text/html',
          value: emailHtml
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

      if (emailResponse.ok) {
        console.log('✅ Email sent successfully to:', ownerEmail);
      } else {
        const errorText = await emailResponse.text();
        console.error('❌ SendGrid error:', errorText);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the whole request if email fails
    }

    // 6. Send confirmation email to finder
    try {
      const finderEmailHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>✅ Your Message Has Been Sent!</h2>
            <p>Hi ${contactData.finder_name},</p>
            <p>Thank you for helping reunite <strong>${deviceName}</strong> with its owner!</p>
            <p>Your message has been delivered to <strong>${ownerName}</strong>.</p>
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>The owner will receive your contact information</li>
              <li>They will reach out to you via ${contactData.contact_method}</li>
              <li>You can coordinate a safe meeting location</li>
            </ul>
            <p>Thank you for being part of the STOLEN community! 🙏</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              STOLEN App - Making device recovery community-driven
            </p>
          </body>
        </html>
      `;

      const finderEmailPayload = {
        personalizations: [{
          to: [{ email: contactData.finder_email, name: contactData.finder_name }],
          subject: '✅ Message Sent - STOLEN App'
        }],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME
        },
        content: [{
          type: 'text/html',
          value: finderEmailHtml
        }]
      };

      const finderResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finderEmailPayload)
      });

      if (finderResponse.ok) {
        console.log('✅ Confirmation email sent to finder:', contactData.finder_email);
      }
    } catch (error) {
      console.error('Finder confirmation email failed:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact notification sent successfully',
        data: {
          tip_id: tip?.id,
          owner_notified: true,
          finder_confirmed: true,
          email_prepared: true
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send notification"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
