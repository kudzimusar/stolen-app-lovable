import { TransferSuggestion, DeviceAnalysis, UserBehavior, MarketData } from './ai-transfer-suggestion-engine';

// Types for Smart Transfer Prompts
export interface TransferPrompt {
  id: string;
  title: string;
  message: string;
  suggestion: string;
  estimatedValue: string;
  actionButton: string;
  urgency: 'low' | 'medium' | 'high';
  deviceId: string;
  promptType: 'upgrade' | 'donate' | 'sell' | 'gift' | 'recycle' | 'repair' | 'general';
  timing: 'immediate' | 'soon' | 'later';
  personalization: {
    userPreference: string;
    marketCondition: string;
    environmentalImpact: string;
    financialBenefit: string;
  };
  callToAction: {
    primary: string;
    secondary?: string;
    dismiss?: string;
  };
}

export interface PromptContext {
  device: DeviceAnalysis;
  userBehavior: UserBehavior;
  marketData: MarketData;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  userLocation: string;
  recentActivity: string[];
}

// Smart Transfer Prompt Engine
export class SmartTransferPromptEngine {
  private promptTemplates: { [key: string]: any };
  private personalizationRules: any[];

  constructor() {
    this.initializePromptTemplates();
    this.initializePersonalizationRules();
  }

