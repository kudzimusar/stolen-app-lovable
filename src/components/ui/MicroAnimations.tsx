import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

// Smooth scroll animation with custom easing
export const smoothScrollTo = (
  target: HTMLElement | string,
  options: {
    offset?: number;
    duration?: number;
    easing?: string;
    highlight?: boolean;
    callback?: () => void;
  } = {}
) => {
  const {
    offset = 0,
    duration = 800,
    easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    highlight = true,
    callback
  } = options;

  const element = typeof target === 'string' 
    ? document.querySelector(target) as HTMLElement
    : target;

  if (!element) return;

  const startPosition = window.pageYOffset;
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  // Custom easing function
  const ease = (t: number): number => {
    // Parse cubic-bezier values if provided
    if (easing.includes('cubic-bezier')) {
      const values = easing.match(/[\d.]+/g)?.map(Number);
      if (values && values.length === 4) {
        // Simplified cubic-bezier approximation
        return t * t * (3 - 2 * t);
      }
    }
    
    // Default ease-out
    return 1 - Math.pow(1 - t, 3);
  };

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = ease(progress);
    
    window.scrollTo(0, startPosition + distance * easedProgress);
    
    if (progress < 1) {
      requestAnimationFrame(animation);
    } else {
      // Animation complete
      if (highlight) {
        highlightElement(element);
      }
      callback?.();
    }
  };

  requestAnimationFrame(animation);
};

