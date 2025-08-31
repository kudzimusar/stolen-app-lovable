import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { escrowService, EscrowTransaction } from "@/lib/services/escrow-service";
import { Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const EscrowPayment = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [activeEscrows, setActiveEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId] = useState('user_123'); // This should come from auth context

  useEffect(() => {
    loadActiveEscrows();
  }, [userId]);

  const loadActiveEscrows = () => {
    const escrows = escrowService.getUserEscrows(userId);
    setActiveEscrows(escrows);
  };

  const handleCreateEscrow = async () => {
    if (!amount || !recipient || !productTitle) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const escrow = await escrowService.createEscrow({
        buyerId: userId,
        sellerId: recipient,
        amount: parseFloat(amount),
        productTitle,
        releaseConditions: description ? [description] : undefined
      });

      toast({
        title: "Escrow Created",
        description: `Escrow created for ${productTitle}. Please fund it to proceed.`,
      });

      // Fund the escrow immediately
      await escrowService.fundEscrow(escrow.id, userId);

      toast({
        title: "Escrow Funded",
        description: `R${amount} has been placed in escrow for ${productTitle}.`,
      });

      loadActiveEscrows();
      
      // Reset form
      setAmount("");
      setRecipient("");
      setDescription("");
      setProductTitle("");
      
    } catch (error) {
      console.error('Error creating escrow:', error);
      toast({
        title: "Escrow Failed",
        description: error instanceof Error ? error.message : "Unable to create escrow.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      await escrowService.releaseFunds(escrowId, userId);
      
      toast({
        title: "Funds Released",
        description: "Funds have been released to the seller.",
      });
      
      loadActiveEscrows();
    } catch (error) {
      console.error('Error releasing escrow:', error);
      toast({
        title: "Release Failed",
        description: error instanceof Error ? error.message : "Unable to release funds.",
        variant: "destructive"
      });
    }
  };

  const handleRaiseDispute = async (escrowId: string) => {
    try {
      await escrowService.raiseDispute(
        escrowId,
        userId,
        "Product not as described",
        "The item received does not match the description provided by the seller."
      );
      
      toast({
        title: "Dispute Raised",
        description: "Your dispute has been submitted and will be reviewed.",
      });
      
      loadActiveEscrows();
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast({
        title: "Dispute Failed",
        description: error instanceof Error ? error.message : "Unable to raise dispute.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'funded':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'released':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded':
        return 'bg-yellow-100 text-yellow-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                🔒 Escrow Payment System
              </CardTitle>
              <p className="text-center text-gray-600">
                Secure payment processing with escrow protection
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="productTitle">Product/Service *</Label>
                  <Input
                    id="productTitle"
                    placeholder="e.g., iPhone 14 Pro - 256GB"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Payment Amount (ZAR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipient">Seller ID/Email *</Label>
                  <Input
                    id="recipient"
                    placeholder="seller@example.com or seller_123"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Additional Terms (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Special conditions or requirements"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">🔒 Security Features</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Funds held securely in escrow</li>
                  <li>• Release only upon completion</li>
                  <li>• Dispute resolution system</li>
                  <li>• Multi-signature protection</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleCreateEscrow}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Creating Escrow..." : "Create & Fund Escrow"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={loadActiveEscrows}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Active Escrow Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {activeEscrows.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No active escrow transactions</p>
                  <p className="text-sm">Your escrow payments will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeEscrows.map((escrow) => (
                    <div key={escrow.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{escrow.productTitle}</h4>
                          <p className="text-sm text-gray-600">
                            Amount: R{escrow.amount.toFixed(2)} | 
                            Created: {new Date(escrow.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(escrow.status)}
                          <Badge className={getStatusColor(escrow.status)}>
                            {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Seller: {escrow.sellerId}</p>
                        <p>Milestones: {escrow.milestones.filter(m => m.status === 'approved').length}/{escrow.milestones.length} completed</p>
                      </div>
                      
                      {escrow.status === 'funded' && escrow.buyerId === userId && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleReleaseEscrow(escrow.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Release Funds
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRaiseDispute(escrow.id)}
                            className="text-red-600 border-red-600"
                          >
                            Raise Dispute
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EscrowPayment;

