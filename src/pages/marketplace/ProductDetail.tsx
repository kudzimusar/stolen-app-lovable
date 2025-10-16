import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PriceHistoryChart from "@/components/marketplace/PriceHistoryChart";
import CompareModal from "@/components/marketplace/CompareModal";
import { TrustVisualization } from "@/components/marketplace/TrustVisualization";
import { EnhancedVerificationScanner } from "@/components/marketplace/EnhancedVerificationScanner";
import { MarketplaceAIAssistant } from "@/components/marketplace/MarketplaceAIAssistant";
import { MapPin, ShieldCheck, Clock, CheckCircle, AlertTriangle, Star, ArrowLeft, Info, Heart, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const images: string[] = [];

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
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  // Fetch real listing data
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('No listing ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching listing details for ID:', id);
        
        // First try to get from marketplace-listings API
        const token = await getAuthToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/v1/marketplace/listings?listingId=${id}`, {
          headers
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.listings && result.listings.length > 0) {
            setListing(result.listings[0]);
            console.log('✅ Real listing data loaded:', result.listings[0]);
          } else {
            // Fallback to mock data if no real listing found
            console.log('⚠️ No real listing found, using mock data');
            setListing({
              id: id,
              title: "iPhone 15 Pro Max 256GB",
              price: 18999,
              condition: "Like New",
              warrantyMonths: 8,
              brand: "Apple",
              model: "iPhone 15 Pro Max",
              images: [],
              seller: "TechDeals Pro",
              sellerType: "retailer",
              rating: 4.8,
              location: "Johannesburg",
              province: "gauteng",
              blockchainVerified: true,
              blockchainHash: "0x1234567890abcdef"
            });
          }
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (error: any) {
        console.error('❌ Error fetching listing:', error);
        setError(error.message);
        // Fallback to mock data
        setListing({
          id: id,
          title: "iPhone 15 Pro Max 256GB",
          price: 18999,
          condition: "Like New",
          warrantyMonths: 8,
          brand: "Apple",
          model: "iPhone 15 Pro Max",
          images: [],
          seller: "TechDeals Pro",
          sellerType: "retailer",
          rating: 4.8,
          location: "Johannesburg",
          province: "gauteng",
          blockchainVerified: true,
          blockchainHash: "0x1234567890abcdef"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

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

  const similar = [
    { id: 2, title: "MacBook Pro M3 14-inch", price: 32999, condition: "Excellent", warrantyMonths: 10 },
    { id: 3, title: "Samsung Galaxy S24 Ultra", price: 14999, condition: "Good", warrantyMonths: 6 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Listing not found</p>
          <button onClick={() => navigate('/marketplace')} className="mt-4 text-blue-600 hover:underline">
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

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
                <CarouselItem className="md:basis-2/3 lg:basis-1/2">
                  <div className="w-full rounded-md aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground" />
                  </div>
                </CarouselItem>
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
            <p className="text-2xl font-bold text-primary">ZAR {new Intl.NumberFormat('en-ZA').format(listing.price)}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/checkout/${id}`)}>Buy Now (Escrow)</Button>
              <Button variant="outline" onClick={() => {
                try {
                  const raw = localStorage.getItem('cart') || '[]';
                  const cart = JSON.parse(raw);
                  cart.push({ id: Number(id), title: listing.title, price: listing.price });
                  localStorage.setItem('cart', JSON.stringify(cart));
                  toast({ title: 'Added to cart', description: 'Item added. Go to cart to checkout.' });
                } catch (error) {
                  console.error('Error adding to cart:', error);
                }
              }}>Add to Cart</Button>
              <Button variant="premium" asChild>
                <Link to="/hot-buyer-request">Quick Request</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/cart">Go to Cart</Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Preview Ownership Proof</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Blockchain Ownership Proof</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div>Contract: 0xABC...123</div>
                    <div>Token ID: #{id}</div>
                    <div>Current owner: TechDeals Pro</div>
                    <div>Last transfer: 2025-06-01 12:30</div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" asChild>
                <Link to={`/ownership-history`}>Ownership History</Link>
              </Button>
              <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Compare Similar</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Compare Devices</DialogTitle>
                  </DialogHeader>
                  <CompareModal items={similar as any} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" asChild>
                <Link to={`/insurance-quote/${id}`}>Insurance Quote</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/seller/techdeals-pro/contact`}>Contact Seller</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/report-listing/${id}`}>Report Listing</Link>
              </Button>
              <Button variant="ghost" onClick={() => {
                try {
                  const raw = localStorage.getItem('wishlist') || '[]';
                  const list = JSON.parse(raw);
                  list.push({ id: Number(id), title: listing.title, price: listing.price, location: listing.location, province: listing.province, condition: listing.condition, stolenStatus: 'clean' });
                  localStorage.setItem('wishlist', JSON.stringify(list));
                  toast({ title: 'Saved', description: 'Added to your wishlist.' });
                } catch (error) {
                  console.error('Error adding to wishlist:', error);
                }
              }}>
                <Heart className="w-4 h-4 mr-1"/>Save for later
              </Button>
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

        {/* Trust Visualization */}
        <section>
          <TrustVisualization deviceId={id || 'device-1'} showFullDetails={false} />
        </section>

        {/* Details */}
        <section>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
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
                <h4 className="font-semibold mb-2 flex items-center gap-2">Price History & Trends
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Prices update weekly from marketplace aggregates.</TooltipContent>
                  </Tooltip>
                </h4>
                <PriceHistoryChart />
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Location</h4>
                <div className="rounded-md bg-muted aspect-[16/9] flex items-center justify-center text-muted-foreground">Map preview</div>
                <div className="text-xs text-muted-foreground mt-2">Trust badges help you shop safely. <Link to="/trust-badges" className="underline">Learn more</Link></div>
              </Card>
            </TabsContent>
            <TabsContent value="verification" className="space-y-3">
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Device Verification</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Verify this device using multiple methods to ensure authenticity and check for theft reports.
                </p>
                <EnhancedVerificationScanner 
                  mode="embedded"
                  onVerificationComplete={(result) => {
                    console.log('Verification result:', result);
                  }}
                />
              </Card>
              <Card className="p-4">
                <TrustVisualization deviceId={id || 'device-1'} showFullDetails={true} />
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
                  <div className="w-full rounded-md aspect-[4/3] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="text-sm">Sample Device {n}</div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* AI Assistant */}
      <MarketplaceAIAssistant 
        currentPage="product"
        currentDevice={{
          id,
          title: listing.title,
          price: listing.price,
          seller: listing.seller,
          location: `${listing.location}, ${listing.province}`
        }}
        userContext={{
          viewingProduct: true
        }}
      />
    </div>
  );
}
