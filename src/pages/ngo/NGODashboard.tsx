import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { BackButton } from "@/components/navigation/BackButton";

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    totalDonations: 456,
    activePrograms: 12,
    beneficiaries: 2340,
    fundsRaised: "$89,450"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <STOLENLogo />
          <div className="w-10" />
        </div>

        {/* Dashboard Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🤝 NGO Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your charitable programs and donations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalDonations}</p>
                </div>
                <div className="text-3xl">💝</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Programs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activePrograms}</p>
                </div>
                <div className="text-3xl">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Beneficiaries</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.beneficiaries}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Funds Raised</p>
                  <p className="text-2xl font-bold text-pink-600">{stats.fundsRaised}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
          {["overview", "programs", "donations", "impact"].map((tab) => (
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
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Device Recovery Program</p>
                      <p className="text-sm text-gray-600">15 devices recovered this week</p>
                    </div>
                    <span className="text-green-600">📱</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Community Outreach</p>
                      <p className="text-sm text-gray-600">3 new partnerships established</p>
                    </div>
                    <span className="text-blue-600">🤝</span>
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
                    ➕ New Program
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    💰 Create Donation Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    📊 Generate Impact Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    🤝 Partner Outreach
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Fundraising Gala</p>
                        <p className="text-sm text-gray-600">Next Saturday</p>
                      </div>
                      <span className="text-purple-600">🎉</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div>
                        <p className="font-medium">Community Workshop</p>
                        <p className="text-sm text-gray-600">Wednesday 2 PM</p>
                      </div>
                      <span className="text-pink-600">📚</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "programs" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Active Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Program management interface</p>
                <p className="text-sm">View and manage all charitable programs</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "donations" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Donation Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Donation tracking system</p>
                <p className="text-sm">Manage incoming donations and campaigns</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "impact" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Impact Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Impact measurement tools</p>
                <p className="text-sm">Track and report on program effectiveness</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;

