import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TaxonomyNode } from "@/hooks/useTaxonomy";

interface Props {
  path: TaxonomyNode[];
  onClear: () => void;
  verifiedRepairOnly: boolean;
  onVerifiedRepairOnly: (v: boolean) => void;
  insuranceReadyOnly: boolean;
  onInsuranceReadyOnly: (v: boolean) => void;
}

export default function BreadcrumbBar({ path, onClear, verifiedRepairOnly, onVerifiedRepairOnly, insuranceReadyOnly, onInsuranceReadyOnly }: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); onClear(); }}>All Devices</BreadcrumbLink>
          </BreadcrumbItem>
          {path.map((p, idx) => (
            <>
              <BreadcrumbSeparator key={`sep-${p.id}`} />
              <BreadcrumbItem key={p.id}>
                {idx === path.length - 1 ? (
                  <BreadcrumbPage>{p.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href="#" onClick={(e) => e.preventDefault()}>{p.name}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Verified Repair</span>
          <Switch checked={verifiedRepairOnly} onCheckedChange={onVerifiedRepairOnly} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Insurance-ready</span>
          <Switch checked={insuranceReadyOnly} onCheckedChange={onInsuranceReadyOnly} />
        </div>
        <Button variant="outline" size="sm" onClick={onClear}>Clear</Button>
      </div>
    </div>
  );
}
