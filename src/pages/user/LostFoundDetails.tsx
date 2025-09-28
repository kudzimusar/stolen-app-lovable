import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, MapPin, Clock, MessageCircle, AlertTriangle, CheckCircle, DollarSign, User, Shield } from "lucide-react";
import { toast } from "sonner";

const LostFoundDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for testing
  const mockPosts = [
    {
      id: 1,
      type: "lost",
      device: "iPhone 15 Pro Max",
      description: "Space Black, cracked screen protector, purple case. Lost at Sandton City Mall while shopping. The phone has a distinctive purple case with a photo of my dog on the lock screen. It was last seen near the food court area.",
      location: "Sandton City Mall, Johannesburg",
      timeAgo: "2 hours ago",
      reward: "R5000",
      verified: true,
      responses: 3,
      image: "/placeholder.svg",
      user: "Sarah M.",
      reputation: 85,
      trustLevel: "trusted",
      contactInfo: "sarah@email.com",
      serialNumber: "ABC123456789",
      incidentDate: "2024-12-15T14:30:00Z"
    },
    {
      id: 2,
      type: "found",
      device: "Samsung Galaxy S24",
      description: "Found at V&A Waterfront, blue case. The device was found near the waterfront area, appears to be in good condition. No visible damage.",
      location: "V&A Waterfront, Cape Town",
      timeAgo: "4 hours ago",
      reward: null,
      verified: false,
      responses: 1,
      image: "/placeholder.svg",
      user: "Mike D.",
      reputation: 42,
      trustLevel: "verified",
      contactInfo: "mike@email.com",
      foundDate: "2024-12-15T10:00:00Z"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundPost = mockPosts.find(p => p.id === parseInt(id || '1'));
      setPost(foundPost || mockPosts[0]);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleContact = () => {
    toast.success("Contact form opened!");
    navigate(`/lost-found/contact/${id}`);
  };

  const handleViewResponses = () => {
    navigate(`/lost-found/responses/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested post could not be found.</p>
          <Button onClick={() => navigate('/community-board')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Board
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/community-board')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={post.type === "lost" ? "destructive" : "secondary"}>
                {post.type === "lost" ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                {post.type}
              </Badge>
              {post.verified && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Main Post Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{post.device}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.timeAgo}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {post.location}
                  </div>
                </div>
              </div>
              {post.reward && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{post.reward}</div>
                  <div className="text-sm text-muted-foreground">Reward</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{post.description}</p>
            </div>

            {post.serialNumber && (
              <div>
                <h3 className="font-semibold mb-2">Serial Number</h3>
                <p className="text-muted-foreground font-mono">{post.serialNumber}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Reporter</h3>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.user}</span>
                  <Badge variant="outline" className="text-xs">
                    {post.reputation} pts
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Trust Level: {post.trustLevel}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-muted-foreground">{post.contactInfo}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <div 
                  className="flex items-center gap-1 cursor-pointer hover:text-primary"
                  onClick={handleViewResponses}
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.responses} responses
                </div>
              </div>
              
              <div className="flex gap-2">
                {post.type === "lost" ? (
                  <Button onClick={handleContact}>
                    I found this!
                  </Button>
                ) : (
                  <Button onClick={handleContact}>
                    Contact Owner
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Incident Details</h4>
                <p className="text-sm text-muted-foreground">
                  {post.incidentDate ? `Lost on: ${new Date(post.incidentDate).toLocaleDateString()}` : 
                   post.foundDate ? `Found on: ${new Date(post.foundDate).toLocaleDateString()}` : 
                   'Date not specified'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <p className="text-sm text-muted-foreground">
                  {post.verified ? 'Verified by community' : 'Pending verification'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LostFoundDetails;
