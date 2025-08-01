import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/STOLENLogo";
import { TrustBadge } from "@/components/TrustBadge";
import { Link } from "react-router-dom";
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
  Watch
} from "lucide-react";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { id: "phones", label: "Phones", icon: <Smartphone className="w-4 h-4" /> },
    { id: "laptops", label: "Laptops", icon: <Laptop className="w-4 h-4" /> },
    { id: "tablets", label: "Tablets", icon: <Tablet className="w-4 h-4" /> },
    { id: "watches", label: "Watches", icon: <Watch className="w-4 h-4" /> }
  ];

  const listings = [
    {
      id: 1,
      title: "iPhone 15 Pro Max 256GB",
      price: 899,
      originalPrice: 1199,
      image: "/placeholder.svg",
      seller: "TechDeals Pro",
      rating: 4.8,
      location: "Johannesburg, GP",
      condition: "Like New",
      warrantyMonths: 8,
      isVerified: true,
      views: 234,
      listedDate: "2 days ago"
    },
    {
      id: 2,
      title: "MacBook Pro M3 14-inch",
      price: 1899,
      originalPrice: 2499,
      image: "/placeholder.svg",
      seller: "Apple Certified",
      rating: 4.9,
      location: "Cape Town, WC",
      condition: "Excellent",
      warrantyMonths: 10,
      isVerified: true,
      views: 156,
      listedDate: "1 week ago"
    },
    {
      id: 3,
      title: "Samsung Galaxy S24 Ultra",
      price: 749,
      originalPrice: 1299,
      image: "/placeholder.svg",
      seller: "MobilePro",
      rating: 4.7,
      location: "Durban, KZN",
      condition: "Good",
      warrantyMonths: 6,
      isVerified: true,
      views: 89,
      listedDate: "3 days ago"
    }
  ];

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
        {/* Search Section */}
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Secure Marketplace</h1>
            <p className="text-muted-foreground">
              Buy and sell verified devices with confidence
            </p>
          </div>

          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search devices (e.g., iPhone 15 Pro)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" size="lg">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Listings</h2>
            <div className="text-sm text-muted-foreground">
              {listings.length} devices found
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-card transition-shadow">
                <div className="relative">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm" asChild>
                      <Link to="/profile">
                        <Heart className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  {listing.isVerified && (
                    <div className="absolute top-3 left-3">
                      <TrustBadge type="secure" text="Verified" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${listing.price}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${listing.originalPrice}
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
                      <span className="text-muted-foreground">{listing.location}</span>
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

                  <Button className="w-full" asChild>
                    <Link to={`/marketplace/listing/${listing.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/marketplace">
              Load More Listings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;