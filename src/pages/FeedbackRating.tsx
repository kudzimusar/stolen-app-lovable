import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Send, TrendingUp, Users, Lightbulb } from "lucide-react";

const FeedbackRating = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const { toast } = useToast();

  const recentTransactions = [
    {
      id: "1",
      type: "Purchase",
      item: "iPhone 15 Pro",
      seller: "TechDeals Store",
      date: "2024-01-20",
      status: "completed",
      canRate: true
    },
    {
      id: "2", 
      type: "Sale",
      item: "MacBook Air M2",
      buyer: "Sarah M.",
      date: "2024-01-18",
      status: "completed",
      canRate: true
    }
  ];

  const handleRatingSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Rating Submitted",
      description: "Thank you for your feedback! It helps improve our marketplace."
    });
    
    setRating(0);
    setFeedback("");
  };

  const handleSuggestionSubmit = () => {
    if (!suggestion.trim()) {
      toast({
        title: "Suggestion Required",
        description: "Please enter your feature suggestion.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Suggestion Submitted",
      description: "Thank you for your suggestion! Our team will review it."
    });
    
    setSuggestion("");
  };

  const StarRating = ({ value, onChange, readonly = false }: { 
    value: number; 
    onChange?: (rating: number) => void; 
    readonly?: boolean;
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= (hoveredRating || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Feedback & Ratings</h1>
          <p className="text-muted-foreground">
            Help us improve STOLEN by sharing your experience and suggestions
          </p>
        </div>

        <Tabs defaultValue="rate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rate">Rate Transactions</TabsTrigger>
            <TabsTrigger value="suggest">Feature Suggestions</TabsTrigger>
            <TabsTrigger value="community">Community Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="rate" className="space-y-6">
            {/* Quick Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Rate Your Experience</span>
                </CardTitle>
                <CardDescription>How was your overall experience with STOLEN?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Your Rating:</span>
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <Badge variant="secondary">
                      {rating} Star{rating > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <Textarea
                  placeholder="Tell us about your experience (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
                
                <Button onClick={handleRatingSubmit} className="w-full">
                  Submit Rating
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Rate your recent marketplace activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{transaction.item}</h4>
                        <p className="text-sm text-muted-foreground">
                          {transaction.type === "Purchase" 
                            ? `Purchased from ${transaction.seller}` 
                            : `Sold to ${transaction.buyer}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                        {transaction.canRate && (
                          <Button size="sm" variant="outline">
                            Rate {transaction.type}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Feature Suggestions</span>
                </CardTitle>
                <CardDescription>
                  Share your ideas to help us improve the STOLEN platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Suggestion title..."
                  className="font-medium"
                />
                
                <Textarea
                  placeholder="Describe your feature suggestion in detail..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={4}
                />
                
                <div className="flex items-center space-x-2">
                  <Button onClick={handleSuggestionSubmit}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Suggestion
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    We review all suggestions
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Popular Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Suggestions</CardTitle>
                <CardDescription>See what other users are requesting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "Mobile app notifications", votes: 24, status: "In Progress" },
                    { title: "Bulk device registration", votes: 18, status: "Planned" },
                    { title: "Enhanced search filters", votes: 12, status: "Under Review" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.votes} votes</p>
                      </div>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Platform Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Users</span>
                      <span className="font-medium">12,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Devices Registered</span>
                      <span className="font-medium">8,923</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Successful Recoveries</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <div className="flex items-center space-x-1">
                        <StarRating value={4} readonly />
                        <span className="text-sm">4.6/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Community Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-green-600">147</p>
                      <p className="text-sm">Devices Recovered</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Community Rewards</p>
                      <p className="text-xl font-bold">$2,847</p>
                      <p className="text-sm">Paid to Finders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <span>User Testimonials</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      text: "STOLEN helped me recover my laptop within 2 days! The community is amazing.",
                      author: "Sarah M.",
                      rating: 5
                    },
                    {
                      text: "As a retailer, the bulk registration feature saves us hours every week.",
                      author: "TechStore Pro",
                      rating: 5
                    }
                  ].map((testimonial, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{testimonial.author}</span>
                        <StarRating value={testimonial.rating} readonly />
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackRating;