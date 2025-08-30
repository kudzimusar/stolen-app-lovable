import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AppHeader } from "@/components/AppHeader";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Eye,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Award,
  Gift,
  Handshake,
  Package,
  Zap
} from "lucide-react";

interface ServiceOffer {
  id: string;
  title: string;  
  description: string;
  serviceType: 'repair' | 'warranty' | 'diagnostic' | 'maintenance';
  deviceTypes: string[];
  price: number;
  duration: string;
  warrantyPeriod: number;
  active: boolean;
  featured: boolean;
  popularity: number;
  rating: number;
  completedJobs: number;
  location: string;
  availability: 'immediate' | 'within_24h' | 'within_week' | 'scheduled';
}

interface ReferralProgram {
  id: string;
  programName: string;
  description: string;
  rewardType: 'cash' | 'discount' | 'points';
  rewardAmount: number;
  conditions: string;
  active: boolean;
  referralsMade: number;
  rewardsClaimed: number;
}

const RepairMarketplace = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('offers');
  const [isCreateOfferOpen, setIsCreateOfferOpen] = useState(false);
  const [newOffer, setNewOffer] = useState<Partial<ServiceOffer>>({
    title: '',
    description: '',
    serviceType: 'repair',
    deviceTypes: [],
    price: 0,
    duration: '',
    warrantyPeriod: 30,
    active: true,
    featured: false
  });

  // Mock service offers
  const serviceOffers: ServiceOffer[] = [
    {
      id: "SERV-001",
      title: "iPhone Screen Replacement Special",
      description: "Professional screen replacement with genuine parts. Same-day service available.",
      serviceType: "repair",
      deviceTypes: ["iPhone 15", "iPhone 14", "iPhone 13"],
      price: 249.99,
      duration: "2-4 hours",
      warrantyPeriod: 90,
      active: true,
      featured: true,
      popularity: 95,
      rating: 4.8,
      completedJobs: 150,
      location: "San Francisco, CA",
      availability: "immediate"
    },
    {
      id: "SERV-002", 
      title: "Laptop Deep Clean & Maintenance",
      description: "Complete laptop servicing including cleaning, thermal paste replacement, and performance optimization.",
      serviceType: "maintenance",
      deviceTypes: ["MacBook", "Dell", "HP", "Lenovo"],
      price: 89.99,
      duration: "1 day",
      warrantyPeriod: 30,
      active: true,
      featured: false,
      popularity: 78,
      rating: 4.6,
      completedJobs: 89,
      location: "San Francisco, CA",
      availability: "within_24h"
    },
    {
      id: "SERV-003",
      title: "Water Damage Recovery Pro",
      description: "Emergency water damage recovery service with 48-hour turnaround guarantee.",
      serviceType: "repair",
      deviceTypes: ["Smartphone", "Tablet", "Laptop"],
      price: 199.99,
      duration: "1-2 days",
      warrantyPeriod: 60,
      active: true,
      featured: true,
      popularity: 92,
      rating: 4.9,
      completedJobs: 67,
      location: "San Francisco, CA",
      availability: "immediate"
    }
  ];

  // Mock referral programs
  const referralPrograms: ReferralProgram[] = [
    {
      id: "REF-001",
      programName: "New Customer Referral",
      description: "Earn $25 for each new customer you refer who completes a repair over $100",
      rewardType: "cash",
      rewardAmount: 25,
      conditions: "Customer must complete repair worth $100+",
      active: true,
      referralsMade: 12,
      rewardsClaimed: 8
    },
    {
      id: "REF-002",
      programName: "Bulk Device Program",
      description: "Special rewards for referring customers with multiple devices",
      rewardType: "points",
      rewardAmount: 500,
      conditions: "Customer must repair 2+ devices",
      active: true,
      referralsMade: 5,
      rewardsClaimed: 5
    }
  ];

  const handleCreateOffer = () => {
    toast({
      title: "Service Offer Created",
      description: "Your offer is now live in the marketplace",
    });
    setIsCreateOfferOpen(false);
    setNewOffer({
      title: '',
      description: '',
      serviceType: 'repair',
      deviceTypes: [],
      price: 0,
      duration: '',
      warrantyPeriod: 30,
      active: true,
      featured: false
    });
  };

  const handleToggleOffer = (offerId: string) => {
    toast({
      title: "Offer Updated",
      description: "Service offer status has been changed",
    });
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'repair': return 'bg-primary/10 text-primary';
      case 'warranty': return 'bg-success/10 text-success';
      case 'diagnostic': return 'bg-warning/10 text-warning';
      case 'maintenance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'immediate': return 'bg-green-100 text-green-800';
      case 'within_24h': return 'bg-blue-100 text-blue-800';
      case 'within_week': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Repair Marketplace" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/repair-shop-dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              Repair Marketplace
            </h1>
            <p className="text-muted-foreground">Manage your service offerings and referral programs</p>
          </div>
          <Button onClick={() => setIsCreateOfferOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Offer
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'offers' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('offers')}
          >
            <Package className="w-4 h-4 mr-2" />
            Service Offers
          </Button>
          <Button
            variant={activeTab === 'referrals' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('referrals')}
          >
            <Gift className="w-4 h-4 mr-2" />
            Referral Programs
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('analytics')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </Button>
        </div>

        {/* Service Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{serviceOffers.length}</div>
                <div className="text-sm text-muted-foreground">Active Offers</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {serviceOffers.reduce((sum, offer) => sum + offer.completedJobs, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Jobs Completed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {(serviceOffers.reduce((sum, offer) => sum + offer.rating, 0) / serviceOffers.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${serviceOffers.reduce((sum, offer) => sum + (offer.price * offer.completedJobs), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </Card>
            </div>

            {/* Service Offers List */}
            <div className="space-y-4">
              {serviceOffers.map((offer) => (
                <Card key={offer.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{offer.title}</h3>
                        <Badge className={getServiceTypeColor(offer.serviceType)}>
                          {offer.serviceType}
                        </Badge>
                        {offer.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge className={getAvailabilityColor(offer.availability)}>
                          <Clock className="w-3 h-3 mr-1" />
                          {offer.availability.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground">{offer.description}</p>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">${offer.price}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{offer.duration}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{offer.rating} ({offer.completedJobs} jobs)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span>{offer.warrantyPeriod} day warranty</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div><strong>Devices:</strong> {offer.deviceTypes.join(", ")}</div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{offer.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Switch
                        checked={offer.active}
                        onCheckedChange={() => handleToggleOffer(offer.id)}
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Referral Programs Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Referral Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {referralPrograms.reduce((sum, program) => sum + program.referralsMade, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {referralPrograms.reduce((sum, program) => sum + program.rewardsClaimed, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Rewards Claimed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {referralPrograms.filter(p => p.active).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Programs</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${referralPrograms.reduce((sum, program) => sum + (program.rewardAmount * program.rewardsClaimed), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
              </Card>
            </div>

            {/* Referral Programs List */}
            <div className="space-y-4">
              {referralPrograms.map((program) => (
                <Card key={program.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{program.programName}</h3>
                        <Badge variant={program.active ? "default" : "secondary"}>
                          {program.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground">{program.description}</p>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div><strong>Reward:</strong> ${program.rewardAmount} {program.rewardType}</div>
                          <div><strong>Conditions:</strong> {program.conditions}</div>
                        </div>
                        <div className="space-y-1">
                          <div><strong>Referrals Made:</strong> {program.referralsMade}</div>
                          <div><strong>Rewards Claimed:</strong> {program.rewardsClaimed}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Handshake className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Marketplace Performance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Top Performing Services</h3>
                  {serviceOffers
                    .sort((a, b) => b.completedJobs - a.completedJobs)
                    .slice(0, 3)
                    .map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-sm text-muted-foreground">{offer.completedJobs} jobs completed</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${(offer.price * offer.completedJobs).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Recent Activity</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-success" />
                      <span>New 5-star review received</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span>3 new service bookings today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-yellow-600" />
                      <span>2 referral rewards claimed</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Create Offer Modal */}
        <Dialog open={isCreateOfferOpen} onOpenChange={setIsCreateOfferOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Service Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Title</Label>
                  <Input
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                    placeholder="e.g., iPhone Screen Replacement"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select 
                    value={newOffer.serviceType} 
                    onValueChange={(value: any) => setNewOffer({...newOffer, serviceType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="warranty">Warranty Extension</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  placeholder="Describe your service offering..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={newOffer.price}
                    onChange={(e) => setNewOffer({...newOffer, price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={newOffer.duration}
                    onChange={(e) => setNewOffer({...newOffer, duration: e.target.value})}
                    placeholder="e.g., 2-4 hours"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Warranty (days)</Label>
                  <Input
                    type="number"
                    value={newOffer.warrantyPeriod}
                    onChange={(e) => setNewOffer({...newOffer, warrantyPeriod: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newOffer.featured}
                    onCheckedChange={(checked) => setNewOffer({...newOffer, featured: checked})}
                  />
                  <Label>Featured Offer</Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleCreateOffer} className="flex-1">
                  Create Offer
                </Button>
                <Button variant="outline" onClick={() => setIsCreateOfferOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RepairMarketplace;