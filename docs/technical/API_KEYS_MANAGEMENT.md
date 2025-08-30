# API KEYS MANAGEMENT SYSTEM
## STOLEN Platform - Complete API Key Requirements

### **Overview**
This document identifies all API keys required for the STOLEN platform and provides open-source alternatives where possible to facilitate testing and development.

---

## 🔑 **REQUIRED API KEYS IDENTIFIED**

### **1. SUPABASE (Backend-as-a-Service)** ✅ **CONFIGURED**

#### **Current Configuration**:
```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = "https://lerjhxchglztvhbsdjjn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

#### **Required Keys**:
- ✅ **SUPABASE_URL** - Project URL
- ✅ **SUPABASE_ANON_KEY** - Public API key
- ⚠️ **SUPABASE_SERVICE_ROLE_KEY** - Admin key (needs secure storage)

#### **Open Source Alternative**: 
- **Supabase** is already open source and free tier available
- **Self-hosted option**: Deploy Supabase on your own infrastructure

---

### **2. GOOGLE SERVICES** 🔍 **NEEDS API KEYS**

#### **Required Services**:
1. **Google Maps API** - Geolocation and mapping
2. **Google Places API** - Location-based services
3. **Google ReCAPTCHA** - Security verification

#### **Open Source Alternatives**:
- **Maps**: OpenStreetMap + Leaflet (free)
- **Places**: OpenStreetMap Nominatim (free)
- **ReCAPTCHA**: hCaptcha (free tier available)

#### **Implementation**:
```typescript
// Open Source Map Integration
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Free OpenStreetMap tiles
const map = L.map('map').setView([-26.2041, 28.0473], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
```

---

### **3. PAYMENT GATEWAYS** 💳 **NEEDS API KEYS**

#### **Required Services**:
1. **Stripe** - Payment processing
2. **PayPal** - Payment processing
3. **Apple Pay** - Digital wallet
4. **Google Pay** - Digital wallet
5. **South African Payment Methods**:
   - SnapScan
   - Zapper
   - VodaPay

#### **Open Source Alternatives**:
- **Stripe**: Use Stripe test keys (free)
- **PayPal**: Use PayPal sandbox (free)
- **Local Payments**: Integrate with South African banks directly

#### **Test API Keys**:
```typescript
// Stripe Test Keys (Free)
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_SECRET_KEY=sk_test_51ABC123...

// PayPal Sandbox (Free)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
```

---

### **4. COMMUNICATION SERVICES** 📱 **NEEDS API KEYS**

#### **Required Services**:
1. **Twilio** - SMS and WhatsApp
2. **SendGrid** - Email delivery
3. **WhatsApp Business API** - Messaging

#### **Open Source Alternatives**:
- **SMS**: Use local South African SMS gateways
- **Email**: Use free email services (Gmail SMTP, SendGrid free tier)
- **WhatsApp**: WhatsApp Business API (free tier available)

#### **Implementation**:
```typescript
// Free Email Service (Gmail SMTP)
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
};

// Local SMS Gateway (South Africa)
const smsConfig = {
  provider: 'local_sa_gateway',
  apiKey: process.env.LOCAL_SMS_API_KEY,
  senderId: 'STOLEN'
};
```

---

### **5. AI/ML SERVICES** 🤖 **NEEDS API KEYS**

#### **Required Services**:
1. **OpenAI** - AI chat and analysis
2. **TensorFlow.js** - Client-side ML
3. **Cloud Vision API** - OCR processing

#### **Open Source Alternatives**:
- **AI Chat**: Use local LLM models (Ollama, LocalAI)
- **OCR**: Tesseract.js (free, client-side)
- **ML**: TensorFlow.js (free, client-side)

#### **Implementation**:
```typescript
// Local AI with Ollama (Free)
const localAI = {
  baseURL: 'http://localhost:11434',
  model: 'llama2',
  apiKey: null // No API key needed for local
};

// Tesseract.js OCR (Free)
import Tesseract from 'tesseract.js';
const result = await Tesseract.recognize(imageFile, 'eng');
```

---

### **6. BLOCKCHAIN SERVICES** 🔗 **NEEDS API KEYS**

#### **Required Services**:
1. **Infura** - Ethereum RPC
2. **Alchemy** - Blockchain API
3. **Polygon** - Layer 2 scaling

#### **Open Source Alternatives**:
- **Local Blockchain**: Run your own Ethereum node
- **Test Networks**: Use free testnets (Goerli, Sepolia)
- **Local Development**: Ganache (free local blockchain)

#### **Implementation**:
```typescript
// Free Test Networks
const blockchainConfig = {
  ethereum: {
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
    chainId: 5,
    networkName: 'Goerli Testnet'
  },
  polygon: {
    rpcUrl: 'https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID',
    chainId: 80001,
    networkName: 'Mumbai Testnet'
  }
};
```

---

## 🛠️ **OPEN SOURCE ALTERNATIVES IMPLEMENTATION**

### **1. MAPS & LOCATION SERVICES**

```typescript
// src/lib/open-source-maps.ts
import L from 'leaflet';

