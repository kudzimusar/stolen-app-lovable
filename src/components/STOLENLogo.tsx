import stolenLogo from "@/assets/stolen-logo.png";

export const STOLENLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={stolenLogo} 
        alt="STOLEN" 
        className="h-10 w-auto"
      />
    </div>
  );
};