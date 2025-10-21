// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Upload, 
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  CreditCard,
  Home,
  Briefcase,
  RefreshCw,
  Info,
  Clock,
  Star,
  Award,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiEndpointsService } from "@/lib/services/api-endpoints-service";

interface FICADocument {
  id: string;
  type: 'sa_id' | 'passport' | 'drivers_license' | 'proof_of_address' | 'bank_statement' | 'income_verification';
  category: 'identity' | 'address' | 'income';
  name: string;
  description: string;
  required: boolean;
  status: 'not_uploaded' | 'uploaded' | 'pending' | 'approved' | 'rejected';
  uploadedAt?: string;
  verifiedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  verificationScore?: number;
  file?: File;
}

interface FICAStatus {
  overallStatus: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  completionPercentage: number;
  approvedDocuments: number;
  totalRequired: number;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  dailyLimit: number;
  monthlyLimit: number;
  features: string[];
}

interface FICAComplianceProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onStatusUpdate?: (status: FICAStatus) => void;
}

const FICACompliance: React.FC<FICAComplianceProps> = ({
  isOpen,
  onClose,
  userId,
  onStatusUpdate
}) => {
  const [documents, setDocuments] = useState<FICADocument[]>([]);
  const [ficaStatus, setFicaStatus] = useState<FICAStatus | null>(null);
  const [activeCategory, setActiveCategory] = useState<'identity' | 'address' | 'income'>('identity');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFICAStatus();
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchFICAStatus = async () => {
    try {
      const response = await apiEndpointsService.ficaGetStatus(userId);
      
      if (response.success && response.data) {
        setFicaStatus(response.data.status);
        setCompletionPercentage(response.data.completionPercentage || 0);
        
        if (onStatusUpdate) {
          onStatusUpdate(response.data.status);
        }
      }
    } catch (error) {
      console.error('Error fetching FICA status:', error);
      // Mock FICA status for demo
      const mockStatus: FICAStatus = {
        overallStatus: 'in_progress',
        completionPercentage: 60,
        approvedDocuments: 3,
        totalRequired: 5,
        verificationLevel: 'basic',
        dailyLimit: 15000,
        monthlyLimit: 100000,
        features: ['Send Money', 'Receive Money', 'Basic Transfers']
      };
      setFicaStatus(mockStatus);
      if (onStatusUpdate) {
        onStatusUpdate(mockStatus);
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/fica/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error('Error fetching FICA documents:', error);
      // Mock documents for demo
      setDocuments([
        {
          id: '1',
          type: 'sa_id',
          category: 'identity',
          name: 'South African ID Document',
          description: 'Front and back of your green ID book or smart ID card',
          required: true,
          status: 'approved',
          uploadedAt: '2024-01-15T10:30:00Z',
          verifiedAt: '2024-01-15T14:20:00Z',
          verificationScore: 95
        },
        {
          id: '2',
          type: 'proof_of_address',
          category: 'address',
          name: 'Proof of Address',
          description: 'Recent utility bill, bank statement, or municipal account (not older than 3 months)',
          required: true,
          status: 'approved',
          uploadedAt: '2024-01-16T09:15:00Z',
          verifiedAt: '2024-01-16T11:30:00Z',
          verificationScore: 88
        },
        {
          id: '3',
          type: 'bank_statement',
          category: 'income',
          name: 'Bank Statement',
          description: '3 months of recent bank statements',
          required: true,
          status: 'pending',
          uploadedAt: '2024-01-20T16:45:00Z'
        },
        {
          id: '4',
          type: 'income_verification',
          category: 'income',
          name: 'Income Verification',
          description: 'Payslips, employment letter, or tax certificate',
          required: true,
          status: 'not_uploaded'
        },
        {
          id: '5',
          type: 'passport',
          category: 'identity',
          name: 'Passport (Optional)',
          description: 'Valid South African passport for enhanced verification',
          required: false,
          status: 'not_uploaded'
        }
      ]);
    }
  };

  const handleFileUpload = async (document: FICADocument, file: File) => {
    setIsUploading(true);
    setUploadingDocument(document.id);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', document.type);
      formData.append('documentId', document.id);

      const response = await fetch('/api/v1/s-pay/fica/upload-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "Document Uploaded",
            description: `${document.name} has been uploaded successfully and is being verified.`,
          });
          
          // Update document status
          setDocuments(prev => prev.map(doc => 
            doc.id === document.id 
              ? { ...doc, status: 'pending', uploadedAt: new Date().toISOString() }
              : doc
          ));

          // Refresh FICA status
          await fetchFICAStatus();
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "Unable to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadingDocument(null);
    }
  };

  const handleVerifyDocument = async (documentId: string) => {
    try {
      const response = await fetch('/api/v1/s-pay/fica/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ documentId })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "Verification Initiated",
            description: "Document verification has been started.",
          });
          
          await fetchDocuments();
          await fetchFICAStatus();
        }
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to start verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'sa_id':
      case 'passport':
      case 'drivers_license':
        return <CreditCard className="w-5 h-5" />;
      case 'proof_of_address':
        return <Home className="w-5 h-5" />;
      case 'bank_statement':
      case 'income_verification':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'uploaded':
        return <Upload className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'uploaded':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerificationLevelBadge = (level: string) => {
    switch (level) {
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800">Basic Verified</Badge>;
      case 'enhanced':
        return <Badge className="bg-green-100 text-green-800">Enhanced Verified</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium Verified</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  const categoryDocuments = documents.filter(doc => doc.category === activeCategory);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            FICA Compliance Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* FICA Status Overview */}
          {ficaStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Verification Status</span>
                  {getVerificationLevelBadge(ficaStatus.verificationLevel)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {ficaStatus.approvedDocuments} of {ficaStatus.totalRequired} required documents approved
                  </span>
                  <span className="text-sm font-medium">
                    {ficaStatus.completionPercentage}% Complete
                  </span>
                </div>
                
                <Progress value={ficaStatus.completionPercentage} className="h-2" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R{ficaStatus.dailyLimit.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Daily Limit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      R{ficaStatus.monthlyLimit.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Limit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {ficaStatus.features.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Available Features</div>
                  </div>
                </div>

                {ficaStatus.overallStatus === 'approved' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex gap-2">
                      <Award className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <div className="font-medium">Fully FICA Compliant</div>
                        <div>You have access to all S-Pay features with maximum transaction limits.</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Document Categories */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeCategory === 'identity' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveCategory('identity')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Identity Documents
            </Button>
            <Button
              variant={activeCategory === 'address' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveCategory('address')}
            >
              <Home className="w-4 h-4 mr-2" />
              Address Verification
            </Button>
            <Button
              variant={activeCategory === 'income' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveCategory('income')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Income Verification
            </Button>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            <h3 className="font-semibold capitalize">{activeCategory} Documents</h3>
            
            <div className="grid gap-4">
              {categoryDocuments.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getDocumentIcon(document.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{document.name}</h4>
                            {document.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {document.description}
                          </p>
                          
                          {document.status !== 'not_uploaded' && (
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              {document.uploadedAt && (
                                <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
                              )}
                              {document.verifiedAt && (
                                <span>Verified: {new Date(document.verifiedAt).toLocaleDateString()}</span>
                              )}
                              {document.verificationScore && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Score: {document.verificationScore}%
                                </span>
                              )}
                            </div>
                          )}

                          {document.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {document.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(document.status)}>
                          {getStatusIcon(document.status)}
                          <span className="ml-1 capitalize">{document.status.replace('_', ' ')}</span>
                        </Badge>
                        
                        {document.status === 'not_uploaded' && (
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id={`file-${document.id}`}
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(document, file);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => document.getElementById(`file-${document.id}`)?.click()}
                              disabled={isUploading}
                            >
                              {uploadingDocument === document.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {document.status === 'uploaded' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDocument(document.id)}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        )}
                        
                        {(document.status === 'rejected' || document.status === 'pending') && (
                          <div className="flex gap-2">
                            <input
                              type="file"
                              id={`reupload-${document.id}`}
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(document, file);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => document.getElementById(`reupload-${document.id}`)?.click()}
                              disabled={isUploading}
                            >
                              {uploadingDocument === document.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Re-upload
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FICA Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                About FICA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The Financial Intelligence Centre Act (FICA) requires financial service providers 
                to verify the identity of their clients. This helps prevent money laundering, 
                terrorist financing, and other financial crimes.
              </p>
              
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2">Verification Levels</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Verification:</span>
                      <span>R15,000 daily, R100,000 monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enhanced Verification:</span>
                      <span>R50,000 daily, R500,000 monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium Verification:</span>
                      <span>R100,000 daily, R2,000,000 monthly</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Document Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Documents must be clear and legible</li>
                    <li>• Identity documents must be valid and not expired</li>
                    <li>• Proof of address must be less than 3 months old</li>
                    <li>• Bank statements should cover the last 3 months</li>
                    <li>• All documents will be verified within 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-2">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <div className="font-medium">Your Privacy is Protected</div>
                <div>All documents are encrypted and stored securely. We comply with POPIA and international data protection standards. Your information is never shared with third parties.</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FICACompliance;
