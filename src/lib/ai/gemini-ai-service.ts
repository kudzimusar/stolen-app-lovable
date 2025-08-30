// Gemini AI Service for STOLEN Platform
export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface FraudAnalysisRequest {
  transactionData: any;
  userProfile: any;
  deviceInfo: any;
  locationData: any;
  historicalData: any;
}

export interface FraudAnalysisResponse {
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
  aiInsights: string;
}

export class GeminiAIService {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiConfig) {
    this.config = {
      apiKey: config.apiKey || 'AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY',
      model: config.model || 'gemini-2.0-flash-exp',
      temperature: config.temperature || 0.1,
      maxTokens: config.maxTokens || 2048
    };
  }

  async analyzeFraud(request: FraudAnalysisRequest): Promise<FraudAnalysisResponse> {
    const prompt = this.buildFraudAnalysisPrompt(request);
    
    try {
      const response = await this.callGeminiAPI(prompt);
      return this.parseFraudResponse(response);
    } catch (error) {
      console.error('Gemini fraud analysis error:', error);
      return this.getFallbackFraudResponse();
    }
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    const url = `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: 0.8,
        topK: 40
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    return await response.json();
  }

  private buildFraudAnalysisPrompt(request: FraudAnalysisRequest): string {
    return `
Analyze this transaction for fraud on STOLEN platform:
Transaction: ${JSON.stringify(request.transactionData)}
User: ${JSON.stringify(request.userProfile)}
Device: ${JSON.stringify(request.deviceInfo)}
Location: ${JSON.stringify(request.locationData)}
History: ${JSON.stringify(request.historicalData)}

Provide JSON response:
{
  "fraudScore": 0-100,
  "riskLevel": "low|medium|high|critical",
  "riskFactors": ["factor1"],
  "recommendations": ["rec1"],
  "confidence": 0.0-1.0,
  "aiInsights": "analysis"
}
    `;
  }

  private parseFraudResponse(data: any): FraudAnalysisResponse {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          fraudScore: parsed.fraudScore || 50,
          riskLevel: parsed.riskLevel || 'medium',
          riskFactors: parsed.riskFactors || [],
          recommendations: parsed.recommendations || [],
          confidence: parsed.confidence || 0.8,
          aiInsights: parsed.aiInsights || 'Analysis completed'
        };
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
    }

    return this.getFallbackFraudResponse();
  }

  private getFallbackFraudResponse(): FraudAnalysisResponse {
    return {
      fraudScore: 50,
      riskLevel: 'medium',
      riskFactors: ['Insufficient data'],
      recommendations: ['Manual review'],
      confidence: 0.5,
      aiInsights: 'Fallback analysis'
    };
  }
}

export const geminiAI = new GeminiAIService({
  apiKey: 'AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY',
  model: 'gemini-2.0-flash-exp',
  temperature: 0.1,
  maxTokens: 2048
});
