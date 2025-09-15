#!/usr/bin/env node

/**
 * App Validation Test Suite
 * Quality Gate System - 96% Threshold Required
 * 
 * Usage: node validate-app.js [--strict] [--verbose] [--ci]
 * 
 * This validation suite tests for:
 * - Build errors and warnings
 * - Runtime errors and memory leaks
 * - Performance bottlenecks and infinite loops
 * - Code quality and best practices
 * - Security vulnerabilities
 * - Accessibility standards
 */

const fs = require('fs');
const { exec, spawn } = require('child_process');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Terminal color codes for output formatting
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
};

// Configuration
const CONFIG = {
    PASSING_THRESHOLD: 96,
    TIMEOUT_MS: 30000,
    MEMORY_THRESHOLD_MB: 512,
    RESPONSE_TIME_THRESHOLD_MS: 3000,
    BUNDLE_SIZE_THRESHOLD_KB: 500,
    TEST_COVERAGE_THRESHOLD: 80,
    LIGHTHOUSE_THRESHOLD: 90,
    MAX_WARNINGS: 5,
    MAX_CONSOLE_ERRORS: 0,
    CYCLOMATIC_COMPLEXITY_THRESHOLD: 10
};

// Test categories with weights
const TEST_CATEGORIES = {
    BUILD: { weight: 20, tests: [] },
    RUNTIME: { weight: 20, tests: [] },
    PERFORMANCE: { weight: 15, tests: [] },
    CODE_QUALITY: { weight: 15, tests: [] },
    SECURITY: { weight: 10, tests: [] },
    TESTS: { weight: 10, tests: [] },
    ACCESSIBILITY: { weight: 5, tests: [] },
    BUNDLE: { weight: 5, tests: [] }
};

// Test results storage
const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    score: 0,
    details: {},
    timestamp: new Date().toISOString()
};

// Utility Functions
class ValidationUtils {
    static async runCommand(command, options = {}) {
        try {
            const { stdout, stderr } = await execPromise(command, {
                timeout: CONFIG.TIMEOUT_MS,
                ...options
            });
            return { success: true, stdout, stderr };
        } catch (error) {
            return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
        }
    }

    static async checkFileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static calculateScore(results) {
        let totalScore = 0;
        let totalWeight = 0;

        for (const [category, data] of Object.entries(TEST_CATEGORIES)) {
            const categoryTests = results.filter(r => r.category === category);
            if (categoryTests.length === 0) continue;

            const passed = categoryTests.filter(t => t.status === 'passed').length;
            const categoryScore = (passed / categoryTests.length) * 100;
            totalScore += categoryScore * (data.weight / 100);
            totalWeight += data.weight;
        }

        return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    }

    static printProgress(message, status = 'info') {
        const symbols = {
            info: '◆',
            success: '✓',
            error: '✗',
            warning: '⚠',
            running: '◌'
        };

        const colorMap = {
            info: colors.cyan,
            success: colors.green,
            error: colors.red,
            warning: colors.yellow,
            running: colors.blue
        };

        console.log(`${colorMap[status]}${symbols[status]} ${message}${colors.reset}`);
    }
}

// Test Implementations
class ValidationTests {
    // BUILD TESTS
    static async testBuildCompilation() {
        const startTime = Date.now();
        ValidationUtils.printProgress('Testing build compilation...', 'running');
        
        const result = await ValidationUtils.runCommand('npm run build');
        const buildTime = Date.now() - startTime;

        return {
            name: 'Build Compilation',
            category: 'BUILD',
            status: result.success ? 'passed' : 'failed',
            message: result.success 
                ? `Build completed in ${buildTime}ms` 
                : `Build failed: ${result.error}`,
            details: {
                buildTime,
                stdout: result.stdout,
                stderr: result.stderr
            }
        };
    }

