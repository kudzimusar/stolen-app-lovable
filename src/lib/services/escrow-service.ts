// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { dynamicWalletService } from './dynamic-wallet-service';

export interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  productId?: string;
  productTitle?: string;
  status: 'created' | 'funded' | 'disputed' | 'released' | 'refunded' | 'cancelled';
  milestones: EscrowMilestone[];
  terms: EscrowTerms;
  createdAt: string;
  updatedAt: string;
  releaseConditions: string[];
  metadata?: any;
}

export interface EscrowMilestone {
  id: string;
  title: string;
  description: string;
  requiredEvidence: string[];
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  dueDate?: string;
  completedAt?: string;
  evidence?: EscrowEvidence[];
}

export interface EscrowEvidence {
  id: string;
  type: 'photo' | 'document' | 'video' | 'signature' | 'tracking_number';
  url: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  verified: boolean;
}

export interface EscrowTerms {
  autoReleaseAfterDays: number;
  disputeWindowDays: number;
  inspectionPeriodHours: number;
  allowPartialRelease: boolean;
  requireSignature: boolean;
  requirePhoto: boolean;
  shippingRequired: boolean;
  insuranceRequired: boolean;
  additionalTerms: string[];
}

export interface DisputeDetails {
  id: string;
  escrowId: string;
  raisedBy: string;
  reason: string;
  description: string;
  evidence: EscrowEvidence[];
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

class EscrowService {
  private static instance: EscrowService;
  private escrowCache: Map<string, EscrowTransaction> = new Map();
  private disputeCache: Map<string, DisputeDetails> = new Map();

  static getInstance(): EscrowService {
    if (!EscrowService.instance) {
      EscrowService.instance = new EscrowService();
    }
    return EscrowService.instance;
  }

  // Create a new escrow transaction
  async createEscrow(data: {
    buyerId: string;
    sellerId: string;
    amount: number;
    productId?: string;
    productTitle?: string;
    terms?: Partial<EscrowTerms>;
    releaseConditions?: string[];
  }): Promise<EscrowTransaction> {
    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultTerms: EscrowTerms = {
      autoReleaseAfterDays: 7,
      disputeWindowDays: 14,
      inspectionPeriodHours: 48,
      allowPartialRelease: false,
      requireSignature: true,
      requirePhoto: false,
      shippingRequired: true,
      insuranceRequired: false,
      additionalTerms: []
    };

    const defaultMilestones: EscrowMilestone[] = [
      {
        id: `milestone_${Date.now()}_1`,
        title: 'Funds Secured',
        description: 'Buyer funds have been placed in escrow',
        requiredEvidence: [],
        status: 'pending'
      },
      {
        id: `milestone_${Date.now()}_2`,
        title: 'Item Shipped',
        description: 'Seller confirms item has been shipped',
        requiredEvidence: ['tracking_number'],
        status: 'pending'
      },
      {
        id: `milestone_${Date.now()}_3`,
        title: 'Item Received',
        description: 'Buyer confirms receipt and satisfaction',
        requiredEvidence: ['photo', 'signature'],
        status: 'pending'
      }
    ];

    const escrow: EscrowTransaction = {
      id: escrowId,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      amount: data.amount,
      currency: 'ZAR',
      productId: data.productId,
      productTitle: data.productTitle || 'Product',
      status: 'created',
      milestones: defaultMilestones,
      terms: { ...defaultTerms, ...data.terms },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      releaseConditions: data.releaseConditions || [
        'Item received in good condition',
        'Matches product description',
        'No disputes raised within inspection period'
      ],
      metadata: {
        platform: 'STOLEN',
        version: '1.0',
        fees: {
          platformFee: data.amount * 0.025, // 2.5% platform fee
          escrowFee: data.amount * 0.01 // 1% escrow fee
        }
      }
    };

    this.escrowCache.set(escrowId, escrow);

    // Persist to database
    try {
      await supabase
        .from('escrow_transactions')
        .insert({
          id: escrowId,
          buyer_id: data.buyerId,
          seller_id: data.sellerId,
          amount: data.amount,
          currency: 'ZAR',
          product_id: data.productId,
          product_title: data.productTitle,
          status: 'created',
          terms: escrow.terms,
          milestones: escrow.milestones,
          release_conditions: escrow.releaseConditions,
          metadata: escrow.metadata,
          created_at: escrow.createdAt,
          updated_at: escrow.updatedAt
        });
    } catch (error) {
      console.error('Error persisting escrow transaction:', error);
    }

    return escrow;
  }

  // Fund an escrow (buyer places money in escrow)
  async fundEscrow(escrowId: string, buyerId: string): Promise<EscrowTransaction> {
    const escrow = this.escrowCache.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }

    if (escrow.buyerId !== buyerId) {
      throw new Error('Only the buyer can fund this escrow');
    }

    if (escrow.status !== 'created') {
      throw new Error('Escrow can only be funded in created status');
    }

    // Use dynamic wallet service to move funds to escrow
    await dynamicWalletService.updateBalance(buyerId, {
      amount: escrow.amount,
      type: 'subtract',
      reason: `Escrow funding for ${escrow.productTitle}`,
      category: 'available'
    });

    await dynamicWalletService.updateBalance(buyerId, {
      amount: escrow.amount,
      type: 'add',
      reason: `Funds held in escrow for ${escrow.productTitle}`,
      category: 'escrow'
    });

    // Update escrow status
    escrow.status = 'funded';
    escrow.updatedAt = new Date().toISOString();
    escrow.milestones[0].status = 'approved';
    escrow.milestones[0].completedAt = new Date().toISOString();

    this.escrowCache.set(escrowId, escrow);

    return escrow;
  }

  // Submit milestone evidence
  async submitMilestoneEvidence(
    escrowId: string, 
    milestoneId: string, 
    evidence: Omit<EscrowEvidence, 'id' | 'submittedAt' | 'verified'>
  ): Promise<EscrowTransaction> {
    const escrow = this.escrowCache.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }

    const milestone = escrow.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    const evidenceItem: EscrowEvidence = {
      ...evidence,
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      submittedAt: new Date().toISOString(),
      verified: false
    };

    if (!milestone.evidence) {
      milestone.evidence = [];
    }
    milestone.evidence.push(evidenceItem);

    // Check if all required evidence is submitted
    const hasAllRequiredEvidence = milestone.requiredEvidence.every(
      reqType => milestone.evidence?.some(ev => ev.type === reqType)
    );

    if (hasAllRequiredEvidence) {
      milestone.status = 'submitted';
    }

    escrow.updatedAt = new Date().toISOString();
    this.escrowCache.set(escrowId, escrow);

    return escrow;
  }

  // Release funds to seller
  async releaseFunds(escrowId: string, buyerId: string): Promise<EscrowTransaction> {
    const escrow = this.escrowCache.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }

    if (escrow.buyerId !== buyerId) {
      throw new Error('Only the buyer can release funds');
    }

    if (escrow.status !== 'funded') {
      throw new Error('Escrow must be funded to release');
    }

    // Calculate fees
    const platformFee = escrow.metadata?.fees?.platformFee || 0;
    const escrowFee = escrow.metadata?.fees?.escrowFee || 0;
    const totalFees = platformFee + escrowFee;
    const sellerAmount = escrow.amount - totalFees;

    // Move funds from buyer's escrow to seller's available
    await dynamicWalletService.updateBalance(buyerId, {
      amount: escrow.amount,
      type: 'subtract',
      reason: `Escrow release for ${escrow.productTitle}`,
      category: 'escrow'
    });

    await dynamicWalletService.updateBalance(escrow.sellerId, {
      amount: sellerAmount,
      type: 'add',
      reason: `Sale proceeds from ${escrow.productTitle}`,
      category: 'available'
    });

    // Update escrow status
    escrow.status = 'released';
    escrow.updatedAt = new Date().toISOString();

    // Mark all milestones as completed
    escrow.milestones.forEach(milestone => {
      if (milestone.status !== 'approved') {
        milestone.status = 'approved';
        milestone.completedAt = new Date().toISOString();
      }
    });

    this.escrowCache.set(escrowId, escrow);

    return escrow;
  }

  // Refund to buyer (in case of dispute resolution)
  async refundToBuyer(escrowId: string, reason: string): Promise<EscrowTransaction> {
    const escrow = this.escrowCache.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }

    if (escrow.status !== 'funded' && escrow.status !== 'disputed') {
      throw new Error('Escrow must be funded or disputed to refund');
    }

    // Return funds to buyer
    await dynamicWalletService.updateBalance(escrow.buyerId, {
      amount: escrow.amount,
      type: 'subtract',
      reason: `Escrow refund: ${reason}`,
      category: 'escrow'
    });

    await dynamicWalletService.updateBalance(escrow.buyerId, {
      amount: escrow.amount,
      type: 'add',
      reason: `Refund for ${escrow.productTitle}: ${reason}`,
      category: 'available'
    });

    escrow.status = 'refunded';
    escrow.updatedAt = new Date().toISOString();

    this.escrowCache.set(escrowId, escrow);

    return escrow;
  }

  // Raise a dispute
  async raiseDispute(
    escrowId: string, 
    raisedBy: string, 
    reason: string, 
    description: string
  ): Promise<DisputeDetails> {
    const escrow = this.escrowCache.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }

    if (escrow.buyerId !== raisedBy && escrow.sellerId !== raisedBy) {
      throw new Error('Only buyer or seller can raise dispute');
    }

    const disputeId = `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const dispute: DisputeDetails = {
      id: disputeId,
      escrowId,
      raisedBy,
      reason,
      description,
      evidence: [],
      status: 'open',
      createdAt: new Date().toISOString()
    };

    // Update escrow status
    escrow.status = 'disputed';
    escrow.updatedAt = new Date().toISOString();

    this.escrowCache.set(escrowId, escrow);
    this.disputeCache.set(disputeId, dispute);

    return dispute;
  }

  // Get escrow transaction
  async getEscrow(escrowId: string): Promise<EscrowTransaction | null> {
    return this.escrowCache.get(escrowId) || null;
  }

  // Get user's escrow transactions
  getUserEscrows(userId: string): EscrowTransaction[] {
    return Array.from(this.escrowCache.values()).filter(
      escrow => escrow.buyerId === userId || escrow.sellerId === userId
    );
  }

  // Auto-release funds after timeout
  async autoReleaseFunds(escrowId: string): Promise<EscrowTransaction> {
    const escrow = this.escrowCache.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }

    const daysSinceFunded = Math.floor(
      (Date.now() - new Date(escrow.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceFunded >= escrow.terms.autoReleaseAfterDays && escrow.status === 'funded') {
      return await this.releaseFunds(escrowId, escrow.buyerId);
    }

    throw new Error('Auto-release conditions not met');
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.escrowCache.clear();
    this.disputeCache.clear();
  }
}

export const escrowService = EscrowService.getInstance();
