import { io, Socket } from 'socket.io-client';

export interface RealtimeEvent {
  type: 'deal_created' | 'deal_updated' | 'deal_expired' | 'bid_placed' | 'price_changed' | 'time_update' | 'notification';
  dealId?: string;
  data: any;
  timestamp: number;
}

export interface HotDealCountdown {
  dealId: string;
  endTime: Date;
  timeLeft: number; // seconds
  status: 'active' | 'ending_soon' | 'expired';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface BidUpdate {
  dealId: string;
  bidAmount: number;
  bidder: string;
  timestamp: Date;
  isWinning: boolean;
  totalBids: number;
}

export interface PriceUpdate {
  dealId: string;
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  reason: 'ai_optimization' | 'bid_pressure' | 'time_pressure' | 'manual';
  timestamp: Date;
}

export interface NotificationUpdate {
  id: string;
  userId: string;
  dealId?: string;
  type: string;
  title: string;
  message: string;
  priority: number;
  timestamp: Date;
}

class HotDealsRealtimeService {
  private static instance: HotDealsRealtimeService;
  private socket: Socket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private countdownTimers: Map<string, NodeJS.Timeout> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.initializeConnection();
  }

  public static getInstance(): HotDealsRealtimeService {
    if (!HotDealsRealtimeService.instance) {
      HotDealsRealtimeService.instance = new HotDealsRealtimeService();
    }
    return HotDealsRealtimeService.instance;
  }

  // =====================================================
  // CONNECTION MANAGEMENT
  // =====================================================

  private initializeConnection() {
    try {
      // In production, this would connect to your WebSocket server
      this.socket = io(process.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 5000
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.setupFallbackMode();
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Hot Deals real-time service connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Hot Deals real-time service disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
      
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached, switching to fallback mode');
        this.setupFallbackMode();
      }
    });

