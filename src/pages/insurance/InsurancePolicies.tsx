import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Plus,
  Eye
} from "lucide-react";

interface Policy {
  id: string;
  deviceName: string;
  policyNumber: string;
  coverageType: 'comprehensive' | 'theft' | 'damage';
  premium: number;
  coverage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  deductible: number;
}

const InsurancePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    // Mock data
    const mockPolicies: Policy[] = [
      {
        id: '1',
        deviceName: 'iPhone 15 Pro',
        policyNumber: 'POL-2024-001',
        coverageType: 'comprehensive',
        premium: 150,
        coverage: 25000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        deductible: 1000
      },
      {
        id: '2',
        deviceName: 'Samsung Galaxy S24',
        policyNumber: 'POL-2024-002',
        coverageType: 'theft',
        premium: 100,
        coverage: 22000,
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        status: 'active',
        deductible: 500
      },
      {
        id: '3',
        deviceName: 'MacBook Pro M3',
        policyNumber: 'POL-2023-003',
        coverageType: 'comprehensive',
        premium: 200,
        coverage: 45000,
        startDate: '2023-06-01',
        endDate: '2024-05-31',
        status: 'expired',
        deductible: 1500
      }
    ];

    setPolicies(mockPolicies);
  }, []);

  const activePolicies = policies.filter(p => p.status === 'active');
  const totalPremium = activePolicies.reduce((sum, policy) => sum + policy.premium, 0);
  const totalCoverage = activePolicies.reduce((sum, policy) => sum + policy.coverage, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCoverageTypeBadge = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return <Badge className="bg-blue-100 text-blue-800">Comprehensive</Badge>;
      case 'theft':
        return <Badge className="bg-purple-100 text-purple-800">Theft Only</Badge>;
      case 'damage':
        return <Badge className="bg-orange-100 text-orange-800">Damage Only</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Insurance Policies</h1>
            <p className="text-muted-foreground">
              Manage your device insurance policies and coverage
            </p>
          </div>
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Policies</p>
                  <p className="text-2xl font-bold">{activePolicies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Premium</p>
                  <p className="text-2xl font-bold">R{totalPremium}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Coverage</p>
                  <p className="text-2xl font-bold">R{totalCoverage.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expired Policies</p>
                  <p className="text-2xl font-bold">{policies.filter(p => p.status === 'expired').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Policies</CardTitle>
            <CardDescription>Overview of all your insurance policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{policy.deviceName}</h3>
                          <p className="text-sm text-muted-foreground">Policy: {policy.policyNumber}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(policy.status)}
                          {getCoverageTypeBadge(policy.coverageType)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Premium:</span>
                          <p className="font-medium">R{policy.premium}/month</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coverage:</span>
                          <p className="font-medium">R{policy.coverage.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deductible:</span>
                          <p className="font-medium">R{policy.deductible}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valid Until:</span>
                          <p className="font-medium">{new Date(policy.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {policy.status === 'active' && (
                        <Button variant="outline" size="sm">Renew</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsurancePolicies;
