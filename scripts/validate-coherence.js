#!/usr/bin/env node

/**
 * STOLEN Platform Coherence Validation Script
 * 
 * This script validates coherence across the STOLEN platform using the 5 core rules:
 * 1. Mission Alignment Rule
 * 2. Stakeholder Equality Rule  
 * 3. Technical Consistency Rule
 * 4. South African Focus Rule
 * 5. S-Pay Integration Rule
 */

import fs from 'fs';
import path from 'path';

// Core documentation files
const CORE_DOCS = {
  plan: 'docs/analysis/PLAN.md',
  product: 'docs/analysis/STOLEN_APP_PRODUCT_DESCRIPTION.md',
  tech: 'TECHNICAL_DOCUMENTATION/PROJECT_TECH_PACK_SUMMARY.md',
  coherence: 'docs/STOLEN_COHERENCE_DEFINITION.md',
  rules: 'docs/STOLEN_COHERENCE_RULES.md'
};

// Coherence validation rules
const COHERENCE_RULES = {
  mission: {
    name: 'Mission Alignment Rule',
    weight: 20,
    description: 'Every feature must serve device recovery mission or stakeholder functionality'
  },
  stakeholders: {
    name: 'Stakeholder Equality Rule', 
    weight: 20,
    description: 'All 8 stakeholder types must receive equal attention',
    expected: 8
  },
  technical: {
    name: 'Technical Consistency Rule',
    weight: 20, 
    description: 'All technical decisions must maintain consistency with established tech stack'
  },
  localization: {
    name: 'South African Focus Rule',
    weight: 20,
    description: 'All features must be optimized for South African market'
  },
  spay: {
    name: 'S-Pay Integration Rule',
    weight: 20,
    description: 'All financial features must integrate with S-Pay wallet system'
  }
};

// Technology stack requirements
const TECH_STACK = {
  frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Radix UI'],
  backend: ['Supabase', 'PostgreSQL', 'Edge Functions'],
  payment: ['S-Pay', 'Stripe'],
  ai: ['OpenAI', 'Google Gemini'],
  blockchain: ['Ethereum', 'Polygon'],
  mobile: ['PWA', 'Progressive Web App']
};

// Stakeholder types
const STAKEHOLDERS = [
  'Individual Users',
  'Repair Shops', 
  'Retailers',
  'Law Enforcement',
  'NGO Partners',
  'Insurance Admin',
  'Banks/Payment Gateways',
  'Platform Administrators'
];

