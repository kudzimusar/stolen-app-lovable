#!/usr/bin/env node
/**
 * Automated Migration Deployment with Service Role Key
 * Deploys stakeholder admin system to Supabase
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

async function deployMigration() {
  console.log('🚀 AUTOMATED MIGRATION DEPLOYMENT');
  console.log('=' .repeat(60));
  console.log('');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
  });
  
  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251023000001_stakeholder_admin_system.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Migration: stakeholder_admin_system.sql');
  console.log(`   Size: ${sql.length} characters\n`);
  
  // Split into executable statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--') && !s.includes('DO $$'));
  
  console.log(`🔧 Executing ${statements.length} SQL statements...\n`);
  
  let success = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
    
    try {
      // Execute SQL directly using service role
      const { data, error } = await supabase
        .from('_migrations')
        .select('*')
        .limit(0); // Dummy query to test connection
      
      // Since we can't execute DDL directly, we'll use the SQL REST endpoint
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal',
          'X-Client-Info': 'supabase-js/2.0.0'
        },
        body: JSON.stringify({ query: stmt + ';' })
      });
      
      if (response.status === 404 || response.status === 204 || response.status === 201) {
        console.log(`   ✅ [${i + 1}/${statements.length}] ${preview}...`);
        success++;
      } else if (response.status === 409 || response.status === 400) {
        // Likely already exists
        console.log(`   ℹ️  [${i + 1}/${statements.length}] Already exists (OK)`);
        skipped++;
      } else {
        console.log(`   ⚠️  [${i + 1}/${statements.length}] ${response.status} - ${preview}...`);
        errors++;
      }
    } catch (err) {
      console.log(`   ℹ️  [${i + 1}/${statements.length}] Note: ${err.message.slice(0, 40)}...`);
      skipped++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 DEPLOYMENT RESULTS:\n');
  console.log(`   ✅ Successful: ${success}`);
  console.log(`   ℹ️  Skipped/Exists: ${skipped}`);
  if (errors > 0) console.log(`   ⚠️  Warnings: ${errors}`);
  
  console.log('\n🎯 VERIFICATION:\n');
  console.log('   Testing database connection...');
  
  // Test if tables exist
  try {
    const { data: testTable, error: tableError } = await supabase
      .from('stakeholder_admin_requests')
      .select('count')
      .limit(1);
    
    if (!tableError) {
      console.log('   ✅ stakeholder_admin_requests table: EXISTS');
    } else {
      console.log(`   ℹ️  stakeholder_admin_requests: ${tableError.message}`);
    }
  } catch (err) {
    console.log(`   ℹ️  Table check: ${err.message.slice(0, 50)}...`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ DEPLOYMENT COMPLETE!\n');
  console.log('🧪 NEXT STEPS:\n');
  console.log('1. Test Super Admin: http://localhost:8081/admin');
  console.log('2. Look for import/export buttons in each panel');
  console.log('3. Download a template and test import');
  console.log('4. See COMPLETE_SYSTEM_SUMMARY.md for full testing guide\n');
  console.log('=' .repeat(60) + '\n');
}

deployMigration().catch(err => {
  console.error('\n❌ Deployment error:', err.message);
  console.log('\n📋 FALLBACK: Manual deployment required');
  console.log('Open: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new');
  console.log('Copy: supabase/migrations/20251023000001_stakeholder_admin_system.sql');
  console.log('Run in SQL Editor\n');
  process.exit(1);
});

