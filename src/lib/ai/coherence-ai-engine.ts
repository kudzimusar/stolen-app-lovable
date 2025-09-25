/**
 * STOLEN Platform - AI-Powered Coherence Analysis Engine
 * 
 * This module provides AI-powered analysis for code coherence across the 8-stakeholder ecosystem.
 * Uses multiple AI providers for robust analysis and fallback capabilities.
 */

// AI service configuration using available APIs from api.env
export const AI_SERVICES = {
  primary: {
    provider: 'nvidia',
    model: 'deepseek-ai/deepseek-r1',
    apiKey: process.env.NVIDIA_NIM_API_KEY || process.env.EXPO_PUBLIC_NVIDIA_NIM_API_KEY,
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    temperature: 0.3,
    maxTokens: 4096
  },
  fallback: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    temperature: 0.3,
    maxTokens: 4096
  },
  tertiary: {
    provider: 'groq',
    model: 'gpt-4',
    apiKey: process.env.GROQ_API_KEY || process.env.EXPO_PUBLIC_GROQ_API_KEY,
    temperature: 0.3,
    maxTokens: 2048
  },
  visual: {
    provider: 'google',
    model: 'gemini-pro',
    apiKey: process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_GEMINI_KEY,
    temperature: 0.3,
    maxTokens: 2048
  }
};

// STOLEN Platform stakeholder types
export const STAKEHOLDER_TYPES = {
  'individual_users': {
    name: 'Individual Users',
    paths: ['src/pages/user', 'src/components/user'],
    dependencies: ['marketplace', 'payment', 'insurance', 'repair'],
    description: 'Device owners, buyers, and sellers'
  },
  'repair_shops': {
    name: 'Repair Shops',
    paths: ['src/pages/repair', 'src/components/repair'],
    dependencies: ['insurance', 'marketplace', 'payment'],
    description: 'Device repair and maintenance services'
  },
  'retailers': {
    name: 'Retailers',
    paths: ['src/pages/retailers', 'src/components/retailers'],
    dependencies: ['marketplace', 'payment', 'admin'],
    description: 'Device sales and inventory management'
  },
  'law_enforcement': {
    name: 'Law Enforcement',
    paths: ['src/pages/law-enforcement', 'src/components/law-enforcement'],
    dependencies: ['all'],
    description: 'Investigation and recovery tools'
  },
  'ngo_partners': {
    name: 'NGO Partners',
    paths: ['src/pages/ngo', 'src/components/ngo'],
    dependencies: ['individual_users', 'law_enforcement', 'admin'],
    description: 'Community programs and donations'
  },
  'insurance_admin': {
    name: 'Insurance Admin',
    paths: ['src/pages/insurance', 'src/components/insurance'],
    dependencies: ['repair_shops', 'individual_users', 'payment'],
    description: 'Claims processing and risk management'
  },
  'banks_payment': {
    name: 'Banks/Payment Gateways',
    paths: ['src/pages/payment', 'src/components/payment'],
    dependencies: ['all'],
    description: 'Financial transaction processing'
  },
  'platform_admin': {
    name: 'Platform Administrators',
    paths: ['src/pages/admin', 'src/components/admin'],
    dependencies: ['all'],
    description: 'System oversight and management'
  }
};

