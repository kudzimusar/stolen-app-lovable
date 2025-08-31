import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Wand2, 
  RefreshCw, 
  Copy, 
  CheckCircle,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Globe,
  Zap,
  Info,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductInfo {
  name: string;
  category: string;
  brand: string;
  model: string;
  condition: string;
  keyFeatures: string[];
  targetAudience: string;
  sellingPoints: string[];
  price: number;
  specifications: Record<string, string>;
}

interface GeneratedDescription {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  tone: string;
  length: 'short' | 'medium' | 'long';
  targetKeywords: string[];
  seoScore: number;
}

interface AIProductDescriptionGeneratorProps {
  productInfo: Partial<ProductInfo>;
  onDescriptionGenerated: (description: GeneratedDescription) => void;
  onDescriptionSelected: (description: string) => void;
  placeholder?: string;
  maxLength?: number;
  showAdvancedOptions?: boolean;
}

const AIProductDescriptionGenerator: React.FC<AIProductDescriptionGeneratorProps> = ({
  productInfo,
  onDescriptionGenerated,
  onDescriptionSelected,
  placeholder = "Let AI generate an amazing product description...",
  maxLength = 1000,
  showAdvancedOptions = true
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<GeneratedDescription[]>([]);
  const [selectedTone, setSelectedTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'technical'>('professional');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [targetAudience, setTargetAudience] = useState<string>('general');
  const [includeKeywords, setIncludeKeywords] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keyFeatures, setKeyFeatures] = useState<string>('');
  const [sellingPoints, setSellingPoints] = useState<string>('');

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Business-focused, trustworthy tone' },
    { value: 'casual', label: 'Casual', description: 'Friendly, approachable language' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Exciting, energetic style' },
    { value: 'technical', label: 'Technical', description: 'Detailed, specification-focused' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short', description: '50-150 words, quick overview' },
    { value: 'medium', label: 'Medium', description: '150-300 words, balanced detail' },
    { value: 'long', label: 'Long', description: '300-500 words, comprehensive' }
  ];

  const audienceOptions = [
    { value: 'general', label: 'General Public' },
    { value: 'tech_enthusiasts', label: 'Tech Enthusiasts' },
    { value: 'professionals', label: 'Business Professionals' },
    { value: 'students', label: 'Students' },
    { value: 'gamers', label: 'Gamers' },
    { value: 'creative_professionals', label: 'Creative Professionals' }
  ];

  const generateDescription = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = {
        productInfo: {
          name: productInfo.name || 'Product',
          category: productInfo.category || 'Electronics',
          brand: productInfo.brand || '',
          model: productInfo.model || '',
          condition: productInfo.condition || 'Used',
          price: productInfo.price || 0,
          keyFeatures: keyFeatures.split(',').map(f => f.trim()).filter(f => f),
          sellingPoints: sellingPoints.split(',').map(p => p.trim()).filter(p => p),
          specifications: productInfo.specifications || {}
        },
        preferences: {
          tone: selectedTone,
          length: selectedLength,
          targetAudience: targetAudience,
          keywords: includeKeywords.split(',').map(k => k.trim()).filter(k => k),
          maxLength: maxLength
        }
      };

      // Simulate AI API call - replace with actual AI service
      const descriptions = await simulateAIGeneration(prompt);
      
      setGeneratedDescriptions(descriptions);
      
      if (descriptions.length > 0) {
        onDescriptionGenerated(descriptions[0]);
        toast({
          title: "Descriptions Generated",
          description: `Generated ${descriptions.length} product descriptions using AI.`,
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate descriptions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAIGeneration = async (prompt: any): Promise<GeneratedDescription[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { productInfo: product, preferences } = prompt;
    
    const baseDescriptions = {
      professional: `This ${product.condition.toLowerCase()} ${product.brand} ${product.name} represents excellent value in the ${product.category.toLowerCase()} market. ${product.keyFeatures.length > 0 ? `Key features include ${product.keyFeatures.slice(0, 3).join(', ')}.` : ''} Ideal for ${preferences.targetAudience === 'general' ? 'everyday use' : preferences.targetAudience.replace('_', ' ')}, this device offers reliable performance and quality construction.`,
      
      casual: `Looking for a great ${product.name}? This ${product.brand} model is perfect for you! ${product.condition === 'New' ? "Brand new and ready to go!" : "In excellent condition and works like a charm!"} ${product.keyFeatures.length > 0 ? `You'll love features like ${product.keyFeatures.slice(0, 2).join(' and ')}.` : ''} Don't miss out on this amazing deal!`,
      
      enthusiastic: `🌟 AMAZING ${product.brand.toUpperCase()} ${product.name.toUpperCase()}! 🌟 This incredible device will revolutionize your ${product.category.toLowerCase()} experience! ${product.keyFeatures.length > 0 ? `Featuring ${product.keyFeatures.slice(0, 3).join(', ')}, ` : ''}this ${product.condition.toLowerCase()} unit delivers outstanding performance that will exceed your expectations!`,
      
      technical: `${product.brand} ${product.model || product.name} - ${product.condition} condition. Technical specifications: ${Object.entries(product.specifications).slice(0, 3).map(([key, value]) => `${key}: ${value}`).join(', ')}. ${product.keyFeatures.length > 0 ? `Core features: ${product.keyFeatures.join(', ')}.` : ''} Suitable for professional and advanced user applications.`
    };

    const descriptions: GeneratedDescription[] = [];
    
    // Generate primary description
    const primaryDesc = {
      id: `desc_${Date.now()}_1`,
      title: `${product.brand} ${product.name}${product.model ? ` ${product.model}` : ''} - ${product.condition}`,
      description: baseDescriptions[preferences.tone as keyof typeof baseDescriptions],
      highlights: product.keyFeatures.slice(0, 5),
      tone: preferences.tone,
      length: preferences.length,
      targetKeywords: preferences.keywords.length > 0 ? preferences.keywords : [product.brand.toLowerCase(), product.name.toLowerCase(), product.category.toLowerCase()],
      seoScore: Math.floor(Math.random() * 30) + 70 // 70-100
    };

    descriptions.push(primaryDesc);

    // Generate alternative descriptions
    const altTones = toneOptions.filter(t => t.value !== preferences.tone).slice(0, 2);
    
    altTones.forEach((tone, index) => {
      const altDesc = {
        id: `desc_${Date.now()}_${index + 2}`,
        title: `${product.brand} ${product.name} - Premium ${product.condition} Condition`,
        description: baseDescriptions[tone.value as keyof typeof baseDescriptions],
        highlights: product.sellingPoints.slice(0, 4),
        tone: tone.value,
        length: preferences.length,
        targetKeywords: preferences.keywords.length > 0 ? preferences.keywords : [product.brand.toLowerCase(), product.name.toLowerCase()],
        seoScore: Math.floor(Math.random() * 25) + 65 // 65-90
      };
      descriptions.push(altDesc);
    });

    return descriptions;
  };

  const copyDescription = async (description: string) => {
    try {
      await navigator.clipboard.writeText(description);
      toast({
        title: "Copied!",
        description: "Description copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const selectDescription = (description: GeneratedDescription) => {
    onDescriptionSelected(description.description);
    toast({
      title: "Description Selected",
      description: "AI-generated description has been applied to your listing.",
    });
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Description Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyFeatures">Key Features (comma-separated)</Label>
              <Input
                id="keyFeatures"
                value={keyFeatures}
                onChange={(e) => setKeyFeatures(e.target.value)}
                placeholder="e.g., Fast processor, Long battery life, HD camera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPoints">Selling Points (comma-separated)</Label>
              <Input
                id="sellingPoints"
                value={sellingPoints}
                onChange={(e) => setSellingPoints(e.target.value)}
                placeholder="e.g., Excellent condition, Original box, Warranty included"
              />
            </div>
          </div>

          {/* Basic Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                {toneOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Length</Label>
              <select
                value={selectedLength}
                onChange={(e) => setSelectedLength(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                {lengthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                {audienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          {showAdvancedOptions && (
            <div>
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Options
                {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>

              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={includeKeywords}
                      onChange={(e) => setIncludeKeywords(e.target.value)}
                      placeholder="e.g., smartphone, android, samsung galaxy"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {toneOptions.map(option => (
                      <div key={option.value} className="p-2 border rounded">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-muted-foreground text-xs">{option.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateDescription} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Descriptions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Descriptions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Descriptions */}
      {generatedDescriptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Descriptions</h3>
          
          {generatedDescriptions.map((desc, index) => (
            <Card key={desc.id} className={index === 0 ? 'border-primary bg-primary/5' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{desc.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Target className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    <Badge className={getSEOScoreColor(desc.seoScore)}>
                      SEO: {desc.seoScore}%
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {desc.tone}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm leading-relaxed">{desc.description}</p>
                </div>

                {desc.highlights.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">KEY HIGHLIGHTS</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {desc.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {desc.targetKeywords.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">TARGET KEYWORDS</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {desc.targetKeywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => selectDescription(desc)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Use This Description
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyDescription(desc.description)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">AI Description Tips</div>
            <div className="mt-1 space-y-1">
              <div>• Add specific features and selling points for better descriptions</div>
              <div>• Professional tone works best for business buyers</div>
              <div>• Include relevant keywords to improve search visibility</div>
              <div>• Medium length descriptions balance detail with readability</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProductDescriptionGenerator;
