import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";

const PaymentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalTransactions: 1234,
    pendingPayments: 23,
    monthlyRevenue: "$156,789",
    successRate: "98.5%"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">💳 Payment Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage payment processing and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{stats.monthlyRevenue}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.successRate}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
          {["overview", "transactions", "fraud", "analytics"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className="flex-1 capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Payment transaction management</p>
                <p className="text-sm">View and manage all payment transactions</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;