  // Main method to generate contextual prompts
  async generateContextualPrompt(
    userId: string, 
    deviceId: string, 
    suggestion: TransferSuggestion
  ): Promise<TransferPrompt> {
    try {
      console.log(`🎯 Generating contextual prompt for device: ${deviceId}`);

      const context = await this.buildPromptContext(userId, deviceId);
      const prompt = this.createContextualPrompt(suggestion, context);
      
      console.log(`✅ Generated contextual prompt: ${prompt.title}`);
      return prompt;

    } catch (error) {
      console.error('❌ Error generating contextual prompt:', error);
      throw new Error(`Failed to generate contextual prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate personalized prompt based on user behavior
  async generatePersonalizedPrompt(
    userId: string,
    deviceId: string,
    suggestion: TransferSuggestion
  ): Promise<TransferPrompt> {
    try {
      const context = await this.buildPromptContext(userId, deviceId);
      const personalization = this.applyPersonalizationRules(suggestion, context);
      
      return {
        id: crypto.randomUUID(),
        title: this.personalizeTitle(suggestion, context),
        message: this.personalizeMessage(suggestion, context),
        suggestion: suggestion.recommendedAction,
        estimatedValue: this.formatEstimatedValue(suggestion),
        actionButton: this.getActionButton(suggestion.suggestionType),
        urgency: suggestion.urgency,
        deviceId,
        promptType: suggestion.suggestionType,
        timing: this.determineTiming(suggestion, context),
        personalization,
        callToAction: this.generateCallToAction(suggestion, context)
      };

    } catch (error) {
      console.error('❌ Error generating personalized prompt:', error);
      throw new Error(`Failed to generate personalized prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Build comprehensive prompt context
  private async buildPromptContext(userId: string, deviceId: string): Promise<PromptContext> {
    // In a real implementation, this would fetch from database
    // For now, return mock context
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    return {
      device: {
        id: deviceId,
        name: 'iPhone 14 Pro',
        type: 'smartphone',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        serialNumber: 'F2LLD123ABC',
        purchaseDate: new Date('2022-10-01'),
        age: 2,
        condition: 'excellent',
        marketValue: 800,
        usagePattern: 'high',
        maintenanceHistory: [],
        lastUsed: new Date(),
        transferHistory: []
      },
      userBehavior: {
        upgradeFrequency: 'biannual',
        donationHistory: 2,
        marketplaceActivity: 5,
        deviceCount: 3,
        location: 'Johannesburg, South Africa',
        charitableGiving: true,
        environmentalConsciousness: true,
        budgetConsciousness: false
      },
      marketData: {
        demandTrend: 0.2,
        supplyTrend: -0.1,
        priceTrend: 0.15,
        seasonalFactor: 0.8,
        averagePrice: 500,
        marketVolume: 1000
      },
      timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night',
      dayOfWeek: day >= 1 && day <= 5 ? 'weekday' : 'weekend',
      season: this.getCurrentSeason(),
      userLocation: 'Johannesburg, South Africa',
      recentActivity: ['device_registration', 'marketplace_browse', 'transfer_completed']
    };
  }

  // Create contextual prompt based on suggestion and context
  private createContextualPrompt(suggestion: TransferSuggestion, context: PromptContext): TransferPrompt {
    const template = this.getPromptTemplate(suggestion.suggestionType, context);
    
    return {
      id: crypto.randomUUID(),
      title: this.interpolateTemplate(template.title, suggestion, context),
      message: this.interpolateTemplate(template.message, suggestion, context),
      suggestion: suggestion.recommendedAction,
      estimatedValue: this.formatEstimatedValue(suggestion),
      actionButton: template.actionButton,
      urgency: suggestion.urgency,
      deviceId: suggestion.deviceId,
      promptType: suggestion.suggestionType,
      timing: this.determineTiming(suggestion, context),
      personalization: this.applyPersonalizationRules(suggestion, context),
      callToAction: this.generateCallToAction(suggestion, context)
    };
  }

  // Initialize prompt templates
  private initializePromptTemplates() {
    this.promptTemplates = {
      upgrade: {
        title: "Ready for an Upgrade?",
        message: "Your {deviceName} has served you well for {deviceAge} years. With the latest models offering significant improvements in performance and features, now might be the perfect time to upgrade.",
        actionButton: "Explore Upgrade Options",
        timing: "next_30_days"
      },
      donate: {
        title: "Make a Difference",
        message: "Your {deviceName} could help someone in need. Many organizations accept device donations to support education and community programs.",
        actionButton: "Find Donation Opportunities",
        timing: "anytime"
      },
      sell: {
        title: "Great Time to Sell!",
        message: "Market demand for {deviceType} devices is currently high, and your {deviceName} could fetch a good price. Similar devices are selling well in your area.",
        actionButton: "List for Sale",
        timing: "next_7_days"
      },
      gift: {
        title: "Perfect Gift Opportunity",
        message: "Your {deviceName} is in excellent condition and could make a perfect gift for family or friends who need a reliable device.",
        actionButton: "Gift Device",
        timing: "anytime"
      },
      recycle: {
        title: "Time to Recycle",
        message: "Your {deviceName} has reached the end of its useful life. Proper recycling ensures valuable materials are recovered and harmful substances are disposed of safely.",
        actionButton: "Find Recycling Center",
        timing: "next_14_days"
      },
      repair: {
        title: "Consider Repair",
        message: "Your {deviceName} is relatively new and valuable. Repairing it could be more cost-effective than replacing it, especially given current market prices.",
        actionButton: "Find Repair Service",
        timing: "next_14_days"
      }
    };
  }

  // Initialize personalization rules
  private initializePersonalizationRules() {
    this.personalizationRules = [
      {
        condition: (context: PromptContext) => context.userBehavior.charitableGiving,
        message: "Based on your charitable giving history, you might be interested in donating this device.",
        priority: 'high'
      },
      {
        condition: (context: PromptContext) => context.userBehavior.environmentalConsciousness,
        message: "As someone who cares about the environment, recycling this device would align with your values.",
        priority: 'high'
      },
      {
        condition: (context: PromptContext) => context.userBehavior.budgetConsciousness,
        message: "Given your budget-conscious approach, selling this device could provide valuable extra income.",
        priority: 'medium'
      },
      {
        condition: (context: PromptContext) => context.timeOfDay === 'morning',
        message: "Start your day by making a positive impact with your device.",
        priority: 'low'
      },
      {
        condition: (context: PromptContext) => context.dayOfWeek === 'weekend',
        message: "Perfect weekend activity - declutter and help others with your device.",
        priority: 'low'
      }
    ];
  }

  // Get prompt template based on suggestion type and context
  private getPromptTemplate(suggestionType: string, context: PromptContext) {
    const baseTemplate = this.promptTemplates[suggestionType];
    
    // Customize based on context
    if (context.timeOfDay === 'morning') {
      baseTemplate.message = "Start your day right by " + baseTemplate.message.toLowerCase();
    }
    
    if (context.userBehavior.charitableGiving && suggestionType === 'donate') {
      baseTemplate.message += " Your previous donations have made a real difference!";
    }
    
    return baseTemplate;
  }

  // Interpolate template with actual values
  private interpolateTemplate(template: string, suggestion: TransferSuggestion, context: PromptContext): string {
    return template
      .replace('{deviceName}', context.device.name)
      .replace('{deviceAge}', context.device.age.toString())
      .replace('{deviceType}', context.device.type)
      .replace('{userLocation}', context.userLocation)
      .replace('{estimatedValue}', this.formatEstimatedValue(suggestion));
  }

  // Apply personalization rules
  private applyPersonalizationRules(suggestion: TransferSuggestion, context: PromptContext) {
    const applicableRules = this.personalizationRules
      .filter(rule => rule.condition(context))
      .sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0));

    return {
      userPreference: applicableRules[0]?.message || "We think this might interest you based on your activity.",
      marketCondition: this.getMarketConditionMessage(context.marketData),
      environmentalImpact: suggestion.environmentalImpact || "This action has positive environmental benefits.",
      financialBenefit: this.getFinancialBenefitMessage(suggestion)
    };
  }

  // Personalize title based on context
  private personalizeTitle(suggestion: TransferSuggestion, context: PromptContext): string {
    const baseTitle = this.promptTemplates[suggestion.suggestionType].title;
    
    if (context.userBehavior.charitableGiving && suggestion.suggestionType === 'donate') {
      return "Continue Your Generosity";
    }
    
    if (context.userBehavior.environmentalConsciousness && suggestion.suggestionType === 'recycle') {
      return "Help the Planet";
    }
    
    if (context.userBehavior.budgetConsciousness && suggestion.suggestionType === 'sell') {
      return "Boost Your Budget";
    }
    
    return baseTitle;
  }

  // Personalize message based on context
  private personalizeMessage(suggestion: TransferSuggestion, context: PromptContext): string {
    let message = suggestion.reasoning;
    
    // Add personalization based on user behavior
    if (context.userBehavior.charitableGiving && suggestion.suggestionType === 'donate') {
      message += " Your previous donations have helped many people in need.";
    }
    
    if (context.userBehavior.environmentalConsciousness) {
      message += " This aligns with your environmental values.";
    }
    
    if (context.userBehavior.budgetConsciousness && suggestion.estimatedValue) {
      message += ` This could add ${this.formatCurrency(suggestion.estimatedValue)} to your budget.`;
    }
    
    // Add timing context
    if (context.timeOfDay === 'morning') {
      message = "Start your day by " + message.toLowerCase();
    }
    
    return message;
  }

  // Generate call to action
  private generateCallToAction(suggestion: TransferSuggestion, context: PromptContext) {
    const primary = this.getActionButton(suggestion.suggestionType);
    
    return {
      primary,
      secondary: suggestion.urgency === 'high' ? "Learn More" : "Maybe Later",
      dismiss: "Not Now"
    };
  }

  // Get action button text
  private getActionButton(suggestionType: string): string {
    const buttons = {
      upgrade: "Explore Upgrade Options",
      donate: "Find Donation Opportunities",
      sell: "List for Sale",
      gift: "Gift Device",
      recycle: "Find Recycling Center",
      repair: "Find Repair Service"
    };
    
    return buttons[suggestionType as keyof typeof buttons] || "Take Action";
  }

  // Determine timing urgency
  private determineTiming(suggestion: TransferSuggestion, context: PromptContext): 'immediate' | 'soon' | 'later' {
    if (suggestion.urgency === 'high') return 'immediate';
    if (suggestion.urgency === 'medium') return 'soon';
    return 'later';
  }

  // Format estimated value
  private formatEstimatedValue(suggestion: TransferSuggestion): string {
    if (!suggestion.estimatedValue) return "Value varies";
    
    if (suggestion.suggestionType === 'donate') {
      return "Tax-deductible donation";
    }
    
    if (suggestion.suggestionType === 'recycle') {
      return "Environmental benefit";
    }
    
    return `Estimated value: ${this.formatCurrency(suggestion.estimatedValue)}`;
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  }

  // Get market condition message
  private getMarketConditionMessage(marketData: MarketData): string {
    if (marketData.priceTrend > 0.2) {
      return "Market prices are rising - great time to act!";
    }
    if (marketData.demandTrend > 0.1) {
      return "Demand is high in your area.";
    }
    return "Market conditions are favorable.";
  }

  // Get financial benefit message
  private getFinancialBenefitMessage(suggestion: TransferSuggestion): string {
    if (suggestion.estimatedValue) {
      return `This could add ${this.formatCurrency(suggestion.estimatedValue)} to your budget.`;
    }
    if (suggestion.taxBenefits) {
      return suggestion.taxBenefits;
    }
    return "This action has financial benefits.";
  }

  // Get current season
  private getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
}

// Export singleton instance
export const smartPromptEngine = new SmartTransferPromptEngine();
