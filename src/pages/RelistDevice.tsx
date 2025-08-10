import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, CheckCircle } from "lucide-react";

export default function RelistDevice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("iPhone 15 Pro Max 256GB");
  const [price, setPrice] = useState(18999);

  useEffect(() => {
    document.title = `Relist from Order ${orderId} | STOLEN`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Quickly relist your device using previous order details.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back"><ArrowLeft className="w-5 h-5"/></Button>
          <h1 className="text-lg font-semibold">Relist Device</h1>
          <div className="w-9"/>
        </div>

        <Card className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e)=>setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Price (ZAR)</Label>
              <Input type="number" value={price} onChange={(e)=>setPrice(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2">
              <Label>Photos</Label>
              <Button variant="outline" className="mt-2 w-full"><Upload className="w-4 h-4 mr-2"/>Upload</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button asChild variant="outline"><Link to="/seller-onboarding">Open Full Onboarding</Link></Button>
            <Button onClick={() => navigate('/marketplace')}><CheckCircle className="w-4 h-4 mr-2"/>Publish</Button>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">Relisting based on Order #{orderId}</div>
      </main>
    </div>
  );
}
