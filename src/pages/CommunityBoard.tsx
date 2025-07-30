import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
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
  Eye
} from "lucide-react";

const CommunityBoard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Mock community posts
  const posts = [
    {
      id: 1,
      type: "lost",
      device: "iPhone 15 Pro Max",
      description: "Space Black, cracked screen protector, purple case",
      location: "Downtown SF, near Union Square",
      timeAgo: "2 hours ago",
      reward: "$100",
      verified: true,
      responses: 3,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      type: "found",
      device: "Samsung Galaxy S24",
      description: "Found at Starbucks on Market St, blue case",
      location: "Market Street, SF",
      timeAgo: "4 hours ago",
      reward: null,
      verified: false,
      responses: 1,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      type: "lost",
      device: "MacBook Pro M3",
      description: "Space Gray, Apple stickers on lid",
      location: "UCSF Campus",
      timeAgo: "1 day ago",
      reward: "$200",
      verified: true,
      responses: 7,
      image: "/placeholder.svg"
    },
    {
      id: 4,
      type: "found",
      device: "AirPods Pro",
      description: "Found in Uber, case has initials 'JS'",
      location: "Mission District",
      timeAgo: "3 days ago",
      reward: null,
      verified: false,
      responses: 0,
      image: "/placeholder.svg"
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || post.type === selectedFilter;
    const matchesTab = activeTab === "all" || post.type === activeTab;
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const PostCard = ({ post }: { post: typeof posts[0] }) => (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
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

        {post.reward && (
          <div className="flex items-center gap-2 text-sm font-medium text-success">
            <DollarSign className="w-4 h-4" />
            {post.reward} reward
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {post.responses} responses
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            View details
          </div>
        </div>
        
        <Button size="sm" variant={post.type === "lost" ? "default" : "outline"}>
          {post.type === "lost" ? "I found this!" : "Contact owner"}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
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
            <Button variant="ghost" size="icon" asChild>
              <Link to="/lost-found-report">
                <Plus className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Community Board</h1>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-destructive">{posts.filter(p => p.type === "lost").length}</div>
              <div className="text-xs text-muted-foreground">Lost Devices</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-success">{posts.filter(p => p.type === "found").length}</div>
              <div className="text-xs text-muted-foreground">Found Devices</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Reunited Today</div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lost" className="mt-6">
            <div className="space-y-4">
              {filteredPosts.filter(p => p.type === "lost").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="found" className="mt-6">
            <div className="space-y-4">
              {filteredPosts.filter(p => p.type === "found").map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No devices found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
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
        <div className="fixed bottom-6 right-6">
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