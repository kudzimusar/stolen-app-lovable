import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferSuggestion {
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

interface DeviceAnalysis {
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
  transferHistory: any[];
}

interface UserBehavior {
  upgradeFrequency: 'annual' | 'biannual' | 'every_3_years' | 'rarely';
  donationHistory: number;
  marketplaceActivity: number;
  deviceCount: number;
  location: string;
  charitableGiving: boolean;
  environmentalConsciousness: boolean;
  budgetConsciousness: boolean;
}

interface MarketData {
  demandTrend: number;
  supplyTrend: number;
  priceTrend: number;
  seasonalFactor: number;
  averagePrice: number;
  marketVolume: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { action, deviceId } = await req.json();

    console.log('AI Transfer Suggestions action:', action, 'by user:', user.id);

    switch (action) {
      case 'get_suggestions':
        return await getTransferSuggestions(supabaseServiceClient, user.id);
      
      case 'get_device_suggestion':
        return await getDeviceSuggestion(supabaseServiceClient, user.id, deviceId);
      
      case 'update_suggestion_feedback':
        return await updateSuggestionFeedback(supabaseServiceClient, user.id, await req.json());
      
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in ai-transfer-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Get transfer suggestions for a user
async function getTransferSuggestions(supabase: any, userId: string) {
  try {
    console.log(`🤖 Generating transfer suggestions for user: ${userId}`);

    const userDevices = await getUserDevices(supabase, userId);
    const userBehavior = await analyzeUserBehavior(supabase, userId);
    const marketData = await getMarketData();

    const suggestions: TransferSuggestion[] = [];

    for (const device of userDevices) {
      const suggestion = await analyzeDeviceForTransfer(device, userBehavior, marketData);
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

    // Store suggestions in database for tracking
    await storeSuggestions(supabase, userId, suggestions);

    console.log(`✅ Generated ${suggestions.length} transfer suggestions`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      suggestions,
      total: suggestions.length,
      urgent: suggestions.filter(s => s.urgency === 'high').length,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error generating transfer suggestions:', error);
    throw new Error(`Failed to generate transfer suggestions: ${error.message}`);
  }
}

// Get suggestion for specific device
async function getDeviceSuggestion(supabase: any, userId: string, deviceId: string) {
  try {
    const device = await getDevice(supabase, deviceId);
    const userBehavior = await analyzeUserBehavior(supabase, userId);
    const marketData = await getMarketData();

    const suggestion = await analyzeDeviceForTransfer(device, userBehavior, marketData);

    return new Response(JSON.stringify({ 
      success: true, 
      suggestion,
      device,
      marketData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error getting device suggestion:', error);
    throw new Error(`Failed to get device suggestion: ${error.message}`);
  }
}

// Update suggestion feedback
async function updateSuggestionFeedback(supabase: any, userId: string, feedback: any) {
  try {
    const { suggestionId, action, feedback: userFeedback, rating } = feedback;

    const { error } = await supabase
      .from('ai_suggestion_feedback')
      .insert({
        user_id: userId,
        suggestion_id: suggestionId,
        action,
        feedback: userFeedback,
        rating,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Feedback recorded successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error updating suggestion feedback:', error);
    throw new Error(`Failed to update feedback: ${error.message}`);
  }
}

// Get user's devices with analysis
async function getUserDevices(supabase: any, userId: string): Promise<DeviceAnalysis[]> {
  const { data: devices, error } = await supabase
    .from('devices')
    .select(`
      *,
      transfer_history:device_transfers(*)
    `)
    .eq('owner_id', userId);

  if (error) throw error;

  return devices.map((device: any) => analyzeDevice(device));
}

// Get specific device
async function getDevice(supabase: any, deviceId: string): Promise<DeviceAnalysis> {
  const { data: device, error } = await supabase
    .from('devices')
    .select(`
      *,
      transfer_history:device_transfers(*)
    `)
    .eq('id', deviceId)
    .single();

  if (error) throw error;

  return analyzeDevice(device);
}

// Analyze individual device
function analyzeDevice(device: any): DeviceAnalysis {
  const purchaseDate = new Date(device.purchase_date);
  const age = calculateDeviceAge(purchaseDate);
  const usagePattern = analyzeUsagePattern(device);
  const marketValue = estimateMarketValue(device, age);

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
async function analyzeUserBehavior(supabase: any, userId: string): Promise<UserBehavior> {
  const { data: userData, error } = await supabase
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
    upgradeFrequency: calculateUpgradeFrequency(userData.devices),
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
async function getMarketData(): Promise<MarketData> {
  // In a real implementation, this would fetch from market data APIs
  // For now, return simulated data
  return {
    demandTrend: 0.2,
    supplyTrend: -0.1,
    priceTrend: 0.15,
    seasonalFactor: 0.8,
    averagePrice: 500,
    marketVolume: 1000
  };
}

// Core AI logic for device transfer analysis
async function analyzeDeviceForTransfer(
  device: DeviceAnalysis,
  behavior: UserBehavior,
  market: MarketData
): Promise<TransferSuggestion | null> {
  
  // Upgrade suggestions
  if (shouldSuggestUpgrade(device, behavior, market)) {
    return createUpgradeSuggestion(device, behavior, market);
  }

  // Donation suggestions
  if (shouldSuggestDonation(device, behavior, market)) {
    return createDonationSuggestion(device, behavior, market);
  }

  // Sale suggestions
  if (shouldSuggestSale(device, behavior, market)) {
    return createSaleSuggestion(device, behavior, market);
  }

  // Gift suggestions
  if (shouldSuggestGift(device, behavior, market)) {
    return createGiftSuggestion(device, behavior, market);
  }

  // Recycling suggestions
  if (shouldSuggestRecycling(device, behavior, market)) {
    return createRecyclingSuggestion(device, behavior, market);
  }

  // Repair suggestions
  if (shouldSuggestRepair(device, behavior, market)) {
    return createRepairSuggestion(device, behavior, market);
  }

  return null;
}

// Upgrade suggestion logic
function shouldSuggestUpgrade(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
  return (
    device.age > 3 &&
    behavior.upgradeFrequency !== 'rarely' &&
    device.marketValue > 200 &&
    market.priceTrend > 0.1
  );
}

function createUpgradeSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
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
function shouldSuggestDonation(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
  return (
    (device.age > 5 || device.marketValue < 150) &&
    (behavior.charitableGiving || behavior.environmentalConsciousness) &&
    device.condition !== 'poor'
  );
}

function createDonationSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
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
function shouldSuggestSale(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
  return (
    device.marketValue > 200 &&
    device.age < 5 &&
    behavior.marketplaceActivity > 0 &&
    market.demandTrend > 0.1
  );
}

function createSaleSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
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
function shouldSuggestGift(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
  return (
    device.age < 4 &&
    device.condition === 'excellent' &&
    behavior.deviceCount > 2
  );
}

function createGiftSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
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
function shouldSuggestRecycling(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
  return (
    device.age > 7 ||
    device.condition === 'poor' ||
    device.marketValue < 50
  );
}

function createRecyclingSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
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
function shouldSuggestRepair(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): boolean {
  return (
    device.age < 4 &&
    device.condition === 'poor' &&
    device.marketValue > 300 &&
    behavior.budgetConsciousness
  );
}

function createRepairSuggestion(device: DeviceAnalysis, behavior: UserBehavior, market: MarketData): TransferSuggestion {
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

// Store suggestions in database
async function storeSuggestions(supabase: any, userId: string, suggestions: TransferSuggestion[]) {
  try {
    const suggestionRecords = suggestions.map(suggestion => ({
      user_id: userId,
      device_id: suggestion.deviceId,
      suggestion_type: suggestion.suggestionType,
      confidence: suggestion.confidence,
      reasoning: suggestion.reasoning,
      estimated_value: suggestion.estimatedValue,
      recommended_action: suggestion.recommendedAction,
      urgency: suggestion.urgency,
      optimal_timing: suggestion.optimalTiming,
      market_trend: suggestion.marketTrend,
      environmental_impact: suggestion.environmentalImpact,
      tax_benefits: suggestion.taxBenefits,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('ai_transfer_suggestions')
      .insert(suggestionRecords);

    if (error) {
      console.error('Error storing suggestions:', error);
    }
  } catch (error) {
    console.error('Error storing suggestions:', error);
  }
}

// Utility functions
function calculateDeviceAge(purchaseDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
}

function analyzeUsagePattern(device: any): 'high' | 'medium' | 'low' | 'none' {
  const lastUsed = new Date(device.last_used || device.purchase_date);
  const daysSinceLastUse = (new Date().getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLastUse < 7) return 'high';
  if (daysSinceLastUse < 30) return 'medium';
  if (daysSinceLastUse < 90) return 'low';
  return 'none';
}

function estimateMarketValue(device: any, age: number): number {
  const baseValue = getBaseValue(device.type);
  const depreciation = Math.pow(0.8, age);
  const conditionMultiplier = getConditionMultiplier(device.condition);
  
  return Math.round(baseValue * depreciation * conditionMultiplier);
}

function getBaseValue(deviceType: string): number {
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

function getConditionMultiplier(condition: string): number {
  const multipliers: { [key: string]: number } = {
    'excellent': 1.0,
    'good': 0.8,
    'fair': 0.6,
    'poor': 0.3
  };
  return multipliers[condition] || 0.8;
}

function calculateUpgradeFrequency(devices: any[]): 'annual' | 'biannual' | 'every_3_years' | 'rarely' {
  if (devices.length < 2) return 'rarely';
  
  const sortedDevices = devices.sort((a, b) => 
    new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
  );
  
  const avgTimeBetweenUpgrades = calculateAverageTimeBetweenUpgrades(sortedDevices);
  
  if (avgTimeBetweenUpgrades < 1.5) return 'annual';
  if (avgTimeBetweenUpgrades < 2.5) return 'biannual';
  if (avgTimeBetweenUpgrades < 3.5) return 'every_3_years';
  return 'rarely';
}

function calculateAverageTimeBetweenUpgrades(devices: any[]): number {
  if (devices.length < 2) return 5;
  
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
