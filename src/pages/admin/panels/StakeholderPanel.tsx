import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Store,
  Wrench,
  Shield,
  Heart,
  Scale,
  Search,
  CheckCircle,
  X,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

type StakeholderType = "all" | "retailer" | "repair" | "law" | "insurance" | "ngo";
type StakeholderStatus = "all" | "pending" | "approved" | "rejected" | "suspended";

interface Stakeholder {
  id: string;
  name: string;
  type: Exclude<StakeholderType, "all">;
  status: Exclude<StakeholderStatus, "all">;
  contact: string;
  region?: string;
  created_at: string;
}

const ICON_BY_TYPE: Record<Exclude<StakeholderType, "all">, any> = {
  retailer: Store,
  repair: Wrench,
  law: Shield,
  insurance: Scale,
  ngo: Heart,
};

const StakeholderPanel = () => {
  const [activeType, setActiveType] = useState<StakeholderType>("all");
  const [activeStatus, setActiveStatus] = useState<StakeholderStatus>("pending");
  const [search, setSearch] = useState("");

  // Placeholder data (to be replaced by Supabase later)
  const stakeholders: Stakeholder[] = useMemo(
    () => [
      { id: "1", name: "TechWorld Retail", type: "retailer", status: "approved", contact: "retail@techworld.co", region: "Gauteng", created_at: new Date().toISOString() },
      { id: "2", name: "City Repairs", type: "repair", status: "pending", contact: "support@cityrepairs.io", region: "Western Cape", created_at: new Date().toISOString() },
      { id: "3", name: "Metro Police Unit", type: "law", status: "approved", contact: "le@metro.gov", region: "KZN", created_at: new Date().toISOString() },
      { id: "4", name: "SecureCover Insurance", type: "insurance", status: "pending", contact: "api@securecover.com", region: "National", created_at: new Date().toISOString() },
      { id: "5", name: "Hope Devices NGO", type: "ngo", status: "rejected", contact: "hello@hopedv.org", region: "Eastern Cape", created_at: new Date().toISOString() },
      { id: "6", name: "MegaMobile Retail", type: "retailer", status: "suspended", contact: "ops@megamobile.africa", region: "Gauteng", created_at: new Date().toISOString() },
    ],
    []
  );

  const filtered = useMemo(() => {
    return stakeholders.filter((s) => {
      const byType = activeType === "all" ? true : s.type === activeType;
      const byStatus = activeStatus === "all" ? true : s.status === activeStatus;
      const bySearch = search.trim()
        ? `${s.name} ${s.contact} ${s.region}`.toLowerCase().includes(search.toLowerCase())
        : true;
      return byType && byStatus && bySearch;
    });
  }, [stakeholders, activeType, activeStatus, search]);

  const kpis = useMemo(() => {
    const total = stakeholders.length;
    const approved = stakeholders.filter((s) => s.status === "approved").length;
    const pending = stakeholders.filter((s) => s.status === "pending").length;
    return { total, approved, pending };
  }, [stakeholders]);

  const handleAction = (id: string, action: "approve" | "reject" | "suspend" | "activate") => {
    // Placeholder action. Will be wired to Supabase edge functions later.
    toast.success(`${action.toUpperCase()} queued`, {
      description: "This action will be connected to the backend in the next step.",
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* KPI Header - Native Mobile First */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Total Stakeholders</CardTitle>
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{kpis.total}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">All types</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Approved</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{kpis.approved}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Active partners</p>
          </CardContent>
        </Card>

        <Card className="p-2 sm:p-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] sm:text-xs font-medium truncate">Pending</CardTitle>
            <Badge variant="secondary" className="text-[9px]">New</Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold">{kpis.pending}</div>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Stakeholder Types */}
      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as StakeholderType)}>
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-full min-w-max sm:grid sm:w-full sm:grid-cols-6 gap-1">
            <TabsTrigger value="all" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">All</TabsTrigger>
            <TabsTrigger value="retailer" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">Retailers</TabsTrigger>
            <TabsTrigger value="repair" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">Repair</TabsTrigger>
            <TabsTrigger value="law" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">Law</TabsTrigger>
            <TabsTrigger value="insurance" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">Insurance</TabsTrigger>
            <TabsTrigger value="ngo" className="text-[9px] sm:text-xs whitespace-nowrap px-2 sm:px-3 py-1">NGOs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeType} className="space-y-3">
          {/* Status Filters + Search */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex gap-1 sm:gap-2">
              {(["pending", "approved", "rejected", "suspended", "all"] as StakeholderStatus[]).map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={activeStatus === st ? "default" : "outline"}
                  className="h-7 sm:h-8 text-[10px] sm:text-xs"
                  onClick={() => setActiveStatus(st)}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </Button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search stakeholders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 sm:pl-9 h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="space-y-2 sm:hidden">
            {filtered.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6">No stakeholders found</div>
            ) : (
              filtered.map((s) => {
                const Icon = ICON_BY_TYPE[s.type];
                return (
                  <Card key={s.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{s.contact} • {s.region}</div>
                        </div>
                      </div>
                      <Badge variant={s.status === "approved" ? "default" : s.status === "pending" ? "secondary" : "outline"} className="text-[9px]">
                        {s.status}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(s.id, "approve")}>
                        <CheckCircle className="h-3 w-3 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(s.id, "reject")}>
                        <X className="h-3 w-3 mr-1" />Reject
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(s.id, s.status === "suspended" ? "activate" : "suspend")}>
                        <Ban className="h-3 w-3 mr-1" />{s.status === "suspended" ? "Activate" : "Suspend"}
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stakeholder</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((s) => {
                    const Icon = ICON_BY_TYPE[s.type];
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{s.name}</div>
                              <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm capitalize">{s.type}</td>
                        <td className="px-3 py-2 text-sm">{s.contact}</td>
                        <td className="px-3 py-2 text-sm">{s.region}</td>
                        <td className="px-3 py-2">
                          <Badge variant={s.status === "approved" ? "default" : s.status === "pending" ? "secondary" : "outline"}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleAction(s.id, "approve")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction(s.id, "reject")}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction(s.id, s.status === "suspended" ? "activate" : "suspend")}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StakeholderPanel;
