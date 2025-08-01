import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Wrench,
  Search,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  FileText,
  Camera,
  Phone,
  Mail,
  MapPin,
  Award
} from "lucide-react";

const RepairShopDashboard = () => {
  const [searchSerial, setSearchSerial] = useState("");
  const [repairForm, setRepairForm] = useState({
    deviceId: "",
    issue: "",
    cost: "",
    description: "",
    warrantyDays: "30"
  });
  const { toast } = useToast();

  // Mock repair shop data
  const shopStats = {
    devicesServiced: 2847,
    monthlyRepairs: 234,
    satisfactionScore: 4.7,
    badgeTier: "Gold",
    referralVolume: 89,
    avgRepairTime: "2.5 days",
    totalRevenue: 125430
  };

  // Mock recent repairs
  const recentRepairs = [
    {
      id: 1,
      device: "iPhone 15 Pro",
      serial: "ABC123456789",
      customer: "John Smith",
      issue: "Screen replacement",
      cost: 299,
      status: "completed",
      date: "2025-01-20",
      rating: 5,
      warrantyDays: 90
    },
    {
      id: 2,
      device: "MacBook Pro M3",
      serial: "XYZ987654321",
      customer: "Sarah Johnson",
      issue: "Battery replacement",
      cost: 189,
      status: "in_progress",
      date: "2025-01-19",
      rating: null,
      warrantyDays: 180
    },
    {
      id: 3,
      device: "Samsung Galaxy S24",
      serial: "DEF456789012",
      customer: "Mike Wilson",
      issue: "Water damage repair",
      cost: 450,
      status: "pending_parts",
      date: "2025-01-18",
      rating: null,
      warrantyDays: 60
    }
  ];

  // Mock upcoming appointments
  const appointments = [
    {
      id: 1,
      customer: "Emma Davis",
      device: "iPad Pro",
      issue: "Screen not responding",
      time: "10:00 AM",
      date: "2025-01-21",
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      customer: "Robert Chen",
      device: "iPhone 14",
      issue: "Camera malfunction",
      time: "2:30 PM", 
      date: "2025-01-21",
      phone: "+1 (555) 987-6543"
    },
    {
      id: 3,
      customer: "Lisa Anderson",
      device: "MacBook Air",
      issue: "Keyboard issues",
      time: "4:00 PM",
      date: "2025-01-21",
      phone: "+1 (555) 456-7890"
    }
  ];

  const handleDeviceSearch = () => {
    // Mock device lookup
    setRepairForm(prev => ({
      ...prev,
      deviceId: searchSerial
    }));
    
    toast({
      title: "Device Found",
      description: `iPhone 15 Pro found in STOLEN registry. Owner: John Smith`,
      variant: "default"
    });
  };

  const handleLogRepair = () => {
    toast({
      title: "Repair Logged Successfully",
      description: "Repair details have been added to the blockchain and device history updated.",
      variant: "default"
    });
    
    // Reset form
    setRepairForm({
      deviceId: "",
      issue: "",
      cost: "",
      description: "",
      warrantyDays: "30"
    });
    setSearchSerial("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "secondary";
      case "in_progress": return "secondary";
      case "pending_parts": return "secondary";
      default: return "outline";
    }
  };

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case "Gold": return "bg-yellow-100 text-yellow-800";
      case "Silver": return "bg-gray-100 text-gray-800";
      case "Bronze": return "bg-amber-100 text-amber-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="font-semibold">Repair Shop Dashboard</span>
              <Badge className={getBadgeColor(shopStats.badgeTier)}>
                <Award className="w-3 h-3 mr-1" />
                {shopStats.badgeTier} STOLEN Certified
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Performance Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{shopStats.devicesServiced.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Devices Serviced</div>
            <div className="text-xs text-success flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +{shopStats.monthlyRepairs} this month
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
              <Star className="w-6 h-6 fill-current" />
              {shopStats.satisfactionScore}
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction Score</div>
            <div className="text-xs text-muted-foreground mt-1">Based on 1,847 reviews</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{shopStats.referralVolume}%</div>
            <div className="text-sm text-muted-foreground">Referral Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg repair time: {shopStats.avgRepairTime}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${shopStats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-xs text-success flex items-center justify-center gap-1 mt-1">
              <DollarSign className="w-3 h-3" />
              Monthly growth
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Log New Repair */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Log New Repair</h2>
            
            <div className="space-y-4">
              {/* Device Search */}
              <div className="space-y-2">
                <Label>Search Device by Serial Number</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter serial number..."
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                  />
                  <Button onClick={handleDeviceSearch} disabled={!searchSerial}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {repairForm.deviceId && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-success text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Device found: iPhone 15 Pro (Owner: John Smith)
                  </div>
                </div>
              )}

              {/* Repair Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Issue Description</Label>
                  <Input 
                    placeholder="e.g., Screen replacement, Battery issue..."
                    value={repairForm.issue}
                    onChange={(e) => setRepairForm(prev => ({ ...prev, issue: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Repair Cost ($)</Label>
                    <Input 
                      type="number"
                      placeholder="299.99"
                      value={repairForm.cost}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, cost: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty (Days)</Label>
                    <Input 
                      type="number"
                      value={repairForm.warrantyDays}
                      onChange={(e) => setRepairForm(prev => ({ ...prev, warrantyDays: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <Textarea 
                    placeholder="Describe the repair work performed..."
                    value={repairForm.description}
                    onChange={(e) => setRepairForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Before/After Photos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Before photo</p>
                      <Button variant="outline" size="sm" className="mt-2">Upload</Button>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">After photo</p>
                      <Button variant="outline" size="sm" className="mt-2">Upload</Button>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={handleLogRepair}
                  disabled={!repairForm.deviceId || !repairForm.issue || !repairForm.cost}
                >
                  Log Repair to Blockchain
                </Button>
              </div>
            </div>
          </Card>

          {/* Today's Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Appointments</h2>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </div>
            
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{appointment.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.device} - {appointment.issue}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {appointment.time}
                        <Phone className="w-3 h-3 ml-2" />
                        {appointment.phone}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              Book New Appointment
            </Button>
          </Card>
        </div>

        {/* Recent Repairs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Repairs</h2>
          
          <div className="space-y-3">
            {recentRepairs.map((repair) => (
              <div key={repair.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{repair.device}</div>
                  <div className="text-sm text-muted-foreground">
                    {repair.customer} - {repair.issue}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Serial: {repair.serial}</span>
                    <span>Date: {repair.date}</span>
                    <span>Warranty: {repair.warrantyDays} days</span>
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <div className="font-bold text-lg">${repair.cost}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(repair.status)}>
                      {repair.status.replace('_', ' ')}
                    </Badge>
                    {repair.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{repair.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Customer Satisfaction
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>5 stars</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>4 stars</span>
                  <span>15%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>3 stars or less</span>
                  <span>7%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Trends
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Repairs completed</span>
                  <span className="text-success">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average repair time</span>
                  <span className="text-success">-8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer referrals</span>
                  <span className="text-success">+23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Repeat customers</span>
                  <span className="text-success">+15%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certifications
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>STOLEN Gold Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Apple Authorized Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Samsung Certified Repair</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span>Google Certification (Pending)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RepairShopDashboard;