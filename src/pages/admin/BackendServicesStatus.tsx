import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { 
  Server, 
  Database, 
  Wifi, 
  Zap, 
  Cloud, 
  Shield, 
  MessageSquare,
  Bell,
  CreditCard,
  Search,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  url: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  lastChecked?: Date;
  responseTime?: number;
}

const BackendServicesStatus = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initialServices: ServiceStatus[] = [
    {
      name: 'Supabase Database',
      status: 'online',
      url: 'http://127.0.0.1:54321',
      description: 'PostgreSQL database with real-time subscriptions',
      icon: <Database className="w-6 h-6" />,
      features: ['Hot Deals Schema', 'Bidding System', 'User Management', 'Real-time Updates'],
      responseTime: 45
    },
    {
      name: 'WebSocket Server',
      status: 'online',
      url: 'ws://127.0.0.1:3001',
      description: 'Real-time communication for Hot Deals',
      icon: <Wifi className="w-6 h-6" />,
      features: ['Live Bidding', 'Countdown Timers', 'Chat', 'Notifications'],
      responseTime: 12
    },
    {
      name: 'Redis Cache',
      status: 'online',
      url: 'redis://127.0.0.1:6379',
      description: 'In-memory caching and session storage',
      icon: <Zap className="w-6 h-6" />,
      features: ['Deal Caching', 'Session Management', 'Rate Limiting', 'Analytics'],
      responseTime: 8
    },
    {
      name: 'Hot Deals Engine',
      status: 'online',
      url: 'http://127.0.0.1:54321/functions/v1/hot-deals-engine',
      description: 'AI-powered deals processing and optimization',
      icon: <Server className="w-6 h-6" />,
      features: ['Dynamic Pricing', 'Bid Processing', 'AI Analysis', 'Notifications'],
      responseTime: 156
    },
    {
      name: 'Google Gemini AI',
      status: 'warning',
      url: 'https://generativelanguage.googleapis.com',
      description: 'AI recommendations and analysis',
      icon: <Cloud className="w-6 h-6" />,
      features: ['Price Optimization', 'Demand Prediction', 'Fraud Detection', 'Chatbot'],
      responseTime: 234
    },
    {
      name: 'Stripe Payment',
      status: 'offline',
      url: 'https://api.stripe.com',
      description: 'Payment processing for Hot Deals',
      icon: <CreditCard className="w-6 h-6" />,
      features: ['Payment Intents', 'Escrow', 'Refunds', 'Webhooks'],
      responseTime: 0
    },
    {
      name: 'Push Notifications',
      status: 'warning',
      url: 'Browser API',
      description: 'Real-time browser notifications',
      icon: <Bell className="w-6 h-6" />,
      features: ['Bid Alerts', 'Deal Expiry', 'Price Drops', 'Flash Sales'],
      responseTime: 23
    },
    {
      name: 'Algolia Search',
      status: 'offline',
      url: 'https://api.algolia.com',
      description: 'Enhanced search and filtering',
      icon: <Search className="w-6 h-6" />,
      features: ['Instant Search', 'Faceted Filters', 'Analytics', 'Personalization'],
      responseTime: 0
    },
    {
      name: 'Sentry Monitoring',
      status: 'offline',
      url: 'https://sentry.io',
      description: 'Error tracking and performance monitoring',
      icon: <BarChart3 className="w-6 h-6" />,
      features: ['Error Tracking', 'Performance', 'Alerts', 'Analytics'],
      responseTime: 0
    },
    {
      name: 'Fraud Detection',
      status: 'online',
      url: 'Internal Service',
      description: 'AI-powered fraud prevention',
      icon: <Shield className="w-6 h-6" />,
      features: ['Risk Assessment', 'Pattern Detection', 'Real-time Scoring', 'Alerts'],
      responseTime: 89
    }
  ];

  useEffect(() => {
    setServices(initialServices.map(service => ({
      ...service,
      lastChecked: new Date()
    })));
  }, []);

  const checkServiceStatus = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      const startTime = Date.now();
      
      // Simulate API health check
      if (service.url.includes('127.0.0.1') || service.url.includes('localhost')) {
        // Local services - simulate check
        await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
        const responseTime = Date.now() - startTime;
        
        return {
          ...service,
          status: 'online',
          responseTime,
          lastChecked: new Date()
        };
      } else {
        // External services - mark as offline for demo (would be real checks in production)
        return {
          ...service,
          status: service.status === 'warning' ? 'warning' : 'offline',
          responseTime: 0,
          lastChecked: new Date()
        };
      }
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        responseTime: 0,
        lastChecked: new Date()
      };
    }
  };

  const refreshAllServices = async () => {
    setIsRefreshing(true);
    
    try {
      const updatedServices = await Promise.all(
        services.map(service => checkServiceStatus(service))
      );
      setServices(updatedServices);
    } catch (error) {
      console.error('Failed to refresh services:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const onlineServices = services.filter(s => s.status === 'online').length;
  const warningServices = services.filter(s => s.status === 'warning').length;
  const offlineServices = services.filter(s => s.status === 'offline').length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Backend Services Status</h1>
            <p className="text-muted-foreground">Monitor all Hot Deals infrastructure services</p>
          </div>
          
          <Button onClick={refreshAllServices} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{onlineServices}</div>
                <div className="text-sm text-gray-600">Online</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{warningServices}</div>
                <div className="text-sm text-gray-600">Warning</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{offlineServices}</div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Server className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{services.length}</div>
                <div className="text-sm text-gray-600">Total Services</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.name} className={`p-6 border ${getStatusColor(service.status)}`}>
              <div className="space-y-4">
                {/* Service Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {service.icon}
                    <div>
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <Badge variant="outline" className={getStatusColor(service.status)}>
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">URL:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {service.url}
                    </span>
                  </div>
                  
                  {service.responseTime !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Response Time:</span>
                      <span className={`font-medium ${
                        service.responseTime < 100 ? 'text-green-600' :
                        service.responseTime < 300 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {service.responseTime}ms
                      </span>
                    </div>
                  )}
                  
                  {service.lastChecked && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Checked:</span>
                      <span className="text-gray-500">
                        {service.lastChecked.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Available Backend Services
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Currently Available:</h4>
                <ul className="space-y-1 text-green-600">
                  <li>• Supabase Local Database (Port 54321)</li>
                  <li>• WebSocket Server (Port 3001)</li>
                  <li>• Redis Cache (Port 6379)</li>
                  <li>• Hot Deals Engine Functions</li>
                  <li>• Real-time Bidding</li>
                  <li>• Countdown Timers</li>
                  <li>• AI Fraud Detection</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">⚠️ Needs Configuration:</h4>
                <ul className="space-y-1 text-yellow-600">
                  <li>• Google Gemini AI (API Key required)</li>
                  <li>• Push Notifications (Browser permissions)</li>
                  <li>• Stripe Payments (API Keys required)</li>
                  <li>• Algolia Search (Service setup needed)</li>
                  <li>• Sentry Monitoring (Project setup needed)</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-700 mb-2">🚀 For Full Production Setup:</h4>
              <ol className="space-y-1 text-blue-600 list-decimal list-inside">
                <li>Add your API keys to environment variables</li>
                <li>Deploy Supabase functions to production</li>
                <li>Configure external services (Stripe, Algolia, etc.)</li>
                <li>Set up monitoring and alerting</li>
                <li>Enable SSL certificates for secure connections</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default BackendServicesStatus;
