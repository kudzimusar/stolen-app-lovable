import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Certificate, 
  Receipt, 
  FileCheck,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export interface DocumentDownloaderProps {
  type: 'certificate' | 'receipt' | 'report' | 'invoice' | 'statement';
  deviceName?: string;
  serialNumber?: string;
  userId?: string;
  variant?: 'outline' | 'default' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showPreview?: boolean;
  enableEmail?: boolean;
  className?: string;
  onDownload?: (documentType: string) => void;
}

export const DocumentDownloader: React.FC<DocumentDownloaderProps> = ({
  type,
  deviceName = "Device",
  serialNumber = "UNKNOWN",
  userId = "user123",
  variant = "outline",
  size = "default",
  showPreview = false,
  enableEmail = false,
  className = '',
  onDownload
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const getDocumentIcon = () => {
    const icons = {
      certificate: Certificate,
      receipt: Receipt,
      report: FileText,
      invoice: FileCheck,
      statement: FileText
    };
    return icons[type] || FileText;
  };

  const getDocumentTitle = () => {
    const titles = {
      certificate: 'Certificate of Ownership',
      receipt: 'Transaction Receipt',
      report: 'Device Report',
      invoice: 'Service Invoice',
      statement: 'Account Statement'
    };
    return titles[type] || 'Document';
  };

  const getDocumentColor = () => {
    const colors = {
      certificate: 'text-green-600 bg-green-100',
      receipt: 'text-blue-600 bg-blue-100',
      report: 'text-purple-600 bg-purple-100',
      invoice: 'text-orange-600 bg-orange-100',
      statement: 'text-gray-600 bg-gray-100'
    };
    return colors[type] || colors.statement;
  };

  const generateDocument = async (documentType: string): Promise<string> => {
    const timestamp = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    let content = "";
    let filename = "";
    
    switch (documentType) {
      case "certificate":
        filename = `STOLEN_Certificate_${serialNumber}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - DIGITAL CERTIFICATE OF OWNERSHIP
==================================================

Certificate ID: CERT-${Date.now()}
Issue Date: ${now.toLocaleDateString()}
Device: ${deviceName}
Serial Number: ${serialNumber}
User ID: ${userId}
Blockchain Hash: 0x${Math.random().toString(16).substring(2, 18)}...${Math.random().toString(16).substring(2, 8)}

OWNERSHIP VERIFICATION
======================
This certificate verifies the legitimate ownership and registration of the above device on the STOLEN platform. This document serves as proof of ownership and blockchain verification.

VERIFICATION DETAILS
====================
- Device registered on: ${timestamp}
- Last verified: ${now.toLocaleString()}
- Security score: 98%
- Status: Verified & Clean
- Platform: STOLEN Ecosystem
- Blockchain Network: Ethereum Mainnet

LEGAL DISCLAIMER
================
This certificate is digitally signed and verified on the blockchain. Any tampering with this document will be detected. This document serves as legal proof of ownership within the STOLEN ecosystem.

STOLEN Platform
Securing devices with blockchain technology
www.stolen.app
        `;
        break;

      case "receipt":
        filename = `STOLEN_Receipt_${Date.now()}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - TRANSACTION RECEIPT
=====================================

Receipt ID: RCP-${Date.now()}
Date: ${now.toLocaleString()}
User ID: ${userId}
Device: ${deviceName}
Serial Number: ${serialNumber}

TRANSACTION DETAILS
===================
- Transaction Type: Device Registration
- Amount: R0.00 (Free Registration)
- Payment Method: S-Pay Wallet
- Transaction Hash: 0x${Math.random().toString(16).substring(2, 18)}...${Math.random().toString(16).substring(2, 8)}
- Status: Completed

SERVICES INCLUDED
=================
✓ Device Registration
✓ Blockchain Verification
✓ Security Scanning
✓ Ownership Certificate
✓ Anti-Theft Protection
✓ Community Access

Thank you for using STOLEN Platform!
        `;
        break;

      case "report":
        filename = `STOLEN_Report_${serialNumber}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - DEVICE SECURITY REPORT
========================================

Report ID: RPT-${Date.now()}
Generated: ${now.toLocaleString()}
Device: ${deviceName}
Serial Number: ${serialNumber}
User ID: ${userId}

SECURITY ANALYSIS
=================
- Device Status: Clean
- Security Score: 98/100
- Last Scan: ${now.toLocaleString()}
- Threats Detected: 0
- Malware Found: None
- Blacklist Status: Not Listed

DEVICE INFORMATION
==================
- Model: ${deviceName}
- Serial: ${serialNumber}
- Registration Date: ${timestamp}
- Last Activity: ${now.toLocaleString()}
- Location: South Africa
- Network: Secure

RECOMMENDATIONS
===============
✓ Device is secure and clean
✓ Continue regular security scans
✓ Keep device updated
✓ Report any suspicious activity

This report is generated by STOLEN's AI security system.
        `;
        break;

      case "invoice":
        filename = `STOLEN_Invoice_${Date.now()}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - SERVICE INVOICE
==================================

Invoice ID: INV-${Date.now()}
Date: ${now.toLocaleDateString()}
Due Date: ${new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
User ID: ${userId}

BILLING DETAILS
===============
Service: Premium Device Protection
Device: ${deviceName}
Serial Number: ${serialNumber}
Period: ${now.toLocaleDateString()} - ${new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}

CHARGES
=======
Premium Protection Plan: R299.00
Blockchain Verification: R0.00 (Included)
AI Security Monitoring: R0.00 (Included)
Total: R299.00
VAT (15%): R44.85
Grand Total: R343.85

PAYMENT INFORMATION
==================
Payment Method: S-Pay Wallet
Transaction ID: TXN-${Date.now()}
Status: Paid

Thank you for your business!
        `;
        break;

      case "statement":
        filename = `STOLEN_Statement_${userId}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - ACCOUNT STATEMENT
====================================

Statement Period: ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${now.toLocaleDateString()}
Account: ${userId}
Generated: ${now.toLocaleString()}

ACCOUNT SUMMARY
===============
- Opening Balance: R1,250.00
- Total Deposits: R500.00
- Total Withdrawals: R299.00
- Closing Balance: R1,451.00

TRANSACTION HISTORY
===================
${now.toLocaleDateString()} | Premium Protection | -R299.00 | R1,451.00
${new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString()} | Deposit | +R500.00 | R1,750.00
${new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString()} | Device Registration | R0.00 | R1,250.00

For questions about this statement, contact support@stolen.app
        `;
        break;
    }

    return content;
  };

  const downloadDocument = async () => {
    setIsGenerating(true);
    
    try {
      const content = await generateDocument(type);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `STOLEN_${type.charAt(0).toUpperCase() + type.slice(1)}_${serialNumber}_${timestamp}.txt`;
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onDownload?.(type);
      
      toast({
        title: "Document Downloaded",
        description: `${getDocumentTitle()} has been downloaded successfully`
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const emailDocument = async () => {
    if (!enableEmail) return;
    
    setIsEmailing(true);
    
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Document Emailed",
        description: `${getDocumentTitle()} has been sent to your email`
      });
    } catch (error) {
      console.error('Email failed:', error);
      toast({
        title: "Email Failed",
        description: "Could not send document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEmailing(false);
    }
  };

  const Icon = getDocumentIcon();

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getDocumentColor()}`}>
            <Icon className="w-5 h-5" />
          </div>
          {getDocumentTitle()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Device:</span>
            <span className="font-medium">{deviceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Serial:</span>
            <span className="font-medium font-mono">{serialNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Generated:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={variant}
            size={size}
            onClick={downloadDocument}
            disabled={isGenerating || isEmailing}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </Button>
          
          {enableEmail && (
            <Button
              variant="outline"
              size={size}
              onClick={emailDocument}
              disabled={isGenerating || isEmailing}
            >
              {isEmailing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {showPreview && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium">Document Preview Available</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click download to generate and view the full document
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

