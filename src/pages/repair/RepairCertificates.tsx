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
  Award,
  Calendar,
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";

const RepairCertificates = () => {
  const { toast } = useToast();
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    name: "",
    issuingBody: "",
    dateIssued: "",
    expiryDate: "",
    certificateNumber: "",
    description: ""
  });

  // Mock certificates data
  const [certificates] = useState([
    {
      id: "1",
      name: "Apple Authorized Service Provider",
      issuingBody: "Apple Inc.",
      dateIssued: "2023-01-15",
      expiryDate: "2025-01-15",
      certificateNumber: "AASP-2023-001",
      status: "active",
      verified: true,
      description: "Certified to repair Apple devices including iPhone, iPad, and MacBook"
    },
    {
      id: "2", 
      name: "Samsung Mobile Repair Certification",
      issuingBody: "Samsung Electronics",
      dateIssued: "2023-03-10",
      expiryDate: "2024-12-10",
      certificateNumber: "SMR-2023-045",
      status: "expiring_soon",
      verified: true,
      description: "Advanced repair certification for Galaxy series smartphones and tablets"
    },
    {
      id: "3",
      name: "Advanced Microsoldering Certificate",
      issuingBody: "MicroSoldering Academy",
      dateIssued: "2023-06-20",
      expiryDate: "2026-06-20", 
      certificateNumber: "MSA-ADV-789",
      status: "active",
      verified: true,
      description: "Board-level repair and component replacement specialist certification"
    },
    {
      id: "4",
      name: "Water Damage Recovery Specialist",
      issuingBody: "Repair Institute",
      dateIssued: "2022-11-05",
      expiryDate: "2024-11-05",
      certificateNumber: "WDR-SPEC-456",
      status: "expiring_soon",
      verified: false,
      description: "Specialized training in liquid damage assessment and recovery techniques"
    }
  ]);

  const handleAddCertificate = () => {
    toast({
      title: "Certificate Added",
      description: "Your new certificate has been added for verification.",
    });
    setIsAddingCert(false);
    setNewCertificate({
      name: "",
      issuingBody: "",
      dateIssued: "",
      expiryDate: "",
      certificateNumber: "",
      description: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "expiring_soon": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "expiring_soon": return "Expiring Soon";
      case "expired": return "Expired";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Certificate Management</h1>
            <p className="text-muted-foreground">Manage your repair certifications and professional qualifications</p>
          </div>
          <Button onClick={() => setIsAddingCert(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Certificate
          </Button>
        </div>

        {/* Certificate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">2</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-warning">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-primary">3</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Certificates List */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-foreground">Your Certificates</h2>
          
          {certificates.map((cert) => (
            <Card key={cert.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{cert.name}</h3>
                    <Badge className={getStatusColor(cert.status)}>
                      {getStatusText(cert.status)}
                    </Badge>
                    {cert.verified && (
                      <Badge variant="outline" className="text-success border-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{cert.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Issuing Body</p>
                      <p className="font-medium text-foreground">{cert.issuingBody}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Certificate Number</p>
                      <p className="font-medium text-foreground">{cert.certificateNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date Issued</p>
                      <p className="font-medium text-foreground">{new Date(cert.dateIssued).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expiry Date</p>
                      <p className="font-medium text-foreground">{new Date(cert.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Certificate Modal */}
        {isAddingCert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Add New Certificate</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingCert(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cert-name">Certificate Name</Label>
                      <Input
                        id="cert-name"
                        value={newCertificate.name}
                        onChange={(e) => setNewCertificate({...newCertificate, name: e.target.value})}
                        placeholder="e.g., Apple Authorized Service Provider"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issuing-body">Issuing Body</Label>
                      <Input
                        id="issuing-body"
                        value={newCertificate.issuingBody}
                        onChange={(e) => setNewCertificate({...newCertificate, issuingBody: e.target.value})}
                        placeholder="e.g., Apple Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date-issued">Date Issued</Label>
                      <Input
                        id="date-issued"
                        type="date"
                        value={newCertificate.dateIssued}
                        onChange={(e) => setNewCertificate({...newCertificate, dateIssued: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={newCertificate.expiryDate}
                        onChange={(e) => setNewCertificate({...newCertificate, expiryDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cert-number">Certificate Number</Label>
                      <Input
                        id="cert-number"
                        value={newCertificate.certificateNumber}
                        onChange={(e) => setNewCertificate({...newCertificate, certificateNumber: e.target.value})}
                        placeholder="Certificate ID"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCertificate.description}
                      onChange={(e) => setNewCertificate({...newCertificate, description: e.target.value})}
                      placeholder="Brief description of the certification and what it covers"
                      rows={3}
                    />
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload certificate document (PDF, JPG, PNG)
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddCertificate} className="flex-1">
                      Add Certificate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingCert(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairCertificates;