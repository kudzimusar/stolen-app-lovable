import React from 'react';
import { Check, Shield, Lock, Star, Award, Zap } from 'lucide-react';

export interface TrustBadgeProps {
  type: 'verified' | 'secure' | 'blockchain' | 'premium' | 'featured' | 'official';
  text: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'gradient';
  className?: string;
  showIcon?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  type,
  text,
  size = 'md',
  variant = 'solid',
  className = '',
  showIcon = true
}) => {
  const getIcon = () => {
    if (!showIcon) return null;
    
    const icons = {
      verified: Check,
      secure: Shield,
      blockchain: Lock,
      premium: Star,
      featured: Award,
      official: Zap
    };
    
    const Icon = icons[type];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const getColors = () => {
    const colorMap = {
      verified: {
        solid: 'bg-green-500 text-white',
        outline: 'border-green-500 text-green-700 bg-green-50',
        gradient: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      },
      secure: {
        solid: 'bg-blue-500 text-white',
        outline: 'border-blue-500 text-blue-700 bg-blue-50',
        gradient: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      },
      blockchain: {
        solid: 'bg-purple-500 text-white',
        outline: 'border-purple-500 text-purple-700 bg-purple-50',
        gradient: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
      },
      premium: {
        solid: 'bg-yellow-500 text-white',
        outline: 'border-yellow-500 text-yellow-700 bg-yellow-50',
        gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
      },
      featured: {
        solid: 'bg-orange-500 text-white',
        outline: 'border-orange-500 text-orange-700 bg-orange-50',
        gradient: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
      },
      official: {
        solid: 'bg-red-500 text-white',
        outline: 'border-red-500 text-red-700 bg-red-50',
        gradient: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      }
    };

    return colorMap[type][variant];
  };

  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizeMap[size];
  };

  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 hover:scale-105';
  const variantClasses = variant === 'outline' ? 'border' : '';
  const colorClasses = getColors();
  const sizeClasses = getSizeClasses();

  return (
    <div className={`${baseClasses} ${variantClasses} ${colorClasses} ${sizeClasses} ${className}`}>
      {getIcon()}
      <span>{text}</span>
    </div>
  );
};

// Pre-configured trust badges for common use cases
export const VerifiedBadge: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Verified', 
  className = '' 
}) => (
  <TrustBadge type="verified" text={text} className={className} />
);

export const SecureBadge: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Secure', 
  className = '' 
}) => (
  <TrustBadge type="secure" text={text} className={className} />
);

export const BlockchainBadge: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Blockchain Verified', 
  className = '' 
}) => (
  <TrustBadge type="blockchain" text={text} className={className} />
);

export const PremiumBadge: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Premium', 
  className = '' 
}) => (
  <TrustBadge type="premium" text={text} variant="gradient" className={className} />
);

export const FeaturedBadge: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Featured', 
  className = '' 
}) => (
  <TrustBadge type="featured" text={text} className={className} />
);

export const OfficialBadge: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Official', 
  className = '' 
}) => (
  <TrustBadge type="official" text={text} className={className} />
);

