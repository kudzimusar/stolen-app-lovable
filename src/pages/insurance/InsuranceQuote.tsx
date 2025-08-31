import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Percent } from "lucide-react";

export default function InsuranceQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `Insurance Quote | STOLEN – Listing #${id}`;
    const metaDesc =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const m = document.createElement("meta");
        m.name = "description";
        document.head.appendChild(m);
        return m;
      })();
    metaDesc.setAttribute(
      "content",
      "Get a device-specific insurance quote with STOLEN partner providers."
    );
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, [id]);

  // Mock product data for quoting
  const product = useMemo(() => ({
    id: Number(id),
    title: `Listing #${id}`,
    image: `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=640&h=480&fit=crop&auto=format&sig=${id}`,
    price: 18999,
    condition: "Like New",
    warrantyMonths: 8,
  }), [id]);

  const [declaredValue, setDeclaredValue] = useState<number>(product.price);
  const [plan, setPlan] = useState<"basic"|"standard"|"premium">("standard");

  const monthlyPremium = useMemo(() => {
    const baseRate = plan === "basic" ? 0.015 : plan === "standard" ? 0.02 : 0.0275;
    return Math.round(declaredValue * baseRate);
  }, [declaredValue, plan]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Insurance Quote</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid gap-4 md:grid-cols-3">
        <Card className="p-4 space-y-3 md:col-span-2">
          <div className="flex items-start gap-3">
            <img src={product.image} alt={`${product.title} image`} className="w-28 h-20 rounded-md object-cover" loading="lazy" />
            <div className="flex-1">
              <div className="font-semibold">{product.title}</div>
              <div className="text-sm text-muted-foreground">Declared value influences premium</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-verified/10 text-verified">{product.condition}</Badge>
                <Badge variant="secondary">Warranty {product.warrantyMonths} mo</Badge>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div>
              <Label htmlFor="declared">Declared Value (ZAR)</Label>
              <Input
                id="declared"
                type="number"
                value={declaredValue as any}
                onChange={(e) => setDeclaredValue(e.target.value ? Number(e.target.value) : 0)}
                min={1000}
              />
            </div>
            <div>
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={plan}
                onChange={(e) => setPlan(e.target.value as any)}
              >
                <option value="basic">Basic (accidental)</option>
                <option value="standard">Standard (accidental + theft)</option>
                <option value="premium">Premium (full coverage)</option>
              </select>
            </div>
          </div>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              Estimated monthly premium
            </div>
            <div className="text-2xl font-bold text-primary">ZAR {new Intl.NumberFormat('en-ZA').format(monthlyPremium)}</div>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => {
              toast({ title: "Quote requested", description: `We'll share offers based on ZAR ${declaredValue}.` });
            }}>Get Quotes</Button>
            <Button variant="outline" asChild>
              <Link to="/insurance-hub"><Percent className="w-4 h-4 mr-1"/>Go to Insurance Hub</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="font-semibold">Why insure with partners</div>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Fast claims with STOLEN verification</li>
            <li>Discounts on verified devices</li>
            <li>Coverage tailored for mobile devices</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
