import { supabase } from "@/integrations/supabase/client";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Device Fingerprinting using FingerprintJS
export const generateDeviceFingerprint = async (): Promise<string> => {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.warn('FingerprintJS failed, falling back to basic fingerprinting:', error);
    // Fallback to basic browser fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
  }
};

// Mock IMEI Database Check
export const checkIMEIDatabase = async (imei: string): Promise<{
  isStolen: boolean;
  status: 'clean' | 'stolen' | 'blacklisted' | 'unknown';
  confidence: number;
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock logic - certain IMEIs are flagged as stolen for testing
  const stolenIMEIs = ['123456789012345', '999888777666555'];
  const isStolen = stolenIMEIs.includes(imei);
  
  return {
    isStolen,
    status: isStolen ? 'stolen' : 'clean',
    confidence: isStolen ? 0.95 : 0.88
  };
};

// Mock Receipt OCR Verification
export const verifyReceiptOCR = async (imageFile: File): Promise<{
  isAuthentic: boolean;
  extractedText: string;
  confidence: number;
  details: {
    storeName?: string;
    date?: string;
    amount?: string;
    deviceModel?: string;
  };
}> => {
  // Simulate OCR processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock extraction based on filename or random
  const mockExtractions = [
    {
      isAuthentic: true,
      extractedText: "Apple Store Receipt\nDate: 2024-01-15\nTotal: $999.00\niPhone 15 Pro",
      confidence: 0.92,
      details: {
        storeName: "Apple Store",
        date: "2024-01-15",
        amount: "$999.00",
        deviceModel: "iPhone 15 Pro"
      }
    },
    {
      isAuthentic: false,
      extractedText: "Suspicious receipt format detected",
      confidence: 0.23,
      details: {}
    }
  ];
  
  // Return authentic for files containing "real" in name, fake otherwise
  return imageFile.name.toLowerCase().includes('real') ? mockExtractions[0] : mockExtractions[1];
};

// Mock OS Tamper Detection
export const detectOSTampering = (): {
  isTampered: boolean;
  isJailbroken: boolean;
  isRooted: boolean;
  confidence: number;
} => {
  // Mock detection - random for testing
  const isTampered = Math.random() < 0.1; // 10% chance for testing
  
  return {
    isTampered,
    isJailbroken: isTampered && navigator.userAgent.includes('iPhone'),
    isRooted: isTampered && navigator.userAgent.includes('Android'),
    confidence: 0.87
  };
};

// Mock Device Attestation
export const attestDevice = async (): Promise<{
  isGenuine: boolean;
  attestationScore: number;
  details: string;
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const isGenuine = Math.random() > 0.05; // 95% genuine for testing
  
  return {
    isGenuine,
    attestationScore: isGenuine ? 0.94 : 0.21,
    details: isGenuine ? "Device passed attestation checks" : "Device failed integrity verification"
  };
};

// Security Event Logging
export const logSecurityEvent = async (eventType: string, details: any, userId?: string) => {
  const eventData = {
    event_type: eventType,
    user_id: userId || 'anonymous',
    details: JSON.stringify(details),
    timestamp: new Date().toISOString(),
    ip_address: 'mock_ip', // In real app, get from server
    user_agent: navigator.userAgent,
    device_fingerprint: generateDeviceFingerprint()
  };
  
  console.log('🔒 Security Event Logged:', eventData);
  
  // In real implementation, send to backend
  // await supabase.from('security_logs').insert(eventData);
};

// Behavioral Analysis
export const analyzeBehavior = (actions: string[]): {
  riskScore: number;
  flags: string[];
  recommendation: 'allow' | 'challenge' | 'block';
} => {
  const riskFactors = {
    rapidRegistrations: actions.filter(a => a === 'registration').length > 3,
    multipleDevices: actions.filter(a => a === 'device_register').length > 5,
    suspiciousTransfers: actions.filter(a => a === 'transfer_initiate').length > 2
  };
  
  const flags = Object.entries(riskFactors)
    .filter(([_, isRisky]) => isRisky)
    .map(([factor]) => factor);
  
  const riskScore = flags.length * 0.3;
  
  return {
    riskScore,
    flags,
    recommendation: riskScore > 0.7 ? 'block' : riskScore > 0.4 ? 'challenge' : 'allow'
  };
};