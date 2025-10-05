import { useState, useEffect, useCallback } from 'react';

interface FormPersistenceOptions {
  key: string;
  debounceMs?: number;
  excludeFields?: string[];
}

interface FormData {
  [key: string]: any;
}

export const useFormPersistence = <T extends FormData>(
  initialData: T,
  options: FormPersistenceOptions
) => {
  const { key, debounceMs = 500, excludeFields = [] } = options;
  const storageKey = `form_persistence_${key}`;

  // Load saved data from localStorage
  const loadSavedData = useCallback((): T => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Merge with initial data to ensure all fields exist
        return { ...initialData, ...parsedData };
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
    }
    return initialData;
  }, [storageKey, initialData]);

  const [formData, setFormData] = useState<T>(loadSavedData);

  // Save data to localStorage with debouncing
  const saveData = useCallback((data: T) => {
    try {
      // Filter out excluded fields
      const filteredData = Object.keys(data).reduce((acc, field) => {
        if (!excludeFields.includes(field)) {
          acc[field] = data[field];
        }
        return acc;
      }, {} as Partial<T>);

      localStorage.setItem(storageKey, JSON.stringify(filteredData));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [storageKey, excludeFields]);

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => saveData(data), debounceMs);
      };
    })(),
    [saveData, debounceMs]
  );

  // Update form data and save
  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setFormData(initialData);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  }, [storageKey, initialData]);

  // Get autocomplete suggestions for a field
  const getAutocompleteSuggestions = useCallback((fieldName: string): string[] => {
    try {
      const allFormData = localStorage.getItem('form_autocomplete_data');
      if (allFormData) {
        const parsed = JSON.parse(allFormData);
        const fieldData = parsed[fieldName] || [];
        // Return unique values, most recent first
        return [...new Set(fieldData)].reverse();
      }
    } catch (error) {
      console.warn('Failed to load autocomplete data:', error);
    }
    return [];
  }, []);

  // Save value for autocomplete
  const saveAutocompleteValue = useCallback((fieldName: string, value: string) => {
    if (!value || value.trim() === '') return;
    
    try {
      const allFormData = localStorage.getItem('form_autocomplete_data');
      const parsed = allFormData ? JSON.parse(allFormData) : {};
      
      if (!parsed[fieldName]) {
        parsed[fieldName] = [];
      }
      
      // Add new value and remove duplicates
      const fieldData = parsed[fieldName];
      const filtered = fieldData.filter((item: string) => item !== value);
      parsed[fieldName] = [value, ...filtered].slice(0, 10); // Keep last 10 values
      
      localStorage.setItem('form_autocomplete_data', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to save autocomplete data:', error);
    }
  }, []);

  return {
    formData,
    updateFormData,
    clearSavedData,
    getAutocompleteSuggestions,
    saveAutocompleteValue,
    setFormData: (data: T) => {
      setFormData(data);
      saveData(data);
    }
  };
};

// Global autocomplete hook for individual fields
export const useAutocomplete = (fieldName: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadSuggestions = useCallback(() => {
    try {
      const allFormData = localStorage.getItem('form_autocomplete_data');
      if (allFormData) {
        const parsed = JSON.parse(allFormData);
        const fieldData = parsed[fieldName] || [];
        setSuggestions([...new Set(fieldData)].reverse());
      }
    } catch (error) {
      console.warn('Failed to load autocomplete suggestions:', error);
    }
  }, [fieldName]);

  const saveValue = useCallback((value: string) => {
    if (!value || value.trim() === '') return;
    
    try {
      const allFormData = localStorage.getItem('form_autocomplete_data');
      const parsed = allFormData ? JSON.parse(allFormData) : {};
      
      if (!parsed[fieldName]) {
        parsed[fieldName] = [];
      }
      
      const fieldData = parsed[fieldName];
      const filtered = fieldData.filter((item: string) => item !== value);
      parsed[fieldName] = [value, ...filtered].slice(0, 10);
      
      localStorage.setItem('form_autocomplete_data', JSON.stringify(parsed));
      loadSuggestions(); // Refresh suggestions
    } catch (error) {
      console.warn('Failed to save autocomplete value:', error);
    }
  }, [fieldName, loadSuggestions]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    isOpen,
    setIsOpen,
    saveValue,
    loadSuggestions
  };
};