function validateCoherence() {
  console.log('🔍 STOLEN Platform Coherence Validation\n');
  console.log('📋 Validating against 5 Core Coherence Rules...\n');
  
  let totalScore = 0;
  let maxScore = 0;
  
  // Check if core documentation exists
  console.log('📚 Checking Core Documentation...');
  let docsValid = true;
  for (const [key, filePath] of Object.entries(CORE_DOCS)) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${key.toUpperCase()}: ${filePath}`);
    } else {
      console.log(`❌ ${key.toUpperCase()}: ${filePath} - MISSING`);
      docsValid = false;
    }
  }
  
  if (!docsValid) {
    console.log('\n❌ Core documentation missing. Cannot proceed with validation.');
    process.exit(1);
  }
  
  console.log('\n🎯 Running Coherence Rule Validation...\n');
  
  // Validate each coherence rule
  const results = {};
  
  results.mission = validateMissionAlignment();
  results.stakeholders = validateStakeholderEquality();
  results.technical = validateTechnicalConsistency();
  results.localization = validateSouthAfricanFocus();
  results.spay = validateSPayIntegration();
  
  // Calculate overall score
  for (const [rule, result] of Object.entries(results)) {
    const weight = COHERENCE_RULES[rule].weight;
    totalScore += result.score * (weight / 100);
    maxScore += weight;
  }
  
  const overallScore = Math.round((totalScore / maxScore) * 100);
  
  // Display results
  console.log('\n📊 Coherence Validation Results:');
  console.log('=====================================');
  
  for (const [rule, result] of Object.entries(results)) {
    const ruleInfo = COHERENCE_RULES[rule];
    const status = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
    console.log(`${status} ${ruleInfo.name}: ${result.score}% (${ruleInfo.weight}% weight)`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  }
  
  console.log('\n🎯 Overall Coherence Score:');
  console.log('============================');
  
  if (overallScore >= 95) {
    console.log(`🏆 EXCELLENCE: ${overallScore}% - Outstanding coherence!`);
  } else if (overallScore >= 90) {
    console.log(`✅ EXCELLENT: ${overallScore}% - Great coherence!`);
  } else if (overallScore >= 80) {
    console.log(`✅ GOOD: ${overallScore}% - Acceptable coherence`);
  } else if (overallScore >= 70) {
    console.log(`⚠️ FAIR: ${overallScore}% - Needs improvement`);
  } else {
    console.log(`❌ POOR: ${overallScore}% - Coherence violations detected`);
  }
  
  console.log(`\nTarget: 90% | Minimum: 80% | Excellence: 95%`);
  
  if (overallScore < 80) {
    console.log('\n❌ Coherence below minimum threshold. Please address issues.');
    process.exit(1);
  } else {
    console.log('\n🎉 Coherence validation passed!');
  }
}

function validateMissionAlignment() {
  console.log('🎯 Validating Mission Alignment Rule...');
  
  let score = 100;
  const issues = [];
  
  // Check if core documentation mentions device recovery mission
  const productDesc = fs.readFileSync(CORE_DOCS.product, 'utf8');
  const plan = fs.readFileSync(CORE_DOCS.plan, 'utf8');
  
  if (!productDesc.includes('device recovery') && !productDesc.includes('device theft')) {
    score -= 30;
    issues.push('Device recovery mission not clearly defined in product description');
  }
  
  if (!productDesc.includes('marketplace') && !productDesc.includes('transaction')) {
    score -= 20;
    issues.push('Marketplace functionality not clearly defined');
  }
  
  if (!productDesc.includes('community') && !productDesc.includes('stakeholder')) {
    score -= 20;
    issues.push('Community-driven approach not clearly defined');
  }
  
  if (!plan.includes('Reverse Verification Tool')) {
    score -= 30;
    issues.push('Reverse Verification Tool not mentioned in strategic plan');
  }
  
  return { score: Math.max(0, score), issues };
}

function validateStakeholderEquality() {
  console.log('👥 Validating Stakeholder Equality Rule...');
  
  let score = 100;
  const issues = [];
  
  // Check if all 8 stakeholders are mentioned
  const productDesc = fs.readFileSync(CORE_DOCS.product, 'utf8');
  
  for (const stakeholder of STAKEHOLDERS) {
    if (!productDesc.includes(stakeholder)) {
      score -= 12.5; // 100/8 = 12.5 points per stakeholder
      issues.push(`Stakeholder "${stakeholder}" not mentioned in product description`);
    }
  }
  
  // Check stakeholder count
  const stakeholderCount = (productDesc.match(/stakeholder/gi) || []).length;
  if (stakeholderCount < 5) {
    score -= 20;
    issues.push('Insufficient stakeholder coverage in documentation');
  }
  
  return { score: Math.max(0, score), issues };
}

function validateTechnicalConsistency() {
  console.log('🔧 Validating Technical Consistency Rule...');
  
  let score = 100;
  const issues = [];
  
  const techDoc = fs.readFileSync(CORE_DOCS.tech, 'utf8');
  
  // Check for core technologies
  for (const [category, technologies] of Object.entries(TECH_STACK)) {
    for (const tech of technologies) {
      if (!techDoc.includes(tech)) {
        score -= 5;
        issues.push(`Technology "${tech}" not mentioned in tech documentation`);
      }
    }
  }
  
  // Check for React pages count
  if (!techDoc.includes('85+') && !techDoc.includes('85 ')) {
    score -= 10;
    issues.push('React pages count not specified in tech documentation');
  }
  
  // Check for API count
  if (!techDoc.includes('17+') && !techDoc.includes('17 ')) {
    score -= 10;
    issues.push('API endpoints count not specified in tech documentation');
  }
  
  return { score: Math.max(0, score), issues };
}

function validateSouthAfricanFocus() {
  console.log('🇿🇦 Validating South African Focus Rule...');
  
  let score = 100;
  const issues = [];
  
  const productDesc = fs.readFileSync(CORE_DOCS.product, 'utf8');
  const techDoc = fs.readFileSync(CORE_DOCS.tech, 'utf8');
  
  // Check for ZAR currency
  if (!productDesc.includes('ZAR') && !techDoc.includes('ZAR')) {
    score -= 30;
    issues.push('ZAR currency not mentioned in documentation');
  }
  
  // Check for FICA compliance
  if (!productDesc.includes('FICA') && !techDoc.includes('FICA')) {
    score -= 30;
    issues.push('FICA compliance not mentioned in documentation');
  }
  
  // Check for South African focus
  if (!productDesc.includes('South Africa') && !productDesc.includes('South African')) {
    score -= 20;
    issues.push('South African market focus not clearly defined');
  }
  
  // Check for local compliance
  if (!productDesc.includes('compliance') && !techDoc.includes('compliance')) {
    score -= 20;
    issues.push('Local compliance requirements not mentioned');
  }
  
  return { score: Math.max(0, score), issues };
}

function validateSPayIntegration() {
  console.log('💳 Validating S-Pay Integration Rule...');
  
  let score = 100;
  const issues = [];
  
  const productDesc = fs.readFileSync(CORE_DOCS.product, 'utf8');
  const techDoc = fs.readFileSync(CORE_DOCS.tech, 'utf8');
  
  // Check for S-Pay mentions
  if (!productDesc.includes('S-Pay') && !techDoc.includes('S-Pay')) {
    score -= 40;
    issues.push('S-Pay wallet system not mentioned in documentation');
  }
  
  // Check for escrow protection
  if (!productDesc.includes('escrow') && !techDoc.includes('escrow')) {
    score -= 30;
    issues.push('Escrow protection not mentioned in documentation');
  }
  
  // Check for fraud detection
  if (!productDesc.includes('fraud') && !techDoc.includes('fraud')) {
    score -= 20;
    issues.push('Fraud detection not mentioned in documentation');
  }
  
  // Check for payment processing
  if (!productDesc.includes('payment') && !techDoc.includes('payment')) {
    score -= 10;
    issues.push('Payment processing not mentioned in documentation');
  }
  
  return { score: Math.max(0, score), issues };
}

// Run validation
validateCoherence();
