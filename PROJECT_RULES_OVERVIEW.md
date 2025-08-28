# Project Rules Overview - STOLEN Platform

## Project Standards & Guidelines

### 1. Code Quality Standards

#### 1.1 TypeScript Standards
- **Strict Mode**: All TypeScript files must use strict mode
- **Type Definitions**: All functions, components, and variables must have explicit type definitions
- **Interface Naming**: Use PascalCase for interfaces (e.g., `UserProfile`, `DeviceData`)
- **Type Imports**: Use type-only imports when possible (`import type { User } from './types'`)
- **No Any Types**: Avoid using `any` type; use `unknown` or proper type definitions

#### 1.2 React Component Standards
- **Functional Components**: Use functional components with hooks
- **Component Naming**: PascalCase for component names (e.g., `DeviceCard`, `UserProfile`)
- **Props Interface**: Define props interface for each component
- **Default Props**: Use default parameters instead of defaultProps
- **Component Organization**: One component per file, export as default

```typescript
// Example Component Structure
interface DeviceCardProps {
  device: Device;
  onSelect?: (device: Device) => void;
  className?: string;
}

export default function DeviceCard({ 
  device, 
  onSelect, 
  className = "" 
}: DeviceCardProps) {
  // Component logic
}
```

#### 1.3 File Organization
- **Page Components**: `/src/pages/` - One file per page
- **UI Components**: `/src/components/ui/` - Reusable UI components
- **Custom Components**: `/src/components/` - Business logic components
- **Hooks**: `/src/hooks/` - Custom React hooks
- **Utilities**: `/src/lib/` - Helper functions and utilities
- **Types**: `/src/types/` - TypeScript type definitions

### 2. Styling Standards

#### 2.1 Tailwind CSS Guidelines
- **Utility-First**: Use Tailwind utility classes over custom CSS
- **Responsive Design**: Use responsive prefixes (sm:, md:, lg:, xl:)
- **Dark Mode**: Support dark mode with dark: prefix
- **Custom Classes**: Create custom classes only when necessary
- **Consistent Spacing**: Use Tailwind's spacing scale (4, 8, 12, 16, 20, 24, etc.)

#### 2.2 Component Styling
- **shadcn/ui Components**: Use shadcn/ui components as base
- **Customization**: Extend shadcn/ui components with Tailwind classes
- **Consistent Theming**: Use CSS variables for theming
- **Accessibility**: Ensure proper contrast ratios and focus states

### 3. State Management Standards

#### 3.1 React Query (TanStack Query)
- **Query Keys**: Use consistent query key structure
- **Error Handling**: Implement proper error boundaries
- **Loading States**: Show appropriate loading indicators
- **Cache Management**: Configure appropriate cache times

