import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Flag, Upload } from "lucide-react";

export default function ReportListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `Report Listing | STOLEN – Listing #${id}`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Report a suspicious or fraudulent marketplace listing to help keep the community safe.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [id]);

  const [reason, setReason] = useState("fraud");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const submit = () => {
    try {
      const raw = localStorage.getItem('listingReports') || '[]';
      const list = JSON.parse(raw);
      list.push({ listingId: Number(id), reason, description, contact, evidenceUrl, createdAt: new Date().toISOString() });
      localStorage.setItem('listingReports', JSON.stringify(list));
      toast({ title: 'Report submitted', description: 'Our team will review this listing shortly.' });
      navigate(`/marketplace/product/${id}`);
    } catch {
      toast({ title: 'Could not submit', description: 'Please try again later.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Report Listing</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="p-4 space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            <div className="font-semibold">Listing #{id}</div>
          </div>
          <p className="text-sm text-muted-foreground">Help us keep STOLEN safe. Provide as much detail as possible.</p>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="reason">Reason</Label>
              <select id="reason" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={reason} onChange={(e)=>setReason(e.target.value)}>
                <option value="fraud">Fraud / Scam</option>
                <option value="stolen">Suspected Stolen</option>
                <option value="counterfeit">Counterfeit</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the issue..." value={description} onChange={(e)=>setDescription(e.target.value)} rows={5} />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact">Your contact (optional)</Label>
                <Input id="contact" placeholder="Email or phone" value={contact} onChange={(e)=>setContact(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="evidence">Evidence URL (optional)</Label>
                <Input id="evidence" placeholder="Link to screenshots or proof" value={evidenceUrl} onChange={(e)=>setEvidenceUrl(e.target.value)} />
              </div>
            </div>

            <Button onClick={submit} className="mt-2"><Upload className="w-4 h-4 mr-1"/>Submit Report</Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