    // Hot Deals specific events
    this.socket.on('deal_created', (data) => this.handleDealCreated(data));
    this.socket.on('deal_updated', (data) => this.handleDealUpdated(data));
    this.socket.on('deal_expired', (data) => this.handleDealExpired(data));
    this.socket.on('bid_placed', (data) => this.handleBidPlaced(data));
    this.socket.on('price_changed', (data) => this.handlePriceChanged(data));
    this.socket.on('notification', (data) => this.handleNotification(data));
  }

  private setupFallbackMode() {
    console.log('Setting up fallback mode for real-time updates');
    // Implement polling as fallback when WebSocket is not available
    this.startPollingMode();
  }

  private startPollingMode() {
    // Poll for updates every 30 seconds as fallback
    setInterval(() => {
      this.pollForUpdates();
    }, 30000);
  }

  private async pollForUpdates() {
    try {
      // This would call your REST API to get updates
      const response = await fetch('/api/hot-deals/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastUpdate: Date.now() - 30000 })
      });
      
      if (response.ok) {
        const updates = await response.json();
        updates.forEach((update: RealtimeEvent) => this.processUpdate(update));
      }
    } catch (error) {
      console.error('Polling update failed:', error);
    }
  }

  // =====================================================
  // EVENT HANDLING
  // =====================================================

  private handleDealCreated(data: any) {
    const event: RealtimeEvent = {
      type: 'deal_created',
      dealId: data.dealId,
      data,
      timestamp: Date.now()
    };
    
    this.processUpdate(event);
    this.startCountdownTimer(data.dealId, new Date(data.endTime));
  }

  private handleDealUpdated(data: any) {
    const event: RealtimeEvent = {
      type: 'deal_updated',
      dealId: data.dealId,
      data,
      timestamp: Date.now()
    };
    
    this.processUpdate(event);
  }

  private handleDealExpired(data: any) {
    const event: RealtimeEvent = {
      type: 'deal_expired',
      dealId: data.dealId,
      data,
      timestamp: Date.now()
    };
    
    this.processUpdate(event);
    this.stopCountdownTimer(data.dealId);
  }

  private handleBidPlaced(data: any) {
    const bidUpdate: BidUpdate = {
      dealId: data.dealId,
      bidAmount: data.bidAmount,
      bidder: data.bidderName || 'Anonymous',
      timestamp: new Date(data.timestamp),
      isWinning: data.isWinning,
      totalBids: data.totalBids
    };

    const event: RealtimeEvent = {
      type: 'bid_placed',
      dealId: data.dealId,
      data: bidUpdate,
      timestamp: Date.now()
    };
    
    this.processUpdate(event);
  }

  private handlePriceChanged(data: any) {
    const priceUpdate: PriceUpdate = {
      dealId: data.dealId,
      oldPrice: data.oldPrice,
      newPrice: data.newPrice,
      changePercentage: data.changePercentage,
      reason: data.reason,
      timestamp: new Date(data.timestamp)
    };

    const event: RealtimeEvent = {
      type: 'price_changed',
      dealId: data.dealId,
      data: priceUpdate,
      timestamp: Date.now()
    };
    
    this.processUpdate(event);
  }

  private handleNotification(data: any) {
    const notification: NotificationUpdate = {
      id: data.id,
      userId: data.userId,
      dealId: data.dealId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority,
      timestamp: new Date(data.timestamp)
    };

    const event: RealtimeEvent = {
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    };
    
    this.processUpdate(event);
  }

  private processUpdate(event: RealtimeEvent) {
    // Emit to all listeners
    this.emit(event.type, event.data);
    this.emit('update', event);
  }

  // =====================================================
  // COUNTDOWN TIMER MANAGEMENT
  // =====================================================

  startCountdownTimer(dealId: string, endTime: Date) {
    // Clear existing timer if any
    this.stopCountdownTimer(dealId);

    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      
      let status: HotDealCountdown['status'] = 'active';
      let urgencyLevel: HotDealCountdown['urgencyLevel'] = 'low';

      if (timeLeft === 0) {
        status = 'expired';
        urgencyLevel = 'critical';
        this.stopCountdownTimer(dealId);
      } else if (timeLeft < 300) { // Less than 5 minutes
        status = 'ending_soon';
        urgencyLevel = 'critical';
      } else if (timeLeft < 1800) { // Less than 30 minutes
        urgencyLevel = 'high';
      } else if (timeLeft < 3600) { // Less than 1 hour
        urgencyLevel = 'medium';
      }

      const countdown: HotDealCountdown = {
        dealId,
        endTime,
        timeLeft,
        status,
        urgencyLevel
      };

      this.emit('time_update', countdown);

      // Continue updating if deal is still active
      if (timeLeft > 0) {
        this.countdownTimers.set(dealId, setTimeout(updateCountdown, 1000));
      }
    };

    // Start immediate update
    updateCountdown();
  }

  stopCountdownTimer(dealId: string) {
    const timer = this.countdownTimers.get(dealId);
    if (timer) {
      clearTimeout(timer);
      this.countdownTimers.delete(dealId);
    }
  }

  // =====================================================
  // PUBLIC API METHODS
  // =====================================================

  // Subscribe to events
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // Unsubscribe from events
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit events to listeners
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Join a deal room for real-time updates
  joinDeal(dealId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_deal', { dealId });
    }
  }

  // Leave a deal room
  leaveDeal(dealId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_deal', { dealId });
    }
    this.stopCountdownTimer(dealId);
  }

  // Place a bid via WebSocket
  placeBid(dealId: string, bidAmount: number, bidderInfo: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('place_bid', {
        dealId,
        bidAmount,
        bidderInfo,
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback to REST API
      this.placeBidViaRest(dealId, bidAmount, bidderInfo);
    }
  }

  private async placeBidViaRest(dealId: string, bidAmount: number, bidderInfo: any) {
    try {
      const response = await fetch('/api/hot-deals/place-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, bidAmount, bidderInfo })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.handleBidPlaced(result);
      }
    } catch (error) {
      console.error('Failed to place bid via REST:', error);
    }
  }

  // Send chat message
  sendChatMessage(dealId: string, message: string, senderInfo: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', {
        dealId,
        message,
        senderInfo,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update user presence
  updatePresence(dealId: string, action: 'viewing' | 'interested' | 'left') {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_presence', {
        dealId,
        action,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Trigger price update check
  triggerPriceUpdate(dealId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('trigger_price_update', { dealId });
    }
  }

  // Request AI analysis
  requestAIAnalysis(dealId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request_ai_analysis', { dealId });
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  getActiveCountdowns(): string[] {
    return Array.from(this.countdownTimers.keys());
  }

  formatTimeLeft(seconds: number): string {
    if (seconds <= 0) return 'Expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  getUrgencyColor(urgencyLevel: HotDealCountdown['urgencyLevel']): string {
    switch (urgencyLevel) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Clear all timers
    this.countdownTimers.forEach(timer => clearTimeout(timer));
    this.countdownTimers.clear();
    
    // Clear all listeners
    this.eventListeners.clear();
    
    this.isConnected = false;
  }

  // =====================================================
  // NOTIFICATION MANAGEMENT
  // =====================================================

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  showBrowserNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      return notification;
    }
    return null;
  }

  sendPushNotification(userId: string, notification: NotificationUpdate) {
    // This would integrate with a push notification service like Firebase
    console.log('Sending push notification:', notification);
    
    // Show browser notification as fallback
    this.showBrowserNotification(notification.title, {
      body: notification.message,
      tag: notification.dealId,
      requireInteraction: notification.priority > 7
    });
  }
}

export default HotDealsRealtimeService;
