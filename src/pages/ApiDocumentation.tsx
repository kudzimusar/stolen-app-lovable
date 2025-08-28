import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, Key, Book, Zap, Shield, Globe, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

const ApiDocumentation = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/verify/device/{identifier}",
      description: "Verify a device by IMEI, serial number, or QR code",
      example: `curl -X GET "https://api.stolen.com/v1/verify/device/123456789012345" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      method: "POST",
      path: "/api/v1/verify/bulk",
      description: "Bulk verify multiple devices in a single request",
      example: `curl -X POST "https://api.stolen.com/v1/verify/bulk" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifiers": ["123456789012345", "987654321098765"]
  }'`
    },
    {
      method: "GET",
      path: "/api/v1/device/{id}/history",
      description: "Get complete ownership history for a device",
      example: `curl -X GET "https://api.stolen.com/v1/device/dev_123/history" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    },
    {
      method: "POST",
      path: "/api/v1/certificate/generate",
      description: "Generate a verification certificate for a device",
      example: `curl -X POST "https://api.stolen.com/v1/certificate/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "dev_123456",
    "format": "pdf"
  }'`
    },
    {
      method: "GET",
      path: "/api/v1/trust-badge/{deviceId}",
      description: "Get trust badge widget for a device",
      example: `curl -X GET "https://api.stolen.com/v1/trust-badge/dev_123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      requests: "100/month",
      features: ["Basic device verification", "Community support", "Standard response time"],
      cta: "Get Started"
    },
    {
      name: "Basic",
      price: "$99",
      requests: "1,000/month",
      features: ["All Free features", "Priority support", "Faster response time", "Basic analytics"],
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "$499",
      requests: "10,000/month",
      features: ["All Basic features", "Bulk verification", "Advanced analytics", "Webhook support"],
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "$1,999",
      requests: "Unlimited",
      features: ["All Professional features", "Custom integrations", "Dedicated support", "SLA guarantee"],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            API Documentation
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Integrate STOLEN's Reverse Verification Tool into your platform
          </p>
        </div>

        {/* API Overview */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">99.5% Accuracy</h3>
              <p className="text-muted-foreground">Industry-leading device verification accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">&lt;200ms Response</h3>
              <p className="text-muted-foreground">Lightning-fast API response times</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">99.9% Uptime</h3>
              <p className="text-muted-foreground">Enterprise-grade reliability and availability</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    What is the Reverse Verification API?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    The STOLEN Reverse Verification API is a proprietary technology that allows instant 
                    verification of device ownership, status, and history. Integrate it into your platform 
                    to prevent fraud and build trust with your users.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Real-time device verification</li>
                      <li>Blockchain-backed ownership records</li>
                      <li>AI-powered fraud detection</li>
                      <li>Global device database access</li>
                      <li>Bulk verification support</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-semibold">Sign up for API access</h4>
                        <p className="text-sm text-muted-foreground">Create an account and get your API key</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-semibold">Make your first request</h4>
                        <p className="text-sm text-muted-foreground">Test with a simple device verification</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-semibold">Integrate and scale</h4>
                        <p className="text-sm text-muted-foreground">Implement in your production environment</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link to="/register">
                      <Button className="w-full">
                        Get API Access
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <p className="text-muted-foreground">
                    Base URL: <code className="bg-muted px-2 py-1 rounded">https://api.stolen.com</code>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                            {endpoint.method}
                          </Badge>
                          <code className="font-mono text-sm">{endpoint.path}</code>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                        
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Example Request:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.example, endpoint.path)}
                            >
                              {copiedEndpoint === endpoint.path ? 
                                <Check className="w-4 h-4" /> : 
                                <Copy className="w-4 h-4" />
                              }
                            </Button>
                          </div>
                          <pre className="text-xs overflow-x-auto">
                            <code>{endpoint.example}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`{
  "success": true,
  "device": {
    "id": "dev_123456",
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "model": "A2848",
    "serialNumber": "F2LW0**8P",
    "status": "verified",
    "verificationScore": 98,
    "ownership": {
      "current": "John D.",
      "registrationDate": "2024-01-15",
      "transfers": 1
    },
    "flags": [],
    "location": "San Francisco, CA"
  },
  "recommendations": {
    "action": "proceed",
    "confidence": 0.98,
    "riskLevel": "low"
  }
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">API Key Authentication</h4>
                  <p className="text-muted-foreground mb-4">
                    All API requests require authentication using your API key in the Authorization header:
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Rate Limiting</h4>
                  <p className="text-muted-foreground mb-4">
                    API requests are rate-limited based on your subscription tier:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Free: 100 requests per month</li>
                    <li>Basic: 1,000 requests per month</li>
                    <li>Professional: 10,000 requests per month</li>
                    <li>Enterprise: Unlimited requests</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Error Codes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-mono">401</span>
                      <span className="text-muted-foreground">Unauthorized - Invalid API key</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-mono">429</span>
                      <span className="text-muted-foreground">Rate limit exceeded</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-mono">404</span>
                      <span className="text-muted-foreground">Device not found</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-mono">500</span>
                      <span className="text-muted-foreground">Internal server error</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Security Best Practices</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Never expose API keys in client-side code</li>
                    <li>Use environment variables to store API keys</li>
                    <li>Rotate API keys regularly</li>
                    <li>Monitor API usage for anomalies</li>
                    <li>Use HTTPS for all API requests</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">API Pricing Plans</h2>
                <p className="text-muted-foreground">
                  Choose the plan that fits your verification needs
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {pricingTiers.map((tier, index) => (
                  <Card key={index} className={tier.name === "Professional" ? "border-primary" : ""}>
                    <CardHeader className="text-center">
                      <CardTitle>{tier.name}</CardTitle>
                      <div className="text-3xl font-bold">{tier.price}<span className="text-sm font-normal">/month</span></div>
                      <p className="text-muted-foreground">{tier.requests}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={tier.name === "Professional" ? "default" : "outline"}
                      >
                        {tier.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Need a Custom Solution?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    For high-volume enterprise customers or custom integrations, we offer tailored solutions 
                    with dedicated support, custom SLAs, and specialized features.
                  </p>
                  <Link to="/support">
                    <Button variant="outline">
                      Contact Enterprise Sales
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiDocumentation;