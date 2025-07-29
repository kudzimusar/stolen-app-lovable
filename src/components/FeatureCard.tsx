import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: boolean;
}

export const FeatureCard = ({ icon, title, description, gradient = false }: FeatureCardProps) => {
  return (
    <Card className={`p-6 transition-all duration-300 hover:shadow-card border-0 ${
      gradient 
        ? "bg-gradient-card backdrop-blur-sm" 
        : "bg-card/80 backdrop-blur-sm"
    } hover:scale-105`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </Card>
  );
};