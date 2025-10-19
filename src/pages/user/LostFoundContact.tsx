// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, MessageCircle, User, Clock, MapPin, Send, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

const LostFoundContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthToken } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    contactMethod: "email"
  });

  // REMOVED: Mock data - now using real API data only

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching post details for contact form, ID:', id);
        
        const token = await getAuthToken();
        const response = await fetch(`/api/v1/lost-found/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        console.log('✅ Post details for contact:', result);

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
            responses: 0,
            user: result.data.users?.display_name || 'Anonymous',
            contactInfo: result.data.contact_preferences?.method || 'Not specified'
          });
        } else {
          console.error('❌ Failed to load post for contact');
          toast.error("Failed to load post details");
          navigate("/lost-found");
        }
      } catch (error) {
        console.error('Error fetching post for contact:', error);
        toast.error("Error loading post details");
        navigate("/lost-found");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security check: Prevent users from contacting their own posts
    if (user && post && post.user === user.display_name) {
      toast.error("❌ You cannot contact your own post!");
      console.log('🚫 Self-contact prevented:', {
        currentUser: user.display_name,
        postOwner: post.user
      });
      return;
    }
    
    if (!formData.name || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.contactMethod === "email" && !formData.email) {
      toast.error("Please provide your email address");
      return;
    }

    if (formData.contactMethod === "phone" && !formData.phone) {
      toast.error("Please provide your phone number");
      return;
    }

    try {
      console.log('📧 Sending contact notification...');
      
      const token = await getAuthToken();
      const notificationData = {
        report_id: id,
        finder_name: formData.name,
        finder_email: formData.email,
        finder_phone: formData.phone,
        message: formData.message,
        contact_method: formData.contactMethod
      };

      const response = await fetch('/api/v1/send-contact-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();
      console.log('✅ Notification response:', result);

      if (result.success) {
        toast.success("✅ Message sent! The owner has been notified and will contact you soon.");
        toast.info("📧 Confirmation email sent to both parties");
        navigate(`/lost-found/details/${id}`);
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
              <span className="font-semibold">Contact</span>
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
                <span className="text-green-600 font-semibold">Reward: {post.reward}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Form - Hide for own posts */}
        {user && post.user !== user.display_name ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {post.type === "lost" ? "I Found This Device!" : "Contact the Owner"}
              </CardTitle>
              <p className="text-muted-foreground">
                {post.type === "lost" 
                  ? "Great! Please provide your contact information so the owner can reach you."
                  : "Get in touch with the person who found this device."
                }
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label>Preferred Contact Method *</Label>
                <RadioGroup
                  value={formData.contactMethod}
                  onValueChange={(value) => handleInputChange("contactMethod", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.contactMethod === "email" && (
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              )}

              {formData.contactMethod === "phone" && (
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+27 82 123 4567"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder={
                    post.type === "lost" 
                      ? "Describe where you found the device and any relevant details..."
                      : "Ask any questions about the found device..."
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/lost-found/details/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Own Post</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">This is your own post</h3>
                  <p className="text-muted-foreground">
                    You cannot contact yourself. If you found your device, 
                    you can mark it as reunited from the details page.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/lost-found/details/${id}`)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Meet in a public place when exchanging the device</li>
              <li>• Verify the device details before handing it over</li>
              <li>• Don't share personal information beyond what's necessary</li>
              <li>• Report any suspicious behavior to the platform</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LostFoundContact;
