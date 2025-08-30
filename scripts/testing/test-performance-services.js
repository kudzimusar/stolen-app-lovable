#!/usr/bin/env node

import { config } from 'dotenv';
import cacheManager from './src/lib/redis.js';
import performanceMonitor from './src/lib/performance-monitoring.js';
import searchService from './src/lib/search-optimization.js';
import apiService from './src/lib/api-optimization.js';
import backgroundJobs from './src/lib/background-jobs.js';
import imageService from './src/lib/image-optimization.js';

// Load environment variables
config();

console.log('🧪 Testing Performance Optimization Services');
console.log('============================================\n');

const testResults = {
  redis: false,
  performance: false,
  search: false,
  api: false,
  background: false,
  image: false
};

async function testRedis() {
  console.log('🔴 Testing Redis Cache...');
  try {
    // Test cache operations
    await cacheManager.set('test:key', { message: 'Hello Redis!' }, 60);
    const cached = await cacheManager.get('test:key');
    
    if (cached && cached.message === 'Hello Redis!') {
      console.log('✅ Redis cache working');
      testResults.redis = true;
    } else {
      console.log('❌ Redis cache test failed');
    }
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
  }
}

async function testPerformanceMonitoring() {
  console.log('\n📊 Testing Performance Monitoring...');
  try {
    // Test performance tracking
    performanceMonitor.trackApiCall('/test/endpoint', 150, 200);
    performanceMonitor.trackComponentRender('TestComponent', 50);
    performanceMonitor.trackUserInteraction('button_click', 100);
    
    const stats = performanceMonitor.getAllStats();
    if (stats['api:/test/endpoint']) {
      console.log('✅ Performance monitoring working');
      testResults.performance = true;
    } else {
      console.log('❌ Performance monitoring test failed');
    }
  } catch (error) {
    console.log('❌ Performance monitoring failed:', error.message);
  }
}

async function testSearchOptimization() {
  console.log('\n🔍 Testing Search Optimization...');
  try {
    // Test search service initialization
    const suggestions = await searchService.getSuggestions('test', 'devices');
    console.log('✅ Search optimization working');
    testResults.search = true;
  } catch (error) {
    console.log('❌ Search optimization failed:', error.message);
  }
}

async function testApiOptimization() {
  console.log('\n⚡ Testing API Optimization...');
  try {
    // Test health check
    const health = await apiService.healthCheck();
    if (health.performance) {
      console.log('✅ API optimization working');
      testResults.api = true;
    } else {
      console.log('❌ API optimization test failed');
    }
  } catch (error) {
    console.log('❌ API optimization failed:', error.message);
  }
}

async function testBackgroundJobs() {
  console.log('\n⚙️ Testing Background Jobs...');
  try {
    // Test queue statistics
    const stats = await backgroundJobs.getQueueStats();
    if (stats) {
      console.log('✅ Background jobs working');
      testResults.background = true;
    } else {
      console.log('❌ Background jobs test failed');
    }
  } catch (error) {
    console.log('❌ Background jobs failed:', error.message);
  }
}

async function testImageOptimization() {
  console.log('\n🖼️ Testing Image Optimization...');
  try {
    // Test image service initialization
    const responsiveUrls = imageService.generateResponsiveUrls('test-image');
    if (responsiveUrls.thumbnail && responsiveUrls.large) {
      console.log('✅ Image optimization working');
      testResults.image = true;
    } else {
      console.log('❌ Image optimization test failed');
    }
  } catch (error) {
    console.log('❌ Image optimization failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting performance service tests...\n');
  
  await testRedis();
  await testPerformanceMonitoring();
  await testSearchOptimization();
  await testApiOptimization();
  await testBackgroundJobs();
  await testImageOptimization();
  
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
  } else {
    console.log('⚠️  Some services need configuration. Check the setup guides.');
  }
  
  // Recommendations
  console.log('\n📚 Next Steps:');
  if (!testResults.redis) {
    console.log('- Set up Redis: Follow REDIS_SETUP_GUIDE.md');
  }
  if (!testResults.performance) {
    console.log('- Set up Sentry: Follow SENTRY_SETUP_GUIDE.md');
  }
  if (!testResults.search) {
    console.log('- Set up Algolia: Follow ALGOLIA_SETUP_GUIDE.md');
  }
  if (!testResults.image) {
    console.log('- Set up Cloudinary: Follow CLOUDINARY_SETUP_GUIDE.md');
  }
  
  console.log('\n🔧 Environment Variables Check:');
  const requiredVars = [
    'REDIS_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'VITE_ALGOLIA_APP_ID',
    'VITE_SENTRY_DSN'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value && value !== 'your-value' ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
  });
}

// Run tests
runAllTests().catch(console.error);
