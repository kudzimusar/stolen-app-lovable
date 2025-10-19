// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  transactionLimit: number;
  requirePasswordForSend: boolean;
  deviceLockEnabled: boolean;
  sessionTimeout: number;
  lastUpdated: string;
}

export interface SecurityUpdate {
  setting: keyof Omit<SecuritySettings, 'userId' | 'lastUpdated'>;
  value: boolean | number;
}

class SecuritySettingsService {
  private static instance: SecuritySettingsService;
  private settingsCache: Map<string, SecuritySettings> = new Map();

  static getInstance(): SecuritySettingsService {
    if (!SecuritySettingsService.instance) {
      SecuritySettingsService.instance = new SecuritySettingsService();
    }
    return SecuritySettingsService.instance;
  }

  // Initialize security settings with default values
  async initializeSettings(userId: string): Promise<SecuritySettings> {
    try {
      // Try to get existing settings from database
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        const settings: SecuritySettings = {
          userId: data.user_id,
          twoFactorEnabled: data.two_factor_enabled || false,
          biometricEnabled: data.biometric_enabled || false,
          smsNotifications: data.sms_notifications || true,
          emailNotifications: data.email_notifications || true,
          transactionLimit: data.transaction_limit || 10000,
          requirePasswordForSend: data.require_password_for_send || true,
          deviceLockEnabled: data.device_lock_enabled || false,
          sessionTimeout: data.session_timeout || 30,
          lastUpdated: data.last_updated || new Date().toISOString()
        };
        this.settingsCache.set(userId, settings);
        return settings;
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    }

    // Default security settings for new users
    const defaultSettings: SecuritySettings = {
      userId,
      twoFactorEnabled: false,
      biometricEnabled: false,
      smsNotifications: true,
      emailNotifications: true,
      transactionLimit: 5000, // R5000 default limit
      requirePasswordForSend: true,
      deviceLockEnabled: false,
      sessionTimeout: 30, // 30 minutes
      lastUpdated: new Date().toISOString()
    };

    this.settingsCache.set(userId, defaultSettings);
    return defaultSettings;
  }

  // Update a specific security setting
  async updateSetting(userId: string, setting: keyof Omit<SecuritySettings, 'userId' | 'lastUpdated'>, value: boolean | number): Promise<SecuritySettings> {
    const currentSettings = this.settingsCache.get(userId) || await this.initializeSettings(userId);
    
    // Validate the update
    if (!this.validateSettingUpdate(setting, value)) {
      throw new Error(`Invalid value for setting ${setting}: ${value}`);
    }
    
    const updatedSettings: SecuritySettings = {
      ...currentSettings,
      [setting]: value,
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache
    this.settingsCache.set(userId, updatedSettings);
    
    // Persist to database
    try {
      await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          two_factor_enabled: updatedSettings.twoFactorEnabled,
          biometric_enabled: updatedSettings.biometricEnabled,
          sms_notifications: updatedSettings.smsNotifications,
          email_notifications: updatedSettings.emailNotifications,
          transaction_limit: updatedSettings.transactionLimit,
          require_password_for_send: updatedSettings.requirePasswordForSend,
          device_lock_enabled: updatedSettings.deviceLockEnabled,
          session_timeout: updatedSettings.sessionTimeout,
          last_updated: updatedSettings.lastUpdated
        });
    } catch (error) {
      console.error('Error persisting security settings:', error);
    }
    
    return updatedSettings;
  }

  // Validate setting updates
  private validateSettingUpdate(setting: string, value: boolean | number): boolean {
    switch (setting) {
      case 'transactionLimit':
        return typeof value === 'number' && value >= 100 && value <= 100000; // R100 - R100,000
      case 'sessionTimeout':
        return typeof value === 'number' && value >= 5 && value <= 120; // 5 minutes - 2 hours
      case 'twoFactorEnabled':
      case 'biometricEnabled':
      case 'smsNotifications':
      case 'emailNotifications':
      case 'requirePasswordForSend':
      case 'deviceLockEnabled':
        return typeof value === 'boolean';
      default:
        return false;
    }
  }

  // Get current settings
  async getSettings(userId: string): Promise<SecuritySettings> {
    const cached = this.settingsCache.get(userId);
    if (cached) {
      return cached;
    }
    return await this.initializeSettings(userId);
  }

  // Enable two-factor authentication
  async enableTwoFactor(userId: string): Promise<{ qrCode: string; backupCodes: string[] }> {
    // In a real implementation, this would generate a TOTP secret
    const mockQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    const mockBackupCodes = [
      '12345-67890',
      '23456-78901',
      '34567-89012',
      '45678-90123',
      '56789-01234'
    ];

    await this.updateSetting(userId, 'twoFactorEnabled', true);
    
    return {
      qrCode: mockQrCode,
      backupCodes: mockBackupCodes
    };
  }

  // Disable two-factor authentication
  async disableTwoFactor(userId: string): Promise<void> {
    await this.updateSetting(userId, 'twoFactorEnabled', false);
  }

  // Check if biometric authentication is available
  async checkBiometricAvailability(): Promise<boolean> {
    // Check if the device supports biometric authentication
    if ('navigator' in window && 'credentials' in navigator) {
      try {
        const available = await (navigator.credentials as any).create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "STOLEN S-Pay" },
            user: {
              id: new Uint8Array(16),
              name: "test",
              displayName: "Test User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 5000
          }
        });
        return !!available;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  // Enable biometric authentication
  async enableBiometric(userId: string): Promise<boolean> {
    const isAvailable = await this.checkBiometricAvailability();
    if (!isAvailable) {
      throw new Error('Biometric authentication is not available on this device');
    }

    await this.updateSetting(userId, 'biometricEnabled', true);
    return true;
  }

  // Disable biometric authentication
  async disableBiometric(userId: string): Promise<void> {
    await this.updateSetting(userId, 'biometricEnabled', false);
  }

  // Get security score based on enabled features
  getSecurityScore(settings: SecuritySettings): { score: number; recommendations: string[] } {
    let score = 0;
    const recommendations: string[] = [];

    // Two-factor authentication (30 points)
    if (settings.twoFactorEnabled) {
      score += 30;
    } else {
      recommendations.push('Enable two-factor authentication for enhanced security');
    }

    // Biometric authentication (20 points)
    if (settings.biometricEnabled) {
      score += 20;
    } else {
      recommendations.push('Enable biometric authentication if available on your device');
    }

    // Reasonable transaction limit (15 points)
    if (settings.transactionLimit <= 10000) {
      score += 15;
    } else {
      recommendations.push('Consider lowering your transaction limit for better security');
    }

    // Password required for sends (15 points)
    if (settings.requirePasswordForSend) {
      score += 15;
    } else {
      recommendations.push('Require password confirmation for sending money');
    }

    // Notifications enabled (10 points each)
    if (settings.smsNotifications) score += 10;
    else recommendations.push('Enable SMS notifications for transaction alerts');
    
    if (settings.emailNotifications) score += 10;
    else recommendations.push('Enable email notifications for account activity');

    return { score, recommendations };
  }

  // Clear cache (useful for testing)
  clearCache(userId?: string): void {
    if (userId) {
      this.settingsCache.delete(userId);
    } else {
      this.settingsCache.clear();
    }
  }
}

export const securitySettingsService = SecuritySettingsService.getInstance();
