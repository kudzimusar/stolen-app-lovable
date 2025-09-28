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

const LostFoundContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    contactMethod: "email"
  });

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
      user: "Sarah M.",
      contactInfo: "sarah@email.com"
    },
    {
      id: 2,
      type: "found",
      device: "Samsung Galaxy S24",
      description: "Found at V&A Waterfront, blue case",
      location: "V&A Waterfront, Cape Town",
      timeAgo: "4 hours ago",
      reward: null,
      verified: false,
      responses: 1,
      user: "Mike D.",
      contactInfo: "mike@email.com"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    // Simulate form submission
    toast.success("Message sent successfully! The owner will contact you soon.");
    navigate(`/lost-found/details/${id}`);
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

        {/* Contact Form */}
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
