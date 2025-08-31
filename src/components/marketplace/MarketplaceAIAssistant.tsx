import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Brain, 
  Sparkles, 
  Send, 
  Mic, 
  Minimize2,
  Maximize2,
  X,
  ShoppingCart,
  Search,
  Shield,
  TrendingUp,
  MapPin,
  Star,
  Zap,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiMarketplaceService } from '@/lib/services/ai-marketplace-service';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'action' | 'recommendation';
  data?: any;
  suggestions?: string[];
  actions?: Array<{ label: string; action: string; data?: any }>;
}

interface MarketplaceAIAssistantProps {
  currentPage?: string;
  currentDevice?: any;
  userContext?: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MarketplaceAIAssistant: React.FC<MarketplaceAIAssistantProps> = ({
  currentPage = 'marketplace',
  currentDevice,
  userContext,
  isOpen = false,
  onClose
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hi! I'm your AI marketplace assistant. I can help you with device recommendations, pricing analysis, verification guidance, and marketplace navigation. What can I help you with today?`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        suggestions: [
          'Find devices for me',
          'Check if a device is authentic',
          'Compare device prices',
          'Help me sell my device',
          'Explain trust scores'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response
      const aiResponse = await aiMarketplaceService.getAIMarketplaceAssistance(
        message,
        {
          currentPage,
          userPreferences: userContext?.preferences,
          viewingDevice: currentDevice
        }
      );

      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle specific AI actions
      if (aiResponse.actions?.length > 0) {
        handleAIActions(aiResponse.actions);
      }

    } catch (error) {
      console.error('AI assistance error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing your request. Please try again or contact our support team.",
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAIActions = (actions: Array<{ label: string; action: string; data?: any }>) => {
    actions.forEach(action => {
      switch (action.action) {
        case 'show_recommendations':
          loadRecommendations();
          break;
        case 'show_price_history':
          if (currentDevice) {
            showPriceAnalysis(currentDevice);
          }
          break;
        case 'verify_device':
          showVerificationOptions();
          break;
        case 'show_trust_info':
          showTrustInformation();
          break;
        default:
          console.log('Unknown action:', action.action);
      }
    });
  };

  const loadRecommendations = async () => {
    try {
      const recommendations = await aiMarketplaceService.getPersonalizedRecommendations(
        'user-123',
        userContext?.preferences
      );

      const recMessage: Message = {
        id: Date.now().toString(),
        text: `I found ${recommendations.length} personalized recommendations for you:`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'recommendation',
        data: recommendations.slice(0, 3)
      };

      setMessages(prev => [...prev, recMessage]);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const showPriceAnalysis = (device: any) => {
    const analysisMessage: Message = {
      id: Date.now().toString(),
      text: `Here's the price analysis for ${device.title}:`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'action',
      data: {
        type: 'price_analysis',
        currentPrice: device.price,
        marketAverage: device.price * 1.1,
        trend: 'decreasing',
        recommendation: 'Good time to buy - price is below market average'
      }
    };

    setMessages(prev => [...prev, analysisMessage]);
  };

  const showVerificationOptions = () => {
    const verificationMessage: Message = {
      id: Date.now().toString(),
      text: "I can help you verify this device using multiple methods:",
      sender: 'assistant',
      timestamp: new Date(),
      type: 'action',
      actions: [
        { label: 'Scan QR Code', action: 'qr_scan' },
        { label: 'Enter Serial Number', action: 'serial_input' },
        { label: 'Upload Document', action: 'document_upload' },
        { label: 'Image Recognition', action: 'image_scan' }
      ]
    };

    setMessages(prev => [...prev, verificationMessage]);
  };

  const showTrustInformation = () => {
    const trustMessage: Message = {
      id: Date.now().toString(),
      text: "Trust scores are calculated based on multiple factors:",
      sender: 'assistant',
      timestamp: new Date(),
      type: 'action',
      data: {
        type: 'trust_explanation',
        factors: [
          { name: 'Ownership History', weight: 30, status: 'verified' },
          { name: 'Device Verification', weight: 25, status: 'verified' },
          { name: 'Seller Reputation', weight: 20, status: 'verified' },
          { name: 'No Theft Reports', weight: 15, status: 'clean' },
          { name: 'Documentation', weight: 10, status: 'complete' }
        ]
      }
    };

    setMessages(prev => [...prev, trustMessage]);
  };

  const getQuickActions = () => {
    const baseActions = [
      { icon: <Search className="w-4 h-4" />, label: 'Find Devices', message: 'Help me find the perfect device for my needs' },
      { icon: <Shield className="w-4 h-4" />, label: 'Verify Device', message: 'How do I verify if a device is authentic?' },
      { icon: <TrendingUp className="w-4 h-4" />, label: 'Price Check', message: 'Is this device priced fairly?' },
      { icon: <Star className="w-4 h-4" />, label: 'Get Recommendations', message: 'Show me personalized recommendations' }
    ];

    if (currentPage === 'product' && currentDevice) {
      return [
        { icon: <Shield className="w-4 h-4" />, label: 'Verify This Device', message: `Help me verify ${currentDevice.title}` },
        { icon: <TrendingUp className="w-4 h-4" />, label: 'Price Analysis', message: `Analyze the price of ${currentDevice.title}` },
        { icon: <ShoppingCart className="w-4 h-4" />, label: 'Buy Safely', message: 'What should I check before buying this device?' },
        { icon: <MapPin className="w-4 h-4" />, label: 'Local Options', message: 'Find similar devices near me' }
      ];
    }

    return baseActions;
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        }`}>
          <p className="text-sm">{message.text}</p>
          
          {/* Render recommendations */}
          {message.type === 'recommendation' && message.data && (
            <div className="mt-3 space-y-2">
              {message.data.map((rec: any, idx: number) => (
                <div key={idx} className="p-2 bg-background rounded border">
                  <div className="flex items-center gap-2">
                    <img src={rec.image} alt={rec.title} className="w-8 h-8 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(rec.price)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(rec.confidence * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render price analysis */}
          {message.data?.type === 'price_analysis' && (
            <div className="mt-3 p-2 bg-background rounded border">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Current: {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(message.data.currentPrice)}</div>
                <div>Market Avg: {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(message.data.marketAverage)}</div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">{message.data.recommendation}</span>
              </div>
            </div>
          )}

          {/* Render trust explanation */}
          {message.data?.type === 'trust_explanation' && (
            <div className="mt-3 space-y-1">
              {message.data.factors.map((factor: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span>{factor.name}</span>
                  <div className="flex items-center gap-1">
                    <span>{factor.weight}%</span>
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {message.suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {/* Render action buttons */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-3 space-y-1">
              {message.actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => handleSendMessage(action.label)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <div className="relative">
          <Brain className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      </Button>
    );
  }

  return (
    <Card className={`fixed z-50 shadow-xl transition-all duration-300 ${
      isMinimized 
        ? 'bottom-6 right-6 w-80 h-16' 
        : 'bottom-6 right-6 w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Marketplace Helper</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setIsExpanded(false);
              onClose?.();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
            {messages.map(renderMessage)}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && messages.length <= 1 && (
            <div className="p-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                {getQuickActions().map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 justify-start"
                    onClick={() => {
                      setShowQuickActions(false);
                      handleSendMessage(action.message);
                    }}
                  >
                    {action.icon}
                    <span className="ml-1 truncate">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about the marketplace..."
                className="flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                className="h-9 w-9"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
