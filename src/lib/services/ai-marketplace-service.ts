import { GoogleServicesIntegration } from '@/lib/services/google-services-integration';

interface DeviceRecommendation {
  deviceId: string;
  title: string;
  price: number;
  reason: string;
  confidence: number;
  category: string;
  seller: string;
  location: string;
  trustScore: number;
}

interface SearchSuggestion {
  query: string;
  type: 'product' | 'brand' | 'category' | 'model';
  confidence: number;
  results_count: number;
}

interface MarketInsight {
  type: 'price_trend' | 'demand_spike' | 'new_release' | 'seasonal_trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  data: any;
}

interface FraudRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  factors: FraudFactor[];
  recommendations: string[];
  requiresManualReview: boolean;
}

interface FraudFactor {
  type: 'price_anomaly' | 'seller_behavior' | 'device_history' | 'location_mismatch' | 'rapid_listing';
  severity: number;
  description: string;
  evidence: string[];
}

interface UserPreferences {
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  locations: string[];
  conditions: string[];
  features: string[];
}

export class AIMarketplaceService {
  private static instance: AIMarketplaceService;
  private googleServices: GoogleServicesIntegration;
  
  constructor() {
    this.googleServices = new GoogleServicesIntegration({
      mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      studioApiKey: import.meta.env.VITE_GOOGLE_STUDIO_API_KEY || '',
      visionApiKey: import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY || ''
    });
  }

  public static getInstance(): AIMarketplaceService {
    if (!AIMarketplaceService.instance) {
      AIMarketplaceService.instance = new AIMarketplaceService();
    }
    return AIMarketplaceService.instance;
  }

  // AI-Powered Recommendations
  async getPersonalizedRecommendations(
    userId: string,
    userPreferences?: UserPreferences,
    viewingHistory?: any[],
    currentContext?: string
  ): Promise<DeviceRecommendation[]> {
    try {
      // Simulate AI recommendation engine
      const mockRecommendations: DeviceRecommendation[] = [
        {
          deviceId: 'rec-1',
          title: 'iPhone 14 Pro 128GB',
          price: 15999,
          reason: 'Based on your previous iPhone searches and budget range',
          confidence: 0.92,
          category: 'phones',
          seller: 'TechHub SA',
          location: 'Johannesburg',
          trustScore: 96
        },
        {
          deviceId: 'rec-2',
          title: 'Samsung Galaxy S23 Ultra',
          price: 18999,
          reason: 'Popular alternative in your preferred category with similar features',
          confidence: 0.85,
          category: 'phones',
          seller: 'MobileWorld',
          location: 'Cape Town',
          trustScore: 94
        },
        {
          deviceId: 'rec-3',
          title: 'MacBook Air M2 256GB',
          price: 22999,
          reason: 'Frequently bought together with iPhones',
          confidence: 0.78,
          category: 'laptops',
          seller: 'Apple Certified',
          location: 'Durban',
          trustScore: 98
        }
      ];

      // In real implementation, this would call Gemini AI API
      const prompt = `
        Generate personalized device recommendations for a user with preferences:
        Categories: ${userPreferences?.categories?.join(', ') || 'All'}
        Price Range: R${userPreferences?.priceRange?.min || 0} - R${userPreferences?.priceRange?.max || 100000}
        Brands: ${userPreferences?.brands?.join(', ') || 'Any'}
        Current Context: ${currentContext || 'General browsing'}
        
        Consider: user behavior, market trends, compatibility, and trust scores.
      `;

      // For now, return mock data with smart filtering
      return mockRecommendations.filter(rec => {
        if (userPreferences?.priceRange) {
          return rec.price >= userPreferences.priceRange.min && rec.price <= userPreferences.priceRange.max;
        }
        return true;
      });

    } catch (error) {
      console.error('AI Recommendations failed:', error);
      return [];
    }
  }

