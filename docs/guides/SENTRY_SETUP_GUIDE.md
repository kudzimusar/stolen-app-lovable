# 📊 Sentry Setup Guide for Performance Monitoring

## Step 1: Create Sentry Account

### Sign Up
1. Go to [Sentry](https://sentry.io/)
2. Click "Get Started"
3. Sign up with GitHub, Google, or email
4. Verify your email

## Step 2: Create Organization

### Create Org
1. After signup, create your organization
2. Name it: `Stolen App`
3. Choose your plan (Free tier available)
4. Click "Create Organization"

## Step 3: Create Project

### Create Project
1. Click "Create Project"
2. Choose "React" as your platform
3. Name it: `stolen-app-frontend`
4. Click "Create Project"

### Project Configuration
- **Platform**: React
- **Framework**: React
- **Language**: TypeScript
- **Environment**: Development/Production

## Step 4: Get DSN (Data Source Name)

### Find Your DSN
1. After project creation, you'll see your DSN
2. It looks like: `https://your-dsn@sentry.io/project-id`
3. Copy this DSN - you'll need it for configuration

### DSN Format
```
https://[key]@[organization].ingest.sentry.io/[project]
```

## Step 5: Configure Sentry in Your App

### Update Environment Variables
Add to your `.env` file:
```bash
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Verify Configuration
Your `src/lib/performance-monitoring.ts` should already be configured to use:
```typescript
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN || 'your-sentry-dsn',
  // ... other config
});
```

## Step 6: Test Error Reporting

### Test Script
Create a test file to verify your setup:

```javascript
// test-sentry.js
import * as Sentry from '@sentry/react';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: 'development',
});

// Test error reporting
try {
  throw new Error('Test error from Sentry');
} catch (error) {
  Sentry.captureException(error);
  console.log('Error sent to Sentry');
}
```

## Step 7: Configure Performance Monitoring

### Enable Performance Monitoring
1. Go to your Sentry project
2. Navigate to "Performance"
3. Enable performance monitoring
4. Configure sampling rates

### Performance Settings
```typescript
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});
```

## Step 8: Set Up Alerts

### Create Alerts
1. Go to "Alerts" in your Sentry dashboard
2. Click "Create Alert Rule"
3. Configure alert conditions:
   - Error rate > 5%
   - Response time > 2 seconds
   - Memory usage > 100MB

### Alert Configuration
```json
{
  "name": "High Error Rate",
  "conditions": [
    {
      "type": "error_rate",
      "threshold": 5,
      "timeWindow": "1h"
    }
  ],
  "actions": [
    {
      "type": "email",
      "target": "your-email@example.com"
    }
  ]
}
```

## Step 9: Free Tier Limits

### Sentry Free Plan Includes:
- 5,000 errors/month
- 10,000 transactions/month
- 1 team member
- 30-day data retention
- Basic performance monitoring

### Monitoring Usage
1. Go to "Usage" in your dashboard
2. Monitor your monthly usage
3. Upgrade if needed

## Step 10: Integration with Your App

### React Integration
Your app should already be configured with:
- Error boundary integration
- Performance monitoring
- User context tracking
- Custom breadcrumbs

### Verify Integration
1. Check your Sentry dashboard
2. Look for incoming events
3. Test error reporting
4. Monitor performance metrics

## Step 11: Advanced Configuration

### Environment-Specific Settings
```typescript
// Different settings for different environments
const sentryConfig = {
  development: {
    tracesSampleRate: 1.0, // Sample all transactions in dev
    replaysSessionSampleRate: 1.0,
  },
  production: {
    tracesSampleRate: 0.1, // Sample 10% in production
    replaysSessionSampleRate: 0.1,
  }
};

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  ...sentryConfig[process.env.NODE_ENV || 'development'],
});
```

### User Context
```typescript
// Set user context when user logs in
Sentry.setUser({
  id: 'user123',
  email: 'user@example.com',
  username: 'john_doe',
});
```

## Verification

Test your Sentry connection:
```bash
# Run the test script
node test-sentry.js
```

Then check your Sentry dashboard for the test error.

## Next Steps
1. Complete Sentry setup
2. Test error reporting
3. Monitor performance metrics
4. Set up alerts
5. Integrate with your existing error handling
