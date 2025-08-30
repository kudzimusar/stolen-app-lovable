# Security Configuration Guide

## Overview

This document outlines the comprehensive security measures, configurations, and best practices implemented in the STOLEN platform to ensure data protection, user privacy, and system integrity.

---

## 🔐 **SECURITY ARCHITECTURE**

### **Security Layers**
```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Frontend  │ │   Backend   │ │   Database  │           │
│  │   Security  │ │   Security  │ │   Security  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Network   │ │   Server    │ │   Storage   │           │
│  │   Security  │ │   Security  │ │   Security  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     COMPLIANCE LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │     GDPR    │ │    FICA     │ │   PCI DSS   │           │
│  │ Compliance  │ │ Compliance  │ │ Compliance  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ **AUTHENTICATION & AUTHORIZATION**

### **Multi-Factor Authentication (MFA)**

#### **MFA Implementation**
```typescript
// MFA Configuration
const mfaConfig = {
  enabled: true,
  methods: ['sms', 'email', 'authenticator'],
  backupCodes: true,
  rememberDevice: true,
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxAttempts: 3,
  lockoutDuration: 15 * 60 * 1000 // 15 minutes
}
```

#### **MFA Flow**
1. **Primary Authentication**: Email/Password
2. **Secondary Verification**: SMS/Email/Authenticator
3. **Device Verification**: Fingerprint/Device ID
4. **Session Management**: JWT with refresh tokens

### **JWT Token Security**

#### **Token Configuration**
```typescript
// JWT Configuration
const jwtConfig = {
  accessTokenExpiry: 15 * 60, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
  algorithm: 'HS256',
  issuer: 'stolen-app',
  audience: 'stolen-users',
  secretRotation: true,
  rotationInterval: 90 * 24 * 60 * 60 // 90 days
}
```

#### **Token Security Measures**
- **Short-lived Access Tokens**: 15-minute expiry
- **Secure Refresh Tokens**: 7-day expiry with rotation
- **Token Blacklisting**: Immediate revocation capability
- **HTTPS Only**: Tokens transmitted over secure connections
- **HttpOnly Cookies**: Refresh tokens in secure cookies

### **Role-Based Access Control (RBAC)**

#### **User Roles**
```typescript
enum UserRole {
  INDIVIDUAL = 'individual',
  REPAIR_SHOP = 'repair_shop',
  RETAILER = 'retailer',
  LAW_ENFORCEMENT = 'law_enforcement',
  INSURANCE = 'insurance',
  NGO = 'ngo',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

#### **Permission Matrix**
| Role | Device Management | Marketplace | Reports | Admin | Payments |
|------|------------------|-------------|---------|-------|----------|
| Individual | ✅ Full | ✅ Buy/Sell | ✅ Own | ❌ | ✅ Wallet |
| Repair Shop | ✅ Repair | ✅ Parts | ✅ Repair | ❌ | ✅ Business |
| Retailer | ✅ Inventory | ✅ Full | ✅ Inventory | ❌ | ✅ Business |
| Law Enforcement | ✅ View | ✅ View | ✅ Full | ❌ | ❌ |
| Insurance | ✅ Claims | ✅ View | ✅ Claims | ❌ | ✅ Claims |
| NGO | ✅ View | ✅ View | ✅ View | ❌ | ❌ |
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Limited | ✅ Full |
| Super Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

---

## 🔒 **DATA ENCRYPTION**

### **Data at Rest Encryption**

#### **Database Encryption**
```sql
-- PostgreSQL Encryption Configuration
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
ALTER TABLE users ADD COLUMN encrypted_ssn BYTEA;
UPDATE users SET encrypted_ssn = pgp_sym_encrypt(ssn, 'encryption_key');

-- Encrypt entire tables
CREATE TABLE encrypted_devices (
  id UUID PRIMARY KEY,
  encrypted_data BYTEA NOT NULL
);
```

#### **File Storage Encryption**
```typescript
// Cloudinary Encryption Configuration
const cloudinaryConfig = {
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyRotation: true,
    rotationInterval: 90 * 24 * 60 * 60 * 1000 // 90 days
  },
  accessControl: {
    type: 'authenticated',
    transformation: 'fl_attachment'
  }
}
```

### **Data in Transit Encryption**

#### **HTTPS Configuration**
```typescript
// SSL/TLS Configuration
const sslConfig = {
  enabled: true,
  protocols: ['TLSv1.2', 'TLSv1.3'],
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256'
  ],
  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}
```

#### **API Security Headers**
```typescript
// Security Headers Configuration
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
}
```

---

## 🚫 **INPUT VALIDATION & SANITIZATION**

### **Frontend Validation**

#### **Form Validation**
```typescript
// Zod Schema Validation
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  deviceId: z.string().uuid('Invalid device ID format')
})
```

#### **XSS Prevention**
```typescript
// XSS Prevention Utilities
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    FORBID_TAGS: ['script', 'style', 'iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  })
}
```

### **Backend Validation**

#### **API Input Validation**
```typescript
// Supabase Edge Function Validation
const validateDeviceRegistration = (data: any) => {
  const schema = z.object({
    deviceType: z.enum(['phone', 'laptop', 'tablet', 'watch', 'other']),
    brand: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    serialNumber: z.string().min(1).max(100),
    imei: z.string().regex(/^\d{15}$/, 'IMEI must be 15 digits'),
    description: z.string().max(1000),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    })
  })
  
  return schema.parse(data)
}
```

#### **SQL Injection Prevention**
```typescript
// Parameterized Queries
const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId) // Parameterized query
    .single()
  
  return { data, error }
}
```

---

## 🛡️ **RATE LIMITING & DDoS PROTECTION**

### **API Rate Limiting**

#### **Rate Limit Configuration**
```typescript
// Rate Limiting Configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: {
    auth: 5, // 5 login attempts per 15 minutes
    api: 100, // 100 API calls per 15 minutes
    upload: 10, // 10 file uploads per 15 minutes
    search: 50 // 50 searches per 15 minutes
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
}
```

#### **Redis-based Rate Limiting**
```typescript
// Redis Rate Limiter Implementation
const rateLimiter = new RateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
})
```

### **DDoS Protection**

#### **Cloudflare Integration**
```typescript
// Cloudflare Security Configuration
const cloudflareConfig = {
  enabled: true,
  securityLevel: 'high',
  challengePassage: 30 * 60, // 30 minutes
  browserIntegrityCheck: true,
  alwaysOnline: true,
  minify: {
    css: true,
    js: true,
    html: true
  },
  rocketLoader: true,
  ssl: 'full'
}
```

---

## 🔍 **FRAUD DETECTION & AI SECURITY**

### **AI-Powered Fraud Detection**

#### **Fraud Detection System**
```typescript
// AI Fraud Detection Configuration
const fraudDetectionConfig = {
  enabled: true,
  models: {
    deviceRegistration: 'fraud-detection-v1',
    paymentProcessing: 'payment-fraud-v2',
    userBehavior: 'behavior-analysis-v1'
  },
  thresholds: {
    deviceRegistration: 0.8,
    paymentProcessing: 0.9,
    userBehavior: 0.7
  },
  actions: {
    highRisk: 'block',
    mediumRisk: 'review',
    lowRisk: 'allow'
  }
}
```

#### **Behavioral Analysis**
```typescript
// User Behavior Analysis
const analyzeUserBehavior = async (userId: string, action: string) => {
  const userProfile = await getUserProfile(userId)
  const behaviorScore = await calculateBehaviorScore(userProfile, action)
  
  if (behaviorScore > 0.8) {
    await flagForReview(userId, action, behaviorScore)
    return { allowed: false, reason: 'suspicious_behavior' }
  }
  
  return { allowed: true, score: behaviorScore }
}
```

### **Device Fingerprinting**

#### **Fingerprint.js Integration**
```typescript
// Device Fingerprinting Configuration
const fingerprintConfig = {
  enabled: true,
  components: [
    'canvas',
    'webgl',
    'audio',
    'fonts',
    'screen',
    'timezone',
    'language',
    'userAgent'
  ],
  hashAlgorithm: 'sha256',
  storage: 'localStorage',
  expiration: 30 * 24 * 60 * 60 * 1000 // 30 days
}
```

---

## 📊 **AUDIT LOGGING & MONITORING**

### **Comprehensive Logging**

#### **Audit Log Configuration**
```typescript
// Audit Logging Configuration
const auditLogConfig = {
  enabled: true,
  events: [
    'user.login',
    'user.logout',
    'user.registration',
    'device.registration',
    'device.transfer',
    'payment.processed',
    'admin.action',
    'security.violation'
  ],
  retention: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
  encryption: true,
  realTime: true
}
```

#### **Log Structure**
```typescript
interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  action: string
  resource: string
  resourceId: string
  ipAddress: string
  userAgent: string
  deviceFingerprint: string
  location: {
    latitude: number
    longitude: number
    country: string
    city: string
  }
  metadata: Record<string, any>
  riskScore: number
}
```

### **Real-time Monitoring**

#### **Security Monitoring**
```typescript
// Security Monitoring Configuration
const securityMonitoring = {
  enabled: true,
  alerts: {
    failedLogins: { threshold: 5, window: 15 * 60 * 1000 },
    suspiciousActivity: { threshold: 0.8, window: 60 * 60 * 1000 },
    dataBreach: { immediate: true },
    ddosAttack: { threshold: 1000, window: 60 * 1000 }
  },
  notifications: {
    email: true,
    sms: true,
    slack: true,
    webhook: true
  }
}
```

---

## 🔐 **COMPLIANCE & REGULATIONS**

### **GDPR Compliance**

#### **Data Protection Measures**
```typescript
// GDPR Compliance Configuration
const gdprConfig = {
  enabled: true,
  dataRetention: {
    userData: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    auditLogs: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    deviceData: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
    paymentData: 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
  },
  userRights: {
    rightToAccess: true,
    rightToRectification: true,
    rightToErasure: true,
    rightToPortability: true,
    rightToObject: true
  },
  consentManagement: {
    required: true,
    granular: true,
    withdrawable: true,
    auditTrail: true
  }
}
```

### **FICA Compliance (South Africa)**

#### **FICA Implementation**
```typescript
// FICA Compliance Configuration
const ficaConfig = {
  enabled: true,
  verification: {
    identity: true,
    address: true,
    employment: true,
    sourceOfFunds: true
  },
  riskCategories: {
    low: { enhancedDueDiligence: false },
    medium: { enhancedDueDiligence: true },
    high: { enhancedDueDiligence: true, monitoring: true }
  },
  reporting: {
    suspiciousTransactions: true,
    largeTransactions: true,
    threshold: 25000 // ZAR
  }
}
```

### **PCI DSS Compliance**

#### **Payment Security**
```typescript
// PCI DSS Compliance Configuration
const pciConfig = {
  enabled: true,
  requirements: {
    buildAndMaintainSecureNetwork: true,
    protectCardholderData: true,
    maintainVulnerabilityManagement: true,
    implementStrongAccessControl: true,
    regularlyMonitorAndTestNetworks: true,
    maintainInformationSecurityPolicy: true
  },
  encryption: {
    cardData: 'AES-256-GCM',
    transmission: 'TLS 1.2+',
    keyManagement: 'HSM'
  },
  monitoring: {
    realTime: true,
    alerts: true,
    logging: true
  }
}
```

---

## 🚨 **INCIDENT RESPONSE**

### **Security Incident Response Plan**

#### **Incident Classification**
```typescript
enum SecurityIncidentLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface SecurityIncident {
  id: string
  level: SecurityIncidentLevel
  type: string
  description: string
  timestamp: Date
  affectedUsers: number
  affectedData: string[]
  status: 'open' | 'investigating' | 'contained' | 'resolved'
  responseTime: number
  resolutionTime: number
}
```

#### **Response Procedures**
```typescript
// Incident Response Configuration
const incidentResponse = {
  automated: {
    low: ['log', 'alert'],
    medium: ['log', 'alert', 'block_ip'],
    high: ['log', 'alert', 'block_ip', 'freeze_account'],
    critical: ['log', 'alert', 'block_ip', 'freeze_account', 'notify_authorities']
  },
  manual: {
    investigation: true,
    containment: true,
    eradication: true,
    recovery: true,
    lessonsLearned: true
  },
  notification: {
    internal: ['security_team', 'management'],
    external: ['users', 'authorities', 'partners'],
    timeline: {
      low: 24 * 60 * 60 * 1000, // 24 hours
      medium: 4 * 60 * 60 * 1000, // 4 hours
      high: 1 * 60 * 60 * 1000, // 1 hour
      critical: 15 * 60 * 1000 // 15 minutes
    }
  }
}
```

---

## 🔧 **SECURITY TESTING**

### **Automated Security Testing**

#### **Security Test Configuration**
```typescript
// Security Testing Configuration
const securityTesting = {
  automated: {
    dependencyScanning: true,
    codeScanning: true,
    containerScanning: true,
    infrastructureScanning: true
  },
  manual: {
    penetrationTesting: 'quarterly',
    securityAudit: 'annually',
    redTeamAssessment: 'annually'
  },
  tools: {
    dependencyScanner: 'npm audit',
    codeScanner: 'SonarQube',
    containerScanner: 'Trivy',
    infrastructureScanner: 'Terraform Security'
  }
}
```

#### **Vulnerability Management**
```typescript
// Vulnerability Management
const vulnerabilityManagement = {
  scanning: {
    frequency: 'daily',
    tools: ['npm audit', 'Snyk', 'OWASP ZAP'],
    severity: ['critical', 'high', 'medium', 'low']
  },
  remediation: {
    critical: 'immediate',
    high: '24_hours',
    medium: '7_days',
    low: '30_days'
  },
  reporting: {
    automated: true,
    dashboard: true,
    notifications: true
  }
}
```

---

## 📋 **SECURITY CHECKLIST**

### **Pre-Deployment Security Checklist**

#### **Code Security**
- [ ] All dependencies scanned for vulnerabilities
- [ ] Code reviewed for security issues
- [ ] Secrets and API keys not committed to repository
- [ ] Input validation implemented on all endpoints
- [ ] SQL injection prevention measures in place
- [ ] XSS protection implemented
- [ ] CSRF protection enabled

#### **Infrastructure Security**
- [ ] HTTPS enabled on all endpoints
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] DDoS protection enabled
- [ ] Firewall rules configured
- [ ] Access logs enabled
- [ ] Backup encryption enabled

#### **Authentication & Authorization**
- [ ] MFA enabled for all user types
- [ ] Password policy enforced
- [ ] Session management configured
- [ ] JWT tokens properly configured
- [ ] Role-based access control implemented
- [ ] API key rotation schedule in place

#### **Data Protection**
- [ ] Data encryption at rest enabled
- [ ] Data encryption in transit enabled
- [ ] PII data properly identified and protected
- [ ] Data retention policies configured
- [ ] Data backup and recovery tested
- [ ] Privacy policy and terms of service updated

---

## 📞 **SECURITY CONTACTS**

### **Security Team**
- **Chief Security Officer**: [Contact Information]
- **Security Engineer**: [Contact Information]
- **DevSecOps Engineer**: [Contact Information]
- **Compliance Officer**: [Contact Information]

### **Emergency Contacts**
- **24/7 Security Hotline**: [Phone Number]
- **Security Email**: security@stolen.com
- **Incident Response**: incident@stolen.com

### **External Security Partners**
- **Penetration Testing**: [Company Name]
- **Security Auditing**: [Company Name]
- **Compliance Consulting**: [Company Name]

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Document Version**: 2.1.0  
**Maintainer**: STOLEN Security Team
