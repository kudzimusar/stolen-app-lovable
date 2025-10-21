// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { dynamicWalletService } from '@/lib/services/dynamic-wallet-service';

interface RealTimeUpdate {
  id: string;
  type: 'balance' | 'transaction' | 'security' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
}

interface ConnectionStatus {
  connected: boolean;
  lastUpdate: Date | null;
  reconnectAttempts: number;
}

interface RealTimeUpdatesProps {
  userId: string;
  onBalanceUpdate?: (newBalance: any) => void;
  onTransactionUpdate?: (transaction: any) => void;
  onSecurityAlert?: (alert: any) => void;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  userId,
  onBalanceUpdate,
  onTransactionUpdate,
  onSecurityAlert
}) => {
  const { toast } = useToast();
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastUpdate: null,
    reconnectAttempts: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeRealTimeConnection();
    startHeartbeat();

    return () => {
      cleanup();
    };
  }, [userId]);

  const initializeRealTimeConnection = async () => {
    try {
      // Enhanced real-time updates using dynamic wallet service
      const unsubscribe = dynamicWalletService.onBalanceUpdate(userId, (newBalance) => {
        addUpdate({
          type: 'balance',
          title: 'Balance Updated',
          description: `Your wallet balance is now R${newBalance.available.toFixed(2)}`,
          amount: newBalance.available,
          status: 'success'
        });
      });

      // Store unsubscribe function for cleanup
      subscriptionRef.current = { unsubscribe };

      // Subscribe to wallet balance changes via Supabase
      const walletChannel = supabase
        .channel(`wallet_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${userId}`
          },
          (payload) => handleWalletUpdate(payload)
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `from_user_id=eq.${userId}`
          },
          (payload) => handleTransactionUpdate(payload)
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions',
            filter: `to_user_id=eq.${userId}`
          },
          (payload) => handleTransactionUpdate(payload)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus(prev => ({
              ...prev,
              connected: true,
              lastUpdate: new Date(),
              reconnectAttempts: 0
            }));
            
            addUpdate({
              id: 'connection-established',
              type: 'system',
              title: 'Real-Time Updates Active',
              description: 'Connected to live wallet updates',
              timestamp: new Date(),
              priority: 'low',
              read: false
            });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            handleConnectionError();
          }
        });

      subscriptionRef.current = walletChannel;

      // Subscribe to security alerts
      const securityChannel = supabase
        .channel(`security_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'fraud_alerts',
            filter: `user_id=eq.${userId}`
          },
          (payload) => handleSecurityAlert(payload)
        )
        .subscribe();

    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
      handleConnectionError();
    }
  };

  const startHeartbeat = () => {
    heartbeatRef.current = setInterval(() => {
      if (connectionStatus.connected) {
        setConnectionStatus(prev => ({
          ...prev,
          lastUpdate: new Date()
        }));
      }
    }, 30000); // 30 seconds
  };

  const cleanup = () => {
    if (subscriptionRef.current) {
      // Clean up dynamic wallet service subscription
      if (subscriptionRef.current.unsubscribe) {
        subscriptionRef.current.unsubscribe();
      }
      // Clean up Supabase subscription
      if (subscriptionRef.current.supabaseChannel) {
        subscriptionRef.current.supabaseChannel.unsubscribe();
      }
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
  };

  const handleWalletUpdate = (payload: any) => {
    const { new: newWallet } = payload;
    
    addUpdate({
      id: `wallet-update-${Date.now()}`,
      type: 'balance',
      title: 'Balance Updated',
      description: `Your wallet balance has been updated to R${newWallet.available_balance}`,
      timestamp: new Date(),
      priority: 'medium',
      read: false,
      data: newWallet
    });

    onBalanceUpdate?.(newWallet);

    toast({
      title: 'Balance Updated',
      description: `New balance: R${newWallet.available_balance}`,
      variant: 'default'
    });
  };

  const handleTransactionUpdate = (payload: any) => {
    const { new: newTransaction } = payload;
    
    const isIncoming = newTransaction.to_user_id === userId;
    const title = isIncoming ? 'Payment Received' : 'Payment Sent';
    const description = isIncoming 
      ? `You received R${newTransaction.amount} from ${newTransaction.description || 'a user'}`
      : `You sent R${newTransaction.amount} to ${newTransaction.description || 'a user'}`;

    addUpdate({
      id: `transaction-update-${Date.now()}`,
      type: 'transaction',
      title,
      description,
      timestamp: new Date(),
      priority: 'high',
      read: false,
      data: newTransaction
    });

    onTransactionUpdate?.(newTransaction);

    toast({
      title,
      description,
      variant: 'default'
    });
  };

  const handleSecurityAlert = (payload: any) => {
    const { new: alert } = payload;
    
    addUpdate({
      id: `security-alert-${Date.now()}`,
      type: 'security',
      title: 'Security Alert',
      description: alert.description || 'Security activity detected on your account',
      timestamp: new Date(),
      priority: 'high',
      read: false,
      data: alert
    });

    onSecurityAlert?.(alert);

    toast({
      title: 'Security Alert',
      description: alert.description,
      variant: 'destructive'
    });
  };

  const handleConnectionError = () => {
    setConnectionStatus(prev => ({
      ...prev,
      connected: false,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    addUpdate({
      id: `connection-error-${Date.now()}`,
      type: 'system',
      title: 'Connection Lost',
      description: 'Attempting to reconnect to real-time updates...',
      timestamp: new Date(),
      priority: 'medium',
      read: false
    });

    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (connectionStatus.reconnectAttempts < 5) {
        initializeRealTimeConnection();
      }
    }, 5000);
  };

  const addUpdate = (update: RealTimeUpdate) => {
    setUpdates(prev => [update, ...prev].slice(0, 10)); // Keep only last 10 updates
  };

  const markAsRead = (updateId: string) => {
    setUpdates(prev => 
      prev.map(update => 
        update.id === updateId ? { ...update, read: true } : update
      )
    );
  };

  const clearAllUpdates = () => {
    setUpdates([]);
  };

  const forceReconnect = () => {
    cleanup();
    setConnectionStatus({
      connected: false,
      lastUpdate: null,
      reconnectAttempts: 0
    });
    initializeRealTimeConnection();
  };

  const getUpdateIcon = (type: string, priority: string) => {
    switch (type) {
      case 'balance':
        return <TrendingUp className="w-4 h-4" />;
      case 'transaction':
        return priority === 'high' ? <Bell className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;
      case 'security':
        return <AlertCircle className="w-4 h-4" />;
      case 'system':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const unreadCount = updates.filter(u => !u.read).length;

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            {connectionStatus.connected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 z-50">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Updates
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 max-h-80 overflow-y-auto">
          {!connectionStatus.connected && (
            <Alert className="mb-3">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Connection lost</span>
                <Button size="sm" variant="outline" onClick={forceReconnect}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reconnect
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {updates.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No recent updates
            </div>
          ) : (
            <div className="space-y-2">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    update.read ? 'bg-muted/50' : 'bg-card border-primary/20'
                  }`}
                  onClick={() => markAsRead(update.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 ${
                      update.priority === 'high' ? 'text-red-500' : 
                      update.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {getUpdateIcon(update.type, update.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">
                          {update.title}
                        </h4>
                        <Badge 
                          variant={getPriorityColor(update.priority)} 
                          className="text-xs"
                        >
                          {update.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {update.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {update.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {updates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={clearAllUpdates}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
