import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";
import { useIsMobile } from "@/hooks/use-mobile";

const EscrowPayment = () => {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");

  const handleEscrowPayment = () => {
    // Escrow payment logic
    console.log("Processing escrow payment:", { amount, recipient, description });
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
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    placeholder="Recipient address or ID"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Payment description"
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
                  onClick={handleEscrowPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Process Escrow Payment
                </Button>
                <Button variant="outline" className="flex-1">
                  View Escrow History
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
              <div className="text-center text-gray-500 py-8">
                <p>No active escrow transactions</p>
                <p className="text-sm">Your escrow payments will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EscrowPayment;

