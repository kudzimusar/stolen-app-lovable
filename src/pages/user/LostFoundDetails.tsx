// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, MapPin, Clock, MessageCircle, AlertTriangle, CheckCircle, DollarSign, User, Shield, FileText, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { formatSerialForDisplay } from "@/utils/security";
import { BlockchainVerificationBadge } from "@/components/lost-found/BlockchainVerificationBadge";

const LostFoundDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthToken } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReunitedDialog, setShowReunitedDialog] = useState(false);
  const [marking, setMarking] = useState(false);

  // REMOVED: Mock data - now using real API data only

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching details for post ID:', id);
        
        const token = await getAuthToken();
        const response = await fetch(`/api/v1/lost-found/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        console.log('✅ Post details loaded:', result);
        console.log('📋 Raw data from API:', {
          contact_preferences: result.data?.contact_preferences,
          photos: result.data?.photos,
          documents: result.data?.documents,
          device_model: result.data?.device_model
        });

        if (result.success && result.data) {
          setPost({
            id: result.data.id,
            type: result.data.report_type,
            device: result.data.device_model || result.data.device_category,
            description: result.data.description,
            location: result.data.location_address || 'Location not specified',
            timeAgo: formatTimeAgo(result.data.created_at),
            reward: result.data.reward_amount ? `R${result.data.reward_amount}` : null,
            verified: result.data.verification_status === 'verified',
            responses: 0, // Will be updated with real tips count
            image: result.data.photos?.[0] || "/placeholder.svg",
            user: result.data.users?.display_name || 'Anonymous',
            userAvatar: result.data.users?.avatar_url,
            reputation: result.data.user_reputation?.reputation_score || 0,
            trustLevel: result.data.user_reputation?.trust_level || 'new',
            serialNumber: result.data.serial_number,
            incidentDate: result.data.incident_date,
            contactInfo: result.data.contact_preferences?.method || 'Not specified',
            contactPreferences: result.data.contact_preferences || {},
            photos: result.data.photos || [],
            documents: result.data.documents || [],
            rawData: result.data // Keep raw data for debugging
          });
          
          console.log('📊 Post data formatted:', {
            device: result.data.device_model,
            photos: result.data.photos?.length || 0,
            documents: result.data.documents?.length || 0,
            contact: result.data.contact_preferences
          });
        } else {
          console.error('❌ Failed to load post details');
          toast.error("Failed to load post details");
          navigate("/lost-found");
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        toast.error("Error loading post details");
        navigate("/lost-found");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const handleMarkAsReunited = async () => {
    try {
      setMarking(true);
      console.log('🎉 Marking device as reunited:', id);
      
      const token = await getAuthToken();
      const response = await fetch(`/api/v1/lost-found/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'reunited',
          verification_status: 'verified'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("🎉 Congratulations! Device marked as reunited!");
        toast.info("Reward payment will be processed automatically.");
        
        // Refresh post details
        window.location.reload();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error('Error marking as reunited:', error);
      toast.error("Error updating device status");
    } finally {
      setMarking(false);
      setShowReunitedDialog(false);
    }
  };

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

  const handleContact = () => {
    // Security check: Prevent users from contacting their own posts
    if (user && post && post.user === user.display_name) {
      toast.error("❌ You cannot contact your own post!");
      console.log('🚫 Self-contact prevented:', {
        currentUser: user.display_name,
        postOwner: post.user
      });
      return;
    }
    
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
    <div className="min-h-screen bg-background pb-24">
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

      <div className="container mx-auto px-4 py-4 space-y-4 max-w-2xl">
        {/* Main Post Card */}
        <Card className="shadow-sm">
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
                <p className="text-muted-foreground font-mono">
                  {formatSerialForDisplay(post.serialNumber, user, post.user_id)}
                </p>
                {user && user.id === post.user_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    🔒 Full serial visible to you as the owner
                  </p>
                )}
                {(!user || user.id !== post.user_id) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    🔒 Serial number partially hidden for security
                  </p>
                )}
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
                <p className="text-muted-foreground break-all">
                  {post.contactPreferences?.method || post.contactInfo || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Blockchain Verification Badge */}
            {post.id && (
              <BlockchainVerificationBadge
                reportId={post.id}
                deviceId={`LF_${post.id}`}
                showDetails={true}
                className="mt-4"
              />
            )}

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
              
              {/* Hide contact button for own posts */}
              {user && post.user !== user.display_name && (
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
              )}
              {user && post.user === user.display_name && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Your Post
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Device Photos ({post.photos.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {post.photos.map((photo: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/10">
                    <img 
                      src={photo} 
                      alt={`Device photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(photo, '_blank')}
                      onError={(e) => {
                        console.error('Image failed to load:', photo);
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Tap to view full size
              </p>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {post.documents && post.documents.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documents ({post.documents.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {post.documents.map((doc: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {index === 0 && post.type === 'lost' ? 'Police Report' : `Document ${index + 1}`}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(doc, '_blank')}
                      className="text-xs"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Owner Actions - Mark as Reunited Button */}
        {user && post.user === user.display_name && 
         (post.status === 'contacted' || post.status === 'pending_verification') && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <PartyPopper className="w-5 h-5" />
                Device Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Have you successfully recovered your device? Mark it as reunited to complete the process.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setShowReunitedDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Reunited
                </Button>
                {post.reward && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <strong>{post.reward}</strong> reward will be released to finder
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reunited Confirmation Dialog */}
      <AlertDialog open={showReunitedDialog} onOpenChange={setShowReunitedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-green-600" />
              Confirm Device Recovery
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>Please confirm that you have successfully recovered your <strong>{post?.device}</strong>.</p>
              {post?.reward && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    The <strong>{post.reward}</strong> reward will be automatically released to the finder's S-Pay wallet.
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                This action will:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Mark the device as "Reunited"</li>
                <li>Process reward payment (if applicable)</li>
                <li>Notify the finder of successful recovery</li>
                <li>Create a success story for the community</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={marking}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkAsReunited}
              disabled={marking}
              className="bg-green-600 hover:bg-green-700"
            >
              {marking ? "Processing..." : "Yes, Mark as Reunited"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LostFoundDetails;
