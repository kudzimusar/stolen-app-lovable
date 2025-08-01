import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MapPin,
  User,
  Brain,
  TrendingUp,
  Filter,
  Search,
  Download,
  RefreshCw
} from "lucide-react";

const FraudAlerts = () => {
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  // Mock fraud alerts
  const fraudAlerts = [
    {
      id: 1,
      type: "device_transfer",
      severity: "high",
      score: 92,
      device: "iPhone 15 Pro Max",
      serial: "ABC123456789",
      title: "Suspicious Transfer Pattern Detected",
      description: "Device transferred 3 times in 24 hours with different payment methods",
      timestamp: "2025-01-20 14:30",
      location: "Multiple locations",
      involvedUsers: ["user123", "seller456", "buyer789"],
      status: "pending",
      aiRecommendation: "Block transfer and require manual verification",
      riskFactors: [
        "Rapid consecutive transfers",
        "Geographic anomaly",
        "Payment method inconsistency",
        "New user accounts involved"
      ],
      evidence: [
        "Transaction logs",
        "Location data",
        "User behavior patterns",
        "Payment verification"
      ]
    },
    {
      id: 2,
      type: "marketplace_listing",
      severity: "medium",
      score: 75,
      device: "MacBook Pro M3",
      serial: "XYZ987654321",
      title: "Potentially Stolen Device Listed",
      description: "Device matches report from stolen database, but verification needed",
      timestamp: "2025-01-20 12:15",
      location: "San Francisco, CA",
      involvedUsers: ["seller999"],
      status: "investigating",
      aiRecommendation: "Flag listing and contact law enforcement",
      riskFactors: [
        "Matches stolen report",
        "Price significantly below market",
        "Limited seller history",
        "No purchase documentation"
      ],
      evidence: [
        "Stolen report match",
        "Price analysis",
        "Seller verification data",
        "Photo comparison"
      ]
    },
    {
      id: 3,
      type: "registration_fraud",
      severity: "low",
      score: 45,
      device: "Samsung Galaxy S24",
      serial: "DEF456789012",
      title: "Duplicate Registration Attempt",
      description: "Same device serial registered by different users",
      timestamp: "2025-01-20 09:45",
      location: "New York, NY",
      involvedUsers: ["user111", "user222"],
      status: "resolved",
      aiRecommendation: "Request additional verification from both users",
      riskFactors: [
        "Duplicate serial number",
        "Different ownership claims",
        "Recent registration timing"
      ],
      evidence: [
        "Registration records",
        "User verification data",
        "Device photos comparison"
      ]
    }
  ];

  // Filter alerts based on status
  const filteredAlerts = fraudAlerts.filter(alert => 
    filterStatus === "all" || alert.status === filterStatus
  );

  const handleApproveTransfer = async (alertId: number) => {
    toast({
      title: "Transfer Approved",
      description: "The transfer has been manually approved and will proceed.",
      variant: "default"
    });
    // Update alert status logic here
  };

  const handleBlockTransfer = async (alertId: number) => {
    toast({
      title: "Transfer Blocked",
      description: "The transfer has been blocked pending further investigation.",
      variant: "destructive"
    });
    // Update alert status logic here
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="w-4 h-4" />;
      case "medium": return <Shield className="w-4 h-4" />;
      case "low": return <Eye className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
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
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-semibold">Fraud Detection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">3</div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">12</div>
            <div className="text-sm text-muted-foreground">Under Investigation</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">156</div>
            <div className="text-sm text-muted-foreground">Resolved This Month</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">98.7%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </Card>
        </div>

        {/* AI System Status */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-primary mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">AI Fraud Detection System Active</h3>
              <p className="text-sm text-muted-foreground">
                Our advanced AI continuously monitors transactions, device registrations, and marketplace 
                activities for suspicious patterns. Last updated: 2 minutes ago
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Real-time monitoring active</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>Pattern recognition optimized</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-success" />
                  <span>Blockchain verification enabled</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Fraud Alerts</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                className="border border-border rounded px-2 py-1 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Alerts</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="p-4">
              <div className="space-y-4">
                {/* Alert Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(alert.severity)} className="flex items-center gap-1">
                        {getSeverityIcon(alert.severity)}
                        {alert.severity} Risk
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.score}% confidence
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {alert.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                  >
                    {selectedAlert?.id === alert.id ? "Hide Details" : "View Details"}
                  </Button>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{alert.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{alert.involvedUsers.length} users involved</span>
                  </div>
                  <div className="font-medium">
                    {alert.device} ({alert.serial})
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAlert?.id === alert.id && (
                  <div className="border-t pt-4 space-y-4">
                    {/* AI Recommendation */}
                    <Alert>
                      <Brain className="w-4 h-4" />
                      <AlertDescription>
                        <strong>AI Recommendation:</strong> {alert.aiRecommendation}
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Risk Factors */}
                      <div>
                        <h4 className="font-medium mb-2">Risk Factors</h4>
                        <ul className="space-y-1 text-sm">
                          {alert.riskFactors.map((factor, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertTriangle className="w-3 h-3 text-warning" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Evidence */}
                      <div>
                        <h4 className="font-medium mb-2">Available Evidence</h4>
                        <ul className="space-y-1 text-sm">
                          {alert.evidence.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-success" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions */}
                    {alert.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => handleApproveTransfer(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Transfer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex items-center gap-1"
                          onClick={() => handleBlockTransfer(alert.id)}
                        >
                          <XCircle className="w-4 h-4" />
                          Block Transfer
                        </Button>
                        <Button size="sm" variant="outline">
                          Request More Info
                        </Button>
                        <Button size="sm" variant="outline">
                          Escalate to Human
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <Card className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Fraud Alerts</h3>
            <p className="text-muted-foreground">
              All transactions and activities are currently normal. Our AI continues to monitor for suspicious patterns.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FraudAlerts;