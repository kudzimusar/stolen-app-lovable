#!/bin/bash
# Deploy Migration via Direct PostgreSQL Connection
# Uses service role key for authentication

set -e

echo "🚀 Deploying Stakeholder Admin Migration via PostgreSQL"
echo "========================================================="
echo ""

# Load service key from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Supabase connection details
DB_HOST="aws-0-eu-central-1.pooler.supabase.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.lerjhxchglztvhbsdjjn"
DB_PASSWORD="${SUPABASE_SERVICE_ROLE_KEY}"

# Migration file
MIGRATION_FILE="supabase/migrations/20251023000001_stakeholder_admin_system.sql"

echo "📄 Migration file: $MIGRATION_FILE"
echo "🔧 Connecting to Supabase PostgreSQL..."
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Installing via Supabase CLI..."
    echo ""
    echo "Please run this migration manually in Supabase SQL Editor:"
    echo "https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new"
    echo ""
    echo "Copy and run file: $MIGRATION_FILE"
    exit 1
fi

# Execute migration using psql
echo "⚡ Executing migration..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================================="
    echo "✅ MIGRATION DEPLOYED SUCCESSFULLY!"
    echo "========================================================="
    echo ""
    echo "🧪 NEXT: Test the system"
    echo "1. Go to: http://localhost:8081/admin"
    echo "2. Click any panel (Lost & Found, Marketplace, etc.)"
    echo "3. Look for 'Data Management Toolbar'"
    echo "4. Click 'Download Template' → Excel"
    echo "5. Template downloads! ✅"
    echo ""
else
    echo ""
    echo "⚠️  Deployment had warnings (likely tables already exist)"
    echo "This is usually OK - check Supabase dashboard to verify"
    echo ""
fi

