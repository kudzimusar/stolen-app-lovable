# 🚀 Notification System Deployment Guide

This guide walks you through deploying the complete notification system for all 18 features in the STOLEN app.

## 📋 Prerequisites

- Access to Supabase Dashboard for your project
- Supabase CLI installed (for edge function deployment)
- Your API keys (SendGrid, Twilio) ready to configure

---

## Phase 1: Database Enhancement

### Step 1: Deploy Database Schema

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** (left sidebar)

2. **Run the Deployment Script**
   - Click **"New Query"**
   - Open the file: `database/sql/PHASE1_COMPLETE_DEPLOYMENT.sql`
   - Copy the **ENTIRE** contents
   - Paste into the SQL Editor
   - Click **"Run"** (or press `Ctrl/Cmd + Enter`)

3. **Verify Deployment**
   After running, you should see:
   - ✅ Success messages for each column addition
   - ✅ Verification queries showing counts for:
     - 5 columns added to `user_notifications`
     - 3 tables created
     - 64+ email templates populated
     - RLS policies enabled

**Expected Output:**
```
✅ Added feature_category column
✅ Added feature_data column
✅ Added priority_level column
✅ Added action_link column
✅ Added expires_at column
[Verification queries showing successful setup]
```

### Step 2: Verify Database Setup

Run these verification queries in SQL Editor:

```sql
-- Check columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
AND column_name IN ('feature_category', 'feature_data', 'priority_level', 'action_link', 'expires_at')
ORDER BY column_name;

-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notification_preferences', 'email_templates', 'notification_delivery_logs');

-- Check email templates
SELECT feature_category, COUNT(*) as template_count
FROM email_templates
GROUP BY feature_category
ORDER BY feature_category;
```

**Expected Results:**
- 5 rows showing the new columns
- 3 rows showing the new tables
- 18 rows showing template counts per feature category

---

## Phase 2: Update Edge Functions

### Step 1: Set Environment Variables

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to **Settings** → **Edge Functions** → **Environment Variables**

2. **Add/Update These Variables**

   You'll need to decrypt the API keys you provided. Set these variables:

   ```
   SUPABASE_URL=<your-project-url>
   SUPABASE_ANON_KEY=<decrypt: 3a919662b3fe205f9a39cbd6d195ceafb8e87f4e16b311cb4cdb87aa159c716f>
   SUPABASE_SERVICE_ROLE_KEY=<decrypt: 0a9fc768a02c0f8bc7e0afef473b71b7bf31067bf5358642edc0fe4f66620d00>
   SENDGRID_API_KEY=<decrypt: 458bca2f31ae7cc2f8315f5a0d596bf1393527ed1d29461d80e028a372d4dd97>
   SENDGRID_FROM_EMAIL=<decrypt: d18222a53f5273287bb19fea4ddf80151b4809c714f7a31e07b8ffae6fac84b6>
   TWILIO_ACCOUNT_SID=<decrypt: d387bbd4899b4d5a2d26b99197076dff9e704202913ab73d193f9a0e2da5cf6f>
   TWILIO_AUTH_TOKEN=<decrypt: cc75443d8979fe5cdbdf2de55b822ec8b63bc55348c2e451b46b19f4746885ca>
   TWILIO_PHONE_NUMBER=<decrypt: 422ce82c6fc1724ac878042f7d055653ab5e983d186e616826a72d4384b68af8>
   ```

   **Note**: The values you provided appear to be encrypted/hashed. You'll need to decrypt them or use the actual API key values.

3. **How to Find Your Actual Values**:
   - **Supabase URL**: Found in Project Settings → API
   - **Supabase Keys**: Found in Project Settings → API
   - **SendGrid API Key**: Found in SendGrid Dashboard → Settings → API Keys
   - **Twilio Credentials**: Found in Twilio Console → Account → API Keys

### Step 2: Deploy Updated Edge Functions

1. **Open Terminal**
   - Navigate to your project directory:
     ```bash
     cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
     ```

2. **Deploy Functions**

   ```bash
   # Deploy send-unified-notification
   supabase functions deploy send-unified-notification

   # Deploy unified-notifications  
   supabase functions deploy unified-notifications

   # Deploy send-contact-notification (updated for consistency)
   supabase functions deploy send-contact-notification
   ```

3. **Verify Deployment**
   - In Supabase Dashboard, go to **Edge Functions**
   - You should see all three functions listed
   - Click on each function to verify it's active

