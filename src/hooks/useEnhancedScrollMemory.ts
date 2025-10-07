import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { generateUUID } from '../lib/utils';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
  sessionId?: string;
  deviceId?: string;
}

interface ScrollMemoryOptions {
  enabled?: boolean;
  persistAcrossSessions?: boolean;
  syncAcrossDevices?: boolean;
  saveToCloud?: boolean;
  elementSelector?: string;
}

// Enhanced global store for scroll positions
const scrollPositions = new Map<string, ScrollPosition>();
const sessionId = generateUUID();
const deviceId = localStorage.getItem('device-id') || generateUUID();

// Store device ID for session continuity
if (!localStorage.getItem('device-id')) {
  localStorage.setItem('device-id', deviceId);
}

export const useEnhancedScrollMemory = (options: ScrollMemoryOptions = {}) => {
  const {
    enabled = true,
    persistAcrossSessions = true,
    syncAcrossDevices = false,
    saveToCloud = false,
    elementSelector
  } = options;

  const location = useLocation();
  const navigationType = useNavigationType();
  const locationRef = useRef(location);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const isRestoringRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Keep location ref updated synchronously - no useEffect needed
  locationRef.current = location;

  // Get scroll element
  const getScrollElement = useCallback(() => {
    if (elementSelector) {
      return document.querySelector(elementSelector) as HTMLElement;
    }
    return scrollElementRef.current || document.documentElement;
  }, [elementSelector]);

  // Enhanced save with cloud sync capability - using ref to avoid dependency loop
  const saveScrollPosition = useCallback(async () => {
    if (!enabled) return;
    
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const position: ScrollPosition = {
      x: scrollElement.scrollLeft || window.scrollX,
      y: scrollElement.scrollTop || window.scrollY,
      timestamp: Date.now(),
      sessionId,
      deviceId
    };
    
    // Save to memory using current location from ref
    scrollPositions.set(locationRef.current.pathname, position);
    
    // Save to localStorage for session persistence
    if (persistAcrossSessions) {
      try {
        const storageKey = `scroll-memory-${locationRef.current.pathname}`;
        localStorage.setItem(storageKey, JSON.stringify(position));
        
        // Also save to session history for back/forward navigation
        sessionStorage.setItem(`scroll-session-${locationRef.current.pathname}`, JSON.stringify(position));
      } catch (error) {
        console.warn('Failed to save scroll position to storage:', error);
      }
    }

    // Cloud sync for cross-device continuity (when implemented)
    if (saveToCloud && syncAcrossDevices) {
      try {
        // TODO: Implement cloud sync with Supabase
        await syncScrollPositionToCloud(locationRef.current.pathname, position);
      } catch (error) {
        console.warn('Failed to sync scroll position to cloud:', error);
      }
    }
  }, [enabled, persistAcrossSessions, saveToCloud, syncAcrossDevices, getScrollElement]);

  // Enhanced restore with cloud sync
  const restoreScrollPosition = useCallback(async () => {
    if (!enabled || isRestoringRef.current) return;
    
    let savedPosition: ScrollPosition | null = null;

    // Try to get from memory first
    savedPosition = scrollPositions.get(location.pathname) || null;

    // Try session storage for back/forward navigation
    if (!savedPosition && navigationType === 'POP') {
      try {
        const sessionData = sessionStorage.getItem(`scroll-session-${location.pathname}`);
        if (sessionData) {
          savedPosition = JSON.parse(sessionData);
        }
      } catch (error) {
        console.warn('Failed to restore from session storage:', error);
      }
    }

    // Try localStorage for session persistence
    if (!savedPosition && persistAcrossSessions) {
      try {
        const localData = localStorage.getItem(`scroll-memory-${location.pathname}`);
        if (localData) {
          savedPosition = JSON.parse(localData);
        }
      } catch (error) {
        console.warn('Failed to restore from localStorage:', error);
      }
    }

    // Try cloud sync for cross-device continuity
    if (!savedPosition && syncAcrossDevices) {
      try {
        savedPosition = await getScrollPositionFromCloud(location.pathname);
      } catch (error) {
        console.warn('Failed to restore from cloud:', error);
      }
    }

    // Restore position with smooth animation
    if (savedPosition) {
      isRestoringRef.current = true;
      const scrollElement = getScrollElement();
      
      if (scrollElement) {
        // Use requestAnimationFrame for smooth restoration
        requestAnimationFrame(() => {
          // Add a small delay to ensure content is rendered
          setTimeout(() => {
            if (scrollElement === document.documentElement) {
              window.scrollTo({
                left: savedPosition!.x,
                top: savedPosition!.y,
                behavior: 'auto' // Instant for navigation, smooth for user actions
              });
            } else {
              scrollElement.scrollLeft = savedPosition!.x;
              scrollElement.scrollTop = savedPosition!.y;
            }
            isRestoringRef.current = false;
          }, 100);
        });
      }
    }
  }, [enabled, location.pathname, navigationType, persistAcrossSessions, syncAcrossDevices, getScrollElement]);

  // Debounced save to prevent excessive saving
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveScrollPosition, 500);
  }, [saveScrollPosition]);

  // Manual save function for immediate saving
  const savePositionNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveScrollPosition();
  }, [saveScrollPosition]);

  // Scroll to specific position with animation
  const scrollToPosition = useCallback((x: number, y: number, smooth = true) => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      if (scrollElement === document.documentElement) {
        window.scrollTo({
          left: x,
          top: y,
          behavior: smooth ? 'smooth' : 'auto'
        });
      } else {
        scrollElement.scrollTo({
          left: x,
          top: y,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [getScrollElement]);

  // Scroll to top
  const scrollToTop = useCallback((smooth = true) => {
    scrollToPosition(0, 0, smooth);
  }, [scrollToPosition]);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      const maxY = scrollElement === document.documentElement 
        ? document.body.scrollHeight - window.innerHeight
        : scrollElement.scrollHeight - scrollElement.clientHeight;
      scrollToPosition(0, maxY, smooth);
    }
  }, [getScrollElement, scrollToPosition]);

  // Setup scroll tracking
  useEffect(() => {
    if (!enabled) return;

    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const handleScroll = debouncedSave;
    const handleBeforeUnload = savePositionNow;

    // Add scroll listener
    if (scrollElement === document.documentElement) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Save before page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      if (scrollElement === document.documentElement) {
        window.removeEventListener('scroll', handleScroll);
      } else {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Save before cleanup
      savePositionNow();
    };
  }, [enabled, location.pathname, debouncedSave, savePositionNow, getScrollElement]);

  // Restore position on route change
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(restoreScrollPosition, 150);
    return () => clearTimeout(timer);
  }, [location.pathname, enabled, restoreScrollPosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    savePosition: savePositionNow,
    restorePosition: restoreScrollPosition,
    scrollToTop,
    scrollToBottom,
    scrollToPosition,
    setScrollElement: (element: HTMLElement | null) => {
      scrollElementRef.current = element;
    }
  };
};

// Cloud sync functions (placeholder for future implementation)
async function syncScrollPositionToCloud(pathname: string, position: ScrollPosition) {
  // TODO: Implement with Supabase
  // await supabase.from('user_scroll_positions').upsert({
  //   user_id: userId,
  //   device_id: position.deviceId,
  //   pathname,
  //   position: position,
  //   updated_at: new Date()
  // });
}

async function getScrollPositionFromCloud(pathname: string): Promise<ScrollPosition | null> {
  // TODO: Implement with Supabase
  // const { data } = await supabase
  //   .from('user_scroll_positions')
  //   .select('position')
  //   .eq('user_id', userId)
  //   .eq('pathname', pathname)
  //   .order('updated_at', { ascending: false })
  //   .limit(1)
  //   .single();
  // return data?.position || null;
  return null;
}

