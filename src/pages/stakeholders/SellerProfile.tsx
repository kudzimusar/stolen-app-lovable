import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, MapPin } from "lucide-react";

const listings = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Sample Device ${i + 1}`,
  price: 4999 + i * 500,
  image: `https://placehold.co/400x300?text=Device+${i + 1}`,
  location: "Johannesburg",
  province: "Gauteng",
}));

export default function SellerProfile() {
  const { sellerId } = useParams();

  useEffect(() => {
    document.title = `Seller ${sellerId} | STOLEN Marketplace`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m;
    })();
    metaDesc.setAttribute('content', 'View seller verification, ratings, and live listings.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [sellerId]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Seller Profile</h1>
          <Button asChild variant="hero"><Link to="/marketplace">Back to Marketplace</Link></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <section>
          <Card className="p-4 flex items-center gap-4">
            <Avatar className="h-14 w-14"><AvatarFallback>{(sellerId||"S").slice(0,1).toUpperCase()}</AvatarFallback></Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{sellerId}</h2>
              <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4"/> Verified Seller
                <span>•</span>
                4.8 <Star className="w-3 h-3"/>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild><Link to={`/seller/${sellerId}/contact`}>Message</Link></Button>
              <Button asChild><Link to={`/seller/${sellerId}/contact`}>Contact</Link></Button>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Listings by {sellerId}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {listings.map((l) => (
              <Card key={l.id} className="overflow-hidden">
                <Link to={`/marketplace/product/${l.id}`} className="block">
                  <img src={l.image} alt={l.title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                  <div className="p-3 space-y-1">
                    <div className="font-medium line-clamp-1">{l.title}</div>
                    <div className="text-primary font-bold">ZAR {new Intl.NumberFormat('en-ZA').format(l.price)}</div>
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="w-3 h-3"/>{l.location}, {l.province}</div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">Trusted retailer specializing in verified devices. Member since 2023. Fast shipping and S‑Pay escrow supported.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">Returns accepted</Badge>
              <Badge variant="secondary">S‑Pay escrow</Badge>
              <Badge variant="secondary">Warranty support</Badge>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