// Core system types
export const CORE_SYSTEMS = {
  'marketplace': {
    name: 'Marketplace Platform',
    paths: ['src/components/marketplace', 'src/pages/marketplace'],
    stakeholders: ['individual_users', 'retailers', 'repair_shops'],
    description: 'Buy/sell transactions, escrow protection, trust scoring'
  },
  'payment': {
    name: 'S-Pay Wallet System',
    paths: ['src/lib/payment', 'src/components/payment'],
    stakeholders: ['all'],
    description: 'ZAR currency, South African banking integration, fraud prevention'
  },
  'blockchain': {
    name: 'Blockchain Integration',
    paths: ['src/lib/blockchain', 'src/adapters'],
    stakeholders: ['all'],
    description: 'Device ownership records and transaction history'
  },
  'ai_ml': {
    name: 'AI/ML Services',
    paths: ['src/lib/ai', 'src/components/ai'],
    stakeholders: ['all'],
    description: 'Fraud detection, pattern recognition, automated processing'
  },
  'security': {
    name: 'Security Framework',
    paths: ['src/lib/security', 'src/components/security'],
    stakeholders: ['all'],
    description: 'Multi-factor authentication, role-based access, audit logging'
  },
  'reverse_verification': {
    name: 'Reverse Verification Tool',
    paths: ['src/lib/security', 'src/components/security'],
    stakeholders: ['all'],
    description: 'Multi-format device verification (QR, OCR, manual)'
  }
};

// Analysis result interfaces
export interface ComplexityAnalysis {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  confidence: number;
}

export interface ImpactPrediction {
  affectedStakeholders: Array<{
    type: string;
    name: string;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    confidence: number;
  }>;
  affectedSystems: Array<{
    type: string;
    name: string;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    confidence: number;
  }>;
  integrationRisks: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }>;
  overallConfidence: number;
}

export interface RiskAssessment {
  risks: Array<{
    type: 'security' | 'performance' | 'integration' | 'maintainability' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    mitigation: string;
    confidence: number;
  }>;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface Recommendation {
  type: 'architecture' | 'performance' | 'security' | 'testing' | 'integration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface CodeAnalysis {
  filePath: string;
  complexity: ComplexityAnalysis;
  impact: ImpactPrediction;
  risks: RiskAssessment;
  recommendations: Recommendation[];
  timestamp: Date;
  aiProvider: string;
  processingTime: number;
}

// AI service interface
interface AIService {
  analyzeCodeComplexity(code: string, context: string): Promise<ComplexityAnalysis>;
  predictStakeholderImpact(code: string, context: string): Promise<ImpactPrediction>;
  detectIntegrationRisks(code: string, context: string): Promise<RiskAssessment>;
  generateRecommendations(analysis: CodeAnalysis): Promise<Recommendation[]>;
}

// NVIDIA NIM AI Service
class NVIDIAService implements AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async analyzeCodeComplexity(code: string, context: string): Promise<ComplexityAnalysis> {
    const prompt = `
Analyze the following TypeScript/React code for complexity metrics:

Code:
\`\`\`typescript
${code}
\`\`\`

Context: ${context}

Please provide:
1. Cyclomatic complexity (1-10 scale)
2. Cognitive complexity (1-10 scale) 
3. Maintainability index (1-100 scale)
4. Technical debt estimate (1-10 scale)
5. Confidence in analysis (0-1 scale)

Respond in JSON format:
{
  "cyclomaticComplexity": number,
  "cognitiveComplexity": number,
  "maintainabilityIndex": number,
  "technicalDebt": number,
  "confidence": number
}
`;

    try {
      const response = await this.callAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('NVIDIA complexity analysis failed:', error);
      throw error;
    }
  }

  async predictStakeholderImpact(code: string, context: string): Promise<ImpactPrediction> {
    const stakeholderInfo = Object.entries(STAKEHOLDER_TYPES)
      .map(([key, value]) => `${key}: ${value.name} - ${value.description}`)
      .join('\n');

    const systemInfo = Object.entries(CORE_SYSTEMS)
      .map(([key, value]) => `${key}: ${value.name} - ${value.description}`)
      .join('\n');

    const prompt = `
Analyze the following code for stakeholder and system impact in the STOLEN platform:

Code:
\`\`\`typescript
${code}
\`\`\`

Context: ${context}

STOLEN Platform Stakeholders:
${stakeholderInfo}

STOLEN Platform Core Systems:
${systemInfo}

For each affected stakeholder/system, provide:
- Impact level: low, medium, high, critical
- Reason for impact
- Confidence in prediction (0-1)

Also identify integration risks with:
- Risk type and description
- Severity: low, medium, high, critical
- Mitigation strategy

Respond in JSON format:
{
  "affectedStakeholders": [
    {
      "type": "stakeholder_key",
      "name": "Stakeholder Name",
      "impactLevel": "low|medium|high|critical",
      "reason": "explanation",
      "confidence": number
    }
  ],
  "affectedSystems": [
    {
      "type": "system_key", 
      "name": "System Name",
      "impactLevel": "low|medium|high|critical",
      "reason": "explanation",
      "confidence": number
    }
  ],
  "integrationRisks": [
    {
      "type": "risk_type",
      "description": "risk description",
      "severity": "low|medium|high|critical",
      "mitigation": "mitigation strategy"
    }
  ],
  "overallConfidence": number
}
`;

    try {
      const response = await this.callAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('NVIDIA impact prediction failed:', error);
      throw error;
    }
  }

