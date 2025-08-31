import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Shield, Smartphone, ShoppingCart, Search, HelpCircle, Zap, Move } from "lucide-react";
import { localAIService } from "@/lib/ai/local-ai-service";
import { geminiAI } from "@/lib/ai/gemini-ai-service";
import { GoogleServicesIntegration } from "@/lib/services/google-services-integration";
import { aiChatUpdateService } from "@/lib/services/ai-chat-update-service";
import { ecosystemServices, UserProfile } from "@/lib/services/ecosystem-services";
import { userContextService } from "@/lib/services/user-context-service";
import { premiumSalesAssistant } from "@/lib/services/premium-sales-assistant";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "suggestion" | "action" | "error";
  suggestions?: string[];
  actions?: { label: string; action: string }[];
  relatedLinks?: { label: string; url: string }[];
  confidence?: number;
  aiModel?: string;
  updateInfo?: {
    id: string;
    type: string;
    priority: string;
    effectiveDate: Date;
  };
  suggestedProducts?: { name: string; price: string; seller: string; url?: string }[];
  nearbyServices?: { name: string; type: string; distance: string; phone?: string }[];
  personalizedSuggestions?: string[];
}

interface ChatContext {
  userType?: string;
  recentTopics?: string[];
  deviceCount?: number;
  location?: string;
  language?: string;
  dashboardSection?: string;
  isAuthenticated?: boolean;
}

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Gutu, your intelligent STOLEN support assistant and sales expert. I can help you find the perfect device, connect with sellers, or assist with any platform questions.\n\nQuick Start Options:",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
      suggestions: [
        "Register a device",
        "Check device status", 
        "Marketplace help",
        "Report stolen device",
        "S-Pay wallet help"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>({
    language: "en",
    location: "South Africa"
  });
  const [aiService, setAiService] = useState<"gemini" | "local" | "fallback">("gemini");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);

  // Initialize AI services
  const googleServices = new GoogleServicesIntegration({
    mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc',
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCH3m-j0qTrOGxiDZw1IQ628e5_BjgePNY',
    studioApiKey: import.meta.env.VITE_GOOGLE_STUDIO_API_KEY || 'AIzaSyCwGezq21MUjfchf5DxWnRSKXqQd4YxvAI',
    visionApiKey: import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY || 'AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc'
  });

  // Initialize user context with proper authentication detection
  const initializeUserContext = async () => {
    try {
      // Initialize the user context service
      await userContextService.initialize();
      
      // Get the actual user context
      const isAuthenticated = userContextService.isAuthenticated();
      const user = userContextService.getCurrentUser();
      const location = userContextService.getUserLocation();
      const dashboardContext = userContextService.getDashboardContext();
      
      // Set up ecosystem services based on real data
      if (isAuthenticated && user) {
        const userProfile: UserProfile = {
          id: user.id,
          name: user.name,
          type: user.type,
          location: location ? {
            lat: location.lat,
            lng: location.lng,
            city: location.city || 'Unknown',
            province: location.province || 'Unknown'
          } : undefined,
          preferences: user.preferences,
          isHotBuyer: user.isHotBuyer,
          isHotSeller: user.isHotSeller
        };
        
        ecosystemServices.setUserProfile(userProfile);
      } else {
        // Guest user - minimal profile
        const guestProfile: UserProfile = {
          type: "guest",
          location: location ? {
            lat: location.lat,
            lng: location.lng,
            city: location.city || 'Unknown',
            province: location.province || 'Unknown'
          } : undefined
        };
        
        ecosystemServices.setUserProfile(guestProfile);
      }
      
      // Update chat context
      setChatContext(prev => ({
        ...prev,
        userType: user?.type || "guest",
        location: location?.city || "South Africa",
        dashboardSection: dashboardContext.section
      }));
      
      // Start location watching for mobile users
      userContextService.startLocationWatch();
      
    } catch (error) {
      console.error('Failed to initialize user context:', error);
      
      // Fallback to guest mode
      const fallbackProfile: UserProfile = {
        type: "guest"
      };
      ecosystemServices.setUserProfile(fallbackProfile);
    }
  };

  // Auto-scroll to bottom when new messages arrive - Enhanced UX
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Force scroll to bottom
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [messages, isTyping]);

  // Additional auto-scroll for typing indicator
  useEffect(() => {
    if (isTyping && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      setTimeout(() => {
        scrollArea.scrollTo({
          top: scrollArea.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isTyping]);

  // Test AI service availability and initialize on component mount
  useEffect(() => {
    const initialize = async () => {
      await initializeUserContext();
      testAIServices();
      
      // Update initial message with personalized greeting
      const personalizedGreeting = userContextService.getPersonalizedGreeting();
      setMessages(prev => prev.map(msg => 
        msg.id === "1" 
          ? { ...msg, text: `${personalizedGreeting}\n\nQuick Start Options:` }
          : msg
      ));
    };
    
    initialize();
    
    // Cleanup location watch on unmount
    return () => {
      userContextService.stopLocationWatch();
    };
  }, []);

  // Check for chat updates periodically
  useEffect(() => {
    const checkForUpdates = async () => {
      await aiChatUpdateService.checkForExternalUpdates();
    };

    // Check for updates every 30 minutes
    const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    // Initial check
    checkForUpdates();

    return () => clearInterval(updateInterval);
  }, []);

  const testAIServices = async () => {
    try {
      // Test Gemini first
      const geminiTest = await googleServices.provideIntelligentSupport(
        "test",
        { userType: "individual" },
        "en"
      );
      if (geminiTest && geminiTest.response) {
        setAiService("gemini");
        return;
      }
    } catch (error) {
      console.log("Gemini not available, trying local AI");
    }

    try {
      // Test local AI
      const localTest = await localAIService.testConnection();
      if (localTest) {
        setAiService("local");
        return;
      }
    } catch (error) {
      console.log("Local AI not available, using fallback");
    }

    setAiService("fallback");
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    // Mark conversation as started
    if (!conversationStarted) {
      setConversationStarted(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI response error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing technical difficulties. Please try again or contact our support team directly.",
        sender: "bot",
        timestamp: new Date(),
        type: "error"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = async (userInput: string): Promise<Message> => {
    // Get real-time user context
    const isAuthenticated = userContextService.isAuthenticated();
    const currentUser = userContextService.getCurrentUser();
    const userLocation = userContextService.getUserLocation();
    const dashboardContext = userContextService.getDashboardContext();
    const userProfile = ecosystemServices.getUserProfile();
    
    const context = {
      // Authentication status
      isAuthenticated,
      userType: currentUser?.type || "guest",
      userName: currentUser?.name || null,
      userId: currentUser?.id || null,
      
      // Location data
      userLocation: userLocation ? {
        city: userLocation.city,
        province: userLocation.province,
        country: userLocation.country,
        coordinates: { lat: userLocation.lat, lng: userLocation.lng },
        accuracy: userLocation.accuracy,
        source: userLocation.source
      } : null,
      
      // User preferences and behavior
      isHotBuyer: currentUser?.isHotBuyer || false,
      isHotSeller: currentUser?.isHotSeller || false,
      userPreferences: currentUser?.preferences,
      deviceCount: currentUser?.deviceCount || 0,
      
      // Dashboard context
      currentSection: dashboardContext.section,
      currentPage: dashboardContext.currentPage,
      searchQuery: dashboardContext.searchQuery,
      filters: dashboardContext.filters,
      
      // Chat context
      recentTopics: chatContext.recentTopics || [],
      language: chatContext.language || "en",
      
      // Platform features
      platformFeatures: [
        "Device Registration",
        "Device Verification", 
        "Marketplace",
        "S-Pay Wallet",
        "Device Recovery",
        "Insurance",
        "Repair Services",
        "Law Enforcement Integration",
        "NGO Partnerships",
        "Reverse Verification Tool"
      ]
    };

    // Get premium sales assistant insights
    let premiumInsights: any = {};
    
    try {
      // Check for sales/marketplace intent
      const salesKeywords = ['buy', 'sell', 'price', 'recommend', 'product', 'device', 'marketplace'];
      const hasSalesIntent = salesKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );
      
      if (hasSalesIntent) {
        const recommendations = await premiumSalesAssistant.getPersonalizedProductRecommendations(userInput);
        const matching = await premiumSalesAssistant.facilitateBuyerSellerMatching(userInput);
        
        premiumInsights = {
          salesRecommendations: recommendations.recommendations,
          hotDeals: recommendations.hotDeals,
          buyerSellerMatches: matching.matches,
          salesAttribution: recommendations.attribution
        };
        
        // Track interaction
        await premiumSalesAssistant.trackSalesAttribution('recommendation', undefined, 0);
      }
      
      // Check for service-related queries
      const serviceKeywords = ['repair', 'fix', 'broken', 'insurance', 'lost', 'stolen'];
      const hasServiceIntent = serviceKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );
      
      if (hasServiceIntent) {
        if (userInput.toLowerCase().includes('repair')) {
          premiumInsights.repairServices = await premiumSalesAssistant.findAndBookRepairServices(userInput);
        }
        if (userInput.toLowerCase().includes('insurance')) {
          premiumInsights.insuranceQuotes = await premiumSalesAssistant.getInstantInsuranceQuotes(15000); // Default device value
        }
        if (userInput.toLowerCase().includes('donation')) {
          premiumInsights.donationOpportunities = await premiumSalesAssistant.suggestDonationOpportunities();
        }
      }
      
    } catch (error) {
      console.error('Premium sales assistant error:', error);
    }

    let response: any;

    try {
      if (aiService === "gemini") {
        // Enhance context with premium insights
        const enhancedContext = {
          ...context,
          premiumInsights,
          salesMode: Object.keys(premiumInsights).length > 0
        };
        
        response = await googleServices.provideIntelligentSupport(
          userInput,
          enhancedContext,
          chatContext.language || "en"
        );
      } else if (aiService === "local") {
        const localResponse = await localAIService.getChatResponse(userInput, JSON.stringify(context));
        response = {
          response: localResponse,
          confidence: 0.85,
          suggestedActions: [],
          escalationNeeded: false,
          followUpQuestions: [],
          relatedFeatures: []
        };
      } else {
        // Fallback to enhanced keyword matching
        response = getEnhancedFallbackResponse(userInput, context);
      }

      // Update chat context based on user input
      updateChatContext(userInput, response);

      // Enhance response with chat update service
      const enhancedResponse = aiChatUpdateService.generateEnhancedResponse(userInput, response);

      // Get ecosystem suggestions
      const contextualSuggestions = ecosystemServices.getContextualSuggestions(userInput);

      // Parse Gemini's new response format if available
      const suggestedProducts = response.suggestedProducts || [];
      const nearbyServices = response.nearbyServices || [];
      const personalizedSuggestions = response.personalizedSuggestions || contextualSuggestions;

      return {
        id: (Date.now() + 1).toString(),
        text: formatResponse(enhancedResponse.response, userInput),
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        confidence: enhancedResponse.confidence,
        aiModel: aiService,
        suggestions: enhancedResponse.followUpQuestions?.slice(0, 3) || [],
        actions: enhancedResponse.suggestedActions?.map((action: string) => ({
          label: action,
          action: action.toLowerCase().replace(/\s+/g, "-")
        })) || [],
        relatedLinks: enhancedResponse.relatedLinks?.map((link: any) => 
          typeof link === 'string' 
            ? { label: link.replace('/', '').replace('-', ' ').toUpperCase(), url: link }
            : link
        ) || [],
        updateInfo: enhancedResponse.updateInfo,
        suggestedProducts,
        nearbyServices,
        personalizedSuggestions
      };
    } catch (error) {
      console.error("AI response generation failed:", error);
      return {
        id: (Date.now() + 1).toString(),
        text: getFallbackResponse(userInput),
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        aiModel: "fallback"
      };
    }
  };

  // Format response for better readability
  const formatResponse = (rawResponse: string, userInput: string) => {
    const input = userInput.toLowerCase();
    let formatted = rawResponse;

    // Ensure proper line breaks and remove excessive text
    formatted = formatted.replace(/\n\n\n+/g, '\n\n'); // Max 2 line breaks
    
    // Add leading question based on user query (just one!)
    const leadingQuestion = generateLeadingQuestion(input);
    if (leadingQuestion) {
      formatted += `\n\n${leadingQuestion}`;
    }

    return formatted;
  };

  const generateLeadingQuestion = (userInput: string): string | null => {
    const input = userInput.toLowerCase();
    
    if (input.includes('register')) {
      return 'What would you like to know more about?\n• Need help with device serial numbers?\n• Want to know about blockchain security?';
    }
    if (input.includes('verify') || input.includes('check')) {
      return 'What would you like to know more about?\n• Interested in QR code scanning?\n• Need help with ownership history?';
    }
    if (input.includes('marketplace') || input.includes('buy') || input.includes('sell')) {
      return 'What would you like to know more about?\n• Want to learn about S-Pay escrow?\n• Need help with listing a device?';
    }
    if (input.includes('stolen') || input.includes('lost')) {
      return 'What would you like to know more about?\n• Need help filing a police report?\n• Want to activate community alerts?';
    }
    if (input.includes('repair')) {
      return 'What would you like to know more about?\n• Want nearby repair shop recommendations?\n• Need help with warranty claims?';
    }
    if (input.includes('insurance')) {
      return 'What would you like to know more about?\n• Ready for an instant quote?\n• Want to compare coverage options?';
    }
    
    return 'How else can I help you today?';
  };

  const getEnhancedFallbackResponse = (userInput: string, context: any) => {
    const input = userInput.toLowerCase();
    
    // Enhanced keyword matching with context awareness
    const responses = {
      register: {
        response: "Hello! Thanks for asking about device registration. This is one of the most important steps to protect your devices.\n\nHow to Register Your Devices:\n\n1. Go to Dashboard → Register Device\n2. Prepare these items:\n   • Device serial number or IMEI\n   • Purchase receipt or proof of ownership\n   • Clear photos of the device\n3. Fill in device details (brand, model, condition)\n4. Submit for blockchain verification\n\nHow Many Devices:\n• Free accounts: Up to 5 devices\n• Premium accounts: Unlimited devices\n\nBenefits:\n• Legal ownership protection\n• Marketplace selling eligibility\n• Enhanced recovery chances\n• Insurance qualification",
        confidence: 0.9,
        suggestedActions: ["Register Device", "View Guide"],
        followUpQuestions: ["Do you have your device serial number ready?", "Need help finding your IMEI?"],
        relatedFeatures: ["Device Registration", "Blockchain Security"],
        relatedLinks: ["/device-register", "/learn"]
      },
      verify: {
        response: "Device Verification is crucial for safe transactions! Here's how it works:\n\nVerification Process:\n1. Enter device serial number or scan QR code\n2. System checks blockchain ownership history\n3. Scans for theft reports and fraud indicators\n4. Get instant results with trust score\n\nSafety Features:\n• Complete ownership chain verification\n• Real-time theft database check\n• Fraud detection algorithms\n• Community reporting integration\n\nAlways verify before purchasing any device!",
        confidence: 0.9,
        suggestedActions: ["Check Device", "Browse Verified Devices"],
        followUpQuestions: ["Do you have the device serial number?", "Are you buying or selling?"],
        relatedFeatures: ["Device Verification", "Fraud Detection", "Marketplace"],
        relatedLinks: ["/device-check", "/marketplace"],
        suggestedProducts: [
          { name: "iPhone 14 Pro", price: "R18,000", seller: "TechHub JHB", url: "/marketplace/iphone-14-pro" },
          { name: "Samsung Galaxy S23", price: "R15,000", seller: "Galaxy Store CPT", url: "/marketplace/galaxy-s23" }
        ]
      },
      marketplace: {
        response: "Welcome to STOLEN Marketplace - South Africa's most secure device trading platform!\n\nSecurity Features:\n• All devices blockchain-verified before listing\n• S-Pay escrow protection for safe payments\n• Verified seller ratings and reviews\n• Clean ownership history guaranteed\n\nSafety Guidelines:\n• Meet in public places for exchanges\n• Always verify device before purchase\n• Use platform messaging for communications\n• Report suspicious activity immediately\n\nAs your sales assistant, I can connect you with hot deals and trusted sellers in your area!",
        confidence: 0.9,
        suggestedActions: ["Browse Marketplace", "List Device"],
        followUpQuestions: ["Are you looking to buy or sell?", "What type of device interests you?"],
        relatedFeatures: ["Marketplace", "S-Pay Wallet", "Escrow"],
        relatedLinks: ["/marketplace", "/list-my-device"],
        suggestedProducts: [
          { name: "iPhone 15", price: "R22,000", seller: "Premium Mobile", url: "/marketplace/iphone-15" },
          { name: "Galaxy S24", price: "R18,500", seller: "Tech World", url: "/marketplace/galaxy-s24" }
        ],
        nearbyServices: [
          { name: "Santam Device Insurance", type: "insurance", distance: "2.3km", phone: "+27 11 456 7890" }
        ]
      },
      stolen: {
        response: "I'm sorry to hear about your lost or stolen device. Let me help you take immediate action for the best recovery chances.\n\nImmediate Steps:\n1. Report through our Lost/Found Report page\n2. File a police report and get case number\n3. Provide device photos and details\n4. Include last known location\n\nWhat Happens Next:\n• Community alerts activated across platform\n• Law enforcement networks notified\n• Device flagged in marketplace\n• Recovery tracking begins\n• Insurance claim process initiated (if applicable)\n\nI can connect you with nearby police stations and help activate community alerts immediately!",
        confidence: 0.95,
        suggestedActions: ["Report Now", "Recovery Tips"],
        followUpQuestions: ["Do you have a police case number?", "When and where was it last seen?"],
        relatedFeatures: ["Device Recovery", "Community", "Law Enforcement"],
        relatedLinks: ["/lost-found-report", "/device-recovery-status"],
        nearbyServices: [
          { name: "Johannesburg Central Police", type: "police", distance: "1.5km", phone: "10111" },
          { name: "Rosebank Police Station", type: "police", distance: "3.2km", phone: "+27 11 234 5678" }
        ]
      },
      wallet: {
        response: "S-Pay Wallet provides the most secure payment system for device transactions in South Africa.\n\nKey Features:\n• Military-grade escrow protection\n• Multi-currency support (ZAR primary, USD, EUR)\n• Real-time transaction monitoring\n• Instant payment notifications\n\nHow to Use:\n1. Add funds from your bank account\n2. Funds held in secure escrow during transaction\n3. Released automatically when both parties confirm\n4. Track all transaction history\n\nReady to make a secure purchase? I can help you find the perfect device with trusted sellers!",
        confidence: 0.9,
        suggestedActions: ["Open Wallet", "Add Funds"],
        followUpQuestions: ["Need help adding funds?", "Having transaction issues?"],
        relatedFeatures: ["S-Pay Wallet", "Escrow", "Payments"],
        relatedLinks: ["/wallet", "/escrow-payment"],
        personalizedSuggestions: ["Browse hot deals", "Find trusted sellers", "Check device history"]
      },
      insurance: {
        response: "Device Insurance\n\n• Instant quotes available\n• AI-powered claims\n• Trusted partners only\n\nProtect your investment!",
        confidence: 0.9,
        suggestedActions: ["Get Insurance Quote", "Manage Policies", "File Claim"],
        followUpQuestions: ["What device needs coverage?"],
        relatedFeatures: ["Insurance", "Claims Processing", "Fraud Detection"],
        nearbyServices: [
          { name: "Santam Device Insurance", type: "insurance", distance: "2.3km", phone: "+27 11 456 7890" },
          { name: "Discovery Insure", type: "insurance", distance: "4.1km", phone: "+27 11 529 2222" }
        ]
      },
      repair: {
        response: "Device Repair Services\n\n• Certified repair shops\n• Quality guaranteed\n• Track repair progress\n\nFind specialists near you!",
        confidence: 0.9,
        suggestedActions: ["Find Repair Shop", "Book Appointment", "Track Repair"],
        followUpQuestions: ["What needs repairing?"],
        relatedFeatures: ["Repair Services", "Warranty Tracking", "Quality Assurance"],
        nearbyServices: [
          { name: "iFixit Johannesburg", type: "repair", distance: "1.8km", phone: "+27 11 123 4567" },
          { name: "TechMed Repairs", type: "repair", distance: "2.9km", phone: "+27 11 987 6543" }
        ]
      },
      reverse: {
        response: "Our Reverse Verification Tool is our patented system that provides universal device authenticity verification. It's the backbone of our trust system and can verify devices through multiple methods including QR codes, serial numbers, and OCR.",
        confidence: 0.95,
        suggestedActions: ["Use Reverse Verification", "Learn About Technology", "API Access"],
        followUpQuestions: ["Are you a business looking for API access?", "Do you need bulk verification?"],
        relatedFeatures: ["Reverse Verification Tool", "API Services", "Trust System"]
      },
      default: {
        response: "I'm here to help with all aspects of the STOLEN platform! I can assist with device registration, verification, marketplace transactions, recovery, insurance, repairs, and more. What specific area do you need help with?",
        confidence: 0.8,
        suggestedActions: ["Browse Features", "View Tutorials", "Contact Support"],
        followUpQuestions: ["Are you new to the platform?", "What brings you to STOLEN today?"],
        relatedFeatures: ["Platform Overview", "Getting Started", "Support"]
      }
    };

    // Enhanced keyword matching
    if (input.includes("register") || input.includes("registration")) {
      return responses.register;
    }
    if (input.includes("verify") || input.includes("verification") || input.includes("check")) {
      return responses.verify;
    }
    if (input.includes("marketplace") || input.includes("buy") || input.includes("sell")) {
      return responses.marketplace;
    }
    if (input.includes("stolen") || input.includes("lost") || input.includes("missing")) {
      return responses.stolen;
    }
    if (input.includes("wallet") || input.includes("pay") || input.includes("payment")) {
      return responses.wallet;
    }
    if (input.includes("insurance") || input.includes("claim")) {
      return responses.insurance;
    }
    if (input.includes("repair") || input.includes("fix")) {
      return responses.repair;
    }
    if (input.includes("reverse") || input.includes("authenticity")) {
      return responses.reverse;
    }

    return responses.default;
  };

  const getFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("register") || input.includes("device")) {
      return "To register a device, go to Dashboard → Register Device. You'll need your device's serial number and purchase details.";
    }
    if (input.includes("stolen") || input.includes("lost")) {
      return "If your device is lost or stolen, immediately report it through our Lost/Found Report page. This will flag it in our system.";
    }
    if (input.includes("verify") || input.includes("check")) {
      return "You can verify any device using our Device Check tool. Enter the serial number or scan the QR code.";
    }
    if (input.includes("marketplace") || input.includes("buy") || input.includes("sell")) {
      return "Our Marketplace allows secure buying and selling of verified devices. All transactions are protected by S-Pay escrow.";
    }
    if (input.includes("help") || input.includes("support")) {
      return "I'm here to help! You can also visit our Support page for detailed guides and contact information.";
    }
    
    return "Thanks for your message! For complex issues, please visit our Support page or contact our team directly.";
  };

  const updateChatContext = (userInput: string, response: any) => {
    const input = userInput.toLowerCase();
    const newContext = { ...chatContext };

    // Update recent topics
    if (input.includes("register")) newContext.recentTopics = [...(newContext.recentTopics || []), "registration"];
    if (input.includes("verify")) newContext.recentTopics = [...(newContext.recentTopics || []), "verification"];
    if (input.includes("marketplace")) newContext.recentTopics = [...(newContext.recentTopics || []), "marketplace"];
    if (input.includes("stolen")) newContext.recentTopics = [...(newContext.recentTopics || []), "recovery"];

    // Keep only last 5 topics
    newContext.recentTopics = newContext.recentTopics?.slice(-5);

    setChatContext(newContext);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Auto-fill the input field instead of auto-sending
    setInputMessage(suggestion);
    
    // Focus the input field for user to review and send manually
    setTimeout(() => {
      const inputField = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
      if (inputField) {
        inputField.focus();
      }
    }, 50);
  };

  // Drag functionality for movable widget
  const handleMouseDown = (e: React.MouseEvent) => {
    if (chatWidgetRef.current && !isDragging) {
      const rect = chatWidgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      e.preventDefault();
    }
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep widget within viewport bounds
        const maxX = window.innerWidth - 384; // 384px is widget width
        const maxY = window.innerHeight - 600; // 600px is widget height
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleActionClick = (action: string) => {
    // Handle action buttons
    console.log("Action clicked:", action);
    // You can implement navigation or other actions here
  };

  const getAIStatusIcon = () => {
    switch (aiService) {
      case "gemini":
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case "local":
        return <Bot className="w-4 h-4 text-green-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={chatWidgetRef}
      className="fixed z-50 w-80 h-96"
      style={{
        bottom: position.x === 0 && position.y === 0 ? '16px' : 'auto',
        right: position.x === 0 && position.y === 0 ? '16px' : 'auto',
        left: position.x === 0 && position.y === 0 ? 'auto' : `${position.x}px`,
        top: position.x === 0 && position.y === 0 ? 'auto' : `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <Card className="flex flex-col h-full shadow-xl border-2 border-primary/20">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-400 mr-1" />
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-primary" />
              {getAIStatusIcon()}
            </div>
            <div>
              <span className="font-semibold text-sm">Gutu - STOLEN Assistant</span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {aiService === "gemini" ? "Powered by Gemini AI" : aiService === "local" ? "Local AI" : "Smart Assistant"}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%] space-y-2">
                <div
                    className={`p-3 rounded-lg text-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border/50"
                  }`}
                >
                  {message.text.split('\n').map((line, index) => (
                    <div key={index}>
                      {line}
                      {index < message.text.split('\n').length - 1 && <br />}
                    </div>
                  ))}
                  </div>
                  
                  {/* Suggestions - Only show for initial message or if conversation hasn't started */}
                  {message.suggestions && message.suggestions.length > 0 && !conversationStarted && (
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs h-7 px-2"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="secondary"
                          size="sm"
                          onClick={() => handleActionClick(action.action)}
                          className="text-xs h-7 px-2"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggested Products */}
                  {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">🛍️ Recommended Products:</p>
                      <div className="space-y-2">
                        {message.suggestedProducts.map((product, index) => (
                          <div key={index} className="bg-muted/50 p-2 rounded border text-xs">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-muted-foreground">by {product.seller}</div>
                                <div className="font-semibold text-primary">{product.price}</div>
                              </div>
                              {product.url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.location.href = product.url}
                                  className="text-xs h-6 px-2 ml-2"
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nearby Services */}
                  {message.nearbyServices && message.nearbyServices.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">📍 Nearby Services:</p>
                      <div className="space-y-2">
                        {message.nearbyServices.map((service, index) => (
                          <div key={index} className="bg-muted/50 p-2 rounded border text-xs">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">{service.name}</div>
                                <div className="text-muted-foreground capitalize">{service.type} • {service.distance}</div>
                              </div>
                              {service.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.location.href = `tel:${service.phone}`}
                                  className="text-xs h-6 px-2 ml-2"
                                >
                                  Call
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personalized Suggestions */}
                  {message.personalizedSuggestions && message.personalizedSuggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">💡 Just for you:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.personalizedSuggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs h-6 px-2"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related Links */}
                  {message.relatedLinks && message.relatedLinks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Quick Links:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.relatedLinks.map((link, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = typeof link === 'string' ? link : link.url;
                              if (url.startsWith('http')) {
                                window.open(url, '_blank');
                              } else {
                                window.location.href = url;
                              }
                            }}
                            className="text-xs h-6 px-2 text-primary hover:bg-primary/10"
                          >
                            → {typeof link === 'string' ? (link as string).replace('/', '').replace('-', ' ').toUpperCase() : (link as any).label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* AI Model Badge */}
                  {message.aiModel && message.aiModel !== "fallback" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {message.aiModel === "gemini" ? (
                        <Sparkles className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                      <span>{message.aiModel === "gemini" ? "Gemini AI" : "Local AI"}</span>
                      {message.confidence && (
                        <span>({Math.round(message.confidence * 100)}% confidence)</span>
                      )}
                      {message.updateInfo && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="w-2 h-2 mr-1" />
                          Updated
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted border border-border/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background/50">
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about STOLEN..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button 
              onClick={sendMessage} 
              size="icon"
              disabled={isTyping || !inputMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Actions - Always show for easy access */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/device-register"}
              className="text-xs h-6 px-2"
            >
              <Smartphone className="w-3 h-3 mr-1" />
              Register
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/device-check"}
              className="text-xs h-6 px-2"
            >
              <Search className="w-3 h-3 mr-1" />
              Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/marketplace"}
              className="text-xs h-6 px-2"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Marketplace
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};