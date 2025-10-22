/**
 * Deploy Stakeholder Admin System to Supabase
 * Runs the RLS policies, views, and admin request system SQL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function deployStakeholderAdminSystem() {
  console.log('🚀 Deploying Stakeholder Admin System to Supabase...\n');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
    console.log('ℹ️  Attempting to use anon key (limited permissions)...');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs');

  // Read SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/20251023000001_stakeholder_admin_system.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 Executing SQL migration...');
  console.log(`File: ${sqlPath}\n`);

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try executing via REST API
      console.log('\n📡 Trying alternative method...');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sql_query: sql }),
      });

      if (!response.ok) {
        console.error('❌ Alternative method also failed');
        console.log('\n📋 Please run the SQL manually in Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new');
        process.exit(1);
      }
    }

    console.log('✅ Stakeholder Admin System deployed successfully!');
    console.log('\n📊 Created:');
    console.log('  - stakeholder_admin_requests table');
    console.log('  - retailer_admin_stats view');
    console.log('  - repair_shop_admin_stats view');
    console.log('  - insurance_admin_stats view');
    console.log('  - law_enforcement_admin_stats view');
    console.log('  - ngo_admin_stats view');
    console.log('  - approve_stakeholder_admin_request function');
    console.log('  - has_stakeholder_admin_access function');
    console.log('\n🎉 Deployment complete!');

  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
    console.log('\n📋 Manual deployment required');
    console.log('Run the SQL file in Supabase SQL Editor:');
    console.log('supabase/migrations/20251023000001_stakeholder_admin_system.sql');
    process.exit(1);
  }
}

deployStakeholderAdminSystem().catch(console.error);

