import { Shield } from "lucide-react";

export const STOLENLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Shield className="w-8 h-8 text-brand-blue" />
        <div className="absolute inset-0 w-8 h-8 bg-brand-blue/20 rounded-full blur animate-pulse-glow"></div>
      </div>
      <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        STOLEN
      </span>
    </div>
  );
};