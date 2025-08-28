import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  Target,
  Zap,
  Cpu,
  Database,
  Network,
  Code,
  Globe,
  Users,
  Calendar,
  Clock,
  Star,
  Award,
  Certificate,
  Gavel,
  Scale,
  Building,
  Flag,
  Search,
  Filter,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Eye as EyeIcon,
  Trash2 as TrashIcon,
  Copy as CopyIcon,
  RefreshCw as RefreshIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChartIcon,
  Activity as ActivityIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  Network as NetworkIcon,
  Code as CodeIcon,
  Globe as GlobeIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Star as StarIcon,
  Award as AwardIcon,
  Certificate as CertificateIcon,
  Gavel as GavelIcon,
  Scale as ScaleIcon,
  Building as BuildingIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  Filter as FilterIcon
} from "lucide-react";

const ComplianceDashboard = () => {
  const [complianceData, setComplianceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('gdpr');
  const { toast } = useToast();

  // Compliance frameworks data
  const complianceFrameworks = {
    gdpr: {
      name: "GDPR (General Data Protection Regulation)",
      status: "compliant",
      score: 98,
      lastAudit: "2024-01-15",
      nextAudit: "2024-07-15",
      requirements: [
        { name: "Data Processing", status: "compliant", description: "Lawful basis for processing" },
        { name: "User Consent", status: "compliant", description: "Explicit consent management" },
        { name: "Data Portability", status: "compliant", description: "Right to data portability" },
        { name: "Right to Erasure", status: "compliant", description: "Right to be forgotten" },
        { name: "Data Breach Notification", status: "compliant", description: "72-hour notification" }
      ]
    },
    ccpa: {
      name: "CCPA (California Consumer Privacy Act)",
      status: "compliant",
      score: 96,
      lastAudit: "2024-01-10",
      nextAudit: "2024-07-10",
      requirements: [
        { name: "Privacy Notice", status: "compliant", description: "Clear privacy disclosures" },
        { name: "Opt-Out Rights", status: "compliant", description: "Right to opt-out of sales" },
        { name: "Data Disclosure", status: "compliant", description: "Right to know personal data" },
        { name: "Non-Discrimination", status: "compliant", description: "Equal service provision" }
      ]
    },
    pciDss: {
      name: "PCI DSS (Payment Card Industry Data Security Standard)",
      status: "compliant",
      score: 94,
      lastAudit: "2024-01-05",
      nextAudit: "2024-07-05",
      requirements: [
        { name: "Data Encryption", status: "compliant", description: "Encryption of cardholder data" },
        { name: "Access Control", status: "compliant", description: "Restricted access to data" },
        { name: "Network Security", status: "compliant", description: "Secure network infrastructure" },
        { name: "Vulnerability Management", status: "compliant", description: "Regular security updates" }
      ]
    },
    iso27001: {
      name: "ISO 27001 (Information Security Management)",
      status: "compliant",
      score: 97,
      lastAudit: "2024-01-20",
      nextAudit: "2024-07-20",
      requirements: [
        { name: "Information Security Policy", status: "compliant", description: "Comprehensive security policy" },
        { name: "Asset Management", status: "compliant", description: "Information asset inventory" },
        { name: "Access Control", status: "compliant", description: "User access management" },
        { name: "Cryptography", status: "compliant", description: "Encryption and key management" }
      ]
    }
  };

  // Data processing activities
  const dataProcessingActivities = [
    {
      id: "DPA-001",
      name: "Device Registration",
      purpose: "Device ownership verification",
      legalBasis: "Legitimate Interest",
      dataRetention: "7 years",
      dataSubjects: "Device owners",
      status: "active"
    },
    {
      id: "DPA-002",
      name: "Fraud Detection",
      purpose: "Prevent device fraud",
      legalBasis: "Legitimate Interest",
      dataRetention: "3 years",
      dataSubjects: "All users",
      status: "active"
    },
    {
      id: "DPA-003",
      name: "Payment Processing",
      purpose: "Transaction processing",
      legalBasis: "Contract Performance",
      dataRetention: "7 years",
      dataSubjects: "Customers",
      status: "active"
    }
  ];

  // Data subject requests
  const dataSubjectRequests = [
    {
      id: "DSR-001",
      type: "Access Request",
      requester: "john.doe@example.com",
      status: "completed",
      submittedDate: "2024-01-15",
      completedDate: "2024-01-18",
      dataProvided: "Personal data export"
    },
    {
      id: "DSR-002",
      type: "Erasure Request",
      requester: "jane.smith@example.com",
      status: "in_progress",
      submittedDate: "2024-01-20",
      completedDate: null,
      dataProvided: "Account deletion in progress"
    },
    {
      id: "DSR-003",
      type: "Portability Request",
      requester: "mike.wilson@example.com",
      status: "pending",
      submittedDate: "2024-01-22",
      completedDate: null,
      dataProvided: "Awaiting processing"
    }
  ];

  // Security incidents
  const securityIncidents = [
    {
      id: "INC-001",
      type: "Suspicious Login Attempt",
      severity: "low",
      status: "resolved",
      detectedDate: "2024-01-18",
      resolvedDate: "2024-01-18",
      description: "Multiple failed login attempts from unknown IP",
      action: "IP blocked, user notified"
    },
    {
      id: "INC-002",
      type: "Data Access Anomaly",
      severity: "medium",
      status: "investigating",
      detectedDate: "2024-01-20",
      resolvedDate: null,
      description: "Unusual data access pattern detected",
      action: "Under investigation"
    }
  ];

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setIsLoading(true);
    // Simulate loading compliance data
    setTimeout(() => {
      setComplianceData(complianceFrameworks);
      setIsLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "completed":
      case "resolved":
        return "text-success";
      case "in_progress":
      case "investigating":
        return "text-warning";
      case "pending":
        return "text-muted-foreground";
      case "non_compliant":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "completed":
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "in_progress":
      case "investigating":
        return <AlertTriangle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "non_compliant":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleGenerateReport = (framework: string) => {
    toast({
      title: "Compliance Report Generated",
      description: `${framework.toUpperCase()} compliance report has been generated and is ready for download.`
    });
  };

  const handleDataSubjectRequest = (requestId: string, action: string) => {
    toast({
      title: "Data Subject Request Updated",
      description: `Request ${requestId} has been ${action}.`
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <STOLENLogo />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            Compliance Dashboard
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Regulatory compliance and data protection management
          </p>
        </div>

        {/* Compliance Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">GDPR Compliance</p>
                  <p className="text-2xl font-bold text-success">98%</p>
                </div>
                <Shield className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CCPA Compliance</p>
                  <p className="text-2xl font-bold text-success">96%</p>
                </div>
                <Gavel className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">PCI DSS</p>
                  <p className="text-2xl font-bold text-success">94%</p>
                </div>
                <CreditCard className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ISO 27001</p>
                  <p className="text-2xl font-bold text-success">97%</p>
                </div>
                <Certificate className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="ccpa">CCPA</TabsTrigger>
            <TabsTrigger value="requests">Data Requests</TabsTrigger>
            <TabsTrigger value="incidents">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Compliance Status
                  </CardTitle>
                  <CardDescription>
                    Overall compliance across all frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(complianceFrameworks).map(([key, framework]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full", getStatusColor(framework.status))} />
                          <div>
                            <h4 className="font-semibold text-sm">{framework.name.split(' ')[0]}</h4>
                            <p className="text-xs text-muted-foreground">{framework.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{framework.score}%</div>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Processing Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Data Processing Activities
                  </CardTitle>
                  <CardDescription>
                    Current data processing operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataProcessingActivities.map((activity) => (
                      <div key={activity.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{activity.name}</h4>
                          <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{activity.purpose}</p>
                        <p className="text-xs text-muted-foreground">Basis: {activity.legalBasis}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* GDPR Tab */}
          <TabsContent value="gdpr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  GDPR Compliance Details
                </CardTitle>
                <CardDescription>
                  General Data Protection Regulation requirements and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* GDPR Requirements */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Requirements Status</h3>
                    {complianceFrameworks.gdpr.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(req.status)}
                          <div>
                            <h4 className="font-semibold text-sm">{req.name}</h4>
                            <p className="text-xs text-muted-foreground">{req.description}</p>
                          </div>
                        </div>
                        <Badge variant={req.status === 'compliant' ? 'default' : 'secondary'}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* GDPR Actions */}
                  <div className="flex gap-4">
                    <Button onClick={() => handleGenerateReport('gdpr')}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CCPA Tab */}
          <TabsContent value="ccpa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  CCPA Compliance Details
                </CardTitle>
                <CardDescription>
                  California Consumer Privacy Act requirements and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* CCPA Requirements */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Requirements Status</h3>
                    {complianceFrameworks.ccpa.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(req.status)}
                          <div>
                            <h4 className="font-semibold text-sm">{req.name}</h4>
                            <p className="text-xs text-muted-foreground">{req.description}</p>
                          </div>
                        </div>
                        <Badge variant={req.status === 'compliant' ? 'default' : 'secondary'}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* CCPA Actions */}
                  <div className="flex gap-4">
                    <Button onClick={() => handleGenerateReport('ccpa')}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Data Subject Requests
                </CardTitle>
                <CardDescription>
                  Manage data subject rights requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSubjectRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-sm">{request.type}</h4>
                          <p className="text-xs text-muted-foreground">{request.requester}</p>
                          <p className="text-xs text-muted-foreground">Submitted: {request.submittedDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{request.dataProvided}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Security Incidents
                </CardTitle>
                <CardDescription>
                  Monitor and manage security incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityIncidents.map((incident) => (
                    <div key={incident.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{incident.type}</h4>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Detected: {incident.detectedDate}</span>
                        <span>Action: {incident.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
