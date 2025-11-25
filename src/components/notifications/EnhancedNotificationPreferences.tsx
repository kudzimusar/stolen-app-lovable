import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface NotificationPreference {
  feature_category: string
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  frequency: string
}

interface FeatureConfig {
  category: string
  name: string
  description: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

const FEATURE_CONFIGS: FeatureConfig[] = [
  {
    category: 'device_management',
    name: 'Device Alerts',
    description: 'Stolen device matches and recovery updates',
    icon: <Bell className="w-4 h-4" />,
    priority: 'high'
  },
  {
    category: 'marketplace',
    name: 'Marketplace Offers',
    description: 'New listings and price alerts',
    icon: <Bell className="w-4 h-4" />,
    priority: 'medium'
  },
  {
    category: 'security',
    name: 'Security Alerts',
    description: 'Account security and fraud warnings',
    icon: <Bell className="w-4 h-4" />,
    priority: 'high'
  },
  {
    category: 'payment',
    name: 'Payment Notifications',
    description: 'Transaction updates and wallet alerts',
    icon: <Bell className="w-4 h-4" />,
    priority: 'high'
  },
  {
    category: 'insurance',
    name: 'Insurance Updates',
    description: 'Claim status and policy notifications',
    icon: <Bell className="w-4 h-4" />,
    priority: 'medium'
  },
  {
    category: 'repair_services',
    name: 'Repair Services',
    description: 'Booking confirmations and repair updates',
    icon: <Bell className="w-4 h-4" />,
    priority: 'medium'
  },
  {
    category: 'community',
    name: 'Community Updates',
    description: 'Lost and found posts in your area',
    icon: <Bell className="w-4 h-4" />,
    priority: 'low'
  },
  {
    category: 'hot_deals',
    name: 'Hot Deals',
    description: 'Flash sales and exclusive offers',
    icon: <Bell className="w-4 h-4" />,
    priority: 'medium'
  },
  {
    category: 'admin',
    name: 'Admin Notifications',
    description: 'System alerts and administrative updates',
    icon: <Bell className="w-4 h-4" />,
    priority: 'high'
  },
  {
    category: 'support',
    name: 'Support Updates',
    description: 'Help desk and customer service notifications',
    icon: <Bell className="w-4 h-4" />,
    priority: 'medium'
  }
]

export const EnhancedNotificationPreferences = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<Record<string, NotificationPreference>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadPreferences()
    }
  }, [user?.id])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error loading preferences:', error)
        toast.error('Failed to load notification preferences')
        return
      }

      // Convert array to object keyed by feature_category
      const prefsMap: Record<string, NotificationPreference> = {}
      data?.forEach(pref => {
        prefsMap[pref.feature_category] = pref
      })

      // Ensure all features have default preferences
      FEATURE_CONFIGS.forEach(config => {
        if (!prefsMap[config.category]) {
          prefsMap[config.category] = {
            feature_category: config.category,
            email_enabled: true,
            sms_enabled: false,
            push_enabled: true,
            in_app_enabled: true,
            frequency: 'immediate'
          }
        }
      })

      setPreferences(prefsMap)
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (feature: string, field: keyof NotificationPreference, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const savePreferences = async () => {
    if (!user?.id) return

    try {
      setSaving(true)
      
      // Prepare upsert data
      const upsertData = Object.values(preferences).map(pref => ({
        user_id: user.id,
        feature_category: pref.feature_category,
        email_enabled: pref.email_enabled,
        sms_enabled: pref.sms_enabled,
        push_enabled: pref.push_enabled,
        in_app_enabled: pref.in_app_enabled,
        frequency: pref.frequency
      }))

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(upsertData, { 
          onConflict: 'user_id,feature_category',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error saving preferences:', error)
        toast.error('Failed to save notification preferences')
        return
      }

      toast.success('Notification preferences saved successfully!')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Loading your notification settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Customize how you receive notifications for different features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {FEATURE_CONFIGS.map((config) => {
          const pref = preferences[config.category]
          if (!pref) return null

          return (
            <div key={config.category} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {config.icon}
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {config.name}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(config.priority)}`}
                      >
                        {config.priority} priority
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${config.category}-in-app`}
                    checked={pref.in_app_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(config.category, 'in_app_enabled', checked)
                    }
                  />
                  <Label htmlFor={`${config.category}-in-app`} className="text-sm">
                    In-App
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${config.category}-email`}
                    checked={pref.email_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(config.category, 'email_enabled', checked)
                    }
                  />
                  <Label htmlFor={`${config.category}-email`} className="text-sm">
                    Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${config.category}-push`}
                    checked={pref.push_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(config.category, 'push_enabled', checked)
                    }
                  />
                  <Label htmlFor={`${config.category}-push`} className="text-sm">
                    Push
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${config.category}-sms`}
                    checked={pref.sms_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(config.category, 'sms_enabled', checked)
                    }
                  />
                  <Label htmlFor={`${config.category}-sms`} className="text-sm">
                    SMS
                  </Label>
                </div>
              </div>
            </div>
          )
        })}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">All changes saved</span>
              </div>
            )}
          </div>

          <Button 
            onClick={savePreferences}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}