  async detectIntegrationRisks(code: string, context: string): Promise<RiskAssessment> {
    const prompt = `
Analyze the following code for integration risks in the STOLEN platform:

Code:
\`\`\`typescript
${code}
\`\`\`

Context: ${context}

Identify risks in these categories:
- Security: Authentication, authorization, data protection
- Performance: API calls, database queries, rendering
- Integration: Cross-stakeholder dependencies, API integrations
- Maintainability: Code complexity, dependencies, testing
- Compliance: FICA compliance, data privacy, regulatory requirements

For each risk, provide:
- Risk type and description
- Severity: low, medium, high, critical
- Impact description
- Mitigation strategy
- Confidence in assessment (0-1)

Respond in JSON format:
{
  "risks": [
    {
      "type": "security|performance|integration|maintainability|compliance",
      "severity": "low|medium|high|critical",
      "description": "risk description",
      "impact": "impact description",
      "mitigation": "mitigation strategy",
      "confidence": number
    }
  ],
  "overallRiskLevel": "low|medium|high|critical",
  "confidence": number
}
`;

    try {
      const response = await this.callAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('NVIDIA risk detection failed:', error);
      throw error;
    }
  }

  async generateRecommendations(analysis: CodeAnalysis): Promise<Recommendation[]> {
    const prompt = `
Based on the following code analysis, generate actionable recommendations:

File: ${analysis.filePath}
Complexity: ${JSON.stringify(analysis.complexity)}
Impact: ${JSON.stringify(analysis.impact)}
Risks: ${JSON.stringify(analysis.risks)}

Generate recommendations in these categories:
- Architecture: Code structure, patterns, design
- Performance: Optimization, efficiency, scalability
- Security: Authentication, authorization, data protection
- Testing: Test coverage, test quality, test strategy
- Integration: Cross-stakeholder integration, API design

For each recommendation, provide:
- Type and priority
- Clear title and description
- Implementation steps
- Expected impact
- Effort required: low, medium, high
- Confidence in recommendation (0-1)

Respond in JSON format:
{
  "recommendations": [
    {
      "type": "architecture|performance|security|testing|integration",
      "priority": "low|medium|high|critical",
      "title": "recommendation title",
      "description": "detailed description",
      "implementation": "implementation steps",
      "impact": "expected impact",
      "effort": "low|medium|high",
      "confidence": number
    }
  ]
}
`;

    try {
      const response = await this.callAPI(prompt);
      const result = JSON.parse(response);
      return result.recommendations || [];
    } catch (error) {
      console.error('NVIDIA recommendation generation failed:', error);
      throw error;
    }
  }

  private async callAPI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_SERVICES.primary.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect analyzing code for the STOLEN platform, a device recovery and marketplace ecosystem with 8 stakeholder types. Provide accurate, actionable analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_SERVICES.primary.temperature,
        max_tokens: AI_SERVICES.primary.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

// Anthropic Claude Service (Fallback)
class AnthropicService implements AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeCodeComplexity(code: string, context: string): Promise<ComplexityAnalysis> {
    // Implementation similar to NVIDIA service
    // This would be the fallback implementation
    throw new Error('Anthropic service not yet implemented');
  }