export class OpenSourceMapService {
  private map: L.Map | null = null;
  
  initializeMap(containerId: string, center: [number, number]) {
    this.map = L.map(containerId).setView(center, 10);
    
    // Free OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    return this.map;
  }
  
  // Free geocoding with Nominatim
  async geocode(address: string) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=za`
    );
    return response.json();
  }
  
  // Free reverse geocoding
  async reverseGeocode(lat: number, lng: number) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=za`
    );
    return response.json();
  }
}
```

### **2. FREE EMAIL SERVICE**

```typescript
// src/lib/free-email-service.ts
import nodemailer from 'nodemailer';

export class FreeEmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  
  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html
    };
    
    return this.transporter.sendMail(mailOptions);
  }
}
```

### **3. LOCAL AI SERVICE**

```typescript
// src/lib/local-ai-service.ts
export class LocalAIService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
  }
  
  async generateResponse(prompt: string) {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response;
  }
}
```

---

## 📋 **API KEY REQUIREMENTS SUMMARY**

### **✅ FREE/OPEN SOURCE ALTERNATIVES AVAILABLE**

| Service | Open Source Alternative | Status |
|---------|------------------------|--------|
| **Maps** | OpenStreetMap + Leaflet | ✅ Free |
| **Geocoding** | Nominatim | ✅ Free |
| **Email** | Gmail SMTP | ✅ Free |
| **OCR** | Tesseract.js | ✅ Free |
| **AI Chat** | Ollama/LocalAI | ✅ Free |
| **Blockchain** | Test Networks | ✅ Free |
| **SMS** | Local SA Gateways | ⚠️ Paid |
| **Payment** | Test Keys | ✅ Free |

### **⚠️ PAID SERVICES REQUIRED**

| Service | Cost | Alternative |
|---------|------|-------------|
| **SMS Gateway** | $0.01-0.05 per SMS | Local SA providers |
| **Production Payments** | 2-3% per transaction | Test mode available |
| **Production Maps** | $5-50/month | OpenStreetMap free |

---

## 🔧 **IMPLEMENTATION GUIDE**

### **1. Environment Variables Setup**

Create `.env.local` file:
```bash
# Supabase (Free)
REACT_APP_SUPABASE_URL=https://lerjhxchglztvhbsdjjn.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Maps (Free)
REACT_APP_USE_OPENSTREETMAP=true
REACT_APP_NOMINATIM_URL=https://nominatim.openstreetmap.org

# Email (Free)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# AI (Free)
OLLAMA_URL=http://localhost:11434

# Blockchain (Free Test Networks)
ETHEREUM_RPC_URL=https://goerli.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID

# Payment Test Keys (Free)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret

# SMS (Paid - Optional)
LOCAL_SMS_API_KEY=your_sms_gateway_key
```

### **2. Service Configuration**

```typescript
// src/config/services.ts
export const serviceConfig = {
  maps: {
    provider: process.env.REACT_APP_USE_OPENSTREETMAP ? 'openstreetmap' : 'google',
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  },
  email: {
    provider: 'gmail',
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD
  },
  ai: {
    provider: 'ollama',
    url: process.env.OLLAMA_URL
  },
  payments: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET
    }
  }
};
```

---

## 🎯 **RECOMMENDATIONS**

### **For Development/Testing**:
1. ✅ Use all free/open source alternatives
2. ✅ Use test API keys for payments
3. ✅ Use local AI models (Ollama)
4. ✅ Use OpenStreetMap for mapping

### **For Production**:
1. ⚠️ Consider paid services for reliability
2. ⚠️ Implement proper SMS gateway
3. ⚠️ Use production payment gateways
4. ⚠️ Consider Google Maps for better UX

### **Cost Estimation**:
- **Development**: $0/month (all free alternatives)
- **Production**: $50-200/month (paid services)

---

## 📞 **SERVICE PROVIDERS CONTACTS**

### **South African Payment Gateways**:
- **SnapScan**: https://www.snapscan.co.za/developers
- **Zapper**: https://zapper.co.za/developers
- **VodaPay**: https://vodapay.co.za/developers

### **SMS Gateways (South Africa)**:
- **BulkSMS**: https://www.bulksms.com/
- **Clickatell**: https://www.clickatell.com/
- **MessageBird**: https://messagebird.com/

### **Free Services**:
- **Supabase**: https://supabase.com/ (Free tier)
- **OpenStreetMap**: https://www.openstreetmap.org/ (Free)
- **Ollama**: https://ollama.ai/ (Free)
- **Tesseract.js**: https://tesseract.projectnaptha.com/ (Free)

**All services are ready for implementation with free alternatives!** 🚀
