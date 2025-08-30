import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";

const InsuranceDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalPolicies: 234,
    activeClaims: 15,
    totalCoverage: "$2.5M",
    monthlyPremium: "$45,600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        {/* Dashboard Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛡️ Insurance Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage device insurance policies and claims</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Policies</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPolicies}</p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Claims</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeClaims}</p>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Coverage</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalCoverage}</p>
                </div>
                <div className="text-3xl">🛡️</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Premium</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.monthlyPremium}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
          {["overview", "policies", "claims", "reports"].map((tab) => (
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

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-semibold">iPhone 14 Pro - Theft Claim</p>
                      <p className="text-sm text-gray-600">Claim #CLM-2024-001</p>
                    </div>
                    <span className="text-orange-600">🔄 Processing</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold">MacBook Air - Damage Claim</p>
                      <p className="text-sm text-gray-600">Claim #CLM-2024-002</p>
                    </div>
                    <span className="text-green-600">✅ Approved</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    ➕ New Policy
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    📝 File Claim
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    📊 Generate Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    💰 Premium Calculator
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Policy Renewals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">iPhone 13 Policy</p>
                        <p className="text-sm text-gray-600">Expires in 15 days</p>
                      </div>
                      <span className="text-blue-600">⏰</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium">iPad Pro Policy</p>
                        <p className="text-sm text-gray-600">Expires in 30 days</p>
                      </div>
                      <span className="text-yellow-600">📅</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "policies" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Insurance Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Policy management interface</p>
                <p className="text-sm">View and manage all insurance policies</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "claims" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Claims Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Claims processing system</p>
                <p className="text-sm">Track and manage insurance claims</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "reports" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Insurance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Reporting and analytics</p>
                <p className="text-sm">Generate insurance reports and analytics</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsuranceDashboard;

