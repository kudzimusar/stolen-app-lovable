import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

// Global store for scroll positions
const scrollPositions = new Map<string, ScrollPosition>();

export const useScrollMemory = (enabled: boolean = true) => {
  const location = useLocation();
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const isRestoringRef = useRef(false);

  // Save scroll position when leaving the page
  const saveScrollPosition = () => {
    if (!enabled) return;
    
    const scrollElement = scrollElementRef.current || document.documentElement;
    const position: ScrollPosition = {
      x: scrollElement.scrollLeft || window.scrollX,
      y: scrollElement.scrollTop || window.scrollY,
      timestamp: Date.now()
    };
    
    scrollPositions.set(location.pathname, position);
    
    // Optional: Store in sessionStorage for persistence across refreshes
    try {
      sessionStorage.setItem(
        `scroll-${location.pathname}`, 
        JSON.stringify(position)
      );
    } catch (error) {
      console.warn('Failed to save scroll position to sessionStorage:', error);
    }
  };

  // Restore scroll position when entering the page
  const restoreScrollPosition = () => {
    if (!enabled || isRestoringRef.current) return;
    
    let savedPosition = scrollPositions.get(location.pathname);
    
    // Fallback to sessionStorage if not in memory
    if (!savedPosition) {
      try {
        const stored = sessionStorage.getItem(`scroll-${location.pathname}`);
        if (stored) {
          savedPosition = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to restore scroll position from sessionStorage:', error);
      }
    }
    
    if (savedPosition) {
      isRestoringRef.current = true;
      const scrollElement = scrollElementRef.current || document.documentElement;
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollElement === document.documentElement) {
            window.scrollTo({
              left: savedPosition!.x,
              top: savedPosition!.y,
              behavior: 'auto' // Instant restore
            });
          } else {
            scrollElement.scrollLeft = savedPosition!.x;
            scrollElement.scrollTop = savedPosition!.y;
          }
          isRestoringRef.current = false;
        }, 50); // Small delay to ensure content is rendered
      });
    }
  };

  // Save position before navigation
  useEffect(() => {
    const handleBeforeUnload = () => saveScrollPosition();
    
    // Save on navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Save on route change (for SPA navigation)
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname]);

  // Restore position on mount and route change
  useEffect(() => {
    // Small delay to ensure content is loaded
    const timer = setTimeout(restoreScrollPosition, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Manual save function for specific events
  const savePosition = () => saveScrollPosition();
  
  // Manual restore function
  const restorePosition = () => restoreScrollPosition();

  // Clear stored position for current path
  const clearPosition = () => {
    scrollPositions.delete(location.pathname);
    try {
      sessionStorage.removeItem(`scroll-${location.pathname}`);
    } catch (error) {
      console.warn('Failed to clear scroll position:', error);
    }
  };

  return {
    savePosition,
    restorePosition,
    clearPosition,
    setScrollElement: (element: HTMLElement | null) => {
      scrollElementRef.current = element;
    }
  };
};