  async predictStakeholderImpact(code: string, context: string): Promise<ImpactPrediction> {
    // Implementation similar to NVIDIA service
    throw new Error('Anthropic service not yet implemented');
  }

  async detectIntegrationRisks(code: string, context: string): Promise<RiskAssessment> {
    // Implementation similar to NVIDIA service
    throw new Error('Anthropic service not yet implemented');
  }

  async generateRecommendations(analysis: CodeAnalysis): Promise<Recommendation[]> {
    // Implementation similar to NVIDIA service
    throw new Error('Anthropic service not yet implemented');
  }
}

// Main AI Analysis Engine
export class CoherenceAIEngine {
  private primaryService: AIService;
  private fallbackService: AIService;
  private tertiaryService: AIService;

  constructor() {
    // Initialize AI services with available API keys
    if (AI_SERVICES.primary.apiKey) {
      this.primaryService = new NVIDIAService(
        AI_SERVICES.primary.apiKey,
        AI_SERVICES.primary.baseUrl
      );
    }

    if (AI_SERVICES.fallback.apiKey) {
      this.fallbackService = new AnthropicService(AI_SERVICES.fallback.apiKey);
    }

    // Add tertiary service initialization as needed
  }

  async analyzeCode(filePath: string, code: string): Promise<CodeAnalysis> {
    const startTime = Date.now();
    const context = this.generateContext(filePath);

    try {
      // Use primary service (NVIDIA)
      const complexity = await this.primaryService.analyzeCodeComplexity(code, context);
      const impact = await this.primaryService.predictStakeholderImpact(code, context);
      const risks = await this.primaryService.detectIntegrationRisks(code, context);

      const analysis: CodeAnalysis = {
        filePath,
        complexity,
        impact,
        risks,
        recommendations: [],
        timestamp: new Date(),
        aiProvider: 'nvidia',
        processingTime: Date.now() - startTime
      };

      // Generate recommendations
      analysis.recommendations = await this.primaryService.generateRecommendations(analysis);

      return analysis;
    } catch (error) {
      console.error('Primary AI service failed, trying fallback:', error);
      
      // Try fallback service if available
      if (this.fallbackService) {
        try {
          // Implement fallback logic
          throw new Error('Fallback service not yet implemented');
        } catch (fallbackError) {
          console.error('Fallback service also failed:', fallbackError);
          throw new Error('All AI services failed');
        }
      }
      
      throw error;
    }
  }

  private generateContext(filePath: string): string {
    // Generate context based on file path and STOLEN platform structure
    const stakeholder = this.identifyStakeholder(filePath);
    const system = this.identifySystem(filePath);
    
    return `
STOLEN Platform Context:
- File: ${filePath}
- Stakeholder: ${stakeholder}
- System: ${system}
- Platform: Device recovery and marketplace ecosystem
- Stakeholders: 8 types (Individual Users, Repair Shops, Retailers, Law Enforcement, NGO Partners, Insurance Admin, Banks/Payment Gateways, Platform Administrators)
- Core Systems: Marketplace, S-Pay Wallet, Blockchain, AI/ML, Security, Reverse Verification
- Technology: React 18, TypeScript, Supabase, Tailwind CSS
- Focus: South African market with FICA compliance
`;
  }

  private identifyStakeholder(filePath: string): string {
    for (const [key, stakeholder] of Object.entries(STAKEHOLDER_TYPES)) {
      if (stakeholder.paths.some(path => filePath.includes(path))) {
        return stakeholder.name;
      }
    }
    return 'Unknown';
  }

  private identifySystem(filePath: string): string {
    for (const [key, system] of Object.entries(CORE_SYSTEMS)) {
      if (system.paths.some(path => filePath.includes(path))) {
        return system.name;
      }
    }
    return 'Unknown';
  }
}

// Export singleton instance
export const coherenceAIEngine = new CoherenceAIEngine();



