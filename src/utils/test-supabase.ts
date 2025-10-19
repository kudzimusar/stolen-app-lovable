// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Basic health check
    console.log('🧪 Test 1: Checking Supabase client initialization...');
    console.log('🧪 Supabase URL:', supabase.supabaseUrl);
    
    // Test 2: Try to get session (should be fast even if no session)
    console.log('🧪 Test 2: Getting current session...');
    const startTime = Date.now();
    const { data: sessionData, error: sessionError } = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      )
    ]);
    const sessionTime = Date.now() - startTime;
    console.log(`🧪 Session check completed in ${sessionTime}ms`, { 
      hasSession: !!sessionData?.session, 
      error: sessionError 
    });
    
    // Test 3: Try a simple query
    console.log('🧪 Test 3: Testing database query...');
    const queryStart = Date.now();
    const { data: testData, error: testError } = await Promise.race([
      supabase.from('users').select('count').limit(1).single(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ]).catch(err => ({ data: null, error: err }));
    const queryTime = Date.now() - queryStart;
    console.log(`🧪 Query completed in ${queryTime}ms`, { 
      hasData: !!testData, 
      error: testError?.message || testError 
    });
    
    console.log('✅ Supabase connection test completed');
    return {
      success: true,
      sessionTime,
      queryTime,
      hasSession: !!sessionData?.session
    };
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Auto-run on import in development
if (import.meta.env.DEV) {
  console.log('🚀 Auto-running Supabase connection test...');
  testSupabaseConnection().then(result => {
    console.log('🧪 Test result:', result);
  });
}




