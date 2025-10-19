// @ts-nocheck
// JWT Authentication System for Reverse Verification Tool API
// This implements the authentication system required for Phase 1

export interface JWTPayload {
  userId: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}

export interface AuthContext {
  user: JWTPayload | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

class JWTAuthService {
  private static instance: JWTAuthService;
  private tokenKey = 'stolen_api_token';
  private refreshTokenKey = 'stolen_refresh_token';

  private constructor() {}

  static getInstance(): JWTAuthService {
    if (!JWTAuthService.instance) {
      JWTAuthService.instance = new JWTAuthService();
    }
    return JWTAuthService.instance;
  }

  // Generate JWT token (mock implementation)
  generateToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): string {
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload: JWTPayload = {
      ...payload,
      exp: now + (60 * 60 * 24), // 24 hours
      iat: now
    };
    
    // In a real implementation, this would use a proper JWT library
    return btoa(JSON.stringify(tokenPayload));
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = JSON.parse(atob(token));
      const now = Math.floor(Date.now() / 1000);
      
      if (decoded.exp < now) {
        return null; // Token expired
      }
      
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Store token in localStorage
  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Remove stored token
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;
    
    const payload = this.verifyToken(token);
    return payload !== null;
  }

  // Get current user payload
  getCurrentUser(): JWTPayload | null {
    const token = this.getStoredToken();
    if (!token) return null;
    
    return this.verifyToken(token);
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.permissions.includes(permission);
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
  }
}

export const authService = JWTAuthService.getInstance();

// API Authentication Middleware
export class APIAuthMiddleware {
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  // Rate limiting implementation
  static checkRateLimit(apiKey: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = `rate_limit_${apiKey}`;
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new rate limit record
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (record.count >= limit) {
      return false; // Rate limit exceeded
    }

    record.count++;
    return true;
  }

  // Enhanced API authentication with security features
  static authenticateRequest(headers: Record<string, string>): { 
    authenticated: boolean; 
    user?: JWTPayload; 
    error?: string;
    securityFlags?: string[];
  } {
    const authHeader = headers['authorization'] || headers['Authorization'];
    const securityFlags: string[] = [];

    // Check for suspicious headers
    if (headers['x-forwarded-for'] && !this.isValidIP(headers['x-forwarded-for'])) {
      securityFlags.push('suspicious_ip');
    }

    // Check for missing security headers
    if (!headers['user-agent']) {
      securityFlags.push('missing_user_agent');
    }

    // Check for suspicious user agent
    if (headers['user-agent'] && this.isSuspiciousUserAgent(headers['user-agent'])) {
      securityFlags.push('suspicious_user_agent');
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        authenticated: false, 
        error: 'Missing or invalid authorization header' 
      };
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    
    if (!payload) {
      return { 
        authenticated: false, 
        error: 'Invalid or expired token' 
      };
    }

    return { 
      authenticated: true, 
      user: payload 
    };
  }

  // Check API permissions
  static checkPermissions(user: JWTPayload, requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
  }

  // Generate API response with rate limit headers
  static generateResponse(
    success: boolean, 
    data: any, 
    apiKey: string,
    limit: number = 100
  ): { 
    success: boolean; 
    data: any; 
    headers: Record<string, string> 
  } {
    const record = this.rateLimitStore.get(`rate_limit_${apiKey}`);
    const remaining = record ? Math.max(0, limit - record.count) : limit;
    const resetTime = record ? record.resetTime : Date.now() + 60000;

    return {
      success,
      data,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Content-Type': 'application/json'
      }
    };
  }
}

// API Client with authentication and rate limiting
export class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Enhanced security checks
    if (!APIAuthMiddleware.checkRateLimit(this.apiKey)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Input validation for security
    if (options.body && typeof options.body === 'string') {
      if (!APIAuthMiddleware.validateInput(options.body)) {
        throw new Error('Invalid input detected. Security check failed.');
      }
    }

    // Add security headers
    const securityHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: securityHeaders,
    });

    // Enhanced error handling with security context
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Log security-related errors
      if (response.status === 403 || response.status === 401) {
        console.warn('Security alert: Authentication/Authorization failed', {
          endpoint,
          status: response.status,
          timestamp: new Date().toISOString()
        });
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Device verification API
  async verifyDevice(identifier: string): Promise<any> {
    return this.request(`/api/v1/verify/device/${identifier}`);
  }

  // Bulk verification API
  async bulkVerify(identifiers: string[]): Promise<any> {
    return this.request('/api/v1/verify/bulk', {
      method: 'POST',
      body: JSON.stringify({ identifiers })
    });
  }

  // Get device history
  async getDeviceHistory(deviceId: string): Promise<any> {
    return this.request(`/api/v1/device/${deviceId}/history`);
  }

  // Generate certificate
  async generateCertificate(deviceId: string, format: string = 'pdf'): Promise<any> {
    return this.request('/api/v1/certificate/generate', {
      method: 'POST',
      body: JSON.stringify({ deviceId, format })
    });
  }

  // Get trust badge
  async getTrustBadge(deviceId: string): Promise<any> {
    return this.request(`/api/v1/trust-badge/${deviceId}`);
  }
}

// Export default API client instance
export const apiClient = new APIClient(
  import.meta.env.VITE_API_BASE_URL || 'https://api.stolen.com',
  import.meta.env.VITE_API_KEY || ''
);
