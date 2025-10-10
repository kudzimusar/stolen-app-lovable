import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Option {
  value: string;
  label: string;
}

export interface EnhancedSelectProps {
  placeholder: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  placeholder,
  options,
  value,
  onValueChange,
  className = '',
  disabled = false,
  searchable = false,
  multiple = false
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// South African specific data
export const DEVICE_BRANDS = [
  { value: "apple", label: "Apple" },
  { value: "samsung", label: "Samsung" },
  { value: "huawei", label: "Huawei" },
  { value: "xiaomi", label: "Xiaomi" },
  { value: "oppo", label: "Oppo" },
  { value: "vivo", label: "Vivo" },
  { value: "oneplus", label: "OnePlus" },
  { value: "google", label: "Google" },
  { value: "sony", label: "Sony" },
  { value: "lg", label: "LG" },
  { value: "nokia", label: "Nokia" },
  { value: "motorola", label: "Motorola" },
  { value: "other", label: "Other" }
];

export const DEVICE_TYPES = [
  { value: "smartphone", label: "Smartphone" },
  { value: "tablet", label: "Tablet" },
  { value: "laptop", label: "Laptop" },
  { value: "desktop", label: "Desktop" },
  { value: "smartwatch", label: "Smartwatch" },
  { value: "headphones", label: "Headphones" },
  { value: "speaker", label: "Speaker" },
  { value: "camera", label: "Camera" },
  { value: "gaming_console", label: "Gaming Console" },
  { value: "other", label: "Other" }
];

export const DEVICE_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "broken", label: "Broken" }
];

export const SA_CITIES = [
  { value: "johannesburg", label: "Johannesburg" },
  { value: "cape_town", label: "Cape Town" },
  { value: "durban", label: "Durban" },
  { value: "pretoria", label: "Pretoria" },
  { value: "port_elizabeth", label: "Port Elizabeth" },
  { value: "bloemfontein", label: "Bloemfontein" },
  { value: "east_london", label: "East London" },
  { value: "nelspruit", label: "Nelspruit" },
  { value: "polokwane", label: "Polokwane" },
  { value: "kimberley", label: "Kimberley" },
  { value: "other", label: "Other" }
];

export const SA_PROVINCES = [
  { value: "gauteng", label: "Gauteng" },
  { value: "western_cape", label: "Western Cape" },
  { value: "kwazulu_natal", label: "KwaZulu-Natal" },
  { value: "eastern_cape", label: "Eastern Cape" },
  { value: "free_state", label: "Free State" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "limpopo", label: "Limpopo" },
  { value: "north_west", label: "North West" },
  { value: "northern_cape", label: "Northern Cape" }
];

export const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "snapscan", label: "SnapScan" },
  { value: "zapper", label: "Zapper" },
  { value: "vodapay", label: "VodaPay" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "cash", label: "Cash" }
];

export const REPORT_TYPES = [
  { value: "lost", label: "Lost Device" },
  { value: "found", label: "Found Device" },
  { value: "stolen", label: "Stolen Device" },
  { value: "damaged", label: "Damaged Device" },
  { value: "other", label: "Other" }
];

export const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export const USER_ROLES = [
  { value: "individual", label: "Individual" },
  { value: "repair_shop", label: "Repair Shop" },
  { value: "retailer", label: "Retailer" },
  { value: "law_enforcement", label: "Law Enforcement" },
  { value: "insurance", label: "Insurance" },
  { value: "ngo", label: "NGO" },
  { value: "admin", label: "Admin" }
];

// Utility function to get options by category
export const getSelectOptions = (category: string): Option[] => {
  const optionsMap: Record<string, Option[]> = {
    'deviceBrand': DEVICE_BRANDS,
    'brand': DEVICE_BRANDS,
    'deviceType': DEVICE_TYPES,
    'type': DEVICE_TYPES,
    'condition': DEVICE_CONDITIONS,
    'city': SA_CITIES,
    'province': SA_PROVINCES,
    'paymentMethod': PAYMENT_METHODS,
    'reportType': REPORT_TYPES,
    'priority': PRIORITY_LEVELS,
    'userRole': USER_ROLES
  };
  
  return optionsMap[category] || [];
};



