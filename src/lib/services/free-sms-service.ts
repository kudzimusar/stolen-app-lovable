// Free SMS Service using Email-to-SMS Gateways
// Alternative to paid SMS services like Twilio

export interface SMSConfig {
  provider: 'email' | 'webhook' | 'mock';
  emailGateway: string;
  fallbackToEmail: boolean;
  retryAttempts: number;
}

export interface SMSMessage {
  to: string;
  message: string;
  from?: string;
  priority?: 'low' | 'normal' | 'high';
  scheduled?: Date;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  status: 'sent' | 'failed' | 'queued';
  error?: string;
  cost?: number;
}

export class FreeSMSService {
  private config: SMSConfig;
  
  constructor() {
    this.config = {
      provider: 'email',
      emailGateway: 'sms.gateway.com',
      fallbackToEmail: true,
      retryAttempts: 3
    };
  }
  
  // Send SMS using email-to-SMS gateway
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      // Convert phone number to email format
      const emailAddress = this.phoneToEmail(message.to);
      
      // Send email that gets converted to SMS
      const emailResponse = await this.sendEmailSMS(emailAddress, message);
      
      if (emailResponse.success) {
        return {
          success: true,
          messageId: emailResponse.messageId,
          status: 'sent',
          cost: 0 // Free
        };
      } else {
        // Fallback to regular email if SMS fails
        if (this.config.fallbackToEmail) {
          return await this.fallbackToEmail(message);
        }
        
        throw new Error(emailResponse.error || 'SMS sending failed');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Convert phone number to email format for SMS gateway
  private phoneToEmail(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assume South Africa)
    let formattedNumber = cleanNumber;
    if (!cleanNumber.startsWith('27') && cleanNumber.length === 9) {
      formattedNumber = '27' + cleanNumber;
    }
    
    // Convert to email format (this is a mock - real gateways have specific formats)
    return `${formattedNumber}@${this.config.emailGateway}`;
  }
  
