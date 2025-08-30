#!/usr/bin/env node

import { config } from 'dotenv';
import { createClient } from 'redis';

// Load environment variables
config();

console.log('🧪 Testing Performance Optimization Services');
console.log('============================================\n');

const testResults = {
  redis: false,
  env: false,
  services: false
};

async function testEnvironmentVariables() {
  console.log('🔧 Testing Environment Variables...');
  
  const requiredVars = [
    'REDIS_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'VITE_ALGOLIA_APP_ID',
    'VITE_SENTRY_DSN'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'your-value' && !value.includes('your-')) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing or placeholder`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('✅ All environment variables are configured');
    testResults.env = true;
  } else {
    console.log('❌ Some environment variables need to be configured');
  }
}

async function testRedis() {
  console.log('\n🔴 Testing Redis Cache...');
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = createClient({
      url: redisUrl
    });

    await client.connect();
    
    // Test basic operations
    await client.set('test:key', 'Hello Redis!');
    const value = await client.get('test:key');
    
    if (value === 'Hello Redis!') {
      console.log('✅ Redis cache working');
      testResults.redis = true;
    } else {
      console.log('❌ Redis cache test failed');
    }
    
    await client.disconnect();
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
  }
}

async function testServices() {
  console.log('\n🔧 Testing Service Configurations...');
  
  // Test if all required packages are installed
  const packages = [
    'redis',
    'cloudinary',
    'algoliasearch',
    '@sentry/react',
    'bull'
  ];
  
  let allInstalled = true;
  
  for (const pkg of packages) {
    try {
      await import(pkg);
      console.log(`✅ ${pkg}: Installed`);
    } catch (error) {
      console.log(`❌ ${pkg}: Not installed`);
      allInstalled = false;
    }
  }
  
  if (allInstalled) {
    console.log('✅ All required packages are installed');
    testResults.services = true;
  } else {
    console.log('❌ Some packages need to be installed');
  }
}

async function runAllTests() {
  console.log('🚀 Starting performance service tests...\n');
  
  await testEnvironmentVariables();
  await testRedis();
  await testServices();
  
  // Summary
  console.log('\n📋 Test Results Summary');
  console.log('=======================');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;
  
  Object.entries(testResults).forEach(([service, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${service}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} services working`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All performance optimization services are working correctly!');
    console.log('\n🚀 Ready to integrate into your app components!');
  } else {
    console.log('⚠️  Some services need configuration. Check the setup guides.');
  }
  
  // Next steps
  console.log('\n📚 Next Steps:');
  if (!testResults.env) {
    console.log('- Configure environment variables in .env file');
  }
  if (!testResults.redis) {
    console.log('- Set up Redis: Follow REDIS_SETUP_GUIDE.md');
  }
  if (!testResults.services) {
    console.log('- Install missing packages: npm install [package-name]');
  }
  
  console.log('\n🔧 Integration Steps:');
  console.log('1. Import performance hooks in your components');
  console.log('2. Replace existing API calls with optimized versions');
  console.log('3. Add performance monitoring to key components');
  console.log('4. Test the optimizations in your app');
}

// Run tests
runAllTests().catch(console.error);
