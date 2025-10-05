import React, { createContext, useContext, ReactNode } from 'react';
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface FormPersistenceContextType {
  // Global form persistence utilities
  clearAllFormData: () => void;
  getGlobalAutocompleteSuggestions: (fieldName: string) => string[];
  saveGlobalAutocompleteValue: (fieldName: string, value: string) => void;
}

const FormPersistenceContext = createContext<FormPersistenceContextType | undefined>(undefined);

interface FormPersistenceProviderProps {
  children: ReactNode;
}

export const FormPersistenceProvider: React.FC<FormPersistenceProviderProps> = ({ children }) => {
  const clearAllFormData = () => {
    try {
      // Clear all form persistence data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('form_persistence_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear form data:', error);
    }
  };

  const getGlobalAutocompleteSuggestions = (fieldName: string): string[] => {
    try {
      const allFormData = localStorage.getItem('form_autocomplete_data');
      if (allFormData) {
        const parsed = JSON.parse(allFormData);
        const fieldData = parsed[fieldName] || [];
        return [...new Set(fieldData)].reverse();
      }
    } catch (error) {
      console.warn('Failed to load autocomplete data:', error);
    }
    return [];
  };

  const saveGlobalAutocompleteValue = (fieldName: string, value: string) => {
    if (!value || value.trim() === '') return;
    
    try {
      const allFormData = localStorage.getItem('form_autocomplete_data');
      const parsed = allFormData ? JSON.parse(allFormData) : {};
      
      if (!parsed[fieldName]) {
        parsed[fieldName] = [];
      }
      
      const fieldData = parsed[fieldName];
      const filtered = fieldData.filter((item: string) => item !== value);
      parsed[fieldName] = [value, ...filtered].slice(0, 10); // Keep last 10 values
      
      localStorage.setItem('form_autocomplete_data', JSON.stringify(parsed));
    } catch (error) {
      console.warn('Failed to save autocomplete value:', error);
    }
  };

  const value: FormPersistenceContextType = {
    clearAllFormData,
    getGlobalAutocompleteSuggestions,
    saveGlobalAutocompleteValue,
  };

  return (
    <FormPersistenceContext.Provider value={value}>
      {children}
    </FormPersistenceContext.Provider>
  );
};

export const useFormPersistenceContext = () => {
  const context = useContext(FormPersistenceContext);
  if (context === undefined) {
    throw new Error('useFormPersistenceContext must be used within a FormPersistenceProvider');
  }
  return context;
};

export default FormPersistenceContext;
