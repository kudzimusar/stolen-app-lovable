import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, MessageCircle, User, Clock, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const LostFoundResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data for testing
  const mockPosts = [
    {
      id: 1,
      type: "lost",
      device: "iPhone 15 Pro Max",
      description: "Space Black, cracked screen protector, purple case",
      location: "Sandton City Mall, Johannesburg",
      timeAgo: "2 hours ago",
      reward: "R5000",
      verified: true,
      responses: 3,
      user: "Sarah M."
    }
  ];

  const mockResponses = [
    {
      id: 1,
      postId: 1,
      user: "John D.",
      message: "I think I saw a phone like this at the food court around 3 PM. It was on a table near the pizza place.",
      timeAgo: "1 hour ago",
      location: "Food Court, Sandton City",
      verified: false
    },
    {
      id: 2,
      postId: 1,
      user: "Lisa K.",
      message: "Check with the mall security office. They usually collect lost items and keep them for a few days.",
      timeAgo: "45 minutes ago",
      location: null,
      verified: true
    },
    {
      id: 3,
      postId: 1,
      user: "Mike R.",
      message: "I found a similar phone but it was a different case. Good luck with your search!",
      timeAgo: "30 minutes ago",
      location: "Parking Garage, Sandton City",
      verified: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundPost = mockPosts.find(p => p.id === parseInt(id || '1'));
      const postResponses = mockResponses.filter(r => r.postId === parseInt(id || '1'));
      setPost(foundPost || mockPosts[0]);
      setResponses(postResponses);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleSubmitResponse = () => {
    if (!newResponse.trim()) {
      toast.error("Please enter a response");
      return;
    }

    const response = {
      id: responses.length + 1,
      postId: parseInt(id || '1'),
      user: "You",
      message: newResponse,
      timeAgo: "Just now",
      location: null,
      verified: false
    };

    setResponses([response, ...responses]);
    setNewResponse("");
    toast.success("Response submitted!");
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
              <Button variant="ghost" size="icon" onClick={() => navigate(`/lost-found/details/${id}`)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Responses</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Post Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{post.device}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.user}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {post.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.timeAgo}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{post.description}</p>
            {post.reward && (
              <div className="mt-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Reward: {post.reward}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Response */}
        <Card>
          <CardHeader>
            <CardTitle>Add Your Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Share any information you have about this device..."
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitResponse}>
                <Send className="w-4 h-4 mr-2" />
                Submit Response
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Responses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Community Responses ({responses.length})</h2>
          
          {responses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
                <p className="text-muted-foreground">Be the first to help by sharing any information you have.</p>
              </CardContent>
            </Card>
          ) : (
            responses.map((response) => (
              <Card key={response.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{response.user}</span>
                      {response.verified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {response.timeAgo}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">{response.message}</p>
                  
                  {response.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {response.location}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LostFoundResponses;
