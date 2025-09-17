import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, 
  DollarSign, 
  Eye, 
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Users,
  Activity,
  Plus,
  Edit,
  BarChart3,
  Zap,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SellerStats {
  totalListings: number;
  activeListings: number;
  soldItems: number;
  totalRevenue: number;
  averageRating: number;
  responseRate: number;
  profileViews: number;
  watchlistAdds: number;
}

interface RecentActivity {
  id: string;
  type: 'view' | 'message' | 'sale' | 'watchlist' | 'question';
  title: string;
  timestamp: Date;
  details: string;
  priority: 'low' | 'medium' | 'high';
}

interface ListingPerformance {
  id: string;
  title: string;
  price: number;
  views: number;
  watchlists: number;
  messages: number;
  daysListed: number;
  status: 'active' | 'sold' | 'expired' | 'pending';
  suggestedActions: string[];
}

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<SellerStats>({
    totalListings: 12,
    activeListings: 8,
    soldItems: 24,
    totalRevenue: 125000,
    averageRating: 4.8,
    responseRate: 95,
    profileViews: 340,
    watchlistAdds: 67
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'sale',
      title: 'iPhone 14 Pro Sold',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      details: 'Sold for R18,999 to John D.',
      priority: 'high'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      details: 'Question about MacBook Pro warranty',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'watchlist',
      title: '3 New Watchers',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      details: 'Galaxy S24 Ultra added to 3 watchlists',
      priority: 'low'
    }
  ]);

  const [listings, setListings] = useState<ListingPerformance[]>([
    {
      id: '1',
      title: 'MacBook Pro M3 16"',
      price: 35000,
      views: 45,
      watchlists: 8,
      messages: 3,
      daysListed: 5,
      status: 'active',
      suggestedActions: ['Consider price reduction', 'Add more photos']
    },
    {
      id: '2',
      title: 'Galaxy S24 Ultra',
      price: 22000,
      views: 78,
      watchlists: 15,
      messages: 7,
      daysListed: 3,
      status: 'active',
      suggestedActions: ['Great engagement!', 'Respond to messages quickly']
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-600" />;
      case 'watchlist': return <Star className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickAction = (action: string, listingId?: string) => {
    switch (action) {
      case 'new_listing':
        navigate('/list-my-device');
        break;
      case 'edit_listing':
        navigate(`/relist/${listingId}`);
        break;
      case 'bulk_edit':
        navigate('/bulk-listings');
        break;
      case 'price_suggestions':
        toast({
          title: 'AI Price Analysis',
          description: 'Analyzing market trends for optimal pricing...',
          variant: 'default'
        });
        break;
      default:
        console.log('Action:', action);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your listings and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleQuickAction('new_listing')}>
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
          <Button variant="outline" onClick={() => handleQuickAction('bulk_edit')}>
            <Edit className="w-4 h-4 mr-2" />
            Bulk Edit
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold">{stats.activeListings}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating}/5</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Views</p>
              <p className="text-2xl font-bold">{stats.profileViews}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Seller Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Response Rate</span>
              <span className="text-sm text-muted-foreground">{stats.responseRate}%</span>
            </div>
            <Progress value={stats.responseRate} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Listing Success Rate</span>
              <span className="text-sm text-muted-foreground">78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => handleQuickAction('price_suggestions')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              AI Price Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Boost Visibility
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              Respond to Messages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </Card>

        {/* Market Insights */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Insights
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">High Demand</span>
              </div>
              <p className="text-xs text-muted-foreground">iPhone 15 series seeing 40% more interest</p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Optimal Timing</span>
              </div>
              <p className="text-xs text-muted-foreground">Best time to list: weekends 6-8 PM</p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Price Alert</span>
              </div>
              <p className="text-xs text-muted-foreground">Galaxy S24 prices dropping 8% this week</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Listing Performance */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Listing Performance</h3>
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{listing.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(listing.price)}
                    • Listed {listing.daysListed} days ago
                  </p>
                </div>
                <Badge className={getStatusColor(listing.status)}>
                  {listing.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-semibold">{listing.views}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{listing.watchlists}</div>
                  <div className="text-xs text-muted-foreground">Watchlists</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{listing.messages}</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {listing.suggestedActions.map((action, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {action}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleQuickAction('edit_listing', listing.id)}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Boost
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
// Test comment for coherence enforcer
