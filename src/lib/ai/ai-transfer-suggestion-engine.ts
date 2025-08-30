import { createClient } from '@supabase/supabase-js';

// Types for AI Transfer Suggestions
export interface TransferSuggestion {
  deviceId: string;
  suggestionType: 'upgrade' | 'donate' | 'sell' | 'gift' | 'recycle' | 'repair';
  confidence: number;
  reasoning: string;
  estimatedValue?: number;
  recommendedAction: string;
  urgency: 'low' | 'medium' | 'high';
  optimalTiming?: string;
  marketTrend?: 'increasing' | 'decreasing' | 'stable';
  environmentalImpact?: string;
  taxBenefits?: string;
}

export interface DeviceAnalysis {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  age: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  marketValue: number;
  usagePattern: 'high' | 'medium' | 'low' | 'none';
  maintenanceHistory: string[];
  lastUsed: Date;
  transferHistory: TransferRecord[];
}

export interface UserBehavior {
  upgradeFrequency: 'annual' | 'biannual' | 'every_3_years' | 'rarely';
  donationHistory: number;
  marketplaceActivity: number;
  deviceCount: number;
  location: string;
  charitableGiving: boolean;
  environmentalConsciousness: boolean;
  budgetConsciousness: boolean;
}

export interface MarketData {
  demandTrend: number; // -1 to 1
  supplyTrend: number; // -1 to 1
  priceTrend: number; // -1 to 1
  seasonalFactor: number; // 0 to 1
  averagePrice: number;
  marketVolume: number;
}

export interface TransferRecord {
  from: string;
  to: string;
  timestamp: Date;
  type: string;
  value: number;
}

// AI Transfer Suggestion Engine
export class AITransferSuggestionEngine {
  private supabase: any;
  private aiModel: any;

