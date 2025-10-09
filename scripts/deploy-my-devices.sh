#!/bin/bash

# My Devices - Deployment Script
# This script deploys the My Devices edge function and seeds test data

set -e  # Exit on error

echo "🚀 My Devices Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="lerjhxchglztvhbsdjjn"
SUPABASE_URL="https://lerjhxchglztvhbsdjjn.supabase.co"

echo -e "${BLUE}📋 Step 1: Deploying Edge Function${NC}"
echo "Function: my-devices"
echo ""

# Deploy edge function
if npx supabase functions deploy my-devices --project-ref $PROJECT_REF; then
    echo -e "${GREEN}✅ Edge function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy edge function${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Step 2: Seeding Test Data${NC}"
echo "Running SQL script: database/sql/seed-my-devices-test-data.sql"
echo ""

# Check if SQL file exists
if [ ! -f "database/sql/seed-my-devices-test-data.sql" ]; then
    echo -e "${RED}❌ SQL file not found!${NC}"
    echo "Please ensure database/sql/seed-my-devices-test-data.sql exists"
    exit 1
fi

# Run SQL script
if npx supabase db execute --file database/sql/seed-my-devices-test-data.sql --project-ref $PROJECT_REF; then
    echo -e "${GREEN}✅ Test data seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to seed test data (may already exist)${NC}"
    echo "You can manually run the SQL script in Supabase Dashboard"
fi

echo ""
echo -e "${BLUE}🔍 Step 3: Verifying Deployment${NC}"
echo ""

# Test edge function endpoint
echo "Testing edge function..."
if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/functions/v1/my-devices" | grep -q "401\|400"; then
    echo -e "${GREEN}✅ Edge function is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Edge function response unexpected (check authentication)${NC}"
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Navigate to: http://localhost:8081/my-devices"
echo "3. Login with your credentials"
echo "4. You should see 3 test devices with blockchain verification"
echo ""
echo "📚 For detailed testing guide, see: MY_DEVICES_INTEGRATION_GUIDE.md"
echo ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "  - Edge Function: $SUPABASE_URL/functions/v1/my-devices"
echo "  - Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
echo "  - Polygon Explorer: https://mumbai.polygonscan.com/"
echo ""

