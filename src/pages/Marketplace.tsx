import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
import { TrustBadge } from "@/components/TrustBadge";
import { BackButton } from "@/components/BackButton";
import { Link, useNavigate } from "react-router-dom";
import { EnhancedSelect } from "@/components/EnhancedSelect";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Search,
  Filter,
  Heart,
  Star,
  Shield,
  Eye,
  ArrowLeft,
  MapPin,
  Calendar,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus
} from "lucide-react";

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = [
    { id: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { id: "phones", label: "Phones", icon: <Smartphone className="w-4 h-4" /> },
    { id: "laptops", label: "Laptops", icon: <Laptop className="w-4 h-4" /> },
    { id: "tablets", label: "Tablets", icon: <Tablet className="w-4 h-4" /> },
    { id: "watches", label: "Watches", icon: <Watch className="w-4 h-4" /> }
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
      image: "/placeholder.svg",
      seller: "TechDeals Pro",
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
      image: "/placeholder.svg",
      seller: "Apple Certified",
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
      image: "/placeholder.svg",
      seller: "MobilePro",
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
      image: "/placeholder.svg",
      seller: "iDevice Store",
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
      image: "/placeholder.svg",
      seller: "Watch World",
      rating: 4.5,
      location: "Port Elizabeth",
      province: "eastern-cape",
      condition: "Excellent",
      warrantyMonths: 8,
      stolenStatus: "clean",
      views: 67,
      listedDate: "1 week ago",
      category: "watches"
    },
    {
      id: 6,
      title: "Dell XPS 13 Intel i7",
      price: 19999,
      originalPrice: 28999,
      image: "/placeholder.svg",
      seller: "Laptop Pro",
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
      image: "/placeholder.svg",
      seller: "Android Central",
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
      image: "/placeholder.svg",
      seller: "Galaxy Store",
      rating: 4.7,
      location: "Rustenburg",
      province: "north-west",
      condition: "Excellent",
      warrantyMonths: 7,
      stolenStatus: "clean",
      views: 76,
      listedDate: "6 days ago",
      category: "tablets"
    }
  ];

  // Filter and search logic
  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
      const matchesLocation = selectedLocation === "all" || listing.province === selectedLocation;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, selectedCategory, selectedLocation]);

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
            <h1 className="text-4xl font-bold text-gradient bg-gradient-primary bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Buy and sell verified electronics with confidence
            </p>
          </div>

          {/* Primary CTA */}
          <div className="text-center">
            <Button 
              variant="hero" 
              size="xl" 
              className="text-lg px-8 py-4"
              onClick={() => navigate('/device/register')}
            >
              <Plus className="w-5 h-5 mr-2" />
              List Your Device
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
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
              onValueChange={setSelectedLocation}
            />
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
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              {category.label}
            </Button>
          ))}
        </div>

        {/* Trust Banner */}
        <Card className="p-6 bg-gradient-hero text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold">100% Verified Devices</h3>
              <p className="text-white/90">
                Every device is blockchain-verified with complete ownership history
              </p>
            </div>
            <Shield className="w-12 h-12 text-white/80" />
          </div>
        </Card>

        {/* Listings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Listings</h2>
            <div className="text-sm text-muted-foreground">
              {filteredListings.length} device{filteredListings.length !== 1 ? 's' : ''} found
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentListings.map((listing) => (
                <Card 
                  key={listing.id} 
                  className="overflow-hidden hover:shadow-card transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/device/${listing.id}`)}
                >
                  <div className="relative">
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <div className="text-center space-y-2">
                        {listing.category === "phones" && <Smartphone className="w-12 h-12 mx-auto text-muted-foreground" />}
                        {listing.category === "laptops" && <Laptop className="w-12 h-12 mx-auto text-muted-foreground" />}
                        {listing.category === "tablets" && <Tablet className="w-12 h-12 mx-auto text-muted-foreground" />}
                        {listing.category === "watches" && <Watch className="w-12 h-12 mx-auto text-muted-foreground" />}
                        <p className="text-sm text-muted-foreground font-medium">{listing.category}</p>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
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
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(listing.price)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(listing.originalPrice)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round((1 - listing.price / listing.originalPrice) * 100)}% off
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Condition:</span>
                        <span className="font-medium">{listing.condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Warranty:</span>
                        <span className="font-medium">{listing.warrantyMonths} months</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{listing.location}, {locationOptions.find(l => l.value === listing.province)?.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          <span className="text-sm font-medium">{listing.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{listing.seller}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {listing.views}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/device/${listing.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
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