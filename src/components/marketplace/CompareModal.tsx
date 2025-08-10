import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Item {
  id: number;
  title: string;
  price: number;
  image: string;
  condition?: string;
  warrantyMonths?: number;
}

export default function CompareModal({ items }: { items: Item[] }) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((it) => (
          <Card key={it.id} className="p-3 space-y-2">
            <img src={it.image} alt={it.title} className="w-full rounded-md aspect-[4/3] object-cover" />
            <div className="font-medium line-clamp-1">{it.title}</div>
            <div className="text-primary font-bold">ZAR {new Intl.NumberFormat('en-ZA').format(it.price)}</div>
            <div className="text-sm text-muted-foreground">Condition: {it.condition || '—'}</div>
            <div className="text-sm text-muted-foreground">Warranty: {it.warrantyMonths ? `${it.warrantyMonths} mo` : '—'}</div>
            <div className="flex gap-2">
              <Badge variant="secondary">Ownership: Verified</Badge>
              <Badge variant="secondary">Repairs: None</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
