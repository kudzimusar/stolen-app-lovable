import { supabase } from '@/integrations/supabase/client'

export interface NotificationRequest {
  user_id: string
  feature_category: string
  notification_type: string
  title: string
  message: string
  metadata?: Record<string, any>
  priority?: number
  channels?: {
    email?: boolean
    sms?: boolean
    push?: boolean
    in_app?: boolean
  }
  action_link?: string
  expires_at?: string
}

export interface NotificationPreferences {
  feature_category: string
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  frequency: string
  quiet_hours_start?: string
  quiet_hours_end?: string
  filters: Record<string, any>
}

class UnifiedNotificationService {
  /**
   * Send a notification using the unified notification system
   */
  async sendNotification(request: NotificationRequest): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-unified-notification', {
        body: request
      })

      if (error) {
        console.error('Error sending notification:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get user's notification preferences for a specific feature
   */
  async getNotificationPreferences(userId: string, featureCategory: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('feature_category', featureCategory)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, return default
          return {
            feature_category: featureCategory,
            email_enabled: true,
            sms_enabled: false,
            push_enabled: true,
            in_app_enabled: true,
            frequency: 'immediate',
            filters: {}
          }
        }
        console.error('Error fetching notification preferences:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return null
    }
  }

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          feature_category: preferences.feature_category,
          email_enabled: preferences.email_enabled,
          sms_enabled: preferences.sms_enabled,
          push_enabled: preferences.push_enabled,
          in_app_enabled: preferences.in_app_enabled,
          frequency: preferences.frequency,
          quiet_hours_start: preferences.quiet_hours_start,
          quiet_hours_end: preferences.quiet_hours_end,
          filters: preferences.filters || {}
        })

      if (error) {
        console.error('Error updating notification preferences:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get notifications for a specific feature category
   */
  async getNotifications(userId: string, featureCategory: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('feature_category', featureCategory)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Mark all notifications as read for a feature category
   */
  async markAllAsRead(userId: string, featureCategory: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('feature_category', featureCategory)
        .is('read_at', null)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get unread count for a feature category
   */
  async getUnreadCount(userId: string, featureCategory: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature_category', featureCategory)
        .is('read_at', null)

      if (error) {
        console.error('Error fetching unread count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  /**
   * Device Management specific notifications
   */
  async sendDeviceNotification(userId: string, type: 'device_registered' | 'device_verified' | 'transfer_initiated' | 'warranty_expiring', data: any) {
    const titles = {
      device_registered: 'Device Registration Confirmed',
      device_verified: 'Device Verification Complete',
      transfer_initiated: 'Device Transfer Initiated',
      warranty_expiring: 'Device Warranty Expiring Soon'
    }

    const messages = {
      device_registered: `Your ${data.device_name} has been successfully registered on the STOLEN platform.`,
      device_verified: `Your ${data.device_name} has been verified and is now protected on the blockchain.`,
      transfer_initiated: `Transfer of ${data.device_name} to ${data.recipient_name} has been initiated.`,
      warranty_expiring: `The warranty for your ${data.device_name} expires on ${data.expiry_date}.`
    }

    return this.sendNotification({
      user_id: userId,
      feature_category: 'device_management',
      notification_type: type,
      title: titles[type],
      message: messages[type],
      metadata: data,
      priority: type === 'warranty_expiring' ? 7 : 5,
      channels: {
        email: true,
        in_app: true,
        sms: type === 'warranty_expiring'
      },
      action_link: data.action_link
    })
  }

  /**
   * Marketplace specific notifications
   */
  async sendMarketplaceNotification(userId: string, type: 'listing_created' | 'bid_received' | 'item_sold' | 'price_drop', data: any) {
    const titles = {
      listing_created: 'Listing Created Successfully',
      bid_received: 'New Bid Received',
      item_sold: 'Item Sold Successfully',
      price_drop: 'Price Drop Alert'
    }

    const messages = {
      listing_created: `Your ${data.item_name} is now live on the marketplace.`,
      bid_received: `Someone bid R${data.bid_amount} on your ${data.item_name}.`,
      item_sold: `Your ${data.item_name} has been sold for R${data.sale_price}.`,
      price_drop: `The price of ${data.item_name} has dropped to R${data.new_price}.`
    }

    return this.sendNotification({
      user_id: userId,
      feature_category: 'marketplace',
      notification_type: type,
      title: titles[type],
      message: messages[type],
      metadata: data,
      priority: type === 'bid_received' ? 8 : 5,
      channels: {
        email: true,
        push: true,
        in_app: true
      },
      action_link: data.action_link
    })
  }

  /**
   * Insurance specific notifications
   */
  async sendInsuranceNotification(userId: string, type: 'claim_submitted' | 'claim_approved' | 'claim_rejected' | 'fraud_alert', data: any) {
    const titles = {
      claim_submitted: 'Insurance Claim Submitted',
      claim_approved: 'Claim Approved',
      claim_rejected: 'Claim Rejected',
      fraud_alert: 'Fraud Alert - Immediate Action Required'
    }

    const messages = {
      claim_submitted: `Your insurance claim #${data.claim_number} has been submitted and is under review.`,
      claim_approved: `Your insurance claim #${data.claim_number} has been approved for R${data.approved_amount}.`,
      claim_rejected: `Your insurance claim #${data.claim_number} has been rejected. Reason: ${data.rejection_reason}.`,
      fraud_alert: `Suspicious activity detected on your insurance account. Please contact support immediately.`
    }

    return this.sendNotification({
      user_id: userId,
      feature_category: 'insurance',
      notification_type: type,
      title: titles[type],
      message: messages[type],
      metadata: data,
      priority: type === 'fraud_alert' ? 10 : 6,
      channels: {
        email: true,
        sms: type === 'fraud_alert',
        push: true,
        in_app: true
      },
      action_link: data.action_link
    })
  }

  /**
   * Payment specific notifications
   */
  async sendPaymentNotification(userId: string, type: 'payment_received' | 'payment_sent' | 'transaction_failed' | 'suspicious_activity', data: any) {
    const titles = {
      payment_received: 'Payment Received',
      payment_sent: 'Payment Sent',
      transaction_failed: 'Transaction Failed',
      suspicious_activity: 'Suspicious Activity Detected'
    }

    const messages = {
      payment_received: `You received R${data.amount} from ${data.sender_name}.`,
      payment_sent: `You sent R${data.amount} to ${data.recipient_name}.`,
      transaction_failed: `Your transaction of R${data.amount} failed. Reason: ${data.failure_reason}.`,
      suspicious_activity: `Unusual activity detected on your account. Please verify your recent transactions.`
    }

    return this.sendNotification({
      user_id: userId,
      feature_category: 'payment',
      notification_type: type,
      title: titles[type],
      message: messages[type],
      metadata: data,
      priority: type === 'suspicious_activity' ? 9 : 6,
      channels: {
        email: true,
        sms: type === 'suspicious_activity',
        push: true,
        in_app: true
      },
      action_link: data.action_link
    })
  }
}

export const unifiedNotificationService = new UnifiedNotificationService()
