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
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import DataManagementToolbar from "@/components/admin/DataManagementToolbar";

type StakeholderType = "all" | "retailer" | "repair" | "law" | "insurance" | "ngo";
type StakeholderStatus = "all" | "pending" | "approved" | "rejected" | "suspended";

interface Stakeholder {
  user_id: string;
  email: string;
  display_name: string;
  role: Exclude<StakeholderType, "all">;
  verification_status: boolean;
  phone?: string;
  address?: any;
  created_at: string;
  stakeholder_id?: string;
  business_name?: string;
  business_type?: string;
  license_number?: string;
  approval_status?: Exclude<StakeholderStatus, "all">;
  approval_level?: string;
  approval_date?: string;
  approved_by?: string;
  admin_notes?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  device_count: number;
  report_count: number;
  listing_count: number;
  stakeholder_updated_at?: string;
}

const ICON_BY_TYPE: Record<Exclude<StakeholderType, "all">, any> = {
  retailer: Store,
  repair: Wrench,
  law: Shield,
  insurance: Scale,
  ngo: Heart,
};

interface StakeholderPanelProps {
  readOnly?: boolean;
  roleFilter?: string;
}

const StakeholderPanel = ({ readOnly = false, roleFilter }: StakeholderPanelProps = {}) => {
  const { getAuthToken } = useAuth();
  const [activeType, setActiveType] = useState<StakeholderType>("all");
  const [activeStatus, setActiveStatus] = useState<StakeholderStatus>("pending");
  const [search, setSearch] = useState("");
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_stakeholders: 0,
    pending_approvals: 0,
    approved_stakeholders: 0,
    suspended_stakeholders: 0,
    retailers: 0,
    repair_shops: 0,
    law_enforcement: 0,
    insurance_partners: 0,
    ngos: 0,
  });

  // Fetch stakeholders from database
  const fetchStakeholders = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch('/api/v1/admin/stakeholders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'list_stakeholders',
          stakeholder_type: activeType,
          status: activeStatus,
          search: search,
          limit: 100,
          offset: 0
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStakeholders(data.stakeholders || []);
      } else {
        toast.error('Failed to fetch stakeholders: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching stakeholders:', error);
      toast.error('Failed to fetch stakeholders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stakeholder statistics
  const fetchStats = async () => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/v1/admin/stakeholders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_stats'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stakeholder stats:', error);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStakeholders();
  }, [activeType, activeStatus, search]);

  const filtered = stakeholders;

  const kpis = useMemo(() => {
    return { 
      total: stats.total_stakeholders, 
      approved: stats.approved_stakeholders, 
      pending: stats.pending_approvals 
    };
  }, [stats]);

  // Stakeholder action functions
  const handleAction = async (stakeholder: Stakeholder, action: "approve" | "reject" | "suspend" | "activate") => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch('/api/v1/admin/stakeholders/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          user_id: stakeholder.user_id,
          admin_notes: `${action} by admin`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || `${action} successful`);
        // Refresh the data
        fetchStakeholders();
        fetchStats();
      } else {
        toast.error('Failed to ' + action + ': ' + data.error);
      }
    } catch (error) {
      console.error(`Error ${action} stakeholder:`, error);
      toast.error(`Failed to ${action} stakeholder`);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold">Stakeholder Management</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Review and manage stakeholder registrations and approvals</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchStakeholders();
            fetchStats();
          }}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

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

      {/* Data Management Toolbar */}
      <DataManagementToolbar
        dataType="stakeholder_registrations"
        data={filtered}
        onImportComplete={async (importedData) => {
          console.log('Imported stakeholders:', importedData);
          toast.success(`${importedData.length} stakeholders imported successfully`);
          await fetchStakeholders();
        }}
        showTemplateDownload={true}
        showImport={true}
        showExport={true}
        label="Stakeholder Data Management"
      />

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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading stakeholders...</span>
            </div>
          )}

          {/* Mobile Card List */}
          <div className="space-y-2 sm:hidden">
            {!loading && filtered.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-6">No stakeholders found</div>
            ) : !loading ? (
              filtered.map((s) => {
                const Icon = ICON_BY_TYPE[s.role];
                const displayName = s.business_name || s.display_name || s.email;
                const contact = s.contact_email || s.contact_phone || s.email;
                const region = s.address?.region || s.address?.province || 'N/A';
                
                return (
                  <Card key={s.user_id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{displayName}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{contact} • {region}</div>
                        </div>
                      </div>
                      <Badge variant={s.approval_status === "approved" ? "default" : s.approval_status === "pending" ? "secondary" : "outline"} className="text-[9px]">
                        {s.approval_status}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(s, "approve")}>
                        <CheckCircle className="h-3 w-3 mr-1" />Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(s, "reject")}>
                        <X className="h-3 w-3 mr-1" />Reject
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleAction(s, s.approval_status === "suspended" ? "activate" : "suspend")}>
                        <Ban className="h-3 w-3 mr-1" />{s.approval_status === "suspended" ? "Activate" : "Suspend"}
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : null}
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
                    const Icon = ICON_BY_TYPE[s.role];
                    const displayName = s.business_name || s.display_name || s.email;
                    const contact = s.contact_email || s.contact_phone || s.email;
                    const region = s.address?.region || s.address?.province || 'N/A';
                    
                    return (
                      <tr key={s.user_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{displayName}</div>
                              <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm capitalize">{s.role}</td>
                        <td className="px-3 py-2 text-sm">{contact}</td>
                        <td className="px-3 py-2 text-sm">{region}</td>
                        <td className="px-3 py-2">
                          <Badge variant={s.approval_status === "approved" ? "default" : s.approval_status === "pending" ? "secondary" : "outline"}>
                            {s.approval_status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleAction(s, "approve")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction(s, "reject")}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction(s, s.approval_status === "suspended" ? "activate" : "suspend")}>
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
