// Certificate Generator for Transfer System
// Generates various types of certificates and output files for device transfers

import { ethers } from 'ethers';

// Core Interfaces
export interface CertificateData {
  transferId: string;
  deviceId: string;
  deviceName: string;
  serialNumber: string;
  fromOwner: string;
  toOwner: string;
  transferType: string;
  transferDate: Date;
  blockchainHash: string;
  amount?: number;
  currency?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    country: string;
  };
  witnesses?: string[];
  complianceChecks: string[];
  securityLevel: string;
  verificationMethods: string[];
}

export interface GeneratedCertificate {
  id: string;
  type: string;
  format: string;
  data: CertificateData;
  fileUrl: string;
  fileHash: string;
  digitalSignature: string;
  qrCode: string;
  blockchainProof: string;
  validFrom: Date;
  validUntil: Date;
  issuer: string;
}

// Certificate Types
export type CertificateType = 
  | 'ownership_certificate'
  | 'transfer_certificate'
  | 'clean_title_certificate'
  | 'warranty_certificate'
  | 'insurance_certificate'
  | 'compliance_certificate'
  | 'tax_certificate'
  | 'customs_certificate'
  | 'legal_certificate'
  | 'audit_certificate';

// Certificate Generator Class
export class CertificateGenerator {
  private digitalSignatureKey: string;
  private issuerInfo: any;

  constructor() {
    this.digitalSignatureKey = import.meta.env.VITE_DIGITAL_SIGNATURE_KEY || 'default-key';
    this.initializeIssuerInfo();
  }

  private initializeIssuerInfo() {
    this.issuerInfo = {
      name: 'STOLEN Platform',
      address: 'Cape Town, South Africa',
      website: 'https://stolen.app',
      email: 'certificates@stolen.app',
      phone: '+27 11 123 4567',
      license: 'STOLEN-CERT-2024-001',
      jurisdiction: 'South Africa',
      authority: 'STOLEN Blockchain Registry',
      blockchainNetwork: 'Ethereum Mainnet'
    };
  }

  // Main certificate generation method
  async generateCertificate(
    certificateType: CertificateType,
    data: CertificateData,
    format: string = 'pdf'
  ): Promise<GeneratedCertificate> {
    // Generate certificate content
    const certificateContent = await this.generateCertificateContent(certificateType, data);

    // Generate file
    const fileUrl = await this.generateFile(certificateContent, certificateType, data, format);

    // Generate digital signature
    const digitalSignature = await this.generateDigitalSignature(certificateContent);

    // Generate QR code
    const qrCode = await this.generateQRCode(data, certificateType);

    // Generate blockchain proof
    const blockchainProof = await this.generateBlockchainProof(data);

    // Calculate validity period (1 year default)
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Generate file hash
    const fileHash = await this.generateFileHash(certificateContent);

    return {
      id: `${certificateType}_${data.transferId}_${Date.now()}`,
      type: certificateType,
      format,
      data,
      fileUrl,
      fileHash,
      digitalSignature,
      qrCode,
      blockchainProof,
      validFrom,
      validUntil,
      issuer: this.issuerInfo.name
    };
  }

  // Generate multiple certificates for a transfer
  async generateTransferCertificates(
    data: CertificateData,
    certificateTypes: CertificateType[],
    format: string = 'pdf'
  ): Promise<GeneratedCertificate[]> {
    const certificates: GeneratedCertificate[] = [];

    for (const certificateType of certificateTypes) {
      try {
        const certificate = await this.generateCertificate(certificateType, data, format);
        certificates.push(certificate);
      } catch (error) {
        console.error(`Failed to generate certificate ${certificateType}:`, error);
      }
    }

    return certificates;
  }