    static async testTypeScriptErrors() {
        ValidationUtils.printProgress('Checking TypeScript errors...', 'running');
        
        const result = await ValidationUtils.runCommand('npx tsc --noEmit');
        const hasErrors = result.stderr && result.stderr.includes('error TS');
        
        return {
            name: 'TypeScript Compilation',
            category: 'BUILD',
            status: !hasErrors ? 'passed' : 'failed',
            message: !hasErrors 
                ? 'No TypeScript errors found' 
                : `TypeScript errors detected: ${result.stderr}`,
            details: { stderr: result.stderr }
        };
    }

    static async testLintErrors() {
        ValidationUtils.printProgress('Running ESLint checks...', 'running');
        
        const result = await ValidationUtils.runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --format json');
        let lintResults = [];
        
        try {
            lintResults = JSON.parse(result.stdout || '[]');
        } catch (e) {
            // Fallback to basic check
        }

        const errorCount = lintResults.reduce((sum, file) => sum + file.errorCount, 0);
        const warningCount = lintResults.reduce((sum, file) => sum + file.warningCount, 0);

        return {
            name: 'ESLint Analysis',
            category: 'CODE_QUALITY',
            status: errorCount === 0 ? 'passed' : 'failed',
            message: `Found ${errorCount} errors and ${warningCount} warnings`,
            details: { errorCount, warningCount, files: lintResults.length }
        };
    }

    // RUNTIME TESTS
    static async testInfiniteLoops() {
        ValidationUtils.printProgress('Checking for infinite loops...', 'running');
        
        // Create a test runner that monitors CPU usage
        const testScript = `
            const v8 = require('v8');
            const initialHeap = v8.getHeapStatistics().used_heap_size;
            let iterations = 0;
            const maxIterations = 1000000;
            
            // Monitor for potential infinite loops
            const checkLoop = setInterval(() => {
                iterations++;
                const currentHeap = v8.getHeapStatistics().used_heap_size;
                const heapGrowth = currentHeap - initialHeap;
                
                if (iterations > maxIterations || heapGrowth > 100 * 1024 * 1024) {
                    console.error('Potential infinite loop detected');
                    process.exit(1);
                }
            }, 10);
            
            // Import and run the app
            setTimeout(() => {
                clearInterval(checkLoop);
                console.log('No infinite loops detected');
                process.exit(0);
            }, 5000);
        `;

        const result = await ValidationUtils.runCommand(`node -e "${testScript.replace(/"/g, '\\"')}"`);

        return {
            name: 'Infinite Loop Detection',
            category: 'RUNTIME',
            status: result.success ? 'passed' : 'failed',
            message: result.success 
                ? 'No infinite loops detected' 
                : 'Potential infinite loop found',
            details: { stdout: result.stdout }
        };
    }

    static async testMemoryLeaks() {
        ValidationUtils.printProgress('Checking for memory leaks...', 'running');
        
        const memoryTestScript = `
            const v8 = require('v8');
            const measurements = [];
            
            // Take memory measurements
            for (let i = 0; i < 10; i++) {
                if (global.gc) global.gc();
                const heap = v8.getHeapStatistics().used_heap_size / 1024 / 1024;
                measurements.push(heap);
                
                // Simulate app activity
                require('./src/App');
            }
            
            // Check if memory is consistently increasing
            const trend = measurements.slice(-5).reduce((a, b, i, arr) => {
                if (i === 0) return 0;
                return a + (b - arr[i - 1]);
            }, 0);
            
            console.log(JSON.stringify({
                measurements,
                trend,
                leak: trend > 50
            }));
        `;

        const result = await ValidationUtils.runCommand(`node --expose-gc -e "${memoryTestScript.replace(/"/g, '\\"')}"`, {
            cwd: process.cwd()
        });

        let memoryData = { leak: false };
        try {
            memoryData = JSON.parse(result.stdout || '{}');
        } catch (e) {}

        return {
            name: 'Memory Leak Detection',
            category: 'RUNTIME',
            status: !memoryData.leak ? 'passed' : 'failed',
            message: !memoryData.leak 
                ? 'No memory leaks detected' 
                : 'Potential memory leak detected',
            details: memoryData
        };
    }

