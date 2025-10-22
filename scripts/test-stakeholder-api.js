#!/usr/bin/env node

/**
 * STAKEHOLDER API CONNECTION TEST SCRIPT
 * Tests the complete flow from frontend to edge functions to database
 */

import http from 'http';

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  header: () => console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  detail: (msg) => console.log(`${colors.magenta}   ${msg}${colors.reset}`),
  plain: (msg) => console.log(msg),
};

/**
 * Test API endpoint through Vite proxy
 */
async function testApiEndpoint(endpoint, method, payload) {
  return new Promise((resolve) => {
    const url = new URL(endpoint, FRONTEND_URL);
    const payloadStr = payload ? JSON.stringify(payload) : '';

    const options = {
      hostname: url.hostname,
      port: url.port || 8080,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (payloadStr) {
      options.headers['Content-Length'] = Buffer.byteLength(payloadStr);
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : {};
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            response: response,
            headers: res.headers,
          });
        } catch (error) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            error: 'Failed to parse response',
            rawData: data.substring(0, 500),
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
        error: 'Request timeout',
      });
    });

    if (payloadStr) {
      req.write(payloadStr);
    }
    req.end();
  });
}

/**
 * Check if Vite dev server is running
 */
async function checkDevServer() {
  return new Promise((resolve) => {
    const url = new URL('/', FRONTEND_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 8080,
      path: '/',
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      resolve({
        running: res.statusCode === 200,
        statusCode: res.statusCode,
      });
    });

    req.on('error', () => {
      resolve({ running: false });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ running: false });
    });

    req.end();
  });
}

/**
 * Main test function
 */
