import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Clock, 
  TrendingDown, 
  Settings,
  Info,
  CheckCircle
} from "lucide-react";

interface AutoRelistOptionsProps {
  dealId?: string;
  onSettingsChange?: (settings: any) => void;
}

const AutoRelistOptions = ({ dealId, onSettingsChange }: AutoRelistOptionsProps) => {
  const [autoRelist, setAutoRelist] = useState(false);
  const [relistAfter, setRelistAfter] = useState("7");
  const [priceReduction, setPriceReduction] = useState("5");
  const [maxRelists, setMaxRelists] = useState("3");
  const [priceFloor, setPriceFloor] = useState("");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    const settings = {
      autoRelist,
      relistAfter: parseInt(relistAfter),
      priceReduction: parseInt(priceReduction),
      maxRelists: parseInt(maxRelists),
      priceFloor: priceFloor ? parseInt(priceFloor) : null
    };

    onSettingsChange?.(settings);
    
    toast({
      title: "Settings Saved",
      description: "Auto-relist preferences have been updated",
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Auto-Relist Settings</h3>
        <Badge variant="secondary" className="text-xs">Smart Feature</Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Auto-Relist</Label>
            <p className="text-sm text-muted-foreground">
              Automatically relist your deal if it doesn't sell within the specified time
            </p>
          </div>
          <Switch
            checked={autoRelist}
            onCheckedChange={setAutoRelist}
          />
        </div>

        {autoRelist && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Relist After
                  </Label>
                  <Select value={relistAfter} onValueChange={setRelistAfter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Price Reduction %
                  </Label>
                  <Select value={priceReduction} onValueChange={setPriceReduction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No reduction</SelectItem>
                      <SelectItem value="5">5% reduction</SelectItem>
                      <SelectItem value="10">10% reduction</SelectItem>
                      <SelectItem value="15">15% reduction</SelectItem>
                      <SelectItem value="20">20% reduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Maximum Relists
                  </Label>
                  <Select value={maxRelists} onValueChange={setMaxRelists}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 time</SelectItem>
                      <SelectItem value="2">2 times</SelectItem>
                      <SelectItem value="3">3 times</SelectItem>
                      <SelectItem value="5">5 times</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Price Floor (Optional)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Minimum price"
                    value={priceFloor}
                    onChange={(e) => setPriceFloor(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">How Auto-Relist Works:</p>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>• Your deal will be automatically relisted after {relistAfter} days if unsold</li>
                      {priceReduction !== "0" && (
                        <li>• Price will be reduced by {priceReduction}% with each relist</li>
                      )}
                      <li>• Maximum of {maxRelists} automatic relists</li>
                      {priceFloor && (
                        <li>• Price will never go below R{parseInt(priceFloor).toLocaleString()}</li>
                      )}
                      <li>• You'll receive notifications before each relist</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
                <div className="space-y-2">
                  <CheckCircle className="w-6 h-6 mx-auto text-green-600" />
                  <h5 className="font-medium">Save Time</h5>
                  <p className="text-muted-foreground">No manual relisting needed</p>
                </div>
                <div className="space-y-2">
                  <TrendingDown className="w-6 h-6 mx-auto text-blue-600" />
                  <h5 className="font-medium">Optimize Price</h5>
                  <p className="text-muted-foreground">Automatic price adjustments</p>
                </div>
                <div className="space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-purple-600" />
                  <h5 className="font-medium">Stay Active</h5>
                  <p className="text-muted-foreground">Always visible to buyers</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Button onClick={handleSaveSettings} className="w-full">
        <Settings className="w-4 h-4 mr-2" />
        Save Auto-Relist Settings
      </Button>
    </Card>
  );
};

export default AutoRelistOptions;