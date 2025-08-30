# API Keys & Service Providers Configuration

## Overview

This document provides a comprehensive overview of all API keys, service providers, and external integrations used in the STOLEN platform.

## 🔐 **CRITICAL SECURITY NOTICE**

⚠️ **NEVER commit API keys to version control**  
⚠️ **Use environment variables for all sensitive data**  
⚠️ **Rotate keys regularly and monitor usage**  
⚠️ **Implement proper access controls and rate limiting**

---

## 📊 **API PROVIDERS SUMMARY**

| Provider | Service Type | Status | Expiry | Cost |
|----------|-------------|---------|---------|------|
| **Supabase** | Backend-as-a-Service | ✅ Active | No Expiry | Free Tier |
| **Google Maps** | Geocoding & Maps | ✅ Active | No Expiry | $200/month credit |
| **Google Gemini** | AI/ML Services | ✅ Active | No Expiry | Pay-per-use |
| **OpenAI** | AI Chat & Analysis | ✅ Active | No Expiry | Pay-per-use |
| **Stripe** | Payment Processing | ✅ Active | No Expiry | 2.9% + 30¢ |
| **Twilio** | SMS & Communication | ✅ Active | No Expiry | Pay-per-use |
| **Sentry** | Error Tracking | ✅ Active | No Expiry | Free Tier |
| **Algolia** | Search & Analytics | ✅ Active | No Expiry | Free Tier |
| **Cloudinary** | Image Management | ✅ Active | No Expiry | Free Tier |

---

## 🏗️ **BACKEND SERVICES**

### **1. Supabase (Primary Backend)**

**Project ID**: `lerjhxchglztvhbsdjjn`  
**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry (Free Tier)  
**Cost**: Free up to 500MB database, 2GB bandwidth

#### **Configuration**
```bash
# Production Environment
REACT_APP_SUPABASE_URL=https://lerjhxchglztvhbsdjjn.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcmpoeGNoZ2x6dHZoYnNkampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzAyOTIsImV4cCI6MjA2OTIwNjI5Mn0.nzbVcrz
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### **Services Included**
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: JWT-based auth with MFA
- **Storage**: File upload and management
- **Edge Functions**: 17+ serverless functions
- **Real-time**: Live data synchronization

#### **Edge Functions Deployed**
1. `register-device` - Device registration
2. `create-listing` - Marketplace listings
3. `report-lost` - Lost device reporting
4. `report-found` - Found device reporting
5. `lost-found-reports` - Report management
6. `community-tips` - Community features
7. `law-enforcement-access` - Police integration
8. `s-pay-transfer` - Payment processing
9. `s-pay-enhanced` - Advanced payments
10. `ai-fraud-detection` - AI security
11. `mfa-authentication` - Multi-factor auth
12. `real-time-verification` - Live verification
13. `advanced-rate-limiting` - Rate limiting
14. `trigger-ai-analysis` - AI analysis
15. `ai-chat-assistant` - Chat support
16. `initiate-transfer` - Transfer initiation

---

## 🤖 **AI/ML SERVICES**

### **2. Google Gemini AI**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Pay-per-use (generous free tier)

#### **Configuration**
```bash
GEMINI_API_KEY=AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY
VITE_GEMINI_API_KEY=AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY
```

#### **Use Cases**
- **Fraud Detection**: Analyze suspicious activities
- **Chat Assistant**: Customer support automation
- **Content Analysis**: Device description analysis
- **Image Recognition**: Device identification

### **3. OpenAI**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Pay-per-use

#### **Configuration**
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_ORGANIZATION=org-your_organization_id_here
```

#### **Use Cases**
- **Advanced AI Analysis**: Complex fraud detection
- **Natural Language Processing**: Report analysis
- **Content Generation**: Automated responses

### **4. Local AI (Ollama)**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free (self-hosted)

#### **Configuration**
```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

#### **Use Cases**
- **Offline AI Processing**: Local analysis
- **Privacy-First AI**: Sensitive data processing
- **Cost Optimization**: Reduce API costs

---

## 🗺️ **MAPPING & LOCATION SERVICES**

### **5. Google Maps API**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: $200/month credit (generous for most use cases)

#### **Configuration**
```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc
VITE_GOOGLE_PLACES_API_KEY=AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc
VITE_GOOGLE_GEOCODING_API_KEY=AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc
GOOGLE_PLACES_API_KEY=AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc
GOOGLE_GEOCODING_API_KEY=AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc
GOOGLE_CLOUD_VISION_API_KEY=AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc
```

#### **Services Included**
- **Maps**: Interactive map display
- **Places**: Location search and details
- **Geocoding**: Address to coordinates conversion
- **Vision API**: OCR and image analysis

### **6. OpenStreetMap (Free Alternative)**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free

#### **Configuration**
```bash
REACT_APP_USE_OPENSTREETMAP=true
REACT_APP_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

