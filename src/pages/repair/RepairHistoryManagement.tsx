import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Edit,
  FileText,
  Award,
  User,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Package,
  Receipt
} from "lucide-react";

interface RepairRecord {
  id: string;
  deviceId: string;
  deviceBrand: string;
  deviceModel: string;
  customerName: string;
  issueDescription: string;
  repairDate: string;
  completionDate?: string;
  cost: number;
  status: 'pending' | 'in_progress' | 'completed' | 'warranty_claim';
  warrantyDays: number;
  partsReplaced: string[];
  invoiceNumber: string;
  trustBadgeEarned: boolean;
  notes?: string;
}

const RepairHistoryManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<RepairRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock data
  const repairRecords: RepairRecord[] = [
    {
      id: "REP-2024-001",
      deviceId: "DEV-ABC123",
      deviceBrand: "Apple",
      deviceModel: "iPhone 15 Pro",
      customerName: "John Smith",
      issueDescription: "Screen replacement after drop damage",
      repairDate: "2024-01-20",
      completionDate: "2024-01-20",
      cost: 299.99,
      status: "completed",
      warrantyDays: 90,
      partsReplaced: ["OLED Display Assembly", "Front Glass"],
      invoiceNumber: "INV-2024-0157",
      trustBadgeEarned: true,
      notes: "Customer satisfied with repair quality. No issues found during testing."
    },
    {
      id: "REP-2024-002", 
      deviceId: "DEV-XYZ456",
      deviceBrand: "Samsung",
      deviceModel: "Galaxy S24",
      customerName: "Sarah Johnson", 
      issueDescription: "Battery replacement - poor battery life",
      repairDate: "2024-01-19",
      cost: 189.99,
      status: "in_progress",
      warrantyDays: 180,
      partsReplaced: ["Battery Pack"],
      invoiceNumber: "INV-2024-0156",
      trustBadgeEarned: false,
      notes: "Waiting for battery calibration. Device testing in progress."
    },
    {
      id: "REP-2024-003",
      deviceId: "DEV-DEF789",
      deviceBrand: "Apple",
      deviceModel: "MacBook Pro M3",
      customerName: "Mike Wilson",
      issueDescription: "Keyboard malfunction - multiple keys not responding",
      repairDate: "2024-01-18",
      cost: 450.00,
      status: "warranty_claim",
      warrantyDays: 365,
      partsReplaced: ["Top Case with Keyboard"],
      invoiceNumber: "INV-2024-0155",
      trustBadgeEarned: false,
      notes: "Apple warranty claim approved. Parts ordered from authorized supplier."
    }
  ];

  const filteredRecords = repairRecords.filter(record => {
    const matchesSearch = 
      record.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || (() => {
      const recordDate = new Date(record.repairDate);
      const now = new Date();
      switch (dateFilter) {
        case "today":
          return recordDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return recordDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return recordDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary';
      case 'pending': return 'bg-warning/10 text-warning border-warning';
      case 'warranty_claim': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'warranty_claim': return <Award className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleUpdateRecord = (record: RepairRecord) => {
    toast({
      title: "Repair Record Updated",
      description: "Changes saved to blockchain and customer notified",
    });
    setIsEditModalOpen(false);
    setSelectedRecord(null);
  };

  const handleAssignTrustBadge = (recordId: string) => {
    toast({
      title: "Trust Badge Assigned",
      description: "Device now carries 'Verified Repair' badge",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Repair History" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header & Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Repair History Management</h1>
              <p className="text-muted-foreground">Track and manage all repair records</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Receipt className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{repairRecords.length}</div>
              <div className="text-sm text-muted-foreground">Total Repairs</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {repairRecords.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {repairRecords.filter(r => r.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {repairRecords.filter(r => r.trustBadgeEarned).length}
              </div>
              <div className="text-sm text-muted-foreground">Trust Badges</div>
            </Card>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search repairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="warranty_claim">Warranty Claim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Repair Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="p-2 bg-primary/10 rounded">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{record.deviceBrand} {record.deviceModel}</h3>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status.replace('_', ' ')}</span>
                      </Badge>
                      {record.trustBadgeEarned && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Award className="w-3 h-3 mr-1" />
                          Verified Repair
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{record.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{record.repairDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${record.cost}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div><strong>Issue:</strong> {record.issueDescription}</div>
                        <div><strong>Parts:</strong> {record.partsReplaced.join(", ")}</div>
                        <div><strong>Warranty:</strong> {record.warrantyDays} days</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Repair Record Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Record ID:</strong> {record.id}<br/>
                            <strong>Device ID:</strong> {record.deviceId}<br/>
                            <strong>Invoice:</strong> {record.invoiceNumber}
                          </div>
                          <div>
                            <strong>Customer:</strong> {record.customerName}<br/>
                            <strong>Repair Date:</strong> {record.repairDate}<br/>
                            <strong>Completion:</strong> {record.completionDate || "In Progress"}
                          </div>
                        </div>
                        {record.notes && (
                          <div>
                            <strong>Notes:</strong>
                            <p className="mt-1 text-sm text-muted-foreground">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  {record.status === 'completed' && !record.trustBadgeEarned && (
                    <Button 
                      size="sm"
                      onClick={() => handleAssignTrustBadge(record.id)}
                    >
                      <Award className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Repair Record</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue={selectedRecord.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="warranty_claim">Warranty Claim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cost ($)</Label>
                    <Input defaultValue={selectedRecord.cost.toString()} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Parts Replaced</Label>
                  <Input defaultValue={selectedRecord.partsReplaced.join(", ")} />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea defaultValue={selectedRecord.notes} rows={3} />
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => handleUpdateRecord(selectedRecord)} className="flex-1">
                    Update Record
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RepairHistoryManagement;