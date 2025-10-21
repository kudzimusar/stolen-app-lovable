// @ts-nocheck
import { DeviceAnalysis, UserBehavior, MarketData } from './ai-transfer-suggestion-engine';

// Types for Transfer Timing Optimization
export interface TransferTiming {
  deviceId: string;
  recommendation: 'transfer_soon' | 'wait' | 'transfer_now' | 'hold';
  reasoning: string;
  optimalWindow: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedLoss?: number;
  estimatedGain?: number;
  marketFactors: {
    demandTrend: number;
    priceTrend: number;
    seasonalFactor: number;
    competitionLevel: number;
  };
  userFactors: {
    upgradePattern: string;
    financialSituation: string;
    timeAvailability: string;
  };
  environmentalFactors: {
    deviceAge: number;
    condition: string;
    maintenanceNeeded: boolean;
    energyEfficiency: number;
  };
}

export interface TimingAnalysis {
  deviceId: string;
  currentValue: number;
  projectedValue: number;
  optimalTransferDate: Date;
  confidence: number;
  riskFactors: string[];
  opportunityFactors: string[];
  recommendations: string[];
}

export interface MarketTrend {
  deviceType: string;
  demandTrend: number;
  priceTrend: number;
  supplyTrend: number;
  seasonalPattern: number[];
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

// Transfer Timing Optimizer
export class TransferTimingOptimizer {
  private marketTrends: { [key: string]: MarketTrend };
  private seasonalFactors: { [key: string]: number[] };

  constructor() {
    this.initializeMarketTrends();
    this.initializeSeasonalFactors();
  }

