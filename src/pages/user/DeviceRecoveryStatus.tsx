import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Bell,
  MessageCircle,
  Phone,
  Share2,
  Zap
} from "lucide-react";

const DeviceRecoveryStatus = () => {
  const [activeDevice] = useState({
    id: 1,
    name: "iPhone 15 Pro Max",
    serial: "ABC123456789",
    reportDate: "May 24, 2025",
    lastSeen: "Downtown SF, Union Square",
    status: "recovery_in_progress",
    recoveryScore: 75,
    tips: 3,
    policeNotified: true,
    communityViews: 847,
    shareLink: "stolen.app/r/abc123"
  });

  // Recovery timeline
  const timeline = [
    {
      date: "May 24, 2025 - 2:30 PM",
      event: "Device reported as lost",
      status: "completed",
      icon: <AlertCircle className="w-4 h-4" />,
      description: "Initial report submitted with location and device details"
    },
    {
      date: "May 24, 2025 - 2:45 PM", 
      event: "Police automatically notified",
      status: "completed",
      icon: <Shield className="w-4 h-4" />,
      description: "Case #SF-2025-5678 created in police database"
    },
    {
      date: "May 24, 2025 - 3:00 PM",
      event: "Community alert broadcast",
      status: "completed", 
      icon: <Users className="w-4 h-4" />,
      description: "Alert sent to 1,247 nearby STOLEN users"
    },
    {
      date: "May 24, 2025 - 4:15 PM",
      event: "First community tip received",
      status: "completed",
      icon: <MessageCircle className="w-4 h-4" />,
      description: "Device spotted near Market Street"
    },
    {
      date: "May 25, 2025 - 9:30 AM",
      event: "Additional tips received",
      status: "in_progress",
      icon: <Bell className="w-4 h-4" />,
      description: "2 more community members reported sightings"
    },
    {
      date: "Pending",
      event: "Recovery in progress",
      status: "pending",
      icon: <Search className="w-4 h-4" />,
      description: "Investigating leads and coordinating with law enforcement"
    }
  ];

  const tips = [
    {
      id: 1,
      time: "2 hours ago",
      location: "Market Street & 4th",
      message: "Saw someone with this device at the bus stop",
      verified: false,
      anonymous: true
    },
    {
      id: 2,
      time: "5 hours ago", 
      location: "Union Square",
      message: "Device was used to make a call near Apple Store",
      verified: true,
      anonymous: false
    },
    {
      id: 3,
      time: "1 day ago",
      location: "Mission District",
      message: "Possible sighting at a pawn shop",
      verified: false,
      anonymous: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <span className="font-semibold">Recovery Status</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Device Overview */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{activeDevice.name}</h1>
              <p className="text-muted-foreground">Serial: {activeDevice.serial}</p>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Recovery in Progress
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Reported: {activeDevice.reportDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Last seen: {activeDevice.lastSeen}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{activeDevice.communityViews} community views</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Recovery Likelihood</span>
                  <span className="font-medium">{activeDevice.recoveryScore}%</span>
                </div>
                <Progress value={activeDevice.recoveryScore} className="h-2" />
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  Share Alert
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  Update Alert
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{activeDevice.tips}</div>
            <div className="text-sm text-muted-foreground">Community Tips</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">1</div>
            <div className="text-sm text-muted-foreground">Police Reports</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{activeDevice.communityViews}</div>
            <div className="text-sm text-muted-foreground">Alert Views</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">24h</div>
            <div className="text-sm text-muted-foreground">Time Active</div>
          </Card>
        </div>

        {/* Recovery Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recovery Timeline</h2>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  item.status === 'completed' ? 'bg-success text-white' :
                  item.status === 'in_progress' ? 'bg-warning text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {item.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : item.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{item.event}</h3>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Community Tips */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Community Tips</h2>
            <Badge variant="outline">{tips.length} active</Badge>
          </div>
          
          <div className="space-y-4">
            {tips.map((tip) => (
              <div key={tip.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{tip.location}</span>
                      {tip.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{tip.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{tip.time}</span>
                      <span>•</span>
                      <span>{tip.anonymous ? 'Anonymous' : 'Community Member'}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" className="w-full">
              View All Tips
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="h-auto p-4 flex items-start gap-3">
              <Zap className="w-5 h-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Boost Alert</div>
                <div className="text-xs opacity-90">Increase visibility for 24 hours</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex items-start gap-3">
              <Phone className="w-5 h-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Contact Police</div>
                <div className="text-xs opacity-90">Case #SF-2025-5678</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex items-start gap-3" asChild>
              <Link to="/lost-found-board">
                <MessageCircle className="w-5 h-5 mt-1" />
                <div className="text-left">
                  <div className="font-medium">Community Board</div>
                  <div className="text-xs opacity-90">View all recovery discussions</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex items-start gap-3">
              <Share2 className="w-5 h-5 mt-1" />
              <div className="text-left">
                <div className="font-medium">Share on Social</div>
                <div className="text-xs opacity-90">Spread the word to friends</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeviceRecoveryStatus;