import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wand2, 
  CheckCircle, 
  X,
  Lightbulb,
  RefreshCw,
  Copy,
  Sparkles,
  Brain,
  ChevronRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AutoFillSuggestion {
  id: string;
  text: string;
  confidence: number;
  category: 'completion' | 'improvement' | 'alternative';
  reasoning?: string;
}

interface AIAutoFillAssistantProps {
  inputValue: string;
  onValueChange: (value: string) => void;
  fieldType: 'title' | 'description' | 'tags' | 'category' | 'features' | 'specifications' | 'general';
  context?: Record<string, any>;
  placeholder?: string;
  maxLength?: number;
  showSuggestions?: boolean;
  className?: string;
}

const AIAutoFillAssistant: React.FC<AIAutoFillAssistantProps> = ({
  inputValue,
  onValueChange,
  fieldType,
  context = {},
  placeholder,
  maxLength,
  showSuggestions = true,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<AutoFillSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);
  const [lastGeneratedFor, setLastGeneratedFor] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (showSuggestions && inputValue.length > 2 && inputValue !== lastGeneratedFor) {
      // Debounce suggestion generation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        generateSuggestions();
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, showSuggestions]);

  const generateSuggestions = async () => {
    if (inputValue.length < 3) return;

    setIsGeneratingSuggestions(true);
    setLastGeneratedFor(inputValue);

    try {
      const suggestions = await generateAISuggestions(inputValue, fieldType, context);
      setSuggestions(suggestions);
      setShowSuggestionPanel(suggestions.length > 0);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const generateAISuggestions = async (
    input: string, 
    type: string, 
    ctx: Record<string, any>
  ): Promise<AutoFillSuggestion[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const suggestions: AutoFillSuggestion[] = [];
    const words = input.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];

    switch (type) {
      case 'title':
        // Product title suggestions
        if (ctx.category === 'smartphones' || input.toLowerCase().includes('phone')) {
          suggestions.push({
            id: 'title_1',
            text: `${input} - Excellent Condition with Original Box`,
            confidence: 85,
            category: 'completion',
            reasoning: 'Adds condition and authenticity details buyers look for'
          });
          suggestions.push({
            id: 'title_2',
            text: `Premium ${input} - Unlocked & Ready to Use`,
            confidence: 80,
            category: 'improvement',
            reasoning: 'Emphasizes premium quality and network compatibility'
          });
        } else if (ctx.category === 'laptops' || input.toLowerCase().includes('laptop')) {
          suggestions.push({
            id: 'title_3',
            text: `${input} - High Performance & Fast SSD`,
            confidence: 88,
            category: 'completion',
            reasoning: 'Highlights key performance features for laptops'
          });
        }
        break;

      case 'description':
        // Description auto-completion
        if (input.toLowerCase().includes('excellent condition')) {
          suggestions.push({
            id: 'desc_1',
            text: `${input} This device has been carefully maintained and shows minimal signs of wear. All functions work perfectly and it has been thoroughly tested.`,
            confidence: 90,
            category: 'completion',
            reasoning: 'Expands on condition with buyer confidence details'
          });
        }
        
        if (input.toLowerCase().includes('original') && !input.includes('box')) {
          suggestions.push({
            id: 'desc_2',
            text: `${input} box and accessories included`,
            confidence: 85,
            category: 'completion',
            reasoning: 'Complete package information increases value'
          });
        }

        if (words.length > 5 && !input.toLowerCase().includes('warranty')) {
          suggestions.push({
            id: 'desc_3',
            text: `${input} Comes with seller warranty for peace of mind.`,
            confidence: 75,
            category: 'improvement',
            reasoning: 'Adding warranty information builds buyer trust'
          });
        }
        break;

      case 'tags': {
        // Tag suggestions
        const commonTags = ['excellent-condition', 'fast-shipping', 'verified-seller', 'original-box', 'unlocked', 'warranty-included'];
        if (ctx.category) {
          commonTags.push(ctx.category, `${ctx.category}-deals`);
        }
        
        commonTags.forEach((tag, index) => {
          if (!input.includes(tag) && tag.toLowerCase().includes(lastWord)) {
            suggestions.push({
              id: `tag_${index}`,
              text: input ? `${input}, ${tag}` : tag,
              confidence: 70 + (index * 2),
              category: 'completion',
              reasoning: `Popular tag that improves discoverability`
            });
          }
        });
        }
        break;

      case 'features': {
        // Feature suggestions based on product category
        const featureSuggestions: Record<string, string[]> = {
          smartphones: ['Fast Charging', 'High-Resolution Camera', 'Large Storage', 'Long Battery Life', 'Water Resistant'],
          laptops: ['Fast Processor', 'SSD Storage', 'Full HD Display', 'Long Battery Life', 'Lightweight Design'],
          tablets: ['Touch Screen', 'Portable Design', 'High Resolution', 'Wi-Fi Enabled', 'Front and Rear Camera']
        };

        const categoryFeatures = featureSuggestions[ctx.category] || featureSuggestions.smartphones;
        categoryFeatures.forEach((feature, index) => {
          if (!input.toLowerCase().includes(feature.toLowerCase())) {
            suggestions.push({
              id: `feature_${index}`,
              text: input ? `${input}, ${feature}` : feature,
              confidence: 80,
              category: 'completion',
              reasoning: `Common feature for ${ctx.category || 'this product type'}`
            });
          }
        });
        }
        break;

      case 'specifications': {
        // Specification suggestions
        if (ctx.category === 'smartphones') {
          const specs = ['Screen Size: 6.1 inches', 'Storage: 128GB', 'RAM: 8GB', 'Battery: 4000mAh', 'Camera: 48MP'];
          specs.forEach((spec, index) => {
            suggestions.push({
              id: `spec_${index}`,
              text: input ? `${input}\n${spec}` : spec,
              confidence: 75,
              category: 'completion',
              reasoning: 'Standard specification format'
            });
          });
        }
        }
        break;

      default:
        // General suggestions
        if (input.length > 10 && !input.endsWith('.')) {
          suggestions.push({
            id: 'general_1',
            text: `${input}.`,
            confidence: 60,
            category: 'improvement',
            reasoning: 'Complete the sentence with proper punctuation'
          });
        }
        break;
    }

    // Add intelligent completion based on common patterns
    if (lastWord.length > 2) {
      const completions = getWordCompletions(lastWord, type);
      completions.forEach((completion, index) => {
        const newText = words.slice(0, -1).concat([completion]).join(' ');
        suggestions.push({
          id: `completion_${index}`,
          text: newText,
          confidence: 65 - (index * 5),
          category: 'alternative',
          reasoning: `Auto-complete based on common ${type} patterns`
        });
      });
    }

    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  };

  const getWordCompletions = (partial: string, type: string): string[] => {
    const completions: Record<string, string[]> = {
      title: ['smartphone', 'laptop', 'tablet', 'excellent', 'premium', 'professional', 'unlocked', 'original'],
      description: ['excellent', 'condition', 'original', 'warranty', 'tested', 'maintained', 'accessories', 'included'],
      features: ['camera', 'battery', 'storage', 'display', 'processor', 'memory', 'wireless', 'bluetooth'],
      tags: ['condition', 'shipping', 'warranty', 'original', 'unlocked', 'certified', 'verified']
    };

    const words = completions[type] || completions.title;
    return words.filter(word => word.toLowerCase().startsWith(partial.toLowerCase()));
  };

  const applySuggestion = (suggestion: AutoFillSuggestion) => {
    onValueChange(suggestion.text);
    setShowSuggestionPanel(false);
    toast({
      title: "Suggestion Applied",
      description: "AI suggestion has been applied to your text.",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'completion': return <CheckCircle className="w-3 h-3" />;
      case 'improvement': return <Lightbulb className="w-3 h-3" />;
      case 'alternative': return <RefreshCw className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  const triggerManualSuggestions = () => {
    if (inputValue.length > 0) {
      generateSuggestions();
    } else {
      toast({
        title: "No Content",
        description: "Start typing to get AI suggestions.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* AI Assistant Button */}
      {showSuggestions && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerManualSuggestions}
            disabled={isGeneratingSuggestions}
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40"
          >
            {isGeneratingSuggestions ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Brain className="w-3 h-3" />
            )}
          </Button>
        </div>
      )}

      {/* Suggestions Panel */}
      {showSuggestionPanel && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-20 mt-1 shadow-lg border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Suggestions</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestionPanel(false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="group p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(suggestion.category)}
                        <Badge className={getConfidenceColor(suggestion.confidence)} variant="outline">
                          {suggestion.confidence}%
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible">
                        {suggestion.text}
                      </p>
                      {suggestion.reasoning && (
                        <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          💡 {suggestion.reasoning}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Click any suggestion to apply it
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSuggestions}
                disabled={isGeneratingSuggestions}
              >
                {isGeneratingSuggestions ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Indicator */}
      {isGeneratingSuggestions && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1">
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating AI suggestions...
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIAutoFillAssistant;
