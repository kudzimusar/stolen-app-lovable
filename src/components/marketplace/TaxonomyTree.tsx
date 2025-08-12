import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { TaxonomyNode, useTaxonomy } from "@/hooks/useTaxonomy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  selectedPath: TaxonomyNode[];
  onSelectPath: (path: TaxonomyNode[]) => void;
}

function NodeList({ nodes, path, onSelectPath }: { nodes: TaxonomyNode[]; path: TaxonomyNode[]; onSelectPath: (p: TaxonomyNode[]) => void }) {
  return (
    <ul className="space-y-1">
      {nodes.map((n) => (
        <li key={n.id}>
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => onSelectPath([...path, n])}
          >
            <span className="truncate text-left">{n.name}</span>
            {n.children?.length ? <ChevronRight className="w-4 h-4" /> : null}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default function TaxonomyTree({ selectedPath, onSelectPath }: Props) {
  const { roots, nextChildren } = useTaxonomy();
  const [path, setPath] = useState<TaxonomyNode[]>(selectedPath);

  const children = path.length ? path[path.length - 1].children ?? [] : roots;

  const onSelect = (p: TaxonomyNode[]) => {
    setPath(p);
    onSelectPath(p);
  };

  const onBack = () => {
    const p = path.slice(0, -1);
    setPath(p);
    onSelectPath(p);
  };

  return (
    <Card className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground truncate">
          {path.length ? path.map((p) => p.name).join(" › ") : "All Devices"}
        </div>
        {path.length > 0 && (
          <Button size="sm" variant="outline" onClick={onBack}>Back</Button>
        )}
      </div>

      {path.length === 0 ? (
        <NodeList nodes={roots} path={[]} onSelectPath={onSelect} />
      ) : (
        <NodeList nodes={children} path={path} onSelectPath={onSelect} />
      )}

      {path.length > 0 && children.length === 0 && (
        <div className="text-sm text-muted-foreground">No deeper levels</div>
      )}
    </Card>
  );
}
