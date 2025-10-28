import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: boolean;
  variant?: 'default' | 'highlighted' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
  badgeType?: 'new' | 'featured' | 'beta' | 'premium';
  actionText?: string;
  onAction?: () => void;
  externalLink?: string;
  className?: string;
  disabled?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  gradient = false,
  variant = 'default',
  size = 'md',
  badge,
  badgeType = 'new',
  actionText,
  onAction,
  externalLink,
  className = '',
  disabled = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'highlighted':
        return 'border-primary bg-primary/5 hover:bg-primary/10';
      case 'minimal':
        return 'border-0 bg-transparent hover:bg-muted/50';
      default:
        return gradient 
          ? 'border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:from-primary/15 hover:via-primary/10'
          : 'border-border bg-card/80 backdrop-blur-sm hover:bg-card';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'p-2 w-8 h-8';
      case 'lg':
        return 'p-4 w-16 h-16';
      default:
        return 'p-3 w-12 h-12';
    }
  };

  const getTitleSize = () => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'lg':
        return 'text-2xl';
      default:
        return 'text-xl';
    }
  };

  const getBadgeColor = () => {
    switch (badgeType) {
      case 'new':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'featured':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = () => {
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener,noreferrer');
    } else if (onAction && !disabled) {
      onAction();
    }
  };

  return (
    <Card 
      className={`
        transition-all duration-300 hover:shadow-lg hover:scale-105 
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleAction}
    >
      <CardContent className="flex flex-col items-center text-center space-y-4 h-full">
        {/* Badge */}
        {badge && (
          <Badge className={`${getBadgeColor()} text-xs font-medium`}>
            {badge}
          </Badge>
        )}

        {/* Icon */}
        <div className={`
          rounded-full bg-primary/10 text-primary flex items-center justify-center
          ${getIconSize()}
        `}>
          {icon}
        </div>

        {/* Content */}
        <div className="space-y-2 flex-1">
          <h3 className={`font-semibold text-foreground ${getTitleSize()}`}>
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Button */}
        {(actionText || externalLink) && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-auto group"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
          >
            {actionText || 'Learn More'}
            {externalLink ? (
              <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Pre-configured feature cards for common use cases
export const SecurityFeatureCard: React.FC<{
  title: string;
  description: string;
  onAction?: () => void;
  className?: string;
}> = ({ title, description, onAction, className = '' }) => (
  <FeatureCard
    icon={<Shield className="w-6 h-6" />}
    title={title}
    description={description}
    badge="Secure"
    badgeType="featured"
    actionText="Learn More"
    onAction={onAction}
    className={className}
  />
);

export const AIFeatureCard: React.FC<{
  title: string;
  description: string;
  onAction?: () => void;
  className?: string;
}> = ({ title, description, onAction, className = '' }) => (
  <FeatureCard
    icon={<Brain className="w-6 h-6" />}
    title={title}
    description={description}
    badge="AI Powered"
    badgeType="new"
    actionText="Explore"
    onAction={onAction}
    variant="highlighted"
    className={className}
  />
);

export const BlockchainFeatureCard: React.FC<{
  title: string;
  description: string;
  onAction?: () => void;
  className?: string;
}> = ({ title, description, onAction, className = '' }) => (
  <FeatureCard
    icon={<Lock className="w-6 h-6" />}
    title={title}
    description={description}
    badge="Blockchain"
    badgeType="premium"
    actionText="Verify"
    onAction={onAction}
    gradient={true}
    className={className}
  />
);

// Import icons for the pre-configured cards
import { Shield, Brain, Lock } from 'lucide-react';










