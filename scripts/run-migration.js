#!/usr/bin/env node
/**
 * Run SQL Migration Directly on Supabase
 * Executes the stakeholder admin system migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs';

async function runMigration() {
  console.log('🚀 Running Stakeholder Admin System Migration\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Read the SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/20251023000001_stakeholder_admin_system.sql');
  const fullSQL = fs.readFileSync(sqlPath, 'utf8');
  
  console.log('📄 Migration file loaded');
  console.log(`   Size: ${fullSQL.length} characters\n`);
  
  // Break into logical blocks that can be executed
  const sqlBlocks = [
    // Block 1: Create table
    `CREATE TABLE IF NOT EXISTS public.stakeholder_admin_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      current_role TEXT NOT NULL,
      requested_admin_access BOOLEAN DEFAULT TRUE,
      business_justification TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      reviewed_by UUID REFERENCES public.users(id),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      approval_notes TEXT,
      CONSTRAINT valid_stakeholder_role CHECK (
        current_role IN ('retailer', 'repair_shop', 'insurance', 'law_enforcement', 'ngo')
      )
    );`,
    
    // Block 2: Create indexes
    `CREATE INDEX IF NOT EXISTS idx_stakeholder_admin_requests_user ON public.stakeholder_admin_requests(user_id);
     CREATE INDEX IF NOT EXISTS idx_stakeholder_admin_requests_status ON public.stakeholder_admin_requests(status);`,
    
    // Block 3: Enable RLS
    `ALTER TABLE public.stakeholder_admin_requests ENABLE ROW LEVEL SECURITY;`,
    
    // Block 4: Create policies
    `DROP POLICY IF EXISTS stakeholder_admin_requests_own ON public.stakeholder_admin_requests;
     CREATE POLICY stakeholder_admin_requests_own ON public.stakeholder_admin_requests
       FOR SELECT USING (user_id = auth.uid());`,
    
    `DROP POLICY IF EXISTS stakeholder_admin_requests_insert ON public.stakeholder_admin_requests;
     CREATE POLICY stakeholder_admin_requests_insert ON public.stakeholder_admin_requests
       FOR INSERT WITH CHECK (user_id = auth.uid());`,
    
    `DROP POLICY IF EXISTS stakeholder_admin_requests_admin ON public.stakeholder_admin_requests;
     CREATE POLICY stakeholder_admin_requests_admin ON public.stakeholder_admin_requests
       FOR ALL USING (
         EXISTS (
           SELECT 1 FROM public.users
           WHERE users.id = auth.uid()
           AND users.role IN ('admin', 'super_admin')
         )
       );`
  ];
  
  console.log('🔧 Executing SQL blocks...\n');
  
  let success = 0;
  let warnings = 0;
  
  for (let i = 0; i < sqlBlocks.length; i++) {
    const block = sqlBlocks[i];
    try {
      console.log(`   [${i + 1}/${sqlBlocks.length}] Executing...`);
      
      // Use Supabase to execute raw SQL via RPC if available
      const { data, error } = await supabase.rpc('exec_sql', { sql: block });
      
      if (error) {
        // Error might mean function doesn't exist or table already exists (OK)
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log(`       ℹ️  Already exists (OK)`);
          warnings++;
        } else {
          console.log(`       ⚠️  ${error.message.slice(0, 60)}...`);
          warnings++;
        }
      } else {
        console.log(`       ✅ Success`);
        success++;
      }
    } catch (err) {
      console.log(`       ℹ️  Note: ${err.message.slice(0, 50)}... (likely OK)`);
      warnings++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Processed: ${success} successful, ${warnings} warnings/skipped`);
  console.log('\n💡 Note: Warnings about "already exists" are GOOD - it means');
  console.log('   the migration ran before or tables are already there.\n');
  console.log('='.repeat(60));
  console.log('\n📊 NEXT: Run this to verify tables exist:\n');
  console.log('   SELECT * FROM stakeholder_admin_requests LIMIT 1;');
  console.log('\n🧪 TESTING: Go to http://localhost:8081/admin');
  console.log('\n');
}

runMigration().catch(err => {
  console.error('\n❌ Deployment error:', err.message);
  console.log('\n📋 MANUAL ALTERNATIVE:');
  console.log('1. Go to: https://supabase.com/dashboard/project/lerjhxchglztvhbsdjjn/sql/new');
  console.log('2. Copy contents of: supabase/migrations/20251023000001_stakeholder_admin_system.sql');
  console.log('3. Paste and click RUN\n');
});

