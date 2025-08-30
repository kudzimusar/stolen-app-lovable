import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Package, 
  Users, 
  DollarSign,
  Calendar,
  MapPin,
  Plus
} from "lucide-react";

interface Donation {
  id: string;
  donorName: string;
  deviceType: string;
  deviceCount: number;
  estimatedValue: number;
  status: 'pending' | 'approved' | 'delivered' | 'rejected';
  requestDate: string;
  deliveryDate?: string;
  location: string;
  description: string;
}

const NGODonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    // Mock data
    const mockDonations: Donation[] = [
      {
        id: '1',
        donorName: 'TechCorp Solutions',
        deviceType: 'Laptops',
        deviceCount: 25,
        estimatedValue: 750000,
        status: 'approved',
        requestDate: '2024-01-15',
        deliveryDate: '2024-01-25',
        location: 'Johannesburg',
        description: 'Corporate laptop donation for educational programs'
      },
      {
        id: '2',
        donorName: 'Mobile First SA',
        deviceType: 'Smartphones',
        deviceCount: 50,
        estimatedValue: 500000,
        status: 'pending',
        requestDate: '2024-01-20',
        location: 'Cape Town',
        description: 'Smartphone donation for youth development'
      },
      {
        id: '3',
        donorName: 'Digital Bridge Foundation',
        deviceType: 'Tablets',
        deviceCount: 30,
        estimatedValue: 300000,
        status: 'delivered',
        requestDate: '2024-01-10',
        deliveryDate: '2024-01-18',
        location: 'Durban',
        description: 'Tablet donation for rural education'
      }
    ];

    setDonations(mockDonations);
  }, []);

  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const approvedDonations = donations.filter(d => d.status === 'approved').length;
  const deliveredDonations = donations.filter(d => d.status === 'delivered').length;
  const totalValue = donations.reduce((sum, donation) => sum + donation.estimatedValue, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Donation Management</h1>
            <p className="text-muted-foreground">
              Manage device donations and distribution to communities
            </p>
          </div>
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Request Donation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{approvedDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{deliveredDonations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">R{(totalValue / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>Donation Requests</CardTitle>
            <CardDescription>Overview of all donation requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{donation.donorName}</h3>
                          <p className="text-sm text-muted-foreground">{donation.deviceType}</p>
                          <p className="text-sm text-muted-foreground">{donation.deviceCount} devices</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(donation.status)}
                          <p className="text-lg font-semibold">R{donation.estimatedValue.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{donation.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{donation.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Requested:</span>
                          <span className="font-medium">{new Date(donation.requestDate).toLocaleDateString()}</span>
                        </div>
                        {donation.deliveryDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Delivered:</span>
                            <span className="font-medium">{new Date(donation.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      {donation.status === 'pending' && (
                        <>
                          <Button size="sm">Approve</Button>
                          <Button variant="outline" size="sm">Reject</Button>
                        </>
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

export default NGODonations;
