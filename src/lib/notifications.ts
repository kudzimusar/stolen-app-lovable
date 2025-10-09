import { supabase } from './auth';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  radius_km: number;
  high_value_only: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  static async subscribeToLostFoundUpdates(userId: string) {
    try {
      const channel = supabase
        .channel('lost-found-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lost_found_reports'
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            this.handleLostFoundUpdate(payload);
          }
        )
        .subscribe();

      return channel;
    } catch (error) {
      console.error('Error subscribing to updates:', error);
      return null;
    }
  }

  static async handleLostFoundUpdate(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT' && newRecord) {
      // New lost/found report
      const message = `New ${newRecord.report_type} device report: ${newRecord.device_model}`;
      this.showNotification(message, {
        body: `Location: ${newRecord.location_address}`,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: `lost-found-${newRecord.id}`,
        data: { reportId: newRecord.id, type: newRecord.report_type }
      });
    }
  }

  static showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        if (options?.data?.reportId) {
          // Navigate to specific report
          window.location.href = `/lost-found#report-${options.data.reportId}`;
        }
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  static async saveNotificationPreferences(userId: string, preferences: NotificationPreferences) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .upsert({
          user_id: userId,
          notification_type: 'lost_found',
          preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('preferences')
        .eq('user_id', userId)
        .eq('notification_type', 'lost_found')
        .single();

      if (error) throw error;
      return data?.preferences || null;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }
  }

  static async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    try {
      // This would integrate with a push notification service
      // For now, we'll use the browser's notification API
      this.showNotification(title, { body, data });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

// Service Worker for push notifications
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};
