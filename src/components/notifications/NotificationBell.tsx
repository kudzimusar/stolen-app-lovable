/**
 * Universal Notification Bell Component
 * Displays notification count and dropdown with recent notifications
 * Integrates with the universal notification system
 */

import { useState, useEffect } from "react";
import { Bell, Check, X, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  priority: number;
  read_at: string | null;
  created_at: string;
  action_link?: string;
}

interface NotificationBellProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
}

export const NotificationBell = ({ 
  className, 
  variant = "ghost", 
  size = "default" 
}: NotificationBellProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('universal_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read_at).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('universal_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('universal_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on category
  const getNotificationIcon = (category: string, type: string) => {
    switch (category) {
      case 'device':
        return '📱';
      case 'marketplace':
        return '🛍️';
      case 'insurance':
        return '🛡️';
      case 'repair':
        return '🔧';
      case 'payment':
        return '💳';
      case 'security':
        return '🔒';
      case 'admin':
        return '⚙️';
      case 'lost_found':
        return '🔍';
      default:
        return '🔔';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600';
    if (priority >= 6) return 'text-orange-600';
    if (priority >= 4) return 'text-yellow-600';
    return 'text-blue-600';
  };

  // Format notification time
  const formatNotificationTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'universal_notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Navigate to notification preferences
                  window.location.href = '/notifications/preferences';
                }}
                className="text-xs"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <CardDescription>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </CardDescription>
          )}
        </CardHeader>
        
        <Separator />
        
        <ScrollArea className="h-96">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll see updates here when they arrive
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      !notification.read_at && "bg-blue-50/50 border-l-2 border-l-blue-500"
                    )}
                    onClick={() => {
                      if (!notification.read_at) {
                        markAsRead(notification.id);
                      }
                      if (notification.action_link) {
                        window.location.href = notification.action_link;
                      }
                    }}
                  >
                    <div className="text-2xl">
                      {getNotificationIcon(notification.category, notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          !notification.read_at && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "text-xs",
                            getPriorityColor(notification.priority)
                          )}>
                            P{notification.priority}
                          </span>
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                        {notification.action_link && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <CardContent className="p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </Button>
            </CardContent>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