  constructor() {
    this.supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.REACT_APP_SUPABASE_ANON_KEY!
    );
  }

  // Main method to generate transfer suggestions for a user
  async generateSuggestions(userId: string): Promise<TransferSuggestion[]> {
    try {
      console.log(`🤖 Generating transfer suggestions for user: ${userId}`);

      const userDevices = await this.getUserDevices(userId);
      const userBehavior = await this.analyzeUserBehavior(userId);
      const marketData = await this.getMarketData();

      const suggestions: TransferSuggestion[] = [];

      for (const device of userDevices) {
        const suggestion = await this.analyzeDeviceForTransfer(device, userBehavior, marketData);
        if (suggestion && suggestion.confidence > 0.6) {
          suggestions.push(suggestion);
        }
      }

      // Sort by confidence and urgency
      suggestions.sort((a, b) => {
        const urgencyWeight = { high: 3, medium: 2, low: 1 };
        const aScore = a.confidence * urgencyWeight[a.urgency];
        const bScore = b.confidence * urgencyWeight[b.urgency];
        return bScore - aScore;
      });

      console.log(`✅ Generated ${suggestions.length} transfer suggestions`);
      return suggestions;

    } catch (error) {
      console.error('❌ Error generating transfer suggestions:', error);
      throw new Error(`Failed to generate transfer suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's devices with analysis
  private async getUserDevices(userId: string): Promise<DeviceAnalysis[]> {
    const { data: devices, error } = await this.supabase
      .from('devices')
      .select(`
        *,
        transfer_history:device_transfers(*)
      `)
      .eq('owner_id', userId);

    if (error) throw error;

    return devices.map((device: any) => this.analyzeDevice(device));
  }

  // Analyze individual device
  private analyzeDevice(device: any): DeviceAnalysis {
    const purchaseDate = new Date(device.purchase_date);
    const age = this.calculateDeviceAge(purchaseDate);
    const usagePattern = this.analyzeUsagePattern(device);
    const marketValue = this.estimateMarketValue(device, age);

    return {
      id: device.id,
      name: device.name,
      type: device.type,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serial_number,
      purchaseDate,
      age,
      condition: device.condition || 'good',
      marketValue,
      usagePattern,
      maintenanceHistory: device.maintenance_history || [],
      lastUsed: new Date(device.last_used || device.purchase_date),
      transferHistory: device.transfer_history || []
    };
  }

  // Analyze user behavior patterns
  private async analyzeUserBehavior(userId: string): Promise<UserBehavior> {
    const { data: userData, error } = await this.supabase
      .from('users')
      .select(`
        *,
        devices:devices(*),
        transfers:device_transfers(*),
        donations:donations(*),
        marketplace_activity:marketplace_listings(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      upgradeFrequency: this.calculateUpgradeFrequency(userData.devices),
      donationHistory: userData.donations?.length || 0,
      marketplaceActivity: userData.marketplace_activity?.length || 0,
      deviceCount: userData.devices?.length || 0,
      location: userData.location || 'unknown',
      charitableGiving: userData.donations?.length > 0,
      environmentalConsciousness: userData.environmental_preferences || false,
      budgetConsciousness: userData.budget_preferences || false
    };
  }

  // Get market data for device types
  private async getMarketData(): Promise<MarketData> {
    // In a real implementation, this would fetch from market data APIs
    // For now, return simulated data
    return {
      demandTrend: 0.2, // Slight increase in demand
      supplyTrend: -0.1, // Slight decrease in supply
      priceTrend: 0.15, // Slight price increase
      seasonalFactor: 0.8, // Current season factor
      averagePrice: 500,
      marketVolume: 1000
    };
  }

  // Core AI logic for device transfer analysis
  private async analyzeDeviceForTransfer(
    device: DeviceAnalysis,
    behavior: UserBehavior,
    market: MarketData
  ): Promise<TransferSuggestion | null> {
    
    // Upgrade suggestions
    if (this.shouldSuggestUpgrade(device, behavior, market)) {
      return this.createUpgradeSuggestion(device, behavior, market);
    }

    // Donation suggestions
    if (this.shouldSuggestDonation(device, behavior, market)) {
      return this.createDonationSuggestion(device, behavior, market);
    }

    // Sale suggestions
    if (this.shouldSuggestSale(device, behavior, market)) {
      return this.createSaleSuggestion(device, behavior, market);
    }

    // Gift suggestions
    if (this.shouldSuggestGift(device, behavior, market)) {
      return this.createGiftSuggestion(device, behavior, market);
    }

    // Recycling suggestions
    if (this.shouldSuggestRecycling(device, behavior, market)) {
      return this.createRecyclingSuggestion(device, behavior, market);
    }

    // Repair suggestions
    if (this.shouldSuggestRepair(device, behavior, market)) {
      return this.createRepairSuggestion(device, behavior, market);
    }

    return null;
  }

  // Upgrade suggestion logic
  private shouldSuggestUpgrade(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
    return (
      device.age > 3 &&
      behavior.upgradeFrequency !== 'rarely' &&
      device.marketValue > 200 &&
      market.priceTrend > 0.1
    );
  }

  private createUpgradeSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
    const tradeInValue = device.marketValue * 0.6;
    const urgency = device.age > 5 ? 'high' : device.age > 4 ? 'medium' : 'low';

    return {
      deviceId: device.id,
      suggestionType: 'upgrade',
      confidence: Math.min(0.9, 0.6 + (device.age - 3) * 0.1),
      reasoning: `Your ${device.name} is ${device.age} years old. With the latest models offering significant improvements in performance and features, now is an excellent time to upgrade.`,
      estimatedValue: tradeInValue,
      recommendedAction: `Trade in your ${device.name} for credit toward a new device`,
      urgency,
      optimalTiming: 'next_30_days',
      marketTrend: market.priceTrend > 0 ? 'increasing' : 'stable',
      environmentalImpact: 'Upgrading to newer, more efficient devices can reduce energy consumption',
      taxBenefits: 'Trade-in value may be tax-deductible in some jurisdictions'
    };
  }

  // Donation suggestion logic
  private shouldSuggestDonation(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
    return (
      (device.age > 5 || device.marketValue < 150) &&
      (behavior.charitableGiving || behavior.environmentalConsciousness) &&
      device.condition !== 'poor'
    );
  }

  private createDonationSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
    return {
      deviceId: device.id,
      suggestionType: 'donate',
      confidence: 0.85,
      reasoning: `Your ${device.name} could make a significant difference in someone's life. Many organizations accept device donations to support education, community programs, and environmental initiatives.`,
      estimatedValue: device.marketValue,
      recommendedAction: `Donate your ${device.name} to a worthy cause`,
      urgency: 'low',
      optimalTiming: 'anytime',
      marketTrend: 'stable',
      environmentalImpact: 'Donating extends device lifecycle and reduces e-waste',
      taxBenefits: 'Donations to registered charities are tax-deductible'
    };
  }

  // Sale suggestion logic
  private shouldSuggestSale(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
    return (
      device.marketValue > 200 &&
      device.age < 5 &&
      behavior.marketplaceActivity > 0 &&
      market.demandTrend > 0.1
    );
  }

  private createSaleSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
    const urgency = market.priceTrend > 0.2 ? 'high' : 'medium';

    return {
      deviceId: device.id,
      suggestionType: 'sell',
      confidence: 0.8,
      reasoning: `Market demand for ${device.type} devices is currently high, and your ${device.name} could fetch a good price. Similar devices are selling well in your area.`,
      estimatedValue: device.marketValue * (1 + market.priceTrend),
      recommendedAction: `List your ${device.name} for sale on the marketplace`,
      urgency,
      optimalTiming: market.priceTrend > 0.2 ? 'next_7_days' : 'next_30_days',
      marketTrend: market.priceTrend > 0 ? 'increasing' : 'stable',
      environmentalImpact: 'Selling extends device lifecycle and reduces waste',
      taxBenefits: 'Sale proceeds may be taxable depending on jurisdiction'
    };
  }

  // Gift suggestion logic
  private shouldSuggestGift(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
    return (
      device.age < 4 &&
      device.condition === 'excellent' &&
      behavior.deviceCount > 2
    );
  }

  private createGiftSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
    return {
      deviceId: device.id,
      suggestionType: 'gift',
      confidence: 0.75,
      reasoning: `Your ${device.name} is in excellent condition and could make a perfect gift for family or friends who need a reliable device.`,
      estimatedValue: device.marketValue,
      recommendedAction: `Gift your ${device.name} to someone who needs it`,
      urgency: 'low',
      optimalTiming: 'anytime',
      marketTrend: 'stable',
      environmentalImpact: 'Gifting promotes device reuse and strengthens relationships',
      taxBenefits: 'Gifts may have tax implications depending on value and jurisdiction'
    };
  }

  // Recycling suggestion logic
  private shouldSuggestRecycling(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
    return (
      device.age > 7 ||
      device.condition === 'poor' ||
      device.marketValue < 50
    );
  }

  private createRecyclingSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
    return {
      deviceId: device.id,
      suggestionType: 'recycle',
      confidence: 0.9,
      reasoning: `Your ${device.name} has reached the end of its useful life. Proper recycling ensures valuable materials are recovered and harmful substances are disposed of safely.`,
      estimatedValue: 0,
      recommendedAction: `Recycle your ${device.name} through certified e-waste programs`,
      urgency: 'medium',
      optimalTiming: 'next_14_days',
      marketTrend: 'stable',
      environmentalImpact: 'Proper recycling prevents e-waste pollution and recovers valuable materials',
      taxBenefits: 'Some jurisdictions offer tax incentives for e-waste recycling'
    };
  }

  // Repair suggestion logic
  private shouldSuggestRepair(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
    return (
      device.age < 4 &&
      device.condition === 'poor' &&
      device.marketValue > 300 &&
      behavior.budgetConsciousness
    );
  }

  private createRepairSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
    const repairCost = device.marketValue * 0.3;

    return {
      deviceId: device.id,
      suggestionType: 'repair',
      confidence: 0.8,
      reasoning: `Your ${device.name} is relatively new and valuable. Repairing it could be more cost-effective than replacing it, especially given current market prices.`,
      estimatedValue: device.marketValue - repairCost,
      recommendedAction: `Get your ${device.name} repaired by certified technicians`,
      urgency: 'medium',
      optimalTiming: 'next_14_days',
      marketTrend: 'stable',
      environmentalImpact: 'Repairing extends device life and reduces e-waste',
      taxBenefits: 'Repair costs may be deductible for business use'
    };
  }

  // Utility methods
  private calculateDeviceAge(purchaseDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
  }

  private analyzeUsagePattern(device: any): 'high' | 'medium' | 'low' | 'none' {
    const lastUsed = new Date(device.last_used || device.purchase_date);
    const daysSinceLastUse = (new Date().getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastUse < 7) return 'high';
    if (daysSinceLastUse < 30) return 'medium';
    if (daysSinceLastUse < 90) return 'low';
    return 'none';
  }

  private estimateMarketValue(device: any, age: number): number {
    // Simplified market value estimation
    const baseValue = this.getBaseValue(device.type);
    const depreciation = Math.pow(0.8, age); // 20% depreciation per year
    const conditionMultiplier = this.getConditionMultiplier(device.condition);
    
    return Math.round(baseValue * depreciation * conditionMultiplier);
  }

  private getBaseValue(deviceType: string): number {
    const baseValues: { [key: string]: number } = {
      'smartphone': 800,
      'laptop': 1200,
      'tablet': 600,
      'desktop': 1000,
      'smartwatch': 400,
      'headphones': 200,
      'other': 300
    };
    return baseValues[deviceType] || 300;
  }

  private getConditionMultiplier(condition: string): number {
    const multipliers: { [key: string]: number } = {
      'excellent': 1.0,
      'good': 0.8,
      'fair': 0.6,
      'poor': 0.3
    };
    return multipliers[condition] || 0.8;
  }

  private calculateUpgradeFrequency(devices: any[]): 'annual' | 'biannual' | 'every_3_years' | 'rarely' {
    if (devices.length < 2) return 'rarely';
    
    const sortedDevices = devices.sort((a, b) => 
      new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
    );
    
    const avgTimeBetweenUpgrades = this.calculateAverageTimeBetweenUpgrades(sortedDevices);
    
    if (avgTimeBetweenUpgrades < 1.5) return 'annual';
    if (avgTimeBetweenUpgrades < 2.5) return 'biannual';
    if (avgTimeBetweenUpgrades < 3.5) return 'every_3_years';
    return 'rarely';
  }

  private calculateAverageTimeBetweenUpgrades(devices: any[]): number {
    if (devices.length < 2) return 5; // Default to rarely
    
    let totalTime = 0;
    let count = 0;
    
    for (let i = 0; i < devices.length - 1; i++) {
      const current = new Date(devices[i].purchase_date);
      const next = new Date(devices[i + 1].purchase_date);
      const diffYears = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24 * 365);
      totalTime += diffYears;
      count++;
    }
    
    return count > 0 ? totalTime / count : 5;
  }
}

// Export singleton instance
export const aiTransferEngine = new AITransferSuggestionEngine();
