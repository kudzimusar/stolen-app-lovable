import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface FormData {
  [key: string]: any;
}

interface FormDraft {
  data: FormData;
  timestamp: number;
  formId: string;
  pathname: string;
  sessionId: string;
  autoSaveInterval?: number;
}

interface FormPersistenceOptions {
  formId: string;
  autoSaveInterval?: number; // milliseconds
  enableCloudSync?: boolean;
  warnOnDataLoss?: boolean;
  clearOnSubmit?: boolean;
  persistAcrossSessions?: boolean;
}

// Fallback UUID generator for non-secure contexts
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Global store for form drafts
const formDrafts = new Map<string, FormDraft>();
const sessionId = generateUUID();

export const useFormPersistence = (options: FormPersistenceOptions) => {
  const {
    formId,
    autoSaveInterval = 5000, // 5 seconds
    enableCloudSync = false,
    warnOnDataLoss = true,
    clearOnSubmit = true,
    persistAcrossSessions = true
  } = options;

  const location = useLocation();
  const [formData, setFormData] = useState<FormData>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const initialDataRef = useRef<FormData>({});
  const isRestoringRef = useRef(false);

  // Generate unique storage key
  const getStorageKey = useCallback(() => {
    return `form-draft-${formId}-${location.pathname}`;
  }, [formId, location.pathname]);

  // Save draft to storage
  const saveDraft = useCallback(async (data: FormData, immediate = false) => {
    if (isRestoringRef.current) return;

    const draft: FormDraft = {
      data,
      timestamp: Date.now(),
      formId,
      pathname: location.pathname,
      sessionId,
      autoSaveInterval
    };

    // Save to memory
    formDrafts.set(getStorageKey(), draft);

    // Save to localStorage for session persistence
    if (persistAcrossSessions) {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(draft));
      } catch (error) {
        console.warn('Failed to save form draft to localStorage:', error);
      }
    }

    // Save to sessionStorage for tab persistence
    try {
      sessionStorage.setItem(getStorageKey(), JSON.stringify(draft));
    } catch (error) {
      console.warn('Failed to save form draft to sessionStorage:', error);
    }

    // Cloud sync (when implemented)
    if (enableCloudSync) {
      try {
        await syncDraftToCloud(draft);
      } catch (error) {
        console.warn('Failed to sync draft to cloud:', error);
      }
    }

    setLastSaved(new Date());
    
    if (immediate) {
      setIsDirty(false);
    }
  }, [formId, location.pathname, persistAcrossSessions, enableCloudSync, getStorageKey]);

  // Load draft from storage
  const loadDraft = useCallback(async (): Promise<FormData | null> => {
    let draft: FormDraft | null = null;

    // Try memory first
    draft = formDrafts.get(getStorageKey()) || null;

    // Try sessionStorage
    if (!draft) {
      try {
        const sessionData = sessionStorage.getItem(getStorageKey());
        if (sessionData) {
          draft = JSON.parse(sessionData);
        }
      } catch (error) {
        console.warn('Failed to load draft from sessionStorage:', error);
      }
    }

    // Try localStorage for session persistence
    if (!draft && persistAcrossSessions) {
      try {
        const localData = localStorage.getItem(getStorageKey());
        if (localData) {
          draft = JSON.parse(localData);
        }
      } catch (error) {
        console.warn('Failed to load draft from localStorage:', error);
      }
    }

    // Try cloud sync
    if (!draft && enableCloudSync) {
      try {
        draft = await getDraftFromCloud(formId, location.pathname);
      } catch (error) {
        console.warn('Failed to load draft from cloud:', error);
      }
    }

    return draft?.data || null;
  }, [formId, location.pathname, persistAcrossSessions, enableCloudSync, getStorageKey]);

  // Clear draft from all storage
  const clearDraft = useCallback(async () => {
    const storageKey = getStorageKey();
    
    // Clear from memory
    formDrafts.delete(storageKey);
    
    // Clear from storage
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear draft from storage:', error);
    }

    // Clear from cloud
    if (enableCloudSync) {
      try {
        await clearDraftFromCloud(formId, location.pathname);
      } catch (error) {
        console.warn('Failed to clear draft from cloud:', error);
      }
    }

    setIsDirty(false);
    setHasUnsavedChanges(false);
    setLastSaved(null);
  }, [formId, location.pathname, enableCloudSync, getStorageKey]);

  // Update form data with auto-save
  const updateFormData = useCallback((updates: Partial<FormData> | ((prev: FormData) => FormData)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      
      // Check if data has changed
      const hasChanged = JSON.stringify(newData) !== JSON.stringify(initialDataRef.current);
      setIsDirty(hasChanged);
      setHasUnsavedChanges(hasChanged);

      // Schedule auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      if (hasChanged) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          saveDraft(newData);
        }, autoSaveInterval);
      }

      return newData;
    });
  }, [autoSaveInterval, saveDraft]);

  // Manual save
  const saveNow = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    saveDraft(formData, true);
  }, [formData, saveDraft]);

  // Submit form and optionally clear draft
  const submitForm = useCallback(async (onSubmit: (data: FormData) => Promise<void> | void) => {
    try {
      await onSubmit(formData);
      
      if (clearOnSubmit) {
        await clearDraft();
        initialDataRef.current = {};
        setFormData({});
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error;
    }
  }, [formData, clearOnSubmit, clearDraft]);

  // Reset form to initial state
  const resetForm = useCallback(async () => {
    await clearDraft();
    setFormData(initialDataRef.current);
    setIsDirty(false);
    setHasUnsavedChanges(false);
  }, [clearDraft]);

  // Check for unsaved changes before navigation
  const checkUnsavedChanges = useCallback(() => {
    return hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Load draft on mount
  useEffect(() => {
    const loadInitialData = async () => {
      isRestoringRef.current = true;
      
      try {
        const draftData = await loadDraft();
        if (draftData && Object.keys(draftData).length > 0) {
          setFormData(draftData);
          setHasUnsavedChanges(true);
          setIsDirty(true);
        }
      } catch (error) {
        console.warn('Failed to load initial draft:', error);
      } finally {
        isRestoringRef.current = false;
      }
    };

    loadInitialData();
  }, [loadDraft]);

  // Set up beforeunload warning
  useEffect(() => {
    if (!warnOnDataLoss) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        
        // Save draft before leaving
        saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, warnOnDataLoss, saveNow]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Save final state
      if (isDirty) {
        saveDraft(formData, true);
      }
    };
  }, [isDirty, formData, saveDraft]);

  return {
    formData,
    updateFormData,
    saveNow,
    clearDraft,
    resetForm,
    submitForm,
    checkUnsavedChanges,
    isDirty,
    hasUnsavedChanges,
    lastSaved,
    // Helper for individual field updates
    updateField: (fieldName: string, value: any) => {
      updateFormData({ [fieldName]: value });
    },
    // Helper for multiple field updates
    updateFields: (fields: Record<string, any>) => {
      updateFormData(fields);
    }
  };
};

// Cloud sync functions (placeholder for future implementation)
async function syncDraftToCloud(draft: FormDraft) {
  // TODO: Implement with Supabase
  // await supabase.from('form_drafts').upsert({
  //   user_id: userId,
  //   form_id: draft.formId,
  //   pathname: draft.pathname,
  //   data: draft.data,
  //   session_id: draft.sessionId,
  //   updated_at: new Date(draft.timestamp)
  // });
}

async function getDraftFromCloud(formId: string, pathname: string): Promise<FormDraft | null> {
  // TODO: Implement with Supabase
  // const { data } = await supabase
  //   .from('form_drafts')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .eq('form_id', formId)
  //   .eq('pathname', pathname)
  //   .order('updated_at', { ascending: false })
  //   .limit(1)
  //   .single();
  // return data || null;
  return null;
}

async function clearDraftFromCloud(formId: string, pathname: string) {
  // TODO: Implement with Supabase
  // await supabase
  //   .from('form_drafts')
  //   .delete()
  //   .eq('user_id', userId)
  //   .eq('form_id', formId)
  //   .eq('pathname', pathname);
}

