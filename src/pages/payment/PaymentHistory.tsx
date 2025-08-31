import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, Download, Filter, Search, Calendar, DollarSign, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentHistory = () => {
  const mockTransactions = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Device Registration Fee",
      amount: 25.00,
      status: "completed",
      type: "payment"
    },
    {
      id: "2", 
      date: "2024-01-10",
      description: "Insurance Premium",
      amount: 15.50,
      status: "completed",
      type: "payment"
    },
    {
      id: "3",
      date: "2024-01-05", 
      description: "Marketplace Listing Fee",
      amount: 5.00,
      status: "pending",
      type: "payment"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/wallet">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Wallet
                </Button>
              </Link>
              <STOLENLogo />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment History</h1>
            <p className="text-muted-foreground">
              View and manage your payment transactions
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">R826.75</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">3</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