```typescript
// Example Query Structure
const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: fetchDevices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

#### 3.2 Local State Management
- **useState**: For simple component state
- **useReducer**: For complex state logic
- **Context**: For global state that doesn't change frequently
- **Zustand**: For complex global state management (if needed)

### 4. API Integration Standards

#### 4.1 Supabase Integration
- **Client Setup**: Use centralized Supabase client
- **Type Safety**: Generate types from Supabase schema
- **Error Handling**: Implement consistent error handling
- **Real-time**: Use Supabase real-time features appropriately

#### 4.2 API Response Handling
- **Zod Validation**: Use Zod for runtime type validation
- **Error Types**: Define specific error types
- **Loading States**: Implement proper loading states
- **Retry Logic**: Implement retry mechanisms for failed requests

### 5. Security Standards

#### 5.1 Authentication & Authorization
- **Role-Based Access**: Implement proper role-based access control
- **Protected Routes**: Use ProtectedRoute component for sensitive pages
- **Token Management**: Secure token storage and refresh
- **Session Management**: Proper session handling and logout

#### 5.2 Data Security
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: Implement CSRF tokens where necessary
- **Data Encryption**: Encrypt sensitive data in transit and at rest

### 6. Performance Standards

#### 6.1 Code Splitting
- **Route-Based**: Implement route-based code splitting
- **Component-Based**: Lazy load heavy components
- **Bundle Analysis**: Regular bundle size analysis

#### 6.2 Optimization Techniques
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Image Optimization**: Use next/image or optimized image loading
- **Lazy Loading**: Implement lazy loading for images and components
- **Virtual Scrolling**: For large lists and data tables

### 7. Testing Standards

#### 7.1 Unit Testing
- **Component Testing**: Test all components with React Testing Library
- **Hook Testing**: Test custom hooks in isolation
- **Utility Testing**: Test utility functions with Jest
- **Coverage**: Maintain 95% test coverage

#### 7.2 Integration Testing
- **API Integration**: Test API integration points
- **User Flows**: Test complete user journeys
- **Error Scenarios**: Test error handling and edge cases

#### 7.3 E2E Testing
- **Critical Paths**: Test critical user paths
- **Cross-Browser**: Test across major browsers
- **Mobile Testing**: Test on mobile devices and emulators

### 8. Accessibility Standards

#### 8.1 WCAG 2.1 AA Compliance
- **Semantic HTML**: Use proper HTML semantics
- **ARIA Labels**: Implement ARIA labels and roles
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Screen Reader**: Test with screen readers

#### 8.2 Color and Contrast
- **Contrast Ratios**: Maintain 4.5:1 contrast ratio for normal text
- **Color Independence**: Don't rely solely on color for information
- **Focus Indicators**: Clear focus indicators for all interactive elements

### 9. Error Handling Standards

#### 9.1 Error Boundaries
- **Component Level**: Implement error boundaries for components
- **Route Level**: Error boundaries for route-level errors
- **Global Level**: Global error handling for uncaught errors

#### 9.2 User Feedback
- **Error Messages**: Clear, user-friendly error messages
- **Loading States**: Appropriate loading indicators
- **Success Feedback**: Confirm successful actions
- **Toast Notifications**: Use toast notifications for user feedback

### 10. Documentation Standards

#### 10.1 Code Documentation
- **JSDoc Comments**: Document complex functions and components
- **README Files**: Maintain README files for each major directory
- **API Documentation**: Document API endpoints and responses
- **Component Documentation**: Document component props and usage

#### 10.2 Git Commit Standards
- **Conventional Commits**: Use conventional commit format
- **Commit Messages**: Clear, descriptive commit messages
- **Branch Naming**: Use feature/ prefix for feature branches
- **Pull Requests**: Detailed PR descriptions with testing notes

### 11. Mobile-First Standards

#### 11.1 Responsive Design
- **Mobile First**: Design for mobile first, then enhance for desktop
- **Touch Targets**: Minimum 44px touch targets
- **Gesture Support**: Implement appropriate touch gestures
- **Viewport**: Proper viewport meta tags

#### 11.2 PWA Standards
- **Service Worker**: Implement service worker for offline functionality
- **Manifest**: Proper web app manifest
- **Installation**: Support for app installation
- **Offline Support**: Graceful offline handling

### 12. Quality Gates

#### 12.1 Pre-commit Checks
- **Linting**: ESLint must pass with zero errors
- **Type Checking**: TypeScript compilation must succeed
- **Formatting**: Prettier formatting check
- **Tests**: Unit tests must pass

#### 12.2 Pre-deployment Checks
- **Build Success**: Production build must succeed
- **Test Coverage**: Minimum 95% test coverage
- **Performance**: Lighthouse score > 90
- **Accessibility**: Accessibility score > 95

### 13. Monitoring and Analytics

#### 13.1 Error Tracking
- **Sentry Integration**: Track and monitor errors
- **Performance Monitoring**: Monitor Core Web Vitals
- **User Analytics**: Track user behavior and engagement
- **Security Monitoring**: Monitor for security incidents

#### 13.2 Health Checks
- **API Health**: Monitor API endpoints
- **Database Health**: Monitor database performance
- **Client Performance**: Monitor client-side performance
- **User Experience**: Track user satisfaction metrics

### 14. Deployment Standards

#### 14.1 Environment Management
- **Environment Variables**: Use environment variables for configuration
- **Secrets Management**: Secure handling of sensitive data
- **Feature Flags**: Implement feature flags for gradual rollouts
- **Rollback Strategy**: Plan for quick rollbacks if needed

#### 14.2 CI/CD Pipeline
- **Automated Testing**: Run tests on every commit
- **Automated Deployment**: Deploy to staging on merge to main
- **Production Deployment**: Manual approval for production
- **Health Checks**: Verify deployment health before completion

---

## Compliance Requirements

### Legal Compliance
- **GDPR**: Data protection and privacy compliance
- **CCPA**: California Consumer Privacy Act compliance
- **PCI DSS**: Payment card industry compliance (if applicable)
- **Local Regulations**: Compliance with local laws and regulations

### Industry Standards
- **OWASP Top 10**: Address OWASP security vulnerabilities
- **ISO 27001**: Information security management (if applicable)
- **SOC 2**: Security, availability, and confidentiality (if applicable)

---

**Note**: These rules are living documents that should be updated as the project evolves. All team members must follow these standards to maintain code quality and project consistency.