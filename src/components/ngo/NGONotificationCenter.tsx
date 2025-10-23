import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Clock, Heart, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/lib/auth'

interface NGONotification {
  id: string
  notification_type: string
  title: string
  message: string
  feature_data: any
  priority_level: number
  created_at: string
  read_at: string | null
  action_link: string | null
}

export const NGONotificationCenter = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NGONotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch NGO notifications
  const fetchNotifications = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_category', 'ngo')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching NGO notifications:', error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read_at).length || 0)
    } catch (error) {
      console.error('Error fetching NGO notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('feature_category', 'ngo')
        .is('read_at', null)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'donation_received':
        return <Heart className="w-4 h-4 text-green-600" />
      case 'impact_update':
        return <Users className="w-4 h-4 text-blue-600" />
      case 'program_update':
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      case 'volunteer_opportunity':
        return <Users className="w-4 h-4 text-orange-600" />
      case 'funding_alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'beneficiary_update':
        return <Heart className="w-4 h-4 text-green-600" />
      case 'event_reminder':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'reporting_deadline':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      default:
        return <Heart className="w-4 h-4 text-gray-600" />
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) return <Badge variant="destructive" className="text-xs">High</Badge>
    if (priority >= 5) return <Badge variant="default" className="text-xs">Medium</Badge>
    return <Badge variant="secondary" className="text-xs">Low</Badge>
  }

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return

    fetchNotifications()

    // Set up real-time subscription for NGO notifications
    const channel = supabase
      .channel('ngo_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as NGONotification
          if (newNotification.feature_category === 'ngo') {
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  if (loading) {
    return (
      <div className="relative">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">NGO Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No NGO notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                        !notification.read_at ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1">
                              {getPriorityBadge(notification.priority_level)}
                              {!notification.read_at && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(notification.created_at)}
                            </span>
                            {notification.action_link && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(notification.action_link, '_blank')
                                }}
                              >
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
