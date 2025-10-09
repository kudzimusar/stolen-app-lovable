import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';

export interface RealTimeUpdate {
  id: string;
  type: 'balance' | 'transaction' | 'security' | 'system' | 'notification';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
}

export interface ConnectionStatus {
  connected: boolean;
  lastUpdate: Date | null;
  reconnectAttempts: number;
}

export interface RealTimeUpdatesProps {
  userId: string;
  onBalanceUpdate?: (update: any) => void;
  onTransactionUpdate?: (update: any) => void;
  onSecurityAlert?: (alert: any) => void;
  onSystemUpdate?: (update: any) => void;
  enableNotifications?: boolean;
  enableMinimization?: boolean;
  maxUpdates?: number;
  className?: string;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  userId,
  onBalanceUpdate,
  onTransactionUpdate,
  onSecurityAlert,
  onSystemUpdate,
  enableNotifications = true,
  enableMinimization = true,
  maxUpdates = 10,
  className = ''
}) => {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastUpdate: null,
    reconnectAttempts: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Mock real-time updates for demonstration
  useEffect(() => {
    const initializeRealTimeConnection = () => {
      setConnectionStatus(prev => ({ ...prev, connected: true }));
      
      // Simulate real-time updates
      const updateInterval = setInterval(() => {
        const mockUpdates: RealTimeUpdate[] = [
          {
            id: `update_${Date.now()}`,
            type: 'transaction',
            title: 'Payment Received',
            description: 'You received R850.00 from John Smith',
            timestamp: new Date(),
            priority: 'medium',
            read: false,
            data: { amount: 850, sender: 'John Smith' }
          },
          {
            id: `security_${Date.now()}`,
            type: 'security',
            title: 'Security Alert',
            description: 'Unusual login attempt detected from new location',
            timestamp: new Date(),
            priority: 'high',
            read: false,
            data: { location: 'Cape Town, South Africa' }
          },
          {
            id: `balance_${Date.now()}`,
            type: 'balance',
            title: 'Balance Updated',
            description: 'Your wallet balance has been updated',
            timestamp: new Date(),
            priority: 'low',
            read: false,
            data: { newBalance: 1250.75 }
          }
        ];

        const randomUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)];
        addUpdate(randomUpdate);
      }, 15000); // Update every 15 seconds

      return () => clearInterval(updateInterval);
    };

    const cleanup = initializeRealTimeConnection();

    return cleanup;
  }, [userId]);

  const addUpdate = (update: RealTimeUpdate) => {
    setUpdates(prev => {
      const newUpdates = [update, ...prev].slice(0, maxUpdates);
      return newUpdates;
    });

    setConnectionStatus(prev => ({ 
      ...prev, 
      lastUpdate: update.timestamp,
      reconnectAttempts: 0 
    }));

    setUnreadCount(prev => prev + 1);

    // Handle different update types
    switch (update.type) {
      case 'balance':
        onBalanceUpdate?.(update.data);
        break;
      case 'transaction':
        onTransactionUpdate?.(update.data);
        break;
      case 'security':
        onSecurityAlert?.(update.data);
        break;
      case 'system':
        onSystemUpdate?.(update.data);
        break;
    }

    // Show toast notification
    if (enableNotifications && update.priority !== 'low') {
      toast({
        title: update.title,
        description: update.description,
        variant: update.priority === 'high' ? 'destructive' : 'default'
      });
    }
  };

  const markAsRead = (updateId: string) => {
    setUpdates(prev => 
      prev.map(update => 
        update.id === updateId 
          ? { ...update, read: true }
          : update
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setUpdates(prev => 
      prev.map(update => ({ ...update, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAllUpdates = () => {
    setUpdates([]);
    setUnreadCount(0);
  };

  const reconnect = () => {
    setConnectionStatus(prev => ({ 
      ...prev, 
      reconnectAttempts: prev.reconnectAttempts + 1,
      connected: false 
    }));
    
    // Simulate reconnection
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, connected: true }));
      toast({
        title: "Reconnected",
        description: "Real-time updates connection restored"
      });
    }, 2000);
  };

  const getUpdateIcon = (type: string) => {
    const icons = {
      balance: TrendingUp,
      transaction: CheckCircle,
      security: AlertCircle,
      system: Zap,
      notification: Bell
    };
    return icons[type] || Bell;
  };

  const getUpdateColor = (type: string, priority: string) => {
    if (type === 'security' && priority === 'high') return 'border-red-200 bg-red-50';
    if (type === 'transaction') return 'border-green-200 bg-green-50';
    if (type === 'balance') return 'border-blue-200 bg-blue-50';
    if (type === 'system') return 'border-purple-200 bg-purple-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.low;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (isMinimized && enableMinimization) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="relative"
          size="lg"
        >
          <Bell className="w-5 h-5 mr-2" />
          Real-Time Updates
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`${className} ${enableMinimization ? 'fixed bottom-4 right-4 z-50 w-96' : ''}`}>
      <Card className={`${enableMinimization ? 'shadow-xl border-2' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Real-Time Updates
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {connectionStatus.connected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {enableMinimization && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              )}
              
              {!connectionStatus.connected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reconnect}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Connection Status */}
          {!connectionStatus.connected && (
            <Alert variant="destructive">
              <WifiOff className="w-4 h-4" />
              <AlertDescription>
                Connection lost. Attempting to reconnect...
                {connectionStatus.reconnectAttempts > 0 && (
                  <span className="ml-2">
                    (Attempt {connectionStatus.reconnectAttempts})
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Updates List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {updates.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No updates yet</p>
              </div>
            ) : (
              updates.map((update) => {
                const Icon = getUpdateIcon(update.type);
                const colorClass = getUpdateColor(update.type, update.priority);
                
                return (
                  <div
                    key={update.id}
                    className={`p-3 rounded-lg border ${colorClass} ${
                      !update.read ? 'ring-2 ring-primary/20' : ''
                    } cursor-pointer hover:shadow-sm transition-all`}
                    onClick={() => markAsRead(update.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 ${
                        update.type === 'security' ? 'text-red-500' :
                        update.type === 'transaction' ? 'text-green-500' :
                        update.type === 'balance' ? 'text-blue-500' :
                        'text-gray-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {update.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {update.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            <Badge className={`text-xs ${getPriorityColor(update.priority)}`}>
                              {update.priority}
                            </Badge>
                            {!update.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(update.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          {updates.length > 0 && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex-1"
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllUpdates}
                className="flex-1"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Last Update Info */}
          {connectionStatus.lastUpdate && (
            <div className="text-xs text-muted-foreground text-center">
              Last update: {formatTimestamp(connectionStatus.lastUpdate)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

