# 🚀 Edge Functions Deployment Guide

## ✅ Prerequisites Check

You've already completed:
- ✅ **Phase 1**: Database schema deployed successfully
- ✅ **Environment Variables**: All set in Supabase Dashboard (shown as SHA256 hashes)

## 📍 Edge Function Locations

Your edge function code is located here:

```
supabase/functions/
├── send-unified-notification/
│   └── index.ts  ← Main unified notification function
├── unified-notifications/
│   └── index.ts  ← Alternative unified notification function
└── send-contact-notification/
    └── index.ts  ← Lost & Found contact notification function
```

All three functions have been updated to use environment variables instead of hardcoded keys.

---

## 🛠️ Deployment Options

### Option 1: Using the Deployment Script (Recommended)

**Step 1**: Make sure you're in the project directory:
```bash
cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"
```

**Step 2**: Run the deployment script:
```bash
./DEPLOY_EDGE_FUNCTIONS.sh
```

This script will:
- Check if Supabase CLI is installed
- Verify you're logged in
- Deploy all 3 functions sequentially
- Show success/error messages

---

### Option 2: Manual Deployment (Step-by-Step)

**Step 1**: Login to Supabase CLI (if not already logged in):
```bash
supabase login
```

**Step 2**: Link your project (if not already linked):
```bash
supabase link --project-ref <your-project-ref>
```

To find your project ref:
- Go to Supabase Dashboard → Settings → General
- Look for "Reference ID" or use the subdomain from your URL

**Step 3**: Deploy each function individually:

```bash
# Navigate to project directory
cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable"

# Deploy send-unified-notification
supabase functions deploy send-unified-notification

# Deploy unified-notifications
supabase functions deploy unified-notifications

# Deploy send-contact-notification
supabase functions deploy send-contact-notification
```

---

## 🔍 Verification Steps

After deployment, verify everything worked:

### 1. Check Functions in Dashboard

1. Go to Supabase Dashboard → **Edge Functions**
2. You should see all 3 functions listed:
   - ✅ `send-unified-notification`
   - ✅ `unified-notifications`
   - ✅ `send-contact-notification`

### 2. Test a Function

1. Click on `send-unified-notification` function
2. Go to the **"Test"** tab
3. Use this test payload:

```json
{
  "user_id": "<your-test-user-id>",
  "feature_category": "retailer",
  "notification_type": "bulk_registration",
  "title": "Test Notification",
  "message": "This is a test notification",
  "priority": 7
}
```

4. Click "Run" and check the response

### 3. Check Function Logs

1. Click on any function → **Logs** tab
2. Look for any error messages
3. Verify it's reading environment variables correctly

---

## 🐛 Troubleshooting

### Issue: "supabase: command not found"

**Solution**: Install Supabase CLI:
```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### Issue: "Not logged in"

**Solution**: Login to Supabase:
```bash
supabase login
```

### Issue: "Project not linked"

**Solution**: Link your project:
```bash
supabase link --project-ref <your-project-ref>
```

### Issue: "Function deployment failed"

**Possible causes:**
1. **Syntax errors in code** - Check function logs
2. **Missing dependencies** - Check `index.ts` imports
3. **Environment variables not set** - Verify in Dashboard

**Solution**: 
- Check the error message in terminal
- Review function logs in Supabase Dashboard
- Verify environment variables are set correctly

---

## 📋 Quick Deployment Checklist

- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged in to Supabase CLI (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] Environment variables set in Dashboard
- [ ] Deployed `send-unified-notification`
- [ ] Deployed `unified-notifications`
- [ ] Deployed `send-contact-notification`
- [ ] Verified functions in Dashboard
- [ ] Tested at least one function
- [ ] Checked function logs for errors

---

## 🎯 Expected Results

After successful deployment:

1. **Dashboard**: All 3 functions visible and active
2. **Test**: Functions respond with success messages
3. **Logs**: No errors, environment variables read correctly
4. **Functionality**: Notifications can be sent via API

---

**Ready to deploy?** Run:
```bash
chmod +x DEPLOY_EDGE_FUNCTIONS.sh
./DEPLOY_EDGE_FUNCTIONS.sh
```

Or deploy manually using the commands above!



