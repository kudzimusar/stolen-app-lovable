import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export class RealtimeService {
  private subscriptions: Map<string, any> = new Map();

  // Subscribe to lost and found reports
  subscribeToReports(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('lost_found_reports')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lost_found_reports'
        },
        callback
      )
      .subscribe();

    this.subscriptions.set('reports', subscription);
    return subscription;
  }

  // Subscribe to community tips
  subscribeToTips(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('community_tips')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_tips'
        },
        callback
      )
      .subscribe();

    this.subscriptions.set('tips', subscription);
    return subscription;
  }

  // Subscribe to device matches
  subscribeToMatches(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('device_matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_matches'
        },
        callback
      )
      .subscribe();

    this.subscriptions.set('matches', subscription);
    return subscription;
  }

  // Subscribe to community events
  subscribeToEvents(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('community_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_events'
        },
        callback
      )
      .subscribe();

    this.subscriptions.set('events', subscription);
    return subscription;
  }

  // Subscribe to user notifications
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.subscriptions.set(`notifications_${userId}`, subscription);
    return subscription;
  }

  // Subscribe to all community updates
  subscribeToCommunityUpdates(callbacks: {
    onReportUpdate?: (payload: any) => void;
    onTipUpdate?: (payload: any) => void;
    onMatchUpdate?: (payload: any) => void;
    onEventUpdate?: (payload: any) => void;
  }) {
    if (callbacks.onReportUpdate) {
      this.subscribeToReports(callbacks.onReportUpdate);
    }
    if (callbacks.onTipUpdate) {
      this.subscribeToTips(callbacks.onTipUpdate);
    }
    if (callbacks.onMatchUpdate) {
      this.subscribeToMatches(callbacks.onMatchUpdate);
    }
    if (callbacks.onEventUpdate) {
      this.subscribeToEvents(callbacks.onEventUpdate);
    }
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return supabase.getChannels().map(channel => ({
      topic: channel.topic,
      state: channel.state
    }));
  }
}

// Create a singleton instance
export const realtimeService = new RealtimeService();

// React hook for real-time updates
export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any[]>([]);

  useEffect(() => {
    // Check connection status
    const checkStatus = () => {
      const status = realtimeService.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(status.length > 0);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => {
      clearInterval(interval);
      realtimeService.unsubscribeAll();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    subscribeToReports: realtimeService.subscribeToReports.bind(realtimeService),
    subscribeToTips: realtimeService.subscribeToTips.bind(realtimeService),
    subscribeToMatches: realtimeService.subscribeToMatches.bind(realtimeService),
    subscribeToEvents: realtimeService.subscribeToEvents.bind(realtimeService),
    subscribeToNotifications: realtimeService.subscribeToNotifications.bind(realtimeService),
    subscribeToCommunityUpdates: realtimeService.subscribeToCommunityUpdates.bind(realtimeService),
    unsubscribe: realtimeService.unsubscribe.bind(realtimeService),
    unsubscribeAll: realtimeService.unsubscribeAll.bind(realtimeService)
  };
}
