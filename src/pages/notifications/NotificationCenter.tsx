/**
 * Notification Center Page
 * Full-page notification management interface
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Settings, 
  Filter, 
  Search,
  ExternalLink,
  Trash2,
  Archive,
  Star,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Notification {
  id: string;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  priority: number;
  read_at: string | null;
  clicked_at: string | null;
  created_at: string;
  action_link?: string;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('universal_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
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

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
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

      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('universal_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification icon
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
    if (priority >= 8) return 'text-red-600 bg-red-50';
    if (priority >= 6) return 'text-orange-600 bg-orange-50';
    if (priority >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  // Get status icon
  const getStatusIcon = (notification: Notification) => {
    if (notification.read_at) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (notification.priority >= 8) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Bell className="h-4 w-4 text-blue-600" />;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || notification.category === filterCategory;
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "unread" && !notification.read_at) ||
      (filterStatus === "read" && notification.read_at);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get tab counts
  const unreadCount = notifications.filter(n => !n.read_at).length;
  const allCount = notifications.length;

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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground">You need to be signed in to view notifications.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                Manage your notifications and stay updated
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/notifications/preferences'}
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="device">Device</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="lost_found">Lost & Found</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({allCount - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <ScrollArea className="h-[600px]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filterCategory !== "all" || filterStatus !== "all"
                        ? "Try adjusting your filters"
                        : "You'll see notifications here when they arrive"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-muted/50 transition-colors",
                          !notification.read_at && "bg-blue-50/50 border-l-4 border-l-blue-500"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.category, notification.notification_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(notification)}
                                <h3 className={cn(
                                  "font-medium",
                                  !notification.read_at && "font-semibold"
                                )}>
                                  {notification.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className={cn("text-xs", getPriorityColor(notification.priority))}
                                >
                                  P{notification.priority}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(notification.created_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.read_at && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                                {notification.action_link && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.href = notification.action_link!}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationCenter;
