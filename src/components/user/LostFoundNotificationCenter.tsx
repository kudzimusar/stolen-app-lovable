// @ts-nocheck
import { useState, useEffect } from "react";
import { Bell, X, Check, CheckCheck, AlertCircle, MapPin, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
  metadata?: any;
}

export const LostFoundNotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, getAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) return;

      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Map notifications to ensure consistent structure
      const mappedNotifications = (data || []).map(notif => ({
        ...notif,
        // Extract title and message from preferences if they exist there
        title: notif.title || notif.preferences?.title || 'New Notification',
        message: notif.message || notif.preferences?.message || '',
        // Extract report_id from preferences or metadata
        related_id: notif.related_id || notif.preferences?.report_id,
        metadata: {
          ...notif.metadata,
          report_id: notif.preferences?.report_id || notif.metadata?.report_id
        }
      }));

      console.log('📬 Fetched notifications:', mappedNotifications);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log("📬 New notification received:", payload);
          const rawNotification = payload.new as any;
          
          // Map the notification to consistent structure
          const newNotification = {
            ...rawNotification,
            title: rawNotification.title || rawNotification.preferences?.title || 'New Notification',
            message: rawNotification.message || rawNotification.preferences?.message || '',
            related_id: rawNotification.related_id || rawNotification.preferences?.report_id,
            metadata: {
              ...rawNotification.metadata,
              report_id: rawNotification.preferences?.report_id || rawNotification.metadata?.report_id
            }
          };
          
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast.info(newNotification.title, {
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      
      // First update local state immediately for instant UI feedback
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id === notificationId) {
            console.log('✓ Found notification to mark as read:', n.title);
            return { ...n, is_read: true };
          }
          return n;
        })
      );

      // Then update database
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("❌ Database update failed:", error);
        throw error;
      }
      
      console.log('✅ Successfully marked as read in database');
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert local state if database update fails
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('📬 Notification clicked:', notification);
    console.log('📊 Current unread count BEFORE:', notifications.filter(n => !n.is_read).length);
    
    // Mark as read FIRST (updates state immediately)
    await markAsRead(notification.id);
    
    console.log('📊 Current unread count AFTER:', notifications.filter(n => !n.is_read).length);

    // Extract report_id from metadata or related_id
    const reportId = notification.metadata?.report_id || notification.related_id;
    
    console.log('🔗 Navigation data:', {
      type: notification.notification_type,
      reportId,
      metadata: notification.metadata,
      is_read: notification.is_read
    });

    // Navigate based on notification type
    if (reportId) {
      switch (notification.notification_type) {
        case "device_found":
        case "contact_received":
        case "owner_contact":
        case "status_update":
          console.log('→ Navigating to details:', reportId);
          navigate(`/lost-found/details/${reportId}`);
          break;
        case "new_tip":
        case "tip_added":
          console.log('→ Navigating to responses:', reportId);
          navigate(`/lost-found/responses/${reportId}`);
          break;
        case "reward_pending":
        case "reward_paid":
        case "reward_processing":
          console.log('→ Navigating to rewards');
          navigate("/community-rewards");
          break;
        default:
          console.log('→ Navigating to community board (fallback)');
          navigate("/lost-found");
      }
    } else {
      console.warn('⚠️ No report ID found, going to community board');
      navigate("/lost-found");
    }
    
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "device_found":
        return <Package className="w-4 h-4 text-green-600" />;
      case "contact_received":
        return <Bell className="w-4 h-4 text-blue-600" />;
      case "new_tip":
        return <MapPin className="w-4 h-4 text-orange-600" />;
      case "reward_pending":
      case "reward_paid":
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case "status_update":
        return <AlertCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  
  // Log unread count changes
  useEffect(() => {
    console.log('🔔 Unread count updated:', {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount
    });
  }, [unreadCount]);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          console.log('🔔 Bell clicked, opening panel');
          setOpen(!open);
        }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Notification Panel - Fixed positioning for mobile */}
          <Card className="fixed md:absolute right-2 md:right-0 top-16 md:top-12 w-[calc(100vw-1rem)] md:w-96 max-w-md z-50 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <Bell className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll be notified when someone finds your device
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                          !notification.is_read ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.notification_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold line-clamp-1">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {notification.message || "Click to view details"}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate("/lost-found");
                      setOpen(false);
                    }}
                  >
                    View All Activity
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
