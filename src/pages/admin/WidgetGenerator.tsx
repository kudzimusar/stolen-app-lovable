import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/navigation/AppHeader";
import { 
  Code, 
  Copy, 
  Download,
  Eye,
  Shield,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Settings,
  Palette
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const WidgetGenerator = () => {
  const [widgetConfig, setWidgetConfig] = useState({
    type: "verification_badge",
    size: "medium",
    theme: "light",
    showSerial: true,
    showStatus: true,
    showTimestamp: false,
    customText: "",
    borderRadius: "8",
    primaryColor: "#000000",
    backgroundColor: "#ffffff"
  });
  const { toast } = useToast();

  const widgetTypes = [
    {
      id: "verification_badge",
      name: "Verification Badge",
      description: "Simple badge showing device verification status",
      preview: "🛡️ STOLEN Verified"
    },
    {
      id: "detailed_card",
      name: "Detailed Card",
      description: "Full card with device details and verification",
      preview: "📱 iPhone 14 Pro - Verified Safe"
    },
    {
      id: "minimal_status",
      name: "Minimal Status",
      description: "Compact status indicator",
      preview: "✅ Verified"
    }
  ];

  const generateWidgetCode = () => {
    const baseUrl = "https://api.stolen.app/v1/widget";
    const params = new URLSearchParams({
      type: widgetConfig.type,
      size: widgetConfig.size,
      theme: widgetConfig.theme,
      showSerial: widgetConfig.showSerial.toString(),
      showStatus: widgetConfig.showStatus.toString(),
      showTimestamp: widgetConfig.showTimestamp.toString(),
      borderRadius: widgetConfig.borderRadius,
      primaryColor: widgetConfig.primaryColor.replace("#", ""),
      backgroundColor: widgetConfig.backgroundColor.replace("#", "")
    });

    if (widgetConfig.customText) {
      params.append("customText", widgetConfig.customText);
    }

    return {
      iframe: `<iframe src="${baseUrl}?${params.toString()}" width="300" height="100" frameborder="0"></iframe>`,
      javascript: `<script>
(function() {
  var widget = document.createElement('div');
  widget.id = 'stolen-widget';
  widget.innerHTML = '<iframe src="${baseUrl}?${params.toString()}" width="300" height="100" frameborder="0"></iframe>';
  document.getElementById('stolen-widget-container').appendChild(widget);
})();
</script>
<div id="stolen-widget-container"></div>`,
      react: `import React from 'react';

const StolenWidget = () => {
  return (
    <iframe 
      src="${baseUrl}?${params.toString()}"
      width="300" 
      height="100" 
      frameBorder="0"
      title="STOLEN Verification Widget"
    />
  );
};

export default StolenWidget;`
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Widget code has been copied to your clipboard",
    });
  };

  const downloadWidget = () => {
    const code = generateWidgetCode();
    const blob = new Blob([code.iframe], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stolen-widget.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateApiKey = () => {
    const apiKey = 'sk_' + Math.random().toString(36).substr(2, 32);
    toast({
      title: "API Key Generated",
      description: `Your API key: ${apiKey}`,
    });
  };

  const widgetCode = generateWidgetCode();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Widget Generator</h1>
          <p className="text-muted-foreground">
            Create embeddable verification widgets for your website or marketplace
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Widget Configuration
                </CardTitle>
                <CardDescription>Customize your verification widget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Widget Type</Label>
                  <Select 
                    value={widgetConfig.type} 
                    onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {widgetTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {widgetTypes.find(t => t.id === widgetConfig.type)?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select 
                      value={widgetConfig.size} 
                      onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={widgetConfig.theme} 
                      onValueChange={(value) => setWidgetConfig(prev => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Display Options</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={widgetConfig.showSerial}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, showSerial: e.target.checked }))}
                      />
                      <span className="text-sm">Show serial number</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={widgetConfig.showStatus}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, showStatus: e.target.checked }))}
                      />
                      <span className="text-sm">Show verification status</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={widgetConfig.showTimestamp}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, showTimestamp: e.target.checked }))}
                      />
                      <span className="text-sm">Show verification timestamp</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customText">Custom Text (Optional)</Label>
                  <Input
                    id="customText"
                    placeholder="e.g., 'Verified by our marketplace'"
                    value={widgetConfig.customText}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, customText: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Styling
                </CardTitle>
                <CardDescription>Customize the visual appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={widgetConfig.primaryColor}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={widgetConfig.primaryColor}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={widgetConfig.backgroundColor}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={widgetConfig.backgroundColor}
                        onChange={(e) => setWidgetConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius (px)</Label>
                  <Input
                    id="borderRadius"
                    type="number"
                    min="0"
                    max="20"
                    value={widgetConfig.borderRadius}
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Get API key for widget integration</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={generateApiKey} className="w-full">
                  Generate API Key
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  API key required for production widget usage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Preview and Code */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Widget Preview
                </CardTitle>
                <CardDescription>Live preview of your widget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
                    style={{
                      backgroundColor: widgetConfig.backgroundColor,
                      color: widgetConfig.primaryColor,
                      borderRadius: `${widgetConfig.borderRadius}px`,
                      border: `1px solid ${widgetConfig.primaryColor}20`
                    }}
                  >
                    <Shield className="w-4 h-4" style={{ color: widgetConfig.primaryColor }} />
                    <div className="text-sm font-medium">
                      {widgetConfig.type === 'verification_badge' && 'STOLEN Verified'}
                      {widgetConfig.type === 'detailed_card' && 'iPhone 14 Pro - Verified Safe'}
                      {widgetConfig.type === 'minimal_status' && 'Verified'}
                    </div>
                    {widgetConfig.showStatus && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {widgetConfig.customText && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {widgetConfig.customText}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Embed Code
                </CardTitle>
                <CardDescription>Copy and paste into your website</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="iframe" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="iframe">HTML/iframe</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                  </TabsList>

                  <TabsContent value="iframe" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>HTML Embed Code</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(widgetCode.iframe)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={widgetCode.iframe}
                      readOnly
                      className="font-mono text-sm"
                      rows={3}
                    />
                  </TabsContent>

                  <TabsContent value="javascript" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>JavaScript Code</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(widgetCode.javascript)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={widgetCode.javascript}
                      readOnly
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </TabsContent>

                  <TabsContent value="react" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>React Component</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(widgetCode.react)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={widgetCode.react}
                      readOnly
                      className="font-mono text-sm"
                      rows={12}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={downloadWidget} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Test Widget
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline">1</Badge>
                  <p>Copy the embed code for your preferred platform</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline">2</Badge>
                  <p>Paste the code into your website's HTML</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline">3</Badge>
                  <p>Replace "DEVICE_SERIAL" with actual device serial numbers</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline">4</Badge>
                  <p>Test the widget to ensure proper functionality</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;