// Twilio Configuration for STOLEN Platform
// Free Trial API Keys - Safe for development

export const twilioConfig = {
  // Free Trial Account SID
  accountSid: 'AC1234567890abcdef1234567890abcdef',
  
  // Free Trial Auth Token
  authToken: '1234567890abcdef1234567890abcdef',
  
  // Free Trial Phone Number (SMS)
  phoneNumber: '+1234567890',
  
  // WhatsApp Business Number (if available)
  whatsappNumber: '+1234567890',
  
  // Messaging Service SID (for multiple numbers)
  messagingServiceSid: 'MG1234567890abcdef1234567890abcdef',
  
  // Webhook URLs
  webhookUrls: {
    smsStatus: '/api/twilio/sms-status',
    whatsappStatus: '/api/twilio/whatsapp-status',
    incomingSms: '/api/twilio/incoming-sms',
    incomingWhatsapp: '/api/twilio/incoming-whatsapp'
  },
  
  // South African Configuration
  southAfrica: {
    countryCode: 'ZA',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'af', 'zu', 'xh'],
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR'
  },
  
  // SMS Templates for South Africa
  smsTemplates: {
    verification: {
      en: 'Your STOLEN verification code is: {code}. Valid for 10 minutes.',
      af: 'Jou STOLEN verifikasiekode is: {code}. Geldig vir 10 minute.',
      zu: 'Ikhowudi yakho yokuqinisekisa i-STOLEN: {code}. Isebenza imizuzu eyi-10.',
      xh: 'Ikhowudi yakho yokuqinisekisa i-STOLEN: {code}. Isebenza imizuzu eyi-10.'
    },
    fraudAlert: {
      en: '⚠️ FRAUD ALERT: Suspicious activity detected on your device {device}. Contact support immediately.',
      af: '⚠️ BEDROGSWAARSKUWING: Verdagte aktiwiteit op jou toestel {device} gedekteer. Kontak ondersteuning onmiddellik.',
      zu: '⚠️ ISEXWAYISO SOKUKHOHLISA: Kutholakele umsebenzi osusayo kudivayisi yakho {device}. Xhumana nokusekela ngokukhawuleza.',
      xh: '⚠️ ISEXWAYISO SOKUKHOHLISA: Kutholakele umsebenzi osusayo kudivayisi yakho {device}. Xhumana nokusekela ngokukhawuleza.'
    },
    deviceTransfer: {
      en: 'Device transfer request for {device}. Accept or decline in your STOLEN app.',
      af: 'Toestel oordrag versoek vir {device}. Aanvaar of weier in jou STOLEN app.',
      zu: 'Isicelo sokudlulisa idivayisi {device}. Yamukela noma wenqabe ku-app yakho ye-STOLEN.',
      xh: 'Isicelo sokudlulisa idivayisi {device}. Yamukela noma wenqabe ku-app yakho ye-STOLEN.'
    },
    paymentConfirmation: {
      en: 'Payment of R{amount} confirmed for {device}. Transaction ID: {txId}',
      af: 'Betaling van R{amount} bevestig vir {device}. Transaksie ID: {txId}',
      zu: 'Inkokhelo ye-R{amount} iqinisekisiwe nge-{device}. I-ID yokuthengiselana: {txId}',
      xh: 'Inkokhelo ye-R{amount} iqinisekisiwe nge-{device}. I-ID yokuthengiselana: {txId}'
    },
    recoveryAlert: {
      en: '🎉 GREAT NEWS! Your device {device} has been found! Contact us immediately.',
      af: '🎉 GOEIE NUUS! Jou toestel {device} is gevind! Kontak ons onmiddellik.',
      zu: '🎉 INEWADI EZINHLE! Idivayisi yakho {device} itholakele! Sithinteleni ngokukhawuleza.',
      xh: '🎉 INEWADI EZINHLE! Idivayisi yakho {device} itholakele! Sithinteleni ngokukhawuleza.'
    }
  },
  
  // WhatsApp Templates (Business API)
  whatsappTemplates: {
    verification: {
      name: 'stolen_verification',
      language: 'en',
      category: 'authentication',
      components: [
        {
          type: 'body',
          text: 'Your STOLEN verification code is: {{1}}. Valid for 10 minutes.'
        }
      ]
    },
    fraudAlert: {
      name: 'stolen_fraud_alert',
      language: 'en',
      category: 'alert',
      components: [
        {
          type: 'body',
          text: '⚠️ FRAUD ALERT: Suspicious activity detected on your device {{1}}. Contact support immediately.'
        }
      ]
    }
  },
  
  // Rate Limiting for South Africa
  rateLimiting: {
    smsPerMinute: 10,
    smsPerHour: 100,
    smsPerDay: 1000,
    whatsappPerMinute: 5,
    whatsappPerHour: 50,
    whatsappPerDay: 500
  },
  
  // Error Handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000, // milliseconds
    maxMessageLength: 160,
    fallbackToEmail: true
  }
};

// Test Phone Numbers for Development
export const testPhoneNumbers = {
  valid: '+27123456789',
  invalid: '+27123456788',
  unverified: '+27123456787',
  blocked: '+27123456786',
  international: '+1234567890'
};

// SMS Status Codes
export const smsStatusCodes = {
  queued: 'queued',
  failed: 'failed',
  sent: 'sent',
  delivered: 'delivered',
  undelivered: 'undelivered',
  read: 'read'
};

// WhatsApp Status Codes
export const whatsappStatusCodes = {
  accepted: 'accepted',
  queued: 'queued',
  sending: 'sending',
  sent: 'sent',
  failed: 'failed',
  delivered: 'delivered',
  read: 'read'
};

// South African Emergency Numbers
export const emergencyNumbers = {
  police: '10111',
  ambulance: '10177',
  fire: '10177',
  crimeStop: '0860010111',
  childLine: '0800055555',
  genderViolence: '0800428428'
};

export default twilioConfig;
