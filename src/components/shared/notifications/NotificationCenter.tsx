import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Info,
  X,
  Filter,
  Trash2,
  Settings
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'device_found' | 'marketplace' | 'security' | 'reward' | 'transfer';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  metadata?: Record<string, any>;
}

export interface NotificationCenterProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onDeleteAll?: () => void;
  showFilters?: boolean;
  maxNotifications?: number;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  onNotificationClick,
  onMarkAllRead,
  onDeleteAll,
  showFilters = true,
  maxNotifications = 50,
  className = ''
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'device_found',
      title: 'Your Lost iPhone Was Found!',
      message: 'Great news! Your iPhone 15 Pro reported stolen on Jan 15th has been found at QuickFix Repair Center.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: 'high',
      actionRequired: true,
      metadata: {
        device: 'iPhone 15 Pro',
        location: 'QuickFix Repair Center, San Francisco'
      }
    },
    {
      id: '2',
      type: 'marketplace',
      title: 'Price Drop Alert',
      message: 'The MacBook Pro M3 you\'re watching just dropped to $1,899. Only 2 left in stock!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'medium',
      actionRequired: true,
      metadata: {
        device: 'MacBook Pro M3',
        oldPrice: 2199,
        newPrice: 1899
      }
    },
    {
      id: '3',
      type: 'security',
      title: 'Device Verification Complete',
      message: 'Your iPad Pro has been successfully verified and added to the STOLEN registry.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'low',
      actionRequired: false,
      metadata: {
        device: 'iPad Pro'
      }
    },
    {
      id: '4',
      type: 'reward',
      title: 'Community Reward Earned!',
      message: 'You\'ve earned 50 STOLEN tokens for reporting a found device. Thanks for helping the community!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: false,
      priority: 'medium',
      actionRequired: false,
      metadata: {
        tokens: 50
      }
    },
    {
      id: '5',
      type: 'transfer',
      title: 'Payment Received',
      message: 'You received R850.00 from John Smith for device sale.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      priority: 'low',
      actionRequired: false,
      metadata: {
        amount: 850,
        currency: 'ZAR',
        sender: 'John Smith'
      }
    }
  ];

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    onMarkAllRead?.();
    toast({
      title: "All Notifications Read",
      description: "All notifications have been marked as read"
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification Deleted",
      description: "Notification has been removed"
    });
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    onDeleteAll?.();
    toast({
      title: "All Notifications Deleted",
      description: "All notifications have been removed"
    });
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertTriangle,
      device_found: CheckCircle,
      marketplace: Info,
      security: CheckCircle,
      reward: CheckCircle,
      transfer: CheckCircle
    };
    return icons[type] || Info;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-red-200 bg-red-50';
    if (type === 'success' || type === 'device_found') return 'border-green-200 bg-green-50';
    if (type === 'warning' || type === 'error') return 'border-yellow-200 bg-yellow-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || colors.low;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  }).slice(0, maxNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteAllNotifications}
                disabled={notifications.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          {showFilters && (
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high')}
              >
                High Priority ({notifications.filter(n => n.priority === 'high').length})
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type, notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${colorClass} ${
                      !notification.read ? 'ring-2 ring-primary/20' : ''
                    } cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      onNotificationClick?.(notification);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Icon className={`w-5 h-5 ${
                          notification.type === 'success' || notification.type === 'device_found' 
                            ? 'text-green-600' 
                            : notification.type === 'warning' || notification.type === 'error'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-2">
                            {notification.actionRequired && (
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                            <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
