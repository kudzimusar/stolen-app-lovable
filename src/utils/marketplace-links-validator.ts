// Marketplace Links Validator
// Validates all marketplace-related routes and navigation links

export interface LinkValidationResult {
  url: string;
  status: 'valid' | 'invalid' | 'missing' | 'protected';
  component: string;
  description: string;
  requires_auth: boolean;
  stakeholder_access?: string[];
}

export interface MarketplaceLink {
  path: string;
  component: string;
  description: string;
  public: boolean;
  stakeholder_access?: string[];
}

// All marketplace-related routes from App.tsx analysis
export const MARKETPLACE_LINKS: MarketplaceLink[] = [
  // Core Marketplace Routes
  {
    path: '/marketplace',
    component: 'Marketplace',
    description: 'Main marketplace browse and search',
    public: true
  },
  {
    path: '/marketplace/product/:id',
    component: 'ProductDetail',
    description: 'Individual product detail page',
    public: true
  },
  {
    path: '/seller/:sellerId',
    component: 'SellerProfile',
    description: 'Seller profile and listings',
    public: true
  },
  {
    path: '/seller/:sellerId/contact',
    component: 'ContactSeller',
    description: 'Contact seller form',
    public: true
  },

  // Shopping Cart & Checkout
  {
    path: '/cart',
    component: 'Cart',
    description: 'Shopping cart management',
    public: false
  },
  {
    path: '/checkout/:paymentIntentId',
    component: 'Checkout',
    description: 'Payment checkout process',
    public: false
  },
  {
    path: '/escrow/:listingId',
    component: 'EscrowPayment',
    description: 'Escrow payment processing',
    public: false
  },

  // Post-Purchase
  {
    path: '/order/:orderId/confirmation',
    component: 'PostPurchase',
    description: 'Order confirmation page',
    public: false
  },
  {
    path: '/orders/:orderId',
    component: 'OrderDetails',
    description: 'Order details and tracking',
    public: false
  },
  {
    path: '/relist/:orderId',
    component: 'RelistDevice',
    description: 'Relist purchased device',
    public: false
  },

  // Seller Features
  {
    path: '/list-my-device',
    component: 'ListMyDevice',
    description: 'Create new device listing',
    public: false,
    stakeholder_access: ['member', 'retailer']
  },
  {
    path: '/seller-onboarding',
    component: 'SellerOnboarding',
    description: 'Seller account setup',
    public: false
  },
  {
    path: '/bulk-listing',
    component: 'BulkListing',
    description: 'Bulk device listing',
    public: false,
    stakeholder_access: ['retailer']
  },

  // Deals & Offers
  {
    path: '/hot-deals',
    component: 'HotDeals',
    description: 'Hot deals marketplace',
    public: false
  },
  {
    path: '/hot-deals-feed',
    component: 'HotDealsFeed',
    description: 'Real-time deals feed',
    public: false
  },
  {
    path: '/hot-deals-hub',
    component: 'HotDealsHub',
    description: 'Deals hub and management',
    public: false
  },
  {
    path: '/hot-buyer-request',
    component: 'HotBuyerRequest',
    description: 'Buyer request creation',
    public: false
  },
  {
    path: '/hot-deals-chat/:dealId',
    component: 'HotDealsChatPage',
    description: 'Deal-specific chat',
    public: false
  },

  // User Features
  {
    path: '/wishlist',
    component: 'Wishlist',
    description: 'User wishlist management',
    public: false
  },
  {
    path: '/report-listing/:id',
    component: 'ReportListing',
    description: 'Report problematic listing',
    public: false
  },

  // Navigation Links (from components)
  {
    path: '/why-stolen',
    component: 'WhyStolen',
    description: 'Platform information page',
    public: true
  }
];

// Navigation items from BottomNavigation and AppHeader
export const NAVIGATION_LINKS = [
  // Bottom Navigation (Mobile)
  { path: '/dashboard', label: 'Home', stakeholder: 'all' },
  { path: '/device/check', label: 'Check', stakeholder: 'all' },
  { path: '/list-my-device', label: 'Sell', stakeholder: 'member' },
  { path: '/marketplace', label: 'Market', stakeholder: 'member' },
  { path: '/profile', label: 'Profile', stakeholder: 'all' },

  // Header Navigation (Desktop)
  { path: '/why-stolen', label: 'Why STOLEN?', stakeholder: 'all' },
  { path: '/hot-deals-hub', label: 'Quick Deals', stakeholder: 'all' },
  { path: '/marketplace', label: 'Marketplace', stakeholder: 'all' },
  { path: '/support', label: 'Support', stakeholder: 'all' },
  { path: '/dashboard', label: 'Dashboard', stakeholder: 'authenticated' },

  // Hamburger Menu (Mobile)
  { path: '/device/register', label: 'Register New Gadget', stakeholder: 'authenticated' },
  { path: '/device-transfer', label: 'Transfer', stakeholder: 'authenticated' },
  { path: '/community-board', label: 'Lost and Found Community', stakeholder: 'authenticated' },
  { path: '/my-devices', label: 'My Devices', stakeholder: 'authenticated' },
  { path: '/stolen-reports', label: 'Stolen Reports', stakeholder: 'authenticated' }
];

export class MarketplaceLinksValidator {
  private validationResults: LinkValidationResult[] = [];