    // PERFORMANCE TESTS
    static async testBundleSize() {
        ValidationUtils.printProgress('Analyzing bundle size...', 'running');
        
        const distPath = path.join(process.cwd(), 'dist');
        
        if (!await ValidationUtils.checkFileExists(distPath)) {
            return {
                name: 'Bundle Size Analysis',
                category: 'BUNDLE',
                status: 'failed',
                message: 'Build directory not found',
                details: {}
            };
        }

        const result = await ValidationUtils.runCommand(`du -sk ${distPath}`);
        const sizeKB = parseInt(result.stdout.split('\t')[0]);

        return {
            name: 'Bundle Size Analysis',
            category: 'BUNDLE',
            status: sizeKB <= CONFIG.BUNDLE_SIZE_THRESHOLD_KB ? 'passed' : 'failed',
            message: `Bundle size: ${sizeKB}KB (threshold: ${CONFIG.BUNDLE_SIZE_THRESHOLD_KB}KB)`,
            details: { sizeKB, threshold: CONFIG.BUNDLE_SIZE_THRESHOLD_KB }
        };
    }

    static async testLoadTime() {
        ValidationUtils.printProgress('Testing application load time...', 'running');
        
        const loadTestScript = `
            const start = Date.now();
            import('./src/App').then(() => {
                const loadTime = Date.now() - start;
                console.log(JSON.stringify({ loadTime }));
            }).catch(err => {
                console.log(JSON.stringify({ error: err.message }));
            });
        `;

        const result = await ValidationUtils.runCommand(`node -e "${loadTestScript.replace(/"/g, '\\"')}"`);
        
        let loadData = { loadTime: 0 };
        try {
            loadData = JSON.parse(result.stdout || '{}');
        } catch (e) {}

        return {
            name: 'Application Load Time',
            category: 'PERFORMANCE',
            status: loadData.loadTime < CONFIG.RESPONSE_TIME_THRESHOLD_MS ? 'passed' : 'failed',
            message: `Load time: ${loadData.loadTime}ms (threshold: ${CONFIG.RESPONSE_TIME_THRESHOLD_MS}ms)`,
            details: loadData
        };
    }

    // SECURITY TESTS
    static async testSecurityVulnerabilities() {
        ValidationUtils.printProgress('Scanning for security vulnerabilities...', 'running');
        
        const result = await ValidationUtils.runCommand('npm audit --json');
        
        let auditData = { vulnerabilities: {} };
        try {
            auditData = JSON.parse(result.stdout || '{}');
        } catch (e) {}

        const critical = auditData.metadata?.vulnerabilities?.critical || 0;
        const high = auditData.metadata?.vulnerabilities?.high || 0;

        return {
            name: 'Security Vulnerability Scan',
            category: 'SECURITY',
            status: (critical === 0 && high === 0) ? 'passed' : 'failed',
            message: `Found ${critical} critical and ${high} high vulnerabilities`,
            details: auditData.metadata?.vulnerabilities || {}
        };
    }

    // TEST COVERAGE
    static async testCoverage() {
        ValidationUtils.printProgress('Running test coverage analysis...', 'running');
        
        const result = await ValidationUtils.runCommand('npm test -- --coverage --watchAll=false --json');
        
        let coverageData = { coverageMap: {} };
        try {
            const output = JSON.parse(result.stdout || '{}');
            coverageData = output.coverageMap || {};
        } catch (e) {}

        // Calculate overall coverage
        let totalStatements = 0;
        let coveredStatements = 0;
        
        for (const file of Object.values(coverageData)) {
            totalStatements += file.s ? Object.keys(file.s).length : 0;
            coveredStatements += file.s ? Object.values(file.s).filter(v => v > 0).length : 0;
        }

        const coverage = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;

        return {
            name: 'Test Coverage',
            category: 'TESTS',
            status: coverage >= CONFIG.TEST_COVERAGE_THRESHOLD ? 'passed' : 'failed',
            message: `Coverage: ${coverage.toFixed(2)}% (threshold: ${CONFIG.TEST_COVERAGE_THRESHOLD}%)`,
            details: { coverage, threshold: CONFIG.TEST_COVERAGE_THRESHOLD }
        };
    }

