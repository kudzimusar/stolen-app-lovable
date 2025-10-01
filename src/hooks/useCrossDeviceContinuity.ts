import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { generateUUID } from '../lib/utils';

interface UserSession {
  deviceId: string;
  sessionId: string;
  lastPage: string;
  lastAction: string;
  scrollPosition: { x: number; y: number };
  formData: Record<string, any>;
  timestamp: number;
  userAgent: string;
  screenSize: { width: number; height: number };
}

interface DeviceContinuityOptions {
  enabled?: boolean;
  syncInterval?: number; // milliseconds
  cloudSync?: boolean;
  autoSync?: boolean;
  onDeviceSwitch?: (previousDevice: UserSession) => void;
}

// Device fingerprinting for better continuity
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 32);
};

const deviceId = localStorage.getItem('device-id') || generateDeviceFingerprint();
const sessionId = generateUUID();

// Store device ID
if (!localStorage.getItem('device-id')) {
  localStorage.setItem('device-id', deviceId);
}

export const useCrossDeviceContinuity = (options: DeviceContinuityOptions = {}) => {
  const {
    enabled = true,
    syncInterval = 30000, // 30 seconds
    cloudSync = false,
    autoSync = true,
    onDeviceSwitch
  } = options;

  const location = useLocation();
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<UserSession[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Get current session data
  const getCurrentSession = useCallback((): UserSession => {
    return {
      deviceId,
      sessionId,
      lastPage: location.pathname,
      lastAction: `viewed_${location.pathname}`,
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      },
      formData: getFormDataFromStorage(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }, [location.pathname]);

  // Get form data from storage
  const getFormDataFromStorage = (): Record<string, any> => {
    const formData: Record<string, any> = {};
    
    // Collect form drafts from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('form-draft-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          formData[key] = data;
        } catch (error) {
          console.warn('Failed to parse form draft:', key, error);
        }
      }
    }
    
    return formData;
  };

  // Save session to local storage
  const saveSessionLocally = useCallback((session: UserSession) => {
    try {
      localStorage.setItem('current-session', JSON.stringify(session));
      localStorage.setItem(`session-${deviceId}`, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to save session locally:', error);
    }
  }, []);

  // Sync session to cloud (placeholder for Supabase integration)
  const syncSessionToCloud = useCallback(async (session: UserSession) => {
    if (!cloudSync || !isOnline) return;

    try {
      // TODO: Implement with Supabase
      await syncUserSessionToCloud(session);
    } catch (error) {
      console.warn('Failed to sync session to cloud:', error);
    }
  }, [cloudSync, isOnline]);

  // Load session from other devices
  const loadOtherDeviceSessions = useCallback(async (): Promise<UserSession[]> => {
    const sessions: UserSession[] = [];

    // Load from localStorage (same browser, different tabs)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('session-') && key !== `session-${deviceId}`) {
        try {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            // Only include recent sessions (last 24 hours)
            if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
              sessions.push(session);
            }
          }
        } catch (error) {
          console.warn('Failed to parse session:', key, error);
        }
      }
    }

    // Load from cloud (different devices)
    if (cloudSync && isOnline) {
      try {
        const cloudSessions = await getUserSessionsFromCloud();
        sessions.push(...cloudSessions.filter(s => s.deviceId !== deviceId));
      } catch (error) {
        console.warn('Failed to load sessions from cloud:', error);
      }
    }

    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }, [cloudSync, isOnline]);

  // Continue from another device
  const continueFromDevice = useCallback(async (targetSession: UserSession) => {
    try {
      // Navigate to the same page
      if (targetSession.lastPage !== location.pathname) {
        window.location.href = targetSession.lastPage;
        return;
      }

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({
          left: targetSession.scrollPosition.x,
          top: targetSession.scrollPosition.y,
          behavior: 'smooth'
        });
      }, 500);

      // Restore form data
      Object.entries(targetSession.formData).forEach(([key, data]) => {
        localStorage.setItem(key, JSON.stringify(data));
      });

      // Trigger callback
      onDeviceSwitch?.(targetSession);

      // Show notification
      showContinuityNotification(targetSession);

    } catch (error) {
      console.error('Failed to continue from device:', error);
    }
  }, [location.pathname, onDeviceSwitch]);

  // Show notification about device switch
  const showContinuityNotification = (session: UserSession) => {
    const deviceName = getDeviceName(session.userAgent);
    const timeAgo = getTimeAgo(session.timestamp);
    
    // Create and show a notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Continued from another device', {
        body: `Resumed from ${deviceName} (${timeAgo})`,
        icon: '/favicon.ico'
      });
    }
    
    // Also show an in-app toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>📱</span>
        <div>
          <div class="font-medium">Continued from ${deviceName}</div>
          <div class="text-sm opacity-90">${timeAgo}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 5000);
  };

  // Utility functions
  const getDeviceName = (userAgent: string): string => {
    if (/iPhone/.test(userAgent)) return 'iPhone';
    if (/iPad/.test(userAgent)) return 'iPad';
    if (/Android/.test(userAgent)) return 'Android Device';
    if (/Mac/.test(userAgent)) return 'Mac';
    if (/Windows/.test(userAgent)) return 'Windows PC';
    return 'Other Device';
  };

  const getTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Auto-sync current session
  const autoSyncSession = useCallback(() => {
    if (!enabled || !autoSync) return;

    const session = getCurrentSession();
    setCurrentSession(session);
    saveSessionLocally(session);
    
    if (cloudSync) {
      syncSessionToCloud(session);
    }
  }, [enabled, autoSync, cloudSync, getCurrentSession, saveSessionLocally, syncSessionToCloud]);

  // Check for other device sessions on mount
  useEffect(() => {
    if (!enabled) return;

    const checkOtherDevices = async () => {
      const otherSessions = await loadOtherDeviceSessions();
      setConnectedDevices(otherSessions);

      // Auto-continue from the most recent session if it's very recent (< 5 minutes)
      const mostRecent = otherSessions[0];
      if (mostRecent && Date.now() - mostRecent.timestamp < 5 * 60 * 1000) {
        // Ask user if they want to continue
        const shouldContinue = window.confirm(
          `Continue from ${getDeviceName(mostRecent.userAgent)}? You were last on ${mostRecent.lastPage}`
        );
        
        if (shouldContinue) {
          continueFromDevice(mostRecent);
        }
      }
    };

    checkOtherDevices();
  }, [enabled, loadOtherDeviceSessions, continueFromDevice]);

  // Set up auto-sync interval
  useEffect(() => {
    if (!enabled || !autoSync) return;

    const interval = setInterval(autoSyncSession, syncInterval);
    return () => clearInterval(interval);
  }, [enabled, autoSync, syncInterval, autoSyncSession]);

  // Sync on page change
  useEffect(() => {
    if (!enabled) return;
    
    autoSyncSession();
  }, [location.pathname, enabled, autoSyncSession]);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync on before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled) {
        autoSyncSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, autoSyncSession]);

  return {
    currentSession,
    connectedDevices,
    isOnline,
    continueFromDevice,
    syncNow: autoSyncSession,
    loadOtherDevices: loadOtherDeviceSessions
  };
};

