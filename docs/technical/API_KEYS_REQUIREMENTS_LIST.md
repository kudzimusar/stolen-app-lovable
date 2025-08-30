# API KEYS REQUIREMENTS LIST
## STOLEN Platform - Complete Service Provider Information

### **Overview**
This document lists all API keys required for the STOLEN platform, including service providers, costs, and alternatives.

---

## 🔑 **REQUIRED API KEYS**

### **1. SUPABASE (Backend-as-a-Service)** ✅ **CONFIGURED**

#### **Service Provider**: Supabase
- **Website**: https://supabase.com/
- **Cost**: Free tier available
- **Status**: ✅ Already configured

#### **Required Keys**:
- ✅ **SUPABASE_URL** - Project URL
- ✅ **SUPABASE_ANON_KEY** - Public API key  
- ⚠️ **SUPABASE_SERVICE_ROLE_KEY** - Admin key (needs secure storage)

#### **Alternative**: Self-hosted Supabase (free)

---

### **2. GOOGLE SERVICES** 🔍 **NEEDS API KEYS**

#### **Service Provider**: Google Cloud Platform
- **Website**: https://cloud.google.com/
- **Cost**: $200 free credit, then pay-as-you-go
- **Status**: ⚠️ Needs API keys

#### **Required Services**:
1. **Google Maps API**
   - **Cost**: $5 per 1000 requests
   - **Free Tier**: $200 credit/month
   - **Alternative**: OpenStreetMap (free)

2. **Google Places API**
   - **Cost**: $17 per 1000 requests
   - **Free Tier**: $200 credit/month
   - **Alternative**: Nominatim (free)

3. **Google ReCAPTCHA**
   - **Cost**: Free
   - **Alternative**: hCaptcha (free tier)

#### **Get API Keys**:
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable APIs: Maps JavaScript API, Places API, Geocoding API
4. Create credentials (API keys)
5. Set up billing (required for Maps API)

---

### **3. PAYMENT GATEWAYS** 💳 **NEEDS API KEYS**

#### **Service Providers**:

#### **A. Stripe**
- **Website**: https://stripe.com/
- **Cost**: 2.9% + 30¢ per transaction
- **Test Keys**: Free for development
- **Status**: ⚠️ Needs API keys

#### **B. PayPal**
- **Website**: https://www.paypal.com/developer/
- **Cost**: 2.9% + fixed fee per transaction
- **Sandbox**: Free for testing
- **Status**: ⚠️ Needs API keys

#### **C. South African Payment Methods**:
1. **SnapScan**
   - **Website**: https://www.snapscan.co.za/developers
   - **Cost**: Contact for pricing
   - **Status**: ⚠️ Needs partnership

2. **Zapper**
   - **Website**: https://zapper.co.za/developers
   - **Cost**: Contact for pricing
   - **Status**: ⚠️ Needs partnership

3. **VodaPay**
   - **Website**: https://vodapay.co.za/developers
   - **Cost**: Contact for pricing
   - **Status**: ⚠️ Needs partnership

#### **Get Payment API Keys**:
1. **Stripe**: https://dashboard.stripe.com/apikeys
2. **PayPal**: https://developer.paypal.com/dashboard/
3. **Local SA**: Contact each provider directly

---

### **4. COMMUNICATION SERVICES** 📱 **NEEDS API KEYS**

#### **Service Providers**:

#### **A. Twilio**
- **Website**: https://www.twilio.com/
- **Cost**: $0.0079 per SMS, $0.0085 per WhatsApp message
- **Free Tier**: $15 credit for new accounts
- **Status**: ⚠️ Needs API keys

#### **B. SendGrid**
- **Website**: https://sendgrid.com/
- **Cost**: $14.95/month for 50k emails
- **Free Tier**: 100 emails/day
- **Status**: ⚠️ Needs API keys

#### **C. WhatsApp Business API**
- **Website**: https://business.whatsapp.com/
- **Cost**: $0.0085 per message
- **Status**: ⚠️ Needs API keys

#### **South African SMS Gateways**:
1. **BulkSMS**
   - **Website**: https://www.bulksms.com/
   - **Cost**: R0.15 per SMS
   - **Status**: ⚠️ Needs account

2. **Clickatell**
   - **Website**: https://www.clickatell.com/
   - **Cost**: Contact for pricing
   - **Status**: ⚠️ Needs account

3. **MessageBird**
   - **Website**: https://messagebird.com/
   - **Cost**: $0.05 per SMS
   - **Status**: ⚠️ Needs account

#### **Get Communication API Keys**:
1. **Twilio**: https://console.twilio.com/
2. **SendGrid**: https://app.sendgrid.com/settings/api_keys
3. **WhatsApp**: https://business.whatsapp.com/
4. **Local SA**: Contact each provider

---

### **5. AI/ML SERVICES** 🤖 **NEEDS API KEYS**

#### **Service Providers**:

#### **A. OpenAI**
- **Website**: https://openai.com/
- **Cost**: $0.002 per 1K tokens
- **Free Tier**: $5 credit for new accounts
- **Status**: ⚠️ Needs API keys

#### **B. Google Cloud Vision API**
- **Website**: https://cloud.google.com/vision
- **Cost**: $1.50 per 1000 requests
- **Free Tier**: 1000 requests/month
- **Status**: ⚠️ Needs API keys

#### **Open Source Alternatives**:
1. **Ollama** (Local AI)
   - **Website**: https://ollama.ai/
   - **Cost**: Free
   - **Status**: ✅ Implemented

