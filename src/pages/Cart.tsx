import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    document.title = "Cart | STOLEN – Secure Checkout";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Review your items and proceed to escrow checkout securely.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);

  const removeItem = (id: number) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const formatPrice = (v: number) => `ZAR ${new Intl.NumberFormat('en-ZA').format(v)}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
          <Button variant="outline" asChild><Link to="/marketplace">Continue Shopping</Link></Button>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Your cart is empty.</Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              {items.map((it)=> (
                <Card key={it.id} className="p-3 flex gap-3 items-center">
                  <img src={it.image} alt={it.title} className="w-24 h-24 rounded-md object-cover" />
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{it.title}</div>
                    <div className="text-primary font-bold">{formatPrice(it.price)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => removeItem(it.id)}>Remove</Button>
                    <Button onClick={() => navigate(`/checkout/${it.id}`)}>Checkout</Button>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-4 space-y-2">
              <div className="font-semibold">Summary</div>
              <div className="text-sm text-muted-foreground">Items: {items.length}</div>
              <div className="font-bold text-primary">
                Total: {formatPrice(items.reduce((s, i) => s + i.price, 0))}
              </div>
              <Button className="w-full" onClick={() => items[0] && navigate(`/checkout/${items[0].id}`)}>Checkout First Item</Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
