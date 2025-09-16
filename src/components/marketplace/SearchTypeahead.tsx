import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRScanner } from "@/components/ui/QRScanner";
import { Mic, QrCode, Search, SlidersHorizontal } from "lucide-react";
import { SearchResult, TaxonomyNode, useTaxonomy } from "@/hooks/useTaxonomy";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelectPath: (path: TaxonomyNode[]) => void;
  onOpenFilters?: () => void;
}

export default function SearchTypeahead({ value, onChange, onSelectPath, onOpenFilters }: Props) {
  const { search } = useTaxonomy();
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const micRef = useRef<any>(null);

  useEffect(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) micRef.current = new SpeechRecognition();
    } catch (error) {
      console.warn('Speech recognition not available:', error);
    }
  }, []);

  useEffect(() => {
    setResults(search(value));
  }, [value, search]);

  const onVoice = () => {
    const mic = micRef.current;
    if (!mic) return;
    mic.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onChange(transcript);
      setOpen(true);
    };
    mic.start();
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        aria-label="Search devices"
        placeholder="Search devices (e.g., iPhone 15 Pro)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        className="pl-10 h-12"
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Voice search" onClick={onVoice}>
          <Mic className="w-4 h-4" />
        </Button>
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Scan QR or Serial">
              <QrCode className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Serial/QR Verification</DialogTitle>
            </DialogHeader>
            <QRScanner onScanSuccess={() => setQrOpen(false)} />
          </DialogContent>
        </Dialog>
        {onOpenFilters && (
          <Button variant="ghost" size="icon" aria-label="Advanced filters" onClick={onOpenFilters}>
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full">
          <Command shouldFilter={false} className="rounded-md border bg-popover text-popover-foreground">
            <CommandInput placeholder="Search taxonomy..." value={value} onValueChange={onChange} />
            <CommandList>
              <CommandEmpty>No matches. Try broader terms.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {results.map((r, idx) => (
                  <CommandItem
                    key={r.node.id + idx}
                    value={r.node.name}
                    onSelect={() => {
                      onSelectPath(r.path);
                      setOpen(false);
                    }}
                  >
                    {r.path.map((p) => p.name).join(" › ")}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
