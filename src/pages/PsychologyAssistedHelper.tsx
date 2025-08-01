import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Brain, Shield, MessageCircle, TrendingUp, CheckCircle, AlertTriangle, Info } from "lucide-react";

const PsychologyAssistedHelper = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [confidenceScore] = useState(95);
  const { toast } = useToast();

  const educationWidgets = [
    {
      title: "How to Read Verification Badges",
      content: "Look for the blue checkmark next to device listings. This indicates the device has been verified on the blockchain.",
      icon: <Shield className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Understanding Confidence Scores",
      content: "Our AI analyzes multiple factors to generate a confidence score. Scores above 90% indicate very safe purchases.",
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      title: "Red Flags to Watch For",
      content: "Be cautious of prices significantly below market value, missing documentation, or sellers with low ratings.",
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  ];

  const riskFactors = [
    { factor: "Device History", status: "Clean", risk: "low" },
    { factor: "Seller Rating", status: "4.8/5 Stars", risk: "low" },
    { factor: "Price Analysis", status: "Market Average", risk: "low" },
    { factor: "Documentation", status: "Complete", risk: "low" },
    { factor: "Ownership Chain", status: "Verified", risk: "low" }
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast({
      title: "AI Assistant",
      description: "Based on the listing details, this appears to be a legitimate sale. The high confidence score and clean history indicate low risk."
    });
    setChatMessage("");
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Purchase Confidence Assistant</h1>
          <p className="text-muted-foreground">AI-powered guidance to help you make safe purchases</p>
        </div>

        {/* Confidence Score */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle>AI Confidence Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Purchase Safety</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {confidenceScore}% Confident
                </Badge>
              </div>
              <Progress value={confidenceScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                This listing has been analyzed and shows strong indicators of authenticity. 
                The device has a clean history and the seller is verified.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
            <CardDescription>Detailed breakdown of key safety factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getRiskIcon(factor.risk)}
                    <span className="font-medium">{factor.factor}</span>
                  </div>
                  <span className={`text-sm ${getRiskColor(factor.risk)}`}>
                    {factor.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Widgets */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Education</CardTitle>
            <CardDescription>Learn how to identify safe purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {educationWidgets.map((widget, index) => (
                <div key={index} className="flex space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {widget.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{widget.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{widget.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Chat Assistant */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle>Ask the AI Assistant</CardTitle>
            </div>
            <CardDescription>Get personalized buying advice for this listing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Try asking: "Is this a good deal?", "What should I check before buying?", 
                  or "Are there any red flags?"
                </p>
              </div>
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Ask about this listing..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={handleSendMessage} className="self-end">
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Pro Tip</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Always meet in a public place for device exchanges and test the device thoroughly 
                  before completing the purchase through STOLEN Pay.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PsychologyAssistedHelper;