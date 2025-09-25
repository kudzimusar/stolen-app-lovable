#!/usr/bin/env node

/**
 * STOLEN Platform - Simple Coherence Enforcer Tool
 * 
 * This is a basic version that demonstrates the core concept:
 * - Analyzes code changes for stakeholder impact
 * - Maps dependencies across the 8 stakeholder types
 * - Predicts integration effects
 * - Provides actionable feedback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// STOLEN Platform Stakeholder Types (from PLAN.md)
const STAKEHOLDER_TYPES = {
  'individual_users': {
    name: 'Individual Users',
    paths: ['src/pages/user', 'src/components/user'],
    dependencies: ['marketplace', 'payment', 'insurance', 'repair']
  },
  'repair_shops': {
    name: 'Repair Shops',
    paths: ['src/pages/repair', 'src/components/repair'],
    dependencies: ['insurance', 'marketplace', 'payment']
  },
  'retailers': {
    name: 'Retailers',
    paths: ['src/pages/retailers', 'src/components/retailers'],
    dependencies: ['marketplace', 'payment', 'admin']
  },
  'law_enforcement': {
    name: 'Law Enforcement',
    paths: ['src/pages/law-enforcement', 'src/components/law-enforcement'],
    dependencies: ['all'] // Law enforcement affects all stakeholders
  },
  'ngo_partners': {
    name: 'NGO Partners',
    paths: ['src/pages/ngo', 'src/components/ngo'],
    dependencies: ['individual_users', 'law_enforcement', 'admin']
  },
  'insurance_admin': {
    name: 'Insurance Admin',
    paths: ['src/pages/insurance', 'src/components/insurance'],
    dependencies: ['repair_shops', 'individual_users', 'payment']
  },
  'banks_payment': {
    name: 'Banks/Payment Gateways',
    paths: ['src/pages/payment', 'src/components/payment'],
    dependencies: ['all'] // Payment affects all stakeholders
  },
  'platform_admin': {
    name: 'Platform Administrators',
    paths: ['src/pages/admin', 'src/components/admin'],
    dependencies: ['all'] // Admin affects all stakeholders
  }
};

// Core System Units (from documentation)
const CORE_SYSTEMS = {
  'marketplace': {
    name: 'Marketplace Platform',
    paths: ['src/components/marketplace', 'src/pages/marketplace'],
    stakeholders: ['individual_users', 'retailers', 'repair_shops']
  },
  'payment': {
    name: 'S-Pay Wallet System',
    paths: ['src/lib/payment', 'src/components/payment'],
    stakeholders: ['all']
  },
  'blockchain': {
    name: 'Blockchain Integration',
    paths: ['src/lib/blockchain', 'src/adapters'],
    stakeholders: ['all']
  },
  'ai_ml': {
    name: 'AI/ML Services',
    paths: ['src/lib/ai', 'src/components/ai'],
    stakeholders: ['all']
  },
  'security': {
    name: 'Security Framework',
    paths: ['src/lib/security', 'src/components/security'],
    stakeholders: ['all']
  },
  'reverse_verification': {
    name: 'Reverse Verification Tool',
    paths: ['src/lib/security', 'src/components/security'],
    stakeholders: ['all']
  }
};

function analyzeFileImpact(filePath) {
  console.log(`🔍 Analyzing impact of: ${filePath}`);
  
  const impact = {
    file: filePath,
    stakeholders: [],
    systems: [],
    dependencies: [],
    risks: [],
    recommendations: []
  };

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Analyze stakeholder impact
    for (const [stakeholderKey, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
      for (const path of stakeholder.paths) {
        if (filePath.includes(path)) {
          impact.stakeholders.push({
            type: stakeholderKey,
            name: stakeholder.name,
            direct: true
          });
          
          // Add dependent stakeholders
          for (const dep of stakeholder.dependencies) {
            if (dep === 'all') {
              // Add all other stakeholders as dependencies
              for (const [otherKey, otherStakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
                if (otherKey !== stakeholderKey) {
                  impact.stakeholders.push({
                    type: otherKey,
                    name: otherStakeholder.name,
                    direct: false,
                    reason: `Dependent on ${stakeholder.name} changes`
                  });
                }
              }
            } else {
              const depStakeholder = STAKEHOLDER_TYPES[dep];
              if (depStakeholder) {
                impact.stakeholders.push({
                  type: dep,
                  name: depStakeholder.name,
                  direct: false,
                  reason: `Dependent on ${stakeholder.name} changes`
                });
              }
            }
          }
        }
      }
    }

    // Analyze system impact
    for (const [systemKey, system] of Object.entries(CORE_SYSTEMS)) {
      for (const path of system.paths) {
        if (filePath.includes(path)) {
          impact.systems.push({
            type: systemKey,
            name: system.name,
            stakeholders: system.stakeholders
          });
        }
      }
    }

    // Analyze imports and dependencies
    const importLines = content.split('\n').filter(line => 
      line.trim().startsWith('import') && line.includes('from')
    );

    for (const importLine of importLines) {
      const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        const importPath = match[1];
        
        // Check if import affects other stakeholders
        for (const [stakeholderKey, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
          for (const path of stakeholder.paths) {
            if (importPath.includes(path.replace('src/', ''))) {
              impact.dependencies.push({
                type: 'stakeholder',
                name: stakeholder.name,
                path: importPath
              });
            }
          }
        }

        // Check if import affects core systems
        for (const [systemKey, system] of Object.entries(CORE_SYSTEMS)) {
          for (const path of system.paths) {
            if (importPath.includes(path.replace('src/', ''))) {
              impact.dependencies.push({
                type: 'system',
                name: system.name,
                path: importPath
              });
            }
          }
        }
      }
    }

    // Analyze potential risks
    if (content.includes('useState') && !content.includes('useEffect')) {
      impact.risks.push({
        type: 'warning',
        message: 'Component uses useState without useEffect - may cause stale state issues'
      });
    }

    if (content.includes('any') && content.includes('TypeScript')) {
      impact.risks.push({
        type: 'error',
        message: 'TypeScript file uses "any" type - reduces type safety'
      });
    }

    if (content.includes('console.log') && !content.includes('// TODO: Remove')) {
      impact.risks.push({
        type: 'warning',
        message: 'Contains console.log statements - should be removed in production'
      });
    }

    // Generate recommendations
    if (impact.stakeholders.length > 3) {
      impact.recommendations.push({
        type: 'integration',
        message: 'High stakeholder impact - consider breaking into smaller components'
      });
    }

    if (impact.dependencies.length > 5) {
      impact.recommendations.push({
        type: 'architecture',
        message: 'High dependency count - consider dependency injection or service layer'
      });
    }

    if (impact.systems.length > 0) {
      impact.recommendations.push({
        type: 'testing',
        message: 'Core system change - ensure comprehensive testing across all stakeholders'
      });
    }

  } catch (error) {
    impact.risks.push({
      type: 'error',
      message: `Failed to read file: ${error.message}`
    });
  }

  return impact;
}

function displayImpactReport(impact) {
  console.log('\n📊 IMPACT ANALYSIS REPORT');
  console.log('========================\n');

  console.log(`📁 File: ${impact.file}\n`);

  // Stakeholder Impact
  if (impact.stakeholders.length > 0) {
    console.log('👥 STAKEHOLDER IMPACT:');
    const directStakeholders = impact.stakeholders.filter(s => s.direct);
    const dependentStakeholders = impact.stakeholders.filter(s => !s.direct);

    if (directStakeholders.length > 0) {
      console.log('  Direct Impact:');
      directStakeholders.forEach(stakeholder => {
        console.log(`    ✅ ${stakeholder.name}`);
      });
    }

    if (dependentStakeholders.length > 0) {
      console.log('  Dependent Impact:');
      dependentStakeholders.forEach(stakeholder => {
        console.log(`    🔗 ${stakeholder.name} (${stakeholder.reason})`);
      });
    }
    console.log('');
  }

  // System Impact
  if (impact.systems.length > 0) {
    console.log('🔧 CORE SYSTEM IMPACT:');
    impact.systems.forEach(system => {
      console.log(`    ⚙️  ${system.name}`);
      if (system.stakeholders.includes('all')) {
        console.log(`       Affects: ALL stakeholders`);
      } else {
        console.log(`       Affects: ${system.stakeholders.join(', ')}`);
      }
    });
    console.log('');
  }

  // Dependencies
  if (impact.dependencies.length > 0) {
    console.log('🔗 DEPENDENCIES:');
    impact.dependencies.forEach(dep => {
      console.log(`    📦 ${dep.type}: ${dep.name} (${dep.path})`);
    });
    console.log('');
  }

  // Risks
  if (impact.risks.length > 0) {
    console.log('⚠️  RISKS:');
    impact.risks.forEach(risk => {
      const icon = risk.type === 'error' ? '❌' : '⚠️';
      console.log(`    ${icon} ${risk.message}`);
    });
    console.log('');
  }

  // Recommendations
  if (impact.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    impact.recommendations.forEach(rec => {
      console.log(`    💡 ${rec.message}`);
    });
    console.log('');
  }

  // Summary
  const totalImpact = impact.stakeholders.length + impact.systems.length + impact.dependencies.length;
  const riskLevel = impact.risks.filter(r => r.type === 'error').length > 0 ? 'HIGH' : 
                   impact.risks.length > 0 ? 'MEDIUM' : 'LOW';

  console.log('📈 SUMMARY:');
  console.log(`    Total Impact: ${totalImpact} areas affected`);
  console.log(`    Risk Level: ${riskLevel}`);
  console.log(`    Stakeholders Affected: ${impact.stakeholders.length}`);
  console.log(`    Systems Affected: ${impact.systems.length}`);
  console.log(`    Dependencies: ${impact.dependencies.length}`);
}

function findFilesToAnalyze() {
  const files = [];
  
  // Find TypeScript/React files
  function findFiles(dir) {
    try {
      const items = fs.readdirSync(path.join(projectRoot, dir));
      for (const item of items) {
        const fullPath = path.join(projectRoot, dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findFiles(path.join(dir, item));
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  // Analyze key directories
  findFiles('src/components');
  findFiles('src/pages');
  findFiles('src/lib');

  return files;
}

function main() {
  console.log('🚀 STOLEN Platform - Simple Coherence Enforcer Tool');
  console.log('==================================================\n');

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/simple-coherence-enforcer.js <file-path>');
    console.log('   or: node scripts/simple-coherence-enforcer.js --analyze-all');
    console.log('\nExamples:');
    console.log('  node scripts/simple-coherence-enforcer.js src/components/marketplace/SellerDashboard.tsx');
    console.log('  node scripts/simple-coherence-enforcer.js --analyze-all');
    return;
  }

  if (args[0] === '--analyze-all') {
    console.log('🔍 Analyzing all TypeScript/React files...\n');
    const files = findFilesToAnalyze();
    
    if (files.length === 0) {
      console.log('❌ No TypeScript/React files found in src/');
      return;
    }

    console.log(`Found ${files.length} files to analyze\n`);
    
    // Analyze first 5 files as a sample
    const sampleFiles = files.slice(0, 5);
    
    for (const file of sampleFiles) {
      const impact = analyzeFileImpact(file);
      displayImpactReport(impact);
      console.log('─'.repeat(50));
    }

    console.log(`\n📊 Sample Analysis Complete (${sampleFiles.length}/${files.length} files)`);
    console.log('Use specific file paths for detailed analysis of individual files.');
    
  } else {
    const filePath = args[0];
    const fullPath = path.resolve(projectRoot, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    const impact = analyzeFileImpact(fullPath);
    displayImpactReport(impact);
  }
}

// Run the tool
main();