---

## Phase 3: Frontend Verification (Already 90% Complete)

The frontend components are already created and should work once the database schema is deployed. Verify:

1. **Notification Centers**
   - All 15 feature-specific notification centers exist
   - `SmartNotificationCenter.tsx` handles routing

2. **User Preferences UI**
   - `EnhancedNotificationPreferences.tsx` connects to database
   - Queries `notification_preferences` table

3. **Lost & Found Still Works**
   - `LostFoundNotificationCenter.tsx` should continue working
   - Existing notifications remain intact

---

## Phase 4: Testing

### Test 1: Database Verification

Run in SQL Editor:

```sql
-- Test creating a notification with new schema
INSERT INTO user_notifications (
    user_id,
    feature_category,
    notification_type,
    title,
    message,
    priority_level,
    feature_data
) VALUES (
    (SELECT id FROM auth.users LIMIT 1), -- Use an actual user ID
    'retailer',
    'bulk_registration',
    'Device Registration Successful',
    'Your bulk device registration is complete.',
    7,
    '{"device_count": 5, "status": "completed"}'::jsonb
) RETURNING *;
```

**Expected**: Notification created with all new columns populated

### Test 2: Edge Function Test

Use the Supabase Dashboard Edge Functions test interface or run:

```bash
curl -X POST 'https://<your-project>.supabase.co/functions/v1/send-unified-notification' \
  -H 'Authorization: Bearer <your-anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "<test-user-id>",
    "feature_category": "retailer",
    "notification_type": "bulk_registration",
    "title": "Test Notification",
    "message": "This is a test notification",
    "priority": 7
  }'
```

**Expected**: Response with `success: true` and notification details

### Test 3: Frontend Integration

1. **Login to the app**
2. **Navigate to a feature page** (e.g., Marketplace, Retailer Dashboard)
3. **Check notification bell** - Should show notifications for that feature
4. **Click notification** - Should navigate to correct page

### Test 4: Email Delivery

1. **Create a test notification** via edge function
2. **Check user email inbox** - Should receive email using template
3. **Check SendGrid Dashboard** - Should show email sent

---

## Troubleshooting

### Issue: "Column does not exist" errors

**Solution**: Re-run the deployment script. It's idempotent and will skip existing columns.

### Issue: Edge functions not reading environment variables

**Solution**: 
1. Verify variables are set in Supabase Dashboard
2. Redeploy functions after setting variables
3. Check function logs in Supabase Dashboard

### Issue: Lost & Found notifications not working

**Solution**: 
- Existing notifications have `feature_category` defaulted to 'lost_found'
- `LostFoundNotificationCenter` should continue working
- If not, verify it queries without `feature_category` filter or uses `feature_category = 'lost_found'`

### Issue: Email not sending

**Solution**:
1. Verify SendGrid API key is correct
2. Check SendGrid sender email is verified
3. Review function logs for SendGrid errors
4. Check `notification_delivery_logs` table for error messages

---

## Success Criteria Checklist

- [ ] Database: All 5 columns added to `user_notifications`
- [ ] Database: All 3 supporting tables created
- [ ] Database: 64+ email templates populated
- [ ] Database: RLS policies enabled
- [ ] Edge Functions: All 3 functions updated with environment variables
- [ ] Edge Functions: Functions deployed successfully
- [ ] Environment: All API keys set in Supabase
- [ ] Testing: Can create notification with new schema
- [ ] Testing: Edge function can send notifications
- [ ] Testing: Frontend notification centers display correctly
- [ ] Testing: Email delivery working

---

## Next Steps After Deployment

1. **Monitor Notification Delivery**
   - Check `notification_delivery_logs` table regularly
   - Review SendGrid/Twilio dashboards for delivery rates

2. **User Onboarding**
   - Guide users to set notification preferences
   - Ensure all 18 features trigger notifications correctly

3. **Performance Optimization**
   - Monitor query performance on notification centers
   - Add additional indexes if needed based on usage patterns

4. **Future Enhancements**
   - Implement push notifications (Firebase/OneSignal)
   - Add notification analytics dashboard
   - Create admin tools for notification management

---

## Support

If you encounter issues:

1. Check function logs in Supabase Dashboard
2. Review `notification_delivery_logs` for delivery errors
3. Verify all environment variables are set correctly
4. Test with simple notification first before complex scenarios

**Deployment Date**: _______________
**Deployed By**: _______________
**Notes**: _______________
