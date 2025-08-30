# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the STOLEN platform to various environments, including development, staging, and production, with detailed configurations for different deployment platforms.

---

## 🚀 **DEPLOYMENT OVERVIEW**

### **Deployment Environments**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│   Environment   │───►│   Environment   │───►│   Environment   │
│                 │    │                 │    │                 │
│ • Local Testing │    │ • Integration   │    │ • Live Users    │
│ • Feature Dev   │    │ • QA Testing    │    │ • High Traffic  │
│ • Debug Mode    │    │ • Performance   │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Deployment Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    CDN / EDGE                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Cloudflare│ │   Vercel    │ │   Netlify   │           │
│  │     CDN     │ │     CDN     │ │     CDN     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND HOSTING                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Vercel    │ │   Netlify   │ │   AWS S3    │           │
│  │   (React)   │ │   (React)   │ │ + CloudFront│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICES                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Supabase   │ │   Edge      │ │   Database  │           │
│  │   (BaaS)    │ │ Functions   │ │ PostgreSQL  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ **PRE-DEPLOYMENT CHECKLIST**

### **Code Quality Checks**
```bash
# Run all quality checks
npm run lint              # ESLint
npm run format:check      # Prettier
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report
npm run build             # Production build
```

### **Security Checks**
```bash
# Security scanning
npm audit                 # Dependency vulnerabilities
npm audit fix            # Auto-fix vulnerabilities
npm run security:scan    # Custom security scan
```

### **Performance Checks**
```bash
# Performance testing
npm run lighthouse       # Lighthouse CI
npm run bundle:analyze   # Bundle analysis
npm run performance:test # Performance tests
```

### **Environment Validation**
```bash
# Environment validation
npm run env:validate     # Validate environment variables
npm run config:check     # Check configuration
npm run health:check     # Health check
```

---

## 🔧 **BUILD CONFIGURATION**

### **Production Build**

#### **Build Scripts**
```json
{
  "scripts": {
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "preview": "vite preview --host 0.0.0.0 --port 4173",
    "preview:info": "node scripts/dev-info.js && npm run preview"
  }
}
```

#### **Vite Build Configuration**
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: mode === 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
}))
```

### **Environment-Specific Builds**

#### **Development Build**
```bash
# Development build with debugging
npm run build:dev
```

#### **Staging Build**
```bash
# Staging build with staging environment
npm run build:staging
```

#### **Production Build**
```bash
# Production build optimized
npm run build:production
```

---

## 🌐 **DEPLOYMENT PLATFORMS**

### **1. Vercel Deployment**

#### **Vercel Configuration**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_ENVIRONMENT": "production",
    "REACT_APP_API_BASE_URL": "https://api.stolen.com"
  },
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### **Vercel CLI Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod

# Deploy to preview
vercel

# Set environment variables
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_MAPS_API_KEY
```

#### **GitHub Integration**
```yaml
# .github/workflows/vercel-deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### **2. Netlify Deployment**

#### **Netlify Configuration**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
```

#### **Netlify CLI Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Set environment variables
netlify env:set REACT_APP_SUPABASE_URL "your_supabase_url"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "your_supabase_anon_key"
netlify env:set VITE_GOOGLE_MAPS_API_KEY "your_google_maps_key"
```

### **3. AWS S3 + CloudFront**

#### **AWS S3 Configuration**
```bash
# Create S3 bucket
aws s3 mb s3://stolen-app-production

# Configure bucket for static website hosting
aws s3 website s3://stolen-app-production --index-document index.html --error-document index.html

# Upload build files
aws s3 sync dist/ s3://stolen-app-production --delete

# Set bucket policy for public read access
aws s3api put-bucket-policy --bucket stolen-app-production --policy file://bucket-policy.json
```

#### **CloudFront Distribution**
```json
// cloudfront-config.json
{
  "DistributionConfig": {
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3-stolen-app-production",
          "DomainName": "stolen-app-production.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-stolen-app-production",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000
    },
    "Enabled": true,
    "Comment": "STOLEN App Production Distribution"
  }
}
```

### **4. Docker Deployment**

#### **Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  stolen-app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

#### **Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy
        location /api/ {
            proxy_pass https://your-api-domain.com/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 🔄 **CI/CD PIPELINES**

### **GitHub Actions Pipeline**

#### **Complete CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy STOLEN App

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  NPM_VERSION: '9'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  security:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run security audit
        run: npm audit --audit-level=high
      
      - name: Run dependency check
        run: npx audit-ci --moderate

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--target staging'

  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run smoke tests
        run: |
          npm install -g newman
          newman run tests/postman/smoke-tests.json
      
      - name: Notify deployment
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            -d '{"text":"🚀 STOLEN App deployed to production successfully!"}'
```

### **GitLab CI Pipeline**

#### **GitLab CI Configuration**
```yaml
# .gitlab-ci.yml
stages:
  - test
  - security
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  NPM_VERSION: "9"

cache:
  paths:
    - node_modules/

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run lint
    - npm run test:ci
    - npm run test:e2e
  artifacts:
    reports:
      junit: coverage/junit.xml
    coverage_report:
      coverage_format: cobertura
      path: coverage/cobertura-coverage.xml

security:
  stage: security
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm audit --audit-level=high
    - npx audit-ci --moderate
  allow_failure: true

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy-staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $VERCEL_DEPLOY_HOOK_STAGING
  environment:
    name: staging
    url: https://staging.stolen.com
  only:
    - develop

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $VERCEL_DEPLOY_HOOK_PRODUCTION
  environment:
    name: production
    url: https://stolen.com
  only:
    - main
  when: manual
```

---

## 🔧 **ENVIRONMENT CONFIGURATION**

### **Environment Variables**

