// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DirectSupabaseTest = () => {
  const [results, setResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { timestamp, message, data }]);
    console.log(`[${timestamp}] ${message}`, data);
  };

  const testDirectFetch = async () => {
    setTesting(true);
    setResults([]);
    
    addResult('🧪 Starting direct fetch test...');
    
    try {
      // Test 1: Direct fetch to Supabase settings endpoint
      addResult('Test 1: Fetching Supabase settings...');
      const settingsUrl = 'https://lerjhxchglztvhbsdjjn.supabase.co/auth/v1/settings';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(settingsUrl, {
        signal: controller.signal,
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs'
        }
      });
      
      clearTimeout(timeoutId);
      
      addResult(`✅ Response received: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const data = await response.json();
      addResult('📦 Response data:', data);
      
    } catch (error: any) {
      addResult('❌ Direct fetch failed:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
    }
    
    // Test 2: Import and test Supabase client
    try {
      addResult('Test 2: Testing Supabase client...');
      const { supabase } = await import('@/integrations/supabase/client');
      
      addResult('📝 Supabase client imported', {
        url: supabase.supabaseUrl,
        hasAuth: !!supabase.auth
      });
      
      // Try to get session with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      addResult('Calling supabase.auth.getSession()...');
      const sessionPromise = supabase.auth.getSession();
      
      const { data, error } = await Promise.race([
        sessionPromise,
        new Promise<never>((_, reject) => 
          setTimeout(() => {
            controller.abort();
            reject(new Error('getSession timeout after 5s'));
          }, 5000)
        )
      ]);
      
      clearTimeout(timeoutId);
      
      addResult('✅ getSession completed', { 
        hasData: !!data, 
        hasSession: !!data?.session,
        error: error?.message 
      });
      
    } catch (error: any) {
      addResult('❌ Supabase client test failed:', {
        name: error?.name,
        message: error?.message
      });
    }
    
    setTesting(false);
    addResult('🏁 Test completed');
  };

  useEffect(() => {
    // Auto-run test on mount
    testDirectFetch();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Direct Supabase Connection Test</h1>
          
          <Button 
            onClick={testDirectFetch} 
            disabled={testing}
            className="mb-4"
          >
            {testing ? 'Testing...' : 'Run Test Again'}
          </Button>
          
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, i) => (
              <div key={i} className="border-b border-gray-700 pb-2">
                <div className="text-gray-400">[{result.timestamp}]</div>
                <div className="font-semibold">{result.message}</div>
                {result.data && (
                  <pre className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2">What to check:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Does the direct fetch work?</li>
            <li>What's the response status?</li>
            <li>Does getSession timeout?</li>
            <li>Check browser Network tab for actual requests</li>
            <li>Check browser Console for CORS errors</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default DirectSupabaseTest;



