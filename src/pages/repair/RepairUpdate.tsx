import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Wrench, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RepairUpdate() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Log Repair | STOLEN – Update Device History";
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Add a verified repair record to your device history.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, []);

  const submit = async () => {
    setSaving(true);
    await new Promise((r)=>setTimeout(r,1200));
    toast({ title: "Repair submitted", description: "Your repair record is queued for verification." });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Log a Repair</h1>
          <p className="text-muted-foreground">Update your device history with new repair details</p>
        </div>

        <Card className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Device</Label>
              <Input placeholder="iPhone 15 Pro Max" />
            </div>
            <div>
              <Label>Repair Date</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground"/>
                <Input type="date" className="pl-9" />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Issue</Label>
              <Input placeholder="Screen cracked..." />
            </div>
            <div className="md:col-span-2">
              <Label>Repair Details</Label>
              <Textarea placeholder="Replaced with OEM screen, calibrated True Tone..." />
            </div>
            <div className="md:col-span-2">
              <Label>Proof of Repair</Label>
              <Button variant="outline" className="mt-2 w-full"><Upload className="w-4 h-4 mr-2"/>Upload</Button>
            </div>
          </div>
          <Button onClick={submit} disabled={saving} className="w-full">
            <Wrench className="w-4 h-4 mr-2"/>{saving ? 'Saving...' : 'Submit Repair'}
          </Button>
        </Card>
      </main>
    </div>
  );
}
