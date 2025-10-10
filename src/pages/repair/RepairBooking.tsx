import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BackButton } from "@/components/navigation/BackButton";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAuthToken } from "@/lib/auth";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  MessageCircle,
  CheckCircle,
  Award,
  Camera,
  DollarSign
} from "lucide-react";

interface RepairShop {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  specializations: string[];
  avatar: string;
  address: string;
  phone: string;
  email: string;
  certified: boolean;
  estimatedTime: string;
  pricing: string;
}

const RepairBooking = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('deviceId');
  
  const [selectedShop, setSelectedShop] = useState<RepairShop | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    brand: "",
    model: "",
    issue: "",
    description: "",
    urgency: "normal"
  });
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const repairShops: RepairShop[] = [
    {
      id: "1",
      name: "QuickFix Repair Center",
      rating: 4.8,
      reviews: 247,
      distance: "0.5 km",
      specializations: ["iPhone", "Samsung", "Water Damage"],
      avatar: "/placeholder.svg",
      address: "123 Tech Street, City Center",
      phone: "+1 (555) 123-4567",
      email: "info@quickfix.com",
      certified: true,
      estimatedTime: "2-4 hours",
      pricing: "$50-200"
    },
    {
      id: "2", 
      name: "Mobile Medics",
      rating: 4.9,
      reviews: 189,
      distance: "1.2 km",
      specializations: ["Battery", "Screen", "Camera"],
      avatar: "/placeholder.svg",
      address: "456 Repair Ave, Downtown",
      phone: "+1 (555) 987-6543",
      email: "help@mobilemedics.com",
      certified: true,
      estimatedTime: "1-3 hours",
      pricing: "$40-180"
    },
    {
      id: "3",
      name: "TechFix Pro",
      rating: 4.7,
      reviews: 156,
      distance: "2.1 km",
      specializations: ["MacBook", "iPad", "Complex Repairs"],
      avatar: "/placeholder.svg",
      address: "789 Innovation Blvd, Tech District",
      phone: "+1 (555) 456-7890",
      email: "service@techfixpro.com", 
      certified: true,
      estimatedTime: "4-8 hours",
      pricing: "$80-350"
    }
  ];

  const fetchDeviceData = async () => {
    if (!deviceId) return;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No auth token available');
      }

      const { data: deviceData, error } = await supabase
        .from('devices')
        .select('device_name, brand, model, serial_number')
        .eq('id', deviceId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch device: ${error.message}`);
      }

      if (deviceData) {
        setDeviceInfo(prev => ({
          ...prev,
          brand: deviceData.brand || '',
          model: `${deviceData.brand} ${deviceData.model}` || deviceData.device_name || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching device data:', error);
      toast({
        title: "Error Loading Device",
        description: error instanceof Error ? error.message : "Failed to load device data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookRepair = () => {
    if (!selectedShop || !deviceInfo.brand || !deviceInfo.model || !deviceInfo.issue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Repair Booked Successfully!",
      description: `Your repair request has been sent to ${selectedShop.name}. They will contact you within 2 hours.`,
      variant: "default"
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 4));
  };

  useEffect(() => {
    document.title = "Book Repair | STOLEN – Find Verified Repair Shops";
    fetchDeviceData();
  }, [deviceId]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Book Repair" showLogo={true} />
      
      <div className="container mx-auto px-4 py-4">
        <BackButton to="/dashboard" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Book a Repair</h1>
          <p className="text-muted-foreground">
            Find verified repair shops near you and book your device repair
          </p>
        </div>

        {/* Device Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Device Information</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Device Brand *</Label>
              <Select value={deviceInfo.brand} onValueChange={(value) => setDeviceInfo({...deviceInfo, brand: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="samsung">Samsung</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="huawei">Huawei</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Device Model *</Label>
              <Input
                id="model"
                value={deviceInfo.model}
                onChange={(e) => setDeviceInfo({...deviceInfo, model: e.target.value})}
                placeholder="e.g. iPhone 15 Pro, Galaxy S24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Issue Type *</Label>
              <Select value={deviceInfo.issue} onValueChange={(value) => setDeviceInfo({...deviceInfo, issue: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Cracked/Broken Screen</SelectItem>
                  <SelectItem value="battery">Battery Issues</SelectItem>
                  <SelectItem value="camera">Camera Problems</SelectItem>
                  <SelectItem value="water">Water Damage</SelectItem>
                  <SelectItem value="charging">Charging Issues</SelectItem>
                  <SelectItem value="software">Software Problems</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={deviceInfo.urgency} onValueChange={(value) => setDeviceInfo({...deviceInfo, urgency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (1-2 weeks)</SelectItem>
                  <SelectItem value="normal">Normal (Few days)</SelectItem>
                  <SelectItem value="high">High (Same day)</SelectItem>
                  <SelectItem value="urgent">Urgent (Within hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={deviceInfo.description}
                onChange={(e) => setDeviceInfo({...deviceInfo, description: e.target.value})}
                placeholder="Describe the issue in detail..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Upload Photos (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-primary-foreground"
                />
                <span className="text-sm text-muted-foreground">
                  {photos.length}/4 photos
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Repair Shops */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Nearby Verified Repair Shops</h2>
          
          <div className="grid gap-4">
            {repairShops.map((shop) => (
              <Card 
                key={shop.id} 
                className={`p-6 cursor-pointer transition-all ${
                  selectedShop?.id === shop.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedShop(shop)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={shop.avatar} />
                    <AvatarFallback>{shop.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{shop.name}</h3>
                          {shop.certified && <TrustBadge type="verified" text="STOLEN Certified" />}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{shop.rating}</span>
                            <span>({shop.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{shop.distance} away</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-success">{shop.pricing}</div>
                        <div className="text-sm text-muted-foreground">Est. Cost</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {shop.specializations.map((spec) => (
                        <Badge key={spec} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Est. Time: {shop.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{shop.address}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking Details */}
        {selectedShop && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Appointment</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Repair Shop:</span>
                  <span className="font-medium">{selectedShop.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span>{deviceInfo.brand} {deviceInfo.model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issue:</span>
                  <span>{deviceInfo.issue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <span className="font-medium text-success">{selectedShop.pricing}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{selectedShop.estimatedTime}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleBookRepair} className="w-full" size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Book Repair Appointment
            </Button>
          </Card>
        )}
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default RepairBooking;