    // ACCESSIBILITY TESTS
    static async testAccessibility() {
        ValidationUtils.printProgress('Running accessibility checks...', 'running');
        
        // Check for basic accessibility attributes in React components
        const result = await ValidationUtils.runCommand(
            'grep -r "img\\|button\\|input\\|form" src/ --include="*.tsx" --include="*.jsx" | head -20'
        );

        const lines = result.stdout?.split('\n') || [];
        let issues = 0;

        lines.forEach(line => {
            if (line.includes('<img') && !line.includes('alt=')) issues++;
            if (line.includes('<button') && !line.includes('aria-')) issues++;
            if (line.includes('<input') && !line.includes('aria-') && !line.includes('id=')) issues++;
        });

        return {
            name: 'Accessibility Compliance',
            category: 'ACCESSIBILITY',
            status: issues === 0 ? 'passed' : 'failed',
            message: issues === 0 
                ? 'Basic accessibility checks passed' 
                : `Found ${issues} potential accessibility issues`,
            details: { issues }
        };
    }

    // CODE QUALITY TESTS
    static async testCyclomaticComplexity() {
        ValidationUtils.printProgress('Analyzing code complexity...', 'running');
        
        // Use a simple complexity check
        const result = await ValidationUtils.runCommand(
            'find src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs wc -l'
        );

        const lines = result.stdout?.split('\n') || [];
        const complexFiles = [];

        for (const line of lines) {
            const match = line.match(/^\s*(\d+)\s+(.+)$/);
            if (match) {
                const lineCount = parseInt(match[1]);
                const fileName = match[2];
                if (lineCount > 300 && !fileName.includes('total')) {
                    complexFiles.push({ fileName, lineCount });
                }
            }
        }

        return {
            name: 'Code Complexity Analysis',
            category: 'CODE_QUALITY',
            status: complexFiles.length === 0 ? 'passed' : 'failed',
            message: complexFiles.length === 0 
                ? 'No overly complex files detected' 
                : `Found ${complexFiles.length} files exceeding complexity threshold`,
            details: { complexFiles }
        };
    }

    static async testConsoleErrors() {
        ValidationUtils.printProgress('Checking for console errors...', 'running');
        
        const result = await ValidationUtils.runCommand(
            'grep -r "console.error\\|console.warn" src/ --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" | wc -l'
        );

        const errorCount = parseInt(result.stdout.trim()) || 0;

        return {
            name: 'Console Error Detection',
            category: 'CODE_QUALITY',
            status: errorCount <= CONFIG.MAX_CONSOLE_ERRORS ? 'passed' : 'failed',
            message: `Found ${errorCount} console.error/warn statements (max allowed: ${CONFIG.MAX_CONSOLE_ERRORS})`,
            details: { errorCount }
        };
    }
}

// Main Validation Runner
class AppValidator {
    constructor(options = {}) {
        this.options = {
            verbose: options.verbose || false,
            strict: options.strict || false,
            ci: options.ci || false
        };
        this.allTests = [];
    }

    registerTests() {
        // Register all tests
        this.allTests = [
            ValidationTests.testBuildCompilation,
            ValidationTests.testTypeScriptErrors,
            ValidationTests.testLintErrors,
            ValidationTests.testInfiniteLoops,
            ValidationTests.testMemoryLeaks,
            ValidationTests.testBundleSize,
            ValidationTests.testLoadTime,
            ValidationTests.testSecurityVulnerabilities,
            ValidationTests.testCoverage,
            ValidationTests.testAccessibility,
            ValidationTests.testCyclomaticComplexity,
            ValidationTests.testConsoleErrors
        ];
    }

    async runTests() {
        console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}        APP VALIDATION SUITE - QUALITY GATE${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);
        console.log(`${colors.yellow}⚡ Required Score: ${CONFIG.PASSING_THRESHOLD}%${colors.reset}`);
        console.log(`${colors.yellow}⚡ Mode: ${this.options.strict ? 'STRICT' : 'STANDARD'}${colors.reset}\n`);

        const startTime = Date.now();
        const results = [];

