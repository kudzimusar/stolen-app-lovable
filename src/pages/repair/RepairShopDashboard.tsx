import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";
import { useIsMobile } from "@/hooks/use-mobile";

const RepairShopDashboard = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalRepairs: 156,
    pendingRepairs: 23,
    completedToday: 8,
    revenue: "$12,450"
  };

  const recentRepairs = [
    { id: "R001", device: "iPhone 13", status: "In Progress", customer: "John Doe" },
    { id: "R002", device: "Samsung Galaxy", status: "Completed", customer: "Jane Smith" },
    { id: "R003", device: "MacBook Pro", status: "Pending", customer: "Mike Johnson" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        {/* Dashboard Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🔧 Repair Shop Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your repair operations efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Repairs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalRepairs}</p>
                </div>
                <div className="text-3xl">🔧</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingRepairs}</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.revenue}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
          {["overview", "repairs", "inventory", "customers"].map((tab) => (
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
                <CardTitle>Recent Repairs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRepairs.map((repair) => (
                    <div key={repair.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{repair.device}</p>
                        <p className="text-sm text-gray-600">Customer: {repair.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{repair.id}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          repair.status === "Completed" ? "bg-green-100 text-green-800" :
                          repair.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {repair.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
                    ➕ New Repair Order
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    📋 View Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    📊 Generate Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    🔧 Manage Inventory
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">iPhone Screen Repair</p>
                        <p className="text-sm text-gray-600">10:00 AM</p>
                      </div>
                      <span className="text-blue-600">⏰</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Laptop Diagnostic</p>
                        <p className="text-sm text-gray-600">2:00 PM</p>
                      </div>
                      <span className="text-green-600">📋</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "repairs" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>All Repairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Repair management interface</p>
                <p className="text-sm">View and manage all repair orders</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "inventory" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Parts and tools inventory</p>
                <p className="text-sm">Track repair parts and equipment</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "customers" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Customer database</p>
                <p className="text-sm">Manage customer information and history</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RepairShopDashboard;

