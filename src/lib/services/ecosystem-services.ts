/**
 * Comprehensive Ecosystem Services for Gutu AI Assistant
 * Integrates all stakeholder services: marketplace, repair, insurance, police, community
 */

export interface UserProfile {
  id?: string;
  name?: string;
  type: 'guest' | 'buyer' | 'seller' | 'retailer' | 'repair_shop' | 'insurance_agent' | 'law_enforcement';
  location?: {
    lat: number;
    lng: number;
    city: string;
    province: string;
  };
  preferences?: {
    brands: string[];
    priceRange: { min: number; max: number };
    categories: string[];
  };
  isHotBuyer?: boolean;
  isHotSeller?: boolean;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  location: string;
  images: string[];
  isHotDeal: boolean;
  category: string;
  description: string;
  features: string[];
  warranty?: string;
  negotiable: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'repair' | 'insurance' | 'police' | 'donation_center';
  address: string;
  phone: string;
  email?: string;
  rating: number;
  specialties?: string[];
  workingHours: string;
  location: {
    lat: number;
    lng: number;
    distance?: number;
  };
  verified: boolean;
}

export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  deviceType: string;
  brand: string;
  model?: string;
  serialNumber?: string;
  description: string;
  location: string;
  dateReported: Date;
  reporterContact: string;
  images?: string[];
  status: 'active' | 'resolved';
  matchProbability?: number;
}

export interface DonationNeed {
  id: string;
  organization: string;
  deviceType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  contact: string;
  deadline?: Date;
}

export interface MarketInsight {
  category: string;
  trendingProducts: string[];
  averagePrice: number;
  demandLevel: 'low' | 'medium' | 'high';
  seasonalFactors: string[];
  recommendations: string[];
}

export class EcosystemServices {
  private static instance: EcosystemServices;
  private userProfile: UserProfile | null = null;

  public static getInstance(): EcosystemServices {
    if (!EcosystemServices.instance) {
      EcosystemServices.instance = new EcosystemServices();
    }
    return EcosystemServices.instance;
  }

  setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  getPersonalizedGreeting(): string {
    if (!this.userProfile) {
      return "Hi there! I'm Gutu, your STOLEN ecosystem assistant.";
    }

    if (this.userProfile.type === 'guest') {
      return "Hello! I'm Gutu, your STOLEN ecosystem assistant.";
    }

    const name = this.userProfile.name || 'friend';
    const typeGreeting = this.getTypeSpecificGreeting();
    
    return `Hi ${name}! I'm Gutu, your personal STOLEN assistant. ${typeGreeting}`;
  }

  private getTypeSpecificGreeting(): string {
    if (!this.userProfile) return "";

    switch (this.userProfile.type) {
      case 'buyer':
        return this.userProfile.isHotBuyer 
          ? "I see you're actively looking for devices - let me help you find the perfect match!"
          : "I can help you find great devices and connect with trusted sellers.";
      case 'seller':
        return this.userProfile.isHotSeller
          ? "Ready to showcase your devices to eager buyers? I'll help you connect!"
          : "I can help you list your devices and reach the right buyers.";
      case 'retailer':
        return "I'll keep you updated on market trends and connect you with bulk buyers.";
      case 'repair_shop':
        return "I can connect you with device owners who need your expertise.";
      case 'insurance_agent':
        return "I can help connect you with device owners looking for protection.";
      default:
        return "I'm here to help you navigate the entire STOLEN ecosystem.";
    }
  }

  // Marketplace Integration
  async getPersonalizedProducts(query?: string, limit: number = 5): Promise<MarketplaceProduct[]> {
    // Mock data - replace with actual API calls
    const mockProducts: MarketplaceProduct[] = [
      {
        id: "1",
        name: "iPhone 14 Pro",
        brand: "Apple",
        model: "iPhone 14 Pro",
        price: 18000,
        condition: "like-new",
        sellerId: "seller1",
        sellerName: "TechHub JHB",
        sellerRating: 4.8,
        location: "Johannesburg",
        images: ["/api/placeholder/300/200"],
        isHotDeal: true,
        category: "smartphones",
        description: "Pristine condition iPhone 14 Pro with all accessories",
        features: ["128GB", "Deep Purple", "Unlocked", "Warranty remaining"],
        warranty: "6 months remaining",
        negotiable: true
      },
      {
        id: "2",
        name: "Samsung Galaxy S23",
        brand: "Samsung",
        model: "Galaxy S23",
        price: 15000,
        condition: "new",
        sellerId: "seller2",
        sellerName: "Galaxy Store CPT",
        sellerRating: 4.9,
        location: "Cape Town",
        images: ["/api/placeholder/300/200"],
        isHotDeal: false,
        category: "smartphones",
        description: "Brand new Samsung Galaxy S23 with full warranty",
        features: ["256GB", "Phantom Black", "Dual SIM", "2 year warranty"],
        warranty: "2 years",
        negotiable: false
      }
    ];

    // Filter based on user preferences
    if (this.userProfile?.preferences) {
      return mockProducts.filter(product => {
        const { brands, priceRange, categories } = this.userProfile!.preferences!;
        return (
          (!brands?.length || brands.includes(product.brand)) &&
          (!priceRange || (product.price >= priceRange.min && product.price <= priceRange.max)) &&
          (!categories?.length || categories.includes(product.category))
        );
      }).slice(0, limit);
    }

    return mockProducts.slice(0, limit);
  }

