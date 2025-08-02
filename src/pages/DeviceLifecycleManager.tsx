import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { DocumentDownloader } from "@/components/DocumentDownloader";
import { 
  Recycle, 
  Gift, 
  Trash2, 
  ArrowUpRight,
  Calendar,
  MapPin,
  User,
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DeviceLifecycleManager = () => {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [actionType, setActionType] = useState("");
  const [actionDetails, setActionDetails] = useState({
    date: "",
    location: "",
    recipient: "",
    reason: "",
    notes: "",
    certificateRequired: false
  });
  const { toast } = useToast();

  const mockDevices = [
    { id: "1", name: "iPhone 13", serial: "F2LLD789XYZ", status: "active" },
    { id: "2", name: "iPad Air", serial: "DMPH456ABC", status: "active" },
    { id: "3", name: "MacBook Pro", serial: "C02YL123DEF", status: "active" }
  ];

  const lifecycleActions = [
    {
      id: "donate",
      title: "Donate Device",
      description: "Transfer device to charity or educational institution",
      icon: Gift,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "recycle",
      title: "Recycle Device",
      description: "Environmentally responsible disposal",
      icon: Recycle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "writeoff",
      title: "Write-off Device",
      description: "Mark as damaged beyond repair",
      icon: Trash2,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      id: "upgrade",
      title: "Upgrade Link",
      description: "Link to replacement device",
      icon: ArrowUpRight,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  const mockHistory = [
    {
      id: "1",
      device: "iPhone 12 Pro",
      action: "donated",
      date: "2024-01-10",
      recipient: "Cape Town Tech Academy",
      location: "Cape Town, WC",
      status: "completed",
      certificateId: "DON2024001"
    },
    {
      id: "2",
      device: "Samsung Galaxy S20",
      action: "recycled",
      date: "2023-12-15",
      recipient: "EcoTech Recycling",
      location: "Johannesburg, GP",
      status: "completed",
      certificateId: "REC2023078"
    }
  ];

  const handleSubmitAction = () => {
    if (!selectedDevice || !actionType) {
      toast({
        title: "Missing Information",
        description: "Please select a device and action type",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Lifecycle Action Recorded",
      description: "Device lifecycle event has been registered on blockchain",
    });

    // Reset form
    setSelectedDevice("");
    setActionType("");
    setActionDetails({
      date: "",
      location: "",
      recipient: "",
      reason: "",
      notes: "",
      certificateRequired: false
    });
  };

  const selectedAction = lifecycleActions.find(a => a.id === actionType);
  const selectedDeviceData = mockDevices.find(d => d.id === selectedDevice);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Device Lifecycle Manager</h1>
          <p className="text-muted-foreground">
            Manage end-of-life events for your devices with full traceability
          </p>
        </div>

        <Tabs defaultValue="new-action" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new-action">New Action</TabsTrigger>
            <TabsTrigger value="history">Lifecycle History</TabsTrigger>
          </TabsList>

          <TabsContent value="new-action" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Device & Action Selection */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Select Device
                    </CardTitle>
                    <CardDescription>Choose the device for lifecycle action</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockDevices.map((device) => (
                      <div
                        key={device.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedDevice === device.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => setSelectedDevice(device.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{device.name}</h3>
                            <p className="text-sm text-muted-foreground">{device.serial}</p>
                          </div>
                          <Badge variant="default">{device.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lifecycle Action</CardTitle>
                    <CardDescription>Select the type of lifecycle event</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {lifecycleActions.map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <div
                          key={action.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            actionType === action.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setActionType(action.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${action.bgColor} ${action.borderColor} border`}>
                              <IconComponent className={`w-5 h-5 ${action.color}`} />
                            </div>
                            <div>
                              <h3 className="font-medium">{action.title}</h3>
                              <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Action Details Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Action Details</CardTitle>
                  <CardDescription>
                    {selectedAction ? `Complete ${selectedAction.title.toLowerCase()} details` : "Select an action to continue"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAction && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="date">Action Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={actionDetails.date}
                          onChange={(e) => setActionDetails(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="location"
                            placeholder="City, Province"
                            className="pl-10"
                            value={actionDetails.location}
                            onChange={(e) => setActionDetails(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      </div>

                      {(actionType === 'donate' || actionType === 'recycle') && (
                        <div className="space-y-2">
                          <Label htmlFor="recipient">
                            {actionType === 'donate' ? 'Charity/Institution' : 'Recycling Facility'}
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="recipient"
                              placeholder={actionType === 'donate' ? 'Charity name' : 'Recycling facility'}
                              className="pl-10"
                              value={actionDetails.recipient}
                              onChange={(e) => setActionDetails(prev => ({ ...prev, recipient: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                      {actionType === 'writeoff' && (
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason for Write-off</Label>
                          <Select value={actionDetails.reason} onValueChange={(value) => 
                            setActionDetails(prev => ({ ...prev, reason: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="water_damage">Water Damage</SelectItem>
                              <SelectItem value="physical_damage">Physical Damage</SelectItem>
                              <SelectItem value="theft_recovery">Theft Recovery</SelectItem>
                              <SelectItem value="obsolete">Obsolete Technology</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional information..."
                          value={actionDetails.notes}
                          onChange={(e) => setActionDetails(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <FileCheck className="w-4 h-4 text-primary" />
                          <span>Digital certificate will be generated for this action</span>
                        </div>
                      </div>

                      <Button className="w-full" onClick={handleSubmitAction}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete {selectedAction.title}
                      </Button>
                    </>
                  )}

                  {!selectedAction && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Select a device and action type to continue
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Lifecycle History</h2>
              <DocumentDownloader 
                documentType="lifecycle_report"
                deviceData={{ name: "All Devices" }}
                variant="outline"
              />
            </div>

            {mockHistory.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{entry.device}</h3>
                        </div>
                        <Badge variant="default">
                          {entry.action}
                        </Badge>
                        <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">{entry.date}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recipient:</span>
                          <p className="font-medium">{entry.recipient}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{entry.location}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Certificate ID: {entry.certificateId}
                        </span>
                        <DocumentDownloader 
                          documentType="lifecycle_certificate"
                          deviceData={{ name: entry.device }}
                          size="sm"
                          variant="outline"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {mockHistory.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No lifecycle history</h3>
                  <p className="text-muted-foreground">
                    No lifecycle events recorded yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeviceLifecycleManager;