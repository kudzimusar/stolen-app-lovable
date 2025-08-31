import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  description,
  children,
  defaultExpanded = false,
  className,
  icon
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="pb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="transition-transform duration-200 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </div>
    </Card>
  );
};

export default CollapsibleSection;