  // Service Provider Integration
  async getNearbyServices(type: ServiceProvider['type'], userLocation?: { lat: number; lng: number }): Promise<ServiceProvider[]> {
    // Mock data - replace with actual API calls
    const mockServices: ServiceProvider[] = [
      {
        id: "repair1",
        name: "iFixit Johannesburg",
        type: "repair",
        address: "123 Commissioner St, Johannesburg, 2001",
        phone: "+27 11 123 4567",
        email: "info@ifixit-jhb.co.za",
        rating: 4.7,
        specialties: ["iPhone repair", "Samsung repair", "Screen replacement", "Water damage"],
        workingHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM",
        location: { lat: -26.2041, lng: 28.0473 },
        verified: true
      },
      {
        id: "insurance1",
        name: "Santam Device Insurance",
        type: "insurance",
        address: "456 Sandton Drive, Sandton, 2196",
        phone: "+27 11 456 7890",
        rating: 4.5,
        specialties: ["Device insurance", "Theft protection", "Accidental damage"],
        workingHours: "Mon-Fri: 8AM-5PM",
        location: { lat: -26.1076, lng: 28.0567 },
        verified: true
      },
      {
        id: "police1",
        name: "Johannesburg Central Police Station",
        type: "police",
        address: "1 Commissioner St, Johannesburg, 2001",
        phone: "10111",
        rating: 4.0,
        workingHours: "24/7",
        location: { lat: -26.2023, lng: 28.0436 },
        verified: true
      }
    ];

    return mockServices.filter(service => service.type === type);
  }

  // Lost & Found Integration
  async checkLostFoundMatches(userQuery: string): Promise<LostFoundItem[]> {
    // Mock data - replace with actual API calls
    const mockLostFound: LostFoundItem[] = [
      {
        id: "lost1",
        type: "found",
        deviceType: "smartphone",
        brand: "Apple",
        model: "iPhone 13",
        description: "Black iPhone 13 found in Rosebank Mall",
        location: "Rosebank, Johannesburg",
        dateReported: new Date('2024-01-15'),
        reporterContact: "contact@mall-security.co.za",
        status: "active",
        matchProbability: 0.85
      }
    ];

    return mockLostFound.filter(item => 
      item.description.toLowerCase().includes(userQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(userQuery.toLowerCase())
    );
  }

  // Donation Integration
  async getDonationOpportunities(): Promise<DonationNeed[]> {
    return [
      {
        id: "donation1",
        organization: "Johannesburg Children's Home",
        deviceType: "tablets",
        quantity: 10,
        urgency: "high",
        description: "Educational tablets needed for children's learning program",
        location: "Johannesburg",
        contact: "donations@jhb-childrens.org.za",
        deadline: new Date('2024-02-28')
      }
    ];
  }

  // Market Insights for Retailers
  async getMarketInsights(): Promise<MarketInsight[]> {
    return [
      {
        category: "smartphones",
        trendingProducts: ["iPhone 15", "Samsung Galaxy S24", "Google Pixel 8"],
        averagePrice: 16500,
        demandLevel: "high",
        seasonalFactors: ["Back to school season approaching", "Holiday season past"],
        recommendations: ["Stock up on mid-range devices", "Focus on student-friendly options"]
      }
    ];
  }

  // Smart Suggestions based on user type and context
  getContextualSuggestions(userQuery: string): string[] {
    if (!this.userProfile) {
      return ["Browse marketplace", "Register device", "Get help"];
    }

    const suggestions: string[] = [];
    const query = userQuery.toLowerCase();

    // Type-specific suggestions
    switch (this.userProfile.type) {
      case 'buyer':
        if (query.includes('phone') || query.includes('smartphone')) {
          suggestions.push("Show me hot deals on smartphones", "Find verified sellers near me");
        }
        suggestions.push("What's trending in my price range?", "Connect me with hot sellers");
        break;
      
      case 'seller':
        suggestions.push("Help me price my device", "Connect with hot buyers", "List my device");
        break;
      
      case 'retailer':
        suggestions.push("Show market trends", "Bulk buyer opportunities", "Popular categories");
        break;
    }

    // Context-based suggestions
    if (query.includes('repair')) {
      suggestions.push("Find repair shops near me", "Get repair cost estimate");
    }
    
    if (query.includes('insurance')) {
      suggestions.push("Compare insurance options", "Get coverage quote");
    }
    
    if (query.includes('lost') || query.includes('stolen')) {
      suggestions.push("Check lost & found", "Report to nearby police", "Community alert");
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  }

  // Generate personalized response based on user profile
  generatePersonalizedResponse(baseResponse: string, context: any): string {
    if (!this.userProfile) return baseResponse;

    let personalizedResponse = baseResponse;

    // Add personalization based on user type
    if (this.userProfile.type === 'buyer' && this.userProfile.isHotBuyer) {
      personalizedResponse += "\n\nAs a hot buyer, I can connect you with premium sellers immediately!";
    }

    if (this.userProfile.type === 'seller' && this.userProfile.isHotSeller) {
      personalizedResponse += "\n\nI notice you're an active seller - shall I alert interested buyers about your inventory?";
    }

    return personalizedResponse;
  }
}

export const ecosystemServices = EcosystemServices.getInstance();
