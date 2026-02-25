import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import {
  ArrowLeft,
  Shield,
  FileText,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Eye,
  Brain,
  Zap,
  Target,
  Activity,
  ShieldCheck,
  TrendingDown,
  Bot,
  Cpu,
  Database,
  Globe,
  Lock,
  RefreshCw,
  Loader2
} from "lucide-react";

const InsuranceDashboardEnhanced = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [claimForm, setClaimForm] = useState({
    deviceId: "",
    policyNumber: "",
    incidentType: "",
    damageDescription: ""
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isProcessingClaim, setIsProcessingClaim] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [stats, setStats] = useState({
    activePolicies: 0,
    monthlyPremiums: 0,
    claimsProcessed: 0,
    fraudPrevented: 0,
    avgClaimTime: "0 days",
    customerSatisfaction: 0,
    totalPayouts: 0,
    aiFraudDetectionRate: 0,
    automatedClaimsProcessed: 0,
    avgProcessingTime: "0 hours",
    riskAssessmentAccuracy: 0,
    aiCostSavings: 0,
    realTimeDecisions: 0
  });

  // Keep static lists for UI demonstration until full backend lists are available
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([
    {
      id: "FRAUD-001",
      type: "Suspicious Pattern",
      risk: "high",
      device: "iPhone 15 Pro",
      claimant: "John Doe",
      details: "Multiple claims in 30 days",
      aiConfidence: 94.2,
      timestamp: "2 min ago"
    },
    // ... others kept or fetched if API available
  ]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.invoke('insurance-dept-stats');
      if (data) {
        if (data.stats) setStats(data.stats);
        if (data.fraudAlerts) setFraudAlerts(data.fraudAlerts);
        // Add other data mappings as needed
      }
    } catch (error) {
      console.error("Failed to fetch insurance stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ... (keeping existing helper functions like handleSearch, handleClaimSubmit, getStatusBadge etc.)

  const handleSearch = () => {
    toast({
      title: "Search Initiated",
      description: `Searching for device: ${searchQuery}`
    });
  };

  const handleClaimSubmit = async () => {
    setIsProcessingClaim(true);
    setTimeout(() => {
      // Simulation logic kept for demo purposes
      const aiAnalysis = {
        fraudScore: Math.floor(Math.random() * 100),
        riskLevel: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
        automatedDecision: Math.random() > 0.6,
        processingTime: (Math.random() * 3 + 1).toFixed(1),
        recommendations: ["Device verification completed", "Claim history analyzed"]
      };
      setAiAnalysis(aiAnalysis);
      setIsProcessingClaim(false);
      toast({ title: "AI Analysis Complete", description: "Claim processed." });
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending": return <Badge variant="secondary">Pending Review</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getAiDecisionBadge = (decision: string) => {
    switch (decision) {
      case "automated": return <Badge className="bg-primary text-primary-foreground"><Bot className="w-3 h-3 mr-1" />AI Approved</Badge>;
      case "manual_review": return <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Manual Review</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Re-declare static data for rendering if not fetched
  const riskAssessment = {
    overallRisk: 23,
    fraudRisk: 15,
    claimRisk: 28,
    deviceRisk: 19,
    factors: [
      { name: "Claim History", risk: 25, trend: "down" },
      { name: "Device Age", risk: 18, trend: "stable" },
      { name: "Location Risk", risk: 32, trend: "up" },
      { name: "User Behavior", risk: 21, trend: "down" }
    ]
  };

  const recentClaims = [
    {
      id: "CLM-001",
      device: "iPhone 15 Pro",
      policy: "POL-12345",
      amount: "200",
      status: "approved",
      submittedDate: "2024-01-20",
      claimant: "John Doe",
      processingTime: "2.3 hours",
      aiDecision: "automated",
      fraudScore: 12
    },
    // ... others
  ];

  const aiQueue = [
    { id: "CLM-004", priority: "high", estimatedTime: "15 min", aiStatus: "analyzing" },
    { id: "CLM-005", priority: "medium", estimatedTime: "30 min", aiStatus: "queued" },
    { id: "CLM-006", priority: "low", estimatedTime: "45 min", aiStatus: "pending" }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
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
              Insurance Dashboard
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              AI-powered claims processing and fraud detection
            </p>
          </div>
          <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Data
          </Button>
        </div>

        {/* AI Performance Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Fraud Detection</p>
                  <p className="text-2xl font-bold text-success">{stats.aiFraudDetectionRate}%</p>
                </div>
                <Brain className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Automated Claims</p>
                  <p className="text-2xl font-bold text-primary">{stats.automatedClaimsProcessed}</p>
                </div>
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                  <p className="text-2xl font-bold text-warning">{stats.avgProcessingTime}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Cost Savings</p>
                  <p className="text-2xl font-bold text-success">${(stats.aiCostSavings / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Fraud Detection Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                AI Fraud Detection Alerts
              </CardTitle>
              <CardDescription>
                Real-time fraud detection powered by machine learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        alert.risk === "high" ? "bg-destructive" :
                        alert.risk === "medium" ? "bg-warning" : "bg-success"
                      )} />
                      <div>
                        <h4 className="font-semibold text-sm">{alert.type}</h4>
                        <p className="text-xs text-muted-foreground">{alert.device} - {alert.claimant}</p>
                        <p className="text-xs text-muted-foreground">{alert.details}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn("text-sm font-semibold", getRiskColor(alert.risk))}>
                        {alert.aiConfidence}% confidence
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                AI-powered real-time risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{riskAssessment.overallRisk}%</div>
                  <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                </div>
                
                <div className="space-y-3">
                  {riskAssessment.factors.map((factor) => (
                    <div key={factor.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{factor.name}</span>
                        <span className="font-semibold">{factor.risk}%</span>
                      </div>
                      <Progress value={factor.risk} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Processing Queue */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                AI Processing Queue
              </CardTitle>
              <CardDescription>
                Real-time AI claim processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {aiQueue.map((item) => (
                  <div key={item.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.id}</h4>
                      <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "secondary" : "outline"}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Est. Time: {item.estimatedTime}</p>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.aiStatus === "analyzing" ? "bg-primary animate-pulse" :
                        item.aiStatus === "queued" ? "bg-warning" : "bg-muted"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">{item.aiStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Claims Processing */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Claims (AI-Enhanced)
              </CardTitle>
              <CardDescription>
                Claims processed with AI-powered fraud detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{claim.id}</h4>
                        <p className="text-sm text-muted-foreground">{claim.device} - {claim.claimant}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{claim.amount}</p>
                        <p className="text-xs text-muted-foreground">Processing: {claim.processingTime}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Fraud Score</p>
                        <p className={cn(
                          "text-sm font-semibold",
                          claim.fraudScore > 50 ? "text-destructive" :
                          claim.fraudScore > 25 ? "text-warning" : "text-success"
                        )}>
                          {claim.fraudScore}%
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(claim.status)}
                        {getAiDecisionBadge(claim.aiDecision)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{aiAnalysis.fraudScore}%</div>
                  <p className="text-sm text-muted-foreground">Fraud Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{aiAnalysis.riskLevel}</div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{aiAnalysis.processingTime}h</div>
                  <p className="text-sm text-muted-foreground">Processing Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {aiAnalysis.automatedDecision ? "Auto" : "Manual"}
                  </div>
                  <p className="text-sm text-muted-foreground">Decision</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">AI Recommendations:</h4>
                <ul className="space-y-1">
                  {aiAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsuranceDashboardEnhanced;
