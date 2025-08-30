import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  CreditCard, 
  Shield, 
  Key, 
  Bell, 
  Settings, 
  Globe,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const PaymentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefund, setAutoRefund] = useState(false);

  // Mock payment provider data - would come from API
  const providerData = {
    id: "payment_001",
    companyName: "Global Payment Solutions Inc.",
    businessType: "Payment Service Provider",
    registrationNumber: "PSP-2023-001",
    taxId: "US-TAX-123456789",
    contactEmail: "admin@globalpayments.com",
    supportEmail: "support@globalpayments.com",
    phone: "+1 (555) 123-4567",
    website: "https://globalpayments.com",
    address: {
      street: "123 Financial District",
      city: "New York",
      state: "NY",
      postalCode: "10005",
      country: "United States"
    },
    apiKey: "gps_live_sk_1234567890abcdef",
    webhookUrl: "https://api.globalpayments.com/webhooks/stolen",
    supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
    processingFees: {
      domestic: 2.7,
      international: 3.2,
      chargeback: 15.00
    },
    limits: {
      dailyVolume: 1000000,
      monthlyVolume: 30000000,
      singleTransaction: 50000
    },
    joinDate: "2023-06-15",
    lastActivity: "2024-01-20 14:30 PST"
  };

  const gatewayConfig = [
    {
      name: "PayPal",
      status: "active",
      merchantId: "GPS_PAYPAL_12345",
      sandboxMode: false,
      processingFee: 2.9,
      setupDate: "2023-06-15"
    },
    {
      name: "Stripe",
      status: "active", 
      merchantId: "acct_1234567890",
      sandboxMode: false,
      processingFee: 2.7,
      setupDate: "2023-06-16"
    },
    {
      name: "Apple Pay",
      status: "active",
      merchantId: "merchant.com.globalpayments",
      sandboxMode: false,
      processingFee: 3.1,
      setupDate: "2023-07-01"
    },
    {
      name: "Google Pay",
      status: "pending",
      merchantId: "GPS-GOOGLE-PENDING",
      sandboxMode: true,
      processingFee: 2.8,
      setupDate: "2024-01-15"
    }
  ];

  const complianceStatus = [
    { requirement: "PCI DSS Level 1", status: "compliant", expiry: "2024-12-31", score: 100 },
    { requirement: "SOC 2 Type II", status: "compliant", expiry: "2024-08-15", score: 98 },
    { requirement: "ISO 27001", status: "compliant", expiry: "2024-11-30", score: 96 },
    { requirement: "GDPR Compliance", status: "compliant", expiry: "Ongoing", score: 100 },
    { requirement: "Anti-Money Laundering", status: "review", expiry: "2024-03-31", score: 87 }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "API Key Rotated",
      timestamp: "2024-01-20 10:15 PST",
      details: "Production API key updated",
      severity: "info"
    },
    {
      id: 2,
      action: "Webhook Configuration Updated",
      timestamp: "2024-01-19 16:45 PST",
      details: "Added fraud detection endpoint",
      severity: "info"
    },
    {
      id: 3,
      action: "Processing Limit Increased",
      timestamp: "2024-01-18 09:30 PST",
      details: "Daily limit increased to $1M",
      severity: "success"
    },
    {
      id: 4,
      action: "Compliance Review Completed",
      timestamp: "2024-01-17 14:22 PST",
      details: "PCI DSS annual review passed",
      severity: "success"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "pending": return "text-warning";
      case "suspended": return "text-destructive";
      case "compliant": return "text-success";
      case "review": return "text-warning";
      case "expired": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "suspended": return "bg-destructive text-destructive-foreground";
      case "compliant": return "bg-success text-success-foreground";
      case "review": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success": return "text-success";
      case "info": return "text-primary";
      case "warning": return "text-warning";
      case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                Payment Provider Profile
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Manage your payment gateway configuration and settings
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                <Building className="w-10 h-10" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{providerData.companyName}</h2>
                  <Badge className="bg-success text-success-foreground w-fit">Verified Provider</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{providerData.businessType}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span>ID: {providerData.registrationNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>{providerData.supportedCurrencies.length} currencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span>PCI Level 1 Compliant</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-sm text-muted-foreground">Provider since</p>
                <p className="font-medium">{providerData.joinDate}</p>
                <p className="text-sm text-muted-foreground mt-2">Last activity</p>
                <p className="font-medium">{providerData.lastActivity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="gateways">Gateways</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Profile Information */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Basic company details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          defaultValue={providerData.companyName}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessType">Business Type</Label>
                        <Input 
                          id="businessType" 
                          defaultValue={providerData.businessType}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input 
                          id="registrationNumber" 
                          defaultValue={providerData.registrationNumber}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input 
                          id="taxId" 
                          defaultValue={providerData.taxId}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input 
                          id="contactEmail" 
                          type="email"
                          defaultValue={providerData.contactEmail}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          defaultValue={providerData.phone}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        defaultValue={providerData.website}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Business Address</Label>
                      <Textarea 
                        id="address"
                        defaultValue={`${providerData.address.street}\n${providerData.address.city}, ${providerData.address.state} ${providerData.address.postalCode}\n${providerData.address.country}`}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>
                    API keys, webhooks, and integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="apiKey">Production API Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="apiKey"
                          type={showApiKey ? "text" : "password"}
                          value={providerData.apiKey}
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(providerData.apiKey)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input 
                        id="webhookUrl"
                        defaultValue={providerData.webhookUrl}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="webhookEnabled">Webhook Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive real-time payment notifications</p>
                        </div>
                        <Switch
                          id="webhookEnabled"
                          checked={webhookEnabled}
                          onCheckedChange={setWebhookEnabled}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notificationsEnabled">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Get alerts for important events</p>
                        </div>
                        <Switch
                          id="notificationsEnabled"
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoRefund">Automatic Refunds</Label>
                          <p className="text-sm text-muted-foreground">Auto-process eligible refunds</p>
                        </div>
                        <Switch
                          id="autoRefund"
                          checked={autoRefund}
                          onCheckedChange={setAutoRefund}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Gateways */}
          <TabsContent value="gateways">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Connected Payment Gateways
                  </CardTitle>
                  <CardDescription>
                    Configure and manage your payment gateway connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gatewayConfig.map((gateway) => (
                      <div key={gateway.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            gateway.status === "active" ? "bg-success" :
                            gateway.status === "pending" ? "bg-warning" : "bg-destructive"
                          )} />
                          <div>
                            <h4 className="font-semibold">{gateway.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {gateway.merchantId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="font-medium">{gateway.processingFee}% fee</p>
                            <p className="text-muted-foreground">Since {gateway.setupDate}</p>
                          </div>
                          <Badge className={getStatusBadgeColor(gateway.status)}>
                            {gateway.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold mb-2">Processing Fees</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Domestic:</span>
                        <span className="font-semibold ml-2">{providerData.processingFees.domestic}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">International:</span>
                        <span className="font-semibold ml-2">{providerData.processingFees.international}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Chargeback:</span>
                        <span className="font-semibold ml-2">{formatCurrency(providerData.processingFees.chargeback)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Limits</CardTitle>
                  <CardDescription>
                    Current transaction and volume limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{formatCurrency(providerData.limits.dailyVolume)}</div>
                      <p className="text-sm text-muted-foreground">Daily Volume Limit</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{formatCurrency(providerData.limits.monthlyVolume)}</div>
                      <p className="text-sm text-muted-foreground">Monthly Volume Limit</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{formatCurrency(providerData.limits.singleTransaction)}</div>
                      <p className="text-sm text-muted-foreground">Single Transaction Limit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Compliance & Certifications
                </CardTitle>
                <CardDescription>
                  Security standards and regulatory compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceStatus.map((item) => (
                    <div key={item.requirement} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {item.status === "compliant" ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning" />
                        )}
                        <div>
                          <h4 className="font-semibold">{item.requirement}</h4>
                          <p className="text-sm text-muted-foreground">
                            Expires: {item.expiry}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{item.score}%</div>
                          <p className="text-xs text-muted-foreground">Compliance Score</p>
                        </div>
                        <Badge className={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-success/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-success">Excellent Compliance Standing</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your organization maintains excellent compliance across all required standards. 
                        Regular audits ensure continued adherence to security and regulatory requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Account changes and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        activity.severity === "success" ? "bg-success" :
                        activity.severity === "warning" ? "bg-warning" : "bg-primary"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{activity.action}</h4>
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Activity Log
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentProfile;