  // Smart Search Suggestions
  async getSmartSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    try {
      if (!query.trim()) return [];

      // Mock smart suggestions based on query analysis
      const suggestions: SearchSuggestion[] = [];
      const queryLower = query.toLowerCase();

      // Brand suggestions
      const brands = ['apple', 'samsung', 'google', 'oneplus', 'xiaomi', 'huawei'];
      brands.forEach(brand => {
        if (brand.includes(queryLower) || queryLower.includes(brand)) {
          suggestions.push({
            query: `${brand} phones`,
            type: 'brand',
            confidence: 0.9,
            results_count: Math.floor(Math.random() * 50) + 10
          });
        }
      });

      // Product suggestions
      if (queryLower.includes('iphone')) {
        suggestions.push(
          { query: 'iPhone 15 Pro Max', type: 'product', confidence: 0.95, results_count: 25 },
          { query: 'iPhone 14', type: 'product', confidence: 0.88, results_count: 32 },
          { query: 'iPhone 13 Mini', type: 'product', confidence: 0.82, results_count: 18 }
        );
      }

      // Category suggestions
      if (queryLower.includes('phone') || queryLower.includes('mobile')) {
        suggestions.push({
          query: 'smartphones',
          type: 'category',
          confidence: 0.85,
          results_count: 150
        });
      }

      return suggestions.slice(0, limit);

    } catch (error) {
      console.error('Smart search suggestions failed:', error);
      return [];
    }
  }

  // Market Intelligence & Insights
  async getMarketInsights(category?: string, location?: string): Promise<MarketInsight[]> {
    try {
      const insights: MarketInsight[] = [
        {
          type: 'price_trend',
          title: 'iPhone Prices Dropping',
          description: 'iPhone 14 prices have decreased by 15% this month due to iPhone 15 release',
          impact: 'high',
          category: 'phones',
          actionable: true,
          data: { change: -15, timeframe: '30 days' }
        },
        {
          type: 'demand_spike',
          title: 'Gaming Laptops in High Demand',
          description: 'Gaming laptop searches increased 40% in Gauteng this week',
          impact: 'medium',
          category: 'laptops',
          actionable: true,
          data: { increase: 40, region: 'gauteng' }
        },
        {
          type: 'seasonal_trend',
          title: 'Back-to-School Season',
          description: 'Student-focused devices seeing increased activity',
          impact: 'medium',
          category: 'all',
          actionable: false,
          data: { season: 'back-to-school' }
        }
      ];

      // Filter by category if specified
      if (category && category !== 'all') {
        return insights.filter(insight => 
          insight.category === category || insight.category === 'all'
        );
      }

      return insights;

    } catch (error) {
      console.error('Market insights failed:', error);
      return [];
    }
  }

  // AI Fraud Detection
  async assessFraudRisk(
    deviceId: string,
    sellerId: string,
    listingData: any
  ): Promise<FraudRiskAssessment> {
    try {
      const factors: FraudFactor[] = [];
      let riskScore = 0;

      // Price analysis
      const marketPrice = await this.getMarketPrice(listingData.model, listingData.condition);
      const priceDifference = Math.abs(listingData.price - marketPrice) / marketPrice;
      
      if (priceDifference > 0.3) {
        factors.push({
          type: 'price_anomaly',
          severity: priceDifference > 0.5 ? 8 : 5,
          description: `Price is ${priceDifference > 0 ? 'significantly higher' : 'unusually lower'} than market average`,
          evidence: [`Listed: R${listingData.price}`, `Market avg: R${marketPrice}`]
        });
        riskScore += priceDifference > 0.5 ? 30 : 15;
      }

      // Seller behavior analysis
      const sellerHistory = await this.getSellerHistory(sellerId);
      if (sellerHistory.recentListings > 10) {
        factors.push({
          type: 'rapid_listing',
          severity: 6,
          description: 'Seller has listed many devices recently',
          evidence: [`${sellerHistory.recentListings} listings in past 7 days`]
        });
        riskScore += 20;
      }

      // Device history check
      if (listingData.stolenStatus !== 'clean') {
        factors.push({
          type: 'device_history',
          severity: 9,
          description: 'Device has questionable history',
          evidence: [`Status: ${listingData.stolenStatus}`]
        });
        riskScore += 40;
      }

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (riskScore >= 70) riskLevel = 'critical';
      else if (riskScore >= 40) riskLevel = 'high';
      else if (riskScore >= 20) riskLevel = 'medium';
      else riskLevel = 'low';

      const recommendations = this.generateFraudRecommendations(riskLevel, factors);

      return {
        riskLevel,
        riskScore,
        factors,
        recommendations,
        requiresManualReview: riskScore >= 40
      };

    } catch (error) {
      console.error('Fraud risk assessment failed:', error);
      return {
        riskLevel: 'low',
        riskScore: 0,
        factors: [],
        recommendations: [],
        requiresManualReview: false
      };
    }
  }

  // Dynamic Pricing Suggestions
  async getPricingSuggestions(
    deviceModel: string,
    condition: string,
    location: string
  ): Promise<{
    suggested: number;
    range: { min: number; max: number };
    confidence: number;
    factors: string[];
  }> {
    try {
      // Mock pricing intelligence
      const basePrice = await this.getMarketPrice(deviceModel, condition);
      const locationMultiplier = this.getLocationPriceMultiplier(location);
      const conditionMultiplier = this.getConditionMultiplier(condition);
      
      const suggested = Math.round(basePrice * locationMultiplier * conditionMultiplier);
      const variance = suggested * 0.1; // 10% variance
      
      return {
        suggested,
        range: {
          min: Math.round(suggested - variance),
          max: Math.round(suggested + variance)
        },
        confidence: 0.85,
        factors: [
          'Market demand analysis',
          'Regional pricing trends',
          'Condition assessment',
          'Competitive pricing'
        ]
      };

    } catch (error) {
      console.error('Pricing suggestions failed:', error);
      return {
        suggested: 0,
        range: { min: 0, max: 0 },
        confidence: 0,
        factors: []
      };
    }
  }

  // Smart Matching for Buyers
  async findBestMatches(
    buyerRequirements: {
      category: string;
      budget: number;
      features: string[];
      location?: string;
    }
  ): Promise<DeviceRecommendation[]> {
    try {
      // AI-powered matching algorithm
      const prompt = `
        Find the best device matches for a buyer with requirements:
        Category: ${buyerRequirements.category}
        Budget: R${buyerRequirements.budget}
        Desired features: ${buyerRequirements.features.join(', ')}
        Location preference: ${buyerRequirements.location || 'Any'}
        
        Prioritize: value for money, trust score, feature match, location proximity
      `;

      // Mock intelligent matching
              const matches: DeviceRecommendation[] = [
        {
          deviceId: 'match-1',
          title: 'Perfect Match Device',
          price: buyerRequirements.budget * 0.9,
          reason: 'Matches 95% of your requirements within budget',
          confidence: 0.95,
          category: buyerRequirements.category,
          seller: 'Top Seller',
          location: buyerRequirements.location || 'Gauteng',
          trustScore: 98
        }
      ];

      return matches;

    } catch (error) {
      console.error('Smart matching failed:', error);
      return [];
    }
  }

  // Helper methods
  private async getMarketPrice(model: string, condition: string): Promise<number> {
    // Mock market price analysis
    const basePrices: Record<string, number> = {
      'iPhone 15 Pro Max': 25000,
      'iPhone 14 Pro': 18000,
      'Samsung Galaxy S24': 16000,
      'MacBook Pro M3': 35000
    };
    
    const basePrice = basePrices[model] || 10000;
    const conditionMultiplier = this.getConditionMultiplier(condition);
    
    return Math.round(basePrice * conditionMultiplier);
  }

  private getConditionMultiplier(condition: string): number {
    const multipliers: Record<string, number> = {
      'new': 1.0,
      'like new': 0.9,
      'excellent': 0.8,
      'good': 0.7,
      'fair': 0.6
    };
    
    return multipliers[condition.toLowerCase()] || 0.7;
  }

  private getLocationPriceMultiplier(location: string): number {
    const multipliers: Record<string, number> = {
      'gauteng': 1.05,
      'western-cape': 1.02,
      'kwazulu-natal': 0.98,
      'eastern-cape': 0.95
    };
    
    return multipliers[location.toLowerCase()] || 1.0;
  }

  private async getSellerHistory(sellerId: string): Promise<{ recentListings: number; trustScore: number }> {
    // Mock seller analysis
    return {
      recentListings: Math.floor(Math.random() * 15),
      trustScore: 85 + Math.floor(Math.random() * 15)
    };
  }

  private generateFraudRecommendations(riskLevel: string, factors: FraudFactor[]): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'critical') {
      recommendations.push('Do not proceed with this transaction');
      recommendations.push('Report listing for manual review');
    } else if (riskLevel === 'high') {
      recommendations.push('Request additional verification from seller');
      recommendations.push('Use video call to inspect device');
      recommendations.push('Meet in safe public location');
    } else if (riskLevel === 'medium') {
      recommendations.push('Ask for additional photos and documentation');
      recommendations.push('Verify serial number independently');
    } else {
      recommendations.push('Transaction appears safe to proceed');
    }
    
    return recommendations;
  }

  // Real-time AI Chat for Marketplace
  async getAIMarketplaceAssistance(
    query: string,
    context: {
      currentPage?: string;
      userPreferences?: UserPreferences;
      viewingDevice?: any;
    }
  ): Promise<{
    response: string;
    suggestions: string[];
    actions: Array<{ label: string; action: string }>;
  }> {
    try {
      // Mock intelligent marketplace assistance
      let response = '';
      let suggestions: string[] = [];
      let actions: Array<{ label: string; action: string }> = [];

      if (query.toLowerCase().includes('price')) {
        response = "I can help you with pricing! Current market prices vary based on condition, location, and demand. Would you like me to analyze a specific device's pricing?";
        suggestions = [
          'Show me price trends for this device',
          'Compare with similar devices',
          'Get pricing recommendations for selling'
        ];
        actions = [
          { label: 'View Price History', action: 'show_price_history' },
          { label: 'Price Comparison', action: 'compare_prices' }
        ];
      } else if (query.toLowerCase().includes('trust') || query.toLowerCase().includes('verify')) {
        response = "Device verification is crucial for safe transactions. I can help you understand trust scores and verification methods.";
        suggestions = [
          'How do trust scores work?',
          'What verification methods are available?',
          'How to verify this device?'
        ];
        actions = [
          { label: 'Start Verification', action: 'verify_device' },
          { label: 'View Trust Details', action: 'show_trust_info' }
        ];
      } else if (query.toLowerCase().includes('recommend')) {
        response = "I can provide personalized recommendations based on your preferences and browsing history. What type of device are you looking for?";
        suggestions = [
          'Show me phones under R15,000',
          'Find laptops for students',
          'Gaming devices in my area'
        ];
        actions = [
          { label: 'Get Recommendations', action: 'show_recommendations' },
          { label: 'Set Preferences', action: 'set_preferences' }
        ];
      } else {
        response = "I'm your AI marketplace assistant! I can help with device recommendations, pricing analysis, verification guidance, and market insights. What would you like to know?";
        suggestions = [
          'Find devices for me',
          'Check current market prices',
          'Help me verify a device',
          'Show market trends'
        ];
      }

      return { response, suggestions, actions };

    } catch (error) {
      console.error('AI marketplace assistance failed:', error);
      return {
        response: "I'm having trouble processing your request. Please try again.",
        suggestions: [],
        actions: []
      };
    }
  }
}

export const aiMarketplaceService = AIMarketplaceService.getInstance();
