import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  Clock,
  DollarSign,
  X
} from "lucide-react";

interface SmartSuggestionsProps {
  ownedDevices?: any[];
  currentProduct?: any;
  onDismiss?: () => void;
}

const SmartSuggestions = ({ ownedDevices = [], currentProduct, onDismiss }: SmartSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Generate smart suggestions based on owned devices and current product
    const generateSuggestions = () => {
      const newSuggestions = [];

      // If user owns this product type, suggest listing it
      if (currentProduct) {
        const similarOwned = ownedDevices.filter(device => 
          device.brand?.toLowerCase() === currentProduct.brand?.toLowerCase() ||
          device.model?.toLowerCase().includes(currentProduct.model?.toLowerCase())
        );

        if (similarOwned.length > 0) {
          newSuggestions.push({
            id: 'list-similar',
            type: 'hot-deal',
            title: `List your ${similarOwned[0].name || similarOwned[0].brand + ' ' + similarOwned[0].model}`,
            description: 'Similar to what you\'re viewing. Quick sell opportunity!',
            action: 'List as Hot Deal',
            href: `/hot-deals?deviceId=${similarOwned[0].id}`,
            priority: 'high',
            estimatedValue: `R${(currentProduct.price * 0.8).toLocaleString()}`
          });
        }
      }

      // Suggest upgrading older devices
      const oldDevices = ownedDevices.filter(device => {
        const regDate = new Date(device.registrationDate || device.registration_date);
        const monthsOld = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsOld > 12;
      });

      if (oldDevices.length > 0) {
        newSuggestions.push({
          id: 'upgrade-old',
          type: 'hot-deal',
          title: `Time to upgrade your ${oldDevices[0].name || oldDevices[0].brand}?`,
          description: 'Get great value with a quick Hot Deal listing',
          action: 'Create Hot Deal',
          href: `/hot-deals?deviceId=${oldDevices[0].id}`,
          priority: 'medium',
          badge: 'Upgrade'
        });
      }

      // Suggest Hot Buyer requests based on browsing
      if (currentProduct && !suggestions.find(s => s.type === 'buyer-request')) {
        newSuggestions.push({
          id: 'buyer-request',
          type: 'buyer-request',
          title: `Looking for a better deal on ${currentProduct.title}?`,
          description: 'Post a Hot Buyer request and let sellers come to you',
          action: 'Post Request',
          href: '/hot-buyer-request',
          priority: 'medium',
          badge: 'Hot Request'
        });
      }

      setSuggestions(newSuggestions);
      setVisible(newSuggestions.length > 0);
    };

    const timer = setTimeout(generateSuggestions, 2000);
    return () => clearTimeout(timer);
  }, [ownedDevices, currentProduct]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm space-y-2">
      {suggestions.slice(0, 2).map((suggestion) => (
        <Card key={suggestion.id} className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {suggestion.type === 'hot-deal' ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : (
                <Zap className="w-4 h-4 text-accent" />
              )}
              {suggestion.badge && (
                <Badge variant="secondary" className="text-xs">
                  {suggestion.badge}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-1 h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm leading-tight">
              {suggestion.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              {suggestion.description}
            </p>
            
            {suggestion.estimatedValue && (
              <div className="flex items-center gap-1 text-xs text-success">
                <DollarSign className="w-3 h-3" />
                <span>Est. value: {suggestion.estimatedValue}</span>
              </div>
            )}
            
            <Button size="sm" className="w-full" asChild>
              <Link to={suggestion.href}>
                {suggestion.action}
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SmartSuggestions;