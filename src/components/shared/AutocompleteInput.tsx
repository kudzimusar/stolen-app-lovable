// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '@/hooks/useFormPersistence';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldName: string;
  onValueSave?: (value: string) => void;
  className?: string;
  suggestionsLimit?: number;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  fieldName,
  onValueSave,
  className = '',
  suggestionsLimit = 5,
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, saveValue } = useAutocomplete(fieldName);
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) && 
      suggestion !== inputValue
    )
    .slice(0, suggestionsLimit);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0 && filteredSuggestions.length > 0);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
    
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(filteredSuggestions[selectedIndex]);
        } else if (inputValue.trim()) {
          saveValue(inputValue.trim());
          if (onValueSave) {
            onValueSave(inputValue.trim());
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    saveValue(suggestion);
    
    // Trigger onChange event
    if (onChange && inputRef.current) {
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', {
        writable: false,
        value: { value: suggestion }
      });
      onChange(event as any);
    }
    
    if (onValueSave) {
      onValueSave(suggestion);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    selectSuggestion(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        {...props}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className={`${className} ${showSuggestions ? 'rounded-b-none' : ''}`}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="text-sm text-gray-700">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
