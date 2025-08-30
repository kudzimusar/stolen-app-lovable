export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class FreeEmailService {
  private config: EmailConfig;
  
  constructor() {
    this.config = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_APP_PASSWORD || ''
      }
    };
  }
  
  // Send email using Gmail SMTP
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // For client-side, we'll use a simple fetch to a backend endpoint
      // In production, this would be handled by your backend
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
  
  // Send verification email
  async sendVerificationEmail(to: string, verificationCode: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">STOLEN Platform Verification</h2>
        <p>Your verification code is: <strong style="font-size: 24px; color: #007bff;">${verificationCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">STOLEN Platform - Secure Device Management</p>
      </div>
    `;
    
    return this.sendEmail({
      from: this.config.auth.user,
      to,
      subject: 'STOLEN Platform - Email Verification',
      html
    });
  }
  
  // Send password reset email
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">STOLEN Platform - Password Reset</h2>
        <p>You requested a password reset for your STOLEN account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">STOLEN Platform - Secure Device Management</p>
      </div>
    `;
    
    return this.sendEmail({
      from: this.config.auth.user,
      to,
      subject: 'STOLEN Platform - Password Reset',
      html
    });
  }
  
  // Send device transfer notification
  async sendDeviceTransferEmail(to: string, deviceName: string, transferId: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Device Transfer Request</h2>
        <p>You have received a device transfer request for: <strong>${deviceName}</strong></p>
        <p>Transfer ID: <code>${transferId}</code></p>
        <p>Please log in to your STOLEN account to accept or decline this transfer.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">STOLEN Platform - Secure Device Management</p>
      </div>
    `;
    
    return this.sendEmail({
      from: this.config.auth.user,
      to,
      subject: 'STOLEN Platform - Device Transfer Request',
      html
    });
  }
  
  // Send fraud alert email
  async sendFraudAlertEmail(to: string, deviceName: string, alertType: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">⚠️ Fraud Alert</h2>
        <p>We detected suspicious activity related to your device: <strong>${deviceName}</strong></p>
        <p>Alert Type: <strong>${alertType}</strong></p>
        <p>Please review your device activity and contact support if needed.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">STOLEN Platform - Secure Device Management</p>
      </div>
    `;
    
    return this.sendEmail({
      from: this.config.auth.user,
      to,
      subject: 'STOLEN Platform - Fraud Alert',
      html
    });
  }
  
  // Send marketplace notification
  async sendMarketplaceNotification(to: string, listingTitle: string, action: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Marketplace Update</h2>
        <p>Your listing "<strong>${listingTitle}</strong>" has been ${action}.</p>
        <p>Log in to your STOLEN account to view details.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">STOLEN Platform - Secure Device Management</p>
      </div>
    `;
    
    return this.sendEmail({
      from: this.config.auth.user,
      to,
      subject: `STOLEN Platform - Marketplace ${action}`,
      html
    });
  }
  
  // Send welcome email
  async sendWelcomeEmail(to: string, displayName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to STOLEN Platform!</h2>
        <p>Hi ${displayName},</p>
        <p>Welcome to STOLEN - the secure platform for device management and recovery.</p>
        <p>Get started by:</p>
        <ul>
          <li>Registering your devices</li>
          <li>Setting up your profile</li>
          <li>Exploring the marketplace</li>
          <li>Connecting with the community</li>
        </ul>
        <p>If you have any questions, our support team is here to help.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">STOLEN Platform - Secure Device Management</p>
      </div>
    `;
    
    return this.sendEmail({
      from: this.config.auth.user,
      to,
      subject: 'Welcome to STOLEN Platform',
      html
    });
  }
  
  // Update email configuration
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      // Simple test by sending a test email to the configured user
      const testResult = await this.sendEmail({
        from: this.config.auth.user,
        to: this.config.auth.user,
        subject: 'STOLEN Platform - Email Test',
        html: '<p>This is a test email to verify your email configuration.</p>'
      });
      
      return testResult;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const freeEmailService = new FreeEmailService();
