import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Filter,
  Download
} from "lucide-react";

interface Claim {
  id: string;
  deviceName: string;
  claimant: string;
  claimType: 'theft' | 'damage' | 'loss';
  claimAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedDate: string;
  processedDate?: string;
  description: string;
}

const InsuranceClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Mock data
    const mockClaims: Claim[] = [
      {
        id: '1',
        deviceName: 'iPhone 15 Pro',
        claimant: 'John Doe',
        claimType: 'theft',
        claimAmount: 25000,
        status: 'approved',
        submittedDate: '2024-01-15',
        processedDate: '2024-01-18',
        description: 'Device stolen from car in parking lot'
      },
      {
        id: '2',
        deviceName: 'Samsung Galaxy S24',
        claimant: 'Jane Smith',
        claimType: 'damage',
        claimAmount: 15000,
        status: 'processing',
        submittedDate: '2024-01-20',
        description: 'Screen cracked after fall'
      },
      {
        id: '3',
        deviceName: 'MacBook Pro M3',
        claimant: 'Bob Johnson',
        claimType: 'loss',
        claimAmount: 45000,
        status: 'pending',
        submittedDate: '2024-01-22',
        description: 'Left device on public transport'
      }
    ];

    setClaims(mockClaims);
  }, []);

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesStatus;
  });

  const totalClaims = claims.length;
  const approvedClaims = claims.filter(c => c.status === 'approved').length;
  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const totalAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Insurance Claims</h1>
          <p className="text-muted-foreground">
            Manage and track insurance claims for stolen, damaged, or lost devices
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold">{totalClaims}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{approvedClaims}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingClaims}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">R{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Claims Overview</CardTitle>
                <CardDescription>Review and manage insurance claims</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{claim.deviceName}</h3>
                          <p className="text-sm text-muted-foreground">Claimant: {claim.claimant}</p>
                          <p className="text-sm text-muted-foreground">Type: {claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(claim.status)}
                          <p className="text-lg font-semibold">R{claim.claimAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>📅 Submitted: {new Date(claim.submittedDate).toLocaleDateString()}</span>
                          {claim.processedDate && (
                            <span>✅ Processed: {new Date(claim.processedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Review</Button>
                      <Button variant="outline" size="sm">Details</Button>
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

export default InsuranceClaims;
