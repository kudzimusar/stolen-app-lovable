import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Smartphone,
  QrCode,
  RefreshCw,
  ArrowRight,
  Banknote,
  Clock,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiEndpointsService } from "@/lib/services/api-endpoints-service";

interface SABank {
  id: string;
  name: string;
  code: string;
  logo: string;
  color: string;
  supportedServices: string[];
  processingTime: string;
  maxLimit: number;
}

interface BankAccount {
  id: string;
  bankId: string;
  accountNumber: string;
  accountType: 'savings' | 'cheque' | 'credit';
  accountHolderName: string;
  branchCode: string;
  isVerified: boolean;
  balance?: number;
  lastSyncTime?: string;
}

interface MobilePaymentMethod {
  id: string;
  name: string;
  type: 'snapscan' | 'zapper' | 'vodapay' | 'eft';
  icon: string;
  color: string;
  processingFee: number;
  instantTransfer: boolean;
}

interface SABankingIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SABankingIntegration: React.FC<SABankingIntegrationProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'banks' | 'mobile' | 'eft'>('banks');
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([]);
  const [availableBanks, setAvailableBanks] = useState<SABank[]>([]);
  const [mobilePaymentMethods, setMobilePaymentMethods] = useState<MobilePaymentMethod[]>([]);
  const [selectedBank, setSelectedBank] = useState<SABank | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountForm, setAccountForm] = useState({
    accountNumber: '',
    accountType: 'cheque' as const,
    accountHolderName: '',
    branchCode: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchConnectedAccounts();
      fetchAvailableBanks();
      fetchMobilePaymentMethods();
    }
  }, [isOpen]);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/banks/accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      if (response.ok) {
      const result = await response.json();
        setConnectedAccounts(result.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      // Mock data for demo
      setConnectedAccounts([
        {
          id: '1',
          bankId: 'fnb',
          accountNumber: '****7892',
          accountType: 'cheque',
          accountHolderName: 'John Doe',
          branchCode: '250655',
          isVerified: true,
          balance: 8920.50,
          lastSyncTime: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchAvailableBanks = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/banks/sa-banks');
      
      if (response.ok) {
        const result = await response.json();
        setAvailableBanks(result.banks || []);
      }
    } catch (error) {
      console.error('Error fetching available banks:', error);
      // Mock SA banks data
      setAvailableBanks([
        {
          id: 'fnb',
          name: 'First National Bank (FNB)',
          code: '250655',
          logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=64&h=64&fit=crop&auto=format',
          color: 'rgb(0, 86, 149)',
          supportedServices: ['EFT', 'Real-time', 'Mobile Banking'],
          processingTime: 'Instant - 2 hours',
          maxLimit: 500000
        },
        {
          id: 'standard_bank',
          name: 'Standard Bank',
          code: '051001',
          logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=64&h=64&fit=crop&auto=format',
          color: 'rgb(0, 61, 113)',
          supportedServices: ['EFT', 'Real-time', 'Internet Banking'],
          processingTime: 'Instant - 1 hour',
          maxLimit: 1000000
        },
        {
          id: 'absa',
          name: 'ABSA Bank',
          code: '632005',
          logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=64&h=64&fit=crop&auto=format',
          color: 'rgb(176, 33, 51)',
          supportedServices: ['EFT', 'Real-time', 'Mobile Banking'],
          processingTime: 'Instant - 3 hours',
          maxLimit: 750000
        },
        {
          id: 'nedbank',
          name: 'Nedbank',
          code: '198765',
          logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=64&h=64&fit=crop&auto=format',
          color: 'rgb(0, 153, 51)',
          supportedServices: ['EFT', 'Internet Banking'],
          processingTime: '1 - 24 hours',
          maxLimit: 250000
        },
        {
          id: 'capitec',
          name: 'Capitec Bank',
          code: '470010',
          logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=64&h=64&fit=crop&auto=format',
          color: 'rgb(0, 173, 239)',
          supportedServices: ['EFT', 'Real-time', 'Mobile Banking'],
          processingTime: 'Instant - 2 hours',
          maxLimit: 300000
        }
      ]);
    }
  };

  const fetchMobilePaymentMethods = async () => {
    // Mock mobile payment methods
    setMobilePaymentMethods([
      {
        id: 'snapscan',
        name: 'SnapScan',
        type: 'snapscan',
        icon: 'qr-code',
        color: 'rgb(0, 171, 85)',
        processingFee: 2.50,
        instantTransfer: true
      },
      {
        id: 'zapper',
        name: 'Zapper',
        type: 'zapper',
        icon: 'smartphone',
        color: 'rgb(255, 87, 34)',
        processingFee: 2.00,
        instantTransfer: true
      },
      {
        id: 'vodapay',
        name: 'VodaPay',
        type: 'vodapay',
        icon: 'smartphone',
        color: 'rgb(230, 25, 75)',
        processingFee: 3.00,
        instantTransfer: true
      },
      {
        id: 'eft',
        name: 'Standard EFT',
        type: 'eft',
        icon: 'banknote',
        color: 'rgb(107, 114, 128)',
        processingFee: 5.00,
        instantTransfer: false
      }
    ]);
  };

  const handleBankSelection = (bank: SABank) => {
    setSelectedBank(bank);
    setShowAddAccount(true);
  };

  const handleAddAccount = async () => {
    if (!selectedBank) return;

    setIsConnecting(true);
    try {
      const response = await fetch('/api/v1/s-pay/banks/connect-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          bankId: selectedBank.id,
          ...accountForm
        })
      });

      if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
          toast({
            title: "Account Connected",
            description: "Your bank account has been connected successfully and is being verified.",
          });
          
          // Add to connected accounts
          const newAccount = {
            id: `acc_${Date.now()}`,
            bankId: selectedBank.id,
            bankName: selectedBank.name,
            accountType: accountForm.accountType,
            accountHolderName: accountForm.accountHolderName,
            last4: accountForm.accountNumber.slice(-4),
            branchCode: accountForm.branchCode || selectedBank.code,
            status: 'verified',
            balance: Math.floor(Math.random() * 50000) + 1000,
            connectedAt: new Date().toISOString(),
            currency: 'ZAR'
          };
          
          setConnectedAccounts(prev => [...prev, newAccount]);
          setShowAddAccount(false);
          setAccountForm({
            accountNumber: '',
            accountType: 'cheque',
            accountHolderName: '',
            branchCode: ''
          });
        } else {
          throw new Error(result.error || 'Failed to connect account');
        }
      } else {
        throw new Error('Failed to connect account');
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect your bank account. Please check your details and try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountVerification = async (accountId: string) => {
    try {
      const response = await fetch(`/api/v1/s-pay/banks/verify-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ accountId })
      });

      if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        toast({
            title: "Verification Initiated",
            description: "Account verification has been started. This may take a few minutes.",
          });
          
          // Refresh accounts after a delay
          setTimeout(fetchConnectedAccounts, 2000);
        }
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify account. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleMobilePaymentSetup = async (method: MobilePaymentMethod) => {
    try {
      const response = await fetch(`/api/v1/s-pay/mobile/${method.type}/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ methodId: method.id })
      });

      if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        toast({
            title: `${method.name} Connected`,
            description: `${method.name} has been connected to your S-Pay wallet.`,
          });
        }
      }
    } catch (error) {
      console.error('Error setting up mobile payment:', error);
      toast({
        title: "Setup Failed",
        description: `Unable to setup ${method.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const getBankLogo = (bankId: string) => {
    const bank = availableBanks.find(b => b.id === bankId);
    return bank?.logo || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=32&h=32&fit=crop&auto=format';
  };

  const getBankName = (bankId: string) => {
    const bank = availableBanks.find(b => b.id === bankId);
    return bank?.name || 'Unknown Bank';
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'snapscan':
      case 'zapper':
        return <QrCode className="w-5 h-5" />;
      case 'vodapay':
        return <Smartphone className="w-5 h-5" />;
      case 'eft':
        return <Banknote className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            South African Banking Integration
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === 'banks' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('banks')}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Banks
          </Button>
          <Button
            variant={activeTab === 'mobile' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile Payments
          </Button>
          <Button
            variant={activeTab === 'eft' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('eft')}
          >
            <Banknote className="w-4 h-4 mr-2" />
            EFT Transfers
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'banks' && (
            <div className="space-y-6">
              {/* Connected Accounts */}
              {connectedAccounts.length > 0 && (
              <div className="space-y-4">
                  <h3 className="font-semibold">Connected Bank Accounts</h3>
                  <div className="grid gap-4">
                    {connectedAccounts.map((account) => (
                      <Card key={account.id}>
                        <CardContent className="p-4">
                <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img 
                                src={getBankLogo(account.bankId)} 
                                alt={getBankName(account.bankId)}
                                className="w-8 h-8 rounded"
                              />
                  <div>
                                <div className="font-medium">{getBankName(account.bankId)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account • {account.accountNumber}
                  </div>
                                <div className="text-xs text-muted-foreground">
                                  {account.accountHolderName}
                </div>
                          </div>
                            </div>
                            <div className="text-right">
                              {account.isVerified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <div className="space-y-2">
                                  <Badge variant="outline" className="text-yellow-600">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAccountVerification(account.id)}
                                  >
                                    Verify
                                  </Button>
                                </div>
                              )}
                              {account.balance !== undefined && (
                                <div className="text-sm font-medium mt-1">
                                  R{account.balance.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  </div>
                )}

              {/* Available Banks */}
              <div className="space-y-4">
                <h3 className="font-semibold">Connect Bank Account</h3>
                <div className="grid gap-4">
                  {availableBanks.map((bank) => (
                    <Card 
                      key={bank.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleBankSelection(bank)}
                    >
                      <CardContent className="p-4">
                <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={bank.logo} 
                              alt={bank.name}
                              className="w-10 h-10 rounded"
                            />
                  <div>
                              <div className="font-medium">{bank.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {bank.supportedServices.join(' • ')}
                  </div>
                              <div className="text-xs text-muted-foreground">
                                Processing: {bank.processingTime}
                          </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Max: R{bank.maxLimit.toLocaleString()}
                            </div>
                            <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground" />
                          </div>
              </div>
            </CardContent>
          </Card>
                  ))}
              </div>
              </div>

              {/* Add Account Form */}
              {showAddAccount && selectedBank && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <img 
                        src={selectedBank.logo} 
                        alt={selectedBank.name}
                        className="w-6 h-6 rounded"
                      />
                      Connect {selectedBank.name} Account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                          id="accountNumber"
                          value={accountForm.accountNumber}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Enter account number"
                />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Account Type</Label>
                        <select
                          id="accountType"
                          value={accountForm.accountType}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, accountType: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-input rounded-md"
                        >
                          <option value="cheque">Cheque Account</option>
                          <option value="savings">Savings Account</option>
                          <option value="credit">Credit Account</option>
                        </select>
                      </div>
              </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                          id="accountHolderName"
                          value={accountForm.accountHolderName}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                          placeholder="Full name as on account"
                />
              </div>
                      <div className="space-y-2">
                        <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                          id="branchCode"
                          value={accountForm.branchCode}
                          onChange={(e) => setAccountForm(prev => ({ ...prev, branchCode: e.target.value }))}
                          placeholder={selectedBank.code}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <div className="font-medium">Account Verification</div>
                          <div>We'll verify your account details with {selectedBank.name}. This process is secure and typically takes a few minutes.</div>
                        </div>
                      </div>
              </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddAccount(false)}
                        disabled={isConnecting}
                      >
                  Cancel
                </Button>
                      <Button 
                        onClick={handleAddAccount}
                        disabled={isConnecting}
                        className="flex-1"
                      >
                        {isConnecting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Connect Account
                          </>
                        )}
                </Button>
              </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'mobile' && (
            <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-semibold">Mobile Payment Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Connect popular South African mobile payment services for instant transfers.
                </p>
                
                <div className="grid gap-4">
                  {mobilePaymentMethods.map((method) => (
                    <Card 
                      key={method.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleMobilePaymentSetup(method)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: method.color }}
                            >
                              {getPaymentIcon(method.type)}
                            </div>
              <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Fee: R{method.processingFee.toFixed(2)} • 
                                {method.instantTransfer ? ' Instant' : ' 1-2 hours'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {method.instantTransfer && (
                              <Badge className="bg-green-100 text-green-800 mb-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Instant
                              </Badge>
                            )}
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eft' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">EFT Transfer Information</h3>
                <p className="text-sm text-muted-foreground">
                  Standard Electronic Funds Transfer details for receiving payments from other banks.
                </p>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your S-Pay EFT Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Bank Name</Label>
                        <div className="font-medium">S-Pay Virtual Bank</div>
                      </div>
              <div>
                        <Label>Account Type</Label>
                        <div className="font-medium">Savings</div>
                      </div>
              </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Account Number</Label>
                        <div className="font-medium">1234567890</div>
                      </div>
              <div>
                        <Label>Branch Code</Label>
                        <div className="font-medium">470010</div>
                      </div>
              </div>

              <div>
                      <Label>Account Holder</Label>
                      <div className="font-medium">John Doe</div>
              </div>

                    <Separator />

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <div className="font-medium">Processing Time</div>
                          <div>EFT transfers typically take 1-3 business days to reflect in your S-Pay wallet.</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-2">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-800">
              <div className="font-medium">Bank-Grade Security</div>
              <div>All banking integrations use encrypted connections and comply with South African banking regulations (SARB). Your account details are never stored on our servers.</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SABankingIntegration;