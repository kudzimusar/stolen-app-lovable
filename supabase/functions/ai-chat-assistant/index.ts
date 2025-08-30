import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// STOLEN Platform Knowledge Base
const STOLEN_KNOWLEDGE_BASE = {
  platform: {
    name: "STOLEN",
    description: "South African device recovery and marketplace ecosystem",
    features: [
      "Device Registration with blockchain security",
      "Device Verification and fraud detection",
      "Marketplace with S-Pay escrow protection",
      "Device Recovery and community alerts",
      "Insurance with AI-powered claims",
      "Repair services with certified shops",
      "Law enforcement integration",
      "NGO partnerships for community programs",
      "Reverse Verification Tool (patented)",
      "S-Pay wallet system"
    ],
    stakeholders: [
      "Individual Users",
      "Repair Shops", 
      "Retailers",
      "Law Enforcement",
      "NGO Partners",
      "Insurance Admin",
      "Banks/Payment Gateways",
      "Platform Administrators"
    ]
  },
  services: {
    registration: {
      description: "Secure device registration with blockchain verification",
      process: "Upload device details, serial number, purchase proof, and photos",
      benefits: ["Ownership protection", "Theft recovery", "Marketplace access"]
    },
    verification: {
      description: "Multi-format device verification system",
      methods: ["QR Code scanning", "Serial number lookup", "OCR document processing"],
      features: ["Real-time status", "Ownership history", "Fraud detection"]
    },
    marketplace: {
      description: "Secure buying and selling platform",
      security: ["S-Pay escrow", "Verified sellers only", "Device verification required"],
      features: ["Condition assessment", "Warranty tracking", "Trust badges"]
    },
    recovery: {
      description: "Community-driven device recovery",
      features: ["Lost/Found reporting", "Community alerts", "Law enforcement integration"],
      process: "Report → Alert → Community → Recovery"
    },
    wallet: {
      description: "S-Pay secure wallet system",
      features: ["Multi-currency support", "Escrow protection", "Real-time transactions"],
      security: ["FICA compliance", "Fraud detection", "Audit trails"]
    }
  }
};

