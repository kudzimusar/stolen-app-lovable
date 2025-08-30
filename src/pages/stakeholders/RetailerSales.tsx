import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Calendar,
  Filter,
  Download,
  Eye
} from "lucide-react";

interface Sale {
  id: string;
  deviceName: string;
  brand: string;
  model: string;
  serialNumber: string;
  salePrice: number;
  saleDate: string;
  buyer: string;
  status: 'completed' | 'pending' | 'cancelled';
  commission: number;
}

const RetailerSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    // Mock data
    const mockSales: Sale[] = [
      {
        id: '1',
        deviceName: 'iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        serialNumber: 'ABC123DEF456',
        salePrice: 25000,
        saleDate: '2024-01-20',
        buyer: 'John Doe',
        status: 'completed',
        commission: 1250
      },
      {
        id: '2',
        deviceName: 'Samsung Galaxy S24',
        brand: 'Samsung',
        model: 'Galaxy S24',
        serialNumber: 'XYZ789GHI012',
        salePrice: 22000,
        saleDate: '2024-01-19',
        buyer: 'Jane Smith',
        status: 'completed',
        commission: 1100
      },
      {
        id: '3',
        deviceName: 'MacBook Pro M3',
        brand: 'Apple',
        model: 'MacBook Pro M3',
        serialNumber: 'MNB456PQR789',
        salePrice: 45000,
        saleDate: '2024-01-18',
        buyer: 'Bob Johnson',
        status: 'pending',
        commission: 2250
      }
    ];

    setSales(mockSales);
  }, []);

  const filteredSales = sales.filter(sale => {
    const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
    return matchesStatus;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalCommission = sales.reduce((sum, sale) => sum + sale.commission, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed').length;
  const pendingSales = sales.filter(sale => sale.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Track your device sales and revenue performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">R{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commission Earned</p>
                  <p className="text-2xl font-bold">R{totalCommission.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Sales</p>
                  <p className="text-2xl font-bold">{completedSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Sales</p>
                  <p className="text-2xl font-bold">{pendingSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your latest device sales and transactions</CardDescription>
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
              {filteredSales.map((sale) => (
                <div key={sale.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{sale.deviceName}</h3>
                          <p className="text-sm text-muted-foreground">{sale.brand} • {sale.model}</p>
                          <p className="text-sm text-muted-foreground">SN: {sale.serialNumber}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge 
                            className={
                              sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                              sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </Badge>
                          <p className="text-lg font-semibold">R{sale.salePrice.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>👤 {sale.buyer}</span>
                          <span>📅 {new Date(sale.saleDate).toLocaleDateString()}</span>
                        </div>
                        <span>Commission: R{sale.commission.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
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

export default RetailerSales;
