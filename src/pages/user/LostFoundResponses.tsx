import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, MessageCircle, User, Clock, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth";

const LostFoundResponses = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(true);

  // REMOVED: Mock data - now using real API data only

  useEffect(() => {
    const fetchPostAndResponses = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching post and responses, ID:', id);
        
        const token = await getAuthToken();
        
        // Fetch post details
        const postResponse = await fetch(`/api/v1/lost-found/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const postResult = await postResponse.json();

        // Fetch community tips/responses
        const tipsResponse = await fetch(`/api/v1/community-tips?report_id=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const tipsResult = await tipsResponse.json();

        console.log('✅ Post loaded:', postResult);
        console.log('✅ Tips loaded:', tipsResult);

        if (postResult.success && postResult.data) {
          setPost({
            id: postResult.data.id,
            type: postResult.data.report_type,
            device: postResult.data.device_model || postResult.data.device_category,
            description: postResult.data.description,
            location: postResult.data.location_address || 'Location not specified',
            timeAgo: formatTimeAgo(postResult.data.created_at),
            reward: postResult.data.reward_amount ? `R${postResult.data.reward_amount}` : null,
            verified: postResult.data.verification_status === 'verified',
            responses: tipsResult.data?.length || 0,
            user: postResult.data.users?.display_name || 'Anonymous'
          });

          // Format responses
          if (tipsResult.success && tipsResult.data) {
            setResponses(tipsResult.data.map((tip: any) => ({
              id: tip.id,
              postId: tip.report_id,
              user: tip.users?.display_name || 'Anonymous',
              message: tip.tip_description,
              timeAgo: formatTimeAgo(tip.created_at),
              location: tip.tip_location_address,
              verified: tip.verified
            })));
          }
        } else {
          console.error('❌ Failed to load post/responses');
          toast.error("Failed to load post details");
          navigate("/community-board");
        }
      } catch (error) {
        console.error('Error fetching post/responses:', error);
        toast.error("Error loading data");
        navigate("/community-board");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndResponses();
  }, [id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

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
    <div className="min-h-screen bg-background pb-24">
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