#### **Development Environment**
```bash
# .env.development
NODE_ENV=development
REACT_APP_ENVIRONMENT=development
REACT_APP_API_BASE_URL=http://localhost:54321
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug
```

#### **Staging Environment**
```bash
# .env.staging
NODE_ENV=production
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_BASE_URL=https://staging-api.stolen.com
REACT_APP_DEBUG_MODE=false
REACT_APP_LOG_LEVEL=info
```

#### **Production Environment**
```bash
# .env.production
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://api.stolen.com
REACT_APP_DEBUG_MODE=false
REACT_APP_LOG_LEVEL=error
```

### **Environment-Specific Builds**

#### **Build Scripts**
```json
{
  "scripts": {
    "build:dev": "vite build --mode development",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "start:dev": "vite --mode development",
    "start:staging": "vite --mode staging",
    "start:production": "vite --mode production"
  }
}
```

---

## 📊 **MONITORING & HEALTH CHECKS**

### **Health Check Endpoints**

#### **Application Health Check**
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    services: {
      database: 'connected',
      redis: 'connected',
      supabase: 'connected'
    }
  }
  
  res.status(200).json(health)
})
```

#### **Readiness Check**
```typescript
// Readiness check endpoint
app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await checkDatabaseConnection()
    
    // Check Redis connection
    await checkRedisConnection()
    
    // Check external services
    await checkExternalServices()
    
    res.status(200).json({ status: 'ready' })
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message })
  }
})
```

### **Monitoring Integration**

#### **Sentry Integration**
```typescript
// Sentry configuration for deployment
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
  release: process.env.npm_package_version,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(history)
    })
  ]
})
```

#### **Performance Monitoring**
```typescript
// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Send to analytics
    analytics.track('performance_metric', {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      entryType: entry.entryType
    })
  }
})

performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
```

---

## 🔄 **ROLLBACK STRATEGIES**

### **Automated Rollback**

#### **Rollback Triggers**
```yaml
# Rollback conditions
rollback_triggers:
  - error_rate_threshold: 5%  # 5% error rate
  - response_time_threshold: 2000ms  # 2 second response time
  - health_check_failure: 3  # 3 consecutive failures
  - user_complaints: 10  # 10 complaints in 5 minutes
```

#### **Rollback Script**
```bash
#!/bin/bash
# rollback.sh

ENVIRONMENT=$1
VERSION=$2

echo "Rolling back $ENVIRONMENT to version $VERSION"

# Rollback to previous version
if [ "$ENVIRONMENT" = "production" ]; then
  # Vercel rollback
  vercel rollback $VERSION --prod
  
  # Notify team
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-type: application/json' \
    -d "{\"text\":\"⚠️ Production rollback to version $VERSION\"}"
  
elif [ "$ENVIRONMENT" = "staging" ]; then
  # Staging rollback
  vercel rollback $VERSION
  
  # Notify team
  curl -X POST $SLACK_WEBHOOK \
    -H 'Content-type: application/json' \
    -d "{\"text\":\"⚠️ Staging rollback to version $VERSION\"}"
fi

echo "Rollback completed"
```

### **Manual Rollback**

#### **Vercel Rollback**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-id] --prod

# Rollback to previous deployment
vercel rollback --prod
```

#### **Netlify Rollback**
```bash
# List deployments
netlify deploy:list

# Rollback to specific deployment
netlify deploy:rollback [deployment-id]

# Rollback to previous deployment
netlify deploy:rollback
```

---

## 📋 **POST-DEPLOYMENT CHECKLIST**

### **Deployment Verification**

#### **Automated Checks**
- [ ] Health check endpoint responding
- [ ] All API endpoints functional
- [ ] Database connections established
- [ ] Redis connections established
- [ ] External service integrations working
- [ ] Authentication system operational
- [ ] Payment processing functional
- [ ] Email/SMS notifications working

#### **Manual Verification**
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Device registration functional
- [ ] Marketplace accessible
- [ ] Payment flow works
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified

#### **Performance Verification**
- [ ] Page load times < 3 seconds
- [ ] API response times < 2 seconds
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching working correctly
- [ ] CDN serving content

#### **Security Verification**
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Authentication tokens working
- [ ] Authorization working correctly

---

## 🚨 **TROUBLESHOOTING**

### **Common Deployment Issues**

#### **Build Failures**
```bash
# Check build logs
npm run build --verbose

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### **Environment Variable Issues**
```bash
# Verify environment variables
npm run env:check

# Check environment file
cat .env.production

# Test environment loading
node -e "console.log(process.env.REACT_APP_SUPABASE_URL)"
```

#### **Deployment Platform Issues**
```bash
# Vercel issues
vercel logs
vercel inspect

# Netlify issues
netlify status
netlify logs

# AWS issues
aws cloudwatch describe-logs
```

### **Performance Issues**

#### **Slow Build Times**
```bash
# Optimize build
npm run build:analyze

# Check bundle size
npm run bundle:size

# Optimize dependencies
npm prune
```

#### **Runtime Performance**
```bash
# Check performance metrics
npm run performance:test

# Analyze bundle
npm run bundle:analyze

# Check memory usage
node --inspect npm run dev
```

---

## 📞 **SUPPORT & CONTACTS**

### **Deployment Team**
- **DevOps Engineer**: [Contact Information]
- **Infrastructure Engineer**: [Contact Information]
- **Release Manager**: [Contact Information]

### **Emergency Contacts**
- **24/7 Support**: [Phone Number]
- **Emergency Email**: emergency@stolen.com
- **Slack Channel**: #deployment-alerts

### **External Support**
- **Vercel Support**: https://vercel.com/support
- **Netlify Support**: https://www.netlify.com/support
- **AWS Support**: https://aws.amazon.com/support

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Document Version**: 2.1.0  
**Maintainer**: STOLEN DevOps Team
