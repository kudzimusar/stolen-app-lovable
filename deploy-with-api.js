// Deploy Supabase Edge Functions using Management API
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzMDI5MiwiZXhwIjoyMDY5MjA2MjkzfQ.0kKhU3+PGqhqz6kMm0U32v8f61u86Z81yDefXkpm1dCn5Np1v5aJXqUEu7lMtdV0AMEFdX4beVMYSxUZMf93Gg==';

async function deployFunction(functionName) {
  try {
    console.log(`🚀 Deploying function: ${functionName}`);
    
    // Read the function code
    const functionPath = path.join(process.cwd(), 'supabase', 'functions', functionName, 'index.ts');
    const functionCode = fs.readFileSync(functionPath, 'utf8');
    
    console.log(`📁 Function path: ${functionPath}`);
    console.log(`📄 Code length: ${functionCode.length} characters`);
    
    // Create the deployment payload
    const payload = {
      name: functionName,
      code: functionCode,
      verify_jwt: false,
      import_map: null
    };
    
    // Deploy using Supabase Management API
    const response = await fetch(`${SUPABASE_URL}/functions/v1/functions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Successfully deployed ${functionName}:`, result);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to deploy ${functionName}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deploying ${functionName}:`, error);
    return false;
  }
}

async function deployAllFunctions() {
  const functions = ['submit-claim'];
  
  console.log('🚀 Starting deployment of Supabase Edge Functions...');
  
  for (const func of functions) {
    const success = await deployFunction(func);
    if (success) {
      console.log(`✅ ${func} deployed successfully`);
    } else {
      console.log(`❌ ${func} deployment failed`);
    }
    console.log('---');
  }
  
  console.log('🎉 Deployment process completed!');
}

// Run the deployment
deployAllFunctions().catch(console.error);
