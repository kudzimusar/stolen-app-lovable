/**
 * User Context Service for Gutu AI Assistant
 * Handles authentication detection, user context, and location awareness
 */

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  type: 'buyer' | 'seller' | 'retailer' | 'repair_shop' | 'insurance_agent' | 'law_enforcement';
  preferences?: {
    brands: string[];
    priceRange: { min: number; max: number };
    categories: string[];
  };
  isHotBuyer?: boolean;
  isHotSeller?: boolean;
  deviceCount?: number;
  registrationDate?: Date;
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  province?: string;
  country?: string;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual' | 'fallback';
}

export interface DashboardContext {
  section: 'landing' | 'marketplace' | 'device-register' | 'device-check' | 'insurance' | 'repair' | 'wallet' | 'profile' | 'analytics' | 'support';
  currentPage?: string;
  userAction?: string;
  searchQuery?: string;
  filters?: any;
}

export class UserContextService {
  private static instance: UserContextService;
  private currentUser: AuthenticatedUser | null = null;
  private userLocation: UserLocation | null = null;
  private dashboardContext: DashboardContext = { section: 'landing' };
  private locationWatchId: number | null = null;

  public static getInstance(): UserContextService {
    if (!UserContextService.instance) {
      UserContextService.instance = new UserContextService();
    }
    return UserContextService.instance;
  }

  // Authentication Detection
  async detectAuthenticationStatus(): Promise<boolean> {
    try {
      // Check localStorage for auth token
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('supabase.auth.token');
      if (!authToken) {
        this.currentUser = null;
        return false;
      }

      // Validate token and get user info
      const userInfo = await this.fetchUserInfo(authToken);
      if (userInfo) {
        this.currentUser = userInfo;
        return true;
      }

      this.currentUser = null;
      return false;
    } catch (error) {
      console.error('Auth detection failed:', error);
      this.currentUser = null;
      return false;
    }
  }

