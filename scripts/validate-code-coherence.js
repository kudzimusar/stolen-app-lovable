#!/usr/bin/env node

/**
 * STOLEN Platform - Code Coherence Validation Script
 * 
 * This script validates code coherence across the STOLEN platform by checking:
 * 1. Pattern Consistency - Same patterns used throughout
 * 2. Quality Consistency - Same quality standards maintained
 * 3. Testing Consistency - Same testing patterns applied
 * 4. Integration Safety - Changes don't break existing functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Code coherence validation rules
const COHERENCE_RULES = {
  patterns: {
    name: 'Pattern Consistency',
    weight: 25,
    description: 'Same coding patterns used throughout the codebase'
  },
  quality: {
    name: 'Quality Consistency',
    weight: 25,
    description: 'Same code quality standards maintained across all files'
  },
  testing: {
    name: 'Testing Consistency',
    weight: 25,
    description: 'Same testing patterns and coverage applied everywhere'
  },
  integration: {
    name: 'Integration Safety',
    weight: 25,
    description: 'Changes integrate safely without breaking existing functionality'
  }
};

// Expected patterns and standards
const EXPECTED_PATTERNS = {
  // React component patterns
  componentStructure: {
    imports: 'import statements at top',
    types: 'TypeScript interfaces defined',
    component: 'Functional component with proper typing',
    exports: 'Default export of component'
  },
  
  // API patterns
  apiStructure: {
    endpoint: 'Consistent endpoint naming',
    method: 'Proper HTTP method usage',
    validation: 'Input validation with Zod',
    response: 'Consistent response format',
    error: 'Proper error handling'
  },
  
  // Database patterns
  databaseStructure: {
    schema: 'Consistent schema patterns',
    queries: 'Consistent query patterns',
    migrations: 'Proper migration structure',
    types: 'TypeScript types for database'
  }
};

// Quality standards
const QUALITY_STANDARDS = {
  typescript: {
    strict: true,
    noAny: true,
    interfaces: true,
    types: true
  },
  errorHandling: {
    tryCatch: true,
    errorBoundaries: true,
    validation: true,
    logging: true
  },
  performance: {
    lazyLoading: true,
    memoization: true,
    optimization: true,
    bundleSize: true
  },
  security: {
    validation: true,
    sanitization: true,
    authentication: true,
    authorization: true
  }
};

// Testing standards
const TESTING_STANDARDS = {
  coverage: {
    minimum: 80,
    target: 90,
    excellence: 95
  },
  patterns: {
    describe: 'Consistent describe blocks',
    beforeEach: 'Proper setup in beforeEach',
    testCases: 'Comprehensive test cases',
    assertions: 'Consistent assertion patterns',
    cleanup: 'Proper cleanup in afterEach'
  },
  mocks: {
    consistency: true,
    data: true,
    services: true,
    apis: true
  }
};

function validateCodeCoherence() {
  console.log('🔍 STOLEN Platform - Code Coherence Validation\n');
  console.log('📋 Validating Code Coherence Across 4 Dimensions...\n');
  
  let totalScore = 0;
  let maxScore = 0;
  
  // Validate each coherence dimension
  const results = {};
  
  results.patterns = validatePatternConsistency();
  results.quality = validateQualityConsistency();
  results.testing = validateTestingConsistency();
  results.integration = validateIntegrationSafety();
  
  // Calculate overall score
  for (const [dimension, result] of Object.entries(results)) {
    const weight = COHERENCE_RULES[dimension].weight;
    totalScore += result.score * (weight / 100);
    maxScore += weight;
  }
  
  const overallScore = Math.round((totalScore / maxScore) * 100);
  
  // Display results
  console.log('\n📊 Code Coherence Validation Results:');
  console.log('=====================================');
  
  for (const [dimension, result] of Object.entries(results)) {
    const ruleInfo = COHERENCE_RULES[dimension];
    const status = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
    console.log(`${status} ${ruleInfo.name}: ${result.score}% (${ruleInfo.weight}% weight)`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  }
  
  console.log('\n🎯 Overall Code Coherence Score:');
  console.log('===============================');
  
  if (overallScore >= 95) {
    console.log(`🏆 EXCELLENCE: ${overallScore}% - Outstanding code coherence!`);
  } else if (overallScore >= 90) {
    console.log(`✅ EXCELLENT: ${overallScore}% - Great code coherence!`);
  } else if (overallScore >= 80) {
    console.log(`✅ GOOD: ${overallScore}% - Acceptable code coherence`);
  } else if (overallScore >= 70) {
    console.log(`⚠️ FAIR: ${overallScore}% - Needs improvement`);
  } else {
    console.log(`❌ POOR: ${overallScore}% - Code coherence violations detected`);
  }
  
  console.log(`\nTarget: 90% | Minimum: 80% | Excellence: 95%`);
  
  if (overallScore < 80) {
    console.log('\n❌ Code coherence below minimum threshold. Please address issues.');
    process.exit(1);
  } else {
    console.log('\n🎉 Code coherence validation passed!');
  }
}

function validatePatternConsistency() {
  console.log('🔧 Validating Pattern Consistency...');
  
  let score = 100;
  const issues = [];
  
  // Check React component patterns
  const componentFiles = findFiles('src', '.tsx');
  let consistentComponents = 0;
  
  for (const file of componentFiles.slice(0, 10)) { // Sample first 10 components
    const content = fs.readFileSync(file, 'utf8');
    if (isConsistentComponent(content)) {
      consistentComponents++;
    }
  }
  
  const componentConsistency = (consistentComponents / Math.min(componentFiles.length, 10)) * 100;
  if (componentConsistency < 80) {
    score -= 30;
    issues.push(`Component pattern consistency: ${componentConsistency.toFixed(1)}% (target: 80%)`);
  }
  
  // Check API patterns
  const apiFiles = findFiles('supabase/functions', '.ts');
  let consistentAPIs = 0;
  
  for (const file of apiFiles.slice(0, 5)) { // Sample first 5 APIs
    const content = fs.readFileSync(file, 'utf8');
    if (isConsistentAPI(content)) {
      consistentAPIs++;
    }
  }
  
  const apiConsistency = apiFiles.length > 0 ? (consistentAPIs / Math.min(apiFiles.length, 5)) * 100 : 100;
  if (apiConsistency < 80) {
    score -= 25;
    issues.push(`API pattern consistency: ${apiConsistency.toFixed(1)}% (target: 80%)`);
  }
  
  // Check file organization patterns
  const srcFiles = findFiles('src', '.tsx');
  const organizedFiles = srcFiles.filter(file => isOrganizedFile(file));
  const organizationConsistency = (organizedFiles.length / srcFiles.length) * 100;
  
  if (organizationConsistency < 90) {
    score -= 20;
    issues.push(`File organization consistency: ${organizationConsistency.toFixed(1)}% (target: 90%)`);
  }
  
  // Check import patterns
  const importConsistency = checkImportPatterns(srcFiles.slice(0, 10));
  if (importConsistency < 80) {
    score -= 25;
    issues.push(`Import pattern consistency: ${importConsistency.toFixed(1)}% (target: 80%)`);
  }
  
  return { score: Math.max(0, score), issues };
}

function validateQualityConsistency() {
  console.log('⭐ Validating Quality Consistency...');
  
  let score = 100;
  const issues = [];
  
  // Check TypeScript usage
  const tsFiles = findFiles('src', '.tsx');
  const tsxFiles = findFiles('src', '.ts');
  const allTSFiles = [...tsFiles, ...tsxFiles];
  
  let strictTypeScript = 0;
  for (const file of allTSFiles.slice(0, 15)) {
    const content = fs.readFileSync(file, 'utf8');
    if (isStrictTypeScript(content)) {
      strictTypeScript++;
    }
  }
  
  const tsConsistency = (strictTypeScript / Math.min(allTSFiles.length, 15)) * 100;
  if (tsConsistency < 90) {
    score -= 30;
    issues.push(`TypeScript strict usage: ${tsConsistency.toFixed(1)}% (target: 90%)`);
  }
  
  // Check error handling patterns
  let errorHandling = 0;
  for (const file of allTSFiles.slice(0, 15)) {
    const content = fs.readFileSync(file, 'utf8');
    if (hasErrorHandling(content)) {
      errorHandling++;
    }
  }
  
  const errorHandlingConsistency = (errorHandling / Math.min(allTSFiles.length, 15)) * 100;
  if (errorHandlingConsistency < 80) {
    score -= 25;
    issues.push(`Error handling consistency: ${errorHandlingConsistency.toFixed(1)}% (target: 80%)`);
  }
  
  // Check validation patterns
  let validation = 0;
  for (const file of allTSFiles.slice(0, 15)) {
    const content = fs.readFileSync(file, 'utf8');
    if (hasValidation(content)) {
      validation++;
    }
  }
  
  const validationConsistency = (validation / Math.min(allTSFiles.length, 15)) * 100;
  if (validationConsistency < 70) {
    score -= 25;
    issues.push(`Validation consistency: ${validationConsistency.toFixed(1)}% (target: 70%)`);
  }
  
  // Check security patterns
  let security = 0;
  for (const file of allTSFiles.slice(0, 15)) {
    const content = fs.readFileSync(file, 'utf8');
    if (hasSecurityPatterns(content)) {
      security++;
    }
  }
  
  const securityConsistency = (security / Math.min(allTSFiles.length, 15)) * 100;
  if (securityConsistency < 60) {
    score -= 20;
    issues.push(`Security pattern consistency: ${securityConsistency.toFixed(1)}% (target: 60%)`);
  }
  
  return { score: Math.max(0, score), issues };
}

function validateTestingConsistency() {
  console.log('🧪 Validating Testing Consistency...');
  
  let score = 100;
  const issues = [];
  
  // Check test file existence
  const testFiles = findFiles('src', '.test.tsx');
  const testFilesTS = findFiles('src', '.test.ts');
  const allTestFiles = [...testFiles, ...testFilesTS];
  
  const componentFiles = findFiles('src', '.tsx');
  const testCoverage = (allTestFiles.length / componentFiles.length) * 100;
  
  if (testCoverage < 80) {
    score -= 40;
    issues.push(`Test coverage: ${testCoverage.toFixed(1)}% (target: 80%)`);
  }
  
  // Check test pattern consistency
  let consistentTests = 0;
  for (const file of allTestFiles.slice(0, 10)) {
    const content = fs.readFileSync(file, 'utf8');
    if (isConsistentTest(content)) {
      consistentTests++;
    }
  }
  
  const testPatternConsistency = allTestFiles.length > 0 ? 
    (consistentTests / Math.min(allTestFiles.length, 10)) * 100 : 100;
  
  if (testPatternConsistency < 80) {
    score -= 30;
    issues.push(`Test pattern consistency: ${testPatternConsistency.toFixed(1)}% (target: 80%)`);
  }
  
  // Check mock consistency
  let consistentMocks = 0;
  for (const file of allTestFiles.slice(0, 10)) {
    const content = fs.readFileSync(file, 'utf8');
    if (hasConsistentMocks(content)) {
      consistentMocks++;
    }
  }
  
  const mockConsistency = allTestFiles.length > 0 ? 
    (consistentMocks / Math.min(allTestFiles.length, 10)) * 100 : 100;
  
  if (mockConsistency < 70) {
    score -= 30;
    issues.push(`Mock consistency: ${mockConsistency.toFixed(1)}% (target: 70%)`);
  }
  
  return { score: Math.max(0, score), issues };
}

function validateIntegrationSafety() {
  console.log('🔗 Validating Integration Safety...');
  
  let score = 100;
  const issues = [];
  
  // Check for build success (simulate by checking for common build issues)
  const buildIssues = checkBuildIssues();
  if (buildIssues > 0) {
    score -= 30;
    issues.push(`Build issues detected: ${buildIssues} potential problems`);
  }
  
  // Check for import/export consistency
  const importIssues = checkImportExportConsistency();
  if (importIssues > 0) {
    score -= 25;
    issues.push(`Import/export issues: ${importIssues} inconsistencies`);
  }
  
  // Check for API endpoint consistency
  const apiIssues = checkAPIEndpointConsistency();
  if (apiIssues > 0) {
    score -= 25;
    issues.push(`API endpoint issues: ${apiIssues} inconsistencies`);
  }
  
  // Check for database schema consistency
  const dbIssues = checkDatabaseConsistency();
  if (dbIssues > 0) {
    score -= 20;
    issues.push(`Database schema issues: ${dbIssues} inconsistencies`);
  }
  
  return { score: Math.max(0, score), issues };
}

// Helper functions
function findFiles(dir, extension) {
  const files = [];
  try {
    const items = fs.readdirSync(path.join(projectRoot, dir));
    for (const item of items) {
      const fullPath = path.join(projectRoot, dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...findFiles(path.join(dir, item), extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

function isConsistentComponent(content) {
  return (
    content.includes('import React') &&
    content.includes('interface') &&
    content.includes('export default') &&
    content.includes('const ') &&
    content.includes('return (')
  );
}

function isConsistentAPI(content) {
  return (
    content.includes('export') &&
    (content.includes('POST') || content.includes('GET') || content.includes('PUT') || content.includes('DELETE')) &&
    content.includes('try') &&
    content.includes('catch')
  );
}

function isOrganizedFile(filePath) {
  const fileName = path.basename(filePath);
  return (
    fileName.includes('Dashboard') ||
    fileName.includes('Component') ||
    fileName.includes('Page') ||
    fileName.includes('Service') ||
    fileName.includes('Utils')
  );
}

function checkImportPatterns(files) {
  let consistentImports = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const importLines = lines.filter(line => line.trim().startsWith('import'));
    
    if (importLines.length > 0) {
      // Check if imports are organized (React first, then third-party, then local)
      const hasReactImport = importLines.some(line => line.includes('react'));
      const hasThirdPartyImport = importLines.some(line => 
        line.includes('@') || line.includes('lodash') || line.includes('axios')
      );
      
      if (hasReactImport || hasThirdPartyImport) {
        consistentImports++;
      }
    }
  }
  return (consistentImports / files.length) * 100;
}

function isStrictTypeScript(content) {
  return (
    !content.includes(': any') &&
    content.includes('interface') &&
    content.includes('type ') &&
    content.includes('const ')
  );
}

function hasErrorHandling(content) {
  return (
    content.includes('try') ||
    content.includes('catch') ||
    content.includes('ErrorBoundary') ||
    content.includes('error')
  );
}

function hasValidation(content) {
  return (
    content.includes('zod') ||
    content.includes('validate') ||
    content.includes('schema') ||
    content.includes('required')
  );
}

function hasSecurityPatterns(content) {
  return (
    content.includes('auth') ||
    content.includes('token') ||
    content.includes('permission') ||
    content.includes('role')
  );
}

function isConsistentTest(content) {
  return (
    content.includes('describe(') &&
    content.includes('it(') &&
    content.includes('expect(') &&
    content.includes('render(')
  );
}

function hasConsistentMocks(content) {
  return (
    content.includes('mock') ||
    content.includes('jest.fn') ||
    content.includes('vi.fn') ||
    content.includes('Mock')
  );
}

function checkBuildIssues() {
  let issues = 0;
  
  // Check for common build issues
  const srcFiles = findFiles('src', '.tsx');
  for (const file of srcFiles.slice(0, 10)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for missing imports
    if (content.includes('useState') && !content.includes('import { useState }')) {
      issues++;
    }
    
    // Check for undefined variables
    if (content.includes('undefined') && !content.includes('//')) {
      issues++;
    }
  }
  
  return issues;
}

function checkImportExportConsistency() {
  let issues = 0;
  
  const srcFiles = findFiles('src', '.tsx');
  for (const file of srcFiles.slice(0, 10)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for unused imports
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    const usedImports = importLines.filter(importLine => {
      const importName = importLine.match(/import\s+.*?\s+from/)?.[0];
      return importName && content.includes(importName.split(' ')[1]);
    });
    
    if (importLines.length > usedImports.length + 2) {
      issues++;
    }
  }
  
  return issues;
}

function checkAPIEndpointConsistency() {
  let issues = 0;
  
  const apiFiles = findFiles('supabase/functions', '.ts');
  for (const file of apiFiles.slice(0, 5)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for consistent error handling
    if (content.includes('throw') && !content.includes('try')) {
      issues++;
    }
    
    // Check for consistent response format
    if (content.includes('return') && !content.includes('status')) {
      issues++;
    }
  }
  
  return issues;
}

function checkDatabaseConsistency() {
  let issues = 0;
  
  // Check migration files
  const migrationFiles = findFiles('supabase/migrations', '.sql');
  for (const file of migrationFiles.slice(0, 3)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for consistent table naming
    if (content.includes('CREATE TABLE') && !content.includes('_')) {
      issues++;
    }
    
    // Check for consistent column naming
    if (content.includes('id') && !content.includes('created_at')) {
      issues++;
    }
  }
  
  return issues;
}

// Run validation
validateCodeCoherence();
