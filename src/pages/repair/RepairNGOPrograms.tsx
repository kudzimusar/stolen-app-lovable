import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Users, 
  Wrench, 
  Gift,
  GraduationCap,
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";

interface NGOProgram {
  id: string;
  name: string;
  organization: string;
  description: string;
  focus: string;
  location: string;
  devicesNeeded: number;
  devicesReceived: number;
  status: 'active' | 'completed' | 'urgent';
  deadline?: string;
  contact: string;
}

interface RefurbishmentProject {
  id: string;
  deviceType: string;
  quantity: number;
  ngoName: string;
  status: 'in_progress' | 'completed' | 'delivered';
  startDate: string;
  completionDate?: string;
  beneficiaries: number;
}

const RepairNGOPrograms = () => {
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [donationForm, setDonationForm] = useState({
    deviceType: "",
    quantity: "",
    condition: "",
    specifications: "",
    notes: ""
  });
  const [activePrograms, setActivePrograms] = useState<NGOProgram[]>([]);
  const [currentProjects, setCurrentProjects] = useState<RefurbishmentProject[]>([]);
  const { toast } = useToast();

  const mockPrograms: NGOProgram[] = [
    {
      id: "1",
      name: "Digital Inclusion Initiative",
      organization: "TechForAll NGO",
      description: "Providing refurbished devices to underprivileged students for online learning",
      focus: "Education",
      location: "Cape Town, Western Cape",
      devicesNeeded: 100,
      devicesReceived: 73,
      status: 'active',
      deadline: "2024-03-15",
      contact: "maria@techforall.org"
    },
    {
      id: "2",
      name: "Senior Citizens Digital Literacy",
      organization: "Elder Connect Foundation",
      description: "Teaching elderly residents to use smartphones and tablets for communication",
      focus: "Senior Care",
      location: "Johannesburg, Gauteng",
      devicesNeeded: 50,
      devicesReceived: 12,
      status: 'urgent',
      deadline: "2024-02-28",
      contact: "john@elderconnect.org"
    },
    {
      id: "3",
      name: "Rural Healthcare Communication",
      organization: "Healthcare Access Initiative",
      description: "Connecting rural healthcare workers with medical resources via mobile devices",
      focus: "Healthcare",
      location: "Limpopo Province",
      devicesNeeded: 75,
      devicesReceived: 45,
      status: 'active',
      deadline: "2024-04-01",
      contact: "dr.sarah@healthaccess.org"
    }
  ];

  const mockProjects: RefurbishmentProject[] = [
    {
      id: "1",
      deviceType: "Smartphones",
      quantity: 25,
      ngoName: "TechForAll NGO",
      status: 'in_progress',
      startDate: "2024-01-15",
      beneficiaries: 25
    },
    {
      id: "2",
      deviceType: "Tablets",
      quantity: 15,
      ngoName: "Elder Connect Foundation",
      status: 'completed',
      startDate: "2024-01-10",
      completionDate: "2024-01-20",
      beneficiaries: 15
    }
  ];

  const handleDonateDevices = () => {
    if (!selectedProgram || !donationForm.deviceType || !donationForm.quantity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const program = activePrograms.find(p => p.id === selectedProgram);
    
    toast({
      title: "Donation Submitted Successfully!",
      description: `Your donation of ${donationForm.quantity} ${donationForm.deviceType}(s) to ${program?.name} has been registered.`,
      variant: "default"
    });

    // Reset form
    setDonationForm({
      deviceType: "",
      quantity: "",
      condition: "",
      specifications: "",
      notes: ""
    });
    setSelectedProgram("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success';
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive';
      case 'completed': return 'bg-muted text-muted-foreground border-border';
      case 'in_progress': return 'bg-warning/10 text-warning border-warning';
      case 'delivered': return 'bg-success/10 text-success border-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressPercentage = (received: number, needed: number) => {
    return Math.min((received / needed) * 100, 100);
  };

  useEffect(() => {
    setActivePrograms(mockPrograms);
    setCurrentProjects(mockProjects);
    document.title = "NGO Programs | STOLEN – Community Impact & Device Donations";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="NGO Programs" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            NGO Community Programs
          </h1>
          <p className="text-muted-foreground">
            Partner with NGOs to refurbish and donate devices to communities in need
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">156</div>
            <div className="text-sm text-muted-foreground">Devices Refurbished</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">12</div>
            <div className="text-sm text-muted-foreground">NGO Partners</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">89</div>
            <div className="text-sm text-muted-foreground">Beneficiaries Helped</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">R47,250</div>
            <div className="text-sm text-muted-foreground">Tax Relief Value</div>
          </Card>
        </div>

        {/* Active Programs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active NGO Programs</h2>
          
          <div className="space-y-4">
            {activePrograms.map((program) => (
              <Card key={program.id} className="p-4 border-2 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{program.name}</h3>
                        <Badge className={getStatusColor(program.status)}>
                          {program.status === 'urgent' && <Clock className="w-3 h-3 mr-1" />}
                          {program.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          <span className="capitalize">{program.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Organization:</span> {program.organization}</p>
                        <p><span className="font-medium">Focus:</span> {program.focus}</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{program.location}</span>
                        </div>
                        {program.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Deadline: {program.deadline}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {program.devicesReceived}/{program.devicesNeeded}
                      </div>
                      <div className="text-sm text-muted-foreground">Devices</div>
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(program.devicesReceived, program.devicesNeeded)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedProgram === program.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProgram(program.id)}
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Select to Donate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Donation Form */}
        {selectedProgram && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Donate Devices for Refurbishment</h2>
            
            <div className="space-y-4">
              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  Donating to: <strong>{activePrograms.find(p => p.id === selectedProgram)?.name}</strong>
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type *</Label>
                  <Select value={donationForm.deviceType} onValueChange={(value) => setDonationForm({...donationForm, deviceType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smartphones">Smartphones</SelectItem>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="laptops">Laptops</SelectItem>
                      <SelectItem value="desktops">Desktop Computers</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={donationForm.quantity}
                    onChange={(e) => setDonationForm({...donationForm, quantity: e.target.value})}
                    placeholder="Number of devices"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Device Condition</Label>
                  <Select value={donationForm.condition} onValueChange={(value) => setDonationForm({...donationForm, condition: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working">Working (Minor cosmetic issues)</SelectItem>
                      <SelectItem value="repairable">Repairable (Functional issues)</SelectItem>
                      <SelectItem value="parts">For Parts (Hardware damage)</SelectItem>
                      <SelectItem value="unknown">Unknown Condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specifications">Specifications</Label>
                  <Input
                    id="specifications"
                    value={donationForm.specifications}
                    onChange={(e) => setDonationForm({...donationForm, specifications: e.target.value})}
                    placeholder="e.g., iPhone 12, 64GB, Unlocked"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={donationForm.notes}
                    onChange={(e) => setDonationForm({...donationForm, notes: e.target.value})}
                    placeholder="Any additional information about the devices..."
                    rows={3}
                  />
                </div>
              </div>

              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  All donated devices will be professionally refurbished and include a 6-month warranty. 
                  You'll receive a tax-deductible donation certificate.
                </AlertDescription>
              </Alert>

              <Button onClick={handleDonateDevices} className="w-full" size="lg">
                <Heart className="w-4 h-4 mr-2" />
                Submit Donation
              </Button>
            </div>
          </Card>
        )}

        {/* Current Projects */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Refurbishment Projects</h2>
          
          <div className="space-y-4">
            {currentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No active refurbishment projects</p>
              </div>
            ) : (
              currentProjects.map((project) => (
                <Card key={project.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.quantity} {project.deviceType}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status === 'in_progress' && <Wrench className="w-3 h-3 mr-1" />}
                          {project.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {project.status === 'delivered' && <Gift className="w-3 h-3 mr-1" />}
                          <span className="capitalize">{project.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">NGO:</span> {project.ngoName}</p>
                        <p><span className="font-medium">Started:</span> {project.startDate}</p>
                        {project.completionDate && (
                          <p><span className="font-medium">Completed:</span> {project.completionDate}</p>
                        )}
                        <p><span className="font-medium">Beneficiaries:</span> {project.beneficiaries} people</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Award className="w-4 h-4 mr-1" />
                        Certificate
                      </Button>
                      {project.status === 'in_progress' && (
                        <Button variant="outline" size="sm">
                          <Wrench className="w-4 h-4 mr-1" />
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Community Impact</h3>
            <p className="text-sm text-muted-foreground">
              Help bridge the digital divide by providing devices to those in need
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <Gift className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Tax Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Receive tax-deductible donation certificates for your contributions
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <Award className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Build your reputation as a socially responsible repair business
            </p>
          </Card>
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default RepairNGOPrograms;