async function testStakeholderAPI() {
  log.header();
  log.title('STAKEHOLDER API CONNECTION TEST');
  log.header();
  log.plain('');

  log.info(`Testing API through: ${FRONTEND_URL}`);
  log.plain('');

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Step 1: Check if dev server is running
  log.header();
  log.title('STEP 1: CHECKING DEV SERVER');
  log.header();
  log.plain('');

  const serverStatus = await checkDevServer();
  
  if (!serverStatus.running) {
    log.error('Vite dev server is not running');
    log.plain('');
    log.warning('TO START THE DEV SERVER:');
    log.plain('');
    log.plain('  npm run dev');
    log.plain('  # or');
    log.plain('  npm start');
    log.plain('');
    log.header();
    process.exit(1);
  }

  log.success('Vite dev server is running');
  log.plain('');

  // Step 2: Test stakeholder list endpoint (get_stats)
  log.header();
  log.title('STEP 2: TESTING STAKEHOLDER LIST API (GET STATS)');
  log.header();
  log.plain('');

  results.totalTests++;
  log.info('Testing: POST /api/v1/admin/stakeholders');
  log.detail('Action: get_stats');
  log.plain('');

  const statsTest = await testApiEndpoint(
    '/api/v1/admin/stakeholders',
    'POST',
    { action: 'get_stats' }
  );

  if (statsTest.success) {
    log.success('API request successful');
    log.info(`Status Code: ${statsTest.statusCode}`);
    if (statsTest.response.stats) {
      log.success('Statistics retrieved successfully');
      log.detail(`Total Stakeholders: ${statsTest.response.stats.total_stakeholders || 0}`);
      log.detail(`Pending Approvals: ${statsTest.response.stats.pending_approvals || 0}`);
      log.detail(`Approved: ${statsTest.response.stats.approved_stakeholders || 0}`);
      results.passed++;
    } else if (statsTest.response.error) {
      log.warning('API responded but with error');
      log.detail(`Error: ${statsTest.response.error}`);
      results.warnings++;
    }
  } else {
    log.error('API request failed');
    if (statsTest.error) {
      log.error(`Error: ${statsTest.error}`);
    }
    if (statsTest.statusCode) {
      log.detail(`Status Code: ${statsTest.statusCode}`);
    }
    if (statsTest.rawData) {
      log.detail(`Response: ${statsTest.rawData}`);
    }
    results.failed++;
  }

  log.plain('');

  // Step 3: Test stakeholder list endpoint (list_stakeholders)
  log.header();
  log.title('STEP 3: TESTING STAKEHOLDER LIST API (LIST STAKEHOLDERS)');
  log.header();
  log.plain('');

  results.totalTests++;
  log.info('Testing: POST /api/v1/admin/stakeholders');
  log.detail('Action: list_stakeholders');
  log.detail('Parameters: stakeholder_type=all, status=all, limit=10');
  log.plain('');

  const listTest = await testApiEndpoint(
    '/api/v1/admin/stakeholders',
    'POST',
    {
      action: 'list_stakeholders',
      stakeholder_type: 'all',
      status: 'all',
      search: '',
      limit: 10,
      offset: 0,
    }
  );

  if (listTest.success) {
    log.success('API request successful');
    log.info(`Status Code: ${listTest.statusCode}`);
    if (listTest.response.stakeholders) {
      log.success('Stakeholder list retrieved successfully');
      log.detail(`Stakeholders returned: ${listTest.response.stakeholders.length}`);
      if (listTest.response.stakeholders.length > 0) {
        const first = listTest.response.stakeholders[0];
        log.detail(`Sample: ${first.business_name || first.display_name || 'N/A'} (${first.role})`);
      }
      results.passed++;
    } else if (listTest.response.error) {
      log.warning('API responded but with error');
      log.detail(`Error: ${listTest.response.error}`);
      results.warnings++;
    }
  } else {
    log.error('API request failed');
    if (listTest.error) {
      log.error(`Error: ${listTest.error}`);
    }
    if (listTest.statusCode) {
      log.detail(`Status Code: ${listTest.statusCode}`);
    }
    results.failed++;
  }

  log.plain('');

  // Step 4: Test vite proxy configuration
  log.header();
  log.title('STEP 4: CHECKING VITE PROXY CONFIGURATION');
  log.header();
  log.plain('');

  log.info('Reading vite.config.ts proxy settings...');
  log.plain('');

  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.default.dirname(__filename);
    const viteConfigPath = path.default.join(__dirname, '..', 'vite.config.ts');
    
    if (fs.default.existsSync(viteConfigPath)) {
      const viteConfig = fs.default.readFileSync(viteConfigPath, 'utf-8');
      
      const hasStakeholdersProxy = viteConfig.includes('/api/v1/admin/stakeholders');
      const hasUpdateProxy = viteConfig.includes('/api/v1/admin/stakeholders/update');
      
      if (hasStakeholdersProxy && hasUpdateProxy) {
        log.success('Vite proxy routes configured correctly');
        log.detail('✓ /api/v1/admin/stakeholders → admin-stakeholders-list');
        log.detail('✓ /api/v1/admin/stakeholders/update → admin-stakeholders-update');
        results.passed++;
      } else {
        log.warning('Proxy routes may be incomplete');
        if (!hasStakeholdersProxy) {
          log.error('Missing: /api/v1/admin/stakeholders proxy');
        }
        if (!hasUpdateProxy) {
          log.error('Missing: /api/v1/admin/stakeholders/update proxy');
        }
        results.warnings++;
      }
    } else {
      log.warning('vite.config.ts not found');
      results.warnings++;
    }
  } catch (error) {
    log.error(`Failed to read vite.config.ts: ${error.message}`);
    results.failed++;
  }

  log.plain('');

  // Final Summary
  log.header();
  log.title('TEST SUMMARY');
  log.header();
  log.plain('');

  log.info(`Total Tests: ${results.totalTests}`);
  log.success(`Passed: ${results.passed}`);
  
  if (results.warnings > 0) {
    log.warning(`Warnings: ${results.warnings}`);
  }
  
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed}`);
  }

  log.plain('');

  // Overall Status
  if (results.failed === 0 && results.warnings === 0) {
    log.success('✅ ALL API CONNECTIONS ARE WORKING');
  } else if (results.failed === 0) {
    log.warning('⚠️  API WORKING BUT WITH WARNINGS');
  } else {
    log.error('❌ SOME API CONNECTIONS FAILED');
  }

  log.plain('');
  log.header();
  log.title('TROUBLESHOOTING');
  log.header();
  log.plain('');

  if (results.failed > 0 || results.warnings > 0) {
    log.warning('COMMON ISSUES:');
    log.plain('');
    log.plain('  1. Edge functions not deployed:');
    log.plain('     → Deploy with: supabase functions deploy admin-stakeholders-list');
    log.plain('');
    log.plain('  2. Database functions missing:');
    log.plain('     → Run: database/sql/stakeholder-management-system.sql');
    log.plain('     → Run: database/sql/admin-stakeholders-view.sql');
    log.plain('');
    log.plain('  3. Authentication required:');
    log.plain('     → Login as admin at: http://localhost:8080/admin/dashboard');
    log.plain('     → Check admin_users table has your user with is_active=true');
    log.plain('');
    log.plain('  4. CORS or proxy issues:');
    log.plain('     → Restart Vite dev server: npm run dev');
    log.plain('     → Check browser console for detailed errors');
    log.plain('');
  }

  log.info('FOR MANUAL TESTING:');
  log.plain('');
  log.plain('  1. Open: http://localhost:8080/admin/dashboard');
  log.plain('  2. Click "Stakeholders" tab');
  log.plain('  3. Open browser DevTools (F12)');
  log.plain('  4. Check Network tab for API requests');
  log.plain('  5. Check Console for errors');
  log.plain('');

  log.header();
  log.plain('');

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
testStakeholderAPI().catch((error) => {
  log.error('Test script failed:');
  log.error(error.message);
  console.error(error.stack);
  process.exit(1);
});

