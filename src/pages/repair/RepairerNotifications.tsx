import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Wrench, 
  DollarSign,
  Star,
  Shield,
  Award,
  Calendar
} from "lucide-react";

const RepairerNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "New Appointment Request",
      message: "Emma Davis wants to book a repair for her iPad Pro screen issue",
      time: "5 minutes ago",
      read: false,
      priority: "high",
      actionRequired: true,
      customer: "Emma Davis",
      device: "iPad Pro",
      issue: "Screen not responding"
    },
    {
      id: 2,
      type: "verification",
      title: "Gold Certification Renewal",
      message: "Your Gold Certified status will expire in 30 days. Renew now to maintain premium benefits.",
      time: "2 hours ago",
      read: false,
      priority: "medium",
      actionRequired: true
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Received",
      message: "Payment of $299 received for iPhone 15 Pro screen repair (Order #1234)",
      time: "1 day ago",
      read: true,
      priority: "low",
      amount: 299,
      orderId: "#1234"
    },
    {
      id: 4,
      type: "review",
      title: "New 5-Star Review",
      message: "John Smith left a 5-star review: 'Excellent service! My phone works perfectly now.'",
      time: "2 days ago",
      read: true,
      priority: "low",
      rating: 5,
      customer: "John Smith"
    },
    {
      id: 5,
      type: "security",
      title: "Security Alert",
      message: "Suspicious device detected in fraud scan - Serial ABC123456789 flagged as potentially stolen",
      time: "3 days ago",
      read: false,
      priority: "high",
      actionRequired: true,
      serial: "ABC123456789"
    },
    {
      id: 6,
      type: "parts",
      title: "Low Inventory Alert", 
      message: "iPhone 15 Pro screens are running low (3 units remaining). Reorder recommended.",
      time: "1 week ago",
      read: true,
      priority: "medium",
      actionRequired: true,
      part: "iPhone 15 Pro Screen",
      quantity: 3
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Calendar className="w-5 h-5 text-blue-600" />;
      case "verification": return <Award className="w-5 h-5 text-yellow-600" />;
      case "payment": return <DollarSign className="w-5 h-5 text-green-600" />;
      case "review": return <Star className="w-5 h-5 text-purple-600" />;
      case "security": return <Shield className="w-5 h-5 text-red-600" />;
      case "parts": return <Wrench className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Repairer Notifications" showLogo={true} />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/repair-shop-dashboard" />
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notification Categories */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { type: "appointment", label: "Appointments", count: 1, color: "blue" },
            { type: "verification", label: "Certifications", count: 1, color: "yellow" },
            { type: "payment", label: "Payments", count: 0, color: "green" },
            { type: "review", label: "Reviews", count: 0, color: "purple" },
            { type: "security", label: "Security", count: 1, color: "red" },
            { type: "parts", label: "Inventory", count: 0, color: "orange" }
          ].map((category) => (
            <Card key={category.type} className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="space-y-1">
                {getNotificationIcon(category.type)}
                <p className="text-xs font-medium">{category.label}</p>
                {category.count > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {category.count}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </div>
                  </div>

                  {/* Notification-specific details */}
                  {notification.type === "appointment" && notification.customer && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Customer: {notification.customer}</span>
                      <span>Device: {notification.device}</span>
                      <span>Issue: {notification.issue}</span>
                    </div>
                  )}

                  {notification.type === "payment" && notification.amount && (
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +${notification.amount}
                      </Badge>
                      <span className="text-muted-foreground">Order {notification.orderId}</span>
                    </div>
                  )}

                  {notification.type === "review" && notification.rating && (
                    <div className="flex items-center gap-2">
                      {Array.from({ length: notification.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-muted-foreground">by {notification.customer}</span>
                    </div>
                  )}

                  {notification.type === "security" && notification.serial && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Serial: {notification.serial} - Requires immediate attention
                      </p>
                    </div>
                  )}

                  {notification.type === "parts" && notification.part && (
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        {notification.part}: {notification.quantity} units remaining
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {notification.actionRequired && (
                    <div className="flex gap-2 pt-2">
                      {notification.type === "appointment" && (
                        <>
                          <Button size="sm" className="text-xs">Accept</Button>
                          <Button size="sm" variant="outline" className="text-xs">Decline</Button>
                        </>
                      )}
                      {notification.type === "verification" && (
                        <Button size="sm" className="text-xs">Renew Now</Button>
                      )}
                      {notification.type === "security" && (
                        <>
                          <Button size="sm" variant="destructive" className="text-xs">View Details</Button>
                          <Button size="sm" variant="outline" className="text-xs">Report</Button>
                        </>
                      )}
                      {notification.type === "parts" && (
                        <Button size="sm" className="text-xs">Reorder Parts</Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RepairerNotifications;