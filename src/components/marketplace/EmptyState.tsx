import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SearchResult } from "@/hooks/useTaxonomy";

interface Props {
  suggestions: SearchResult[];
  onApplySuggestion: (s: SearchResult) => void;
}

export default function EmptyState({ suggestions, onApplySuggestion }: Props) {
  const { toast } = useToast();

  return (
    <Card className="p-12 text-center">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No direct matches</h3>
          <p className="text-muted-foreground">Try a nearby taxonomy path or create an alert to be notified.</p>
        </div>

        {suggestions.length > 0 && (
          <div className="max-w-xl mx-auto text-left">
            <div className="text-sm font-medium mb-2">Suggested paths</div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.slice(0, 6).map((s) => (
                <li key={s.node.id}>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onApplySuggestion(s)}>
                    {s.path.map((p) => p.name).join(" › ")}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={() =>
              toast({ title: "Alert created", description: "We will notify you when similar devices appear." })
            }
          >
            Create Alert
          </Button>
          <Button variant="outline" asChild>
            <Link to="/reverse-verify">Reverse Verification</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
