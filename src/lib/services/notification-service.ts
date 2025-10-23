/**
 * Unified Notification Service
 * Handles all notification operations across the application
 */

interface NotificationRequest {
  userId: string;
  type: string;
  category: 'device' | 'marketplace' | 'insurance' | 'repair' | 'payment' | 'security' | 'admin' | 'lost_found' | 'community' | 'transfer';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: number;
  channels?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    in_app?: boolean;
  };
  scheduledFor?: string;
  expiresAt?: string;
}

interface NotificationPreferences {
  category: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  filters: Record<string, any>;
}

interface NotificationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private supabaseClient: any;

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  static getInstance(supabaseClient: any): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(supabaseClient);
    }
    return NotificationService.instance;
  }

  /**
   * Send a single notification
   */
  async sendNotification(request: NotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multiple notifications in batch
   */
  async sendBatchNotifications(requests: NotificationRequest[]): Promise<NotificationResponse> {
    try {
      const response = await fetch('/api/v1/notifications/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ notifications: requests })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`/api/v1/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      const response = await fetch(`/api/v1/notifications/read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(): Promise<NotificationResponse> {
    try {
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences[]): Promise<NotificationResponse> {
    try {
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ preferences })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Convenience methods for specific notification types

  /**
   * Send device registration notification
   */
  async notifyDeviceRegistered(userId: string, deviceName: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'device_registered',
      category: 'device',
      title: 'Device Successfully Registered',
      message: `Your ${deviceName} has been registered in the STOLEN database.`,
      metadata: {
        device_name: deviceName,
        registration_date: new Date().toISOString(),
        ...metadata
      },
      priority: 6
    });
  }

  /**
   * Send device verification notification
   */
  async notifyDeviceVerified(userId: string, deviceName: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'device_verified',
      category: 'device',
      title: 'Device Verification Complete',
      message: `Your ${deviceName} has been verified and added to the registry.`,
      metadata: {
        device_name: deviceName,
        verification_date: new Date().toISOString(),
        ...metadata
      },
      priority: 7
    });
  }

  /**
   * Send marketplace listing notification
   */
  async notifyListingCreated(userId: string, deviceName: string, price: number, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'listing_created',
      category: 'marketplace',
      title: 'Listing Created Successfully',
      message: `Your ${deviceName} is now live on the marketplace for R${price}.`,
      metadata: {
        device_name: deviceName,
        listing_price: price,
        listing_date: new Date().toISOString(),
        ...metadata
      },
      priority: 6
    });
  }

  /**
   * Send price drop notification
   */
  async notifyPriceDrop(userId: string, deviceName: string, oldPrice: number, newPrice: number, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'price_drop',
      category: 'marketplace',
      title: 'Price Drop Alert',
      message: `The ${deviceName} you're watching dropped from R${oldPrice} to R${newPrice}.`,
      metadata: {
        device_name: deviceName,
        old_price: oldPrice,
        new_price: newPrice,
        price_drop_date: new Date().toISOString(),
        ...metadata
      },
      priority: 7,
      channels: { email: true, push: true, in_app: true }
    });
  }

  /**
   * Send insurance claim notification
   */
  async notifyClaimSubmitted(userId: string, claimId: string, claimType: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'claim_submitted',
      category: 'insurance',
      title: 'Insurance Claim Submitted',
      message: `Your ${claimType} claim (${claimId}) has been submitted and is under review.`,
      metadata: {
        claim_id: claimId,
        claim_type: claimType,
        submission_date: new Date().toISOString(),
        ...metadata
      },
      priority: 7
    });
  }

  /**
   * Send insurance claim approval notification
   */
  async notifyClaimApproved(userId: string, claimId: string, amount: number, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'claim_approved',
      category: 'insurance',
      title: 'Claim Approved',
      message: `Your claim ${claimId} has been approved. Payout: R${amount}.`,
      metadata: {
        claim_id: claimId,
        amount: amount,
        approval_date: new Date().toISOString(),
        ...metadata
      },
      priority: 9,
      channels: { email: true, sms: true, push: true, in_app: true }
    });
  }

  /**
   * Send payment received notification
   */
  async notifyPaymentReceived(userId: string, amount: number, senderName: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'payment_received',
      category: 'payment',
      title: 'Payment Received',
      message: `You received R${amount} from ${senderName} in your STOLEN wallet.`,
      metadata: {
        amount: amount,
        sender_name: senderName,
        transaction_date: new Date().toISOString(),
        ...metadata
      },
      priority: 8,
      channels: { email: true, push: true, in_app: true }
    });
  }

  /**
   * Send payment sent notification
   */
  async notifyPaymentSent(userId: string, amount: number, recipientName: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'payment_sent',
      category: 'payment',
      title: 'Payment Sent',
      message: `You sent R${amount} to ${recipientName}.`,
      metadata: {
        amount: amount,
        recipient_name: recipientName,
        transaction_date: new Date().toISOString(),
        ...metadata
      },
      priority: 7
    });
  }

  /**
   * Send repair booking notification
   */
  async notifyRepairBooked(userId: string, deviceName: string, appointmentDate: string, repairShopName: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'repair_booked',
      category: 'repair',
      title: 'Repair Appointment Booked',
      message: `Your ${deviceName} repair is scheduled for ${appointmentDate} at ${repairShopName}.`,
      metadata: {
        device_name: deviceName,
        appointment_date: appointmentDate,
        repair_shop_name: repairShopName,
        booking_date: new Date().toISOString(),
        ...metadata
      },
      priority: 6
    });
  }

  /**
   * Send repair completed notification
   */
  async notifyRepairCompleted(userId: string, deviceName: string, repairShopName: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'repair_completed',
      category: 'repair',
      title: 'Repair Completed',
      message: `Your ${deviceName} repair is complete and ready for pickup at ${repairShopName}.`,
      metadata: {
        device_name: deviceName,
        repair_shop_name: repairShopName,
        completion_date: new Date().toISOString(),
        ...metadata
      },
      priority: 8,
      channels: { email: true, sms: true, push: true, in_app: true }
    });
  }

  /**
   * Send security alert notification
   */
  async notifySecurityAlert(userId: string, alertMessage: string, alertType: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'security_alert',
      category: 'security',
      title: 'Security Alert',
      message: alertMessage,
      metadata: {
        alert_message: alertMessage,
        alert_type: alertType,
        alert_date: new Date().toISOString(),
        ...metadata
      },
      priority: 10,
      channels: { email: true, sms: true, push: true, in_app: true }
    });
  }

  /**
   * Send new device login notification
   */
  async notifyNewDeviceLogin(userId: string, deviceInfo: string, location: string, metadata: Record<string, any> = {}): Promise<NotificationResponse> {
    return this.sendNotification({
      userId,
      type: 'login_new_device',
      category: 'security',
      title: 'New Device Login Detected',
      message: `A login was detected from ${deviceInfo} in ${location}.`,
      metadata: {
        device_info: deviceInfo,
        location: location,
        login_time: new Date().toISOString(),
        ...metadata
      },
      priority: 8,
      channels: { email: true, push: true, in_app: true }
    });
  }

  /**
   * Get auth token from Supabase
   */
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await this.supabaseClient.auth.getSession();
    return session?.access_token || '';
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(null);

// Export types
export type { NotificationRequest, NotificationPreferences, NotificationResponse };
