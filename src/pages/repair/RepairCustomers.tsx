import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from "@/components/navigation/AppHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Eye,
  Edit,
  MessageCircle,
  Filter,
  Download,
  UserPlus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench
} from "lucide-react";

const RepairCustomers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock customer database
  const [customers] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+27 82 123 4567",
      address: "123 Main St, Cape Town, 8001",
      totalRepairs: 8,
      totalSpent: 2450,
      lastVisit: "2024-01-15",
      customerSince: "2022-06-15",
      status: "vip",
      rating: 5,
      notes: "Prefers Apple repairs, always on time for appointments",
      devices: [
        { type: "iPhone 13 Pro", serial: "F2LJ3K4M5N6P", lastRepair: "2024-01-15", issue: "Screen replacement" },
        { type: "MacBook Pro", serial: "C02X1AB2MD6R", lastRepair: "2023-11-20", issue: "Battery replacement" }
      ]
    },
    {
      id: "2", 
      name: "Michael Chen",
      email: "m.chen@business.co.za",
      phone: "+27 84 987 6543",
      address: "456 Business Rd, Johannesburg, 2000",
      totalRepairs: 12,
      totalSpent: 3850,
      lastVisit: "2024-01-12",
      customerSince: "2021-03-10",
      status: "regular",
      rating: 4,
      notes: "Corporate account, bulk repairs for office equipment",
      devices: [
        { type: "Samsung Galaxy S22", serial: "SM-G991B123456", lastRepair: "2024-01-12", issue: "Charging port" },
        { type: "iPad Pro", serial: "DMRK2B/A789", lastRepair: "2023-12-05", issue: "Screen repair" }
      ]
    },
    {
      id: "3",
      name: "Lisa Williams",
      email: "lisa.w@gmail.com", 
      phone: "+27 72 555 1234",
      address: "789 Sunset Ave, Durban, 4001",
      totalRepairs: 3,
      totalSpent: 895,
      lastVisit: "2024-01-08",
      customerSince: "2023-08-22",
      status: "new",
      rating: 5,
      notes: "First-time smartphone owner, needs extra care with explanations",
      devices: [
        { type: "iPhone 12", serial: "F2LM8K9P2Q3R", lastRepair: "2024-01-08", issue: "Water damage recovery" }
      ]
    },
    {
      id: "4",
      name: "David Patel",
      email: "david.patel@tech.com",
      phone: "+27 83 444 7890",
      address: "321 Tech Street, Pretoria, 0001", 
      totalRepairs: 5,
      totalSpent: 1650,
      lastVisit: "2023-12-20",
      customerSince: "2022-11-30",
      status: "regular",
      rating: 4,
      notes: "Tech enthusiast, always interested in repair process details",
      devices: [
        { type: "Google Pixel 7", serial: "GP7-ABC123DEF", lastRepair: "2023-12-20", issue: "Camera module" },
        { type: "Samsung Galaxy Tab", serial: "SM-T870N456", lastRepair: "2023-11-15", issue: "Battery replacement" }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip": return "bg-brand-purple text-white";
      case "regular": return "bg-primary text-primary-foreground";
      case "new": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "vip": return "VIP Customer";
      case "regular": return "Regular";
      case "new": return "New Customer";
      default: return "Unknown";
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Database</h1>
            <p className="text-muted-foreground">Manage customer relationships and repair history</p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP Customers</p>
                <p className="text-2xl font-bold text-brand-purple">
                  {customers.filter(c => c.status === "vip").length}
                </p>
              </div>
              <Star className="w-8 h-8 text-brand-purple" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold text-success">
                  {customers.filter(c => c.status === "new").length}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(customers.reduce((sum, c) => sum + c.rating, 0) / customers.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">All Customers</option>
            <option value="vip">VIP Customers</option>
            <option value="regular">Regular Customers</option>
            <option value="new">New Customers</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Customer List */}
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
                        <Badge className={getStatusColor(customer.status)}>
                          {getStatusText(customer.status)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-current" />
                          <span className="text-sm font-medium text-foreground">{customer.rating}.0</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{customer.totalRepairs} repairs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">Last visit: {new Date(customer.lastVisit).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Spent: </span>
                          <span className="font-semibold text-foreground">{formatCurrency(customer.totalSpent)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Customer Since: </span>
                          <span className="font-semibold text-foreground">{new Date(customer.customerSince).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {customer.notes && (
                        <p className="text-sm text-muted-foreground italic">"{customer.notes}"</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedCustomer.name}</h2>
                    <Badge className={getStatusColor(selectedCustomer.status)}>
                      {getStatusText(selectedCustomer.status)}
                    </Badge>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedCustomer.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">Customer since {new Date(selectedCustomer.customerSince).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Customer Stats */}
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{selectedCustomer.totalRepairs}</p>
                        <p className="text-sm text-muted-foreground">Total Repairs</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedCustomer.totalSpent)}</p>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{selectedCustomer.rating}.0</p>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{selectedCustomer.devices.length}</p>
                        <p className="text-sm text-muted-foreground">Devices</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Device History */}
                <Card className="p-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Device & Repair History</h3>
                  <div className="space-y-3">
                    {selectedCustomer.devices.map((device: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{device.type}</p>
                          <p className="text-sm text-muted-foreground">Serial: {device.serial}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{device.issue}</p>
                          <p className="text-sm text-muted-foreground">{new Date(device.lastRepair).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Notes Section */}
                <Card className="p-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Notes</h3>
                  <Textarea
                    value={selectedCustomer.notes}
                    placeholder="Add notes about this customer..."
                    rows={4}
                    className="w-full"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">Save Notes</Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairCustomers;