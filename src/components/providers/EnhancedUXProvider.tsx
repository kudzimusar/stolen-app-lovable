import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEnhancedScrollMemory } from '@/hooks/useEnhancedScrollMemory';
import { useCrossDeviceContinuity } from '@/hooks/useCrossDeviceContinuity';
import { FloatingScrollControls } from '@/components/ui/FloatingScrollControls';
import { AIPageSearch } from '@/components/ui/AIPageSearch';
import { PageTransition, injectMicroAnimationStyles } from '@/components/ui/MicroAnimations';
import { useToast } from '@/hooks/use-toast';

interface EnhancedUXContextType {
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollToPosition: (x: number, y: number, smooth?: boolean) => void;
  saveScrollPosition: () => void;
  isScrollMemoryEnabled: boolean;
  toggleScrollMemory: (enabled: boolean) => void;
  currentSession: any;
  connectedDevices: any[];
  continueFromDevice: (session: any) => void;
  isOnline: boolean;
}

const EnhancedUXContext = createContext<EnhancedUXContextType | undefined>(undefined);

export const useEnhancedUX = () => {
  const context = useContext(EnhancedUXContext);
  if (!context) {
    throw new Error('useEnhancedUX must be used within an EnhancedUXProvider');
  }
  return context;
};

interface EnhancedUXProviderProps {
  children: React.ReactNode;
  enableScrollMemory?: boolean;
  enableCrossDeviceSync?: boolean;
  enableFloatingControls?: boolean;
  enablePageSearch?: boolean;
  enableMicroAnimations?: boolean;
  enableFormPersistence?: boolean;
  scrollControlsPosition?: 'left' | 'right';
}

export const EnhancedUXProvider: React.FC<EnhancedUXProviderProps> = ({
  children,
  enableScrollMemory = true,
  enableCrossDeviceSync = true,
  enableFloatingControls = true,
  enablePageSearch = true,
  enableMicroAnimations = true,
  enableFormPersistence = true,
  scrollControlsPosition = 'right'
}) => {
  const location = useLocation();
  const { toast } = useToast();
  const [isScrollMemoryEnabled, setIsScrollMemoryEnabled] = useState(enableScrollMemory);

  // Enhanced scroll memory
  const {
    savePosition,
    scrollToTop,
    scrollToBottom,
    scrollToPosition
  } = useEnhancedScrollMemory({
    enabled: isScrollMemoryEnabled,
    persistAcrossSessions: true,
    syncAcrossDevices: enableCrossDeviceSync
  });

  // Cross-device continuity
  const {
    currentSession,
    connectedDevices,
    continueFromDevice,
    isOnline
  } = useCrossDeviceContinuity({
    enabled: enableCrossDeviceSync,
    autoSync: true,
    onDeviceSwitch: (previousDevice) => {
      toast({
        title: "Continued from another device",
        description: `Resumed your session from ${getDeviceName(previousDevice.userAgent)}`,
        duration: 5000
      });
    }
  });

  // Initialize micro-animations
  useEffect(() => {
    if (enableMicroAnimations) {
      injectMicroAnimationStyles();
    }
  }, [enableMicroAnimations]);

  // Auto-save scroll position on route changes
  useEffect(() => {
    if (isScrollMemoryEnabled) {
      savePosition();
    }
  }, [location.pathname, isScrollMemoryEnabled, savePosition]);

  // Show UX enhancement notifications
  useEffect(() => {
    // Show enhancement status on mount (only once per session)
    const hasShownWelcome = sessionStorage.getItem('ux-enhancements-shown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        toast({
          title: "Enhanced UX Active",
          description: "Scroll memory, form auto-save, and cross-device sync are enabled",
          duration: 4000
        });
        sessionStorage.setItem('ux-enhancements-shown', 'true');
      }, 2000);
    }
  }, [toast]);

  // Keyboard shortcuts for UX features
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for page search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && enablePageSearch) {
        e.preventDefault();
        // Trigger page search (implementation depends on AIPageSearch component)
        const searchButton = document.querySelector('[aria-label="Search in page"]') as HTMLButtonElement;
        searchButton?.click();
      }

      // Ctrl/Cmd + Shift + T for scroll to top
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        scrollToTop();
      }

      // Ctrl/Cmd + Shift + B for scroll to bottom
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        scrollToBottom();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enablePageSearch, scrollToTop, scrollToBottom]);

  // Auto-detect and warn about form data loss
  useEffect(() => {
    if (!enableFormPersistence) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check for unsaved form data
      const forms = document.querySelectorAll('form');
      let hasUnsavedData = false;

      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          if (element.value && element.value.trim() !== '' && !element.readOnly && !element.disabled) {
            hasUnsavedData = true;
          }
        });
      });

      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enableFormPersistence]);

  const toggleScrollMemory = (enabled: boolean) => {
    setIsScrollMemoryEnabled(enabled);
    toast({
      title: enabled ? "Scroll Memory Enabled" : "Scroll Memory Disabled",
      description: enabled 
        ? "Your scroll position will be remembered across pages" 
        : "Scroll position will not be saved",
      duration: 3000
    });
  };

  const getDeviceName = (userAgent: string): string => {
    if (/iPhone/.test(userAgent)) return 'iPhone';
    if (/iPad/.test(userAgent)) return 'iPad';
    if (/Android/.test(userAgent)) return 'Android Device';
    if (/Mac/.test(userAgent)) return 'Mac';
    if (/Windows/.test(userAgent)) return 'Windows PC';
    return 'Other Device';
  };

  const contextValue: EnhancedUXContextType = {
    scrollToTop,
    scrollToBottom,
    scrollToPosition,
    saveScrollPosition: savePosition,
    isScrollMemoryEnabled,
    toggleScrollMemory,
    currentSession,
    connectedDevices,
    continueFromDevice,
    isOnline
  };

  return (
    <EnhancedUXContext.Provider value={contextValue}>
      {enableMicroAnimations ? (
        <PageTransition>
          {children}
        </PageTransition>
      ) : (
        children
      )}
      
      {/* Floating scroll controls */}
      {enableFloatingControls && (
        <FloatingScrollControls
          position={scrollControlsPosition}
          showProgress={true}
          smoothScroll={true}
        />
      )}
      
      {/* AI-powered page search */}
      {enablePageSearch && (
        <AIPageSearch
          enableVoiceSearch={true}
          enableAIEnhancement={true}
          maxResults={10}
        />
      )}
    </EnhancedUXContext.Provider>
  );
};

// Utility hook for form persistence in any component
export const useFormPersistence = (formId: string) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  // Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem(`form-draft-${formId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.data || {});
        if (Object.keys(parsed.data || {}).length > 0) {
          toast({
            title: "Draft restored",
            description: "Your previous work has been restored",
            duration: 3000
          });
        }
      } catch (error) {
        console.warn('Failed to restore form data:', error);
      }
    }
  }, [formId, toast]);

  // Auto-save form data
  const updateFormData = (updates: Record<string, any>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    setIsDirty(true);

    // Auto-save to localStorage
    const draftData = {
      data: newData,
      timestamp: Date.now(),
      formId
    };
    
    try {
      localStorage.setItem(`form-draft-${formId}`, JSON.stringify(draftData));
    } catch (error) {
      console.warn('Failed to save form draft:', error);
    }
  };

  // Clear form data
  const clearFormData = () => {
    setFormData({});
    setIsDirty(false);
    localStorage.removeItem(`form-draft-${formId}`);
  };

  // Submit and clear
  const submitAndClear = () => {
    setIsDirty(false);
    localStorage.removeItem(`form-draft-${formId}`);
  };

  return {
    formData,
    updateFormData,
    clearFormData,
    submitAndClear,
    isDirty
  };
};

// Settings component for UX preferences
export const UXSettings: React.FC = () => {
  const { 
    isScrollMemoryEnabled, 
    toggleScrollMemory, 
    isOnline,
    connectedDevices 
  } = useEnhancedUX();

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold">UX Enhancements</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Scroll Memory</div>
            <div className="text-sm text-muted-foreground">
              Remember scroll position across pages
            </div>
          </div>
          <button
            onClick={() => toggleScrollMemory(!isScrollMemoryEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isScrollMemoryEnabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isScrollMemoryEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Cross-Device Sync</div>
            <div className="text-sm text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'} • {connectedDevices.length} devices
            </div>
          </div>
          <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
      </div>
    </div>
  );
};