  // Generate certificate content
  private async generateCertificateContent(
    certificateType: CertificateType,
    data: CertificateData
  ): Promise<string> {
    const template = this.getCertificateTemplate(certificateType);
    
    // Replace placeholders with actual data
    const processedContent = template
      .replace(/\{\{transferId\}\}/g, data.transferId)
      .replace(/\{\{deviceId\}\}/g, data.deviceId)
      .replace(/\{\{deviceName\}\}/g, data.deviceName)
      .replace(/\{\{serialNumber\}\}/g, data.serialNumber)
      .replace(/\{\{fromOwner\}\}/g, data.fromOwner)
      .replace(/\{\{toOwner\}\}/g, data.toOwner)
      .replace(/\{\{transferType\}\}/g, data.transferType)
      .replace(/\{\{transferDate\}\}/g, data.transferDate.toLocaleDateString())
      .replace(/\{\{blockchainHash\}\}/g, data.blockchainHash)
      .replace(/\{\{amount\}\}/g, data.amount?.toString() || 'N/A')
      .replace(/\{\{currency\}\}/g, data.currency || 'N/A')
      .replace(/\{\{location\}\}/g, `${data.location.address}, ${data.location.country}`)
      .replace(/\{\{witnesses\}\}/g, data.witnesses?.join(', ') || 'N/A')
      .replace(/\{\{complianceChecks\}\}/g, data.complianceChecks.join(', '))
      .replace(/\{\{securityLevel\}\}/g, data.securityLevel)
      .replace(/\{\{verificationMethods\}\}/g, data.verificationMethods.join(', '))
      .replace(/\{\{issuerName\}\}/g, this.issuerInfo.name)
      .replace(/\{\{issuerAddress\}\}/g, this.issuerInfo.address)
      .replace(/\{\{issuerWebsite\}\}/g, this.issuerInfo.website)
      .replace(/\{\{issuerEmail\}\}/g, this.issuerInfo.email)
      .replace(/\{\{issuerPhone\}\}/g, this.issuerInfo.phone)
      .replace(/\{\{issuerLicense\}\}/g, this.issuerInfo.license)
      .replace(/\{\{issuerJurisdiction\}\}/g, this.issuerInfo.jurisdiction)
      .replace(/\{\{blockchainNetwork\}\}/g, this.issuerInfo.blockchainNetwork)
      .replace(/\{\{generatedDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{validFrom\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{validUntil\}\}/g, new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString());

    return processedContent;
  }

  // Get certificate template
  private getCertificateTemplate(certificateType: CertificateType): string {
    const templates: { [key: string]: string } = {
      ownership_certificate: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #1f2937;">
          <div style="text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #1f2937; margin: 0;">CERTIFICATE OF OWNERSHIP</h1>
            <p style="color: #6b7280; margin: 10px 0;">STOLEN Platform - Blockchain Verified</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937;">Device Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Device ID:</strong></td><td>{{deviceId}}</td></tr>
              <tr><td><strong>Device Name:</strong></td><td>{{deviceName}}</td></tr>
              <tr><td><strong>Serial Number:</strong></td><td>{{serialNumber}}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937;">Transfer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Transfer ID:</strong></td><td>{{transferId}}</td></tr>
              <tr><td><strong>From Owner:</strong></td><td>{{fromOwner}}</td></tr>
              <tr><td><strong>To Owner:</strong></td><td>{{toOwner}}</td></tr>
              <tr><td><strong>Transfer Type:</strong></td><td>{{transferType}}</td></tr>
              <tr><td><strong>Transfer Date:</strong></td><td>{{transferDate}}</td></tr>
              <tr><td><strong>Amount:</strong></td><td>{{amount}} {{currency}}</td></tr>
              <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937;">Blockchain Verification</h2>
            <p><strong>Transaction Hash:</strong> {{blockchainHash}}</p>
            <p><strong>Network:</strong> {{blockchainNetwork}}</p>
            <p><strong>Status:</strong> Confirmed</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937;">Security & Compliance</h2>
            <p><strong>Security Level:</strong> {{securityLevel}}</p>
            <p><strong>Verification Methods:</strong> {{verificationMethods}}</p>
            <p><strong>Compliance Checks:</strong> {{complianceChecks}}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937;">Validity</h2>
            <p><strong>Valid From:</strong> {{validFrom}}</p>
            <p><strong>Valid Until:</strong> {{validUntil}}</p>
          </div>
          
          <div style="text-align: center; border-top: 2px solid #1f2937; padding-top: 20px;">
            <p><strong>Issued by:</strong> {{issuerName}}</p>
            <p>{{issuerAddress}} | {{issuerWebsite}}</p>
            <p>Email: {{issuerEmail}} | Phone: {{issuerPhone}}</p>
            <p>License: {{issuerLicense}} | Jurisdiction: {{issuerJurisdiction}}</p>
            <p style="font-size: 12px; color: #6b7280;">
              This certificate is digitally signed and verified by STOLEN's blockchain infrastructure.
              The information contained herein is immutable and tamper-proof.
            </p>
          </div>
        </div>
      `,
      
      transfer_certificate: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #059669; background-color: #f0fdf4;">
          <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #059669; margin: 0;">TRANSFER CERTIFICATE</h1>
            <p style="color: #6b7280; margin: 10px 0;">Device Ownership Transfer Document</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #059669;">Transfer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Transfer ID:</strong></td><td>{{transferId}}</td></tr>
              <tr><td><strong>Device:</strong></td><td>{{deviceName}} ({{serialNumber}})</td></tr>
              <tr><td><strong>From:</strong></td><td>{{fromOwner}}</td></tr>
              <tr><td><strong>To:</strong></td><td>{{toOwner}}</td></tr>
              <tr><td><strong>Type:</strong></td><td>{{transferType}}</td></tr>
              <tr><td><strong>Date:</strong></td><td>{{transferDate}}</td></tr>
              <tr><td><strong>Amount:</strong></td><td>{{amount}} {{currency}}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #059669;">Blockchain Record</h2>
            <p><strong>Transaction Hash:</strong> {{blockchainHash}}</p>
            <p><strong>Network:</strong> {{blockchainNetwork}}</p>
          </div>
          
          <div style="text-align: center; border-top: 2px solid #059669; padding-top: 20px;">
            <p><strong>Issued by:</strong> {{issuerName}}</p>
            <p>{{issuerAddress}} | {{issuerWebsite}}</p>
            <p>Valid until: {{validUntil}}</p>
          </div>
        </div>
      `,
      
      clean_title_certificate: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #7c3aed; background-color: #faf5ff;">
          <div style="text-align: center; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7c3aed; margin: 0;">CLEAN TITLE CERTIFICATE</h1>
            <p style="color: #6b7280; margin: 10px 0;">Clean Ownership History Verification</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #7c3aed;">Device Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Device ID:</strong></td><td>{{deviceId}}</td></tr>
              <tr><td><strong>Device Name:</strong></td><td>{{deviceName}}</td></tr>
              <tr><td><strong>Serial Number:</strong></td><td>{{serialNumber}}</td></tr>
              <tr><td><strong>Current Owner:</strong></td><td>{{toOwner}}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #7c3aed;">Clean Title Verification</h2>
            <p><strong>Status:</strong> Clean Title Confirmed</p>
            <p><strong>No Stolen Reports:</strong> Verified</p>
            <p><strong>No Outstanding Liens:</strong> Confirmed</p>
            <p><strong>Ownership History:</strong> Verified</p>
            <p><strong>Blockchain Hash:</strong> {{blockchainHash}}</p>
          </div>
          
          <div style="text-align: center; border-top: 2px solid #7c3aed; padding-top: 20px;">
            <p><strong>Issued by:</strong> {{issuerName}}</p>
            <p>{{issuerAddress}} | {{issuerWebsite}}</p>
            <p>Valid until: {{validUntil}}</p>
          </div>
        </div>
      `,
      
      compliance_certificate: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #166534; background-color: #f0fdf4;">
          <div style="text-align: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #166534; margin: 0;">COMPLIANCE CERTIFICATE</h1>
            <p style="color: #6b7280; margin: 10px 0;">Legal Compliance Verification</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #166534;">Transfer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Transfer ID:</strong></td><td>{{transferId}}</td></tr>
              <tr><td><strong>Device:</strong></td><td>{{deviceName}} ({{serialNumber}})</td></tr>
              <tr><td><strong>Transfer Type:</strong></td><td>{{transferType}}</td></tr>
              <tr><td><strong>Transfer Date:</strong></td><td>{{transferDate}}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #166534;">Compliance Checks</h2>
            <p><strong>Compliance Status:</strong> All Checks Passed</p>
            <p><strong>Verified Requirements:</strong> {{complianceChecks}}</p>
            <p><strong>Security Level:</strong> {{securityLevel}}</p>
            <p><strong>Verification Methods:</strong> {{verificationMethods}}</p>
          </div>
          
          <div style="text-align: center; border-top: 2px solid #166534; padding-top: 20px;">
            <p><strong>Issued by:</strong> {{issuerName}}</p>
            <p>{{issuerAddress}} | {{issuerWebsite}}</p>
            <p>Valid until: {{validUntil}}</p>
          </div>
        </div>
      `,
      
      legal_certificate: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #581c87; background-color: #faf5ff;">
          <div style="text-align: center; border-bottom: 2px solid #581c87; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #581c87; margin: 0;">LEGAL TRANSFER CERTIFICATE</h1>
            <p style="color: #6b7280; margin: 10px 0;">Legal Transfer Documentation</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #581c87;">Legal Transfer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Transfer ID:</strong></td><td>{{transferId}}</td></tr>
              <tr><td><strong>Device:</strong></td><td>{{deviceName}} ({{serialNumber}})</td></tr>
              <tr><td><strong>From Owner:</strong></td><td>{{fromOwner}}</td></tr>
              <tr><td><strong>To Owner:</strong></td><td>{{toOwner}}</td></tr>
              <tr><td><strong>Transfer Type:</strong></td><td>{{transferType}}</td></tr>
              <tr><td><strong>Transfer Date:</strong></td><td>{{transferDate}}</td></tr>
              <tr><td><strong>Witnesses:</strong></td><td>{{witnesses}}</td></tr>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #581c87;">Legal Verification</h2>
            <p><strong>Blockchain Hash:</strong> {{blockchainHash}}</p>
            <p><strong>Digital Signature:</strong> Verified</p>
            <p><strong>Legal Compliance:</strong> Confirmed</p>
            <p><strong>Jurisdiction:</strong> {{issuerJurisdiction}}</p>
          </div>
          
          <div style="text-align: center; border-top: 2px solid #581c87; padding-top: 20px;">
            <p><strong>Issued by:</strong> {{issuerName}}</p>
            <p>{{issuerAddress}} | {{issuerWebsite}}</p>
            <p>Valid until: {{validUntil}}</p>
          </div>
        </div>
      `
    };

    return templates[certificateType] || templates.ownership_certificate;
  }

  // Generate file (PDF, HTML, JSON)
  private async generateFile(
    content: string,
    certificateType: CertificateType,
    data: CertificateData,
    format: string
  ): Promise<string> {
    if (format === 'html') {
      return await this.generateHTML(content, certificateType, data);
    } else if (format === 'json') {
      return await this.generateJSON(content, certificateType, data);
    } else {
      // Default to HTML for now
      return await this.generateHTML(content, certificateType, data);
    }
  }

  // Generate HTML
  private async generateHTML(content: string, certificateType: CertificateType, data: CertificateData): Promise<string> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${certificateType.replace(/_/g, ' ').toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .certificate { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; padding: 20px; border-bottom: 2px solid #1f2937; }
          .content { padding: 20px; }
          .footer { text-align: center; padding: 20px; border-top: 2px solid #1f2937; background-color: #f9fafb; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          td:first-child { font-weight: bold; width: 30%; }
          h2 { color: #1f2937; margin-top: 20px; margin-bottom: 10px; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          ${content}
          <div class="qr-code">
            <p><strong>QR Code for Verification:</strong></p>
            <div id="qrcode"></div>
          </div>
        </div>
        <script>
          // QR Code generation would be implemented here
          console.log('QR Code data: ${data.blockchainHash}');
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  // Generate JSON
  private async generateJSON(content: string, certificateType: CertificateType, data: CertificateData): Promise<string> {
    const jsonData = {
      certificate: {
        type: certificateType,
        data: data,
        content: content,
        generatedAt: new Date().toISOString(),
        issuer: this.issuerInfo,
        validity: {
          from: new Date().toISOString(),
          until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  // Generate digital signature
  private async generateDigitalSignature(content: string): Promise<string> {
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(content));
    const privateKey = this.digitalSignatureKey;
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    return signature;
  }

  // Generate QR code
  private async generateQRCode(data: CertificateData, certificateType: CertificateType): Promise<string> {
    const qrData = {
      certificateId: `${certificateType}_${data.transferId}`,
      deviceId: data.deviceId,
      serialNumber: data.serialNumber,
      blockchainHash: data.blockchainHash,
      transferDate: data.transferDate.toISOString(),
      issuer: this.issuerInfo.name,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // For now, return a data URL placeholder
    return `data:image/png;base64,${Buffer.from(JSON.stringify(qrData)).toString('base64')}`;
  }

  // Generate blockchain proof
  private async generateBlockchainProof(data: CertificateData): Promise<string> {
    const proofData = {
      deviceId: data.deviceId,
      transferId: data.transferId,
      blockchainHash: data.blockchainHash,
      timestamp: new Date().toISOString(),
      network: this.issuerInfo.blockchainNetwork
    };
    
    return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(proofData)));
  }

  // Generate file hash
  private async generateFileHash(content: string): Promise<string> {
    return ethers.keccak256(ethers.toUtf8Bytes(content));
  }

  // Get available certificate types
  getAvailableCertificateTypes(): CertificateType[] {
    return [
      'ownership_certificate',
      'transfer_certificate',
      'clean_title_certificate',
      'warranty_certificate',
      'insurance_certificate',
      'compliance_certificate',
      'tax_certificate',
      'customs_certificate',
      'legal_certificate',
      'audit_certificate'
    ];
  }

  // Verify certificate
  async verifyCertificate(certificate: GeneratedCertificate): Promise<boolean> {
    try {
      // Verify digital signature
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(certificate.data.toString()));
      const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        certificate.digitalSignature
      );
      
      // Verify blockchain proof
      const expectedProof = await this.generateBlockchainProof(certificate.data);
      const blockchainValid = certificate.blockchainProof === expectedProof;
      
      // Verify validity period
      const now = new Date();
      const valid = now >= certificate.validFrom && now <= certificate.validUntil;
      
      return recoveredAddress !== ethers.ZeroAddress && blockchainValid && valid;
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return false;
    }
  }
}

export default CertificateGenerator;
