import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { LostFoundNotificationCenter } from "@/components/user/LostFoundNotificationCenter";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, getAuthToken } from "@/lib/auth";
import { formatSerialForDisplay } from "@/utils/security";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Clock,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Plus,
  DollarSign,
  Eye,
  Database
} from "lucide-react";

const CommunityBoard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Real community posts from API
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    reunited: 0
  });
  
  // Use refs to track fetch state without causing re-renders
  const hasFetchedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  // Wrap fetchPosts in useCallback to prevent infinite loops
  const fetchPosts = useCallback(async () => {
    try {
      console.log('🔄 Starting fetchPosts...');
      setLoading(true);
      console.log('Fetching posts from API...');
      
      // Get auth token from authenticated user
      const authToken = await getAuthToken();
      console.log('🔑 Auth token obtained:', authToken ? 'Yes' : 'No');
      
      if (!authToken) {
        console.log('❌ No auth token available, user not logged in');
        setPosts([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/v1/lost-found/reports', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response status:', response.status);
      const result = await response.json();
      console.log('API Response data:', result);
      
      if (result.success && result.data) {
        console.log('✅ API Response:', result.data.length, 'posts received');
        
        if (result.data.length > 0) {
          const formattedPosts = result.data.map((post: any) => ({
            id: post.id,
            type: post.report_type,
            device: post.device_model || post.device_category,
            description: post.description,
            location: post.location_address || 'Location not specified',
            timeAgo: formatTimeAgo(post.created_at),
            reward: post.reward_amount ? `R${post.reward_amount}` : null,
            verified: post.verification_status === 'verified',
            responses: post.community_tips_count || 0,
            image: post.photos?.[0] || "/placeholder.svg",
            user: post.users?.display_name || 'Anonymous',
            userAvatar: post.users?.avatar_url,
            reputation: post.user_reputation?.reputation_score || 0,
            trustLevel: post.user_reputation?.trust_level || 'new',
            status: post.status || 'active' // Add status field
          }));
          
          setPosts(formattedPosts);
          console.log('✅ Displayed', formattedPosts.length, 'posts from database');
        } else {
          console.log('⚠️ API returned 0 posts - database might be empty');
          setPosts([]); // Set empty array, not fallback
        }
      } else {
        console.log('❌ API call failed or returned error');
        setPosts([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      console.log('API failed, using fallback data...');
      // Don't set posts here - let the fallback useEffect handle it
    } finally {
      setLoading(false);
    }
  }, []); // getAuthToken is now a stable standalone function

  const fetchStats = useCallback(async () => {
    try {
      console.log('🔄 Starting fetchStats...');
      console.log('Fetching community stats...');
      
      // Get auth token from authenticated user
      const authToken = await getAuthToken();
      console.log('🔑 Auth token for stats:', authToken ? 'Yes' : 'No');
      
      if (!authToken) {
        console.log('❌ No auth token available for stats, user not logged in');
        setStats({ lost: 0, found: 0, reunited: 0 });
        return;
      }
      
      const response = await fetch('/api/v1/lost-found/community/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Stats API Response status:', response.status);
      const result = await response.json();
      console.log('Stats API Response data:', result);
      
      if (result.success && result.data) {
        setStats({
          lost: result.data.lost || 0,
          found: result.data.found || 0,
          reunited: result.data.reunited || 0
        });
        console.log('✅ Stats loaded - Lost:', result.data.lost, 'Found:', result.data.found, 'Reunited:', result.data.reunited);
      } else {
        console.log('⚠️ Stats API returned no data');
        setStats({ lost: 0, found: 0, reunited: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.log('Stats API failed, using fallback stats...');
      // Don't set stats here - let the fallback useEffect handle it
    }
  }, []); // getAuthToken is now a stable standalone function

  // Fetch posts from API - runs once on mount or when user ID changes
  useEffect(() => {
    // Wait for auth to complete
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }
    
    // Skip if no user
    if (!user?.id) {
      console.log('⚠️ No user - skipping fetch');
      hasFetchedRef.current = false;
      currentUserIdRef.current = null;
      setLoading(false);
      return;
    }

    // Skip if already fetched for this specific user
    if (hasFetchedRef.current && currentUserIdRef.current === user.id) {
      console.log('✋ Already fetched for user', user.id, '- skipping');
      return;
    }
    
    let isMounted = true;
    
    const fetchData = async () => {
      console.log('🎯 Fetching data for user:', user.id);
      
      await fetchPosts();
      await fetchStats();
      
      if (isMounted) {
        hasFetchedRef.current = true;
        currentUserIdRef.current = user.id;
        console.log('✅ Data fetch completed and marked for user:', user.id);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
    // Only depend on user.id (primitive) and authLoading
  }, [user?.id, authLoading, fetchPosts, fetchStats]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Interactive handlers
  const handlePostAction = (post: any) => {
    // Security check: Only authenticated users can contact
    if (!user) {
      toast.error("🔒 Please log in to contact device owners");
      navigate('/login');
      return;
    }

    // Security check: Prevent users from contacting their own posts
    if (post.user === user.display_name) {
      toast.error("❌ You cannot contact your own post!");
      console.log('🚫 Self-contact prevented:', {
        currentUser: user.display_name,
        postOwner: post.user
      });
      return;
    }

    // Security check: Prevent contact on claim pending devices
    if (post.claim_status === 'claim_pending') {
      toast.info("📋 This device is under ownership verification. Please wait for admin approval.");
      return;
    }

    if (post.type === "lost") {
      toast.success("Thank you! We'll connect you with the owner.");
      navigate(`/lost-found/contact/${post.id}`);
    } else {
      toast.info("Opening claim form...");
      navigate(`/lost-found/claim/${post.id}`);
    }
  };

  const handleViewDetails = (post: any) => {
    navigate(`/lost-found/details/${post.id}`);
  };

  const handleViewResponses = (post: any) => {
    navigate(`/lost-found/responses/${post.id}`);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Use status for filtering instead of type
    let matchesFilter = true;
    let matchesTab = true;
    
    if (selectedFilter !== "all") {
      if (selectedFilter === "reunited") {
        matchesFilter = post.status === 'reunited';
      } else if (selectedFilter === "lost") {
        matchesFilter = post.type === 'lost' && post.status !== 'reunited';
      } else if (selectedFilter === "found") {
        matchesFilter = post.type === 'found' && post.status !== 'reunited';
      }
    }
    
    if (activeTab !== "all") {
      if (activeTab === "reunited") {
        matchesTab = post.status === 'reunited';
      } else if (activeTab === "lost") {
        matchesTab = post.type === 'lost' && post.status !== 'reunited';
      } else if (activeTab === "found") {
        matchesTab = post.type === 'found' && post.status !== 'reunited';
      }
    }
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  // Calculate real-time stats from actual posts
  const realTimeStats = {
    lost: posts.filter(p => p.type === 'lost' && p.status !== 'reunited').length,
    found: posts.filter(p => p.type === 'found' && p.status !== 'reunited').length,
    reunited: posts.filter(p => p.status === 'reunited').length
  };

  const PostCard = ({ post }: { post: typeof posts[0] }) => (
    <Card className={`p-4 space-y-3 ${
      post.status === "reunited" ? "bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500" :
      post.type === "found" ? "bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500" : ""
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {/* Status Badge - Dynamic based on device status */}
          {post.status === 'contacted' ? (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              <Clock className="w-3 h-3 mr-1" />
              Contact Received
            </Badge>
          ) : post.status === 'pending_verification' ? (
            <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Pending Verification
            </Badge>
          ) : post.status === 'reunited' ? (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Reunited!
            </Badge>
          ) : (
            <Badge variant={post.type === "lost" ? "destructive" : "secondary"}>
              {post.type === "lost" ? (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Lost
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Found
                </>
              )}
            </Badge>
          )}
          {post.verified && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {post.timeAgo}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">{post.device}</h3>
        <p className="text-sm text-muted-foreground">{post.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {post.location}
        </div>
        
        {/* Security: Serial numbers partially hidden from public view */}
        {post.serial && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <strong>Serial:</strong> {formatSerialForDisplay(post.serial, user, post.user_id)}
            {user && user.id === post.user_id && (
              <span className="ml-2 text-green-600">🔒 Full access</span>
            )}
            {(!user || user.id !== post.user_id) && (
              <span className="ml-2 text-orange-600">🔒 Partial view</span>
            )}
          </div>
        )}

        {post.reward && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm font-medium text-success">
              <DollarSign className="w-4 h-4" />
              {post.reward}
            </div>
            {post.status === 'contacted' && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-300">
                Reward Pending
              </Badge>
            )}
            {post.status === 'pending_verification' && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-800 border-orange-300">
                Reward Processing
              </Badge>
            )}
            {post.status === 'reunited' && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-300">
                Reward Paid
              </Badge>
            )}
            {!post.status || post.status === 'active' && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Reward Offered
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div 
            className="flex items-center gap-1 cursor-pointer hover:text-primary group"
            onClick={() => handleViewResponses(post)}
            title="View all community engagement"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">
              {post.responses} {post.responses === 1 ? 'response' : 'responses'}
            </span>
            {post.responses > 0 && (
              <Badge variant="secondary" className="text-xs ml-1 group-hover:bg-primary group-hover:text-primary-foreground">
                {post.status === 'contacted' ? 'Contact received' : 'Tips & comments'}
              </Badge>
            )}
          </div>
          <div 
            className="flex items-center gap-1 cursor-pointer hover:text-primary"
            onClick={() => handleViewDetails(post)}
          >
            <Eye className="w-4 h-4" />
            View details
          </div>
          {post.user && (
            <div className="flex items-center gap-1">
              <span className="text-xs">by {post.user}</span>
              {post.reputation > 0 && (
                <Badge variant="outline" className="text-xs">
                  {post.reputation} pts
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Security: Contact buttons only for authenticated users, different logic for lost vs found */}
        {!user && (post.type === "found" || post.type === "lost") && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = '/login'}
          >
            Login to {post.type === "lost" ? "Report Found" : "Claim Device"}
          </Button>
        )}
        
        {user && post.user !== user.display_name && post.status !== 'reunited' && (
          <Button 
            size="sm" 
            variant={post.status === 'contacted' || post.status === 'pending_verification' ? "outline" : "default"}
            onClick={() => handlePostAction(post)}
            disabled={post.status === 'contacted' || post.status === 'pending_verification'}
          >
            {post.status === 'contacted' ? "Contact Received" :
             post.status === 'pending_verification' ? "Verification Pending" :
             post.type === "lost" ? "I found this!" : "Claim Device"}
          </Button>
        )}
        {user && post.user === user.display_name && (
          <Badge variant="outline" className="text-xs">
            Your Post
          </Badge>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <STOLENLogo />
            <div className="flex items-center gap-2">
              {/* Lost & Found Notification Center */}
              <LostFoundNotificationCenter />
              <Button variant="ghost" size="icon" asChild>
                <Link to="/lost-found-report">
                  <Plus className="w-5 h-5" />
                </Link>
              </Button>
              {/* Test Data button removed - using only real database data */}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Lost & Found Community</h1>
          <p className="text-muted-foreground">
            Help others find their lost devices or reunite with yours
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="found">Found</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats - Real-time from database */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-destructive">
                {loading ? "..." : realTimeStats.lost}
              </div>
              <div className="text-xs text-muted-foreground">Lost Devices</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-success">
                {loading ? "..." : realTimeStats.found}
              </div>
              <div className="text-xs text-muted-foreground">Found Devices</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-primary">
                {loading ? "..." : realTimeStats.reunited}
              </div>
              <div className="text-xs text-muted-foreground">Reunited Today</div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost ({realTimeStats.lost})</TabsTrigger>
            <TabsTrigger value="found">Found ({realTimeStats.found})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {!loading && (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lost" className="mt-6">
            {!loading && (
              <div className="space-y-4">
                {filteredPosts.filter(p => p.type === "lost").map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found" className="mt-6">
            {!loading && (
              <div className="space-y-4">
                {filteredPosts.filter(p => p.type === "found").map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Loading community posts...</h3>
            <p className="text-muted-foreground">
              Fetching the latest lost and found reports
            </p>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters, or be the first to report a device
            </p>
            <Button asChild>
              <Link to="/lost-found-report">
                <Plus className="w-4 h-4 mr-2" />
                Report a device
              </Link>
            </Button>
          </Card>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {/* Test Data button removed - using only real database data */}
          <Button size="lg" className="rounded-full shadow-lg" asChild>
            <Link to="/lost-found-report">
              <Plus className="w-6 h-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityBoard;