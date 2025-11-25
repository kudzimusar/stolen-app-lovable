#!/bin/bash

# ================================================================
# DEPLOY EDGE FUNCTIONS - Notification System
# ================================================================
# This script deploys all 3 notification edge functions to Supabase
# Make sure you're logged in to Supabase CLI first
# ================================================================

echo "🚀 Deploying Notification System Edge Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
echo "📋 Checking Supabase CLI connection..."
supabase projects list &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Not logged in to Supabase CLI"
    echo "Run: supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Deploy send-unified-notification
echo "📦 Deploying send-unified-notification..."
supabase functions deploy send-unified-notification
if [ $? -eq 0 ]; then
    echo "✅ send-unified-notification deployed successfully"
else
    echo "❌ Failed to deploy send-unified-notification"
    exit 1
fi
echo ""

# Deploy unified-notifications
echo "📦 Deploying unified-notifications..."
supabase functions deploy unified-notifications
if [ $? -eq 0 ]; then
    echo "✅ unified-notifications deployed successfully"
else
    echo "❌ Failed to deploy unified-notifications"
    exit 1
fi
echo ""

# Deploy send-contact-notification
echo "📦 Deploying send-contact-notification..."
supabase functions deploy send-contact-notification
if [ $? -eq 0 ]; then
    echo "✅ send-contact-notification deployed successfully"
else
    echo "❌ Failed to deploy send-contact-notification"
    exit 1
fi
echo ""

echo "🎉 All edge functions deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify functions in Supabase Dashboard → Edge Functions"
echo "2. Test functions using the test interface"
echo "3. Check function logs for any errors"
echo ""



