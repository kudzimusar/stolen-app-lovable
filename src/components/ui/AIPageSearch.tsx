import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Mic, 
  X, 
  ChevronDown, 
  ChevronUp,
  Brain,
  Target,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  element: HTMLElement;
  text: string;
  context: string;
  relevance: number;
  position: { top: number; left: number };
}

interface AIPageSearchProps {
  placeholder?: string;
  className?: string;
  minQueryLength?: number;
  maxResults?: number;
  enableVoiceSearch?: boolean;
  enableAIEnhancement?: boolean;
  searchableSelectors?: string[];
  excludeSelectors?: string[];
}

export const AIPageSearch: React.FC<AIPageSearchProps> = ({
  placeholder = "Search in this page...",
  className,
  minQueryLength = 2,
  maxResults = 10,
  enableVoiceSearch = true,
  enableAIEnhancement = true,
  searchableSelectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'li', 'td', 'th'],
  excludeSelectors = ['script', 'style', 'nav', '.bottom-navigation', '[data-exclude-search]']
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced search with AI-like features
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      clearHighlights();
      return;
    }

    setIsSearching(true);

    try {
      // Get all searchable elements
      const searchableElements: HTMLElement[] = [];
      
      searchableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const element = el as HTMLElement;
          
          // Skip excluded elements
          const isExcluded = excludeSelectors.some(excludeSelector => {
            return element.matches(excludeSelector) || element.closest(excludeSelector);
          });
          
          if (!isExcluded && element.textContent?.trim()) {
            searchableElements.push(element);
          }
        });
      });

      // Enhanced search algorithm
      const searchResults: SearchResult[] = [];
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      // AI-enhanced search with synonyms and related terms
      const searchTerms = enableAIEnhancement 
        ? await getEnhancedSearchTerms(normalizedQuery)
        : [normalizedQuery];

      searchableElements.forEach((element, index) => {
        const text = element.textContent || '';
        const normalizedText = text.toLowerCase();
        
        let relevance = 0;
        let matchedTerm = '';
        
        // Check for matches with different weights
        searchTerms.forEach(term => {
          if (normalizedText.includes(term)) {
            const exactMatch = normalizedText.includes(normalizedQuery);
            const startsWith = normalizedText.startsWith(term);
            const wordBoundary = new RegExp(`\\b${term}\\b`).test(normalizedText);
            
            // Calculate relevance score
            let termRelevance = 0;
            if (exactMatch) termRelevance += 10;
            if (startsWith) termRelevance += 8;
            if (wordBoundary) termRelevance += 6;
            else termRelevance += 3;
            
            // Boost relevance for headings and important elements
            if (element.tagName.match(/^H[1-6]$/)) termRelevance += 5;
            if (element.classList.contains('title') || element.classList.contains('heading')) termRelevance += 3;
            
            if (termRelevance > relevance) {
              relevance = termRelevance;
              matchedTerm = term;
            }
          }
        });

        if (relevance > 0) {
          const rect = element.getBoundingClientRect();
          const context = getTextContext(text, matchedTerm, 50);
          
          searchResults.push({
            id: `search-result-${index}`,
            element,
            text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
            context,
            relevance,
            position: {
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX
            }
          });
        }
      });

      // Sort by relevance and limit results
      const sortedResults = searchResults
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults);

      setResults(sortedResults);
      setCurrentIndex(sortedResults.length > 0 ? 0 : -1);

      // Highlight results
      highlightResults(sortedResults, normalizedQuery);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [minQueryLength, maxResults, enableAIEnhancement, searchableSelectors, excludeSelectors]);

  // Get text context around a match
  const getTextContext = (text: string, term: string, contextLength: number): string => {
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return text.slice(0, contextLength);
    
    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(text.length, index + term.length + contextLength / 2);
    
    let context = text.slice(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  };

  // Enhanced search terms with AI-like expansion
  const getEnhancedSearchTerms = async (query: string): Promise<string[]> => {
    const terms = [query];
    
    // Add common synonyms and variations
    const synonymMap: Record<string, string[]> = {
      'device': ['gadget', 'phone', 'tablet', 'laptop', 'electronics'],
      'stolen': ['theft', 'missing', 'lost', 'taken'],
      'report': ['claim', 'case', 'incident', 'record'],
      'insurance': ['coverage', 'policy', 'protection'],
      'repair': ['fix', 'service', 'maintenance'],
      'marketplace': ['market', 'shop', 'store', 'buy', 'sell']
    };

    Object.entries(synonymMap).forEach(([key, synonyms]) => {
      if (query.includes(key)) {
        terms.push(...synonyms);
      }
      synonyms.forEach(synonym => {
        if (query.includes(synonym)) {
          terms.push(key, ...synonyms.filter(s => s !== synonym));
        }
      });
    });

    return [...new Set(terms)]; // Remove duplicates
  };

  // Highlight search results in the page
  const highlightResults = (results: SearchResult[], query: string) => {
    clearHighlights();
    
    const highlightedElems: HTMLElement[] = [];
    
    results.forEach((result, index) => {
      const element = result.element;
      const text = element.textContent || '';
      
      // Create highlighted version
      const regex = new RegExp(`(${query})`, 'gi');
      const highlightedText = text.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-800 ${index === currentIndex ? 'bg-yellow-300 dark:bg-yellow-700' : ''}" data-search-highlight="${index}">$1</mark>`);
      
      if (highlightedText !== text) {
        element.innerHTML = highlightedText;
        highlightedElems.push(element);
      }
    });
    
    setHighlightedElements(highlightedElems);
  };

  // Clear all highlights
  const clearHighlights = () => {
    highlightedElements.forEach(element => {
      // Restore original text content
      const marks = element.querySelectorAll('mark[data-search-highlight]');
      marks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
          parent.normalize();
        }
      });
    });
    setHighlightedElements([]);
  };

  // Navigate to search result
  const navigateToResult = (index: number) => {
    if (index < 0 || index >= results.length) return;
    
    const result = results[index];
    setCurrentIndex(index);
    
    // Scroll to result with smooth animation
    result.element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // Update highlights to show current selection
    highlightResults(results, query);
    
    // Add temporary highlight animation
    result.element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-75');
    setTimeout(() => {
      result.element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-75');
    }, 2000);
  };

  // Navigate to next/previous result
  const navigateNext = () => {
    const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
    navigateToResult(nextIndex);
  };

  const navigatePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
    navigateToResult(prevIndex);
  };

  // Voice search
  const startVoiceSearch = () => {
    if (!enableVoiceSearch) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onend = () => setIsVoiceActive(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        performSearch(transcript);
      };
      
      recognition.onerror = () => setIsVoiceActive(false);
      
      recognition.start();
    }
  };

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
  }, [performSearch]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setCurrentIndex(-1);
    clearHighlights();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigatePrevious();
          break;
        case 'Enter':
          e.preventDefault();
          if (currentIndex >= 0) {
            navigateToResult(currentIndex);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, results.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHighlights();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Search trigger button */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className={cn("fixed top-20 right-6 z-40 shadow-lg", className)}
          aria-label="Search in page"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}

      {/* Search interface */}
      {isOpen && (
        <Card className="fixed top-20 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] shadow-xl">
          <div className="p-4 space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-20"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {enableVoiceSearch && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startVoiceSearch}
                    disabled={isVoiceActive}
                    className="h-7 w-7"
                  >
                    <Mic className={cn("h-3 w-3", isVoiceActive && "text-red-500")} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-7 w-7"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Results summary */}
            {query && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {isSearching ? 'Searching...' : `${results.length} results`}
                  {enableAIEnhancement && <Brain className="inline h-3 w-3 ml-1 text-purple-500" />}
                </span>
                {results.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={navigatePrevious}
                      className="h-6 w-6"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs px-2">{currentIndex + 1}/{results.length}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={navigateNext}
                      className="h-6 w-6"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {results.slice(0, 5).map((result, index) => (
                  <div
                    key={result.id}
                    onClick={() => navigateToResult(index)}
                    className={cn(
                      "p-2 rounded-md cursor-pointer transition-colors border",
                      index === currentIndex 
                        ? "bg-primary/10 border-primary/20" 
                        : "bg-muted/50 hover:bg-muted border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Target className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {result.element.tagName.toLowerCase()}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {result.context}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Score: {result.relevance}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {results.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    +{results.length - 5} more results
                  </div>
                )}
              </div>
            )}

            {/* No results */}
            {query && !isSearching && results.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

