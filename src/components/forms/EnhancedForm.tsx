import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  EnhancedSelect, 
  DEVICE_BRANDS, 
  DEVICE_TYPES, 
  DEVICE_CONDITIONS, 
  SA_CITIES, 
  SA_PROVINCES 
} from "@/components/forms/EnhancedSelect";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface EnhancedFormProps {
  fields: FormField[];
  onSubmit?: (data: Record<string, string>) => void;
  className?: string;
}

export const EnhancedForm = ({ fields, onSubmit, className }: EnhancedFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const getSelectOptions = (fieldId: string) => {
    switch (fieldId) {
      case 'deviceBrand':
      case 'brand':
        return DEVICE_BRANDS;
      case 'deviceType':
      case 'type':
        return DEVICE_TYPES;
      case 'condition':
        return DEVICE_CONDITIONS;
      case 'city':
        return SA_CITIES;
      case 'province':
        return SA_PROVINCES;
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {field.type === "select" ? (
              <EnhancedSelect
                placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
                options={field.options || getSelectOptions(field.id)}
                value={formData[field.id] || ""}
                onValueChange={(value) => handleChange(field.id, value)}
                className="w-full"
              />
            ) : field.type === "textarea" ? (
              <textarea
                id={field.id}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                required={field.required}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            ) : (
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                required={field.required}
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>
    </form>
  );
};