---

## 💳 **PAYMENT PROCESSING**

### **7. Stripe**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: 2.9% + 30¢ per transaction

#### **Configuration**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_51OqX8X2KjLmNpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SECRET_KEY=sk_test_51OqX8X2KjLmNpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### **Features**
- **Payment Processing**: Credit/debit card payments
- **Webhook Integration**: Real-time payment updates
- **Multi-Currency**: Support for ZAR and other currencies
- **Fraud Protection**: Built-in fraud detection

### **8. PayPal**

**Status**: ⚠️ **CONFIGURED**  
**Expiry**: No Expiry  
**Cost**: 2.9% + fixed fee

#### **Configuration**
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox
```

### **9. South African Payment Gateways**

**Status**: ⚠️ **CONFIGURED**  
**Expiry**: No Expiry  
**Cost**: Varies by provider

#### **Configuration**
```bash
SNAPSCAN_API_KEY=your_snapscan_api_key_here
ZAPPER_API_KEY=your_zapper_api_key_here
VODAPAY_API_KEY=your_vodapay_api_key_here
```

---

## 📱 **COMMUNICATION SERVICES**

### **10. Twilio**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Pay-per-use

#### **Configuration**
```bash
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+1234567890
```

#### **Services**
- **SMS**: Text message notifications
- **WhatsApp**: WhatsApp Business API
- **Voice**: Phone call notifications
- **Verification**: Phone number verification

### **11. SendGrid**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@stolen.com
```

### **12. South African SMS Gateways**

**Status**: ⚠️ **CONFIGURED**  
**Expiry**: No Expiry  
**Cost**: Varies by provider

#### **Configuration**
```bash
BULKSMS_API_KEY=your_bulksms_api_key_here
CLICKATELL_API_KEY=your_clickatell_api_key_here
MESSAGEBIRD_API_KEY=your_messagebird_api_key_here
```

---

## 🔗 **BLOCKCHAIN SERVICES**

### **13. Infura (Ethereum)**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
INFURA_PROJECT_ID=your_infura_project_id_here
INFURA_PROJECT_SECRET=your_infura_project_secret_here
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
GOERLI_RPC_URL=https://goerli.infura.io/v3/your_project_id
```

### **14. Alchemy**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
ALCHEMY_API_KEY=your_alchemy_api_key_here
ALCHEMY_ETHEREUM_URL=https://eth-mainnet.alchemyapi.io/v2/your_api_key
ALCHEMY_POLYGON_URL=https://polygon-mainnet.alchemyapi.io/v2/your_api_key
```

### **15. Polygon & BSC**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free

#### **Configuration**
```bash
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/your_project_id
BSC_RPC_URL=https://bsc-dataseed.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

#### **Smart Contract Addresses**
```bash
ETHEREUM_DEVICE_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
POLYGON_DEVICE_REGISTRY_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
BSC_DEVICE_REGISTRY_ADDRESS=0x9876543210987654321098765432109876543210
```

---

## 🔍 **SEARCH & ANALYTICS**

### **16. Algolia**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_SEARCH_KEY=your-search-key
VITE_ALGOLIA_ADMIN_KEY=your-admin-key
```

#### **Features**
- **Search**: Advanced search functionality
- **Analytics**: Search analytics and insights
- **Personalization**: User-specific search results

### **17. Google Analytics**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free

#### **Configuration**
```bash
REACT_APP_GA_TRACKING_ID=GA-XXXXXXXXX-X
```

---

## 📊 **MONITORING & ERROR TRACKING**

### **18. Sentry**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
REACT_APP_SENTRY_DSN=https://your_sentry_dsn_here
VITE_SENTRY_DSN=your-sentry-dsn
```

#### **Features**
- **Error Tracking**: Real-time error monitoring
- **Performance Monitoring**: Application performance insights
- **Release Tracking**: Deployment monitoring

### **19. Mixpanel**

**Status**: ⚠️ **CONFIGURED**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
REACT_APP_MIXPANEL_TOKEN=your_mixpanel_token_here
```

---

## 🖼️ **MEDIA & STORAGE**

### **20. Cloudinary**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free tier available

#### **Configuration**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=stolen-app
```

#### **Features**
- **Image Optimization**: Automatic image compression
- **CDN**: Global content delivery
- **Transformations**: On-the-fly image processing
- **Upload**: Secure file upload

---

## 🔒 **SECURITY & COMPLIANCE**

### **21. Google ReCAPTCHA**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free

#### **Configuration**
```bash
REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

