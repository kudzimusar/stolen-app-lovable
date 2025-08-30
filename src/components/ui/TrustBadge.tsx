import { Check, Shield, Lock } from "lucide-react";

interface TrustBadgeProps {
  type: "verified" | "secure" | "blockchain";
  text: string;
  className?: string;
}

export const TrustBadge = ({ type, text, className = "" }: TrustBadgeProps) => {
  const getIcon = () => {
    switch (type) {
      case "verified":
        return <Check className="w-4 h-4" />;
      case "secure":
        return <Shield className="w-4 h-4" />;
      case "blockchain":
        return <Lock className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "verified":
        return "bg-verified text-success-foreground";
      case "secure":
        return "bg-secure text-white";
      case "blockchain":
        return "bg-blockchain text-white";
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getColors()} ${className}`}>
      {getIcon()}
      {text}
    </div>
  );
};