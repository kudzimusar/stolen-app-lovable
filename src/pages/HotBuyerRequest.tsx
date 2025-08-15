import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  Smartphone,
  Camera,
  Zap,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

const HotBuyerRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deviceCategory, setDeviceCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [condition, setCondition] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [locationRadius, setLocationRadius] = useState("50");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    document.title = "Post Buyer Request - STOLEN";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Post a buyer request and get matched with sellers offering the device you need');
    }
  }, []);

  // Mock potential matches
  const potentialMatches = [
    {
      id: 1,
      title: "iPhone 14 Pro - 128GB",
      price: 850,
      seller: "TechDealer99",
      condition: "Excellent",
      matchScore: 95
    },
    {
      id: 2,
      title: "iPhone 14 Pro Max - 256GB",
      price: 950,
      seller: "ApplePro",
      condition: "Like New",
      matchScore: 88
    }
  ];

  const deviceCategories = [
    { value: "smartphone", label: "Smartphone", icon: Smartphone },
    { value: "tablet", label: "Tablet", icon: Smartphone },
    { value: "laptop", label: "Laptop", icon: Smartphone },
    { value: "camera", label: "Camera", icon: Camera },
    { value: "gaming", label: "Gaming Console", icon: Smartphone },
    { value: "wearable", label: "Wearable", icon: Smartphone }
  ];

  const conditionOptions = [
    { value: "new", label: "New/Sealed" },
    { value: "like-new", label: "Like New" },
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "any", label: "Any Condition" }
  ];

  const urgencyOptions = [
    { value: "low", label: "No Rush (30+ days)", color: "secondary" },
    { value: "medium", label: "Moderate (7-30 days)", color: "warning" },
    { value: "high", label: "Urgent (1-7 days)", color: "destructive" }
  ];

  const handleSubmitRequest = () => {
    if (!deviceCategory || !maxBudget) {
      toast({
        title: "Missing Information",
        description: "Please fill in device category and budget",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Buyer Request Posted!",
      description: "AI is now searching for matches. You'll be notified when sellers respond.",
    });

    // In real app, would submit to API
    navigate('/hot-deals-hub');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        title="Post Buyer Request"
        showBackButton={true}
        backTo="/hot-deals-hub"
      />
      
      <main className="container mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Post a Buyer Request</h1>
          </div>
          <p className="text-muted-foreground">
            Tell us what you're looking for and get matched with sellers instantly
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Device Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Device Category *</Label>
              <Select value={deviceCategory} onValueChange={setDeviceCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device category" />
                </SelectTrigger>
                <SelectContent>
                  {deviceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Apple, Samsung, Google"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., iPhone 14 Pro, Galaxy S24"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <Label htmlFor="specs">Specifications & Preferences</Label>
              <Textarea
                id="specs"
                placeholder="Storage capacity, color, specific features, etc."
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
                className="h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Max Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Maximum Budget *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="budget"
                  type="number"
                  placeholder="1000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>Acceptable Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select minimum condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Urgency */}
            <div className="space-y-3">
              <Label>How urgent is your request?</Label>
              <RadioGroup value={urgency} onValueChange={setUrgency}>
                {urgencyOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex items-center gap-2">
                      {option.label}
                      <Badge variant={option.color as any} className="text-xs">
                        {option.value.toUpperCase()}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Location & Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius</Label>
              <Select value={locationRadius} onValueChange={setLocationRadius}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                  <SelectItem value="250">250 miles</SelectItem>
                  <SelectItem value="nationwide">Nationwide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any other preferences, payment methods, timeline details..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Potential Matches Preview */}
        {brand && model && maxBudget && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Potential Matches Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {potentialMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div>
                    <h4 className="font-medium">{match.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${match.price} • {match.condition} • by {match.seller}
                    </p>
                  </div>
                  <Badge variant="secondary">{match.matchScore}% match</Badge>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                Post your request to contact these sellers directly
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/hot-deals-hub')}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmitRequest}
          >
            <Users className="w-4 h-4 mr-2" />
            Post Buyer Request
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HotBuyerRequest;