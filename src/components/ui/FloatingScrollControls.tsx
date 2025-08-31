import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronUp, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown,
  MousePointerClick
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingScrollControlsProps {
  showAlways?: boolean;
  threshold?: number; // Scroll threshold to show controls
  position?: 'right' | 'left';
  offset?: number; // Offset from edge
  className?: string;
  elementSelector?: string; // Custom scroll element
  smoothScroll?: boolean;
  showProgress?: boolean;
}

export const FloatingScrollControls: React.FC<FloatingScrollControlsProps> = ({
  showAlways = false,
  threshold = 200,
  position = 'right',
  offset = 24,
  className,
  elementSelector,
  smoothScroll = true,
  showProgress = true
}) => {
  const [isVisible, setIsVisible] = useState(showAlways);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Get scroll element
  const getScrollElement = useCallback(() => {
    if (elementSelector) {
      return document.querySelector(elementSelector) as HTMLElement;
    }
    return document.documentElement;
  }, [elementSelector]);

  // Update scroll state
  const updateScrollState = useCallback(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const scrollTop = scrollElement === document.documentElement 
      ? window.scrollY 
      : scrollElement.scrollTop;
    
    const scrollHeight = scrollElement === document.documentElement
      ? document.body.scrollHeight
      : scrollElement.scrollHeight;
    
    const clientHeight = scrollElement === document.documentElement
      ? window.innerHeight
      : scrollElement.clientHeight;

    // Calculate scroll progress (0-100)
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(Math.min(100, Math.max(0, progress)));

    // Check if we can scroll in either direction
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < maxScroll - 1); // -1 for floating point precision

    // Show/hide controls based on scroll position and threshold
    if (!showAlways) {
      setIsVisible(scrollTop > threshold || maxScroll > clientHeight);
    }
  }, [getScrollElement, threshold, showAlways]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    setIsScrolling(true);
    const scrollElement = getScrollElement();
    
    if (scrollElement) {
      if (scrollElement === document.documentElement) {
        window.scrollTo({
          top: 0,
          behavior: smoothScroll ? 'smooth' : 'auto'
        });
      } else {
        scrollElement.scrollTo({
          top: 0,
          behavior: smoothScroll ? 'smooth' : 'auto'
        });
      }
    }

    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), smoothScroll ? 1000 : 100);
  }, [getScrollElement, smoothScroll]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setIsScrolling(true);
    const scrollElement = getScrollElement();
    
    if (scrollElement) {
      const maxScroll = scrollElement === document.documentElement
        ? document.body.scrollHeight - window.innerHeight
        : scrollElement.scrollHeight - scrollElement.clientHeight;

      if (scrollElement === document.documentElement) {
        window.scrollTo({
          top: maxScroll,
          behavior: smoothScroll ? 'smooth' : 'auto'
        });
      } else {
        scrollElement.scrollTo({
          top: maxScroll,
          behavior: smoothScroll ? 'smooth' : 'auto'
        });
      }
    }

    // Reset scrolling state after animation
    setTimeout(() => setIsScrolling(false), smoothScroll ? 1000 : 100);
  }, [getScrollElement, smoothScroll]);

  // Set up scroll listener
  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const handleScroll = () => {
      if (!isScrolling) {
        updateScrollState();
      }
    };

    // Initial state
    updateScrollState();

    // Add scroll listener
    if (scrollElement === document.documentElement) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Handle resize
    window.addEventListener('resize', updateScrollState, { passive: true });

    return () => {
      if (scrollElement === document.documentElement) {
        window.removeEventListener('scroll', handleScroll);
      } else {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', updateScrollState);
    };
  }, [getScrollElement, updateScrollState, isScrolling]);

  if (!isVisible) return null;

  const positionClasses = position === 'right' 
    ? `right-${offset === 24 ? '6' : `[${offset}px]`}` 
    : `left-${offset === 24 ? '6' : `[${offset}px]`}`;

  return (
    <div 
      className={cn(
        "fixed bottom-20 z-50 flex flex-col items-center gap-2",
        positionClasses,
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Progress indicator */}
      {showProgress && (
        <div className="relative w-1 h-16 bg-background/20 rounded-full border border-border/20 backdrop-blur-sm">
          <div 
            className="absolute bottom-0 w-full bg-primary rounded-full transition-all duration-200"
            style={{ height: `${scrollProgress}%` }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MousePointerClick className="w-3 h-3 text-primary" />
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        disabled={!canScrollUp || isScrolling}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg backdrop-blur-sm",
          "bg-background/80 hover:bg-background/90",
          "border-border/20 hover:border-border/40",
          "transition-all duration-200",
          !canScrollUp && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>

      {/* Scroll to bottom button */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToBottom}
        disabled={!canScrollDown || isScrolling}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg backdrop-blur-sm",
          "bg-background/80 hover:bg-background/90",
          "border-border/20 hover:border-border/40",
          "transition-all duration-200",
          !canScrollDown && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-5 w-5" />
      </Button>

      {/* Compact version for mobile */}
      <div className="md:hidden absolute top-0 right-full mr-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md border border-border/20 backdrop-blur-sm">
        {Math.round(scrollProgress)}%
      </div>
    </div>
  );
};

// Enhanced version with more features
interface AdvancedScrollControlsProps extends FloatingScrollControlsProps {
  showScrollIndicator?: boolean;
  showQuickJump?: boolean;
  quickJumpSections?: Array<{
    id: string;
    label: string;
    element?: string;
  }>;
}

export const AdvancedFloatingScrollControls: React.FC<AdvancedScrollControlsProps> = ({
  showScrollIndicator = true,
  showQuickJump = false,
  quickJumpSections = [],
  ...props
}) => {
  const [showJumpMenu, setShowJumpMenu] = useState(false);

  const jumpToSection = useCallback((sectionId: string, elementSelector?: string) => {
    const element = elementSelector 
      ? document.querySelector(elementSelector)
      : document.getElementById(sectionId);
    
    if (element) {
      element.scrollIntoView({
        behavior: props.smoothScroll ? 'smooth' : 'auto',
        block: 'start'
      });
    }
    setShowJumpMenu(false);
  }, [props.smoothScroll]);

  return (
    <div className="relative">
      <FloatingScrollControls {...props} />
      
      {/* Quick jump menu */}
      {showQuickJump && quickJumpSections.length > 0 && (
        <div 
          className={cn(
            "fixed bottom-36 z-50",
            props.position === 'right' ? `right-${props.offset === 24 ? '6' : `[${props.offset}px]`}` : `left-${props.offset === 24 ? '6' : `[${props.offset}px]`}`
          )}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowJumpMenu(!showJumpMenu)}
            className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
            aria-label="Quick jump menu"
          >
            <ChevronUp className={cn("h-4 w-4 transition-transform", showJumpMenu && "rotate-180")} />
          </Button>

          {showJumpMenu && (
            <div className="absolute bottom-12 right-0 mb-2 bg-background/95 backdrop-blur-sm border border-border/20 rounded-lg shadow-lg p-2 min-w-32">
              {quickJumpSections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToSection(section.id, section.element)}
                  className="w-full justify-start text-xs"
                >
                  {section.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

