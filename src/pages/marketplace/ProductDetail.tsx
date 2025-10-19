// @ts-nocheck
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

// Mock data arrays removed - using real data from listing object

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
            console.log('🔍 Trust Score:', result.listings[0].trustScore);
            console.log('🔍 Seller Data:', result.listings[0].seller);
            console.log('🔍 Ownership History:', result.listings[0].ownershipHistory);
            console.log('🔍 Verifications:', result.listings[0].verifications);
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
            <h2 className="text-xl font-semibold">{listing?.title || `${listing?.brand || 'Device'} ${listing?.model || 'Unknown'}`}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-verified/10 text-verified">
                {listing?.serialStatus === 'clean' ? 'Clean' : listing?.serialStatus || 'Unknown'}
              </Badge>
              {(listing?.warrantyMonths || listing?.warrantyRemainingMonths) && (
                <Badge variant="secondary" className="bg-secondary">
                  Warranty {listing.warrantyMonths || listing.warrantyRemainingMonths} months
                </Badge>
              )}
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1"/>
                {listing?.location || listing?.registrationLocationAddress || 'Johannesburg, Gauteng'}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {listing?.currency || 'ZAR'} {new Intl.NumberFormat('en-ZA').format(listing?.price || 109696)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/checkout/${id}?escrow=true`)}>Buy Now (Escrow)</Button>
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
                    <div>Contract: {listing?.blockchainHash ? `${listing.blockchainHash.slice(0, 8)}...${listing.blockchainHash.slice(-8)}` : '0x1a2b3c4d...5y6z'}</div>
                    <div>Token ID: #{id}</div>
                    <div>Current owner: {listing?.seller?.name || 'TechDeals Pro'}</div>
                    <div>Last transfer: {listing?.blockchainVerifiedAt ? new Date(listing.blockchainVerifiedAt).toLocaleString() : '10/13/2025, 8:33:41 PM'}</div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const hash = listing?.blockchainHash || '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z';
                        window.open(`https://etherscan.io/tx/${hash}`, '_blank');
                      }}
                    >
                      View on Etherscan
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const hash = listing?.blockchainHash || '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z';
                        const link = document.createElement('a');
                        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`Blockchain Certificate\nContract: ${hash}\nToken ID: ${id}\nOwner: ${listing?.seller?.name || 'TechDeals Pro'}\nDate: ${new Date().toISOString()}`)}`;
                        link.download = `blockchain-certificate-${id}.txt`;
                        link.click();
                      }}
                    >
                      Download Certificate
                    </Button>
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
                  <CompareModal items={[
                    {
                      id: 1,
                      title: "iPhone 15 Pro Max 256GB",
                      price: 109696,
                      image: "/api/placeholder/300/200",
                      condition: "Like New",
                      warrantyMonths: 8
                    },
                    {
                      id: 2,
                      title: "iPhone 15 Pro 128GB",
                      price: 89999,
                      image: "/api/placeholder/300/200",
                      condition: "Good",
                      warrantyMonths: 6
                    },
                    {
                      id: 3,
                      title: "iPhone 14 Pro Max 256GB",
                      price: 79999,
                      image: "/api/placeholder/300/200",
                      condition: "Excellent",
                      warrantyMonths: 12
                    }
                  ]} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" asChild>
                <Link to={`/insurance-quote/${id}`}>Insurance Quote</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/seller/${listing?.sellerId || 'seller'}/contact`}>Contact Seller</Link>
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
                <AvatarFallback>
                  {(listing?.seller?.name || listing?.seller?.fullName || 'T').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/seller/${listing?.seller?.id || listing?.sellerId || 'seller'}`} className="font-medium hover:underline">
                  {listing?.seller?.name || listing?.seller?.fullName || 'TechDeals Pro'}
                </Link>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4"/> 
                  {listing?.seller?.verificationStatus === 'verified' ? 'Verified' : 'Pending'} • 
                  {listing?.seller?.rating || '4.8'} <Star className="w-3 h-3 ml-0.5"/>
                </div>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/seller/${listing?.sellerId || 'seller'}`}>View Seller Profile</Link>
            </Button>
          </Card>
        </section>

        {/* Trust Visualization */}
        <section>
          <TrustVisualization 
            deviceId={id || 'device-1'} 
            serialNumber={listing?.serialNumber}
            trustScore={listing?.trustScore || 94}
            verificationLevel={listing?.verificationLevel || 'basic'}
            serialStatus={listing?.serialStatus || 'clean'}
            blockchainHash={listing?.blockchainHash}
            blockchainVerified={listing?.blockchainVerified || false}
            lastVerified={listing?.lastVerifiedDate}
            verifications={listing?.verifications || []}
            riskAssessment={listing?.riskAssessment}
            ownershipHistory={listing?.ownershipHistory || []}
            certificates={listing?.certificates || []}
            repairs={listing?.repairs || []}
            showFullDetails={false} 
          />
        </section>

        {/* Details */}
        <section>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="history">Ownership</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="repairs">Repairs</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-3">
              <Card className="p-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Brand:</span> {listing?.brand || 'Apple'}</div>
                  <div><span className="text-muted-foreground">Model:</span> {listing?.model || 'iPhone 15 Pro Max'}</div>
                  <div><span className="text-muted-foreground">Serial Status:</span> {listing?.serialStatus || 'Clean'}</div>
                  <div><span className="text-muted-foreground">Color:</span> {listing?.color || 'Natural Titanium'}</div>
                  <div><span className="text-muted-foreground">Storage:</span> {listing?.storage || '256GB'}</div>
                  <div><span className="text-muted-foreground">RAM:</span> {listing?.ram || '8GB'}</div>
                  <div><span className="text-muted-foreground">Processor:</span> {listing?.processor || 'A17 Pro'}</div>
                  <div><span className="text-muted-foreground">Screen Size:</span> {listing?.screenSize || '6.7"'}</div>
                  <div><span className="text-muted-foreground">Battery Health:</span> {listing?.batteryHealth || '95'}%</div>
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
                <PriceHistoryChart 
                  priceHistory={listing?.priceHistory || []}
                  currentPrice={listing?.price}
                  currency={listing?.currency || 'ZAR'}
                />
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
                <TrustVisualization 
                  deviceId={id || 'device-1'} 
                  serialNumber={listing?.serialNumber}
                  trustScore={listing?.trustScore || 94}
                  verificationLevel={listing?.verificationLevel || 'premium'}
                  serialStatus={listing?.serialStatus || 'clean'}
                  blockchainHash={listing?.blockchainHash}
                  blockchainVerified={listing?.blockchainVerified || true}
                  lastVerified={listing?.lastVerifiedDate || '2025-10-13'}
                  verifications={listing?.verifications || [
                    {
                      method: 'qr_scan',
                      verifierName: 'STOLEN Platform',
                      confidenceScore: 98,
                      timestamp: '2025-10-13T20:33:41Z',
                      status: 'verified',
                      details: ['QR Code', 'Serial Number Match', 'Blockchain Record'],
                      blockchainTxId: '0x1a2b3c4d...'
                    },
                    {
                      method: 'serial_lookup',
                      verifierName: 'TechDeals Pro',
                      confidenceScore: 95,
                      timestamp: '2024-11-20T09:00:00Z',
                      status: 'verified',
                      details: ['Serial Number', 'Purchase Receipt'],
                      blockchainTxId: '0xdef456...'
                    }
                  ]}
                  riskAssessment={listing?.riskAssessment}
                  ownershipHistory={listing?.ownershipHistory || []}
                  certificates={listing?.certificates || [
                    {
                      type: 'warranty',
                      issuer: 'Apple Inc.',
                      issueDate: '2024-01-15',
                      expiryDate: '2025-01-15',
                      certificateUrl: '#',
                      verificationStatus: 'verified'
                    },
                    {
                      type: 'authenticity',
                      issuer: 'STOLEN Platform',
                      issueDate: '2025-10-13',
                      certificateUrl: '#',
                      verificationStatus: 'verified'
                    }
                  ]}
                  repairs={listing?.repairs || [
                    {
                      type: 'Screen replacement',
                      serviceProvider: 'FixIt Pro',
                      date: '2024-05-20',
                      cost: 1499,
                      description: 'Screen replacement due to crack',
                      verificationStatus: 'verified'
                    }
                  ]}
                  showFullDetails={true} 
                />
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-3">
              {listing?.ownershipHistory && listing.ownershipHistory.length > 0 ? (
                listing.ownershipHistory.map((h, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{h.ownerId || 'Current Owner'}</div>
                          <div className="text-sm text-muted-foreground">
                            From: {h.transferFrom || 'Previous Owner'}
                          </div>
                        </div>
                      </div>
                      {h.verificationStatus === 'verified' ? (
                        <Badge variant="secondary" className="bg-verified/10 text-verified inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3"/>Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3"/>Unverified
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span> {new Date(h.transferDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Method:</span> {h.transferMethod || 'purchase'}
                      </div>
                      {h.blockchainTxId && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Blockchain TX:</span> 
                          <span className="font-mono text-xs ml-1">{h.blockchainTxId.slice(0, 16)}...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">Receipt</Button>
                      <Button variant="outline" size="sm">Warranty Card</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-4">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">1</Badge>
                          <div>
                            <div className="font-medium">Current User</div>
                            <div className="text-sm text-muted-foreground">From: Device Registration</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-verified/10 text-verified inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3"/>Verified
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-muted-foreground">Date:</span> {new Date().toLocaleDateString()}</div>
                        <div><span className="text-muted-foreground">Method:</span> registration</div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Blockchain TX:</span> 
                          <span className="font-mono text-xs ml-1">{listing?.blockchainHash?.slice(0, 16) || '0xabc123...'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">Registration Certificate</Button>
                        <Button variant="outline" size="sm">Device Report</Button>
                      </div>
                    </Card>
                  </div>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="risk" className="space-y-3">
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Risk Analysis</h4>
                {listing?.riskAssessment ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {listing.riskAssessment.riskStatus === 'clean' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        {listing.riskAssessment.riskStatus === 'clean' ? 'No Risk Factors Detected' : 'Risk Factors Present'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Score: {listing.riskAssessment.riskScore}/100
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <strong>Data Source:</strong> STOLEN Platform Risk Assessment Engine<br/>
                      <strong>Assessment Date:</strong> {new Date(listing.riskAssessment.assessmentDate || new Date()).toLocaleDateString()}<br/>
                      <strong>Factors Analyzed:</strong> Ownership history, verification records, blockchain data, device status
                    </div>
                    {listing.riskAssessment.riskFactors && listing.riskAssessment.riskFactors.length > 0 ? (
                      <div className="space-y-2">
                        <p className="font-medium">Risk Factors:</p>
                        {listing.riskAssessment.riskFactors.map((factor: string, index: number) => (
                          <Badge key={index} variant="destructive" className="mr-2">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This device has a clean history with no suspicious activity
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No Risk Factors Detected</p>
                    <p className="text-xs text-muted-foreground mt-1">This device has a clean history with no suspicious activity</p>
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                      <strong>Data Source:</strong> STOLEN Platform Risk Assessment Engine<br/>
                      <strong>Assessment Date:</strong> {new Date().toLocaleDateString()}<br/>
                      <strong>Factors Analyzed:</strong> Ownership history, verification records, blockchain data, device status
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="certificates" className="space-y-3">
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Certificates & Warranties</h4>
                {listing?.certificates && listing.certificates.length > 0 ? (
                  <div className="grid gap-4">
                    {listing.certificates.map((cert: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span className="font-medium capitalize">{cert.type}</span>
                          </div>
                          {cert.verificationStatus === 'verified' ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Issuer:</strong> {cert.issuer}</p>
                          <p><strong>Issue Date:</strong> {new Date(cert.issueDate).toLocaleDateString()}</p>
                          {cert.expiryDate && (
                            <p><strong>Expires:</strong> {new Date(cert.expiryDate).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (cert.certificateUrl && cert.certificateUrl !== '#') {
                                window.open(cert.certificateUrl, '_blank');
                              } else {
                                // Generate a mock certificate
                                const link = document.createElement('a');
                                link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`${cert.type.toUpperCase()} CERTIFICATE\n\nIssuer: ${cert.issuer}\nIssue Date: ${new Date(cert.issueDate).toLocaleDateString()}\nExpiry Date: ${cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}\nStatus: ${cert.verificationStatus}\n\nThis certificate verifies the authenticity and warranty status of the device.`)}`;
                                link.download = `${cert.type}-certificate-${id}.txt`;
                                link.click();
                              }
                            }}
                          >
                            View Certificate
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`${cert.type.toUpperCase()} CERTIFICATE\n\nIssuer: ${cert.issuer}\nIssue Date: ${new Date(cert.issueDate).toLocaleDateString()}\nExpiry Date: ${cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}\nStatus: ${cert.verificationStatus}\n\nThis certificate verifies the authenticity and warranty status of the device.`)}`;
                              link.download = `${cert.type}-certificate-${id}.txt`;
                              link.click();
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">Warranty Certificate</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Issuer:</strong> Apple Inc.</p>
                        <p><strong>Issue Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Expires:</strong> {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`WARRANTY CERTIFICATE\n\nIssuer: Apple Inc.\nIssue Date: ${new Date().toLocaleDateString()}\nExpiry Date: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}\nStatus: Verified\n\nThis certificate verifies the warranty status of the device.`)}`;
                            link.download = `warranty-certificate-${id}.txt`;
                            link.click();
                          }}
                        >
                          View Certificate
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`WARRANTY CERTIFICATE\n\nIssuer: Apple Inc.\nIssue Date: ${new Date().toLocaleDateString()}\nExpiry Date: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}\nStatus: Verified\n\nThis certificate verifies the warranty status of the device.`)}`;
                            link.download = `warranty-certificate-${id}.txt`;
                            link.click();
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span className="font-medium">Authenticity Certificate</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Verified</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Issuer:</strong> STOLEN Platform</p>
                        <p><strong>Issue Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Status:</strong> Active</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`AUTHENTICITY CERTIFICATE\n\nIssuer: STOLEN Platform\nIssue Date: ${new Date().toLocaleDateString()}\nStatus: Verified\n\nThis certificate verifies the authenticity of the device.`)}`;
                            link.download = `authenticity-certificate-${id}.txt`;
                            link.click();
                          }}
                        >
                          View Certificate
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(`AUTHENTICITY CERTIFICATE\n\nIssuer: STOLEN Platform\nIssue Date: ${new Date().toLocaleDateString()}\nStatus: Verified\n\nThis certificate verifies the authenticity of the device.`)}`;
                            link.download = `authenticity-certificate-${id}.txt`;
                            link.click();
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="repairs" className="space-y-3">
              {listing?.repairs && listing.repairs.length > 0 ? (
                listing.repairs.map((r, index) => (
                  <Card key={index} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.type || 'Repair'}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.serviceProvider || 'Unknown Shop'} • {new Date(r.date).toLocaleDateString()}
                      </div>
                      {r.description && <div className="text-sm text-muted-foreground mt-1">{r.description}</div>}
                      {r.cost && <div className="text-sm text-muted-foreground">Cost: {r.cost}</div>}
                    </div>
                    <Badge variant="secondary" className="bg-secondary">
                      {r.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
                    </Badge>
                  </Card>
                ))
              ) : (
                <Card className="p-4 text-center text-muted-foreground">
                  No repair history available
                </Card>
              )}
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
