#!/usr/bin/env node

/**
 * STAKEHOLDER EDGE FUNCTIONS VERIFICATION SCRIPT
 * Checks if edge functions are deployed and functional
 */

import https from 'https';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lerjhxchglztvhbsdjjn.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  plain: (msg) => console.log(msg),
};

// Edge functions to verify
const edgeFunctions = [
  {
    name: 'admin-stakeholders-list',
    endpoint: '/functions/v1/admin-stakeholders-list',
    testPayload: { action: 'get_stats' },
    description: 'List stakeholders and get statistics',
  },
  {
    name: 'admin-stakeholders-update',
    endpoint: '/functions/v1/admin-stakeholders-update',
    testPayload: null, // Will skip actual test (needs valid user_id)
    description: 'Update stakeholder status (approve/reject/suspend)',
  },
];

/**
 * Check if edge function is deployed (basic connectivity test)
 */
async function checkEdgeFunctionDeployed(func) {
  return new Promise((resolve) => {
    const url = new URL(func.endpoint, SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost',
      },
    };

    const req = https.request(options, (res) => {
      resolve({
        deployed: res.statusCode === 200 || res.statusCode === 204,
        statusCode: res.statusCode,
        headers: res.headers,
      });
    });

    req.on('error', (error) => {
      resolve({
        deployed: false,
        error: error.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        deployed: false,
        error: 'Timeout',
      });
    });

    req.end();
  });
}

/**
 * Test edge function with actual request (if test payload provided)
 */
async function testEdgeFunction(func, authToken) {
  if (!func.testPayload) {
    return { skipped: true, reason: 'No test payload (requires specific data)' };
  }

  return new Promise((resolve) => {
    const url = new URL(func.endpoint, SUPABASE_URL);
    const payload = JSON.stringify(func.testPayload);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${authToken || SUPABASE_ANON_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            success: res.statusCode === 200 || res.statusCode === 403, // 403 is expected without proper auth
            statusCode: res.statusCode,
            response: response,
          });
        } catch (error) {
          resolve({
            success: false,
            error: 'Failed to parse response',
            rawData: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
      });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Main verification function
 */
async function verifyStakeholderEdgeFunctions() {
  log.header();
  log.title('STAKEHOLDER EDGE FUNCTIONS VERIFICATION');
  log.header();
  log.plain('');

  if (!SUPABASE_ANON_KEY) {
    log.warning('VITE_SUPABASE_ANON_KEY not found in environment');
    log.info('Some tests will be limited without authentication');
    log.plain('');
  }

  log.info(`Supabase URL: ${SUPABASE_URL}`);
  log.plain('');

  const results = {
    totalFunctions: edgeFunctions.length,
    deployed: 0,
    notDeployed: 0,
    tested: 0,
    testsPassed: 0,
    testsFailed: 0,
  };

  // Check each edge function
  for (const func of edgeFunctions) {
    log.header();
    log.title(`CHECKING: ${func.name}`);
    log.header();
    log.info(`Description: ${func.description}`);
    log.info(`Endpoint: ${func.endpoint}`);
    log.plain('');

    // Step 1: Check deployment
    log.info('Step 1: Checking deployment status...');
    const deployStatus = await checkEdgeFunctionDeployed(func);

    if (deployStatus.deployed) {
      log.success(`Edge function is deployed and responding`);
      log.info(`Status Code: ${deployStatus.statusCode}`);
      results.deployed++;
    } else {
      log.error(`Edge function is NOT deployed or not responding`);
      if (deployStatus.error) {
        log.error(`Error: ${deployStatus.error}`);
      }
      results.notDeployed++;
      log.plain('');
      continue;
    }

    log.plain('');

    // Step 2: Test functionality (if applicable)
    if (func.testPayload) {
      log.info('Step 2: Testing functionality...');
      const testResult = await testEdgeFunction(func, SUPABASE_ANON_KEY);
      results.tested++;

      if (testResult.skipped) {
        log.warning(`Test skipped: ${testResult.reason}`);
      } else if (testResult.success) {
        if (testResult.statusCode === 403) {
          log.warning('Received 403 (expected without admin auth)');
          log.success('Function is responding correctly to requests');
          results.testsPassed++;
        } else {
          log.success('Function test passed');
          log.info(`Status Code: ${testResult.statusCode}`);
          if (testResult.response) {
            log.info(`Response: ${JSON.stringify(testResult.response).substring(0, 100)}...`);
          }
          results.testsPassed++;
        }
      } else {
        log.error('Function test failed');
        if (testResult.error) {
          log.error(`Error: ${testResult.error}`);
        }
        if (testResult.rawData) {
          log.error(`Raw data: ${testResult.rawData.substring(0, 200)}`);
        }
        results.testsFailed++;
      }
    } else {
      log.warning('Step 2: Skipped (requires specific test data)');
      log.info('Manual testing recommended with valid user_id and admin auth');
    }

    log.plain('');
  }

  // Final Summary
  log.header();
  log.title('VERIFICATION SUMMARY');
  log.header();
  log.plain('');

  log.info(`Total Edge Functions: ${results.totalFunctions}`);
  log.success(`Deployed: ${results.deployed}`);
  
  if (results.notDeployed > 0) {
    log.error(`Not Deployed: ${results.notDeployed}`);
  }

  if (results.tested > 0) {
    log.plain('');
    log.info(`Tests Run: ${results.tested}`);
    log.success(`Tests Passed: ${results.testsPassed}`);
    if (results.testsFailed > 0) {
      log.error(`Tests Failed: ${results.testsFailed}`);
    }
  }

  log.plain('');

  // Overall Status
  if (results.deployed === results.totalFunctions) {
    log.success('✅ ALL EDGE FUNCTIONS ARE DEPLOYED');
  } else {
    log.error('⚠️  SOME EDGE FUNCTIONS ARE MISSING');
  }

  log.plain('');
  log.header();
  log.title('NEXT STEPS');
  log.header();
  log.plain('');

  if (results.notDeployed > 0) {
    log.warning('TO DEPLOY MISSING FUNCTIONS:');
    log.plain('');
    log.plain('  cd supabase');
    log.plain('  supabase functions deploy admin-stakeholders-list');
    log.plain('  supabase functions deploy admin-stakeholders-update');
    log.plain('');
  }

  log.info('TO LIST ALL DEPLOYED FUNCTIONS:');
  log.plain('');
  log.plain('  supabase functions list');
  log.plain('');

  log.info('TO TEST WITH REAL ADMIN CREDENTIALS:');
  log.plain('');
  log.plain('  1. Login to the admin dashboard at: http://localhost:8080/admin/dashboard');
  log.plain('  2. Navigate to the "Stakeholders" tab');
  log.plain('  3. Check browser console for API requests');
  log.plain('  4. Verify data loads and actions work');
  log.plain('');

  log.header();
  log.plain('');

  // Exit code
  process.exit(results.notDeployed > 0 ? 1 : 0);
}

// Run verification
verifyStakeholderEdgeFunctions().catch((error) => {
  log.error('Verification script failed:');
  log.error(error.message);
  process.exit(1);
});

