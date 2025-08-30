import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  DollarSign,
  Calendar,
  MessageSquare
} from "lucide-react";

interface TransactionDetailsModalProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
  onDispute?: (transactionId: string) => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onDispute
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "disputed":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "disputed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <ArrowUpRight className="w-5 h-5" />;
      case "escrow":
        return <Shield className="w-5 h-5" />;
      case "reward":
        return <DollarSign className="w-5 h-5" />;
      case "withdrawal":
        return <ArrowDownLeft className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const handleDispute = async () => {
    if (!onDispute) return;
    
    setIsLoading(true);
    try {
      await onDispute(transaction.id);
    } catch (error) {
      console.error("Error creating dispute:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTransactionIcon(transaction.transaction_type)}
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="text-sm font-mono">{transaction.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.transaction_type)}
                    <span className="capitalize">{transaction.transaction_type}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(transaction.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount and Fees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Amount & Fees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction Amount</span>
                <span className="text-xl font-bold">{formatAmount(transaction.amount)}</span>
              </div>
              {transaction.fee_amount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="text-red-600">-{formatAmount(transaction.fee_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Net Amount</span>
                <span className="text-lg font-bold">
                  {formatAmount(transaction.net_amount || transaction.amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transaction.from_wallet && (
                <div>
                  <label className="text-sm font-medium text-gray-500">From</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.from_wallet.users?.display_name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.from_wallet.users?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {transaction.to_wallet && (
                <div>
                  <label className="text-sm font-medium text-gray-500">To</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.to_wallet.users?.display_name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.to_wallet.users?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {transaction.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{transaction.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Escrow Information */}
          {transaction.transaction_type === "escrow" && transaction.escrow && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Escrow Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Escrow ID</span>
                  <span className="font-mono text-sm">{transaction.escrow.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Release Date</span>
                  <span>{formatDate(transaction.escrow.release_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Escrow Status</span>
                  <Badge className={getStatusColor(transaction.escrow.status)}>
                    {transaction.escrow.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dispute Information */}
          {transaction.dispute && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Dispute Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dispute ID</span>
                  <span className="font-mono text-sm">{transaction.dispute.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dispute Type</span>
                  <span className="capitalize">{transaction.dispute.dispute_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusColor(transaction.dispute.status)}>
                    {transaction.dispute.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-sm text-gray-700 mt-1">{transaction.dispute.reason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {transaction.status === "completed" && 
             !transaction.dispute && 
             onDispute && (
              <Button 
                variant="destructive" 
                onClick={handleDispute}
                disabled={isLoading}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isLoading ? "Creating Dispute..." : "Create Dispute"}
              </Button>
            )}
            
            {transaction.transaction_type === "escrow" && 
             transaction.escrow?.status === "pending" && (
              <Button variant="default">
                <Shield className="w-4 h-4 mr-2" />
                Release Escrow
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