2. **Tesseract.js** (OCR)
   - **Website**: https://tesseract.projectnaptha.com/
   - **Cost**: Free
   - **Status**: ✅ Implemented

#### **Get AI API Keys**:
1. **OpenAI**: https://platform.openai.com/api-keys
2. **Google Cloud**: https://console.cloud.google.com/apis/credentials

---

### **6. BLOCKCHAIN SERVICES** 🔗 **NEEDS API KEYS**

#### **Service Providers**:

#### **A. Infura**
- **Website**: https://infura.io/
- **Cost**: $0.00025 per 100K requests
- **Free Tier**: 100K requests/day
- **Status**: ⚠️ Needs API keys

#### **B. Alchemy**
- **Website**: https://www.alchemy.com/
- **Cost**: $0.00025 per 100K requests
- **Free Tier**: 300M compute units/month
- **Status**: ⚠️ Needs API keys

#### **C. Polygon**
- **Website**: https://polygon.technology/
- **Cost**: Free for basic usage
- **Status**: ⚠️ Needs API keys

#### **Free Alternatives**:
1. **Test Networks**: Goerli, Sepolia (free)
2. **Local Blockchain**: Ganache (free)
3. **Public RPC**: Public endpoints (free)

#### **Get Blockchain API Keys**:
1. **Infura**: https://app.infura.io/
2. **Alchemy**: https://www.alchemy.com/
3. **Polygon**: https://polygon.technology/

---

## 📋 **COMPLETE API KEY CHECKLIST**

### **✅ FREE/OPEN SOURCE (Ready to Use)**

| Service | Provider | Cost | Status | Implementation |
|---------|----------|------|--------|----------------|
| **Maps** | OpenStreetMap | Free | ✅ Ready | `src/lib/open-source-maps.ts` |
| **Geocoding** | Nominatim | Free | ✅ Ready | `src/lib/open-source-maps.ts` |
| **Email** | Gmail SMTP | Free | ✅ Ready | `src/lib/free-email-service.ts` |
| **OCR** | Tesseract.js | Free | ✅ Ready | Already implemented |
| **AI Chat** | Ollama | Free | ✅ Ready | `src/lib/local-ai-service.ts` |
| **Blockchain** | Test Networks | Free | ✅ Ready | Already implemented |
| **Backend** | Supabase | Free | ✅ Ready | Already configured |

### **⚠️ PAID SERVICES (Need API Keys)**

| Service | Provider | Cost | Status | Action Required |
|---------|----------|------|--------|----------------|
| **SMS Gateway** | Twilio/BulkSMS | $0.01-0.05/SMS | ⚠️ Needs Keys | Get API keys |
| **Payment Processing** | Stripe/PayPal | 2-3% per transaction | ⚠️ Needs Keys | Get API keys |
| **Production Maps** | Google Maps | $5-50/month | ⚠️ Needs Keys | Get API keys |
| **Advanced AI** | OpenAI | $0.002/1K tokens | ⚠️ Needs Keys | Get API keys |
| **Production OCR** | Google Vision | $1.50/1K requests | ⚠️ Needs Keys | Get API keys |

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

### **For Development/Testing (Free)**:
1. ✅ **Use OpenStreetMap** instead of Google Maps
2. ✅ **Use Gmail SMTP** instead of SendGrid
3. ✅ **Use Ollama** instead of OpenAI
4. ✅ **Use Tesseract.js** instead of Google Vision
5. ✅ **Use Test Networks** for blockchain

### **For Production (Paid)**:
1. ⚠️ **Get Stripe API Keys** for payment processing
2. ⚠️ **Get Twilio API Keys** for SMS
3. ⚠️ **Get Google Maps API Keys** for better UX
4. ⚠️ **Get OpenAI API Keys** for advanced AI
5. ⚠️ **Partner with SA Payment Gateways**

---

## 📞 **SERVICE PROVIDER CONTACTS**

### **Payment Gateways**:
- **Stripe**: https://stripe.com/contact
- **PayPal**: https://www.paypal.com/contact
- **SnapScan**: https://www.snapscan.co.za/contact
- **Zapper**: https://zapper.co.za/contact
- **VodaPay**: https://vodapay.co.za/contact

### **Communication Services**:
- **Twilio**: https://www.twilio.com/contact
- **SendGrid**: https://sendgrid.com/contact
- **BulkSMS**: https://www.bulksms.com/contact
- **Clickatell**: https://www.clickatell.com/contact
- **MessageBird**: https://messagebird.com/contact

### **AI Services**:
- **OpenAI**: https://openai.com/contact
- **Google Cloud**: https://cloud.google.com/contact

### **Blockchain Services**:
- **Infura**: https://infura.io/contact
- **Alchemy**: https://www.alchemy.com/contact
- **Polygon**: https://polygon.technology/contact

---

## 💰 **COST ESTIMATION**

### **Development Phase (Free)**:
- **Total Cost**: $0/month
- **Services**: All open source alternatives
- **Duration**: Unlimited

### **Production Phase (Paid)**:
- **SMS**: $50-200/month (depending on volume)
- **Payments**: 2-3% of transaction volume
- **Maps**: $5-50/month
- **AI**: $10-100/month
- **Total**: $65-350/month

### **Recommendation**:
Start with free alternatives for development and testing. Upgrade to paid services only when going to production and when you have actual user volume.

**All free alternatives are implemented and ready for use!** 🚀
