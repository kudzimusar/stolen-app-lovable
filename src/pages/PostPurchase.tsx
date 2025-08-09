import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Receipt, Truck, Shield } from "lucide-react";

export default function PostPurchase() {
  const { orderId } = useParams();

  useEffect(() => {
    document.title = `Order ${orderId} – Confirmation | STOLEN`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Your purchase is confirmed. Access your receipt, blockchain transfer log, and delivery tracking.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [orderId]);

  const txHash = "0x8fe1...9a3c";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-semibold">Purchase Confirmed</h1>
          <p className="text-muted-foreground">Order #{orderId} • Thank you for buying with escrow protection.</p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 space-y-2 md:col-span-2">
            <h2 className="font-semibold">Next steps</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Seller will prepare shipment. You’ll be notified.</li>
              <li>Funds are held in escrow until you confirm receipt.</li>
              <li>Ownership will be transferred on-chain after confirmation.</li>
            </ul>
          </Card>
          <Card className="p-4 space-y-2">
            <h3 className="font-semibold">Order summary</h3>
            <div className="text-sm text-muted-foreground">Device: iPhone 15 Pro Max</div>
            <div className="font-bold text-primary">ZAR 18,999</div>
            <div className="text-xs text-muted-foreground">Escrow fee included</div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2"><Receipt className="w-4 h-4"/><h3 className="font-semibold">Receipt</h3></div>
            <Button variant="outline" asChild><Link to="#">Download PDF</Link></Button>
          </Card>
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4"/><h3 className="font-semibold">Blockchain log</h3></div>
            <div className="text-sm">Tx: <code>{txHash}</code></div>
            <Button variant="outline" asChild><Link to="#">View on Explorer</Link></Button>
          </Card>
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4"/><h3 className="font-semibold">Delivery</h3></div>
            <Button asChild><Link to="#">Track Delivery</Link></Button>
          </Card>
        </section>

        <div className="text-center">
          <Button variant="hero" asChild><Link to="/marketplace">Continue Shopping</Link></Button>
        </div>
      </main>
    </div>
  );
}