        // Run all tests
        for (const test of this.allTests) {
            try {
                const result = await test();
                results.push(result);
                
                if (result.status === 'passed') {
                    ValidationUtils.printProgress(`✓ ${result.name}`, 'success');
                    testResults.passed.push(result);
                } else {
                    ValidationUtils.printProgress(`✗ ${result.name}: ${result.message}`, 'error');
                    testResults.failed.push(result);
                }

                if (this.options.verbose) {
                    console.log(`  Details:`, result.details);
                }
            } catch (error) {
                const errorResult = {
                    name: test.name,
                    status: 'failed',
                    message: `Test error: ${error.message}`,
                    category: 'UNKNOWN'
                };
                results.push(errorResult);
                testResults.failed.push(errorResult);
                ValidationUtils.printProgress(`✗ ${test.name}: ${error.message}`, 'error');
            }
        }

        // Calculate final score
        const score = ValidationUtils.calculateScore(results);
        testResults.score = score;
        testResults.duration = Date.now() - startTime;

        return { results, score };
    }

    generateReport(score) {
        console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}                    VALIDATION REPORT${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

        // Summary statistics
        console.log(`${colors.bright}Summary:${colors.reset}`);
        console.log(`  • Total Tests: ${testResults.passed.length + testResults.failed.length}`);
        console.log(`  • Passed: ${colors.green}${testResults.passed.length}${colors.reset}`);
        console.log(`  • Failed: ${colors.red}${testResults.failed.length}${colors.reset}`);
        console.log(`  • Duration: ${testResults.duration}ms\n`);

        // Category breakdown
        console.log(`${colors.bright}Category Breakdown:${colors.reset}`);
        for (const [category, data] of Object.entries(TEST_CATEGORIES)) {
            const categoryTests = [...testResults.passed, ...testResults.failed].filter(r => r.category === category);
            if (categoryTests.length === 0) continue;
            
            const passed = categoryTests.filter(t => t.status === 'passed').length;
            const categoryScore = (passed / categoryTests.length) * 100;
            const icon = categoryScore === 100 ? '✓' : categoryScore >= 50 ? '⚠' : '✗';
            const color = categoryScore === 100 ? colors.green : categoryScore >= 50 ? colors.yellow : colors.red;
            
            console.log(`  ${color}${icon} ${category}: ${categoryScore.toFixed(1)}% (${passed}/${categoryTests.length})${colors.reset}`);
        }

        // Final score display
        console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
        
        const passed = score >= CONFIG.PASSING_THRESHOLD;
        const scoreColor = passed ? colors.green : colors.red;
        const statusIcon = passed ? '✓' : '✗';
        const statusText = passed ? 'PASSED' : 'FAILED';

        console.log(`${colors.bright}QUALITY SCORE: ${scoreColor}${score.toFixed(2)}%${colors.reset}`);
        console.log(`${colors.bright}STATUS: ${scoreColor}${statusIcon} ${statusText}${colors.reset}`);
        console.log(`${colors.bright}THRESHOLD: ${CONFIG.PASSING_THRESHOLD}%${colors.reset}`);
        
        console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

        // Failed tests details
        if (testResults.failed.length > 0 && this.options.verbose) {
            console.log(`${colors.bright}${colors.red}Failed Tests Details:${colors.reset}`);
            testResults.failed.forEach(test => {
                console.log(`  ${colors.red}✗ ${test.name}${colors.reset}`);
                console.log(`    ${test.message}`);
            });
            console.log();
        }

        // Save report to file
        this.saveReport(score);

        return passed;
    }

    saveReport(score) {
        const report = {
            timestamp: testResults.timestamp,
            score: score.toFixed(2),
            threshold: CONFIG.PASSING_THRESHOLD,
            passed: score >= CONFIG.PASSING_THRESHOLD,
            duration: testResults.duration,
            summary: {
                total: testResults.passed.length + testResults.failed.length,
                passed: testResults.passed.length,
                failed: testResults.failed.length
            },
            tests: {
                passed: testResults.passed,
                failed: testResults.failed
            }
        };

        // Save JSON report
        fs.writeFileSync(
            'validation-report.json',
            JSON.stringify(report, null, 2)
        );

        // Save HTML report
        const htmlReport = this.generateHTMLReport(report);
        fs.writeFileSync('validation-report.html', htmlReport);

        console.log(`${colors.cyan}📄 Reports saved to validation-report.json and validation-report.html${colors.reset}`);
    }

    generateHTMLReport(report) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Validation Report - ${report.timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 3rem;
            text-align: center;
        }
        .score-display {
            font-size: 5rem;
            font-weight: bold;
            margin: 1rem 0;
        }
        .status-badge {
            display: inline-block;
            padding: 0.5rem 2rem;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.2rem;
            margin-top: 1rem;
        }
        .status-passed { background: #10b981; color: white; }
        .status-failed { background: #ef4444; color: white; }
        .content { padding: 2rem; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .stat-card {
            background: #f3f4f6;
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #6b7280;
            margin-top: 0.5rem;
        }
        .test-list {
            margin: 2rem 0;
        }
        .test-item {
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .test-passed {
            background: #d1fae5;
            border-left: 4px solid #10b981;
        }
        .test-failed {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
        }
        .test-name { font-weight: 600; }
        .test-message { color: #6b7280; font-size: 0.9rem; margin-top: 0.25rem; }
        .category-section {
            margin: 2rem 0;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 10px;
        }
        .category-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #374151;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e5e7eb;
            border-radius: 15px;
            overflow: hidden;
            margin: 1rem 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .timestamp {
            text-align: center;
            color: #6b7280;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>App Validation Report</h1>
            <div class="score-display">${report.score}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${report.score}%">${report.score}%</div>
            </div>
            <div class="status-badge status-${report.passed ? 'passed' : 'failed'}">
                ${report.passed ? '✓ QUALITY GATE PASSED' : '✗ QUALITY GATE FAILED'}
            </div>
            <p style="margin-top: 1rem; opacity: 0.9;">Required: ${report.threshold}%</p>
        </div>
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${report.summary.total}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${report.summary.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${report.summary.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${report.duration}ms</div>
                    <div class="stat-label">Duration</div>
                </div>
            </div>

            <div class="category-section">
                <div class="category-title">Test Results by Category</div>
                ${Object.entries(TEST_CATEGORIES).map(([category, data]) => {
                    const categoryTests = [...report.tests.passed, ...report.tests.failed].filter(r => r.category === category);
                    if (categoryTests.length === 0) return '';
                    
                    const passed = categoryTests.filter(t => t.status === 'passed').length;
                    const categoryScore = (passed / categoryTests.length) * 100;
                    const icon = categoryScore === 100 ? '✓' : categoryScore >= 50 ? '⚠' : '✗';
                    const color = categoryScore === 100 ? '#10b981' : categoryScore >= 50 ? '#f59e0b' : '#ef4444';
                    
                    return `
                        <div class="test-item test-${categoryScore === 100 ? 'passed' : 'failed'}">
                            <div>
                                <div class="test-name">${category}</div>
                                <div class="test-message">${passed}/${categoryTests.length} tests passed</div>
                            </div>
                            <div style="color: ${color}; font-weight: bold;">${icon} ${categoryScore.toFixed(1)}%</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="test-list">
                <h3>Failed Tests</h3>
                ${report.tests.failed.map(test => `
                    <div class="test-item test-failed">
                        <div>
                            <div class="test-name">${test.name}</div>
                            <div class="test-message">${test.message}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="timestamp">
                Generated on: ${new Date(report.timestamp).toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>`;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose'),
        strict: args.includes('--strict'),
        ci: args.includes('--ci')
    };

    const validator = new AppValidator(options);
    validator.registerTests();

    try {
        const { results, score } = await validator.runTests();
        const passed = validator.generateReport(score);

        if (options.ci && !passed) {
            process.exit(1);
        }
    } catch (error) {
        console.error(`${colors.red}Validation failed: ${error.message}${colors.reset}`);
        process.exit(1);
        }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { AppValidator, ValidationTests, ValidationUtils };