// Highlight element with animation
const highlightElement = (element: HTMLElement) => {
  // Add highlight class
  element.classList.add('scroll-highlight');
  
  // Create styles if they don't exist
  if (!document.getElementById('scroll-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'scroll-highlight-styles';
    style.textContent = `
      .scroll-highlight {
        animation: scrollHighlight 2s ease-out forwards;
        position: relative;
      }
      
      .scroll-highlight::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background: rgba(59, 130, 246, 0.1);
        border: 2px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        pointer-events: none;
        animation: highlightPulse 2s ease-out forwards;
      }
      
      @keyframes scrollHighlight {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.02);
        }
        100% {
          transform: scale(1);
        }
      }
      
      @keyframes highlightPulse {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
        30% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(1.05);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Remove highlight after animation
  setTimeout(() => {
    element.classList.remove('scroll-highlight');
  }, 2000);
};

// Fade in animation component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  className?: string;
  threshold?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  className,
  threshold = 0.1
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.classList.add('fade-in-visible');
          }, delay);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay, threshold]);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(20px)';
      case 'down': return 'translateY(-20px)';
      case 'left': return 'translateX(20px)';
      case 'right': return 'translateX(-20px)';
      case 'scale': return 'scale(0.9)';
      default: return 'translateY(20px)';
    }
  };

  return (
    <div
      ref={ref}
      className={cn('fade-in-element', className)}
      style={{
        opacity: 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        // @ts-ignore
        '--fade-in-duration': `${duration}ms`
      }}
    >
      {children}
      <style jsx="true">{`
        .fade-in-element.fade-in-visible {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }
      `}</style>
    </div>
  );
};

// Slide in animation component
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 500,
  distance = 50,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.classList.add('slide-in-visible');
          }, delay);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'left': return `translateX(-${distance}px)`;
      case 'right': return `translateX(${distance}px)`;
      case 'up': return `translateY(-${distance}px)`;
      case 'down': return `translateY(${distance}px)`;
      default: return `translateX(-${distance}px)`;
    }
  };

  return (
    <div
      ref={ref}
      className={cn('slide-in-element', className)}
      style={{
        opacity: 0,
        transform: getInitialTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
      }}
    >
      {children}
      <style jsx="true">{`
        .slide-in-element.slide-in-visible {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }
      `}</style>
    </div>
  );
};

// Stagger animation for lists
interface StaggeredAnimationProps {
  children: React.ReactNode[];
  stagger?: number;
  animation?: 'fadeIn' | 'slideIn';
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  stagger = 100,
  animation = 'fadeIn',
  direction = 'up',
  className
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => {
        const AnimationComponent = animation === 'fadeIn' ? FadeIn : SlideIn;
        return (
          <AnimationComponent
            key={index}
            delay={index * stagger}
            direction={direction}
          >
            {child}
          </AnimationComponent>
        );
      })}
    </div>
  );
};

// Smooth page transition component
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Add entrance animation
    element.classList.add('page-enter');
    
    const timer = setTimeout(() => {
      element.classList.remove('page-enter');
      element.classList.add('page-enter-active');
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      className={cn('page-transition', className)}
    >
      {children}
      <style jsx="true" global="true">{`
        .page-transition {
          transition: opacity 300ms ease-out, transform 300ms ease-out;
        }
        
        .page-enter {
          opacity: 0;
          transform: translateY(10px);
        }
        
        .page-enter-active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

// Floating animation for elements
interface FloatingProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const Floating: React.FC<FloatingProps> = ({
  children,
  amplitude = 10,
  duration = 3000,
  delay = 0,
  className
}) => {
  return (
    <div
      className={cn('floating-element', className)}
      style={{
        animation: `floating ${duration}ms ease-in-out infinite`,
        animationDelay: `${delay}ms`,
        // @ts-ignore
        '--floating-amplitude': `${amplitude}px`
      }}
    >
      {children}
      <style jsx>{`
        @keyframes floating {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(var(--floating-amplitude, -10px));
          }
        }
      `}</style>
    </div>
  );
};

// Pulse animation for attention-grabbing elements
interface PulseProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  scale?: number;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  color = 'rgba(59, 130, 246, 0.4)',
  duration = 2000,
  scale = 1.05,
  className
}) => {
  return (
    <div
      className={cn('pulse-element', className)}
      style={{
        animation: `pulse ${duration}ms ease-in-out infinite`,
        // @ts-ignore
        '--pulse-color': color,
        '--pulse-scale': scale
      }}
    >
      {children}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 var(--pulse-color, rgba(59, 130, 246, 0.4));
          }
          50% {
            transform: scale(var(--pulse-scale, 1.05));
            box-shadow: 0 0 0 10px transparent;
          }
        }
      `}</style>
    </div>
  );
};

// Navigation transition animations
export const navigationTransitions = {
  // Smooth navigation with loading state
  navigateWithTransition: (href: string, onStart?: () => void, onComplete?: () => void) => {
    onStart?.();
    
    // Add page exit animation
    document.body.classList.add('page-exit');
    
    setTimeout(() => {
      window.location.href = href;
      onComplete?.();
    }, 150);
  },

  // Smooth scroll with memory restoration
  restoreScrollWithAnimation: (position: { x: number; y: number }) => {
    window.scrollTo({
      left: position.x,
      top: position.y,
      behavior: 'smooth'
    });
    
    // Add restoration indicator
    const indicator = document.createElement('div');
    indicator.className = 'scroll-restoration-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      animation: slideInRight 300ms ease-out;
    `;
    indicator.textContent = 'Position restored';
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.style.animation = 'slideOutRight 300ms ease-in forwards';
      setTimeout(() => indicator.remove(), 300);
    }, 2000);
  }
};

// Global CSS for micro-animations
export const injectMicroAnimationStyles = () => {
  if (document.getElementById('micro-animations-styles')) return;

  const style = document.createElement('style');
  style.id = 'micro-animations-styles';
  style.textContent = `
    /* Page transition styles */
    .page-exit {
      opacity: 0;
      transform: translateY(-5px);
      transition: opacity 150ms ease-in, transform 150ms ease-in;
    }
    
    /* Smooth scroll restoration animations */
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    /* Smooth focus transitions */
    *:focus {
      outline: none;
      transition: box-shadow 200ms ease-out;
    }
    
    *:focus-visible {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }
    
    /* Smooth hover transitions */
    button, a, [role="button"] {
      transition: all 200ms ease-out;
    }
    
    /* Form input smooth transitions */
    input, textarea, select {
      transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
    }
  `;
  
  document.head.appendChild(style);
};

// Initialize micro-animations on first import
if (typeof window !== 'undefined') {
  injectMicroAnimationStyles();
}