// Enhanced response categories with detailed information
const ENHANCED_RESPONSES = {
  register: {
    responses: [
      {
        text: "To register a device on STOLEN, go to Dashboard → Register Device. You'll need your device's serial number, purchase receipt, and photos. This creates a secure blockchain record that protects your ownership rights and enables marketplace access.",
        confidence: 0.95,
        actions: ["Go to Register Device", "View Registration Guide", "Learn About Blockchain Security"],
        followUp: ["Do you have your device's serial number?", "Do you need help finding your purchase receipt?"]
      },
      {
        text: "Device registration is the foundation of STOLEN's security system. It creates an immutable blockchain record of your ownership, making it nearly impossible for thieves to sell your device. Registration also enables all other platform features.",
        confidence: 0.9,
        actions: ["Start Registration", "Learn About Benefits", "View Security Features"],
        followUp: ["What type of device are you registering?", "Are you a first-time user?"]
      }
    ]
  },
  verify: {
    responses: [
      {
        text: "Device verification checks our blockchain database for ownership history, theft reports, and fraud indicators. Use our Device Check tool to verify any device before purchasing. You can enter the serial number or scan the QR code for instant results.",
        confidence: 0.95,
        actions: ["Check Device Now", "Learn About Verification", "View QR Scanner"],
        followUp: ["Do you have the device's serial number?", "Are you buying or selling?"]
      },
      {
        text: "Our verification system uses advanced AI and blockchain technology to provide instant device authenticity checks. It cross-references multiple databases including law enforcement records and community reports to ensure accuracy.",
        confidence: 0.9,
        actions: ["Use Verification Tool", "Learn About AI Detection", "View Sample Report"],
        followUp: ["What type of verification do you need?", "Are you a business user?"]
      }
    ]
  },
  marketplace: {
    responses: [
      {
        text: "Our Marketplace allows secure buying and selling of verified devices. All transactions are protected by S-Pay escrow, and we only show devices with clean ownership history. Always verify devices before purchasing and meet in safe locations.",
        confidence: 0.95,
        actions: ["Browse Marketplace", "List Your Device", "Learn Safety Tips"],
        followUp: ["Are you looking to buy or sell?", "What type of device are you interested in?"]
      },
      {
        text: "The STOLEN marketplace is designed for security and trust. Every device is verified, every seller is authenticated, and every transaction is protected by our escrow system. You can buy and sell with confidence.",
        confidence: 0.9,
        actions: ["Explore Marketplace", "View Safety Guidelines", "Learn About Escrow"],
        followUp: ["Do you have devices to sell?", "What's your budget range?"]
      }
    ]
  },
  stolen: {
    responses: [
      {
        text: "If your device is lost or stolen, immediately report it through our Lost/Found Report page. This will flag it in our system and activate community alerts and law enforcement notifications. Provide as much detail as possible including police case numbers.",
        confidence: 0.95,
        actions: ["Report Lost Device", "Report Found Device", "View Recovery Tips"],
        followUp: ["Do you have the police case number?", "When did you last see the device?"]
      },
      {
        text: "Time is critical when reporting stolen devices. Our system immediately alerts the community and law enforcement, increasing recovery chances significantly. The more details you provide, the better our AI can assist in recovery.",
        confidence: 0.9,
        actions: ["Emergency Report", "Community Alerts", "Law Enforcement Contact"],
        followUp: ["Where was the device last seen?", "Do you have device photos?"]
      }
    ]
  },
  wallet: {
    responses: [
      {
        text: "S-Pay is our secure wallet system with escrow protection for marketplace transactions. You can add funds, make secure payments, and track all transactions. All funds are protected until transactions are completed successfully.",
        confidence: 0.95,
        actions: ["Access S-Pay Wallet", "Add Funds", "View Transaction History"],
        followUp: ["Do you need help adding funds?", "Are you having trouble with a transaction?"]
      },
      {
        text: "S-Pay provides bank-level security with FICA compliance and real-time fraud detection. It's the safest way to handle device transactions, with automatic escrow protection and instant payment processing.",
        confidence: 0.9,
        actions: ["Learn About S-Pay", "Security Features", "Compliance Info"],
        followUp: ["What payment method do you prefer?", "Do you need business account features?"]
      }
    ]
  },
  insurance: {
    responses: [
      {
        text: "We offer comprehensive device insurance with AI-powered claims processing. You can get instant quotes, manage policies, and file claims through our platform. Our AI helps detect fraud and process claims quickly.",
        confidence: 0.9,
        actions: ["Get Insurance Quote", "Manage Policies", "File Claim"],
        followUp: ["What type of device do you want to insure?", "Do you need comprehensive or basic coverage?"]
      }
    ]
  },
  repair: {
    responses: [
      {
        text: "Connect with certified repair shops through our platform. All repair shops are verified and can log repairs, manage warranties, and provide quality assurance. You can book appointments and track repair progress in real-time.",
        confidence: 0.9,
        actions: ["Find Repair Shop", "Book Appointment", "Track Repair"],
        followUp: ["What type of repair do you need?", "Where are you located?"]
      }
    ]
  },
  reverse: {
    responses: [
      {
        text: "Our Reverse Verification Tool is our patented system that provides universal device authenticity verification. It's the backbone of our trust system and can verify devices through multiple methods including QR codes, serial numbers, and OCR.",
        confidence: 0.95,
        actions: ["Use Reverse Verification", "Learn About Technology", "API Access"],
        followUp: ["Are you a business looking for API access?", "Do you need bulk verification?"]
      }
    ]
  },
  default: {
    responses: [
      {
        text: "I'm here to help with all aspects of the STOLEN platform! I can assist with device registration, verification, marketplace transactions, recovery, insurance, repairs, and more. What specific area do you need help with?",
        confidence: 0.8,
        actions: ["Browse Features", "View Tutorials", "Contact Support"],
        followUp: ["Are you new to the platform?", "What brings you to STOLEN today?"]
      },
      {
        text: "Welcome to STOLEN support! I'm powered by AI to provide you with the most accurate and helpful information about our device recovery and marketplace platform. How can I assist you today?",
        confidence: 0.8,
        actions: ["Platform Overview", "Getting Started", "Feature Guide"],
        followUp: ["What's your primary use case?", "Are you a buyer or seller?"]
      }
    ]
  }
};

