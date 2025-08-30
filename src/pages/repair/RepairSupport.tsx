import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Wrench,
  FileText,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Shield,
  Star,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Video,
  Download,
  Search
} from "lucide-react";

const RepairSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
    priority: "medium"
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Support Request Submitted",
      description: "Our technical team will respond within 2-4 hours during business hours.",
      variant: "default"
    });
    setSupportForm({ subject: "", message: "", priority: "medium" });
  };

  // Repairer-specific FAQ items
  const faqItems = [
    {
      question: "How do I manage repair logs?",
      answer: "Navigate to your dashboard and use the 'Log New Repair' section. Search for the device by serial number, fill in repair details, add photos, and submit to blockchain.",
      category: "Repairs",
      icon: <Wrench className="w-4 h-4" />
    },
    {
      question: "How do I update my repair shop profile and services?",
      answer: "Go to your profile via the user icon in the top-right corner. You can edit business information, add certifications, update contact details, and manage service offerings.",
      category: "Profile",
      icon: <Settings className="w-4 h-4" />
    },
    {
      question: "How do I handle new repair booking requests?",
      answer: "Booking requests appear in your 'Today's Appointments' section. You can call, email, or message customers directly using the contact buttons provided.",
      category: "Bookings",
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      question: "How do repair history verification tools work?",
      answer: "Our fraud detection system automatically verifies device serials against stolen registries and flags suspicious modifications or tampered devices for your review.",
      category: "Verification",
      icon: <Shield className="w-4 h-4" />
    },
    {
      question: "How should I price my repair services?",
      answer: "Consider parts cost, labor time, warranty coverage, and market rates. Premium STOLEN-certified shops can charge 15-20% more due to verified quality assurance.",
      category: "Pricing",
      icon: <Star className="w-4 h-4" />
    },
    {
      question: "What parts suppliers are recommended?",
      answer: "We partner with verified suppliers who provide authentic parts. Check your dashboard's 'Recommended Partners' section for approved vendors with warranty coverage.",
      category: "Parts",
      icon: <FileText className="w-4 h-4" />
    },
    {
      question: "How do I communicate with customers effectively?",
      answer: "Use our integrated messaging system to provide repair updates, send photos of progress, and maintain professional communication throughout the repair process.",
      category: "Communication",
      icon: <Users className="w-4 h-4" />
    }
  ];

  const quickLinks = [
    {
      title: "Repair Dashboard",
      description: "Access your main repair management interface",
      href: "/repair-shop-dashboard",
      icon: <Wrench className="w-5 h-5" />,
      variant: "outline" as const
    },
    {
      title: "Profile Settings",
      description: "Update your shop information and certifications",
      href: "/repairer-profile",
      icon: <Settings className="w-5 h-5" />,
      variant: "outline" as const
    },
    {
      title: "Fraud Detection",
      description: "Access device verification and fraud prevention tools",
      href: "/repair-fraud-detection",
      icon: <Shield className="w-5 h-5" />,
      variant: "outline" as const
    },
    {
      title: "Training Resources",
      description: "Access repair guides and certification materials",
      href: "#training",
      icon: <BookOpen className="w-5 h-5" />,
      variant: "outline" as const
    }
  ];

  const filteredFaq = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Repair Shop Support" showBackButton={true} backTo="/repair-shop-dashboard" />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Wrench className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Repair Shop Support</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive help and resources designed specifically for STOLEN certified repair shops. 
            Get assistance with repairs, bookings, fraud detection, and business growth.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
              <a href={link.href} className="block space-y-2">
                <div className="flex items-center gap-2">
                  {link.icon}
                  <h3 className="font-medium">{link.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </a>
            </Card>
          ))}
        </div>

        {/* Emergency Contact */}
        <Card className="p-6 bg-destructive/10 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive mt-1" />
            <div>
              <h3 className="font-semibold text-destructive">Emergency Technical Support</h3>
              <p className="text-sm text-muted-foreground mt-1">
                For urgent issues affecting your repair operations, call our 24/7 technical hotline:
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Button variant="destructive" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  +27 (0)21 555-TECH
                </Button>
                <Badge variant="destructive">24/7 Available</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
              
              {/* Search FAQ */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQ topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFaq.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {item.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{item.question}</h3>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Technical Support</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority Level</label>
                  <select 
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={supportForm.priority}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Non-urgent issue</option>
                    <option value="high">High - Affects operations</option>
                    <option value="critical">Critical - Business stopped</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Detailed Description</label>
                  <Textarea
                    placeholder="Provide as much detail as possible about your issue, including steps you've already tried..."
                    value={supportForm.message}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={!supportForm.subject || !supportForm.message}
                >
                  Submit Support Request
                </Button>
              </div>
            </Card>

            {/* Response Times */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Response Times
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Critical:</span>
                  <Badge variant="destructive" className="text-xs">30 minutes</Badge>
                </div>
                <div className="flex justify-between">
                  <span>High:</span>
                  <Badge variant="secondary" className="text-xs">2-4 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <Badge variant="outline" className="text-xs">8-12 hours</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Low:</span>
                  <Badge variant="outline" className="text-xs">24-48 hours</Badge>
                </div>
              </div>
            </Card>

            {/* Additional Resources */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Additional Resources</h3>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Video Tutorials
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  User Manual (PDF)
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairSupport;