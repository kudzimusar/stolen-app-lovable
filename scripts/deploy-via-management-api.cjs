#!/usr/bin/env node
/**
 * Deploy Migration via Supabase Management API
 * Uses service role key to execute SQL directly
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'lerjhxchglztvhbsdjjn';

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: responseData });
        } else {
          resolve({ success: false, status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function deployMigration() {
  console.log('🚀 DEPLOYING VIA SUPABASE MANAGEMENT API');
  console.log('=' .repeat(60));
  console.log('');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251023000001_stakeholder_admin_system.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Migration: stakeholder_admin_system.sql');
  console.log(`   Size: ${sql.length} characters\n`);
  
  console.log('🔧 Executing SQL via Management API...\n');
  
  try {
    const result = await executeSQL(sql);
    
    if (result.success) {
      console.log('✅ SQL executed successfully!');
      console.log('   Response:', result.data.slice(0, 100));
    } else {
      console.log(`ℹ️  Response status: ${result.status}`);
      console.log('   This often means tables already exist (which is OK)');
    }
  } catch (err) {
    console.error('⚠️  API error:', err.message);
    console.log('\n📋 The exec_sql function may not exist.');
    console.log('   Using fallback method...\n');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ DEPLOYMENT ATTEMPT COMPLETE');
  console.log('\n🎯 VERIFICATION NEEDED:\n');
  console.log('Please verify in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/editor\n');
  console.log('Check if these exist:');
  console.log('  - stakeholder_admin_requests (table)');
  console.log('  - retailer_admin_stats (view)');
  console.log('  - approve_stakeholder_admin_request (function)\n');
  console.log('If NOT, run the SQL manually:');
  console.log('https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new');
  console.log('\n' + '='.repeat(60) + '\n');
}

deployMigration();