// Enhanced keyword matching with context awareness
function getEnhancedResponse(message: string, context: any = {}) {
  const lowerMessage = message.toLowerCase();
  const userType = context.userType || "individual";
  const recentTopics = context.recentTopics || [];
  
  // Enhanced keyword matching with priority scoring
  const keywordScores = {
    register: 0,
    verify: 0,
    marketplace: 0,
    stolen: 0,
    wallet: 0,
    insurance: 0,
    repair: 0,
    reverse: 0
  };

  // Primary keyword matching
  if (lowerMessage.includes('register') || lowerMessage.includes('registration')) {
    keywordScores.register += 10;
  }
  if (lowerMessage.includes('verify') || lowerMessage.includes('verification') || lowerMessage.includes('check')) {
    keywordScores.verify += 10;
  }
  if (lowerMessage.includes('marketplace') || lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
    keywordScores.marketplace += 10;
  }
  if (lowerMessage.includes('stolen') || lowerMessage.includes('lost') || lowerMessage.includes('missing')) {
    keywordScores.stolen += 10;
  }
  if (lowerMessage.includes('wallet') || lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
    keywordScores.wallet += 10;
  }
  if (lowerMessage.includes('insurance') || lowerMessage.includes('claim')) {
    keywordScores.insurance += 10;
  }
  if (lowerMessage.includes('repair') || lowerMessage.includes('fix')) {
    keywordScores.repair += 10;
  }
  if (lowerMessage.includes('reverse') || lowerMessage.includes('authenticity')) {
    keywordScores.reverse += 10;
  }

  // Secondary keyword matching
  if (lowerMessage.includes('device') || lowerMessage.includes('phone') || lowerMessage.includes('laptop')) {
    keywordScores.register += 2;
    keywordScores.verify += 2;
  }
  if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('protect')) {
    keywordScores.register += 3;
    keywordScores.verify += 3;
  }
  if (lowerMessage.includes('money') || lowerMessage.includes('fund') || lowerMessage.includes('transaction')) {
    keywordScores.wallet += 3;
    keywordScores.marketplace += 2;
  }

  // Context-based scoring
  if (recentTopics.includes('registration')) {
    keywordScores.register += 5;
  }
  if (recentTopics.includes('verification')) {
    keywordScores.verify += 5;
  }

  // Find the highest scoring category
  const maxScore = Math.max(...Object.values(keywordScores));
  const selectedCategory = maxScore > 0 
    ? Object.keys(keywordScores).find(key => keywordScores[key as keyof typeof keywordScores] === maxScore)
    : 'default';

  const categoryResponses = ENHANCED_RESPONSES[selectedCategory as keyof typeof ENHANCED_RESPONSES];
  const responseIndex = Math.floor(Math.random() * categoryResponses.responses.length);
  
  return {
    ...categoryResponses.responses[responseIndex],
    category: selectedCategory,
    confidence: categoryResponses.responses[responseIndex].confidence
  };
}

