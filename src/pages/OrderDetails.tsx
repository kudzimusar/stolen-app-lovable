import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, RotateCw, MessageCircle, AlertTriangle, CheckCircle } from "lucide-react";

export default function OrderDetails() {
  const { orderId } = useParams();

  useEffect(() => {
    document.title = `Order ${orderId} – Details, Returns & Disputes | STOLEN`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'View order details, return policy, and open or manage disputes with mediation support.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Order #{orderId}</h1>
          <p className="text-muted-foreground">Manage returns, disputes, and mediation</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="mediation" className="hidden md:block">Mediation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">iPhone 15 Pro Max 256GB</div>
                  <div className="text-sm text-muted-foreground">Paid via S‑Pay Escrow • ZAR 18,999</div>
                </div>
                <Badge variant="secondary">In Escrow</Badge>
              </div>
            </Card>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to={`/order/${orderId}/confirmation`}><FileText className="w-4 h-4 mr-2"/>View Receipt</Link></Button>
              <Button asChild><Link to="/support"><MessageCircle className="w-4 h-4 mr-2"/>Contact Support</Link></Button>
            </div>
          </TabsContent>

          <TabsContent value="returns" className="space-y-3">
            <Card className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><RotateCw className="w-4 h-4"/>Return Policy</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>7‑day change‑of‑mind returns if device is in original condition.</li>
                <li>Full refund if device not as described after verification.</li>
                <li>Buyer pays return shipping unless device is faulty or misrepresented.</li>
              </ul>
              <div className="pt-2">
                <Button asChild><Link to="#">Start a Return</Link></Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-3">
            <Card className="p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Open a Dispute</h3>
              <p className="text-sm text-muted-foreground">Describe the issue and attach evidence. Our team will mediate within 24h.</p>
              <div className="flex gap-2">
                <Button variant="outline">Upload Evidence</Button>
                <Button>Submit Dispute</Button>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Status: <Badge className="ml-1" variant="secondary"><CheckCircle className="w-3 h-3 mr-1"/>No active disputes</Badge></div>
            </Card>
          </TabsContent>

          <TabsContent value="mediation" className="space-y-3">
            <Card className="p-4 space-y-2">
              <h3 className="font-semibold">Mediation Center</h3>
              <p className="text-sm text-muted-foreground">Schedule a mediation call with both parties. Escrow remains locked until resolution.</p>
              <Button variant="outline">Schedule Mediation</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