### **22. South African Compliance APIs**

**Status**: ⚠️ **CONFIGURED**  
**Expiry**: No Expiry  
**Cost**: Varies by provider

#### **Configuration**
```bash
FICA_API_KEY=your_fica_api_key_here
FICA_VERIFICATION_URL=https://api.fica.co.za/verify
SAPS_API_KEY=your_saps_api_key_here
SAPS_API_URL=https://api.saps.gov.za
```

### **23. South African Banks**

**Status**: ⚠️ **CONFIGURED**  
**Expiry**: No Expiry  
**Cost**: Varies by bank

#### **Configuration**
```bash
ABSA_API_KEY=your_absa_api_key_here
FNB_API_KEY=your_fnb_api_key_here
NEDBANK_API_KEY=your_nedbank_api_key_here
STANDARD_BANK_API_KEY=your_standard_bank_api_key_here
```

---

## ⚙️ **PERFORMANCE & CACHING**

### **24. Redis**

**Status**: ✅ **ACTIVE**  
**Expiry**: No Expiry  
**Cost**: Free (self-hosted) or cloud pricing

#### **Configuration**
```bash
REDIS_URL=redis://localhost:6379
```

#### **Features**
- **Caching**: Application data caching
- **Session Storage**: User session management
- **Rate Limiting**: API rate limiting
- **Job Queues**: Background job processing

---

## 📋 **API KEY MANAGEMENT**

### **Key Rotation Schedule**

| Service | Rotation Frequency | Last Rotated | Next Rotation |
|---------|-------------------|--------------|---------------|
| Supabase | 90 days | 2025-01-15 | 2025-04-15 |
| Google APIs | 365 days | 2025-01-15 | 2026-01-15 |
| Stripe | 90 days | 2025-01-15 | 2025-04-15 |
| Twilio | 90 days | 2025-01-15 | 2025-04-15 |
| OpenAI | 90 days | 2025-01-15 | 2025-04-15 |

### **Access Control**

#### **Environment-Specific Keys**
- **Development**: Use test/sandbox keys
- **Staging**: Use staging environment keys
- **Production**: Use production keys only

#### **Key Permissions**
- **Read-Only**: Analytics, monitoring APIs
- **Read-Write**: Database, storage APIs
- **Admin**: Configuration, management APIs

### **Monitoring & Alerts**

#### **Usage Monitoring**
- **Rate Limits**: Monitor API usage limits
- **Cost Tracking**: Track API costs and usage
- **Error Rates**: Monitor API error rates
- **Performance**: Track API response times

#### **Security Alerts**
- **Unauthorized Access**: Alert on suspicious API usage
- **Key Compromise**: Alert on potential key exposure
- **Rate Limit Exceeded**: Alert on API abuse
- **Cost Threshold**: Alert on unexpected costs

---

## 🚨 **EMERGENCY PROCEDURES**

### **Key Compromise Response**

1. **Immediate Actions**
   - Revoke compromised keys immediately
   - Generate new keys
   - Update environment variables
   - Deploy updated configuration

2. **Investigation**
   - Review access logs
   - Identify source of compromise
   - Assess impact scope
   - Document incident

3. **Recovery**
   - Rotate all related keys
   - Update documentation
   - Review security procedures
   - Implement additional safeguards

### **Service Outage Response**

1. **Assessment**
   - Identify affected services
   - Check service status pages
   - Assess impact on platform
   - Communicate to stakeholders

2. **Mitigation**
   - Implement fallback services
   - Activate backup providers
   - Reduce service dependencies
   - Monitor recovery progress

3. **Recovery**
   - Restore full functionality
   - Verify service health
   - Update incident documentation
   - Review and improve procedures

---

## 📞 **SUPPORT CONTACTS**

### **Provider Support**

| Provider | Support URL | Priority | Response Time |
|----------|-------------|----------|---------------|
| Supabase | https://supabase.com/support | High | 24 hours |
| Google Cloud | https://cloud.google.com/support | High | 4 hours |
| Stripe | https://support.stripe.com | High | 2 hours |
| Twilio | https://www.twilio.com/help | Medium | 8 hours |
| OpenAI | https://help.openai.com | Medium | 24 hours |
| Sentry | https://sentry.io/support | Medium | 8 hours |

### **Internal Support**

- **Technical Lead**: [Contact Information]
- **DevOps Engineer**: [Contact Information]
- **Security Officer**: [Contact Information]
- **Product Manager**: [Contact Information]

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Document Version**: 2.1.0  
**Maintainer**: STOLEN Development Team
