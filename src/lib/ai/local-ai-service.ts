export interface AIResponse {
  response: string;
  model: string;
  timestamp: Date;
  confidence?: number;
}

export interface AIConfig {
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export class LocalAIService {
  private config: AIConfig;
  
  constructor() {
    this.config = {
      baseURL: import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 1000
    };
  }
  
  // Generate response using local AI model
  async generateResponse(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        response: data.response,
        model: this.config.model,
        timestamp: new Date(),
        confidence: 0.85 // Default confidence for local models
      };
    } catch (error) {
      console.error('Local AI generation failed:', error);
      // Fallback to predefined responses
      return this.getFallbackResponse(prompt);
    }
  }
  
  // Fraud detection using local AI
  async detectFraud(transactionData: any): Promise<{
    isFraudulent: boolean;
    confidence: number;
    reasons: string[];
  }> {
    const prompt = `
      Analyze this transaction data for potential fraud:
      Amount: ${transactionData.amount}
      Location: ${transactionData.location}
      Device: ${transactionData.device}
      User History: ${transactionData.userHistory}
      
      Respond with JSON format:
      {
        "isFraudulent": true/false,
        "confidence": 0.0-1.0,
        "reasons": ["reason1", "reason2"]
      }
    `;
    
    try {
      const aiResponse = await this.generateResponse(prompt);
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(aiResponse.response);
        return {
          isFraudulent: parsed.isFraudulent || false,
          confidence: parsed.confidence || 0.5,
          reasons: parsed.reasons || []
        };
      } catch {
        // Fallback to basic fraud detection
        return this.basicFraudDetection(transactionData);
      }
    } catch (error) {
      return this.basicFraudDetection(transactionData);
    }
  }
  
  // Basic fraud detection rules
  private basicFraudDetection(transactionData: any) {
    const reasons: string[] = [];
    let confidence = 0.5;
    
    // Check for suspicious patterns
    if (transactionData.amount > 10000) {
      reasons.push('High value transaction');
      confidence += 0.2;
    }
    
    if (transactionData.location && transactionData.userHistory?.lastLocation) {
      const distance = this.calculateDistance(
        transactionData.location,
        transactionData.userHistory.lastLocation
      );
      
      if (distance > 100) { // More than 100km from last location
        reasons.push('Unusual location change');
        confidence += 0.3;
      }
    }
    
    if (transactionData.userHistory?.recentTransactions > 5) {
      reasons.push('High transaction frequency');
      confidence += 0.2;
    }
    
    return {
      isFraudulent: confidence > 0.7,
      confidence: Math.min(confidence, 1.0),
      reasons
    };
  }
  
  // Device verification using AI
  async verifyDevice(deviceData: any): Promise<{
    isGenuine: boolean;
    confidence: number;
    issues: string[];
  }> {
    const prompt = `
      Verify if this device data indicates a genuine device:
      Serial Number: ${deviceData.serialNumber}
      Brand: ${deviceData.brand}
      Model: ${deviceData.model}
      Purchase Date: ${deviceData.purchaseDate}
      Price: ${deviceData.price}
      
      Respond with JSON format:
      {
        "isGenuine": true/false,
        "confidence": 0.0-1.0,
        "issues": ["issue1", "issue2"]
      }
    `;
    
    try {
      const aiResponse = await this.generateResponse(prompt);
      
      try {
        const parsed = JSON.parse(aiResponse.response);
        return {
          isGenuine: parsed.isGenuine || true,
          confidence: parsed.confidence || 0.8,
          issues: parsed.issues || []
        };
      } catch {
        return this.basicDeviceVerification(deviceData);
      }
    } catch (error) {
      return this.basicDeviceVerification(deviceData);
    }
  }
  
  // Basic device verification rules
  private basicDeviceVerification(deviceData: any) {
    const issues: string[] = [];
    let confidence = 0.8;
    
    // Check for common issues
    if (!deviceData.serialNumber || deviceData.serialNumber.length < 8) {
      issues.push('Invalid serial number format');
      confidence -= 0.3;
    }
    
    if (deviceData.price && deviceData.price < 100) {
      issues.push('Suspiciously low price');
      confidence -= 0.2;
    }
    
    if (!deviceData.purchaseDate) {
      issues.push('Missing purchase date');
      confidence -= 0.1;
    }
    
    return {
      isGenuine: confidence > 0.6,
      confidence: Math.max(confidence, 0.0),
      issues
    };
  }
  
  // Chat assistance using local AI
  async getChatResponse(message: string, context?: string): Promise<string> {
    const prompt = `
      You are a helpful assistant for the STOLEN platform, a secure device management and recovery platform in South Africa.
      
      Context: ${context || 'General platform assistance'}
      User Message: ${message}
      
      Provide a helpful, accurate response about device registration, verification, marketplace, or platform features.
      Keep responses concise and relevant to South African users.
    `;
    
    try {
      const aiResponse = await this.generateResponse(prompt);
      return aiResponse.response;
    } catch (error) {
      return this.getFallbackChatResponse(message);
    }
  }
  
  // Fallback responses for common queries
  private getFallbackChatResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('register') || lowerMessage.includes('registration')) {
      return "To register a device, go to 'Register Device' and enter your device details including serial number, purchase receipt, and photos. This creates a secure blockchain record.";
    }
    
    if (lowerMessage.includes('verify') || lowerMessage.includes('verification')) {
      return "Device verification checks our blockchain database for ownership history, theft reports, and fraud indicators. Always verify before purchasing.";
    }
    
    if (lowerMessage.includes('marketplace') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
      return "The marketplace shows only verified devices with clean ownership history. Use built-in S-Pay for secure transactions.";
    }
    
    if (lowerMessage.includes('fraud') || lowerMessage.includes('scam')) {
      return "Our AI analyzes device patterns, pricing anomalies, and seller behavior to detect potential fraud. Red flags are automatically highlighted.";
    }
    
    return "I'm here to help with the STOLEN platform. You can register devices, verify ownership, use the marketplace, and get support for device recovery.";
  }
  
  // Fallback response for general AI queries
  private getFallbackResponse(prompt: string): AIResponse {
    return {
      response: "I'm experiencing technical difficulties. Please try again or contact support for assistance.",
      model: this.config.model,
      timestamp: new Date(),
      confidence: 0.5
    };
  }
  
  // Calculate distance between two coordinates
  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coord2[0] - coord1[0]);
    const dLng = this.deg2rad(coord2[1] - coord1[1]);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1[0])) * Math.cos(this.deg2rad(coord2[0])) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  // Update AI configuration
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Test AI service connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('AI service connection test failed:', error);
      return false;
    }
  }
  
  // Get available models
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models?.map((model: any) => model.name) || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }
}

// Export singleton instance
export const localAIService = new LocalAIService();
