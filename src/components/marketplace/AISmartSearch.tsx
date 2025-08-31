import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Brain, 
  Sparkles, 
  Mic, 
  Camera, 
  Filter,
  TrendingUp,
  Clock,
  MapPin,
  Zap,
  Eye,
  Star,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { aiMarketplaceService } from '@/lib/services/ai-marketplace-service';
import { debounce } from 'lodash';

interface AISmartSearchProps {
  onSearch?: (query: string, filters?: any) => void;
  placeholder?: string;
  showAdvanced?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface SearchSuggestion {
  query: string;
  type: 'product' | 'brand' | 'category' | 'model' | 'ai_suggestion';
  confidence: number;
  results_count: number;
  trending?: boolean;
  icon?: React.ReactNode;
}

export const AISmartSearch: React.FC<AISmartSearchProps> = ({
  onSearch,
  placeholder = "Search with AI assistance...",
  showAdvanced = true,
  size = 'md'
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [aiAssistanceOpen, setAiAssistanceOpen] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [smartFilters, setSmartFilters] = useState<any[]>([]);

  // Load search history on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('search_history') || '[]');
    setSearchHistory(history.slice(0, 5)); // Keep last 5 searches
  }, []);

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Get AI-powered suggestions
        const aiSuggestions = await aiMarketplaceService.getSmartSearchSuggestions(searchQuery, 8);
        
        // Add AI assistance suggestions
        const enhancedSuggestions: SearchSuggestion[] = [
          ...aiSuggestions.map(s => ({
            ...s,
            icon: getTypeIcon(s.type)
          })),
          {
            query: `AI: Find "${searchQuery}" with best value`,
            type: 'ai_suggestion' as const,
            confidence: 0.9,
            results_count: 0,
            icon: <Brain className="w-4 h-4" />
          },
          {
            query: `AI: Compare "${searchQuery}" prices`,
            type: 'ai_suggestion' as const,
            confidence: 0.85,
            results_count: 0,
            icon: <TrendingUp className="w-4 h-4" />
          }
        ];

        setSuggestions(enhancedSuggestions);
      } catch (error) {
        console.error('Failed to get search suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length > 2) {
      debouncedGetSuggestions(query);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, debouncedGetSuggestions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Search className="w-4 h-4" />;
      case 'brand':
        return <Star className="w-4 h-4" />;
      case 'category':
        return <Filter className="w-4 h-4" />;
      case 'model':
        return <Eye className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Handle AI suggestions
    if (searchQuery.startsWith('AI: ')) {
      await handleAIAssistance(searchQuery);
      return;
    }

    // Save to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));

    // Perform search
    onSearch?.(searchQuery);
    setShowSuggestions(false);

    // Navigate to marketplace with search
    navigate(`/marketplace?q=${encodeURIComponent(searchQuery)}`);

    toast({
      title: 'Smart Search Active',
      description: `Searching for "${searchQuery}" with AI enhancements`,
      variant: 'default'
    });
  };

  const handleAIAssistance = async (aiQuery: string) => {
    setAiAssistanceOpen(true);
    try {
      const assistance = await aiMarketplaceService.getAIMarketplaceAssistance(
        aiQuery.replace('AI: ', ''),
        { currentPage: 'search' }
      );
      
      // Process AI assistance response
      toast({
        title: 'AI Assistant',
        description: assistance.response,
        variant: 'default'
      });
    } catch (error) {
      console.error('AI assistance failed:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSearch(suggestions[selectedIndex].query);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceSearchActive(true);
        toast({
          title: 'Voice Search Active',
          description: 'Listening... speak your search query',
          variant: 'default'
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };

      recognition.onerror = () => {
        toast({
          title: 'Voice Search Error',
          description: 'Unable to process voice input',
          variant: 'destructive'
        });
      };

      recognition.onend = () => {
        setVoiceSearchActive(false);
      };

      recognition.start();
    } else {
      toast({
        title: 'Voice Search Unavailable',
        description: 'Your browser does not support voice search',
        variant: 'destructive'
      });
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-10 text-sm';
      case 'lg':
        return 'h-14 text-lg';
      default:
        return 'h-12 text-base';
    }
  };

  return (
    <div className="relative w-full">
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`pl-12 pr-24 ${getSizeClasses()}`}
        />
        
        {/* Action Buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showAdvanced && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={startVoiceSearch}
                disabled={voiceSearchActive}
              >
                <Mic className={`w-4 h-4 ${voiceSearchActive ? 'text-red-500' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setAiAssistanceOpen(true)}
              >
                <Brain className="w-4 h-4 text-purple-600" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Smart Suggestions Dropdown */}
      {showSuggestions && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-hidden">
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center">
                  <Brain className="w-6 h-6 text-purple-600 animate-pulse mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">AI is thinking...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No suggestions found</p>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  {/* AI Suggestions */}
                  <CommandGroup heading="AI Suggestions">
                    {suggestions.filter(s => s.type === 'ai_suggestion').map((suggestion, idx) => (
                      <CommandItem
                        key={`ai-${idx}`}
                        value={suggestion.query}
                        onSelect={() => handleSearch(suggestion.query)}
                        className={`cursor-pointer ${selectedIndex === idx ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-1 rounded bg-purple-100">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{suggestion.query}</span>
                          </div>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {/* Regular Suggestions */}
                  <CommandGroup heading="Suggestions">
                    {suggestions.filter(s => s.type !== 'ai_suggestion').map((suggestion, idx) => (
                      <CommandItem
                        key={`reg-${idx}`}
                        value={suggestion.query}
                        onSelect={() => handleSearch(suggestion.query)}
                        className={`cursor-pointer ${selectedIndex === idx + suggestions.filter(s => s.type === 'ai_suggestion').length ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="text-muted-foreground">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1">
                            <span>{suggestion.query}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type}
                              </Badge>
                              {suggestion.results_count > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {suggestion.results_count} results
                                </span>
                              )}
                            </div>
                          </div>
                          {suggestion.trending && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <CommandGroup heading="Recent Searches">
                      {searchHistory.map((historyItem, idx) => (
                        <CommandItem
                          key={`history-${idx}`}
                          value={historyItem}
                          onSelect={() => handleSearch(historyItem)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{historyItem}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </Card>
      )}

      {/* AI Assistance Dialog */}
      <Dialog open={aiAssistanceOpen} onOpenChange={setAiAssistanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Search Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              I can help you find exactly what you're looking for with intelligent search and recommendations.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Try these AI-powered searches:</h4>
              <div className="grid gap-2">
                {[
                  'Find best value phones under R15,000',
                  'Compare iPhone vs Samsung flagship',
                  'Gaming laptops with RTX graphics',
                  'Devices perfect for students'
                ].map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                      setAiAssistanceOpen(false);
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
