import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCw,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpDown,
  MoreVertical,
  Banknote,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const PaymentTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGateway, setFilterGateway] = useState("all");
  const [filterCurrency, setFilterCurrency] = useState("all");
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

  // Mock transaction data - would come from API
  const transactions = [
    {
      id: "txn_001",
      type: "marketplace_sale",
      description: "iPhone 15 Pro - Marketplace Sale",
      amount: 1299.00,
      currency: "USD",
      fee: 37.47,
      netAmount: 1261.53,
      status: "completed",
      gateway: "PayPal",
      timestamp: "2024-01-20 14:30:25",
      customer: "john.doe@email.com",
      riskScore: 15,
      country: "US",
      paymentMethod: "credit_card",
      deviceInfo: "iPhone 15 Pro (Serial: ABC123)",
      refundable: true
    },
    {
      id: "txn_002", 
      type: "escrow_deposit",
      description: "Escrow Deposit - Device Purchase",
      amount: 850.00,
      currency: "USD",
      fee: 25.50,
      netAmount: 824.50,
      status: "pending",
      gateway: "Stripe",
      timestamp: "2024-01-20 14:25:10",
      customer: "jane.smith@email.com",
      riskScore: 8,
      country: "CA",
      paymentMethod: "debit_card",
      deviceInfo: "Samsung Galaxy S24 (Serial: DEF456)",
      refundable: true
    },
    {
      id: "txn_003",
      type: "registration_fee",
      description: "Device Registration Fee",
      amount: 25.00,
      currency: "EUR",
      fee: 0.75,
      netAmount: 24.25,
      status: "completed",
      gateway: "Stripe",
      timestamp: "2024-01-20 14:20:45",
      customer: "pierre.martin@email.fr",
      riskScore: 5,
      country: "FR",
      paymentMethod: "bank_transfer",
      deviceInfo: "MacBook Pro (Serial: GHI789)",
      refundable: false
    },
    {
      id: "txn_004",
      type: "marketplace_sale",
      description: "AirPods Pro - Marketplace Sale",
      amount: 2500.00,
      currency: "USD",
      fee: 72.50,
      netAmount: 2427.50,
      status: "flagged",
      gateway: "PayPal",
      timestamp: "2024-01-20 14:15:30",
      customer: "suspicious@tempmail.com",
      riskScore: 85,
      country: "XX",
      paymentMethod: "credit_card",
      deviceInfo: "AirPods Pro (Serial: JKL012)",
      refundable: true
    },
    {
      id: "txn_005",
      type: "insurance_premium",
      description: "Device Insurance Premium",
      amount: 89.99,
      currency: "GBP",
      fee: 2.70,
      netAmount: 87.29,
      status: "completed",
      gateway: "Apple Pay",
      timestamp: "2024-01-20 14:10:15",
      customer: "british.user@email.co.uk",
      riskScore: 12,
      country: "GB",
      paymentMethod: "digital_wallet",
      deviceInfo: "iPad Air (Serial: MNO345)",
      refundable: false
    },
    {
      id: "txn_006",
      type: "escrow_release",
      description: "Escrow Release - Transaction Complete",
      amount: 750.00,
      currency: "USD",
      fee: 0.00,
      netAmount: 750.00,
      status: "processing",
      gateway: "Stripe",
      timestamp: "2024-01-20 14:05:00",
      customer: "seller@email.com",
      riskScore: 3,
      country: "US",
      paymentMethod: "bank_account",
      deviceInfo: "Nintendo Switch (Serial: PQR678)",
      refundable: false
    }
  ];

  const stats = {
    totalTransactions: 12456,
    totalVolume: 2847350,
    averageTicket: 228.65,
    successRate: 99.2,
    pendingTransactions: 234,
    flaggedTransactions: 12
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "pending": return "text-warning";
      case "processing": return "text-primary";
      case "flagged": return "text-destructive";
      case "failed": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "processing": return "bg-primary text-primary-foreground";
      case "flagged": return "bg-destructive text-destructive-foreground";
      case "failed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score < 20) return "bg-success text-success-foreground";
    if (score < 50) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getRiskLevel = (score: number) => {
    if (score < 20) return "Low";
    if (score < 50) return "Medium";
    return "High";
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    const matchesGateway = filterGateway === "all" || transaction.gateway === filterGateway;
    const matchesCurrency = filterCurrency === "all" || transaction.currency === filterCurrency;
    
    return matchesSearch && matchesStatus && matchesGateway && matchesCurrency;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            Transaction Management
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Monitor and manage all payment transactions across gateways
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalTransactions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-success">${(stats.totalVolume / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">Total Volume</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">${stats.averageTicket.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Avg. Ticket</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-success">{stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-warning">{stats.pendingTransactions}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-destructive">{stats.flaggedTransactions}</p>
                <p className="text-sm text-muted-foreground">Flagged</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterGateway} onValueChange={setFilterGateway}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gateways</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Stripe">Stripe</SelectItem>
                      <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                      <SelectItem value="Google Pay">Google Pay</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full lg:w-auto">
                <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Transactions ({filteredTransactions.length})
            </CardTitle>
            <CardDescription>
              Detailed view of all payment transactions with fraud detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('id')}>
                        Transaction ID
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('amount')}>
                        Amount
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => handleSort('timestamp')}>
                        Date
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{transaction.id}</p>
                          <p className="text-xs text-muted-foreground">{transaction.type.replace('_', ' ')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.customer}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</p>
                          <p className="text-xs text-muted-foreground">
                            Fee: {formatCurrency(transaction.fee, transaction.currency)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{transaction.gateway}</Badge>
                          <span className="text-xs">{transaction.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskBadgeColor(transaction.riskScore)}>
                          {getRiskLevel(transaction.riskScore)} ({transaction.riskScore})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.timestamp}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentTransactions;