# Deploy Notification System to Supabase

## Current Status
✅ **Files Created**: All notification system files have been created locally
❌ **Not Deployed**: Database migration and functions need to be deployed to Supabase

## Deployment Steps

### 1. Deploy Database Migration
The migration file `20250215000000_universal_notifications_schema.sql` needs to be applied to your Supabase database.

**Option A: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250215000000_universal_notifications_schema.sql`
4. Execute the SQL script

**Option B: Via Supabase CLI (if Docker is running)**
```bash
supabase db push
```

### 2. Deploy Edge Functions
Deploy the unified-notifications function to Supabase:

```bash
supabase functions deploy unified-notifications
```

### 3. Set Environment Variables
Ensure these environment variables are set in your Supabase project:

```bash
# In Supabase Dashboard > Settings > Edge Functions > Environment Variables
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=kudzimusar@gmail.com
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
TWILIO_PHONE_NUMBER=+1234567890
```

## Testing the Notification System

### 1. Test Database Tables
Verify the tables were created successfully:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('universal_notifications', 'notification_preferences', 'email_templates');

-- Check table structure
\d universal_notifications;
\d notification_preferences;
\d email_templates;
```

### 2. Test Edge Function
Test the unified-notifications function:

```bash
# Test function deployment
curl -X POST 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/unified-notifications/send' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user-id",
    "notification_type": "device_registered",
    "category": "device",
    "title": "Test Notification",
    "message": "This is a test notification",
    "priority": 5
  }'
```

### 3. Test Frontend Integration
1. Register a new device to test device registration notifications
2. Create a marketplace listing to test marketplace notifications
3. Submit an insurance claim to test insurance notifications
4. Send a payment to test payment notifications
5. Book a repair to test repair notifications

### 4. Test Email Delivery
Check if emails are being sent by:
1. Looking at SendGrid dashboard for delivery logs
2. Checking spam folders
3. Verifying email addresses are correct

### 5. Test Notification Preferences
1. Navigate to notification preferences page
2. Update preferences for different categories
3. Verify preferences are saved in the database

## Verification Checklist

### Database
- [ ] `universal_notifications` table created
- [ ] `notification_preferences` table created
- [ ] `email_templates` table created
- [ ] Default email templates inserted
- [ ] Indexes created for performance
- [ ] RLS policies enabled

### Edge Functions
- [ ] `unified-notifications` function deployed
- [ ] Function responds to POST requests
- [ ] Function can send emails via SendGrid
- [ ] Function can send SMS via Twilio
- [ ] Function stores notifications in database

### Frontend Integration
- [ ] Device registration sends notifications
- [ ] Marketplace listing sends notifications
- [ ] Insurance claim submission sends notifications
- [ ] Payment sending triggers notifications
- [ ] Repair booking sends notifications
- [ ] Notification preferences UI works

### Email Delivery
- [ ] SendGrid API key is valid
- [ ] Email templates are working
- [ ] HTML emails render correctly
- [ ] Email delivery is successful

## Troubleshooting

### Common Issues

1. **Function Not Found (404)**
   - Ensure the function is deployed: `supabase functions deploy unified-notifications`
   - Check the function URL is correct

2. **Database Connection Errors**
   - Verify the migration was applied successfully
   - Check RLS policies are not blocking access

3. **Email Not Sending**
   - Verify SendGrid API key is correct
   - Check SendGrid dashboard for errors
   - Ensure sender email is verified in SendGrid

4. **SMS Not Sending**
   - Verify Twilio credentials are correct
   - Check Twilio console for errors
   - Ensure phone numbers are in correct format

### Debug Commands

```bash
# Check function logs
supabase functions logs unified-notifications

# Check database connection
supabase db ping

# Test database query
supabase db query "SELECT COUNT(*) FROM universal_notifications;"
```

## Next Steps After Deployment

1. **Test All Features**: Run through all notification scenarios
2. **Monitor Performance**: Check delivery rates and response times
3. **User Testing**: Have users test the notification preferences
4. **Push Notifications**: Implement Firebase Cloud Messaging
5. **Analytics**: Set up notification performance monitoring

## Production Readiness

Before going live:
- [ ] Test with real user accounts
- [ ] Verify email deliverability
- [ ] Test SMS delivery
- [ ] Check notification preferences work
- [ ] Monitor for errors in logs
- [ ] Set up monitoring and alerts
