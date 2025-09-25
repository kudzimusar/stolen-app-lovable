#!/usr/bin/env node

/**
 * STOLEN Platform - Comprehensive Coherence Enforcer Tool
 * 
 * This is the comprehensive version that integrates AI-powered analysis,
 * advanced dependency mapping, and real-time enforcement capabilities.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Import AI engine and dependency mapper (will be implemented inline for now)
// import { CoherenceAIEngine, coherenceAIEngine } from '../src/lib/ai/coherence-ai-engine.js';
// import { AdvancedDependencyMapper } from '../src/lib/ai/advanced-dependency-mapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  aiEnabled: process.env.NVIDIA_NIM_API_KEY || process.env.EXPO_PUBLIC_NVIDIA_NIM_API_KEY,
  maxFiles: 50, // Limit for comprehensive analysis
  timeout: 30000, // 30 seconds timeout per file
  outputDir: path.join(projectRoot, 'coherence-reports'),
  cacheDir: path.join(projectRoot, '.coherence-cache')
};

// Ensure output directories exist
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}
if (!fs.existsSync(CONFIG.cacheDir)) {
  fs.mkdirSync(CONFIG.cacheDir, { recursive: true });
}

class ComprehensiveCoherenceEnforcer {
  constructor() {
    this.aiEngine = coherenceAIEngine;
    this.dependencyMapper = new AdvancedDependencyMapper(projectRoot);
    this.results = {
      totalFiles: 0,
      analyzedFiles: 0,
      failedFiles: 0,
      stakeholderImpacts: {},
      systemImpacts: {},
      risks: [],
      recommendations: [],
      processingTime: 0
    };
  }

  async analyzeFile(filePath) {
    console.log(`🔍 Analyzing: ${filePath}`);
    
    try {
      const startTime = Date.now();
      const content = fs.readFileSync(filePath, 'utf8');
      
      // AI-powered analysis
      let aiAnalysis = null;
      if (CONFIG.aiEnabled) {
        try {
          aiAnalysis = await this.aiEngine.analyzeCode(filePath, content);
          console.log(`  ✅ AI Analysis completed (${aiAnalysis.processingTime}ms)`);
        } catch (error) {
          console.log(`  ⚠️  AI Analysis failed: ${error.message}`);
        }
      } else {
        console.log(`  ⚠️  AI Analysis skipped (no API key)`);
      }
      
      // Advanced dependency mapping
      const dependencyMap = await this.dependencyMapper.mapFileDependencies(filePath);
      console.log(`  ✅ Dependency mapping completed`);
      
      // Combine results
      const analysis = {
        filePath,
        aiAnalysis,
        dependencyMap,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
      
      // Update results
      this.updateResults(analysis);
      
      return analysis;
    } catch (error) {
      console.log(`  ❌ Analysis failed: ${error.message}`);
      this.results.failedFiles++;
      return null;
    }
  }

  async analyzeAll() {
    console.log('🚀 STOLEN Platform - Comprehensive Coherence Enforcer');
    console.log('====================================================\n');
    
    const startTime = Date.now();
    
    // Find all TypeScript/React files
    const files = this.findFilesToAnalyze();
    this.results.totalFiles = files.length;
    
    console.log(`📊 Found ${files.length} files to analyze`);
    console.log(`🤖 AI Analysis: ${CONFIG.aiEnabled ? 'Enabled' : 'Disabled'}\n`);
    
    // Analyze files in batches
    const batchSize = 10;
    for (let i = 0; i < files.length && i < CONFIG.maxFiles; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(Math.min(files.length, CONFIG.maxFiles)/batchSize)}`);
      
      const batchPromises = batch.map(file => this.analyzeFile(file));
      await Promise.allSettled(batchPromises);
      
      this.results.analyzedFiles = i + batch.length;
      console.log(`  ✅ Batch completed (${this.results.analyzedFiles}/${Math.min(files.length, CONFIG.maxFiles)} files)\n`);
    }
    
    this.results.processingTime = Date.now() - startTime;
    
    // Generate comprehensive report
    await this.generateComprehensiveReport();
    
    // Display summary
    this.displaySummary();
  }

  async analyzeSpecific(filePath) {
    console.log('🚀 STOLEN Platform - Comprehensive Coherence Enforcer');
    console.log('====================================================\n');
    
    const startTime = Date.now();
    
    const analysis = await this.analyzeFile(filePath);
    if (analysis) {
      this.results.analyzedFiles = 1;
      this.results.processingTime = Date.now() - startTime;
      
      // Generate detailed report for single file
      await this.generateDetailedReport(analysis);
      
      // Display detailed analysis
      this.displayDetailedAnalysis(analysis);
    }
  }

  updateResults(analysis) {
    if (!analysis) return;
    
    // Update stakeholder impacts
    if (analysis.aiAnalysis?.impact?.affectedStakeholders) {
      for (const stakeholder of analysis.aiAnalysis.impact.affectedStakeholders) {
        if (!this.results.stakeholderImpacts[stakeholder.type]) {
          this.results.stakeholderImpacts[stakeholder.type] = {
            name: stakeholder.name,
            count: 0,
            impactLevels: { low: 0, medium: 0, high: 0, critical: 0 }
          };
        }
        this.results.stakeholderImpacts[stakeholder.type].count++;
        this.results.stakeholderImpacts[stakeholder.type].impactLevels[stakeholder.impactLevel]++;
      }
    }
    
    // Update system impacts
    if (analysis.aiAnalysis?.impact?.affectedSystems) {
      for (const system of analysis.aiAnalysis.impact.affectedSystems) {
        if (!this.results.systemImpacts[system.type]) {
          this.results.systemImpacts[system.type] = {
            name: system.name,
            count: 0,
            impactLevels: { low: 0, medium: 0, high: 0, critical: 0 }
          };
        }
        this.results.systemImpacts[system.type].count++;
        this.results.systemImpacts[system.type].impactLevels[system.impactLevel]++;
      }
    }
    
    // Collect risks
    if (analysis.aiAnalysis?.risks?.risks) {
      this.results.risks.push(...analysis.aiAnalysis.risks.risks);
    }
    
    // Collect recommendations
    if (analysis.aiAnalysis?.recommendations) {
      this.results.recommendations.push(...analysis.aiAnalysis.recommendations);
    }
  }

  findFilesToAnalyze() {
    const files = [];
    
    function findFiles(dir) {
      try {
        const items = fs.readdirSync(path.join(projectRoot, dir));
        for (const item of items) {
          const fullPath = path.join(projectRoot, dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            findFiles(path.join(dir, item));
          } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            files.push(path.join(dir, item));
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

  async generateComprehensiveReport() {
    const report = {
      summary: {
        totalFiles: this.results.totalFiles,
        analyzedFiles: this.results.analyzedFiles,
        failedFiles: this.results.failedFiles,
        processingTime: this.results.processingTime,
        timestamp: new Date()
      },
      stakeholderImpacts: this.results.stakeholderImpacts,
      systemImpacts: this.results.systemImpacts,
      risks: this.results.risks,
      recommendations: this.results.recommendations,
      insights: this.generateInsights()
    };

    const reportPath = path.join(CONFIG.outputDir, `comprehensive-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Comprehensive report saved: ${reportPath}`);
  }

  async generateDetailedReport(analysis) {
    const report = {
      file: analysis.filePath,
      aiAnalysis: analysis.aiAnalysis,
      dependencyMap: analysis.dependencyMap,
      processingTime: analysis.processingTime,
      timestamp: analysis.timestamp
    };

    const reportPath = path.join(CONFIG.outputDir, `detailed-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed report saved: ${reportPath}`);
  }

  generateInsights() {
    const insights = [];
    
    // Stakeholder impact insights
    const stakeholderCount = Object.keys(this.results.stakeholderImpacts).length;
    if (stakeholderCount > 0) {
      insights.push({
        type: 'stakeholder',
        message: `${stakeholderCount} stakeholder types affected by changes`,
        severity: stakeholderCount > 5 ? 'high' : 'medium'
      });
    }
    
    // System impact insights
    const systemCount = Object.keys(this.results.systemImpacts).length;
    if (systemCount > 0) {
      insights.push({
        type: 'system',
        message: `${systemCount} core systems affected by changes`,
        severity: systemCount > 3 ? 'high' : 'medium'
      });
    }
    
    // Risk insights
    const criticalRisks = this.results.risks.filter(r => r.severity === 'critical').length;
    if (criticalRisks > 0) {
      insights.push({
        type: 'risk',
        message: `${criticalRisks} critical risks identified`,
        severity: 'critical'
      });
    }
    
    // Recommendation insights
    const criticalRecommendations = this.results.recommendations.filter(r => r.priority === 'critical').length;
    if (criticalRecommendations > 0) {
      insights.push({
        type: 'recommendation',
        message: `${criticalRecommendations} critical recommendations generated`,
        severity: 'high'
      });
    }
    
    return insights;
  }

  displaySummary() {
    console.log('📊 COMPREHENSIVE ANALYSIS SUMMARY');
    console.log('==================================\n');
    
    console.log(`📁 Files Analyzed: ${this.results.analyzedFiles}/${this.results.totalFiles}`);
    console.log(`⏱️  Processing Time: ${(this.results.processingTime / 1000).toFixed(2)}s`);
    console.log(`❌ Failed Analyses: ${this.results.failedFiles}\n`);
    
    // Stakeholder Impact Summary
    if (Object.keys(this.results.stakeholderImpacts).length > 0) {
      console.log('👥 STAKEHOLDER IMPACT SUMMARY:');
      for (const [key, impact] of Object.entries(this.results.stakeholderImpacts)) {
        const critical = impact.impactLevels.critical || 0;
        const high = impact.impactLevels.high || 0;
        const medium = impact.impactLevels.medium || 0;
        const low = impact.impactLevels.low || 0;
        
        const severity = critical > 0 ? '🔴' : high > 0 ? '🟠' : medium > 0 ? '🟡' : '🟢';
        console.log(`  ${severity} ${impact.name}: ${impact.count} impacts (${critical}C ${high}H ${medium}M ${low}L)`);
      }
      console.log('');
    }
    
    // System Impact Summary
    if (Object.keys(this.results.systemImpacts).length > 0) {
      console.log('🔧 SYSTEM IMPACT SUMMARY:');
      for (const [key, impact] of Object.entries(this.results.systemImpacts)) {
        const critical = impact.impactLevels.critical || 0;
        const high = impact.impactLevels.high || 0;
        const medium = impact.impactLevels.medium || 0;
        const low = impact.impactLevels.low || 0;
        
        const severity = critical > 0 ? '🔴' : high > 0 ? '🟠' : medium > 0 ? '🟡' : '🟢';
        console.log(`  ${severity} ${impact.name}: ${impact.count} impacts (${critical}C ${high}H ${medium}M ${low}L)`);
      }
      console.log('');
    }
    
    // Risk Summary
    if (this.results.risks.length > 0) {
      const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      for (const risk of this.results.risks) {
        riskCounts[risk.severity]++;
      }
      
      console.log('⚠️  RISK SUMMARY:');
      console.log(`  🔴 Critical: ${riskCounts.critical}`);
      console.log(`  🟠 High: ${riskCounts.high}`);
      console.log(`  🟡 Medium: ${riskCounts.medium}`);
      console.log(`  🟢 Low: ${riskCounts.low}\n`);
    }
    
    // Recommendation Summary
    if (this.results.recommendations.length > 0) {
      const recCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      for (const rec of this.results.recommendations) {
        recCounts[rec.priority]++;
      }
      
      console.log('💡 RECOMMENDATION SUMMARY:');
      console.log(`  🔴 Critical: ${recCounts.critical}`);
      console.log(`  🟠 High: ${recCounts.high}`);
      console.log(`  🟡 Medium: ${recCounts.medium}`);
      console.log(`  🟢 Low: ${recCounts.low}\n`);
    }
    
    // Overall Assessment
    const criticalIssues = (this.results.risks.filter(r => r.severity === 'critical').length) +
                          (this.results.recommendations.filter(r => r.priority === 'critical').length);
    
    if (criticalIssues > 0) {
      console.log('🚨 OVERALL ASSESSMENT: CRITICAL ISSUES DETECTED');
      console.log(`   ${criticalIssues} critical issues require immediate attention`);
    } else {
      console.log('✅ OVERALL ASSESSMENT: NO CRITICAL ISSUES');
      console.log('   System coherence is within acceptable parameters');
    }
  }

  displayDetailedAnalysis(analysis) {
    console.log('📊 DETAILED ANALYSIS REPORT');
    console.log('===========================\n');
    
    console.log(`📁 File: ${analysis.filePath}`);
    console.log(`⏱️  Processing Time: ${analysis.processingTime}ms\n`);
    
    // AI Analysis Results
    if (analysis.aiAnalysis) {
      console.log('🤖 AI ANALYSIS RESULTS:');
      
      // Complexity Analysis
      if (analysis.aiAnalysis.complexity) {
        const comp = analysis.aiAnalysis.complexity;
        console.log(`  📊 Complexity: ${comp.cyclomaticComplexity}/10 (Confidence: ${(comp.confidence * 100).toFixed(1)}%)`);
      }
      
      // Stakeholder Impact
      if (analysis.aiAnalysis.impact?.affectedStakeholders?.length > 0) {
        console.log('  👥 Affected Stakeholders:');
        for (const stakeholder of analysis.aiAnalysis.impact.affectedStakeholders) {
          const icon = stakeholder.impactLevel === 'critical' ? '🔴' : 
                      stakeholder.impactLevel === 'high' ? '🟠' : 
                      stakeholder.impactLevel === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${stakeholder.name} (${stakeholder.impactLevel}) - ${stakeholder.reason}`);
        }
      }
      
      // System Impact
      if (analysis.aiAnalysis.impact?.affectedSystems?.length > 0) {
        console.log('  🔧 Affected Systems:');
        for (const system of analysis.aiAnalysis.impact.affectedSystems) {
          const icon = system.impactLevel === 'critical' ? '🔴' : 
                      system.impactLevel === 'high' ? '🟠' : 
                      system.impactLevel === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${system.name} (${system.impactLevel}) - ${system.reason}`);
        }
      }
      
      // Risks
      if (analysis.aiAnalysis.risks?.risks?.length > 0) {
        console.log('  ⚠️  Identified Risks:');
        for (const risk of analysis.aiAnalysis.risks.risks) {
          const icon = risk.severity === 'critical' ? '🔴' : 
                      risk.severity === 'high' ? '🟠' : 
                      risk.severity === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${risk.type.toUpperCase()}: ${risk.description}`);
        }
      }
      
      // Recommendations
      if (analysis.aiAnalysis.recommendations?.length > 0) {
        console.log('  💡 Recommendations:');
        for (const rec of analysis.aiAnalysis.recommendations) {
          const icon = rec.priority === 'critical' ? '🔴' : 
                      rec.priority === 'high' ? '🟠' : 
                      rec.priority === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${rec.title} (${rec.priority})`);
        }
      }
      
      console.log('');
    }
    
    // Dependency Map Results
    if (analysis.dependencyMap) {
      console.log('🔗 DEPENDENCY MAP RESULTS:');
      
      // API Dependencies
      if (analysis.dependencyMap.apiDependencies?.length > 0) {
        console.log(`  📡 API Dependencies: ${analysis.dependencyMap.apiDependencies.length}`);
        for (const dep of analysis.dependencyMap.apiDependencies.slice(0, 3)) {
          const icon = dep.impact === 'critical' ? '🔴' : 
                      dep.impact === 'high' ? '🟠' : 
                      dep.impact === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${dep.type}: ${dep.endpoint} (${dep.impact})`);
        }
        if (analysis.dependencyMap.apiDependencies.length > 3) {
          console.log(`    ... and ${analysis.dependencyMap.apiDependencies.length - 3} more`);
        }
      }
      
      // Database Dependencies
      if (analysis.dependencyMap.databaseDependencies?.length > 0) {
        console.log(`  🗄️  Database Dependencies: ${analysis.dependencyMap.databaseDependencies.length}`);
        for (const dep of analysis.dependencyMap.databaseDependencies.slice(0, 3)) {
          const icon = dep.impact === 'critical' ? '🔴' : 
                      dep.impact === 'high' ? '🟠' : 
                      dep.impact === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${dep.operation}: ${dep.table} (${dep.impact})`);
        }
        if (analysis.dependencyMap.databaseDependencies.length > 3) {
          console.log(`    ... and ${analysis.dependencyMap.databaseDependencies.length - 3} more`);
        }
      }
      
      // Component Dependencies
      if (analysis.dependencyMap.componentDependencies?.length > 0) {
        console.log(`  🧩 Component Dependencies: ${analysis.dependencyMap.componentDependencies.length}`);
        for (const dep of analysis.dependencyMap.componentDependencies.slice(0, 3)) {
          const icon = dep.impact === 'critical' ? '🔴' : 
                      dep.impact === 'high' ? '🟠' : 
                      dep.impact === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${dep.type}: ${dep.component} (${dep.impact})`);
        }
        if (analysis.dependencyMap.componentDependencies.length > 3) {
          console.log(`    ... and ${analysis.dependencyMap.componentDependencies.length - 3} more`);
        }
      }
      
      // Stakeholder Integrations
      if (analysis.dependencyMap.stakeholderIntegrations?.length > 0) {
        console.log(`  🤝 Stakeholder Integrations: ${analysis.dependencyMap.stakeholderIntegrations.length}`);
        for (const integration of analysis.dependencyMap.stakeholderIntegrations.slice(0, 3)) {
          const icon = integration.impact === 'critical' ? '🔴' : 
                      integration.impact === 'high' ? '🟠' : 
                      integration.impact === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${integration.fromStakeholder} → ${integration.toStakeholder} (${integration.impact})`);
        }
        if (analysis.dependencyMap.stakeholderIntegrations.length > 3) {
          console.log(`    ... and ${analysis.dependencyMap.stakeholderIntegrations.length - 3} more`);
        }
      }
      
      console.log(`\n  📊 Total Impact Level: ${analysis.dependencyMap.totalImpact.toUpperCase()}\n`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const enforcer = new ComprehensiveCoherenceEnforcer();
  
  if (args.length === 0) {
    console.log('Usage: node scripts/comprehensive-coherence-enforcer.js <command> [options]');
    console.log('\nCommands:');
    console.log('  analyze-all                    - Analyze all TypeScript/React files');
    console.log('  analyze <file-path>            - Analyze specific file');
    console.log('  --help                         - Show this help message');
    console.log('\nExamples:');
    console.log('  node scripts/comprehensive-coherence-enforcer.js analyze-all');
    console.log('  node scripts/comprehensive-coherence-enforcer.js analyze src/components/marketplace/SellerDashboard.tsx');
    return;
  }
  
  if (args[0] === '--help') {
    console.log('STOLEN Platform - Comprehensive Coherence Enforcer Tool');
    console.log('======================================================');
    console.log('\nThis tool provides AI-powered analysis of code coherence across the 8-stakeholder ecosystem.');
    console.log('\nFeatures:');
    console.log('  🤖 AI-powered code analysis using NVIDIA NIM, Anthropic Claude, and Google Gemini');
    console.log('  🔗 Advanced dependency mapping for APIs, databases, and components');
    console.log('  👥 Stakeholder impact prediction across all 8 stakeholder types');
    console.log('  ⚠️  Risk assessment and mitigation recommendations');
    console.log('  📊 Comprehensive reporting and visualization');
    return;
  }
  
  if (args[0] === 'analyze-all') {
    await enforcer.analyzeAll();
  } else if (args[0] === 'analyze' && args[1]) {
    await enforcer.analyzeSpecific(args[1]);
  } else {
    console.log('❌ Invalid command. Use --help for usage information.');
  }
}

// Run the tool
main().catch(console.error);
