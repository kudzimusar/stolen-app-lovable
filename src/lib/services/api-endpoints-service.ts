import { supabase } from '@/integrations/supabase/client';
import { dynamicWalletService } from './dynamic-wallet-service';
import { escrowService } from './escrow-service';
import { securitySettingsService } from './security-settings-service';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiEndpointsService {
  private static instance: ApiEndpointsService;

  static getInstance(): ApiEndpointsService {
    if (!ApiEndpointsService.instance) {
      ApiEndpointsService.instance = new ApiEndpointsService();
    }
    return ApiEndpointsService.instance;
  }

  // Wallet Operations
  async walletGetBalance(userId: string): Promise<ApiResponse> {
    try {
      const balance = await dynamicWalletService.getBalance(userId);
      return {
        success: true,
        data: balance
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get wallet balance'
      };
    }
  }

  async walletAddFunds(userId: string, amount: number, methodId: string): Promise<ApiResponse> {
    try {
      const result = await dynamicWalletService.simulateTransaction(userId, 'funding', amount);
      return {
        success: true,
        data: {
          transactionId: result.transaction.id,
          newBalance: result.balance,
          amount: amount
        },
        message: `Successfully added R${amount.toFixed(2)} to wallet`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add funds'
      };
    }
  }

  async walletWithdraw(userId: string, amount: number, paymentMethodId: string): Promise<ApiResponse> {
    try {
      const result = await dynamicWalletService.simulateTransaction(userId, 'withdrawal', amount);
      return {
        success: true,
        data: {
          transactionId: result.transaction.id,
          newBalance: result.balance,
          amount: amount
        },
        message: `Successfully processed withdrawal of R${amount.toFixed(2)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process withdrawal'
      };
    }
  }

  async walletTransfer(userId: string, recipientId: string, amount: number, description?: string): Promise<ApiResponse> {
    try {
      const result = await dynamicWalletService.simulateTransaction(userId, 'purchase', amount);
      
      // Simulate crediting recipient (in real implementation, this would be a separate transaction)
      await dynamicWalletService.simulateTransaction(recipientId, 'sale', amount);
      
      return {
        success: true,
        data: {
          transactionId: result.transaction.id,
          senderBalance: result.balance,
          amount: amount,
          recipient: recipientId
        },
        message: `Successfully transferred R${amount.toFixed(2)} to ${recipientId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process transfer'
      };
    }
  }

  // Escrow Operations
  async escrowCreate(buyerId: string, sellerId: string, amount: number, productId?: string, productTitle?: string): Promise<ApiResponse> {
    try {
      const escrow = await escrowService.createEscrow({
        buyerId,
        sellerId,
        amount,
        productId,
        productTitle
      });
      
      return {
        success: true,
        data: escrow,
        message: 'Escrow transaction created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escrow'
      };
    }
  }

  async escrowFund(escrowId: string, buyerId: string): Promise<ApiResponse> {
    try {
      const escrow = await escrowService.fundEscrow(escrowId, buyerId);
      return {
        success: true,
        data: escrow,
        message: 'Escrow funded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund escrow'
      };
    }
  }

  async escrowRelease(escrowId: string, buyerId: string): Promise<ApiResponse> {
    try {
      const escrow = await escrowService.releaseFunds(escrowId, buyerId);
      return {
        success: true,
        data: escrow,
        message: 'Funds released successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release funds'
      };
    }
  }

  async escrowDispute(escrowId: string, userId: string, reason: string, description: string): Promise<ApiResponse> {
    try {
      const dispute = await escrowService.raiseDispute(escrowId, userId, reason, description);
      return {
        success: true,
        data: dispute,
        message: 'Dispute raised successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to raise dispute'
      };
    }
  }

  // Security Operations
  async securityGetSettings(userId: string): Promise<ApiResponse> {
    try {
      const settings = await securitySettingsService.getSettings(userId);
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get security settings'
      };
    }
  }

  async securityUpdateSetting(userId: string, setting: string, value: boolean | number): Promise<ApiResponse> {
    try {
      const updatedSettings = await securitySettingsService.updateSetting(userId, setting as any, value);
      return {
        success: true,
        data: updatedSettings,
        message: 'Security setting updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update security setting'
      };
    }
  }

  // Payment Methods
  async paymentMethodsList(userId: string): Promise<ApiResponse> {
    try {
      // Mock SA payment methods
      const paymentMethods = [
        {
          id: 'pm_fnb_001',
          type: 'bank_account',
          name: 'FNB Cheque Account',
          details: {
            bank: 'First National Bank',
            accountType: 'Cheque',
            last4: '1234',
            branchCode: '250655'
          },
          isDefault: true,
          isVerified: true
        },
        {
          id: 'pm_absa_001',
          type: 'bank_account',
          name: 'ABSA Savings Account',
          details: {
            bank: 'ABSA Bank',
            accountType: 'Savings',
            last4: '5678',
            branchCode: '632005'
          },
          isDefault: false,
          isVerified: true
        },
        {
          id: 'pm_card_001',
          type: 'credit_card',
          name: 'Standard Bank Visa',
          details: {
            bank: 'Standard Bank',
            cardType: 'Visa',
            last4: '9012',
            expiry: '12/26'
          },
          isDefault: false,
          isVerified: true
        }
      ];

      return {
        success: true,
        data: paymentMethods
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment methods'
      };
    }
  }

  async paymentMethodAdd(userId: string, methodData: any): Promise<ApiResponse> {
    try {
      // Simulate adding a new payment method
      const newMethod = {
        id: `pm_${Date.now()}`,
        type: methodData.type,
        name: methodData.name,
        details: methodData.details,
        isDefault: false,
        isVerified: false
      };

      return {
        success: true,
        data: newMethod,
        message: 'Payment method added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add payment method'
      };
    }
  }

  // FICA Compliance
  async ficaGetStatus(userId: string): Promise<ApiResponse> {
    try {
      // Mock FICA status - in real implementation, fetch from compliance service
      const ficaStatus = {
        status: 'pending',
        documents: {
          idDocument: { status: 'uploaded', verifiedAt: null },
          proofOfAddress: { status: 'pending', verifiedAt: null },
          proofOfIncome: { status: 'not_uploaded', verifiedAt: null }
        },
        limits: {
          daily: 5000,
          monthly: 50000,
          requiresFullVerification: 25000
        },
        completionPercentage: 33
      };

      return {
        success: true,
        data: ficaStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get FICA status'
      };
    }
  }

  async ficaUploadDocument(userId: string, documentType: string, file: File): Promise<ApiResponse> {
    try {
      // Simulate document upload
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload delay
      
      return {
        success: true,
        data: {
          documentType,
          status: 'uploaded',
          uploadedAt: new Date().toISOString()
        },
        message: 'Document uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document'
      };
    }
  }

  // Transaction History
  async transactionHistory(userId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse> {
    try {
      const transactions = dynamicWalletService.getTransactionHistory(userId);
      const paginatedTransactions = transactions.slice(offset, offset + limit);
      
      return {
        success: true,
        data: {
          transactions: paginatedTransactions,
          total: transactions.length,
          hasMore: offset + limit < transactions.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transaction history'
      };
    }
  }

  // Investment Operations
  async investmentsList(): Promise<ApiResponse> {
    try {
      const products = [
        {
          id: 'inv_mmf_001',
          name: 'SA Money Market Fund',
          type: 'money_market',
          expectedReturn: 8.5,
          minInvestment: 1000,
          riskLevel: 'low',
          currency: 'ZAR'
        },
        {
          id: 'inv_equity_001',
          name: 'JSE Top 40 Index Fund',
          type: 'equity_fund',
          expectedReturn: 12.0,
          minInvestment: 500,
          riskLevel: 'medium',
          currency: 'ZAR'
        },
        {
          id: 'inv_bonds_001',
          name: 'SA Government Bonds',
          type: 'bonds',
          expectedReturn: 9.2,
          minInvestment: 2000,
          riskLevel: 'low',
          currency: 'ZAR'
        }
      ];

      return {
        success: true,
        data: products
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get investment products'
      };
    }
  }

  async investmentCreate(userId: string, productId: string, amount: number): Promise<ApiResponse> {
    try {
      const result = await dynamicWalletService.simulateTransaction(userId, 'purchase', amount);
      
      const investment = {
        id: `inv_${Date.now()}`,
        userId,
        productId,
        amount,
        purchaseDate: new Date().toISOString(),
        currentValue: amount,
        performance: 0
      };

      return {
        success: true,
        data: investment,
        message: `Successfully invested R${amount.toFixed(2)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create investment'
      };
    }
  }
}

export const apiEndpointsService = ApiEndpointsService.getInstance();
