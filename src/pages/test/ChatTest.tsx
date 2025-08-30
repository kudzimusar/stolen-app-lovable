import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveChatWidget } from "@/components/ui/LiveChatWidget";
import { aiChatUpdateService } from "@/lib/services/ai-chat-update-service";
import { 
  MessageCircle, 
  Bot, 
  Sparkles, 
  Shield, 
  Zap,
  Smartphone,
  ShoppingCart,
  Search,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const ChatTest = () => {
  const [testQueries] = useState([
    "How do I register a device?",
    "What is the Reverse Verification Tool?",
    "How does S-Pay work?",
    "I lost my phone, what should I do?",
    "How do I check if a device is stolen?",
    "Tell me about the marketplace",
    "What is AI fraud detection?",
    "How secure is the blockchain?",
    "I need help with insurance",
    "How do I find a repair shop?"
  ]);

  const stats = aiChatUpdateService.getUpdateStats();
  const platformChanges = aiChatUpdateService.getPlatformChangesSummary();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">STOLEN AI Chat Test</h1>
          <p className="text-xl text-muted-foreground">
            Testing the enhanced AI-powered live chat with Google Gemini integration
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Updates</p>
                <p className="text-2xl font-bold">{stats.totalUpdates}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Updates</p>
                <p className="text-2xl font-bold">{stats.activeUpdates}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{stats.byPriority.high || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{stats.byPriority.critical || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Services Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Services Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-medium">Google Gemini AI</p>
                <p className="text-sm text-muted-foreground">Primary AI service</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Bot className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium">Local AI (Ollama)</p>
                <p className="text-sm text-muted-foreground">Fallback service</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-gray-500" />
              <div>
                <p className="font-medium">Enhanced Fallback</p>
                <p className="text-sm text-muted-foreground">Keyword matching</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Test Queries */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Queries</h2>
          <p className="text-muted-foreground mb-4">
            Click on any query below to test the AI chat response. The chat widget will appear in the bottom right corner.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-4 text-left"
                onClick={() => {
                  // This would trigger the chat widget to open with the query
                  console.log("Test query:", query);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {index % 4 === 0 && <Smartphone className="w-4 h-4 text-blue-500" />}
                    {index % 4 === 1 && <Search className="w-4 h-4 text-green-500" />}
                    {index % 4 === 2 && <ShoppingCart className="w-4 h-4 text-purple-500" />}
                    {index % 4 === 3 && <Shield className="w-4 h-4 text-orange-500" />}
                  </div>
                  <span className="text-sm">{query}</span>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Platform Changes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Platform Changes</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{platformChanges.total}</p>
                <p className="text-sm text-muted-foreground">Total Changes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{platformChanges.recent.length}</p>
                <p className="text-sm text-muted-foreground">Last 30 Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {platformChanges.byImpact.high || 0}
                </p>
                <p className="text-sm text-muted-foreground">High Impact</p>
              </div>
            </div>
            
            {platformChanges.recent.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Recent Changes:</h3>
                {platformChanges.recent.slice(0, 3).map((change, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Badge variant="outline" className="text-xs">
                      {change.category}
                    </Badge>
                    <span className="text-sm">{change.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Features Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enhanced Chat Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">AI Integration</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Google Gemini AI for intelligent responses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Local AI fallback with Ollama
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Enhanced keyword matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Context-aware responses
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Update Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Real-time platform updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority-based response selection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Automatic update detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Admin interface for management
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">How to Test</h2>
          <div className="space-y-3 text-blue-800">
            <p className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">1.</span>
              <span>Look for the chat widget in the bottom right corner of your screen</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">2.</span>
              <span>Click on the chat icon to open the AI support assistant</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">3.</span>
              <span>Try asking questions about STOLEN platform features, or use the test queries above</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">4.</span>
              <span>Notice the AI model indicator and confidence scores in responses</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">5.</span>
              <span>Use the suggestion buttons and action buttons for interactive responses</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default ChatTest;
