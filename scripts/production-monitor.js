#!/usr/bin/env node

/**
 * STOLEN Platform - Production Coherence Monitor
 * 
 * This script provides continuous monitoring of coherence across the platform
 * and sends alerts when critical issues are detected.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Production configuration
const CONFIG = {
  monitoringInterval: process.env.COHERENCE_MONITORING_INTERVAL || 300000, // 5 minutes
  alertWebhook: process.env.COHERENCE_ALERT_WEBHOOK_URL,
  alertEmail: process.env.COHERENCE_ALERT_EMAIL,
  slackWebhook: process.env.COHERENCE_ALERT_SLACK_WEBHOOK,
  reportsDir: process.env.COHERENCE_REPORTS_DIR || './coherence-reports',
  maxFiles: process.env.COHERENCE_ENFORCER_MAX_FILES || 100,
  strictMode: process.env.COHERENCE_ENFORCER_STRICT_MODE === 'true'
};

class ProductionCoherenceMonitor {
  constructor() {
    this.isRunning = false;
    this.lastAnalysis = null;
    this.alertHistory = [];
    this.metrics = {
      totalAnalyses: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      stakeholderImpacts: {},
      systemImpacts: {},
      uptime: Date.now()
    };
  }

  async start() {
    console.log('🚀 Starting STOLEN Platform Coherence Monitor');
    console.log('=============================================\n');
    
    this.isRunning = true;
    
    // Initial analysis
    await this.runAnalysis();
    
    // Set up monitoring interval
    setInterval(async () => {
      if (this.isRunning) {
        await this.runAnalysis();
      }
    }, CONFIG.monitoringInterval);
    
    // Set up graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    
    console.log(`✅ Monitor started. Checking every ${CONFIG.monitoringInterval / 1000} seconds.`);
    console.log('Press Ctrl+C to stop monitoring.\n');
  }

  async stop() {
    console.log('\n🛑 Stopping coherence monitor...');
    this.isRunning = false;
    
    // Generate final report
    await this.generateFinalReport();
    
    console.log('✅ Monitor stopped gracefully.');
    process.exit(0);
  }

  async runAnalysis() {
    try {
      console.log(`🔍 Running coherence analysis... (${new Date().toISOString()})`);
      
      // Run the AI coherence enforcer
      const { spawn } = await import('child_process');
      
      const analysis = new Promise((resolve, reject) => {
        const child = spawn('npm', ['run', 'coherence:ai-all'], {
          cwd: projectRoot,
          stdio: 'pipe'
        });
        
        let output = '';
        let error = '';
        
        child.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve({ output, error, code });
          } else {
            reject(new Error(`Analysis failed with code ${code}: ${error}`));
          }
        });
      });
      
      const result = await analysis;
      this.lastAnalysis = result;
      this.metrics.totalAnalyses++;
      
      // Parse analysis results
      const parsedResults = this.parseAnalysisOutput(result.output);
      
      // Update metrics
      this.updateMetrics(parsedResults);
      
      // Check for critical issues
      await this.checkForCriticalIssues(parsedResults);
      
      // Generate monitoring report
      await this.generateMonitoringReport(parsedResults);
      
      console.log(`✅ Analysis completed. Found ${parsedResults.risks.length} risks, ${parsedResults.recommendations.length} recommendations.`);
      
    } catch (error) {
      console.error(`❌ Analysis failed: ${error.message}`);
      await this.sendAlert('CRITICAL', 'Coherence analysis failed', error.message);
    }
  }

  parseAnalysisOutput(output) {
    const results = {
      risks: [],
      recommendations: [],
      stakeholderImpacts: {},
      systemImpacts: {},
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0
    };
    
    // Parse risk summary
    const riskMatch = output.match(/🔴 Critical: (\d+)\s+🟠 High: (\d+)\s+🟡 Medium: (\d+)\s+🟢 Low: (\d+)/);
    if (riskMatch) {
      results.criticalIssues = parseInt(riskMatch[1]);
      results.highIssues = parseInt(riskMatch[2]);
      results.mediumIssues = parseInt(riskMatch[3]);
      results.lowIssues = parseInt(riskMatch[4]);
    }
    
    // Parse stakeholder impacts
    const stakeholderMatch = output.match(/👥 STAKEHOLDER IMPACT SUMMARY:([\s\S]*?)(?=🔧|⚠️|💡|$)/);
    if (stakeholderMatch) {
      const stakeholderSection = stakeholderMatch[1];
      const lines = stakeholderSection.split('\n');
      for (const line of lines) {
        const match = line.match(/🟠|🟡|🟢|🔴\s+([^:]+):\s+(\d+)\s+impacts/);
        if (match) {
          results.stakeholderImpacts[match[1].trim()] = parseInt(match[2]);
        }
      }
    }
    
    // Parse system impacts
    const systemMatch = output.match(/🔧 SYSTEM IMPACT SUMMARY:([\s\S]*?)(?=⚠️|💡|$)/);
    if (systemMatch) {
      const systemSection = systemMatch[1];
      const lines = systemSection.split('\n');
      for (const line of lines) {
        const match = line.match(/🟠|🟡|🟢|🔴\s+([^:]+):\s+(\d+)\s+impacts/);
        if (match) {
          results.systemImpacts[match[1].trim()] = parseInt(match[2]);
        }
      }
    }
    
    return results;
  }

  updateMetrics(parsedResults) {
    this.metrics.criticalIssues += parsedResults.criticalIssues;
    this.metrics.highIssues += parsedResults.highIssues;
    this.metrics.mediumIssues += parsedResults.mediumIssues;
    this.metrics.lowIssues += parsedResults.lowIssues;
    
    // Update stakeholder impacts
    for (const [stakeholder, count] of Object.entries(parsedResults.stakeholderImpacts)) {
      if (!this.metrics.stakeholderImpacts[stakeholder]) {
        this.metrics.stakeholderImpacts[stakeholder] = 0;
      }
      this.metrics.stakeholderImpacts[stakeholder] += count;
    }
    
    // Update system impacts
    for (const [system, count] of Object.entries(parsedResults.systemImpacts)) {
      if (!this.metrics.systemImpacts[system]) {
        this.metrics.systemImpacts[system] = 0;
      }
      this.metrics.systemImpacts[system] += count;
    }
  }

  async checkForCriticalIssues(parsedResults) {
    // Check for critical issues
    if (parsedResults.criticalIssues > 0) {
      await this.sendAlert(
        'CRITICAL',
        'Critical coherence issues detected',
        `${parsedResults.criticalIssues} critical issues found in the latest analysis. Immediate attention required.`
      );
    }
    
    // Check for high issues in strict mode
    if (CONFIG.strictMode && parsedResults.highIssues > 5) {
      await this.sendAlert(
        'HIGH',
        'High number of high-priority issues',
        `${parsedResults.highIssues} high-priority issues found. Consider reviewing recent changes.`
      );
    }
    
    // Check for stakeholder impact threshold
    const totalStakeholderImpacts = Object.values(parsedResults.stakeholderImpacts).reduce((a, b) => a + b, 0);
    if (totalStakeholderImpacts > 20) {
      await this.sendAlert(
        'MEDIUM',
        'High stakeholder impact detected',
        `Total stakeholder impact: ${totalStakeholderImpacts}. Multiple stakeholders may be affected by recent changes.`
      );
    }
  }

  async sendAlert(severity, title, message) {
    const alert = {
      timestamp: new Date().toISOString(),
      severity,
      title,
      message,
      metrics: this.metrics
    };
    
    this.alertHistory.push(alert);
    
    console.log(`🚨 ALERT [${severity}]: ${title}`);
    console.log(`   ${message}\n`);
    
    // Send to webhook if configured
    if (CONFIG.alertWebhook) {
      await this.sendWebhookAlert(alert);
    }
    
    // Send to Slack if configured
    if (CONFIG.slackWebhook) {
      await this.sendSlackAlert(alert);
    }
    
    // Send email if configured
    if (CONFIG.alertEmail) {
      await this.sendEmailAlert(alert);
    }
  }

  async sendWebhookAlert(alert) {
    try {
      const response = await fetch(CONFIG.alertWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      });
      
      if (!response.ok) {
        console.error(`❌ Webhook alert failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Webhook alert error: ${error.message}`);
    }
  }

  async sendSlackAlert(alert) {
    try {
      const slackMessage = {
        text: `🚨 STOLEN Platform Coherence Alert`,
        attachments: [
          {
            color: alert.severity === 'CRITICAL' ? 'danger' : 
                   alert.severity === 'HIGH' ? 'warning' : 'good',
            fields: [
              {
                title: 'Severity',
                value: alert.severity,
                short: true
              },
              {
                title: 'Title',
                value: alert.title,
                short: false
              },
              {
                title: 'Message',
                value: alert.message,
                short: false
              },
              {
                title: 'Timestamp',
                value: alert.timestamp,
                short: true
              }
            ]
          }
        ]
      };
      
      const response = await fetch(CONFIG.slackWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      });
      
      if (!response.ok) {
        console.error(`❌ Slack alert failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Slack alert error: ${error.message}`);
    }
  }

  async sendEmailAlert(alert) {
    // Email implementation would go here
    console.log(`📧 Email alert would be sent to ${CONFIG.alertEmail}`);
  }

  async generateMonitoringReport(parsedResults) {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      currentAnalysis: parsedResults,
      alertHistory: this.alertHistory.slice(-10), // Last 10 alerts
      uptime: Date.now() - this.metrics.uptime,
      status: this.getSystemStatus(parsedResults)
    };
    
    // Ensure reports directory exists
    if (!fs.existsSync(CONFIG.reportsDir)) {
      fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(CONFIG.reportsDir, `monitoring-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Keep only last 100 reports
    this.cleanupOldReports();
  }

  getSystemStatus(parsedResults) {
    if (parsedResults.criticalIssues > 0) {
      return 'CRITICAL';
    } else if (parsedResults.highIssues > 5) {
      return 'WARNING';
    } else if (parsedResults.mediumIssues > 10) {
      return 'CAUTION';
    } else {
      return 'HEALTHY';
    }
  }

  cleanupOldReports() {
    try {
      const files = fs.readdirSync(CONFIG.reportsDir);
      const reportFiles = files.filter(f => f.startsWith('monitoring-') && f.endsWith('.json'));
      
      if (reportFiles.length > 100) {
        const sortedFiles = reportFiles.sort();
        const filesToDelete = sortedFiles.slice(0, reportFiles.length - 100);
        
        for (const file of filesToDelete) {
          fs.unlinkSync(path.join(CONFIG.reportsDir, file));
        }
        
        console.log(`🧹 Cleaned up ${filesToDelete.length} old monitoring reports`);
      }
    } catch (error) {
      console.error(`❌ Cleanup failed: ${error.message}`);
    }
  }

  async generateFinalReport() {
    const finalReport = {
      timestamp: new Date().toISOString(),
      totalUptime: Date.now() - this.metrics.uptime,
      metrics: this.metrics,
      alertHistory: this.alertHistory,
      summary: {
        totalAnalyses: this.metrics.totalAnalyses,
        totalAlerts: this.alertHistory.length,
        criticalAlerts: this.alertHistory.filter(a => a.severity === 'CRITICAL').length,
        highAlerts: this.alertHistory.filter(a => a.severity === 'HIGH').length,
        averageAnalysisTime: this.metrics.totalAnalyses > 0 ? 
          (Date.now() - this.metrics.uptime) / this.metrics.totalAnalyses : 0
      }
    };
    
    const reportPath = path.join(CONFIG.reportsDir, `final-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
    
    console.log(`📊 Final report generated: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const monitor = new ProductionCoherenceMonitor();
  await monitor.start();
}

// Run the monitor
main().catch(console.error);


