import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ContactSeller() {
  const { sellerId } = useParams();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = `Contact ${sellerId} | STOLEN – Seller Contact`;
    const metaDesc = document.querySelector('meta[name="description"]') || (() => { const m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); return m; })();
    metaDesc.setAttribute('content', 'Send a secure message to the seller via STOLEN marketplace.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.href;
  }, [sellerId]);

  const send = async () => {
    await new Promise((r)=>setTimeout(r,800));
    toast({ title: 'Message sent', description: 'The seller will be notified via STOLEN.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Contact {sellerId}</h1>
          <p className="text-muted-foreground text-sm">Use this form to securely message the seller. Do not share sensitive info.</p>
        </div>

        <Card className="p-4 space-y-3 max-w-xl">
          <div>
            <label className="text-sm">Subject</label>
            <Input value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="Question about the device" />
          </div>
          <div>
            <label className="text-sm">Message</label>
            <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Hi, is this still available?" />
          </div>
          <div className="flex gap-2">
            <Button onClick={send}>Send</Button>
            <Button variant="outline" asChild><Link to={`/seller/${sellerId}`}>Back to Profile</Link></Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
