import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { STOLENLogo } from "@/components/STOLENLogo";
import { TrustBadge } from "@/components/TrustBadge";
import { BackButton } from "@/components/BackButton";
import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Shield,
  Award,
  Edit3,
  Plus,
  Settings,
  UserCheck,
  Clock,
  DollarSign
} from "lucide-react";

const CompanyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState({
    name: "QuickFix Repair Center LLC",
    type: "Electronics Repair Service",
    registrationNumber: "CA-REG-987654321",
    licenseNumber: "REP-SF-2024-002",
    taxId: "87-9876543",
    founded: "2016",
    employeeCount: "12-25",
    headquarters: "456 Repair Avenue, San Francisco, CA 94103",
    phone: "+1 (555) 987-6543",
    email: "info@quickfix-repair.com",
    website: "https://quickfix-repair.com",
    description: "Premier electronics repair service specializing in smartphones, tablets, laptops, and gaming devices. Certified by major manufacturers with 8+ years of trusted service in the San Francisco Bay Area."
  });

  const [businessMetrics, setBusinessMetrics] = useState({
    totalRevenue: 1250000,
    devicesRepaired: 15420,
    customerSatisfaction: 4.8,
    avgRepairTime: "2.3 days",
    certificationLevel: "Gold",
    partnersCount: 8,
    warrantyRate: 99.2
  });

  const [admins] = useState([
    {
      id: 1,
      name: "Shadreck Kudzanai",
      email: "admin@quickfix.com",
      role: "Primary Administrator",
      avatar: "/placeholder.svg",
      joinDate: "March 2024",
      permissions: ["Full Access", "User Management", "Financial Reports"],
      status: "active",
      lastLogin: "2 hours ago"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@quickfix.com",
      role: "Operations Manager",
      avatar: "/placeholder.svg",
      joinDate: "June 2024",
      permissions: ["Repair Management", "Customer Service", "Inventory"],
      status: "active",
      lastLogin: "1 day ago"
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike@quickfix.com",
      role: "Technical Supervisor",
      avatar: "/placeholder.svg",
      joinDate: "August 2024",
      permissions: ["Quality Control", "Technician Training", "Equipment"],
      status: "inactive",
      lastLogin: "1 week ago"
    }
  ]);

  const handleSave = () => {
    setIsEditing(false);
    // Save to backend
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/repair-shop-dashboard" />
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="font-semibold">Company Profile</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Company Header */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">QF</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
                <TrustBadge type="secure" text="Gold Certified" />
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Business
                </Badge>
              </div>
              
              <p className="text-muted-foreground">{companyInfo.type}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Founded {companyInfo.founded}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{companyInfo.employeeCount} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Business Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${(businessMetrics.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">Annual Revenue</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {businessMetrics.devicesRepaired.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Devices Repaired</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
              <Award className="w-6 h-6" />
              {businessMetrics.customerSatisfaction}
            </div>
            <div className="text-sm text-muted-foreground">Customer Rating</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {businessMetrics.warrantyRate}%
            </div>
            <div className="text-sm text-muted-foreground">Warranty Success</div>
          </Card>
        </div>

        {/* Company Information */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Details
            </h2>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Registration Number</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.registrationNumber}
                    onChange={(e) => setCompanyInfo({...companyInfo, registrationNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.registrationNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>License Number</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.licenseNumber}
                    onChange={(e) => setCompanyInfo({...companyInfo, licenseNumber: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.licenseNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Tax ID</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.taxId}
                    onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.taxId}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Business Address</Label>
                {isEditing ? (
                  <Textarea
                    value={companyInfo.headquarters}
                    onChange={(e) => setCompanyInfo({...companyInfo, headquarters: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.headquarters}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">{companyInfo.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Website</Label>
                {isEditing ? (
                  <Input
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                  />
                ) : (
                  <p className="text-sm">
                    <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {companyInfo.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Description</Label>
            {isEditing ? (
              <Textarea
                value={companyInfo.description}
                onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                rows={3}
              />
            ) : (
              <p className="text-sm">{companyInfo.description}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          )}
        </Card>

        {/* Admin Management */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Administrator Management
            </h2>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>

          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={admin.avatar} />
                      <AvatarFallback>{admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{admin.name}</h3>
                        <Badge variant={admin.status === "active" ? "default" : "secondary"}>
                          {admin.status}
                        </Badge>
                        {admin.role === "Primary Administrator" && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-xs text-muted-foreground">{admin.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Last login: {admin.lastLogin}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/repair-shop-dashboard">
              <Building2 className="w-4 h-4 mr-3" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;