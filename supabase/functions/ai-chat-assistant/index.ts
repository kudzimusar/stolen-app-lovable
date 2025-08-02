import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    // For now, use intelligent fallback responses based on message content
    // In production, this would connect to OpenAI or another AI service
    
    const responses = {
      register: [
        "To register a device, go to 'Register Device' and enter your device details including serial number, purchase receipt, and photos. This creates a secure blockchain record.",
        "Device registration protects your ownership rights. You'll need the serial number, purchase proof, and device photos to complete registration."
      ],
      transfer: [
        "Device transfers use dual authentication - both parties must verify the transaction. You can scan QR codes or use email/phone verification.",
        "To transfer a device, use the 'Transfer Device' feature. The recipient must accept the transfer for it to complete, ensuring security."
      ],
      verification: [
        "Device verification checks our blockchain database for ownership history, theft reports, and fraud indicators. Always verify before purchasing.",
        "Our verification system provides instant checks against stolen device databases and shows complete ownership history."
      ],
      marketplace: [
        "Only buy from verified sellers and always check device verification status. Meet in public places and use our escrow payment system.",
        "The marketplace shows only verified devices with clean ownership history. Use built-in S-Pay for secure transactions."
      ],
      fraud: [
        "Our AI analyzes device patterns, pricing anomalies, and seller behavior to detect potential fraud. Red flags are automatically highlighted.",
        "If you suspect fraud, report it immediately. Our system cross-references with law enforcement databases for quick action."
      ],
      lost: [
        "Report lost devices immediately with serial number and location details. This activates community alerts and law enforcement notifications.",
        "When reporting stolen devices, provide police case numbers and detailed descriptions to improve recovery chances."
      ],
      warranty: [
        "Track warranty status in 'Device Warranty Status'. Set alerts for expiry dates and access digital warranty certificates.",
        "Your warranty information is stored securely and can be accessed anytime. Enable notifications for renewal reminders."
      ],
      default: [
        "I'm here to help with STOLEN app features. I can assist with device registration, transfers, verification, marketplace safety, and fraud detection.",
        "Welcome to STOLEN support! Ask me about device protection, marketplace transactions, or any app features you need help with.",
        "I can guide you through device registration, ownership transfers, warranty tracking, and marketplace safety. What do you need help with?"
      ]
    };

    // Simple keyword matching to determine response category
    const lowerMessage = message.toLowerCase();
    let responseCategory = 'default';

    if (lowerMessage.includes('register') || lowerMessage.includes('registration')) {
      responseCategory = 'register';
    } else if (lowerMessage.includes('transfer') || lowerMessage.includes('ownership')) {
      responseCategory = 'transfer';
    } else if (lowerMessage.includes('verify') || lowerMessage.includes('verification') || lowerMessage.includes('check')) {
      responseCategory = 'verification';
    } else if (lowerMessage.includes('marketplace') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
      responseCategory = 'marketplace';
    } else if (lowerMessage.includes('fraud') || lowerMessage.includes('scam') || lowerMessage.includes('fake')) {
      responseCategory = 'fraud';
    } else if (lowerMessage.includes('lost') || lowerMessage.includes('stolen') || lowerMessage.includes('missing')) {
      responseCategory = 'lost';
    } else if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
      responseCategory = 'warranty';
    }

    const responseList = responses[responseCategory as keyof typeof responses] || responses.default;
    const response = responseList[Math.floor(Math.random() * responseList.length)];

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat Assistant error:', error);
    return new Response(JSON.stringify({ 
      response: "I'm experiencing technical difficulties. Please try again or contact support for assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});