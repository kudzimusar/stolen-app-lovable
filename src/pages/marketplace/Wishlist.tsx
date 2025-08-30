import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Listing {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  province: string;
  condition: string;
  stolenStatus: string;
}

export default function Wishlist() {
  const [items, setItems] = useState<Listing[]>([]);

  useEffect(() => {
    document.title = "Wishlist | STOLEN – Saved Devices";
    const metaDesc =
      document.querySelector('meta[name="description"]') ||
      (() => {
        const m = document.createElement("meta");
        m.name = "description";
        document.head.appendChild(m);
        return m;
      })();
    metaDesc.setAttribute(
      "content",
      "Your saved devices. Track price drops and revisit items you love."
    );
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    try {
      const raw = localStorage.getItem("wishlist");
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const removeItem = (id: number) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem("wishlist", JSON.stringify(next));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Wishlist</h1>
          <p className="text-muted-foreground">Saved devices for later</p>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Heart className="w-8 h-8 mx-auto text-muted-foreground" />
            <div className="text-muted-foreground">No saved items yet.</div>
            <Button asChild>
              <Link to="/marketplace">Browse Marketplace</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <Link to={`/marketplace/product/${item.id}`} className="block">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </Link>
                <div className="p-3 space-y-2">
                  <div className="font-medium line-clamp-1">{item.title}</div>
                  <div className="text-primary font-bold">{formatPrice(item.price)}</div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/marketplace/product/${item.id}`}>View</Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
