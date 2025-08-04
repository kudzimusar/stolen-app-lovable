import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Calendar, DollarSign, Award, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RepairRecord {
  id: string;
  device_id: string;
  issue_description: string;
  repair_description: string;
  repair_date: string;
  cost: number;
  warranty_period_days: number;
  verified: boolean;
  device_name?: string;
  device_model?: string;
  repair_shop_name?: string;
}

const UserRepairHistory = () => {
  const [repairHistory, setRepairHistory] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchRepairHistory();
  }, []);

  const fetchRepairHistory = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view your repair history");
        return;
      }

      // Fetch repair history for user's devices
      const { data, error } = await supabase
        .from('repair_history')
        .select(`
          *,
          devices!inner(
            device_name,
            model,
            current_owner_id
          )
        `)
        .eq('devices.current_owner_id', user.id)
        .order('repair_date', { ascending: false });

      if (error) {
        console.error('Error fetching repair history:', error);
        toast.error("Failed to load repair history");
        return;
      }

      // Transform the data to flatten device information
      const transformedData = data?.map(record => ({
        ...record,
        device_name: record.devices?.device_name,
        device_model: record.devices?.model,
      })) || [];

      setRepairHistory(transformedData);
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred while loading repair history");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getWarrantyStatus = (repairDate: string, warrantyDays: number) => {
    const repairDateTime = new Date(repairDate);
    const warrantyEndDate = new Date(repairDateTime.getTime() + warrantyDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    if (now <= warrantyEndDate) {
      const daysLeft = Math.ceil((warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { active: true, daysLeft };
    }
    return { active: false, daysLeft: 0 };
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Repair History" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="w-8 h-8 text-primary" />
            Repair History
          </h1>
          <p className="text-muted-foreground">
            View all repairs performed on your registered devices
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{repairHistory.length}</div>
            <div className="text-sm text-muted-foreground">Total Repairs</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {repairHistory.filter(r => r.verified).length}
            </div>
            <div className="text-sm text-muted-foreground">Verified Repairs</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {repairHistory.filter(r => {
                const warranty = getWarrantyStatus(r.repair_date, r.warranty_period_days);
                return warranty.active;
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Warranties</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(repairHistory.reduce((sum, r) => sum + (r.cost || 0), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </Card>
        </div>

        {/* Repair Records */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading repair history...</p>
            </div>
          ) : repairHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Repair History</h3>
              <p className="text-muted-foreground mb-4">
                Your devices haven't been repaired yet, or repair records haven't been logged.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Go Back
              </Button>
            </Card>
          ) : (
            repairHistory.map((repair) => {
              const warranty = getWarrantyStatus(repair.repair_date, repair.warranty_period_days);
              
              return (
                <Card key={repair.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {repair.device_name} {repair.device_model}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {repair.verified ? (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              <Award className="w-3 h-3 mr-1" />
                              Verified Repair
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                          
                          {warranty.active && (
                            <Badge variant="outline" className="text-success border-success">
                              Warranty Active ({warranty.daysLeft} days left)
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {repair.cost && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(repair.cost)}
                          </div>
                          <div className="text-sm text-muted-foreground">Repair Cost</div>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Issue Description</h4>
                          <p className="text-sm">{repair.issue_description}</p>
                        </div>
                        
                        {repair.repair_description && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Repair Work Done</h4>
                            <p className="text-sm">{repair.repair_description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Repair Date:</span>
                          <span>{formatDate(repair.repair_date)}</span>
                        </div>
                        
                        {repair.warranty_period_days > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Warranty:</span>
                            <span>{repair.warranty_period_days} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default UserRepairHistory;