  private async fetchUserInfo(token: string): Promise<AuthenticatedUser | null> {
    try {
      // In a real implementation, this would call your auth API
      // For now, we'll simulate based on available data
      
      // Check if we can get user from Supabase auth
      if (typeof window !== 'undefined' && (window as any).supabase) {
        const { data: { user } } = await (window as any).supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            type: user.user_metadata?.user_type || 'buyer',
            preferences: user.user_metadata?.preferences,
            isHotBuyer: user.user_metadata?.isHotBuyer || false,
            isHotSeller: user.user_metadata?.isHotSeller || false,
            deviceCount: user.user_metadata?.deviceCount || 0,
            registrationDate: new Date(user.created_at)
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }

  // Geolocation Detection
  async detectUserLocation(): Promise<UserLocation | null> {
    try {
      // Try GPS first
      const gpsLocation = await this.getGPSLocation();
      if (gpsLocation) {
        this.userLocation = gpsLocation;
        return gpsLocation;
      }

      // Fallback to IP-based location
      const ipLocation = await this.getIPLocation();
      if (ipLocation) {
        this.userLocation = ipLocation;
        return ipLocation;
      }

      // Final fallback to South Africa (since STOLEN is SA-focused)
      const fallbackLocation: UserLocation = {
        lat: -26.2041,
        lng: 28.0473,
        city: 'Johannesburg',
        province: 'Gauteng',
        country: 'South Africa',
        source: 'fallback'
      };

      this.userLocation = fallbackLocation;
      return fallbackLocation;
    } catch (error) {
      console.error('Location detection failed:', error);
      return null;
    }
  }

  private async getGPSLocation(): Promise<UserLocation | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocode to get city/province
          const locationDetails = await this.reverseGeocode(latitude, longitude);
          
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
            city: locationDetails?.city,
            province: locationDetails?.province,
            country: locationDetails?.country || 'South Africa',
            source: 'gps'
          });
        },
        () => resolve(null),
        { timeout: 5000, maximumAge: 300000 } // 5 second timeout, 5 minute cache
      );
    });
  }

  private async getIPLocation(): Promise<UserLocation | null> {
    try {
      // Using ipapi.co (free tier)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          province: data.region,
          country: data.country_name,
          source: 'ip'
        };
      }
      
      return null;
    } catch (error) {
      console.error('IP location failed:', error);
      return null;
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<{city?: string, province?: string, country?: string} | null> {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBcUjcOHMpeAbpJwUr8R2jUp5vFIUTqvyc';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        
        let city, province, country;
        
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            province = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
        
        return { city, province, country };
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  // Dashboard Context Detection
  detectDashboardContext(): DashboardContext {
    if (typeof window === 'undefined') {
      return { section: 'landing' };
    }

    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    let section: DashboardContext['section'] = 'landing';
    
    if (path.includes('/marketplace')) section = 'marketplace';
    else if (path.includes('/device-register')) section = 'device-register';
    else if (path.includes('/device-check')) section = 'device-check';
    else if (path.includes('/insurance')) section = 'insurance';
    else if (path.includes('/repair')) section = 'repair';
    else if (path.includes('/wallet')) section = 'wallet';
    else if (path.includes('/profile')) section = 'profile';
    else if (path.includes('/analytics')) section = 'analytics';
    else if (path.includes('/support')) section = 'support';

    this.dashboardContext = {
      section,
      currentPage: path,
      searchQuery: searchParams.get('q') || undefined,
      filters: Object.fromEntries(searchParams.entries())
    };

    return this.dashboardContext;
  }

  // Getters
  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUser;
  }

  getUserLocation(): UserLocation | null {
    return this.userLocation;
  }

  getDashboardContext(): DashboardContext {
    return this.dashboardContext;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Personalized Greeting
  getPersonalizedGreeting(): string {
    const context = this.getDashboardContext();
    const isAuth = this.isAuthenticated();
    const user = this.getCurrentUser();
    
    let greeting = "Hi there! I'm Gutu, your STOLEN ecosystem assistant.";
    
    if (isAuth && user) {
      greeting = `Hi ${user.name}! I'm Gutu, your personal STOLEN assistant.`;
      
      // Add context-specific greeting
      switch (user.type) {
        case 'buyer':
          greeting += user.isHotBuyer 
            ? " I see you're actively looking for devices - let me help you find the perfect match!"
            : " I can help you find great devices and connect with trusted sellers.";
          break;
        case 'seller':
          greeting += user.isHotSeller
            ? " Ready to showcase your devices to eager buyers? I'll help you connect!"
            : " I can help you list your devices and reach the right buyers.";
          break;
        case 'retailer':
          greeting += " I'll keep you updated on market trends and connect you with bulk buyers.";
          break;
      }
    } else {
      // Guest user - encourage sign up
      greeting += " I can help you explore our platform. For personalized assistance, consider creating an account!";
    }

    // Add section-specific context
    switch (context.section) {
      case 'marketplace':
        greeting += isAuth ? "\n\nI see you're browsing the marketplace. Looking for something specific?" 
                          : "\n\nYou're browsing our secure marketplace. Want help finding verified devices?";
        break;
      case 'device-register':
        greeting += "\n\nReady to register a device? I'll guide you through the process step by step.";
        break;
      case 'device-check':
        greeting += "\n\nNeed to verify a device? I can help you check its authenticity and history.";
        break;
      case 'insurance':
        greeting += "\n\nLooking for device protection? I can connect you with the best coverage options.";
        break;
      case 'repair':
        greeting += "\n\nNeed device repair? I can find certified repair shops near you.";
        break;
    }

    return greeting;
  }

  // Initialize all context
  async initialize(): Promise<void> {
    await Promise.all([
      this.detectAuthenticationStatus(),
      this.detectUserLocation()
    ]);
    this.detectDashboardContext();
  }

  // Watch for location changes (for mobile users)
  startLocationWatch(): void {
    if (navigator.geolocation && !this.locationWatchId) {
      this.locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          if (this.userLocation) {
            this.userLocation.lat = latitude;
            this.userLocation.lng = longitude;
            this.userLocation.accuracy = accuracy;
          }
        },
        (error) => {
          // Silently handle expected geolocation errors (permission denied, insecure context)
          if (error.code === 1) {
            // Permission denied or insecure origin - expected in non-HTTPS contexts
            return;
          }
          // Only log unexpected errors
          console.warn('Location watch error:', error.message);
        },
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 10000 }
      );
    }
  }

  stopLocationWatch(): void {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }
}

export const userContextService = UserContextService.getInstance();
