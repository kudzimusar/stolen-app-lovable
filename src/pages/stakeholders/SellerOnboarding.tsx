import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { CheckCircle, Upload, ArrowLeft, ArrowRight } from "lucide-react";

export default function SellerOnboarding() {
  const [step, setStep] = useState(1);
  const [isDonate, setIsDonate] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Sell Your Device | STOLEN – Onboarding";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Start selling in minutes: verify profile, add device details, set price & delivery. Support donations to NGOs.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handlePublish = () => {
    toast({ title: "Listing Created", description: isDonate ? "Donation listing submitted for NGO verification." : "Your device has been listed successfully." });
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Sell Your Device</h1>
          <Button asChild variant="outline"><Link to="/marketplace">Back to Marketplace</Link></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Step {step} of 3</div>
            <Badge variant="secondary" className="inline-flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Secure & Verified</Badge>
          </div>
          <Progress value={progress} />
        </Card>

        {step === 1 && (
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">1. Profile & Verification</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name / Business</Label>
                <Input placeholder="John Doe / Tech Pty Ltd" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input type="email" placeholder="you@example.com" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input placeholder="+27 82 000 0000" />
              </div>
              <div>
                <Label>ID / Company Reg Doc</Label>
                <Button variant="outline" className="w-full mt-2"><Upload className="w-4 h-4 mr-2"/>Upload</Button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={isDonate} onCheckedChange={setIsDonate} />
                <span>Donate instead of sell (NGO verification required)</span>
              </div>
              <Button onClick={next}>Next <ArrowRight className="w-4 h-4 ml-1"/></Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">2. Device Details & Receipt</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <Input placeholder="Apple" />
              </div>
              <div>
                <Label>Model</Label>
                <Input placeholder="iPhone 15 Pro Max" />
              </div>
              <div>
                <Label>Serial / IMEI</Label>
                <Input placeholder="3567 89..." />
              </div>
              <div>
                <Label>Condition</Label>
                <Input placeholder="Like New / Good / Fair" />
              </div>
              <div className="md:col-span-2">
                <Label>Receipt / Proof of Purchase</Label>
                <Button variant="outline" className="w-full mt-2"><Upload className="w-4 h-4 mr-2"/>Upload</Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prev}><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
              <Button onClick={next}>Next <ArrowRight className="w-4 h-4 ml-1"/></Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">3. Price & Delivery</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Price (ZAR)</Label>
                <Input type="number" placeholder="18999" />
              </div>
              <div>
                <Label>Delivery Options</Label>
                <Input placeholder="Courier / Pickup" />
              </div>
              {isDonate && (
                <div className="md:col-span-2">
                  <Label>NGO Verification</Label>
                  <p className="text-sm text-muted-foreground">We will verify the recipient NGO before publishing your donation listing.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prev}><ArrowLeft className="w-4 h-4 mr-1"/>Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" asChild><Link to="/bulk-listings">Bulk Upload</Link></Button>
                <Button onClick={handlePublish}>Publish</Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
