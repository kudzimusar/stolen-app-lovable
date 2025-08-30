import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ShieldCheck, CheckCircle, AlertTriangle, BadgeInfo } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Verified Seller",
    desc: "Identity and business verification completed.",
  },
  {
    icon: CheckCircle,
    title: "Clean Serial",
    desc: "Device not reported lost or stolen in our registry.",
  },
  {
    icon: AlertTriangle,
    title: "Lost & Found",
    desc: "Device flagged as lost or recovered. Special handling applies.",
  },
  {
    icon: BadgeInfo,
    title: "Warranty",
    desc: "Remaining manufacturer or store warranty available.",
  },
];

export default function TrustBadges() {
  useEffect(() => {
    document.title = "Trust Badges | STOLEN – What They Mean";
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
      "Understand STOLEN trust badges: verification, clean serials, warranty and Lost & Found."
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
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Trust Badges</h1>
          <p className="text-muted-foreground">
            Learn how we assess and display device trust signals
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {badges.map((b, i) => (
            <Card key={i} className="p-4 flex items-start gap-3">
              <b.icon className="w-6 h-6 text-primary" />
              <div>
                <div className="font-semibold">{b.title}</div>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </Card>
          ))}
        </section>

        <section>
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Criteria</h2>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Seller KYC/KYB, device serial checks and risk analysis</li>
              <li>Immutable ownership and repair history records</li>
              <li>Community and partner signals (retailers, insurers, police)</li>
            </ul>
          </Card>
        </section>
      </main>
    </div>
  );
}
