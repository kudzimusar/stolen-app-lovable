import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Crown, 
  TrendingUp, 
  Clock, 
  Eye,
  Star,
  ArrowUp,
  CheckCircle
} from "lucide-react";

interface UrgencyBoostProps {
  dealId?: string;
  onBoostApplied?: (boostType: string) => void;
}

const UrgencyBoost = ({ dealId, onBoostApplied }: UrgencyBoostProps) => {
  const [selectedBoost, setSelectedBoost] = useState("priority");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const boostOptions = [
    {
      id: "priority",
      name: "Priority Boost",
      price: 49,
      duration: "24 hours",
      features: [
        "Top 10 placement in Hot Deals",
        "2x visibility in search results",
        "Priority badge display",
        "Push notifications to nearby buyers"
      ],
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-600",
      badge: "Popular"
    },
    {
      id: "premium",
      name: "Premium Boost",
      price: 99,
      duration: "48 hours",
      features: [
        "Top 5 placement guaranteed",
        "3x visibility boost",
        "Premium badge & highlighting",
        "AI-powered buyer matching",
        "Featured in email newsletters",
        "Cross-platform promotion"
      ],
      icon: <Crown className="w-5 h-5" />,
      color: "text-purple-600",
      badge: "Best Value"
    },
    {
      id: "lightning",
      name: "Lightning Boost",
      price: 149,
      duration: "72 hours",
      features: [
        "Top 3 guaranteed placement",
        "5x visibility multiplier",
        "Lightning badge & effects",
        "Priority AI matching",
        "Social media promotion",
        "Dedicated account manager",
        "Analytics dashboard"
      ],
      icon: <Zap className="w-5 h-5" />,
      color: "text-yellow-600",
      badge: "Premium"
    }
  ];

  const handleBoostPurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedOption = boostOptions.find(opt => opt.id === selectedBoost);
      
      toast({
        title: "Boost Activated!",
        description: `Your ${selectedOption?.name} is now active for ${selectedOption?.duration}`,
      });
      
      onBoostApplied?.(selectedBoost);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate boost. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedOption = boostOptions.find(opt => opt.id === selectedBoost);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="premium" className="gap-2">
          <Zap className="w-4 h-4" />
          Boost This Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Boost Your Hot Deal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Get your deal seen by more buyers and sell faster with our boost options
            </p>
          </div>

          <RadioGroup value={selectedBoost} onValueChange={setSelectedBoost}>
            <div className="space-y-4">
              {boostOptions.map((option) => (
                <div key={option.id}>
                  <Label htmlFor={option.id} className="cursor-pointer">
                    <Card className={`p-4 hover:bg-muted/50 transition-colors ${
                      selectedBoost === option.id ? 'ring-2 ring-primary' : ''
                    }`}>
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={option.color}>
                                {option.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold">{option.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  R{option.price} for {option.duration}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {option.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {option.badge}
                                </Badge>
                              )}
                              <div className="text-right">
                                <div className="font-bold text-lg">R{option.price}</div>
                                <div className="text-xs text-muted-foreground">
                                  R{Math.round(option.price / parseInt(option.duration))}/day
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {option.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Boost Benefits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Eye className="w-8 h-8 mx-auto text-blue-600" />
                <h5 className="font-medium">More Visibility</h5>
                <p className="text-xs text-muted-foreground">
                  Get seen by 3-5x more potential buyers
                </p>
              </div>
              <div className="space-y-2">
                <Clock className="w-8 h-8 mx-auto text-green-600" />
                <h5 className="font-medium">Faster Sales</h5>
                <p className="text-xs text-muted-foreground">
                  Boosted deals sell 60% faster on average
                </p>
              </div>
              <div className="space-y-2">
                <Star className="w-8 h-8 mx-auto text-yellow-600" />
                <h5 className="font-medium">Premium Placement</h5>
                <p className="text-xs text-muted-foreground">
                  Featured at the top of search results
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleBoostPurchase}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Activate {selectedOption?.name} - R{selectedOption?.price}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UrgencyBoost;