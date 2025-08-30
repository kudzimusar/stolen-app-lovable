import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Heart,
  BarChart3,
  Download
} from "lucide-react";

interface ImpactMetric {
  id: string;
  programName: string;
  location: string;
  devicesDistributed: number;
  beneficiariesReached: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'planned';
  impactScore: number;
  description: string;
}

const NGOImpact = () => {
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([]);

  useEffect(() => {
    // Mock data
    const mockMetrics: ImpactMetric[] = [
      {
        id: '1',
        programName: 'Digital Literacy for Rural Schools',
        location: 'Limpopo Province',
        devicesDistributed: 150,
        beneficiariesReached: 450,
        startDate: '2023-06-01',
        endDate: '2024-01-15',
        status: 'completed',
        impactScore: 95,
        description: 'Provided laptops and tablets to 5 rural schools, improving digital literacy for 450 students'
      },
      {
        id: '2',
        programName: 'Youth Coding Initiative',
        location: 'Cape Town',
        devicesDistributed: 75,
        beneficiariesReached: 200,
        startDate: '2023-09-01',
        status: 'active',
        impactScore: 88,
        description: 'Teaching coding and programming skills to underprivileged youth using donated computers'
      },
      {
        id: '3',
        programName: 'Community Tech Hub',
        location: 'Johannesburg',
        devicesDistributed: 100,
        beneficiariesReached: 300,
        startDate: '2024-01-01',
        status: 'active',
        impactScore: 92,
        description: 'Establishing community technology centers for skill development and job training'
      }
    ];

    setImpactMetrics(mockMetrics);
  }, []);

  const totalDevices = impactMetrics.reduce((sum, metric) => sum + metric.devicesDistributed, 0);
  const totalBeneficiaries = impactMetrics.reduce((sum, metric) => sum + metric.beneficiariesReached, 0);
  const activePrograms = impactMetrics.filter(m => m.status === 'active').length;
  const completedPrograms = impactMetrics.filter(m => m.status === 'completed').length;
  const averageImpactScore = impactMetrics.length > 0 
    ? Math.round(impactMetrics.reduce((sum, metric) => sum + metric.impactScore, 0) / impactMetrics.length)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'planned':
        return <Badge className="bg-yellow-100 text-yellow-800">Planned</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getImpactScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Impact Measurement</h1>
          <p className="text-muted-foreground">
            Track and measure the impact of device donations on communities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                  <p className="text-2xl font-bold">{totalDevices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Beneficiaries</p>
                  <p className="text-2xl font-bold">{totalBeneficiaries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
                  <p className="text-2xl font-bold">{activePrograms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Impact Score</p>
                  <p className="text-2xl font-bold">{averageImpactScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact Metrics */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle>Program Impact</CardTitle>
                <CardDescription>Detailed impact metrics for each program</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button>Add Program</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {impactMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{metric.programName}</h3>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getStatusBadge(metric.status)}
                          <p className={`text-lg font-semibold ${getImpactScoreColor(metric.impactScore)}`}>
                            {metric.impactScore}% Impact
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{metric.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Devices:</span>
                          <span className="font-medium">{metric.devicesDistributed}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Beneficiaries:</span>
                          <span className="font-medium">{metric.beneficiariesReached}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">
                            {new Date(metric.startDate).toLocaleDateString()} - 
                            {metric.endDate ? new Date(metric.endDate).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Update Metrics</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Impact</CardTitle>
              <CardDescription>Impact distribution across regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Limpopo Province</span>
                  <span className="font-semibold">450 beneficiaries</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cape Town</span>
                  <span className="font-semibold">200 beneficiaries</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Johannesburg</span>
                  <span className="font-semibold">300 beneficiaries</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Success Rate</CardTitle>
              <CardDescription>Completion and success metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Completed Programs</span>
                  <span className="font-semibold">{completedPrograms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Programs</span>
                  <span className="font-semibold">{activePrograms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {impactMetrics.length > 0 ? Math.round((completedPrograms / impactMetrics.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NGOImpact;