  // Main method to get optimal transfer timing
  async getOptimalTransferTime(deviceId: string): Promise<TransferTiming> {
    try {
      console.log(`⏰ Analyzing optimal transfer timing for device: ${deviceId}`);

      const device = await this.getDevice(deviceId);
      const marketData = await this.getMarketData(device.type);
      const userBehavior = await this.getUserBehavior(device.ownerId);
      
      const timing = this.calculateOptimalTiming(device, marketData, userBehavior);
      
      console.log(`✅ Optimal timing analysis complete: ${timing.recommendation}`);
      return timing;

    } catch (error) {
      console.error('❌ Error analyzing transfer timing:', error);
      throw new Error(`Failed to analyze transfer timing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get comprehensive timing analysis
  async getComprehensiveTimingAnalysis(deviceId: string): Promise<TimingAnalysis> {
    try {
      const device = await this.getDevice(deviceId);
      const marketData = await this.getMarketData(device.type);
      const userBehavior = await this.getUserBehavior(device.ownerId);

      const currentValue = this.estimateCurrentValue(device, marketData);
      const projectedValue = this.projectFutureValue(device, marketData);
      const optimalDate = this.calculateOptimalTransferDate(device, marketData, userBehavior);

      return {
        deviceId,
        currentValue,
        projectedValue,
        optimalTransferDate: optimalDate,
        confidence: this.calculateConfidence(device, marketData, userBehavior),
        riskFactors: this.identifyRiskFactors(device, marketData, userBehavior),
        opportunityFactors: this.identifyOpportunityFactors(device, marketData, userBehavior),
        recommendations: this.generateRecommendations(device, marketData, userBehavior)
      };

    } catch (error) {
      console.error('❌ Error in comprehensive timing analysis:', error);
      throw new Error(`Failed to analyze timing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Core timing calculation logic
  private calculateOptimalTiming(
    device: DeviceAnalysis,
    market: MarketData,
    behavior: UserBehavior
  ): TransferTiming {
    const currentValue = this.estimateCurrentValue(device, market);
    const projectedValue = this.projectFutureValue(device, market);
    const marketTrend = this.analyzeMarketTrend(device.type, market);
    const seasonalFactor = this.getSeasonalFactor(device.type);
    
    // Calculate value change
    const valueChange = projectedValue - currentValue;
    const valueChangePercent = (valueChange / currentValue) * 100;

    // Determine recommendation based on multiple factors
    let recommendation: TransferTiming['recommendation'];
    let urgency: TransferTiming['urgency'];
    let reasoning: string;
    let optimalWindow: string;

    // High urgency scenarios
    if (valueChangePercent < -20) {
      recommendation = 'transfer_soon';
      urgency = 'critical';
      reasoning = 'Device value is expected to decline significantly. Immediate action recommended.';
      optimalWindow = 'next_7_days';
    }
    // Market opportunity scenarios
    else if (marketTrend === 'increasing' && valueChangePercent > 10) {
      recommendation = 'wait';
      urgency = 'low';
      reasoning = 'Market value is increasing. Waiting could maximize your return.';
      optimalWindow = 'next_90_days';
    }
    // User pattern scenarios
    else if (behavior.upgradePattern === 'annual' && device.age > 2) {
      recommendation = 'transfer_now';
      urgency = 'medium';
      reasoning = 'Based on your upgrade pattern, now is a good time to transfer.';
      optimalWindow = 'next_30_days';
    }
    // Default scenario
    else {
      recommendation = 'hold';
      urgency = 'low';
      reasoning = 'Current market conditions suggest holding the device for now.';
      optimalWindow = 'next_60_days';
    }

    return {
      deviceId: device.id,
      recommendation,
      reasoning,
      optimalWindow,
      urgency,
      estimatedLoss: valueChange < 0 ? Math.abs(valueChange) : undefined,
      estimatedGain: valueChange > 0 ? valueChange : undefined,
      marketFactors: {
        demandTrend: market.demandTrend,
        priceTrend: market.priceTrend,
        seasonalFactor: seasonalFactor,
        competitionLevel: this.calculateCompetitionLevel(device.type, market)
      },
      userFactors: {
        upgradePattern: behavior.upgradeFrequency,
        financialSituation: this.assessFinancialSituation(behavior),
        timeAvailability: this.assessTimeAvailability(behavior)
      },
      environmentalFactors: {
        deviceAge: device.age,
        condition: device.condition,
        maintenanceNeeded: this.assessMaintenanceNeeds(device),
        energyEfficiency: this.calculateEnergyEfficiency(device)
      }
    };
  }

  // Estimate current device value
  private estimateCurrentValue(device: DeviceAnalysis, market: MarketData): number {
    const baseValue = this.getBaseValue(device.type);
    const ageDepreciation = Math.pow(0.85, device.age); // 15% depreciation per year
    const conditionMultiplier = this.getConditionMultiplier(device.condition);
    const marketAdjustment = 1 + market.priceTrend;
    
    return Math.round(baseValue * ageDepreciation * conditionMultiplier * marketAdjustment);
  }

  // Project future device value
  private projectFutureValue(device: DeviceAnalysis, market: MarketData): number {
    const currentValue = this.estimateCurrentValue(device, market);
    const futureAge = device.age + 0.5; // 6 months from now
    const futureDepreciation = Math.pow(0.85, futureAge) / Math.pow(0.85, device.age);
    const marketProjection = 1 + (market.priceTrend * 0.5); // 6-month projection
    
    return Math.round(currentValue * futureDepreciation * marketProjection);
  }

  // Calculate optimal transfer date
  private calculateOptimalTransferDate(
    device: DeviceAnalysis,
    market: MarketData,
    behavior: UserBehavior
  ): Date {
    const now = new Date();
    const timing = this.calculateOptimalTiming(device, market, behavior);
    
    let daysToAdd = 0;
    
    switch (timing.optimalWindow) {
      case 'next_7_days':
        daysToAdd = 3; // Middle of the week
        break;
      case 'next_30_days':
        daysToAdd = 15; // Middle of the month
        break;
      case 'next_60_days':
        daysToAdd = 30; // Middle of the period
        break;
      case 'next_90_days':
        daysToAdd = 45; // Middle of the quarter
        break;
      default:
        daysToAdd = 30;
    }
    
    const optimalDate = new Date(now);
    optimalDate.setDate(optimalDate.getDate() + daysToAdd);
    
    return optimalDate;
  }

  // Analyze market trend for device type
  private analyzeMarketTrend(deviceType: string, market: MarketData): 'increasing' | 'decreasing' | 'stable' {
    const trend = market.priceTrend;
    
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
  }

  // Get seasonal factor for device type
  private getSeasonalFactor(deviceType: string): number {
    const currentMonth = new Date().getMonth();
    const seasonalPattern = this.seasonalFactors[deviceType] || this.seasonalFactors['default'];
    return seasonalPattern[currentMonth] || 1.0;
  }

  // Calculate competition level
  private calculateCompetitionLevel(deviceType: string, market: MarketData): number {
    // Higher supply trend means more competition
    return Math.max(0, market.supplyTrend + 1) / 2; // Normalize to 0-1
  }

  // Assess financial situation
  private assessFinancialSituation(behavior: UserBehavior): string {
    if (behavior.budgetConsciousness) return 'budget_conscious';
    if (behavior.marketplaceActivity > 5) return 'market_active';
    return 'standard';
  }

  // Assess time availability
  private assessTimeAvailability(behavior: UserBehavior): string {
    // This would be based on user activity patterns
    return 'available';
  }

  // Assess maintenance needs
  private assessMaintenanceNeeds(device: DeviceAnalysis): boolean {
    return device.maintenanceHistory.length > 2 || device.condition === 'poor';
  }

  // Calculate energy efficiency
  private calculateEnergyEfficiency(device: DeviceAnalysis): number {
    // Simplified energy efficiency calculation
    const ageFactor = Math.max(0.5, 1 - (device.age * 0.1));
    const conditionFactor = device.condition === 'excellent' ? 1 : 0.8;
    return ageFactor * conditionFactor;
  }

  // Calculate confidence level
  private calculateConfidence(
    device: DeviceAnalysis,
    market: MarketData,
    behavior: UserBehavior
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Market data confidence
    confidence += Math.abs(market.priceTrend) * 0.2;
    confidence += Math.abs(market.demandTrend) * 0.2;
    
    // Device data confidence
    confidence += device.age < 3 ? 0.1 : -0.1;
    confidence += device.condition === 'excellent' ? 0.1 : 0;
    
    // User behavior confidence
    confidence += behavior.marketplaceActivity > 0 ? 0.1 : 0;
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  // Identify risk factors
  private identifyRiskFactors(
    device: DeviceAnalysis,
    market: MarketData,
    behavior: UserBehavior
  ): string[] {
    const risks: string[] = [];
    
    if (device.age > 5) risks.push('Device age may limit market appeal');
    if (device.condition === 'poor') risks.push('Poor condition may reduce value');
    if (market.priceTrend < -0.1) risks.push('Declining market prices');
    if (market.supplyTrend > 0.2) risks.push('High market competition');
    
    return risks;
  }

  // Identify opportunity factors
  private identifyOpportunityFactors(
    device: DeviceAnalysis,
    market: MarketData,
    behavior: UserBehavior
  ): string[] {
    const opportunities: string[] = [];
    
    if (device.age < 3) opportunities.push('Device is relatively new');
    if (device.condition === 'excellent') opportunities.push('Excellent condition commands premium');
    if (market.priceTrend > 0.1) opportunities.push('Rising market prices');
    if (market.demandTrend > 0.2) opportunities.push('High market demand');
    
    return opportunities;
  }

  // Generate recommendations
  private generateRecommendations(
    device: DeviceAnalysis,
    market: MarketData,
    behavior: UserBehavior
  ): string[] {
    const recommendations: string[] = [];
    
    if (device.condition === 'poor') {
      recommendations.push('Consider repairing before transfer to maximize value');
    }
    
    if (market.priceTrend > 0.2) {
      recommendations.push('Market prices are rising - consider waiting for better returns');
    }
    
    if (behavior.marketplaceActivity === 0) {
      recommendations.push('Consider exploring marketplace options for better pricing');
    }
    
    return recommendations;
  }

  // Initialize market trends
  private initializeMarketTrends() {
    this.marketTrends = {
      smartphone: {
        deviceType: 'smartphone',
        demandTrend: 0.15,
        priceTrend: 0.1,
        supplyTrend: -0.05,
        seasonalPattern: [0.9, 0.8, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3],
        forecast: {
          nextMonth: 0.12,
          nextQuarter: 0.08,
          nextYear: 0.05
        }
      },
      laptop: {
        deviceType: 'laptop',
        demandTrend: 0.2,
        priceTrend: 0.15,
        supplyTrend: -0.1,
        seasonalPattern: [1.0, 0.9, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0],
        forecast: {
          nextMonth: 0.18,
          nextQuarter: 0.12,
          nextYear: 0.08
        }
      },
      tablet: {
        deviceType: 'tablet',
        demandTrend: 0.05,
        priceTrend: 0.02,
        supplyTrend: 0.1,
        seasonalPattern: [0.8, 0.7, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2],
        forecast: {
          nextMonth: 0.03,
          nextQuarter: 0.01,
          nextYear: -0.02
        }
      }
    };
  }

  // Initialize seasonal factors
  private initializeSeasonalFactors() {
    this.seasonalFactors = {
      smartphone: [0.9, 0.8, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.2, 1.3],
      laptop: [1.0, 0.9, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0],
      tablet: [0.8, 0.7, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2],
      default: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    };
  }

  // Mock data methods (in real implementation, these would fetch from database)
  private async getDevice(deviceId: string): Promise<DeviceAnalysis> {
    // Mock device data
    return {
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
    };
  }

  private async getMarketData(deviceType: string): Promise<MarketData> {
    const trend = this.marketTrends[deviceType] || this.marketTrends.smartphone;
    
    return {
      demandTrend: trend.demandTrend,
      supplyTrend: trend.supplyTrend,
      priceTrend: trend.priceTrend,
      seasonalFactor: this.getSeasonalFactor(deviceType),
      averagePrice: 500,
      marketVolume: 1000
    };
  }

  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    // Mock user behavior data
    return {
      upgradeFrequency: 'biannual',
      donationHistory: 2,
      marketplaceActivity: 5,
      deviceCount: 3,
      location: 'Johannesburg, South Africa',
      charitableGiving: true,
      environmentalConsciousness: true,
      budgetConsciousness: false
    };
  }

  // Utility methods
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
}

// Export singleton instance
export const timingOptimizer = new TransferTimingOptimizer();
