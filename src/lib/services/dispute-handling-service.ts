import { supabase } from '@/integrations/supabase/client';
import { escrowService } from './escrow-service';
import { dynamicWalletService } from './dynamic-wallet-service';

export interface DisputeCase {
  id: string;
  escrowId: string;
  buyerId: string;
  sellerId: string;
  raisedBy: string;
  reason: DisputeReason;
  description: string;
  evidence: DisputeEvidence[];
  status: DisputeStatus;
  priority: DisputePriority;
  resolution: DisputeResolution | null;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  estimatedResolutionTime?: string;
  amount: number;
  currency: string;
}

export type DisputeReason = 
  | 'item_not_received'
  | 'item_not_as_described'
  | 'damaged_item'
  | 'counterfeit_item'
  | 'buyer_unresponsive'
  | 'seller_unresponsive'
  | 'shipping_issues'
  | 'payment_issues'
  | 'fraud_suspicion'
  | 'other';

export type DisputeStatus = 
  | 'open'
  | 'investigating'
  | 'awaiting_response'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type DisputePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DisputeEvidence {
  id: string;
  type: 'photo' | 'document' | 'video' | 'message' | 'tracking' | 'receipt';
  title: string;
  description: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

export interface DisputeResolution {
  type: 'refund_buyer' | 'release_to_seller' | 'partial_refund' | 'mediated_agreement';
  amount?: number;
  reason: string;
  resolvedBy: string;
  resolvedAt: string;
  additionalNotes?: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderType: 'buyer' | 'seller' | 'agent' | 'system';
  message: string;
  timestamp: string;
  isInternal: boolean;
}

class DisputeHandlingService {
  private static instance: DisputeHandlingService;
  private disputeCache: Map<string, DisputeCase> = new Map();
  private messageCache: Map<string, DisputeMessage[]> = new Map();

  static getInstance(): DisputeHandlingService {
    if (!DisputeHandlingService.instance) {
      DisputeHandlingService.instance = new DisputeHandlingService();
    }
    return DisputeHandlingService.instance;
  }

  // Create a new dispute
  async createDispute(
    escrowId: string,
    raisedBy: string,
    reason: DisputeReason,
    description: string,
    evidence?: Omit<DisputeEvidence, 'id' | 'uploadedAt' | 'verified'>[]
  ): Promise<DisputeCase> {
    try {
      // Get escrow details
      const escrow = await escrowService.getEscrow(escrowId);
      if (!escrow) {
        throw new Error('Escrow transaction not found');
      }

      // Validate that the person raising dispute is buyer or seller
      if (raisedBy !== escrow.buyerId && raisedBy !== escrow.sellerId) {
        throw new Error('Only buyer or seller can raise a dispute');
      }

      const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine priority based on amount and reason
      const priority = this.calculatePriority(escrow.amount, reason);
      
      const dispute: DisputeCase = {
        id: disputeId,
        escrowId,
        buyerId: escrow.buyerId,
        sellerId: escrow.sellerId,
        raisedBy,
        reason,
        description,
        evidence: evidence ? evidence.map(ev => ({
          ...ev,
          id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          uploadedAt: new Date().toISOString(),
          verified: false
        })) : [],
        status: 'open',
        priority,
        resolution: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedAgent: this.assignAgent(priority),
        estimatedResolutionTime: this.calculateEstimatedResolution(priority),
        amount: escrow.amount,
        currency: escrow.currency
      };

      // Cache the dispute
      this.disputeCache.set(disputeId, dispute);

      // Create initial system message
      await this.addMessage(disputeId, 'system', 'system', 
        `Dispute created for ${this.getReasonText(reason)}. Case ID: ${disputeId}. Estimated resolution: ${dispute.estimatedResolutionTime}.`,
        false
      );

      // Persist to database
      try {
        await supabase
          .from('disputes')
          .insert({
            id: disputeId,
            escrow_id: escrowId,
            buyer_id: escrow.buyerId,
            seller_id: escrow.sellerId,
            raised_by: raisedBy,
            reason,
            description,
            evidence: dispute.evidence,
            status: 'open',
            priority,
            amount: escrow.amount,
            currency: escrow.currency,
            created_at: dispute.createdAt,
            updated_at: dispute.updatedAt
          });
      } catch (error) {
        console.error('Error persisting dispute:', error);
      }

      return dispute;
    } catch (error) {
      throw new Error(`Failed to create dispute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add evidence to a dispute
  async addEvidence(
    disputeId: string,
    evidence: Omit<DisputeEvidence, 'id' | 'uploadedAt' | 'verified'>
  ): Promise<DisputeCase> {
    const dispute = this.disputeCache.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const newEvidence: DisputeEvidence = {
      ...evidence,
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      uploadedAt: new Date().toISOString(),
      verified: false
    };

    dispute.evidence.push(newEvidence);
    dispute.updatedAt = new Date().toISOString();

    // Add message about new evidence
    await this.addMessage(
      disputeId,
      evidence.uploadedBy,
      evidence.uploadedBy === dispute.buyerId ? 'buyer' : 'seller',
      `New evidence uploaded: ${evidence.title}`,
      false
    );

    this.disputeCache.set(disputeId, dispute);
    return dispute;
  }

  // Add message to dispute
  async addMessage(
    disputeId: string,
    senderId: string,
    senderType: 'buyer' | 'seller' | 'agent' | 'system',
    message: string,
    isInternal: boolean = false
  ): Promise<DisputeMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const disputeMessage: DisputeMessage = {
      id: messageId,
      disputeId,
      senderId,
      senderType,
      message,
      timestamp: new Date().toISOString(),
      isInternal
    };

    const messages = this.messageCache.get(disputeId) || [];
    messages.push(disputeMessage);
    this.messageCache.set(disputeId, messages);

    return disputeMessage;
  }

  // Resolve dispute
  async resolveDispute(
    disputeId: string,
    resolution: Omit<DisputeResolution, 'resolvedAt'>,
    resolverUserId: string
  ): Promise<DisputeCase> {
    const dispute = this.disputeCache.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      throw new Error('Dispute is already resolved');
    }

    try {
      // Execute the resolution
      await this.executeResolution(dispute, resolution);

      // Update dispute
      dispute.resolution = {
        ...resolution,
        resolvedAt: new Date().toISOString()
      };
      dispute.status = 'resolved';
      dispute.updatedAt = new Date().toISOString();

      // Add resolution message
      await this.addMessage(
        disputeId,
        resolverUserId,
        'agent',
        `Dispute resolved: ${resolution.reason}. Resolution type: ${resolution.type}`,
        false
      );

      this.disputeCache.set(disputeId, dispute);
      return dispute;
    } catch (error) {
      throw new Error(`Failed to resolve dispute: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Execute the financial resolution
  private async executeResolution(dispute: DisputeCase, resolution: Omit<DisputeResolution, 'resolvedAt'>): Promise<void> {
    switch (resolution.type) {
      case 'refund_buyer':
        await escrowService.refundToBuyer(dispute.escrowId, 'Dispute resolved in favor of buyer');
        break;
      
      case 'release_to_seller':
        await escrowService.releaseFunds(dispute.escrowId, dispute.buyerId);
        break;
      
      case 'partial_refund':
        if (!resolution.amount) {
          throw new Error('Partial refund amount not specified');
        }
        // Implement partial refund logic
        {
          const refundAmount = resolution.amount;
          const sellerAmount = dispute.amount - refundAmount;
        
        // Refund partial amount to buyer
        await dynamicWalletService.updateBalance(dispute.buyerId, {
          amount: refundAmount,
          type: 'add',
          reason: `Partial refund from dispute resolution`,
          category: 'available'
        });
        
        // Release remaining amount to seller
        await dynamicWalletService.updateBalance(dispute.sellerId, {
          amount: sellerAmount,
          type: 'add',
          reason: `Partial payment from dispute resolution`,
          category: 'available'
        });
        
        // Remove from escrow
        await dynamicWalletService.updateBalance(dispute.buyerId, {
          amount: dispute.amount,
          type: 'subtract',
          reason: `Escrow funds distributed via dispute resolution`,
          category: 'escrow'
        });
        }
        break;
      
      case 'mediated_agreement':
        // Handle based on the specific agreement details
        if (resolution.amount) {
          // Assume it's a partial refund based on agreement
          await this.executeResolution(dispute, { ...resolution, type: 'partial_refund' });
        } else {
          // Default to full refund
          await this.executeResolution(dispute, { ...resolution, type: 'refund_buyer' });
        }
        break;
    }
  }

  // Get dispute by ID
  async getDispute(disputeId: string): Promise<DisputeCase | null> {
    return this.disputeCache.get(disputeId) || null;
  }

  // Get all disputes for a user
  getUserDisputes(userId: string): DisputeCase[] {
    return Array.from(this.disputeCache.values()).filter(
      dispute => dispute.buyerId === userId || dispute.sellerId === userId
    );
  }

  // Get messages for a dispute
  getDisputeMessages(disputeId: string): DisputeMessage[] {
    return this.messageCache.get(disputeId) || [];
  }

  // Helper methods
  private calculatePriority(amount: number, reason: DisputeReason): DisputePriority {
    if (amount > 10000 || reason === 'fraud_suspicion') return 'urgent';
    if (amount > 5000 || ['counterfeit_item', 'payment_issues'].includes(reason)) return 'high';
    if (amount > 1000) return 'medium';
    return 'low';
  }

  private assignAgent(priority: DisputePriority): string {
    const agents = {
      urgent: 'agent_senior_001',
      high: 'agent_senior_002',
      medium: 'agent_regular_001',
      low: 'agent_regular_002'
    };
    return agents[priority];
  }

  private calculateEstimatedResolution(priority: DisputePriority): string {
    const timeframes = {
      urgent: '24 hours',
      high: '2-3 business days',
      medium: '3-5 business days',
      low: '5-7 business days'
    };
    return timeframes[priority];
  }

  private getReasonText(reason: DisputeReason): string {
    const reasonTexts = {
      item_not_received: 'Item not received',
      item_not_as_described: 'Item not as described',
      damaged_item: 'Item received damaged',
      counterfeit_item: 'Counterfeit or fake item',
      buyer_unresponsive: 'Buyer unresponsive',
      seller_unresponsive: 'Seller unresponsive',
      shipping_issues: 'Shipping/delivery issues',
      payment_issues: 'Payment processing issues',
      fraud_suspicion: 'Suspected fraudulent activity',
      other: 'Other issue'
    };
    return reasonTexts[reason];
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.disputeCache.clear();
    this.messageCache.clear();
  }
}

export const disputeHandlingService = DisputeHandlingService.getInstance();
