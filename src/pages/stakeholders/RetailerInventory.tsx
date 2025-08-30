import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'registered' | 'pending' | 'verified' | 'flagged';
  purchaseDate: string;
  price: number;
  location: string;
  lastUpdated: string;
}

const RetailerInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        serialNumber: 'ABC123DEF456',
        status: 'verified',
        purchaseDate: '2024-01-15',
        price: 25000,
        location: 'Johannesburg Store',
        lastUpdated: '2024-01-20'
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24',
        brand: 'Samsung',
        model: 'Galaxy S24',
        serialNumber: 'XYZ789GHI012',
        status: 'pending',
        purchaseDate: '2024-01-18',
        price: 22000,
        location: 'Cape Town Store',
        lastUpdated: '2024-01-19'
      },
      {
        id: '3',
        name: 'MacBook Pro M3',
        brand: 'Apple',
        model: 'MacBook Pro M3',
        serialNumber: 'MNB456PQR789',
        status: 'flagged',
        purchaseDate: '2024-01-10',
        price: 45000,
        location: 'Durban Store',
        lastUpdated: '2024-01-17'
      }
    ];

    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="secondary">Registered</Badge>;
    }
  };

  const handleBulkRegistration = () => {
    // Implement bulk registration logic
    console.log('Bulk registration initiated');
  };

  const handleExportInventory = () => {
    // Implement export logic
    console.log('Exporting inventory');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your device inventory and registrations</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleBulkRegistration} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Bulk Register
            </Button>
            <Button variant="outline" onClick={handleExportInventory} className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name, brand, or serial number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" onClick={() => setFilterStatus('all')}>All ({inventory.length})</TabsTrigger>
            <TabsTrigger value="verified" onClick={() => setFilterStatus('verified')}>Verified ({inventory.filter(i => i.status === 'verified').length})</TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setFilterStatus('pending')}>Pending ({inventory.filter(i => i.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="flagged" onClick={() => setFilterStatus('flagged')}>Flagged ({inventory.filter(i => i.status === 'flagged').length})</TabsTrigger>
            <TabsTrigger value="registered" onClick={() => setFilterStatus('registered')}>Registered ({inventory.filter(i => i.status === 'registered').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {filteredInventory.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.brand} • {item.model}</p>
                            <p className="text-sm text-muted-foreground">SN: {item.serialNumber}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge(item.status)}
                            <p className="text-lg font-semibold">R{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span>📍 {item.location}</span>
                            <span>📅 {new Date(item.purchaseDate).toLocaleDateString()}</span>
                          </div>
                          <span>Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{inventory.filter(i => i.status === 'verified').length}</p>
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
                  <p className="text-2xl font-bold">{inventory.filter(i => i.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold">{inventory.filter(i => i.status === 'flagged').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetailerInventory;
