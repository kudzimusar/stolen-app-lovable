import { supabase } from './auth';
import { useState, useEffect } from 'react';

export interface AnalyticsData {
  totalReports: number;
  totalUsers: number;
  recoveryRate: number;
  averageResponseTime: number;
  topLocations: Array<{ location: string; count: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  monthlyTrends: Array<{ month: string; reports: number; recoveries: number }>;
  userEngagement: {
    activeUsers: number;
    newUsers: number;
    returningUsers: number;
  };
}

export interface ReportMetrics {
  reportsCreated: number;
  reportsResolved: number;
  averageResolutionTime: number;
  successRate: number;
}

export class AnalyticsService {
  static async getCommunityAnalytics(): Promise<AnalyticsData> {
    try {
      // Get total reports
      const { count: totalReports } = await supabase
        .from('lost_found_reports')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get recovery rate
      const { data: resolvedReports } = await supabase
        .from('lost_found_reports')
        .select('id')
        .eq('verification_status', 'resolved');

      const recoveryRate = totalReports ? (resolvedReports?.length || 0) / totalReports * 100 : 0;

      // Get top locations
      const { data: locationData } = await supabase
        .from('lost_found_reports')
        .select('location_address')
        .not('location_address', 'is', null);

      const locationCounts = locationData?.reduce((acc: any, report) => {
        const location = report.location_address;
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {}) || {};

      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get device types
      const { data: deviceData } = await supabase
        .from('lost_found_reports')
        .select('device_category')
        .not('device_category', 'is', null);

      const deviceCounts = deviceData?.reduce((acc: any, report) => {
        const type = report.device_category;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}) || {};

      const deviceTypes = Object.entries(deviceCounts)
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get monthly trends (last 12 months)
      const monthlyTrends = await this.getMonthlyTrends();

      // Get user engagement
      const userEngagement = await this.getUserEngagement();

      return {
        totalReports: totalReports || 0,
        totalUsers: totalUsers || 0,
        recoveryRate: Math.round(recoveryRate * 100) / 100,
        averageResponseTime: 24, // Placeholder - would calculate from actual data
        topLocations,
        deviceTypes,
        monthlyTrends,
        userEngagement
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  static async getMonthlyTrends(): Promise<Array<{ month: string; reports: number; recoveries: number }>> {
    try {
      const { data: reports } = await supabase
        .from('lost_found_reports')
        .select('created_at, verification_status')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      const monthlyData: { [key: string]: { reports: number; recoveries: number } } = {};

      reports?.forEach(report => {
        const month = new Date(report.created_at).toISOString().substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { reports: 0, recoveries: 0 };
        }
        monthlyData[month].reports++;
        if (report.verification_status === 'resolved') {
          monthlyData[month].recoveries++;
        }
      });

      return Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);
    } catch (error) {
      console.error('Error getting monthly trends:', error);
      return [];
    }
  }

  static async getUserEngagement(): Promise<{ activeUsers: number; newUsers: number; returningUsers: number }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Active users (last 30 days)
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', thirtyDaysAgo);

      // New users (last 30 days)
      const { count: newUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo);

      // Returning users (active in last 7 days)
      const { count: returningUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', sevenDaysAgo);

      return {
        activeUsers: activeUsers || 0,
        newUsers: newUsers || 0,
        returningUsers: returningUsers || 0
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return { activeUsers: 0, newUsers: 0, returningUsers: 0 };
    }
  }

  static async getReportMetrics(): Promise<ReportMetrics> {
    try {
      const { count: reportsCreated } = await supabase
        .from('lost_found_reports')
        .select('*', { count: 'exact', head: true });

      const { count: reportsResolved } = await supabase
        .from('lost_found_reports')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'resolved');

      const successRate = reportsCreated ? (reportsResolved || 0) / reportsCreated * 100 : 0;

      return {
        reportsCreated: reportsCreated || 0,
        reportsResolved: reportsResolved || 0,
        averageResolutionTime: 48, // Placeholder - would calculate from actual data
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting report metrics:', error);
      throw error;
    }
  }

  static async trackEvent(eventName: string, properties?: any) {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          properties: properties || {},
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  static async getGeographicHeatmap(): Promise<Array<{ lat: number; lng: number; intensity: number }>> {
    try {
      const { data: reports } = await supabase
        .from('lost_found_reports')
        .select('location_lat, location_lng')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);

      const heatmapData: { [key: string]: number } = {};

      reports?.forEach(report => {
        const key = `${report.location_lat},${report.location_lng}`;
        heatmapData[key] = (heatmapData[key] || 0) + 1;
      });

      return Object.entries(heatmapData).map(([key, intensity]) => {
        const [lat, lng] = key.split(',').map(Number);
        return { lat, lng, intensity };
      });
    } catch (error) {
      console.error('Error getting geographic heatmap:', error);
      return [];
    }
  }

  static async getPerformanceMetrics(): Promise<{
    averageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  }> {
    try {
      // These would be calculated from actual performance monitoring
      return {
        averageLoadTime: 1.2,
        apiResponseTime: 0.3,
        errorRate: 0.5,
        uptime: 99.9
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }
}

// React hook for analytics

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getCommunityAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    refresh: loadAnalytics
  };
}
