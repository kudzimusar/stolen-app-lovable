import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, ShieldCheck, Clock, CheckCircle, AlertTriangle, Star, ArrowLeft } from "lucide-react";

const images = [
  "https://placehold.co/800x600?text=Image+1",
  "https://placehold.co/800x600?text=Image+2",
  "https://placehold.co/800x600?text=Image+3",
];

const ownershipHistory = [
  { id: 1, date: "2024-02-10", event: "Ownership transfer", from: "Alice", to: "Bob", verified: true },
  { id: 2, date: "2023-09-01", event: "Retail purchase", from: "Retailer", to: "Alice", verified: true },
];

const repairs = [
  { id: 1, date: "2024-05-20", shop: "FixIt Pro", issue: "Screen replacement", cost: 1499, verified: true },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Product Details | STOLEN – Listing #${id}`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'View blockchain-verified device details, ownership and repair history, and seller profile.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [id]);

  const price = 18999;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Product Detail</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Gallery */}
        <section aria-label="Product media gallery">
          <Card className="p-3 md:p-4">
            <Carousel opts={{ align: 'start' }}>
              <CarouselContent>
                {images.map((src, i) => (
                  <CarouselItem key={i} className="md:basis-2/3 lg:basis-1/2">
                    <img src={src} alt={`Product image ${i+1}`} className="w-full rounded-md object-cover aspect-[4/3]" loading="lazy" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </Card>
        </section>

        {/* Overview */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 md:col-span-2 space-y-3">
            <h2 className="text-xl font-semibold">iPhone 15 Pro Max 256GB</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-verified/10 text-verified">Clean</Badge>
              <Badge variant="secondary" className="bg-secondary">Warranty 8 months</Badge>
              <span className="inline-flex items-center text-sm text-muted-foreground"><MapPin className="w-4 h-4 mr-1"/> Johannesburg, Gauteng</span>
            </div>
            <p className="text-2xl font-bold text-primary">ZAR {new Intl.NumberFormat('en-ZA').format(price)}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/escrow-payment`)}>Buy Now (Escrow)</Button>
              <Button variant="outline" asChild>
                <Link to={`/seller/techdeals-pro`}>Contact Seller</Link>
              </Button>
              <Button variant="ghost">Report Listing</Button>
            </div>
          </Card>
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Seller</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>T</AvatarFallback>
              </Avatar>
              <div>
                <Link to="/seller/techdeals-pro" className="font-medium hover:underline">TechDeals Pro</Link>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4"/> Verified • 4.8 <Star className="w-3 h-3 ml-0.5"/>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/seller/techdeals-pro">View Seller Profile</Link>
            </Button>
          </Card>
        </section>

        {/* Details */}
        <section>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">Ownership</TabsTrigger>
              <TabsTrigger value="repairs">Repairs</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-3">
              <Card className="p-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Brand:</span> Apple</div>
                  <div><span className="text-muted-foreground">Model:</span> iPhone 15 Pro Max</div>
                  <div><span className="text-muted-foreground">Serial Status:</span> Clean</div>
                  <div><span className="text-muted-foreground">Color:</span> Natural Titanium</div>
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="rounded-md bg-muted aspect-[16/9] flex items-center justify-center text-muted-foreground">Map preview</div>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-3">
              {ownershipHistory.map((h) => (
                <Card key={h.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{h.event}</div>
                    <div className="text-sm text-muted-foreground">{h.date} • {h.from} → {h.to}</div>
                  </div>
                  {h.verified ? (
                    <Badge variant="secondary" className="bg-verified/10 text-verified inline-flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Verified</Badge>
                  ) : (
                    <Badge variant="secondary" className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Unverified</Badge>
                  )}
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="repairs" className="space-y-3">
              {repairs.map((r) => (
                <Card key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.issue}</div>
                    <div className="text-sm text-muted-foreground">{r.shop} • {r.date}</div>
                  </div>
                  <Badge variant="secondary" className="bg-secondary">Verified</Badge>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </section>

        {/* Related */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Related devices</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map((n) => (
              <Card key={n} className="p-2">
                <Link to={`/marketplace/product/${n}`} className="space-y-2 block">
                  <img src={`https://placehold.co/400x300?text=Related+${n}`} alt={`Related device ${n}`} className="w-full rounded-md object-cover aspect-[4/3]" loading="lazy" />
                  <div className="text-sm">Sample Device {n}</div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