// Google Gemini AI Integration (if available)
async function callGeminiAI(message: string, context: any) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY';
  
  try {
    const prompt = `
You are "Gutu", a kind and intelligent ecosystem assistant for the STOLEN platform, a comprehensive South African device recovery and marketplace platform.

CORE PERSONALITY:
- Always kind, respectful, and inclusive
- Never use racial, ethnic, or any form of profiling
- Treat every user with equal respect regardless of background
- Personalize responses based on user type and preferences only
- Focus on helping, not judging

CRITICAL: AUTHENTICATION AWARENESS
- Check context.isAuthenticated to determine if user is logged in
- If NOT authenticated (guest): Address as "Hi there!" and encourage account creation for personalized features
- If authenticated: Use context.userName and provide personalized responses
- NEVER assume user details when context.isAuthenticated is false

COMPREHENSIVE SERVICES YOU PROVIDE:
1. MARKETPLACE: Product recommendations, hot deals, buyer-seller matching
2. REPAIR SERVICES: Nearby repair shops, cost estimates, specialist recommendations
3. INSURANCE: Coverage options, quotes, claim assistance
4. LAW ENFORCEMENT: Nearby police stations, reporting procedures, case tracking
5. LOST & FOUND: Community alerts, match notifications, recovery assistance
6. DONATIONS: Charity opportunities, device donation needs
7. RETAILER INSIGHTS: Market trends, bulk opportunities, demand analytics
8. PERSONALIZATION: Address users by name if logged in, provide contextual suggestions

Platform Knowledge:
${JSON.stringify(STOLEN_KNOWLEDGE_BASE, null, 2)}

User Query: ${message}
User Context: ${JSON.stringify(context)}

RESPONSE GUIDELINES:
- NO markdown formatting (no ** or *** styling) - use plain text only
- Keep responses helpful but well-formatted with clear sections
- Use numbered steps for processes (1. 2. 3.)
- Use bullet points for lists (• item)
- Break content into logical sections with empty lines
- Include personalized greetings using user name and context
- Provide comprehensive but organized information
- Ask relevant follow-up questions
- Always suggest marketplace products and services when applicable
- Make page references clickable without asterisks

LOCATION AWARENESS:
- Use context.userLocation for location-based suggestions
- Prioritize nearby services based on user's city/province
- If no location available, default to major SA cities (JHB, CPT, DBN)
- Always specify distances for service recommendations

DASHBOARD CONTEXT AWARENESS:
- Adapt responses based on context.currentSection
- If in marketplace: Focus on products, sellers, buying/selling
- If in device-register: Guide through registration process
- If in device-check: Focus on verification features
- If in insurance: Emphasize coverage and claims
- If in repair: Highlight repair shop connections

SERVICES TO INTEGRATE IN RESPONSES:
- For device queries: Suggest marketplace products, repair shops, insurance
- For buying intent: Connect with hot sellers, show hot deals
- For selling intent: Connect with hot buyers, provide market insights
- For problems: Suggest repair shops, insurance claims, police stations
- For lost devices: Check lost & found, community alerts
- For social impact: Suggest donation opportunities

Respond in JSON format:
{
  "response": "helpful response without markdown formatting, clear headings with line breaks",
  "confidence": 0.0-1.0,
  "suggestedActions": ["action1", "action2"],
  "escalationNeeded": false,
  "followUpQuestions": ["leading question1", "leading question2"],
  "relatedFeatures": ["feature1", "feature2"],
  "relatedLinks": [{"label": "link name", "url": "/path"}],
  "suggestedProducts": [{"name": "product", "price": "R000", "seller": "name"}],
  "nearbyServices": [{"name": "service", "type": "repair|insurance|police", "distance": "1.2km"}],
  "personalizedSuggestions": ["suggestion1", "suggestion2"]
}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
      }
    }
  } catch (error) {
    console.error('Gemini API error:', error);
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context = {} } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ 
        error: "Invalid message format",
        response: "Please provide a valid message."
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try Gemini AI first
    let aiResponse = await callGeminiAI(message, context);
    
    // Fallback to enhanced keyword matching
    if (!aiResponse) {
      aiResponse = getEnhancedResponse(message, context);
    }

    // Ensure we have a valid response
    if (!aiResponse || !aiResponse.response) {
      aiResponse = getEnhancedResponse(message, context);
    }

    return new Response(JSON.stringify({
      response: aiResponse.response,
      confidence: aiResponse.confidence || 0.8,
      suggestedActions: aiResponse.suggestedActions || [],
      escalationNeeded: aiResponse.escalationNeeded || false,
      followUpQuestions: aiResponse.followUpQuestions || [],
      relatedFeatures: aiResponse.relatedFeatures || [],
      category: aiResponse.category || 'default',
      aiModel: aiResponse.aiModel || 'enhanced-fallback'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Chat Assistant error:', error);
    return new Response(JSON.stringify({ 
      response: "I'm experiencing technical difficulties. Please try again or contact support for assistance.",
      confidence: 0.5,
      suggestedActions: ["Contact Support", "Try Again"],
      escalationNeeded: true,
      followUpQuestions: [],
      relatedFeatures: [],
      category: "error",
      aiModel: "fallback"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});