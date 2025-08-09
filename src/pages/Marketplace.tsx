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
  ArrowUpDown
} from "lucide-react";

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("gauteng");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filters & controls
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [sellerType, setSellerType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance"); // relevance | price_asc | price_desc
  const [lostFoundOnly, setLostFoundOnly] = useState(false);

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
    let data = allListings.filter((listing) => {
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
      const matchesLocation = selectedLocation === "all" || listing.province === selectedLocation;
      const matchesSeller = sellerType === "all" || listing.sellerType === sellerType;
      const matchesCondition = selectedCondition === "all" || listing.condition.toLowerCase() === selectedCondition.toLowerCase();
      const withinPrice = (priceMin === "" || listing.price >= priceMin) && (priceMax === "" || listing.price <= priceMax);
      const matchesLostFound = !lostFoundOnly || ["lost", "stolen"].includes(listing.stolenStatus);
      return matchesSearch && matchesCategory && matchesLocation && matchesSeller && matchesCondition && withinPrice && matchesLostFound;
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
    sortBy,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

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
                <Link to="/profile">
                  <Heart className="w-4 h-4" />
                  Watchlist
                </Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/device/register">
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
          <div className="text-center">
            <Button 
              variant="hero" 
              size="xl" 
              className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
              onClick={() => navigate('/device/register')}
            >
              <Plus className="w-5 h-5 mr-2" />
              List Your Device
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid gap-3 md:grid-cols-4 max-w-5xl mx-auto">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search devices (e.g., iPhone 15 Pro)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
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

              <Sheet>
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

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
            <Shield className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
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
                          // Add to wishlist logic
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(listing.stolenStatus)}
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