import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface EnhancedSelectProps {
  placeholder: string;
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const EnhancedSelect = ({ placeholder, options, value, onValueChange, className }: EnhancedSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg z-50">
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
  { value: "nokia", label: "Nokia" },
  { value: "google", label: "Google" },
  { value: "sony", label: "Sony" },
  { value: "motorola", label: "Motorola" },
  { value: "realme", label: "Realme" },
  { value: "other", label: "Other" }
];

export const SA_CITIES = [
  { value: "cape-town", label: "Cape Town" },
  { value: "johannesburg", label: "Johannesburg" },
  { value: "durban", label: "Durban" },
  { value: "pretoria", label: "Pretoria" },
  { value: "port-elizabeth", label: "Port Elizabeth" },
  { value: "bloemfontein", label: "Bloemfontein" },
  { value: "east-london", label: "East London" },
  { value: "pietermaritzburg", label: "Pietermaritzburg" },
  { value: "welkom", label: "Welkom" },
  { value: "kimberley", label: "Kimberley" },
  { value: "polokwane", label: "Polokwane" },
  { value: "rustenburg", label: "Rustenburg" },
  { value: "witbank", label: "Witbank" },
  { value: "george", label: "George" },
  { value: "nelspruit", label: "Nelspruit" }
];

export const SA_PROVINCES = [
  { value: "GP", label: "Gauteng" },
  { value: "WC", label: "Western Cape" },
  { value: "KZN", label: "KwaZulu-Natal" },
  { value: "EC", label: "Eastern Cape" },
  { value: "MP", label: "Mpumalanga" },
  { value: "LP", label: "Limpopo" },
  { value: "NW", label: "North West" },
  { value: "FS", label: "Free State" },
  { value: "NC", label: "Northern Cape" }
];

export const DEVICE_TYPES = [
  { value: "smartphone", label: "Smartphone" },
  { value: "tablet", label: "Tablet" },
  { value: "laptop", label: "Laptop" },
  { value: "smartwatch", label: "Smartwatch" },
  { value: "headphones", label: "Headphones" },
  { value: "camera", label: "Camera" },
  { value: "gaming-console", label: "Gaming Console" },
  { value: "tv", label: "Television" },
  { value: "other", label: "Other" }
];

export const DEVICE_CONDITIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "very-good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" }
];