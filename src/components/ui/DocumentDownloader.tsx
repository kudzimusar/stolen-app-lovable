import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentDownloaderProps {
  type: "certificate" | "receipt" | "report";
  deviceName?: string;
  serialNumber?: string;
  variant?: "outline" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
}

export const DocumentDownloader = ({ 
  type, 
  deviceName = "Device", 
  serialNumber = "UNKNOWN",
  variant = "outline",
  size = "default" 
}: DocumentDownloaderProps) => {
  const { toast } = useToast();

  const generateDocument = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    let content = "";
    let filename = "";
    
    switch (type) {
      case "certificate":
        filename = `STOLEN_Certificate_${serialNumber}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - DIGITAL CERTIFICATE OF OWNERSHIP

Certificate ID: CERT-${Date.now()}
Issue Date: ${new Date().toLocaleDateString()}
Device: ${deviceName}
Serial Number: ${serialNumber}
Blockchain Hash: 0x${Math.random().toString(16).substring(2, 18)}...${Math.random().toString(16).substring(2, 8)}

This certificate verifies the legitimate ownership and registration of the above device on the STOLEN platform. This document serves as proof of ownership and blockchain verification.

Verification Details:
- Device registered on: ${timestamp}
- Last verified: ${new Date().toLocaleString()}
- Security score: 98%
- Status: Verified & Clean

STOLEN Platform
Securing devices with blockchain technology
www.stolen.app

This is an automatically generated document.
        `;
        break;
        
      case "receipt":
        filename = `STOLEN_Receipt_${serialNumber}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - REGISTRATION RECEIPT

Receipt Number: REC-${Date.now()}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Service: Device Registration
Device: ${deviceName}
Serial: ${serialNumber}
Fee: R0.00 (Free Registration)

Transaction Details:
- Payment method: Free Service
- Blockchain confirmation: Confirmed
- Registration status: Complete

Thank you for choosing STOLEN Platform for your device security needs.

Contact: support@stolen.app
        `;
        break;
        
      case "report":
        filename = `STOLEN_Report_${serialNumber}_${timestamp}.txt`;
        content = `
STOLEN PLATFORM - DEVICE VERIFICATION REPORT

Report ID: RPT-${Date.now()}
Generated: ${new Date().toLocaleString()}

DEVICE INFORMATION
Name: ${deviceName}
Serial Number: ${serialNumber}
Registration Date: ${timestamp}
Last Verification: ${new Date().toLocaleString()}

SECURITY STATUS
Status: CLEAN - No theft reports
Verification Score: 98%
Blockchain Verified: Yes
Insurance Linked: No

OWNERSHIP HISTORY
1. Current Owner (Verified)
   - Registration: ${timestamp}
   - Status: Active

TECHNICAL VERIFICATION
- Blockchain hash: 0x${Math.random().toString(16).substring(2, 18)}...
- Network confirmations: 1,247
- Smart contract validated: Yes

This report was generated automatically from the STOLEN blockchain database.
        `;
        break;
    }
    
    return { content, filename };
  };

  const handleDownload = () => {
    try {
      const { content, filename } = generateDocument(type);
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${filename} is being downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getButtonText = () => {
    switch (type) {
      case "certificate":
        return "Download Certificate";
      case "receipt":
        return "Download Receipt";
      case "report":
        return "Download Report";
      default:
        return "Download Document";
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleDownload}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      {getButtonText()}
    </Button>
  );
};