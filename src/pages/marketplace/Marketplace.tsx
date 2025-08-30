import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
import { BackButton } from "@/components/BackButton";
import { Link, useNavigate } from "react-router-dom";
import { EnhancedSelect } from "@/components/EnhancedSelect";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { QRScanner } from "@/components/QRScanner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import Map from "@/components/Map";
import CompareModal from "@/components/marketplace/CompareModal";
import SearchTypeahead from "@/components/marketplace/SearchTypeahead";
import TaxonomyTree from "@/components/marketplace/TaxonomyTree";
import BreadcrumbBar from "@/components/marketplace/BreadcrumbBar";
import EmptyState from "@/components/marketplace/EmptyState";
import { useTaxonomy, TaxonomyNode } from "@/hooks/useTaxonomy";
import {
  Search,
  Heart,
  Shield,
  ArrowLeft,
  MapPin,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Camera,
  Gamepad,
  Headphones,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  QrCode,
  SlidersHorizontal,
  Eye,
  ArrowUpDown,
  Flame as Fire
} from "lucide-react";

const Marketplace = () => {
  const navigate = useNavigate();
  const { tokensFromPath, search: taxonomySearch, roots } = useTaxonomy();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("gauteng");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Taxonomy & flows
  const [taxonomyPath, setTaxonomyPath] = useState<TaxonomyNode[]>([]);
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);

  // Filters & controls
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [sellerType, setSellerType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance"); // relevance | price_asc | price_desc
  const [radiusKm, setRadiusKm] = useState(50);
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [lostFoundOnly, setLostFoundOnly] = useState(false);
  const [verifiedRepairOnly, setVerifiedRepairOnly] = useState(false);
  const [insuranceReadyOnly, setInsuranceReadyOnly] = useState(false);
  const [availability, setAvailability] = useState<'marketplace'|'lostfound'|'donation'>("marketplace");
  const [mapView, setMapView] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Result pagination / load more
  const [useLoadMore, setUseLoadMore] = useState(true);
  const [itemsShown, setItemsShown] = useState(itemsPerPage);

  // Wishlist & compare
  const [wishlist, setWishlist] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); } catch { return []; }
  });
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Quick view state
  const [quickViewItem, setQuickViewItem] = useState<any | null>(null);

  useEffect(() => {
    // Basic SEO for SPA route
    document.title = "Marketplace | STOLEN – Verified Devices";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta');
      m.name = 'description';
      document.head.appendChild(m);
      return m;
    })();
    metaDesc.setAttribute('content', 'Browse verified electronics marketplace in South Africa. Fast search, location filters, and blockchain-verified device listings.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const categories = [
    { id: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { id: "phones", label: "Phones", icon: <Smartphone className="w-4 h-4" /> },
    { id: "laptops", label: "Laptops", icon: <Laptop className="w-4 h-4" /> },
    { id: "tablets", label: "Tablets", icon: <Tablet className="w-4 h-4" /> },
    { id: "cameras", label: "Cameras", icon: <Camera className="w-4 h-4" /> },
    { id: "consoles", label: "Consoles", icon: <Gamepad className="w-4 h-4" /> },
    { id: "accessories", label: "Accessories", icon: <Headphones className="w-4 h-4" /> },
  ];

  const locationOptions = [
    { value: "all", label: "All Locations" },
    { value: "gauteng", label: "Gauteng" },
    { value: "western-cape", label: "Western Cape" },
    { value: "kwazulu-natal", label: "KwaZulu-Natal" },
    { value: "eastern-cape", label: "Eastern Cape" },
    { value: "mpumalanga", label: "Mpumalanga" },
    { value: "limpopo", label: "Limpopo" },
    { value: "north-west", label: "North West" },
    { value: "free-state", label: "Free State" },
    { value: "northern-cape", label: "Northern Cape" }
  ];

  const provinceCoords: Record<string, [number, number]> = {
    "gauteng": [-26.2041, 28.0473],
    "western-cape": [-33.9249, 18.4241],
    "kwazulu-natal": [-29.8587, 31.0218],
    "eastern-cape": [-33.9608, 25.6022],
    "mpumalanga": [-25.7677, 29.5339],
    "limpopo": [-23.9045, 29.4689],
    "north-west": [-25.6700, 27.2350],
    "free-state": [-29.0852, 26.1596],
    "northern-cape": [-28.7282, 24.7499],
    "all": [-28.4793, 24.6727]
  };

const allListings = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB",
    price: 18999,
    originalPrice: 24999,
    image: "https://placehold.co/320x220?text=Phone",
    seller: "TechDeals Pro",
    sellerType: "retailer",
    rating: 4.8,
    location: "Johannesburg",
    province: "gauteng",
    condition: "Like New",
    warrantyMonths: 8,
    stolenStatus: "clean",
    views: 234,
    listedDate: "2 days ago",
    category: "phones"
  },
  {
    id: 2,
    title: "MacBook Pro M3 14-inch",
    price: 32999,
    originalPrice: 45999,
    image: "https://placehold.co/320x220?text=Laptop",
    seller: "Apple Certified",
    sellerType: "retailer",
    rating: 4.9,
    location: "Cape Town",
    province: "western-cape",
    condition: "Excellent",
    warrantyMonths: 10,
    stolenStatus: "clean",
    views: 156,
    listedDate: "1 week ago",
    category: "laptops"
  },
  {
    id: 3,
    title: "Samsung Galaxy S24 Ultra",
    price: 14999,
    originalPrice: 22999,
    image: "https://placehold.co/320x220?text=Phone",
    seller: "MobilePro",
    sellerType: "retailer",
    rating: 4.7,
    location: "Durban",
    province: "kwazulu-natal",
    condition: "Good",
    warrantyMonths: 6,
    stolenStatus: "clean",
    views: 89,
    listedDate: "3 days ago",
    category: "phones"
  },
  {
    id: 4,
    title: "iPad Pro 12.9-inch M2",
    price: 16999,
    originalPrice: 21999,
    image: "https://placehold.co/320x220?text=Tablet",
    seller: "iDevice Store",
    sellerType: "retailer",
    rating: 4.6,
    location: "Pretoria",
    province: "gauteng",
    condition: "Like New",
    warrantyMonths: 12,
    stolenStatus: "clean",
    views: 145,
    listedDate: "5 days ago",
    category: "tablets"
  },
  {
    id: 5,
    title: "Apple Watch Series 9",
    price: 6999,
    originalPrice: 8999,
    image: "https://placehold.co/320x220?text=Watch",
    seller: "Watch World",
    sellerType: "retailer",
    rating: 4.5,
    location: "Port Elizabeth",
    province: "eastern-cape",
    condition: "Excellent",
    warrantyMonths: 8,
    stolenStatus: "lost",
    views: 67,
    listedDate: "1 week ago",
    category: "watches"
  },
  {
    id: 6,
    title: "Dell XPS 13 Intel i7",
    price: 19999,
    originalPrice: 28999,
    image: "https://placehold.co/320x220?text=Laptop",
    seller: "Laptop Pro",
    sellerType: "retailer",
    rating: 4.4,
    location: "Bloemfontein",
    province: "free-state",
    condition: "Good",
    warrantyMonths: 6,
    stolenStatus: "clean",
    views: 98,
    listedDate: "3 days ago",
    category: "laptops"
  },
  {
    id: 7,
    title: "Google Pixel 8 Pro",
    price: 12999,
    originalPrice: 17999,
    image: "https://placehold.co/320x220?text=Phone",
    seller: "Private Seller",
    sellerType: "private",
    rating: 4.3,
    location: "Polokwane",
    province: "limpopo",
    condition: "Like New",
    warrantyMonths: 9,
    stolenStatus: "clean",
    views: 134,
    listedDate: "4 days ago",
    category: "phones"
  },
  {
    id: 8,
    title: "Samsung Galaxy Tab S9",
    price: 11999,
    originalPrice: 15999,
    image: "https://placehold.co/320x220?text=Tablet",
    seller: "Galaxy Store",
    sellerType: "retailer",
    rating: 4.7,
    location: "Rustenburg",
    province: "north-west",
    condition: "Excellent",
    warrantyMonths: 7,
    stolenStatus: "clean",
    views: 76,
    listedDate: "6 days ago",
    category: "tablets"
  },
  {
    id: 9,
    title: "Canon EOS R6 Mark II",
    price: 23999,
    originalPrice: 28999,
    image: "https://placehold.co/320x220?text=Camera",
    seller: "CamPro SA",
    sellerType: "retailer",
    rating: 4.8,
    location: "Stellenbosch",
    province: "western-cape",
    condition: "Excellent",
    warrantyMonths: 10,
    stolenStatus: "clean",
    views: 212,
    listedDate: "4 days ago",
    category: "cameras"
  },
  {
    id: 10,
    title: "Xbox Series X 1TB",
    price: 8999,
    originalPrice: 10999,
    image: "https://placehold.co/320x220?text=Console",
    seller: "Private Seller",
    sellerType: "private",
    rating: 4.2,
    location: "Sandton",
    province: "gauteng",
    condition: "Good",
    warrantyMonths: 4,
    stolenStatus: "stolen",
    views: 53,
    listedDate: "1 day ago",
    category: "consoles"
  },
  {
    id: 11,
    title: "Lenovo ThinkPad X1 Carbon",
    price: 16999,
    originalPrice: 21999,
    image: "https://placehold.co/320x220?text=Laptop",
    seller: "BizTech",
    sellerType: "retailer",
    rating: 4.6,
    location: "Nelspruit",
    province: "mpumalanga",
    condition: "Excellent",
    warrantyMonths: 8,
    stolenStatus: "clean",
    views: 121,
    listedDate: "2 days ago",
    category: "laptops"
  },
  {
    id: 12,
    title: "iPhone 13 Mini 128GB",
    price: 6999,
    originalPrice: 9999,
    image: "https://placehold.co/320x220?text=Phone",
    seller: "Private Seller",
    sellerType: "private",
    rating: 4.1,
    location: "Gqeberha",
    province: "eastern-cape",
    condition: "Good",
    warrantyMonths: 3,
    stolenStatus: "clean",
    views: 178,
    listedDate: "2 weeks ago",
    category: "phones"
  },
  {
    id: 13,
    title: "GoPro HERO12 Black",
    price: 6499,
    originalPrice: 7999,
    image: "https://placehold.co/320x220?text=Camera",
    seller: "Adventure Hub",
    sellerType: "retailer",
    rating: 4.5,
    location: "George",
    province: "western-cape",
    condition: "Excellent",
    warrantyMonths: 6,
    stolenStatus: "clean",
    views: 88,
    listedDate: "3 days ago",
    category: "cameras"
  },
  {
    id: 14,
    title: "Nintendo Switch OLED",
    price: 6499,
    originalPrice: 7499,
    image: "https://placehold.co/320x220?text=Console",
    seller: "GameWorld",
    sellerType: "retailer",
    rating: 4.7,
    location: "Pietermaritzburg",
    province: "kwazulu-natal",
    condition: "Like New",
    warrantyMonths: 9,
    stolenStatus: "clean",
    views: 201,
    listedDate: "3 days ago",
    category: "consoles"
  },
  {
    id: 15,
    title: "Apple AirPods Pro (2nd gen)",
    price: 3499,
    originalPrice: 4299,
    image: "https://placehold.co/320x220?text=Accessories",
    seller: "Private Seller",
    sellerType: "private",
    rating: 4.3,
    location: "Soweto",
    province: "gauteng",
    condition: "Excellent",
    warrantyMonths: 5,
    stolenStatus: "lost",
    views: 45,
    listedDate: "1 day ago",
    category: "accessories"
  },
  {
    id: 16,
    title: "Huawei MatePad 11",
    price: 5999,
    originalPrice: 7999,
    image: "https://placehold.co/320x220?text=Tablet",
    seller: "GadgetZone",
    sellerType: "retailer",
    rating: 4.2,
    location: "Kimberley",
    province: "northern-cape",
    condition: "Good",
    warrantyMonths: 6,
    stolenStatus: "clean",
    views: 66,
    listedDate: "5 days ago",
    category: "tablets"
  }
];

  // Filter and search logic
  const filteredListings = useMemo(() => {
    const tokens = tokensFromPath(taxonomyPath);
    let data = allListings.filter((listing) => {
      const titleLc = listing.title.toLowerCase();
      const matchesSearch = titleLc.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
      const matchesLocation = selectedLocation === "all" || listing.province === selectedLocation;
      const matchesSeller = sellerType === "all" || listing.sellerType === sellerType;
      const matchesCondition = selectedCondition === "all" || listing.condition.toLowerCase() === selectedCondition.toLowerCase();
      const withinPrice = (priceMin === "" || listing.price >= priceMin) && (priceMax === "" || listing.price <= priceMax);
      const matchesLostFound = !lostFoundOnly || ["lost", "stolen"].includes(listing.stolenStatus);
      const matchesWarranty = !warrantyOnly || listing.warrantyMonths > 0;
      const matchesTaxonomy = tokens.length === 0 || tokens.some((t) => titleLc.includes(t) || listing.category.toLowerCase().includes(t));
      return matchesSearch && matchesCategory && matchesLocation && matchesSeller && matchesCondition && withinPrice && matchesLostFound && matchesWarranty && matchesTaxonomy;
    });

    if (sortBy === "price_asc") data = [...data].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") data = [...data].sort((a, b) => b.price - a.price);
    // relevance = original order

    return data;
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    sellerType,
    selectedCondition,
    priceMin,
    priceMax,
    lostFoundOnly,
    warrantyOnly,
    sortBy,
    taxonomyPath,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);
  const compareItems = allListings.filter((l) => compareIds.includes(l.id));
  const mapMarkers = currentListings.map((l) => ({ position: provinceCoords[l.province] || provinceCoords['all'], popup: `${l.title} – ZAR ${l.price}` }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "clean":
        return (
          <Badge variant="secondary" className="bg-verified/10 text-verified border-verified/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Clean
          </Badge>
        );
      case "stolen":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Stolen
          </Badge>
        );
      case "lost":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Lost
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/hot-deals-feed">
                  <Fire className="w-4 h-4" />
                  Hot Deals
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/wishlist">
                  <Heart className="w-4 h-4" />
                  Watchlist
                </Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/list-my-device">
                  Sell Device
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Mobile Back Navigation - Fallback */}
        <div className="md:hidden mb-4">
          <BackButton />
        </div>
        {/* Header Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient bg-gradient-primary bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Buy and sell verified electronics with confidence
            </p>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button 
              variant="outline" 
              size="xl" 
              className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
              onClick={() => navigate('/hot-deals-feed')}>
              <Fire className="w-5 h-5 mr-2" />
              Browse Hot Deals
            </Button>
            <Button 
              variant="hero" 
              size="xl" 
              className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
              onClick={() => navigate('/list-my-device')}>
              <Plus className="w-5 h-5 mr-2" />
              List Your Device
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid gap-3 md:grid-cols-4 max-w-5xl mx-auto">
            <div className="md:col-span-2">
              <SearchTypeahead
                value={searchQuery}
                onChange={setSearchQuery}
                onSelectPath={(p: TaxonomyNode[]) => {
                  setTaxonomyPath(p);
                  setSearchQuery(p[p.length - 1]?.name ?? "");
                }}
                onOpenFilters={() => setFiltersOpen(true)}
              />
            </div>
            <EnhancedSelect
              placeholder="Select Location"
              options={locationOptions}
              value={selectedLocation}
              onValueChange={(val) => { setSelectedLocation(val); setCurrentPage(1); }}
            />
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan Serial / QR
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Serial/QR Verification</DialogTitle>
                  </DialogHeader>
                  <QRScanner onScanSuccess={() => navigate('/device/check')} />
                </DialogContent>
              </Dialog>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filters & Sorting</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Browse by taxonomy</div>
                      <TaxonomyTree selectedPath={taxonomyPath} onSelectPath={(p) => setTaxonomyPath(p)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" placeholder="Min (ZAR)" value={priceMin as any} onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : "")} />
                      <Input type="number" placeholder="Max (ZAR)" value={priceMax as any} onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : "")} />
                    </div>
                    <EnhancedSelect
                      placeholder="Condition"
                      options={[
                        { value: 'all', label: 'Any Condition' },
                        { value: 'Like New', label: 'Like New' },
                        { value: 'Excellent', label: 'Excellent' },
                        { value: 'Good', label: 'Good' },
                      ]}
                      value={selectedCondition}
                      onValueChange={setSelectedCondition}
                    />
                    <EnhancedSelect
                      placeholder="Seller Type"
                      options={[
                        { value: 'all', label: 'All Sellers' },
                        { value: 'retailer', label: 'Retailers' },
                        { value: 'private', label: 'Private' },
                      ]}
                      value={sellerType}
                      onValueChange={setSellerType}
                    />
                    <EnhancedSelect
                      placeholder="Sort by"
                      options={[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'price_asc', label: 'Price: Low to High' },
                        { value: 'price_desc', label: 'Price: High to Low' },
                      ]}
                      value={sortBy}
                      onValueChange={setSortBy}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lost & Found only</span>
                      <Switch checked={lostFoundOnly} onCheckedChange={setLostFoundOnly} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Warranty only</span>
                      <Switch checked={warrantyOnly} onCheckedChange={setWarrantyOnly} />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">Search radius: {radiusKm} km</div>
                      <Slider value={[radiusKm]} min={10} max={500} step={10} onValueChange={(v) => setRadiusKm(v[0])} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Map view</span>
                      <Switch checked={mapView} onCheckedChange={setMapView} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <BreadcrumbBar
          path={taxonomyPath}
          onClear={() => { setTaxonomyPath([]); setSearchQuery(""); }}
          verifiedRepairOnly={verifiedRepairOnly}
          onVerifiedRepairOnly={setVerifiedRepairOnly}
          insuranceReadyOnly={insuranceReadyOnly}
          onInsuranceReadyOnly={setInsuranceReadyOnly}
        />

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="flex-shrink-0"
              onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}
            >
              {category.icon}
              {category.label}
            </Button>
          ))}
        </div>

        {/* Trust Banner */}
        <Card className="p-4 md:p-6 bg-gradient-hero text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1 md:space-y-2">
              <h3 className="font-semibold">100% Verified Devices</h3>
              <p className="text-white/90 text-sm md:text-base">
                Every device is blockchain-verified with complete ownership history
              </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/trust-badges">Learn More</Link>
              </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Listings</h2>
            <div className="text-sm text-muted-foreground">
              {filteredListings.length} device{filteredListings.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Featured Carousel (desktop) */}
          <div className="hidden md:block">
            <Carousel opts={{ align: 'start' }}>
              <CarouselContent>
                {filteredListings.slice(0, 8).map((item) => (
                  <CarouselItem key={item.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <Card 
                      className="overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/marketplace/product/${item.id}`)}
                    >
                      <img src={item.image} alt={`${item.title} - ${item.category}`} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                      <div className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold line-clamp-1">{item.title}</h3>
                          {getStatusBadge(item.stolenStatus)}
                        </div>
                        <div className="text-primary font-bold">{formatPrice(item.price)}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{item.location}, {locationOptions.find(l => l.value === item.province)?.label}</span>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {currentListings.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No devices found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or browse all categories
                  </p>
                </div>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                }}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          ) : mapView ? (
            <Card className="p-2">
              <Map markers={mapMarkers} className="h-[60vh] w-full" />
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {currentListings.map((listing) => (
                <Card 
                  key={listing.id} 
                  className="overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/marketplace/product/${listing.id}`)}
                >
                  <div className="relative">
                    <img
                      src={listing.image}
                      alt={`${listing.title} - ${listing.category}`}
                      loading="lazy"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWishlist((prev) => {
                            const exists = prev.some((w: any) => w.id === listing.id);
                            return exists ? prev.filter((w: any) => w.id !== listing.id) : [...prev, listing];
                          });
                        }}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.some((w:any)=>w.id===listing.id) ? 'text-primary fill-current' : ''}`} />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(listing.stolenStatus)}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                      <Checkbox
                        checked={compareIds.includes(listing.id)}
                        onCheckedChange={(checked) => {
                          setCompareIds((ids) => checked ? [...ids, listing.id] : ids.filter((id) => id !== listing.id));
                        }}
                        id={`cmp-${listing.id}`}
                      />
                      <label htmlFor={`cmp-${listing.id}`} className="text-xs">Compare</label>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewItem(listing);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(listing.price)}
                        </span>
                      </div>
                    </div>

                      <div className="text-sm flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}, {locationOptions.find(l => l.value === listing.province)?.label}</span>
                      </div>


                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Quick View Dialog */}
          <Dialog open={!!quickViewItem} onOpenChange={(open) => { if (!open) setQuickViewItem(null); }}>
            <DialogContent>
              {quickViewItem && (
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-base">{quickViewItem.title}</DialogTitle>
                  </DialogHeader>
                  <img src={quickViewItem.image} alt={quickViewItem.title} className="w-full rounded-md aspect-[4/3] object-cover" />
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-bold text-lg">{formatPrice(quickViewItem.price)}</div>
                    {getStatusBadge(quickViewItem.stolenStatus)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{quickViewItem.location}, {locationOptions.find(l => l.value === quickViewItem.province)?.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => navigate(`/marketplace/product/${quickViewItem.id}`)}>View Details</Button>
                    <Button variant="outline" onClick={() => setQuickViewItem(null)}>Close</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Compare floating button and modal */}
          {compareItems.length >= 2 && (
            <div className="fixed bottom-24 right-4 z-40">
              <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
                <Button variant="hero" onClick={() => setCompareOpen(true)}>
                  Compare ({compareItems.length})
                </Button>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Compare Devices</DialogTitle>
                  </DialogHeader>
                  <CompareModal items={compareItems} />
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Marketplace;