// Cloud sync functions (placeholder for Supabase integration)
async function syncUserSessionToCloud(session: UserSession) {
  // TODO: Implement with Supabase
  // const { data, error } = await supabase
  //   .from('user_sessions')
  //   .upsert({
  //     user_id: userId,
  //     device_id: session.deviceId,
  //     session_id: session.sessionId,
  //     last_page: session.lastPage,
  //     last_action: session.lastAction,
  //     scroll_position: session.scrollPosition,
  //     form_data: session.formData,
  //     user_agent: session.userAgent,
  //     screen_size: session.screenSize,
  //     updated_at: new Date(session.timestamp)
  //   });
  // 
  // if (error) throw error;
}

async function getUserSessionsFromCloud(): Promise<UserSession[]> {
  // TODO: Implement with Supabase
  // const { data, error } = await supabase
  //   .from('user_sessions')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  //   .order('updated_at', { ascending: false });
  // 
  // if (error) throw error;
  // 
  // return data.map(session => ({
  //   deviceId: session.device_id,
  //   sessionId: session.session_id,
  //   lastPage: session.last_page,
  //   lastAction: session.last_action,
  //   scrollPosition: session.scroll_position,
  //   formData: session.form_data,
  //   timestamp: new Date(session.updated_at).getTime(),
  //   userAgent: session.user_agent,
  //   screenSize: session.screen_size
  // }));
  
  return [];
}

