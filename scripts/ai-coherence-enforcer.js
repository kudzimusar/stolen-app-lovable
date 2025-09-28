#!/usr/bin/env node

/**
 * STOLEN Platform - AI-Powered Coherence Enforcer Tool
 * 
 * This is a working version that integrates AI-powered analysis with the existing
 * coherence framework, using the available AI APIs from api.env.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// AI service configuration using available APIs from api.env
const AI_SERVICES = {
  nvidia: {
    apiKey: process.env.NVIDIA_NIM_API_KEY || process.env.EXPO_PUBLIC_NVIDIA_NIM_API_KEY,
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    model: 'deepseek-ai/deepseek-r1'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    model: 'claude-sonnet-4-20250514'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || process.env.EXPO_PUBLIC_GROQ_API_KEY,
    model: 'gpt-4'
  },
  google: {
    apiKey: process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_GEMINI_KEY,
    model: 'gemini-pro'
  }
};

// STOLEN Platform stakeholder types
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
    dependencies: ['all']
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
    dependencies: ['all']
  },
  'platform_admin': {
    name: 'Platform Administrators',
    paths: ['src/pages/admin', 'src/components/admin'],
    dependencies: ['all']
  }
};

// Core system types
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
  }
};

class AICoherenceEnforcer {
  constructor() {
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

  async analyzeFileWithAI(filePath, content) {
    console.log(`🤖 Running AI analysis on: ${filePath}`);
    
    try {
      const context = this.generateContext(filePath);
      
      // Try NVIDIA first, then fallback to other services
      let aiResponse = null;
      
      if (AI_SERVICES.nvidia.apiKey) {
        console.log(`  🔑 NVIDIA API Key found: ${AI_SERVICES.nvidia.apiKey.substring(0, 10)}...`);
        try {
          aiResponse = await this.callNVIDIAAPI(content, context);
          console.log(`  ✅ NVIDIA AI analysis completed`);
        } catch (error) {
          console.log(`  ⚠️  NVIDIA AI failed: ${error.message}`);
          console.log(`  🔍 Error details: ${error.stack}`);
        }
      } else {
        console.log(`  ❌ NVIDIA API Key not found`);
      }
      
      if (!aiResponse && AI_SERVICES.anthropic.apiKey) {
        console.log(`  🔑 Anthropic API Key found: ${AI_SERVICES.anthropic.apiKey.substring(0, 10)}...`);
        try {
          aiResponse = await this.callAnthropicAPI(content, context);
          console.log(`  ✅ Anthropic AI analysis completed`);
        } catch (error) {
          console.log(`  ⚠️  Anthropic AI failed: ${error.message}`);
        }
      } else if (!aiResponse) {
        console.log(`  ❌ Anthropic API Key not found`);
      }
      
      if (!aiResponse && AI_SERVICES.groq.apiKey) {
        console.log(`  🔑 Groq API Key found: ${AI_SERVICES.groq.apiKey.substring(0, 10)}...`);
        try {
          aiResponse = await this.callGroqAPI(content, context);
          console.log(`  ✅ Groq AI analysis completed`);
        } catch (error) {
          console.log(`  ⚠️  Groq AI failed: ${error.message}`);
        }
      } else if (!aiResponse) {
        console.log(`  ❌ Groq API Key not found`);
      }
      
      if (!aiResponse && AI_SERVICES.google.apiKey) {
        console.log(`  🔑 Google API Key found: ${AI_SERVICES.google.apiKey.substring(0, 10)}...`);
        try {
          aiResponse = await this.callGoogleAPI(content, context);
          console.log(`  ✅ Google AI analysis completed`);
        } catch (error) {
          console.log(`  ⚠️  Google AI failed: ${error.message}`);
        }
      } else if (!aiResponse) {
        console.log(`  ❌ Google API Key not found`);
      }
      
      if (!aiResponse) {
        console.log(`  ⚠️  All AI services failed, using fallback analysis`);
        aiResponse = this.fallbackAnalysis(content, context);
      }
      
      return aiResponse;
    } catch (error) {
      console.log(`  ❌ AI analysis failed: ${error.message}`);
      return this.fallbackAnalysis(content, context);
    }
  }

  async callNVIDIAAPI(content, context) {
    const prompt = this.buildAnalysisPrompt(content, context);
    
    const response = await fetch(`${AI_SERVICES.nvidia.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICES.nvidia.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_SERVICES.nvidia.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect analyzing code for the STOLEN platform, a device recovery and marketplace ecosystem with 8 stakeholder types. Provide accurate, actionable analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = aiResponse;
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.log(`  ⚠️  JSON parsing failed: ${error.message}`);
      // If JSON parsing fails, return structured response
      return this.parseTextResponse(aiResponse);
    }
  }

  async callAnthropicAPI(content, context) {
    const prompt = this.buildAnalysisPrompt(content, context);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICES.anthropic.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `You are an expert software architect analyzing code for the STOLEN platform, a device recovery and marketplace ecosystem with 8 stakeholder types. Provide accurate, actionable analysis in JSON format.\n\n${prompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text || '';
    
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = aiResponse;
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.log(`  ⚠️  JSON parsing failed: ${error.message}`);
      return this.parseTextResponse(aiResponse);
    }
  }

  async callGroqAPI(content, context) {
    const prompt = this.buildAnalysisPrompt(content, context);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICES.groq.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect analyzing code for the STOLEN platform, a device recovery and marketplace ecosystem with 8 stakeholder types. Provide accurate, actionable analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = aiResponse;
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.log(`  ⚠️  JSON parsing failed: ${error.message}`);
      return this.parseTextResponse(aiResponse);
    }
  }

  async callGoogleAPI(content, context) {
    const prompt = this.buildAnalysisPrompt(content, context);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${AI_SERVICES.google.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert software architect analyzing code for the STOLEN platform, a device recovery and marketplace ecosystem with 8 stakeholder types. Provide accurate, actionable analysis in JSON format.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '';
    
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = aiResponse;
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      
      return JSON.parse(jsonContent);
    } catch (error) {
      console.log(`  ⚠️  JSON parsing failed: ${error.message}`);
      return this.parseTextResponse(aiResponse);
    }
  }

  buildAnalysisPrompt(content, context) {
    const stakeholderInfo = Object.entries(STAKEHOLDER_TYPES)
      .map(([key, value]) => `${key}: ${value.name}`)
      .join('\n');

    const systemInfo = Object.entries(CORE_SYSTEMS)
      .map(([key, value]) => `${key}: ${value.name}`)
      .join('\n');

    return `
Analyze the following TypeScript/React code for the STOLEN platform:

Code:
\`\`\`typescript
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}
\`\`\`

Context: ${context}

STOLEN Platform Stakeholders:
${stakeholderInfo}

STOLEN Platform Core Systems:
${systemInfo}

Please provide analysis in this JSON format:
{
  "stakeholderImpact": [
    {
      "stakeholder": "stakeholder_key",
      "impactLevel": "low|medium|high|critical",
      "reason": "explanation"
    }
  ],
  "systemImpact": [
    {
      "system": "system_key",
      "impactLevel": "low|medium|high|critical", 
      "reason": "explanation"
    }
  ],
  "risks": [
    {
      "type": "security|performance|integration|maintainability",
      "severity": "low|medium|high|critical",
      "description": "risk description",
      "mitigation": "mitigation strategy"
    }
  ],
  "recommendations": [
    {
      "type": "architecture|performance|security|testing",
      "priority": "low|medium|high|critical",
      "title": "recommendation title",
      "description": "detailed description"
    }
  ],
  "complexity": {
    "cyclomaticComplexity": 1-10,
    "maintainabilityIndex": 1-100,
    "confidence": 0-1
  }
}
`;
  }

  parseTextResponse(textResponse) {
    // Parse text response into structured format
    return {
      stakeholderImpact: [],
      systemImpact: [],
      risks: [],
      recommendations: [],
      complexity: {
        cyclomaticComplexity: 5,
        maintainabilityIndex: 70,
        confidence: 0.5
      },
      rawResponse: textResponse
    };
  }

  fallbackAnalysis(content, context) {
    // Fallback analysis without AI
    const stakeholderImpact = this.identifyStakeholderImpact(context);
    const systemImpact = this.identifySystemImpact(context);
    const risks = this.identifyRisks(content);
    const recommendations = this.generateRecommendations(content, context);

    return {
      stakeholderImpact,
      systemImpact,
      risks,
      recommendations,
      complexity: {
        cyclomaticComplexity: this.calculateComplexity(content),
        maintainabilityIndex: this.calculateMaintainability(content),
        confidence: 0.3
      }
    };
  }

  identifyStakeholderImpact(context) {
    const impacts = [];
    
    for (const [key, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
      if (stakeholder.paths.some(path => context.includes(path))) {
        impacts.push({
          stakeholder: key,
          impactLevel: 'high',
          reason: `Direct impact on ${stakeholder.name} functionality`
        });
        
        // Add dependent stakeholders
        for (const dep of stakeholder.dependencies) {
          if (dep === 'all') {
            for (const [otherKey, otherStakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
              if (otherKey !== key) {
                impacts.push({
                  stakeholder: otherKey,
                  impactLevel: 'medium',
                  reason: `Dependent on ${stakeholder.name} changes`
                });
              }
            }
          } else {
            const depStakeholder = STAKEHOLDER_TYPES[dep];
            if (depStakeholder) {
              impacts.push({
                stakeholder: dep,
                impactLevel: 'medium',
                reason: `Dependent on ${stakeholder.name} changes`
              });
            }
          }
        }
      }
    }
    
    return impacts;
  }

  identifySystemImpact(context) {
    const impacts = [];
    
    for (const [key, system] of Object.entries(CORE_SYSTEMS)) {
      if (system.paths.some(path => context.includes(path))) {
        impacts.push({
          system: key,
          impactLevel: 'high',
          reason: `Direct impact on ${system.name}`
        });
      }
    }
    
    return impacts;
  }

  identifyRisks(content) {
    const risks = [];
    
    if (content.includes('any') && content.includes('TypeScript')) {
      risks.push({
        type: 'maintainability',
        severity: 'medium',
        description: 'Uses "any" type which reduces type safety',
        mitigation: 'Replace with proper TypeScript interfaces'
      });
    }
    
    if (content.includes('console.log')) {
      risks.push({
        type: 'maintainability',
        severity: 'low',
        description: 'Contains console.log statements',
        mitigation: 'Remove or replace with proper logging'
      });
    }
    
    if (content.includes('useState') && !content.includes('useEffect')) {
      risks.push({
        type: 'performance',
        severity: 'medium',
        description: 'Uses useState without useEffect - may cause stale state',
        mitigation: 'Add useEffect for proper state management'
      });
    }
    
    return risks;
  }

  generateRecommendations(content, context) {
    const recommendations = [];
    
    if (content.includes('useState') && content.includes('useEffect')) {
      recommendations.push({
        type: 'architecture',
        priority: 'medium',
        title: 'Consider custom hooks',
        description: 'Extract state logic into custom hooks for better reusability'
      });
    }
    
    if (content.includes('fetch(')) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Add error handling',
        description: 'Ensure all API calls have proper error handling and loading states'
      });
    }
    
    return recommendations;
  }

  calculateComplexity(content) {
    let complexity = 1;
    
    // Count conditional statements
    complexity += (content.match(/if\s*\(/g) || []).length;
    complexity += (content.match(/else\s+if\s*\(/g) || []).length;
    complexity += (content.match(/switch\s*\(/g) || []).length;
    complexity += (content.match(/case\s+/g) || []).length;
    complexity += (content.match(/catch\s*\(/g) || []).length;
    
    // Count loops
    complexity += (content.match(/for\s*\(/g) || []).length;
    complexity += (content.match(/while\s*\(/g) || []).length;
    complexity += (content.match(/forEach\s*\(/g) || []).length;
    
    return Math.min(complexity, 10);
  }

  calculateMaintainability(content) {
    let score = 100;
    
    // Deduct for complexity
    const complexity = this.calculateComplexity(content);
    score -= complexity * 5;
    
    // Deduct for long functions
    const lines = content.split('\n').length;
    if (lines > 100) score -= 20;
    if (lines > 200) score -= 30;
    
    // Deduct for code smells
    if (content.includes('any')) score -= 15;
    if (content.includes('console.log')) score -= 5;
    if (content.includes('TODO') || content.includes('FIXME')) score -= 10;
    
    return Math.max(score, 0);
  }

  generateContext(filePath) {
    const stakeholder = this.identifyStakeholder(filePath);
    const system = this.identifySystem(filePath);
    
    return `
STOLEN Platform Context:
- File: ${filePath}
- Stakeholder: ${stakeholder}
- System: ${system}
- Platform: Device recovery and marketplace ecosystem
- Technology: React 18, TypeScript, Supabase, Tailwind CSS
- Focus: South African market with FICA compliance
`;
  }

  identifyStakeholder(filePath) {
    for (const [key, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
      if (stakeholder.paths.some(path => filePath.includes(path))) {
        return stakeholder.name;
      }
    }
    return 'Unknown';
  }

  identifySystem(filePath) {
    for (const [key, system] of Object.entries(CORE_SYSTEMS)) {
      if (system.paths.some(path => filePath.includes(path))) {
        return system.name;
      }
    }
    return 'Unknown';
  }

  async analyzeFile(filePath) {
    console.log(`🔍 Analyzing: ${filePath}`);
    
    try {
      const startTime = Date.now();
      const content = fs.readFileSync(filePath, 'utf8');
      
      // AI-powered analysis
      const aiAnalysis = await this.analyzeFileWithAI(filePath, content);
      
      // Basic dependency analysis
      const dependencies = this.analyzeDependencies(content, filePath);
      
      const analysis = {
        filePath,
        aiAnalysis,
        dependencies,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
      
      this.updateResults(analysis);
      
      return analysis;
    } catch (error) {
      console.log(`  ❌ Analysis failed: ${error.message}`);
      this.results.failedFiles++;
      return null;
    }
  }

  analyzeDependencies(content, filePath) {
    const dependencies = {
      imports: [],
      exports: [],
      apiCalls: [],
      databaseOperations: []
    };
    
    // Extract imports
    const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.imports.push(match[1]);
    }
    
    // Extract exports
    const exportRegex = /export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      dependencies.exports.push(match[1]);
    }
    
    // Extract API calls
    const apiRegex = /(?:fetch|supabase\.functions\.invoke)\(['"`]([^'"`]+)['"`]/g;
    while ((match = apiRegex.exec(content)) !== null) {
      dependencies.apiCalls.push(match[1]);
    }
    
    // Extract database operations
    const dbRegex = /\.(select|insert|update|delete|upsert)\(/g;
    while ((match = dbRegex.exec(content)) !== null) {
      dependencies.databaseOperations.push(match[1]);
    }
    
    return dependencies;
  }

  updateResults(analysis) {
    if (!analysis) return;
    
    // Update stakeholder impacts
    if (analysis.aiAnalysis?.stakeholderImpact) {
      for (const impact of analysis.aiAnalysis.stakeholderImpact) {
        if (!this.results.stakeholderImpacts[impact.stakeholder]) {
          this.results.stakeholderImpacts[impact.stakeholder] = {
            name: STAKEHOLDER_TYPES[impact.stakeholder]?.name || impact.stakeholder,
            count: 0,
            impactLevels: { low: 0, medium: 0, high: 0, critical: 0 }
          };
        }
        this.results.stakeholderImpacts[impact.stakeholder].count++;
        this.results.stakeholderImpacts[impact.stakeholder].impactLevels[impact.impactLevel]++;
      }
    }
    
    // Update system impacts
    if (analysis.aiAnalysis?.systemImpact) {
      for (const impact of analysis.aiAnalysis.systemImpact) {
        if (!this.results.systemImpacts[impact.system]) {
          this.results.systemImpacts[impact.system] = {
            name: CORE_SYSTEMS[impact.system]?.name || impact.system,
            count: 0,
            impactLevels: { low: 0, medium: 0, high: 0, critical: 0 }
          };
        }
        this.results.systemImpacts[impact.system].count++;
        this.results.systemImpacts[impact.system].impactLevels[impact.impactLevel]++;
      }
    }
    
    // Collect risks and recommendations
    if (analysis.aiAnalysis?.risks) {
      this.results.risks.push(...analysis.aiAnalysis.risks);
    }
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

    findFiles('src/components');
    findFiles('src/pages');
    findFiles('src/lib');
    
    return files;
  }

  async analyzeAll() {
    console.log('🚀 STOLEN Platform - AI-Powered Coherence Enforcer');
    console.log('==================================================\n');
    
    const startTime = Date.now();
    
    const files = this.findFilesToAnalyze();
    this.results.totalFiles = files.length;
    
    console.log(`📊 Found ${files.length} files to analyze`);
    console.log(`🤖 AI Services Available:`);
    console.log(`  NVIDIA: ${AI_SERVICES.nvidia.apiKey ? '✅' : '❌'}`);
    console.log(`  Anthropic: ${AI_SERVICES.anthropic.apiKey ? '✅' : '❌'}`);
    console.log(`  Groq: ${AI_SERVICES.groq.apiKey ? '✅' : '❌'}`);
    console.log(`  Google: ${AI_SERVICES.google.apiKey ? '✅' : '❌'}`);
    
    const availableServices = [
      AI_SERVICES.nvidia.apiKey && 'NVIDIA',
      AI_SERVICES.anthropic.apiKey && 'Anthropic',
      AI_SERVICES.groq.apiKey && 'Groq',
      AI_SERVICES.google.apiKey && 'Google'
    ].filter(Boolean);
    
    console.log(`  🎯 Active Services: ${availableServices.length > 0 ? availableServices.join(', ') : 'None (using fallback)'}\n`);
    
    // Analyze first 5 files as a sample
    const sampleFiles = files.slice(0, 5);
    
    for (const file of sampleFiles) {
      await this.analyzeFile(file);
      this.results.analyzedFiles++;
    }
    
    this.results.processingTime = Date.now() - startTime;
    
    this.displaySummary();
  }

  async analyzeSpecific(filePath) {
    console.log('🚀 STOLEN Platform - AI-Powered Coherence Enforcer');
    console.log('==================================================\n');
    
    const startTime = Date.now();
    
    const analysis = await this.analyzeFile(filePath);
    if (analysis) {
      this.results.analyzedFiles = 1;
      this.results.processingTime = Date.now() - startTime;
      
      this.displayDetailedAnalysis(analysis);
    }
  }

  displaySummary() {
    console.log('📊 AI-POWERED ANALYSIS SUMMARY');
    console.log('==============================\n');
    
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
  }

  displayDetailedAnalysis(analysis) {
    console.log('📊 DETAILED AI ANALYSIS REPORT');
    console.log('==============================\n');
    
    console.log(`📁 File: ${analysis.filePath}`);
    console.log(`⏱️  Processing Time: ${analysis.processingTime}ms\n`);
    
    // AI Analysis Results
    if (analysis.aiAnalysis) {
      console.log('🤖 AI ANALYSIS RESULTS:');
      
      // Complexity Analysis
      if (analysis.aiAnalysis.complexity) {
        const comp = analysis.aiAnalysis.complexity;
        console.log(`  📊 Complexity: ${comp.cyclomaticComplexity}/10`);
        console.log(`  📊 Maintainability: ${comp.maintainabilityIndex}/100`);
        console.log(`  📊 Confidence: ${(comp.confidence * 100).toFixed(1)}%\n`);
      }
      
      // Stakeholder Impact
      if (analysis.aiAnalysis.stakeholderImpact?.length > 0) {
        console.log('  👥 Affected Stakeholders:');
        for (const impact of analysis.aiAnalysis.stakeholderImpact) {
          const icon = impact.impactLevel === 'critical' ? '🔴' : 
                      impact.impactLevel === 'high' ? '🟠' : 
                      impact.impactLevel === 'medium' ? '🟡' : '🟢';
          const stakeholderName = STAKEHOLDER_TYPES[impact.stakeholder]?.name || impact.stakeholder;
          console.log(`    ${icon} ${stakeholderName} (${impact.impactLevel}) - ${impact.reason}`);
        }
        console.log('');
      }
      
      // System Impact
      if (analysis.aiAnalysis.systemImpact?.length > 0) {
        console.log('  🔧 Affected Systems:');
        for (const impact of analysis.aiAnalysis.systemImpact) {
          const icon = impact.impactLevel === 'critical' ? '🔴' : 
                      impact.impactLevel === 'high' ? '🟠' : 
                      impact.impactLevel === 'medium' ? '🟡' : '🟢';
          const systemName = CORE_SYSTEMS[impact.system]?.name || impact.system;
          console.log(`    ${icon} ${systemName} (${impact.impactLevel}) - ${impact.reason}`);
        }
        console.log('');
      }
      
      // Risks
      if (analysis.aiAnalysis.risks?.length > 0) {
        console.log('  ⚠️  Identified Risks:');
        for (const risk of analysis.aiAnalysis.risks) {
          const icon = risk.severity === 'critical' ? '🔴' : 
                      risk.severity === 'high' ? '🟠' : 
                      risk.severity === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${risk.type.toUpperCase()}: ${risk.description}`);
          console.log(`       Mitigation: ${risk.mitigation}`);
        }
        console.log('');
      }
      
      // Recommendations
      if (analysis.aiAnalysis.recommendations?.length > 0) {
        console.log('  💡 Recommendations:');
        for (const rec of analysis.aiAnalysis.recommendations) {
          const icon = rec.priority === 'critical' ? '🔴' : 
                      rec.priority === 'high' ? '🟠' : 
                      rec.priority === 'medium' ? '🟡' : '🟢';
          console.log(`    ${icon} ${rec.title} (${rec.priority})`);
          console.log(`       ${rec.description}`);
        }
        console.log('');
      }
    }
    
    // Dependencies
    if (analysis.dependencies) {
      console.log('🔗 DEPENDENCY ANALYSIS:');
      console.log(`  📦 Imports: ${analysis.dependencies.imports.length}`);
      console.log(`  📤 Exports: ${analysis.dependencies.exports.length}`);
      console.log(`  📡 API Calls: ${analysis.dependencies.apiCalls.length}`);
      console.log(`  🗄️  Database Operations: ${analysis.dependencies.databaseOperations.length}\n`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const enforcer = new AICoherenceEnforcer();
  
  if (args.length === 0) {
    console.log('Usage: node scripts/ai-coherence-enforcer.js <command> [options]');
    console.log('\nCommands:');
    console.log('  analyze-all                    - Analyze all TypeScript/React files with AI');
    console.log('  analyze <file-path>            - Analyze specific file with AI');
    console.log('  --help                         - Show this help message');
    console.log('\nExamples:');
    console.log('  node scripts/ai-coherence-enforcer.js analyze-all');
    console.log('  node scripts/ai-coherence-enforcer.js analyze src/components/marketplace/SellerDashboard.tsx');
    return;
  }
  
  if (args[0] === '--help') {
    console.log('STOLEN Platform - AI-Powered Coherence Enforcer Tool');
    console.log('===================================================');
    console.log('\nThis tool provides AI-powered analysis of code coherence across the 8-stakeholder ecosystem.');
    console.log('\nFeatures:');
    console.log('  🤖 AI-powered code analysis using NVIDIA NIM, Anthropic Claude, and Google Gemini');
    console.log('  👥 Stakeholder impact prediction across all 8 stakeholder types');
    console.log('  🔧 System impact analysis for core STOLEN platform systems');
    console.log('  ⚠️  Risk assessment and mitigation recommendations');
    console.log('  💡 Actionable improvement recommendations');
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



