// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  ArrowLeft, 
  Settings, 
  TrendingUp, 
  Clock, 
  Target,
  Zap,
  Shield,
  Leaf,
  DollarSign
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import TransferSuggestionDashboard from '@/components/ai/TransferSuggestionDashboard';
import { TransferSuggestion } from '@/lib/ai-transfer-suggestion-engine';

const AITransferSuggestions: React.FC = () => {
  const [userId, setUserId] = useState<string>('mock-user-id');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, get the actual user ID from auth context
    setUserId('mock-user-id');
    setIsLoading(false);
  }, []);

  const handleTransferInitiated = (suggestion: TransferSuggestion) => {
    console.log('🚀 Transfer initiated from AI suggestion:', suggestion);
    
    // Navigate to appropriate transfer page based on suggestion type
    switch (suggestion.suggestionType) {
      case 'upgrade':
        navigate('/device-transfer', { 
          state: { 
            deviceId: suggestion.deviceId, 
            transferType: 'upgrade',
            aiSuggestion: suggestion 
          } 
        });
        break;
      case 'donate':
        navigate('/transfer-donate', { 
          state: { 
            deviceId: suggestion.deviceId, 
            transferType: 'donation',
            aiSuggestion: suggestion 
          } 
        });
        break;
      case 'sell':
        navigate('/marketplace', { 
          state: { 
            deviceId: suggestion.deviceId, 
            action: 'list',
            aiSuggestion: suggestion 
          } 
        });
        break;
      case 'gift':
        navigate('/device-transfer', { 
          state: { 
            deviceId: suggestion.deviceId, 
            transferType: 'gift',
            aiSuggestion: suggestion 
          } 
        });
        break;
      case 'recycle':
        navigate('/transfer-donate', { 
          state: { 
            deviceId: suggestion.deviceId, 
            transferType: 'recycle',
            aiSuggestion: suggestion 
          } 
        });
        break;
      case 'repair':
        navigate('/repair-services', { 
          state: { 
            deviceId: suggestion.deviceId, 
            aiSuggestion: suggestion 
          } 
        });
        break;
      default:
        navigate('/device-transfer', { 
          state: { 
            deviceId: suggestion.deviceId, 
            aiSuggestion: suggestion 
          } 
        });
    }

    toast({
      title: "Transfer Initiated",
      description: `Starting ${suggestion.suggestionType} process for your device.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading AI Transfer Suggestions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  AI Transfer Suggestions
                </h1>
                <p className="text-muted-foreground">
                  Intelligent recommendations for your device transfers
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* AI Features Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Zap className="w-5 h-5" />
                AI-Powered Transfer Intelligence
              </CardTitle>
              <CardDescription className="text-blue-700">
                Our advanced AI analyzes your devices, behavior, and market conditions to provide personalized transfer recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Smart Analysis</h4>
                    <p className="text-sm text-blue-700">
                      Analyzes device age, condition, usage patterns, and market trends
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-900">Personalized Recommendations</h4>
                    <p className="text-sm text-purple-700">
                      Tailored suggestions based on your behavior and preferences
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Optimal Timing</h4>
                    <p className="text-sm text-green-700">
                      Suggests the best time to transfer for maximum value
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Why Use AI Transfer Suggestions?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-medium">Maximize Value</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get the best possible return on your devices through optimal timing and pricing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Save Time</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Skip the research - AI analyzes market conditions and suggests the best actions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Reduce Risk</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Make informed decisions with confidence scores and risk assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Leaf className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="font-medium">Environmental Impact</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contribute to sustainability through smart device lifecycle management
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* AI Suggestions Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Personalized Suggestions</h2>
            <Badge variant="outline" className="text-xs">
              AI Powered
            </Badge>
          </div>
          
          <TransferSuggestionDashboard
            userId={userId}
            onTransferInitiated={handleTransferInitiated}
          />
        </div>

        {/* How It Works */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>How AI Transfer Suggestions Work</CardTitle>
              <CardDescription>
                Understanding the AI analysis process and how recommendations are generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Device Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes your device's age, condition, usage patterns, and market value
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Behavior Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Learns from your transfer history, preferences, and marketplace activity
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Smart Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Generates personalized suggestions with confidence scores and timing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Security */}
        <div className="mb-8">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Data Protection</h4>
                  <p className="text-muted-foreground">
                    All device and user data is encrypted and processed securely. We never share your personal information with third parties.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">AI Transparency</h4>
                  <p className="text-muted-foreground">
                    Every suggestion includes a confidence score and reasoning, so you understand why the AI made each recommendation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-4">
                Let AI help you make the most of your devices with intelligent transfer suggestions.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link to="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/my-devices">
                    View My Devices
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITransferSuggestions;
