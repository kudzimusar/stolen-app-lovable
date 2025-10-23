# Quick Test Guide - Notification System

## 🚨 Current Status
**❌ NOT DEPLOYED TO SUPABASE YET**

The notification system has been implemented locally but needs to be deployed to your Supabase database and functions.

## 🔧 What Needs to Be Done

### 1. Deploy Database Migration
**File**: `supabase/migrations/20250215000000_universal_notifications_schema.sql`

**Steps**:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of the migration file
4. Paste and execute the SQL script

### 2. Deploy Edge Function
**File**: `supabase/functions/unified-notifications/index.ts`

**Steps**:
1. Open terminal in project directory
2. Run: `supabase functions deploy unified-notifications`
3. Set environment variables in Supabase Dashboard

### 3. Test the System
**File**: `test-notification-system.js`

**Steps**:
1. Run: `node test-notification-system.js`
2. Check console output for test results

## 🧪 Manual Testing Steps

### Test 1: Database Tables
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('universal_notifications', 'notification_preferences', 'email_templates');
```

### Test 2: Edge Function
```bash
# Test function endpoint
curl -X POST 'https://lerjhxchglztvhbsdjjn.supabase.co/functions/v1/unified-notifications/send' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "test-user",
    "notification_type": "test",
    "category": "device",
    "title": "Test",
    "message": "Test message"
  }'
```

### Test 3: Frontend Integration
1. **Device Registration**: Register a new device and check for notification
2. **Marketplace Listing**: Create a listing and check for notification
3. **Insurance Claim**: Submit a claim and check for notification
4. **Payment**: Send a payment and check for notification
5. **Repair Booking**: Book a repair and check for notification

## ✅ What's Working (Locally)

### Files Created ✅
- Database migration schema
- Unified notification service function
- Frontend notification service
- Universal notification preferences UI
- Integration in all major features

### Features Implemented ✅
- Multi-channel notification delivery (Email, SMS, Push, In-App)
- User preference management
- Email templates for all notification types
- Integration with Device, Marketplace, Insurance, Payment, Repair features

## ❌ What's Not Working (Yet)

### Database ❌
- Migration not applied to Supabase
- Tables don't exist in production database

### Functions ❌
- Edge function not deployed to Supabase
- API endpoints not accessible

### Testing ❌
- Cannot test without deployment
- Email delivery not working
- SMS delivery not working

## 🚀 Quick Deploy Commands

```bash
# 1. Deploy database migration (via Supabase Dashboard SQL Editor)
# Copy contents of: supabase/migrations/20250215000000_universal_notifications_schema.sql

# 2. Deploy edge function
supabase functions deploy unified-notifications

# 3. Set environment variables (via Supabase Dashboard)
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=kudzimusar@gmail.com
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef

# 4. Test the system
node test-notification-system.js
```

## 📋 Verification Checklist

After deployment, verify:

- [ ] Database tables created successfully
- [ ] Edge function deployed and responding
- [ ] Environment variables set correctly
- [ ] Test script runs without errors
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Frontend integration working
- [ ] User preferences saving correctly

## 🆘 Troubleshooting

### If Database Migration Fails
- Check for existing tables with same names
- Verify user permissions
- Check for syntax errors in SQL

### If Function Deployment Fails
- Check Docker is running
- Verify Supabase CLI is authenticated
- Check function syntax

### If Testing Fails
- Verify database tables exist
- Check function is deployed
- Verify environment variables are set
- Check network connectivity

---

**Next Step**: Deploy the database migration and edge function to make the notification system testable and functional! 🚀
