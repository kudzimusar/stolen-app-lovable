import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials
const SUPABASE_PROJECT_REF = 'lerjhxchglztvhbsdjjn';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz576dB30B2lcazoWhAuK-XRRdYAIxBI_qesIs';

// Function to deploy a single function
async function deployFunction(functionName) {
  const functionPath = path.join(__dirname, 'supabase', 'functions', functionName, 'index.ts');
  
  if (!fs.existsSync(functionPath)) {
    console.error(`❌ Function ${functionName} not found at ${functionPath}`);
    return false;
  }

  const functionCode = fs.readFileSync(functionPath, 'utf8');
  
  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/functions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: functionName,
        body: functionCode,
        verify_jwt: false
      })
    });

    if (response.ok) {
      console.log(`✅ Successfully deployed ${functionName}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to deploy ${functionName}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deploying ${functionName}:`, error.message);
    return false;
  }
}

// Deploy all admin functions
async function deployAdminFunctions() {
  const adminFunctions = [
    'admin-check',
    'admin-onboard', 
    'admin-roles',
    'admin-users'
  ];

  console.log('🚀 Starting deployment of admin functions...');
  
  for (const func of adminFunctions) {
    await deployFunction(func);
  }
  
  console.log('🎉 Admin functions deployment completed!');
}

// Run deployment
deployAdminFunctions().catch(console.error);
