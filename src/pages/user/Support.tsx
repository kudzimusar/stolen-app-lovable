import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Video,
  FileText,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  HelpCircle,
  Zap,
  Shield,
  Users,
  BookOpen
} from "lucide-react";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Topics" },
    { id: "device", label: "Device Registration" },
    { id: "marketplace", label: "Marketplace" },
    { id: "wallet", label: "S-Pay Wallet" },
    { id: "recovery", label: "Device Recovery" },
    { id: "security", label: "Security" }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I register my device on STOLEN?",
      answer: "You can register your device by scanning its QR code or entering the serial number manually. Upload a receipt for verification and your device will be secured on the blockchain.",
      category: "device",
      views: 1243
    },
    {
      id: 2,
      question: "What happens if my device is stolen?",
      answer: "Report it immediately through our app. Our AI will alert the community and law enforcement. The blockchain record proves ownership for recovery.",
      category: "recovery",
      views: 892
    },
    {
      id: 3,
      question: "How secure is the S-Pay wallet?",
      answer: "S-Pay uses military-grade encryption and blockchain technology. All transactions are secured through smart contracts and multi-factor authentication.",
      category: "wallet",
      views: 756
    },
    {
      id: 4,
      question: "Can I sell my registered device?",
      answer: "Yes! Registered devices have higher resale value. Use our marketplace for secure transactions with built-in escrow protection.",
      category: "marketplace",
      views: 634
    },
    {
      id: 5,
      question: "How do I earn rewards in the community?",
      answer: "Help recover lost devices, verify device authenticity, refer friends, or contribute to the community board. Rewards are automatically credited to your S-Pay wallet.",
      category: "security",
      views: 521
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: "Getting Started with STOLEN",
      duration: "3:45",
      thumbnail: "/placeholder.svg",
      description: "Learn the basics of device registration and security features"
    },
    {
      id: 2,
      title: "Using the Marketplace Safely",
      duration: "5:20",
      thumbnail: "/placeholder.svg",
      description: "How to buy and sell devices with confidence"
    },
    {
      id: 3,
      title: "Device Recovery Process",
      duration: "4:12",
      thumbnail: "/placeholder.svg",
      description: "What to do if your device is lost or stolen"
    }
  ];

  const filteredFaqs = selectedCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <STOLENLogo />
            </div>
            <Button variant="hero" size="sm">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <HelpCircle className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">How can we help you?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get instant answers to common questions, watch tutorial videos, 
            or contact our support team for personalized assistance.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-4 hover:shadow-card transition-shadow">
            <MessageCircle className="w-12 h-12 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant help from our support team
              </p>
              <Badge variant="secondary" className="text-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online Now
              </Badge>
            </div>
            <Button className="w-full">
              Start Chat
            </Button>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:shadow-card transition-shadow">
            <Video className="w-12 h-12 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Watch step-by-step guides and tips
              </p>
              <Badge variant="outline">
                {tutorials.length} Videos
              </Badge>
            </div>
            <Button variant="outline" className="w-full">
              Watch Tutorials
            </Button>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:shadow-card transition-shadow">
            <Mail className="w-12 h-12 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us a detailed message
              </p>
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                24h Response
              </Badge>
            </div>
            <Button variant="outline" className="w-full">
              Send Message
            </Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex-shrink-0"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                    <Badge variant="outline" className="text-xs">
                      {faq.views} views
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{faq.answer}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Helpful
                    </Button>
                    <Button variant="ghost" size="sm">
                      Not Helpful
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Video Tutorials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden hover:shadow-card transition-shadow">
                <div className="relative">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button size="icon" className="rounded-full">
                      <Video className="w-6 h-6" />
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2">
                    {tutorial.duration}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tutorial.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground">
                Send us a message and we'll get back to you within 24 hours.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="How can we help?" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                />
              </div>
              <Button className="w-full">
                <Mail className="w-4 h-4" />
                Send Message
              </Button>
            </form>
          </div>
        </Card>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 text-center space-y-4">
            <Phone className="w-8 h-8 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-muted-foreground">+1 (555) 123-STOLEN</p>
              <p className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM PST</p>
            </div>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <Mail className="w-8 h-8 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-muted-foreground">support@stolen.app</p>
              <p className="text-sm text-muted-foreground">24/7 Response</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;