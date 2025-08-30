import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Filter, 
  RefreshCw, 
  Settings,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TransferSuggestionCard from './TransferSuggestionCard';
import { 
  aiTransferEngine, 
  TransferSuggestion 
} from '@/lib/ai/ai-transfer-suggestion-engine';
import { 
  smartPromptEngine, 
  TransferPrompt 
} from '@/lib/ai/smart-transfer-prompt-engine';
import { 
  timingOptimizer, 
  TransferTiming 
} from '@/lib/ai/transfer-timing-optimizer';

interface TransferSuggestionDashboardProps {
  userId: string;
  onTransferInitiated: (suggestion: TransferSuggestion) => void;
}

interface SuggestionWithContext {
  suggestion: TransferSuggestion;
  prompt?: TransferPrompt;
  timing?: TransferTiming;
  status: 'new' | 'viewed' | 'acted_upon' | 'dismissed';
  timestamp: Date;
}

const TransferSuggestionDashboard: React.FC<TransferSuggestionDashboardProps> = ({
  userId,
  onTransferInitiated
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  // Load suggestions on component mount
  useEffect(() => {
    loadSuggestions();
  }, [userId]);

  // Load AI transfer suggestions
  const loadSuggestions = async () => {
    try {
      setLoading(true);
      console.log('🤖 Loading AI transfer suggestions...');

      // Get AI suggestions
      const aiSuggestions = await aiTransferEngine.generateSuggestions(userId);
      
      // Enhance suggestions with prompts and timing
      const enhancedSuggestions: SuggestionWithContext[] = await Promise.all(
        aiSuggestions.map(async (suggestion) => {
          try {
            const [prompt, timing] = await Promise.all([
              smartPromptEngine.generatePersonalizedPrompt(userId, suggestion.deviceId, suggestion),
              timingOptimizer.getOptimalTransferTime(suggestion.deviceId)
            ]);

            return {
              suggestion,
              prompt,
              timing,
              status: 'new' as const,
              timestamp: new Date()
            };
          } catch (error) {
            console.error(`Error enhancing suggestion ${suggestion.deviceId}:`, error);
            return {
              suggestion,
              status: 'new' as const,
              timestamp: new Date()
            };
          }
        })
      );

      setSuggestions(enhancedSuggestions);
      console.log(`✅ Loaded ${enhancedSuggestions.length} AI suggestions`);

    } catch (error) {
      console.error('❌ Error loading suggestions:', error);
      toast({
        title: "Error Loading Suggestions",
        description: "Failed to load AI transfer suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh suggestions
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSuggestions();
    setRefreshing(false);
    toast({
      title: "Suggestions Refreshed",
      description: "AI suggestions have been updated with latest data.",
    });
  };

  // Handle suggestion action
  const handleSuggestionAction = async (suggestion: TransferSuggestion, action: string) => {
    try {
      console.log(`🎯 User action on suggestion: ${action}`);

      // Update suggestion status
      setSuggestions(prev => prev.map(s => 
        s.suggestion.deviceId === suggestion.deviceId 
          ? { ...s, status: 'acted_upon' }
          : s
      ));

      // Handle different actions
      switch (action) {
        case 'primary':
          // Initiate transfer based on suggestion type
          await initiateTransfer(suggestion);
          break;
        case 'secondary':
          // Show more details
          await showMoreDetails(suggestion);
          break;
        default:
          console.log('Unknown action:', action);
      }

      toast({
        title: "Action Completed",
        description: `Successfully processed ${suggestion.suggestionType} suggestion.`,
      });

    } catch (error) {
      console.error('❌ Error handling suggestion action:', error);
      toast({
        title: "Action Failed",
        description: "Failed to process suggestion. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Dismiss suggestion
  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.suggestion.deviceId === suggestionId 
        ? { ...s, status: 'dismissed' }
        : s
    ));

    toast({
      title: "Suggestion Dismissed",
      description: "Suggestion has been dismissed and won't show again.",
    });
  };

  // Learn more about suggestion
  const handleLearnMore = (suggestion: TransferSuggestion) => {
    console.log('📚 Showing more details for suggestion:', suggestion.deviceId);
    // In a real implementation, this would open a detailed modal or navigate to a page
    toast({
      title: "More Information",
      description: "Detailed information about this suggestion is being prepared.",
    });
  };

  // Initiate transfer based on suggestion
  const initiateTransfer = async (suggestion: TransferSuggestion) => {
    console.log(`🚀 Initiating transfer for suggestion: ${suggestion.suggestionType}`);
    
    // Call the parent callback
    onTransferInitiated(suggestion);
    
    // In a real implementation, this would navigate to the appropriate transfer page
    // or open a transfer modal based on the suggestion type
  };

  // Show more details
  const showMoreDetails = async (suggestion: TransferSuggestion) => {
    console.log(`📋 Showing detailed analysis for: ${suggestion.deviceId}`);
    // This would open a detailed modal with comprehensive analysis
  };

  // Filter suggestions based on active tab and filter
  const getFilteredSuggestions = () => {
    let filtered = suggestions;

    // Filter by tab
    switch (activeTab) {
      case 'urgent':
        filtered = filtered.filter(s => s.suggestion.urgency === 'high');
        break;
      case 'recent':
        filtered = filtered.filter(s => 
          new Date().getTime() - s.timestamp.getTime() < 24 * 60 * 60 * 1000
        );
        break;
      case 'acted':
        filtered = filtered.filter(s => s.status === 'acted_upon');
        break;
      case 'dismissed':
        filtered = filtered.filter(s => s.status === 'dismissed');
        break;
      default:
        // 'all' - show all non-dismissed suggestions
        filtered = filtered.filter(s => s.status !== 'dismissed');
    }

    // Additional filter
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.suggestion.suggestionType === filter);
    }

    return filtered;
  };

  // Get suggestion statistics
  const getStats = () => {
    const total = suggestions.length;
    const urgent = suggestions.filter(s => s.suggestion.urgency === 'high').length;
    const acted = suggestions.filter(s => s.status === 'acted_upon').length;
    const dismissed = suggestions.filter(s => s.status === 'dismissed').length;

    return { total, urgent, acted, dismissed };
  };

  const stats = getStats();
  const filteredSuggestions = getFilteredSuggestions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading AI suggestions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Transfer Suggestions
          </h2>
          <p className="text-muted-foreground">
            Intelligent recommendations for your device transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suggestions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acted Upon</p>
                <p className="text-2xl font-bold text-green-600">{stats.acted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dismissed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.dismissed}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total - stats.dismissed})</TabsTrigger>
              <TabsTrigger value="urgent">Urgent ({stats.urgent})</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="acted">Acted Upon ({stats.acted})</TabsTrigger>
              <TabsTrigger value="dismissed">Dismissed ({stats.dismissed})</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="all">All Types</option>
                <option value="upgrade">Upgrade</option>
                <option value="donate">Donate</option>
                <option value="sell">Sell</option>
                <option value="gift">Gift</option>
                <option value="recycle">Recycle</option>
                <option value="repair">Repair</option>
              </select>
            </div>
          </div>

          {/* Tab Contents */}
          <TabsContent value="all" className="space-y-4">
            {filteredSuggestions.length === 0 ? (
              <Card className="p-8 text-center">
                <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Suggestions Available</h3>
                <p className="text-muted-foreground">
                  AI is analyzing your devices. Check back soon for personalized recommendations.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSuggestions.map((suggestionWithContext) => (
                  <TransferSuggestionCard
                    key={suggestionWithContext.suggestion.deviceId}
                    suggestion={suggestionWithContext.suggestion}
                    prompt={suggestionWithContext.prompt}
                    timing={suggestionWithContext.timing}
                    onAction={handleSuggestionAction}
                    onDismiss={handleDismissSuggestion}
                    onLearnMore={handleLearnMore}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="urgent" className="space-y-4">
            <div className="grid gap-4">
              {filteredSuggestions.map((suggestionWithContext) => (
                <TransferSuggestionCard
                  key={suggestionWithContext.suggestion.deviceId}
                  suggestion={suggestionWithContext.suggestion}
                  prompt={suggestionWithContext.prompt}
                  timing={suggestionWithContext.timing}
                  onAction={handleSuggestionAction}
                  onDismiss={handleDismissSuggestion}
                  onLearnMore={handleLearnMore}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid gap-4">
              {filteredSuggestions.map((suggestionWithContext) => (
                <TransferSuggestionCard
                  key={suggestionWithContext.suggestion.deviceId}
                  suggestion={suggestionWithContext.suggestion}
                  prompt={suggestionWithContext.prompt}
                  timing={suggestionWithContext.timing}
                  onAction={handleSuggestionAction}
                  onDismiss={handleDismissSuggestion}
                  onLearnMore={handleLearnMore}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="acted" className="space-y-4">
            <div className="grid gap-4">
              {filteredSuggestions.map((suggestionWithContext) => (
                <TransferSuggestionCard
                  key={suggestionWithContext.suggestion.deviceId}
                  suggestion={suggestionWithContext.suggestion}
                  prompt={suggestionWithContext.prompt}
                  timing={suggestionWithContext.timing}
                  onAction={handleSuggestionAction}
                  onDismiss={handleDismissSuggestion}
                  onLearnMore={handleLearnMore}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dismissed" className="space-y-4">
            <div className="grid gap-4">
              {filteredSuggestions.map((suggestionWithContext) => (
                <TransferSuggestionCard
                  key={suggestionWithContext.suggestion.deviceId}
                  suggestion={suggestionWithContext.suggestion}
                  prompt={suggestionWithContext.prompt}
                  timing={suggestionWithContext.timing}
                  onAction={handleSuggestionAction}
                  onDismiss={handleDismissSuggestion}
                  onLearnMore={handleLearnMore}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TransferSuggestionDashboard;
