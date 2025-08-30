import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link2, Gift } from "lucide-react";
import { toast } from "sonner";

export default function ReferralRewards() {
  const [copied, setCopied] = useState(false);
  const referral = useMemo(() => `${window.location.origin}/marketplace?ref=STLN1234`, []);

  useEffect(() => {
    document.title = "Referral Rewards | STOLEN – Earn by Sharing";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Share your referral link and earn rewards when friends buy or sell verified devices.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(referral);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Referral Rewards</h1>
          <p className="text-muted-foreground">Invite friends and earn when they transact</p>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <span className="font-medium">Your referral link</span>
          </div>
          <div className="flex gap-2">
            <Input value={referral} readOnly className="flex-1" />
            <Button onClick={copy}><Copy className="w-4 h-4 mr-1"/>{copied ? 'Copied' : 'Copy'}</Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Signups</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Completed Orders</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">ZAR 750</div>
            <div className="text-sm text-muted-foreground">Earnings</div>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="hero"><Gift className="w-4 h-4 mr-2"/>Redeem Rewards</Button>
        </div>
      </main>
    </div>
  );
}
