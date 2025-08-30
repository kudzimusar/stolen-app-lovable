import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";

interface Case {
  id: string;
  caseNumber: string;
  deviceName: string;
  owner: string;
  incidentType: 'theft' | 'robbery' | 'fraud' | 'possession';
  status: 'open' | 'investigating' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedOfficer: string;
  createdDate: string;
  lastUpdated: string;
  location: string;
}

const LawEnforcementCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Mock data
    const mockCases: Case[] = [
      {
        id: '1',
        caseNumber: 'CAS-2024-001',
        deviceName: 'iPhone 15 Pro',
        owner: 'John Doe',
        incidentType: 'theft',
        status: 'investigating',
        priority: 'high',
        assignedOfficer: 'Det. Sarah Johnson',
        createdDate: '2024-01-20',
        lastUpdated: '2024-01-22',
        location: 'Johannesburg CBD'
      },
      {
        id: '2',
        caseNumber: 'CAS-2024-002',
        deviceName: 'Samsung Galaxy S24',
        owner: 'Jane Smith',
        incidentType: 'robbery',
        status: 'open',
        priority: 'urgent',
        assignedOfficer: 'Det. Mike Wilson',
        createdDate: '2024-01-21',
        lastUpdated: '2024-01-21',
        location: 'Cape Town Central'
      },
      {
        id: '3',
        caseNumber: 'CAS-2024-003',
        deviceName: 'MacBook Pro M3',
        owner: 'Bob Johnson',
        incidentType: 'fraud',
        status: 'closed',
        priority: 'medium',
        assignedOfficer: 'Det. Lisa Brown',
        createdDate: '2024-01-15',
        lastUpdated: '2024-01-20',
        location: 'Durban Central'
      }
    ];

    setCases(mockCases);
  }, []);

  const filteredCases = cases.filter(caseItem => {
    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    return matchesStatus;
  });

  const openCases = cases.filter(c => c.status === 'open').length;
  const investigatingCases = cases.filter(c => c.status === 'investigating').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  const urgentCases = cases.filter(c => c.priority === 'urgent').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Open</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-800"><Shield className="w-3 h-3 mr-1" />Investigating</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Closed</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">
            Manage and track law enforcement cases related to device incidents
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Cases</p>
                  <p className="text-2xl font-bold">{openCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Investigating</p>
                  <p className="text-2xl font-bold">{investigatingCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Closed Cases</p>
                  <p className="text-2xl font-bold">{closedCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgent Cases</p>
                  <p className="text-2xl font-bold">{urgentCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Active Cases</CardTitle>
                <CardDescription>Overview of all law enforcement cases</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">Filter</Button>
                <Button>New Case</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCases.map((caseItem) => (
                <div key={caseItem.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{caseItem.caseNumber}</h3>
                          <p className="text-sm text-muted-foreground">{caseItem.deviceName}</p>
                          <p className="text-sm text-muted-foreground">Owner: {caseItem.owner}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(caseItem.status)}
                          {getPriorityBadge(caseItem.priority)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Officer:</span>
                          <span className="font-medium">{caseItem.assignedOfficer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{caseItem.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Updated:</span>
                          <span className="font-medium">{new Date(caseItem.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">Update</Button>
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

export default LawEnforcementCases;