  // Send email that gets converted to SMS
  private async sendEmailSMS(emailAddress: string, message: SMSMessage): Promise<SMSResponse> {
    try {
      // In a real implementation, this would send an email to the SMS gateway
      // For now, we'll simulate the process
      
      const emailData = {
        to: emailAddress,
        subject: 'SMS Message',
        text: message.message,
        from: message.from || 'STOLEN Platform',
        headers: {
          'X-SMS-Priority': message.priority || 'normal',
          'X-SMS-Scheduled': message.scheduled?.toISOString() || ''
        }
      };
      
      // Simulate email sending (in production, use your email service)
      const response = await fetch('/api/send-email-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          messageId: result.messageId,
          status: 'sent'
        };
      } else {
        throw new Error('Email SMS gateway failed');
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Email SMS failed'
      };
    }
  }
  
  // Fallback to regular email
  private async fallbackToEmail(message: SMSMessage): Promise<SMSResponse> {
    try {
      // Extract email from phone number (if it's in email format)
      const emailAddress = this.extractEmailFromPhone(message.to);
      
      if (emailAddress) {
        const emailMessage = `
          SMS Message (Phone: ${message.to})
          
          ${message.message}
          
          ---
          This message was sent via SMS but delivered via email due to SMS gateway limitations.
          STOLEN Platform
        `;
        
        // Send via email service
        const emailService = await import('./free-email-service').then(m => m.freeEmailService);
        const success = await emailService.sendEmail({
          from: 'noreply@stolen.com',
          to: emailAddress,
          subject: 'SMS Message from STOLEN Platform',
          html: emailMessage.replace(/\n/g, '<br>')
        });
        
        return {
          success,
          status: success ? 'sent' : 'failed',
          error: success ? undefined : 'Email fallback failed'
        };
      } else {
        throw new Error('No email address found for fallback');
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Fallback failed'
      };
    }
  }
  
  // Extract email from phone number (if it's in email format)
  private extractEmailFromPhone(phoneNumber: string): string | null {
    if (phoneNumber.includes('@')) {
      return phoneNumber;
    }
    
    // Try to find associated email in user database
    // This would typically query your user database
    return null;
  }
  
  // Send verification SMS
  async sendVerificationSMS(phoneNumber: string, code: string, language: string = 'en'): Promise<SMSResponse> {
    const templates = {
      en: `Your STOLEN verification code is: ${code}. Valid for 10 minutes.`,
      af: `Jou STOLEN verifikasiekode is: ${code}. Geldig vir 10 minute.`,
      zu: `Ikhowudi yakho yokuqinisekisa i-STOLEN: ${code}. Isebenza imizuzu eyi-10.`,
      xh: `Ikhowudi yakho yokuqinisekisa i-STOLEN: ${code}. Isebenza imizuzu eyi-10.`
    };
    
    const message = templates[language as keyof typeof templates] || templates.en;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'high'
    });
  }
  
  // Send fraud alert SMS
  async sendFraudAlertSMS(phoneNumber: string, deviceName: string, language: string = 'en'): Promise<SMSResponse> {
    const templates = {
      en: `⚠️ FRAUD ALERT: Suspicious activity detected on your device ${deviceName}. Contact support immediately.`,
      af: `⚠️ BEDROGSWAARSKUWING: Verdagte aktiwiteit op jou toestel ${deviceName} gedekteer. Kontak ondersteuning onmiddellik.`,
      zu: `⚠️ ISEXWAYISO SOKUKHOHLISA: Kutholakele umsebenzi osusayo kudivayisi yakho ${deviceName}. Xhumana nokusekela ngokukhawuleza.`,
      xh: `⚠️ ISEXWAYISO SOKUKHOHLISA: Kutholakele umsebenzi osusayo kudivayisi yakho ${deviceName}. Xhumana nokusekela ngokukhawuleza.`
    };
    
    const message = templates[language as keyof typeof templates] || templates.en;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'high'
    });
  }
  
  // Send device transfer SMS
  async sendDeviceTransferSMS(phoneNumber: string, deviceName: string, language: string = 'en'): Promise<SMSResponse> {
    const templates = {
      en: `Device transfer request for ${deviceName}. Accept or decline in your STOLEN app.`,
      af: `Toestel oordrag versoek vir ${deviceName}. Aanvaar of weier in jou STOLEN app.`,
      zu: `Isicelo sokudlulisa idivayisi ${deviceName}. Yamukela noma wenqabe ku-app yakho ye-STOLEN.`,
      xh: `Isicelo sokudlulisa idivayisi ${deviceName}. Yamukela noma wenqabe ku-app yakho ye-STOLEN.`
    };
    
    const message = templates[language as keyof typeof templates] || templates.en;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal'
    });
  }
  
  // Send payment confirmation SMS
  async sendPaymentConfirmationSMS(phoneNumber: string, amount: number, deviceName: string, txId: string, language: string = 'en'): Promise<SMSResponse> {
    const templates = {
      en: `Payment of R${amount} confirmed for ${deviceName}. Transaction ID: ${txId}`,
      af: `Betaling van R${amount} bevestig vir ${deviceName}. Transaksie ID: ${txId}`,
      zu: `Inkokhelo ye-R${amount} iqinisekisiwe nge-${deviceName}. I-ID yokuthengiselana: ${txId}`,
      xh: `Inkokhelo ye-R${amount} iqinisekisiwe nge-${deviceName}. I-ID yokuthengiselana: ${txId}`
    };
    
    const message = templates[language as keyof typeof templates] || templates.en;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'normal'
    });
  }
  
  // Send recovery alert SMS
  async sendRecoveryAlertSMS(phoneNumber: string, deviceName: string, language: string = 'en'): Promise<SMSResponse> {
    const templates = {
      en: `🎉 GREAT NEWS! Your device ${deviceName} has been found! Contact us immediately.`,
      af: `🎉 GOEIE NUUS! Jou toestel ${deviceName} is gevind! Kontak ons onmiddellik.`,
      zu: `🎉 INEWADI EZINHLE! Idivayisi yakho ${deviceName} itholakele! Sithinteleni ngokukhawuleza.`,
      xh: `🎉 INEWADI EZINHLE! Idivayisi yakho ${deviceName} itholakele! Sithinteleni ngokukhawuleza.`
    };
    
    const message = templates[language as keyof typeof templates] || templates.en;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      priority: 'high'
    });
  }
  
  // Update SMS configuration
  updateConfig(newConfig: Partial<SMSConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  // Test SMS service
  async testService(phoneNumber: string): Promise<boolean> {
    try {
      const result = await this.sendSMS({
        to: phoneNumber,
        message: 'STOLEN Platform SMS test message. If you receive this, SMS service is working.',
        priority: 'low'
      });
      
      return result.success;
    } catch (error) {
      console.error('SMS service test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const freeSMSService = new FreeSMSService();
