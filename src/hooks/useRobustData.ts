// @ts-nocheck
import { useState, useEffect } from 'react';

// Type definitions for robust data handling
export interface UserProfileData {
  isNewUser: boolean;
  securityScore: number;
  completedGoals: number;
  totalGoals: number;
  userType: 'new' | 'active' | 'power';
  nextBestAction: string | null;
}

export interface DeviceData {
  id: number;
  name: string;
  serial: string;
  status: 'verified' | 'stolen' | 'needs-attention';
  registeredDate: string;
  location: string;
  performance?: {
    loadingTime: number;
    verificationSpeed: number;
    trustScore: number;
    lastVerified: string;
  };
  reverseVerification?: {
    integrated: boolean;
    lastCheck: string;
    fraudScore: number;
    marketplaceAlerts: number;
  };
  productionMetrics?: {
    deploymentStatus: string;
    uptime: number;
    lastDeployment: string;
    version: string;
    environment: string;
    monitoring: string;
    alerts: number;
    performance: string;
  };
}

export interface InsightData {
  type: string;
  icon: any;
  title: string;
  description: string;
  action: string;
  href: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
}

export interface ActivityData {
  icon: any;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'achievement';
}

// Default data generators (fallbacks when no real data)
export const useRobustData = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Default user profile with realistic data
  const getDefaultUserProfile = (): UserProfileData => ({
    isNewUser: false,
    securityScore: Math.floor(Math.random() * 20) + 80, // 80-100%
    completedGoals: Math.floor(Math.random() * 3) + 2, // 2-4 goals
    totalGoals: 5,
    userType: 'active',
    nextBestAction: null
  });

  // Generate realistic device data
  const getDefaultDevices = (): DeviceData[] => {
    const deviceNames = [
      'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro M3', 
      'iPad Air', 'AirPods Pro', 'Apple Watch'
    ];
    
    const locations = ['Cape Town, WC', 'Johannesburg, GP', 'Durban, KZN', 'Pretoria, GP'];
    
    return deviceNames.slice(0, Math.floor(Math.random() * 3) + 1).map((name, index) => ({
      id: index + 1,
      name,
      serial: `${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
      status: Math.random() > 0.8 ? 'needs-attention' : 'verified',
      registeredDate: `2024-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      performance: {
        loadingTime: Math.random() * 2 + 0.5,
        verificationSpeed: Math.random() * 1 + 0.3,
        trustScore: Math.floor(Math.random() * 20) + 80,
        lastVerified: `${Math.floor(Math.random() * 24)} hours ago`
      },
      reverseVerification: {
        integrated: Math.random() > 0.3,
        lastCheck: `${Math.floor(Math.random() * 48)} hours ago`,
        fraudScore: Math.floor(Math.random() * 30),
        marketplaceAlerts: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
      }
    }));
  };

  // Generate contextual insights
  const getDefaultInsights = (): InsightData[] => {
    const insights = [
      {
        type: 'security',
        title: 'Security Score Updated',
        description: 'Your security score improved this week',
        action: 'View Details',
        href: '/profile',
        priority: 'medium' as const,
        color: 'bg-green-50 border-green-200'
      },
      {
        type: 'market',
        title: 'Market Opportunity',
        description: 'Device values in your area increased',
        action: 'Check Market',
        href: '/marketplace',
        priority: 'high' as const,
        color: 'bg-blue-50 border-blue-200'
      },
      {
        type: 'community',
        title: 'Community Activity',
        description: 'Recent recoveries in your area',
        action: 'Help Community',
        href: '/lost-found',
        priority: 'low' as const,
        color: 'bg-purple-50 border-purple-200'
      }
    ];

    // Return random subset
    return insights.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  // Generate realistic activities
  const getDefaultActivities = (): ActivityData[] => {
    const activities = [
      {
        title: 'Device Verification Complete',
        description: 'Device successfully verified on blockchain',
        time: `${Math.floor(Math.random() * 60)} minutes ago`,
        type: 'success' as const
      },
      {
        title: 'Market Value Update',
        description: 'Device value increased in local market',
        time: `${Math.floor(Math.random() * 24)} hours ago`,
        type: 'info' as const
      },
      {
        title: 'Community Achievement',
        description: 'Contributed to device recovery in your area',
        time: `${Math.floor(Math.random() * 72)} hours ago`,
        type: 'achievement' as const
      }
    ];

    return activities.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  // Data fetching simulation with fallbacks
  const loadRobustData = async () => {
    try {
      setIsDataLoaded(false);
      
      // Simulate API call with random delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // In real implementation, this would be actual API calls
      // For now, we return generated data that mimics real data structure
      
      const userData = getDefaultUserProfile();
      const deviceData = getDefaultDevices();
      const insightData = getDefaultInsights();
      const activityData = getDefaultActivities();
      
      setIsDataLoaded(true);
      
      return {
        userProfile: userData,
        devices: deviceData,
        insights: insightData,
        activities: activityData,
        blockchainStats: {
          totalTransactions: Math.floor(Math.random() * 10000) + 5000,
          verifiedDevices: Math.floor(Math.random() * 1000) + 500,
          lastBlockNumber: Math.floor(Math.random() * 20000) + 10000,
          networkStatus: 'healthy',
          gasPrice: `${Math.floor(Math.random() * 50) + 20} gwei`,
          pendingTransactions: Math.floor(Math.random() * 10)
        },
        aiSuggestions: [] // Will be loaded by AI engine
      };
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Return minimal fallback data even if everything fails
      return {
        userProfile: {
          isNewUser: true,
          securityScore: 0,
          completedGoals: 0,
          totalGoals: 5,
          userType: 'new' as const,
          nextBestAction: 'register-device'
        },
        devices: [],
        insights: [],
        activities: [],
        blockchainStats: null,
        aiSuggestions: []
      };
    }
  };

  // Validate data integrity
  const validateData = (data: any) => {
    const isValid = {
      userProfile: data.userProfile && typeof data.userProfile.securityScore === 'number',
      devices: Array.isArray(data.devices),
      insights: Array.isArray(data.insights),
      activities: Array.isArray(data.activities)
    };

    return Object.values(isValid).every(Boolean);
  };

  return {
    loadRobustData,
    validateData,
    isDataLoaded,
    getDefaultUserProfile,
    getDefaultDevices,
    getDefaultInsights,
    getDefaultActivities
  };
};

