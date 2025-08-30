import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Package, 
  Shield, 
  AlertTriangle, 
  MapPin, 
  DollarSign,
  Heart,
  Gift,
  MessageCircle
} from "lucide-react";

const IndividualNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "device_found",
      title: "Your Lost iPhone Was Found!",
      message: "Great news! Your iPhone 15 Pro reported stolen on Jan 15th has been found at QuickFix Repair Center.",
      time: "30 minutes ago",
      read: false,
      priority: "high",
      actionRequired: true,
      device: "iPhone 15 Pro",
      location: "QuickFix Repair Center, San Francisco"
    },
    {
      id: 2,
      type: "marketplace",
      title: "Price Drop Alert",
      message: "The MacBook Pro M3 you're watching just dropped to $1,899. Only 2 left in stock!",
      time: "2 hours ago",
      read: false,
      priority: "medium",
      actionRequired: true,
      device: "MacBook Pro M3",
      oldPrice: 2199,
      newPrice: 1899
    },
    {
      id: 3,
      type: "security",
      title: "Device Verification Complete",
      message: "Your iPad Pro has been successfully verified and added to the STOLEN registry.",
      time: "1 day ago",
      read: true,
      priority: "low",
      device: "iPad Pro"
    },
    {
      id: 4,
      type: "reward",
      title: "Community Reward Earned!",
      message: "You've earned 50 STOLEN tokens for reporting a found device. Thanks for helping the community!",
      time: "2 days ago",
      read: false,
      priority: "medium",
      tokens: 50
    },
    {
      id: 5,
      type: "transfer",
      title: "Device Transfer Request",
      message: "Sarah Johnson wants to buy your Samsung Galaxy S24. Review the offer and respond.",
      time: "3 days ago",
      read: true,
      priority: "medium",
      actionRequired: true,
      buyer: "Sarah Johnson",
      device: "Samsung Galaxy S24",
      offer: 650
    },
    {
      id: 6,
      type: "insurance",
      title: "Insurance Claim Update",
      message: "Your insurance claim for water-damaged iPhone has been approved. $850 payout approved.",
      time: "1 week ago",
      read: true,
      priority: "high",
      amount: 850,
      claimId: "INS-2024-001"
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
      case "device_found": return <MapPin className="w-5 h-5 text-green-600" />;
      case "marketplace": return <Package className="w-5 h-5 text-blue-600" />;
      case "security": return <Shield className="w-5 h-5 text-purple-600" />;
      case "reward": return <Gift className="w-5 h-5 text-yellow-600" />;
      case "transfer": return <MessageCircle className="w-5 h-5 text-indigo-600" />;
      case "insurance": return <DollarSign className="w-5 h-5 text-green-600" />;
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
      <AppHeader title="Your Notifications" showLogo={true} />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
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
            { type: "device_found", label: "Found Devices", count: 1, color: "green" },
            { type: "marketplace", label: "Marketplace", count: 1, color: "blue" },
            { type: "security", label: "Security", count: 0, color: "purple" },
            { type: "reward", label: "Rewards", count: 1, color: "yellow" },
            { type: "transfer", label: "Transfers", count: 0, color: "indigo" },
            { type: "insurance", label: "Insurance", count: 0, color: "green" }
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
                  {notification.type === "device_found" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <MapPin className="w-4 h-4" />
                        <span>Found at: {notification.location}</span>
                      </div>
                    </div>
                  )}

                  {notification.type === "marketplace" && notification.oldPrice && notification.newPrice && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground line-through">${notification.oldPrice}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ${notification.newPrice} (-${notification.oldPrice - notification.newPrice})
                      </Badge>
                    </div>
                  )}

                  {notification.type === "reward" && notification.tokens && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-yellow-800">
                        <Gift className="w-4 h-4" />
                        <span>+{notification.tokens} STOLEN tokens earned</span>
                      </div>
                    </div>
                  )}

                  {notification.type === "transfer" && notification.buyer && notification.offer && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between text-sm text-blue-800">
                        <span>Buyer: {notification.buyer}</span>
                        <span>Offer: ${notification.offer}</span>
                      </div>
                    </div>
                  )}

                  {notification.type === "insurance" && notification.amount && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <DollarSign className="w-4 h-4" />
                        <span>Payout: ${notification.amount} (Claim {notification.claimId})</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {notification.actionRequired && (
                    <div className="flex gap-2 pt-2">
                      {notification.type === "device_found" && (
                        <>
                          <Button size="sm" className="text-xs">Claim Device</Button>
                          <Button size="sm" variant="outline" className="text-xs">Get Directions</Button>
                        </>
                      )}
                      {notification.type === "marketplace" && (
                        <>
                          <Button size="sm" className="text-xs">Buy Now</Button>
                          <Button size="sm" variant="outline" className="text-xs">View Details</Button>
                        </>
                      )}
                      {notification.type === "transfer" && (
                        <>
                          <Button size="sm" className="text-xs">Accept Offer</Button>
                          <Button size="sm" variant="outline" className="text-xs">Counter Offer</Button>
                          <Button size="sm" variant="outline" className="text-xs">Decline</Button>
                        </>
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

export default IndividualNotifications;