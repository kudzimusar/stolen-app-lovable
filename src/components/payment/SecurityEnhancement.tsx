import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Smartphone, 
  Key,
  Users,
  Globe,
  AlertTriangle,
  CheckCircle,
  Settings,
  Lock,
  Fingerprint,
  QrCode,
  Clock,
  CreditCard,
  Info,
  RefreshCw,
  Plus,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { securitySettingsService, SecuritySettings } from "@/lib/services/security-settings-service";

interface SecurityConfig {
  multiSigRequired: boolean;
  requiredSignatures: number;
  signers: string[];
  dailyLimit: number;
  monthlyLimit: number;
  requireHardwareAuth: boolean;
  allowedCountries: string[];
  blockedCountries: string[];
  blockSuspiciousIPs: boolean;
  maxDeviceCount: number;
  sessionTimeoutMinutes: number;
  require2FAForHighValue: boolean;
  highValueThreshold: number;
  enableFraudDetection: boolean;
  enableGeolocationChecks: boolean;
  enableDeviceFingerprinting: boolean;
}

interface TrustedDevice {
  id: string;
  name: string;
  deviceType: string;
  operatingSystem: string;
  browser: string;
  lastUsed: string;
  location: string;
  isCurrentDevice: boolean;
  isTrusted: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'transaction' | 'device_added' | 'security_change' | 'suspicious_activity';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

interface SecurityEnhancementProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const SecurityEnhancement: React.FC<SecurityEnhancementProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'devices' | 'multisig' | 'activity'>('settings');
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [realSecuritySettings, setRealSecuritySettings] = useState<SecuritySettings | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddSigner, setShowAddSigner] = useState(false);
  const [newSignerEmail, setNewSignerEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      initializeRealSecuritySettings();
      fetchSecurityConfig();
      fetchTrustedDevices();
      fetchSecurityEvents();
    }
  }, [isOpen]);

  const initializeRealSecuritySettings = async () => {
    try {
      const settings = await securitySettingsService.initializeSettings(userId);
      setRealSecuritySettings(settings);
    } catch (error) {
      console.error('Error initializing security settings:', error);
    }
  };

  // Functional toggle handler for real settings
  const handleRealSettingToggle = async (setting: keyof Omit<SecuritySettings, 'userId' | 'lastUpdated'>, currentValue: boolean | number) => {
    try {
      const newValue = typeof currentValue === 'boolean' ? !currentValue : currentValue;
      const updatedSettings = await securitySettingsService.updateSetting(userId, setting, newValue);
      setRealSecuritySettings(updatedSettings);
      
      toast({
        title: "Setting Updated",
        description: `${setting} has been ${typeof newValue === 'boolean' ? (newValue ? 'enabled' : 'disabled') : 'updated'}.`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchSecurityConfig = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/security/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSecurityConfig(result.config);
      }
    } catch (error) {
      console.error('Error fetching security config:', error);
      // Mock security config for demo
      setSecurityConfig({
        multiSigRequired: false,
        requiredSignatures: 2,
        signers: ['user123@example.com'],
        dailyLimit: 15000,
        monthlyLimit: 100000,
        requireHardwareAuth: false,
        allowedCountries: ['ZA'],
        blockedCountries: [],
        blockSuspiciousIPs: true,
        maxDeviceCount: 5,
        sessionTimeoutMinutes: 30,
        require2FAForHighValue: true,
        highValueThreshold: 5000,
        enableFraudDetection: true,
        enableGeolocationChecks: true,
        enableDeviceFingerprinting: true
      });
    }
  };

  const fetchTrustedDevices = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/security/devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setTrustedDevices(result.devices);
      }
    } catch (error) {
      console.error('Error fetching trusted devices:', error);
      // Mock trusted devices for demo
      setTrustedDevices([
        {
          id: '1',
          name: 'MacBook Pro',
          deviceType: 'Desktop',
          operatingSystem: 'macOS 14.2',
          browser: 'Chrome 120.0',
          lastUsed: '2024-02-01T14:30:00Z',
          location: 'Johannesburg, ZA',
          isCurrentDevice: true,
          isTrusted: true
        },
        {
          id: '2',
          name: 'iPhone 15',
          deviceType: 'Mobile',
          operatingSystem: 'iOS 17.2',
          browser: 'Safari 17.0',
          lastUsed: '2024-02-01T10:15:00Z',
          location: 'Johannesburg, ZA',
          isCurrentDevice: false,
          isTrusted: true
        },
        {
          id: '3',
          name: 'Unknown Device',
          deviceType: 'Mobile',
          operatingSystem: 'Android 13',
          browser: 'Chrome 119.0',
          lastUsed: '2024-01-28T18:45:00Z',
          location: 'Cape Town, ZA',
          isCurrentDevice: false,
          isTrusted: false
        }
      ]);
    }
  };

  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch('/api/v1/s-pay/security/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSecurityEvents(result.events);
      }
    } catch (error) {
      console.error('Error fetching security events:', error);
      // Mock security events for demo
      setSecurityEvents([
        {
          id: '1',
          type: 'login',
          description: 'Successful login from trusted device',
          severity: 'low',
          timestamp: '2024-02-01T14:30:00Z',
          location: 'Johannesburg, ZA',
          deviceInfo: 'MacBook Pro - Chrome'
        },
        {
          id: '2',
          type: 'transaction',
          description: 'High-value transaction (R8,500) approved with 2FA',
          severity: 'medium',
          timestamp: '2024-02-01T12:15:00Z',
          location: 'Johannesburg, ZA'
        },
        {
          id: '3',
          type: 'suspicious_activity',
          description: 'Login attempt from unknown device blocked',
          severity: 'high',
          timestamp: '2024-01-31T23:45:00Z',
          location: 'Lagos, NG',
          ipAddress: '197.255.xxx.xxx'
        },
        {
          id: '4',
          type: 'device_added',
          description: 'New device added and verified',
          severity: 'medium',
          timestamp: '2024-01-30T16:20:00Z',
          location: 'Johannesburg, ZA',
          deviceInfo: 'iPhone 15 - Safari'
        }
      ]);
    }
  };

  const updateSecurityConfig = async (updates: Partial<SecurityConfig>) => {
    if (!securityConfig) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/s-pay/security/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setSecurityConfig(prev => ({ ...prev, ...updates } as SecurityConfig));
          toast({
            title: "Security Settings Updated",
            description: "Your security configuration has been updated successfully.",
          });
        } else {
          throw new Error(result.error || 'Update failed');
        }
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating security config:', error);
      toast({
        title: "Update Failed",
        description: "Unable to update security settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceAction = async (deviceId: string, action: 'trust' | 'revoke' | 'remove') => {
    try {
      const response = await fetch(`/api/v1/s-pay/security/devices/${deviceId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          await fetchTrustedDevices();
          toast({
            title: "Device Updated",
            description: `Device has been ${action}d successfully.`,
          });
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing device:`, error);
      toast({
        title: "Action Failed",
        description: `Unable to ${action} device. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleAddSigner = async () => {
    if (!newSignerEmail.trim() || !securityConfig) return;

    try {
      const response = await fetch('/api/v1/s-pay/security/multisig/add-signer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({ signerEmail: newSignerEmail })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setSecurityConfig(prev => ({
            ...prev!,
            signers: [...prev!.signers, newSignerEmail]
          }));
          setNewSignerEmail('');
          setShowAddSigner(false);
          toast({
            title: "Signer Added",
            description: "New signer has been added to your multi-signature setup.",
          });
        }
      }
    } catch (error) {
      console.error('Error adding signer:', error);
      toast({
        title: "Failed to Add Signer",
        description: "Unable to add signer. Please check the email and try again.",
        variant: "destructive"
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Key className="w-4 h-4" />;
      case 'transaction':
        return <CreditCard className="w-4 h-4" />;
      case 'device_added':
        return <Smartphone className="w-4 h-4" />;
      case 'security_change':
        return <Settings className="w-4 h-4" />;
      case 'suspicious_activity':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!securityConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced Security Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant={activeTab === 'devices' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('devices')}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Devices
            </Button>
            <Button
              variant={activeTab === 'multisig' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('multisig')}
            >
              <Users className="w-4 h-4 mr-2" />
              Multi-Signature
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('activity')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
          </div>

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dailyLimit">Daily Limit (ZAR)</Label>
                      <Input
                        id="dailyLimit"
                        type="number"
                        value={securityConfig.dailyLimit}
                        onChange={(e) => updateSecurityConfig({ dailyLimit: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyLimit">Monthly Limit (ZAR)</Label>
                      <Input
                        id="monthlyLimit"
                        type="number"
                        value={securityConfig.monthlyLimit}
                        onChange={(e) => updateSecurityConfig({ monthlyLimit: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentication Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Hardware Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Require hardware security keys for transactions
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.requireHardwareAuth}
                      onCheckedChange={(checked) => updateSecurityConfig({ requireHardwareAuth: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">2FA for High-Value Transactions</div>
                      <div className="text-sm text-muted-foreground">
                        Require two-factor authentication for transactions above threshold
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.require2FAForHighValue}
                      onCheckedChange={(checked) => updateSecurityConfig({ require2FAForHighValue: checked })}
                    />
                  </div>

                  {securityConfig.require2FAForHighValue && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="highValueThreshold">High-Value Threshold (ZAR)</Label>
                      <Input
                        id="highValueThreshold"
                        type="number"
                        value={securityConfig.highValueThreshold}
                        onChange={(e) => updateSecurityConfig({ highValueThreshold: parseFloat(e.target.value) })}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securityConfig.sessionTimeoutMinutes}
                      onChange={(e) => updateSecurityConfig({ sessionTimeoutMinutes: parseInt(e.target.value) })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">AI Fraud Detection</div>
                      <div className="text-sm text-muted-foreground">
                        Use machine learning to detect suspicious transactions
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.enableFraudDetection}
                      onCheckedChange={(checked) => updateSecurityConfig({ enableFraudDetection: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Geolocation Checks</div>
                      <div className="text-sm text-muted-foreground">
                        Verify transaction locations against user patterns
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.enableGeolocationChecks}
                      onCheckedChange={(checked) => updateSecurityConfig({ enableGeolocationChecks: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Device Fingerprinting</div>
                      <div className="text-sm text-muted-foreground">
                        Track and verify device characteristics for security
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.enableDeviceFingerprinting}
                      onCheckedChange={(checked) => updateSecurityConfig({ enableDeviceFingerprinting: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Block Suspicious IPs</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically block known malicious IP addresses
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.blockSuspiciousIPs}
                      onCheckedChange={(checked) => updateSecurityConfig({ blockSuspiciousIPs: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trusted Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trustedDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {device.name}
                              {device.isCurrentDevice && (
                                <Badge variant="outline">Current Device</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {device.deviceType} • {device.operatingSystem} • {device.browser}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last used: {new Date(device.lastUsed).toLocaleString()} • {device.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {device.isTrusted ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Trusted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Untrusted
                            </Badge>
                          )}
                          
                          {!device.isCurrentDevice && (
                            <div className="flex gap-2">
                              {!device.isTrusted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeviceAction(device.id, 'trust')}
                                >
                                  Trust
                                </Button>
                              )}
                              {device.isTrusted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeviceAction(device.id, 'revoke')}
                                >
                                  Revoke
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeviceAction(device.id, 'remove')}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Multi-Signature Tab */}
          {activeTab === 'multisig' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Signature Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Multi-Signature</div>
                      <div className="text-sm text-muted-foreground">
                        Require multiple signatures for high-value transactions
                      </div>
                    </div>
                    <Switch
                      checked={securityConfig.multiSigRequired}
                      onCheckedChange={(checked) => updateSecurityConfig({ multiSigRequired: checked })}
                    />
                  </div>

                  {securityConfig.multiSigRequired && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="requiredSignatures">Required Signatures</Label>
                        <Input
                          id="requiredSignatures"
                          type="number"
                          min="2"
                          max={securityConfig.signers.length}
                          value={securityConfig.requiredSignatures}
                          onChange={(e) => updateSecurityConfig({ requiredSignatures: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Authorized Signers</Label>
                          <Button
                            size="sm"
                            onClick={() => setShowAddSigner(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Signer
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {securityConfig.signers.map((signer, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{signer}</span>
                              </div>
                              {securityConfig.signers.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newSigners = securityConfig.signers.filter((_, i) => i !== index);
                                    updateSecurityConfig({ signers: newSigners });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>

                        {showAddSigner && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter email address"
                              value={newSignerEmail}
                              onChange={(e) => setNewSignerEmail(e.target.value)}
                            />
                            <Button onClick={handleAddSigner}>Add</Button>
                            <Button variant="outline" onClick={() => setShowAddSigner(false)}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityEvents.map((event) => (
                      <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{event.description}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                            {(event.location || event.deviceInfo || event.ipAddress) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.location && `${event.location} • `}
                                {event.deviceInfo && `${event.deviceInfo} • `}
                                {event.ipAddress && `IP: ${event.ipAddress}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">Security Best Practices</div>
                <div>Enable all security features for maximum protection. Multi-signature and hardware authentication provide the highest level of security for high-value transactions.</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityEnhancement;
