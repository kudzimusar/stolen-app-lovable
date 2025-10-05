import React from 'react';
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface PersistentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldName: string;
  formKey: string;
  excludeFromPersistence?: boolean;
}

export const PersistentInput: React.FC<PersistentInputProps> = ({
  fieldName,
  formKey,
  excludeFromPersistence = false,
  value,
  onChange,
  ...props
}) => {
  const { formData, updateFormData } = useFormPersistence(
    { [fieldName]: value || '' },
    {
      key: formKey,
      debounceMs: 300,
      excludeFields: excludeFromPersistence ? [fieldName] : []
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ [fieldName]: e.target.value });
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      {...props}
      value={formData[fieldName] || value || ''}
      onChange={handleChange}
    />
  );
};

export default PersistentInput;