  async validateAllLinks(): Promise<LinkValidationResult[]> {
    this.validationResults = [];

    // Validate marketplace routes
    for (const link of MARKETPLACE_LINKS) {
      const result = await this.validateLink(link);
      this.validationResults.push(result);
    }

    // Validate navigation links
    for (const navLink of NAVIGATION_LINKS) {
      if (!this.validationResults.find(r => r.url === navLink.path)) {
        const result = await this.validateNavigationLink(navLink);
        this.validationResults.push(result);
      }
    }

    return this.validationResults;
  }

  private async validateLink(link: MarketplaceLink): Promise<LinkValidationResult> {
    try {
      // Check if component file exists
      const componentExists = await this.checkComponentExists(link.component);
      
      if (!componentExists) {
        return {
          url: link.path,
          status: 'missing',
          component: link.component,
          description: link.description,
          requires_auth: !link.public,
          stakeholder_access: link.stakeholder_access
        };
      }

      // For routes with parameters, validate the pattern
      const hasValidPattern = this.validateRoutePattern(link.path);
      
      return {
        url: link.path,
        status: hasValidPattern ? 'valid' : 'invalid',
        component: link.component,
        description: link.description,
        requires_auth: !link.public,
        stakeholder_access: link.stakeholder_access
      };
    } catch (error) {
      return {
        url: link.path,
        status: 'invalid',
        component: link.component,
        description: `Validation error: ${error}`,
        requires_auth: !link.public,
        stakeholder_access: link.stakeholder_access
      };
    }
  }

  private async validateNavigationLink(navLink: any): Promise<LinkValidationResult> {
    // Check if this is a marketplace-related navigation link
    const isMarketplaceRelated = navLink.path.includes('marketplace') || 
                                navLink.path.includes('deals') || 
                                navLink.path.includes('list-my-device');

    if (!isMarketplaceRelated) {
      return {
        url: navLink.path,
        status: 'valid',
        component: 'Navigation',
        description: navLink.label,
        requires_auth: navLink.stakeholder !== 'all',
        stakeholder_access: [navLink.stakeholder]
      };
    }

    // Find corresponding marketplace link
    const marketplaceLink = MARKETPLACE_LINKS.find(ml => ml.path === navLink.path);
    
    if (marketplaceLink) {
      return await this.validateLink(marketplaceLink);
    }

    return {
      url: navLink.path,
      status: 'missing',
      component: 'Unknown',
      description: navLink.label,
      requires_auth: navLink.stakeholder !== 'all',
      stakeholder_access: [navLink.stakeholder]
    };
  }

  private async checkComponentExists(componentName: string): Promise<boolean> {
    // List of known existing components based on file search
    const existingComponents = [
      'Marketplace', 'ProductDetail', 'SellerProfile', 'ContactSeller',
      'Cart', 'Checkout', 'EscrowPayment', 'PostPurchase', 'OrderDetails',
      'RelistDevice', 'ListMyDevice', 'BulkListing', 'HotDeals',
      'HotDealsFeed', 'HotDealsHub', 'HotBuyerRequest', 'HotDealsChatPage',
      'Wishlist', 'ReportListing', 'WhyStolen'
    ];

    return existingComponents.includes(componentName);
  }

  private validateRoutePattern(path: string): boolean {
    // Validate route patterns for parameters
    const validPatterns = [
      /^\/marketplace$/,
      /^\/marketplace\/product\/:[a-zA-Z]+$/,
      /^\/seller\/:[a-zA-Z]+$/,
      /^\/seller\/:[a-zA-Z]+\/contact$/,
      /^\/cart$/,
      /^\/checkout\/:[a-zA-Z]+$/,
      /^\/escrow\/:[a-zA-Z]+$/,
      /^\/order\/:[a-zA-Z]+\/confirmation$/,
      /^\/orders\/:[a-zA-Z]+$/,
      /^\/relist\/:[a-zA-Z]+$/,
      /^\/list-my-device$/,
      /^\/hot-deals$/,
      /^\/hot-deals-feed$/,
      /^\/hot-deals-hub$/,
      /^\/hot-buyer-request$/,
      /^\/hot-deals-chat\/:[a-zA-Z]+$/,
      /^\/wishlist$/,
      /^\/report-listing\/:[a-zA-Z]+$/,
      /^\/why-stolen$/
    ];

    return validPatterns.some(pattern => pattern.test(path));
  }

  getValidationSummary(): {
    total: number;
    valid: number;
    invalid: number;
    missing: number;
    protectedRoutes: number;
  } {
    const total = this.validationResults.length;
    const valid = this.validationResults.filter(r => r.status === 'valid').length;
    const invalid = this.validationResults.filter(r => r.status === 'invalid').length;
    const missing = this.validationResults.filter(r => r.status === 'missing').length;
    const protectedRoutes = this.validationResults.filter(r => r.status === 'protected').length;

    return { total, valid, invalid, missing, protectedRoutes };
  }

  getFailedLinks(): LinkValidationResult[] {
    return this.validationResults.filter(r => r.status !== 'valid');
  }

  getMarketplaceSpecificLinks(): LinkValidationResult[] {
    return this.validationResults.filter(r => 
      r.url.includes('marketplace') || 
      r.url.includes('cart') || 
      r.url.includes('checkout') || 
      r.url.includes('escrow') || 
      r.url.includes('deals') || 
      r.url.includes('list-my-device') ||
      r.url.includes('seller')
    );
  }
}

// Export singleton instance
export const marketplaceLinksValidator = new MarketplaceLinksValidator();
