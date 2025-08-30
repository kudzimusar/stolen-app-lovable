# Development Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the STOLEN platform development environment, including all dependencies, configurations, and tools required for development.

---

## 🚀 **QUICK START**

### **Prerequisites**
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Git**: 2.30.0 or higher
- **VS Code**: Latest version (recommended)
- **PostgreSQL**: 15.0 or higher (for local development)

### **1. Clone Repository**
```bash
git clone https://github.com/your-org/stolen-app.git
cd stolen-app
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
cp env.example .env.local
# Edit .env.local with your API keys
```

### **4. Start Development Server**
```bash
npm run dev
```

---

## 🛠️ **DETAILED SETUP**

### **System Requirements**

#### **Operating Systems**
- **macOS**: 12.0 (Monterey) or higher
- **Windows**: 10 or higher
- **Linux**: Ubuntu 20.04 or higher

#### **Hardware Requirements**
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **CPU**: Multi-core processor (2+ cores)

#### **Network Requirements**
- **Internet**: Stable connection for API calls
- **Ports**: 8080 (dev server), 5432 (PostgreSQL), 6379 (Redis)

---

## 📦 **DEPENDENCY INSTALLATION**

### **Node.js Installation**

#### **macOS (using Homebrew)**
```bash
brew install node@18
brew link node@18
```

#### **Windows (using Chocolatey)**
```bash
choco install nodejs
```

#### **Linux (Ubuntu/Debian)**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **Verify Installation**
```bash
node --version  # Should be 18.x.x
npm --version   # Should be 9.x.x
```

### **Git Installation**

#### **macOS**
```bash
brew install git
```

#### **Windows**
Download from: https://git-scm.com/download/win

#### **Linux**
```bash
sudo apt-get install git
```

### **VS Code Installation**

#### **macOS**
```bash
brew install --cask visual-studio-code
```

#### **Windows**
Download from: https://code.visualstudio.com/

#### **Linux**
```bash
sudo snap install code --classic
```

---

## 🔧 **PROJECT SETUP**

### **1. Repository Setup**

#### **Clone Repository**
```bash
git clone https://github.com/your-org/stolen-app.git
cd stolen-app
```

#### **Configure Git**
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

#### **Install Git Hooks**
```bash
npm run prepare
```

### **2. Dependencies Installation**

#### **Install All Dependencies**
```bash
npm install
```

#### **Verify Installation**
```bash
npm run build
```

### **3. Environment Configuration**

#### **Copy Environment Template**
```bash
cp env.example .env.local
```

#### **Required Environment Variables**
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google APIs
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GEMINI_API_KEY=your_gemini_key

# Payment Processing
STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# Communication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# AI Services
OPENAI_API_KEY=your_openai_key

# Blockchain
ETHEREUM_RPC_URL=your_ethereum_rpc
POLYGON_RPC_URL=your_polygon_rpc

# Monitoring
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

### **4. Database Setup**

#### **Local PostgreSQL (Optional)**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### **Supabase Local Development**
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

---

## 🎯 **DEVELOPMENT WORKFLOW**

### **Available Scripts**

#### **Development**
```bash
npm run dev              # Start development server
npm run dev:network      # Start with network access
npm run dev:local        # Start with localhost only
npm run dev:info         # Show dev info and start server
```

#### **Building**
```bash
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build
```

#### **Testing**
```bash
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:open    # Open Cypress UI
```

#### **Code Quality**
```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

#### **Monitoring**
```bash
npm run monitor          # Start server monitor
npm run monitor:pm2      # Start with PM2
npm run monitor:pm2:stop # Stop PM2 processes
```

### **Development Server Configuration**

#### **Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: "0.0.0.0",     // Allow external connections
    port: 8080,          // Development port
    strictPort: true,    // Exit if port is in use
    cors: true,          // Enable CORS
    hmr: {
      port: 8081,        // Hot Module Replacement port
    },
  }
})
```

#### **Available URLs**
- **Development**: http://localhost:8080
- **Network Access**: http://0.0.0.0:8080
- **HMR**: http://localhost:8081

---

## 🧪 **TESTING SETUP**

### **Jest Configuration**

#### **Test Environment**
```javascript
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  }
}
```

#### **Running Tests**
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- --testPathPattern=ComponentName
```

### **Cypress Configuration**

#### **E2E Testing**
```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720
  }
})
```

#### **Running E2E Tests**
```bash
# Run all E2E tests
npm run test:e2e

# Open Cypress UI
npm run test:e2e:open

# Run specific test
npx cypress run --spec "cypress/e2e/login.cy.ts"
```

---

## 🔍 **DEBUGGING SETUP**

### **VS Code Configuration**

#### **Launch Configuration**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Attach to Chrome",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

#### **Recommended Extensions**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### **Browser Developer Tools**

#### **Chrome DevTools**
- **Elements**: Inspect and modify DOM
- **Console**: JavaScript debugging
- **Sources**: Source code debugging
- **Network**: API request monitoring
- **Performance**: Performance profiling
- **Application**: Storage and cache inspection

#### **React Developer Tools**
- **Components**: React component tree
- **Profiler**: Performance profiling
- **Hooks**: Hook state inspection

---

## 📱 **MOBILE DEVELOPMENT**

### **Progressive Web App (PWA)**

#### **PWA Features**
- **Offline Support**: Service worker caching
- **Push Notifications**: Real-time notifications
- **App-like Experience**: Native app feel
- **Installable**: Add to home screen

#### **Testing PWA**
```bash
# Build for production
npm run build

# Serve production build
npm run preview

# Test PWA features
# Open in Chrome and check Application tab
```

### **Mobile Testing**

#### **Device Testing**
- **iOS Safari**: Use iOS Simulator or physical device
- **Android Chrome**: Use Android Emulator or physical device
- **Responsive Design**: Test various screen sizes

#### **Browser Stack (Optional)**
```bash
# Install BrowserStack Local
npm install -g browserstack-local

# Start BrowserStack Local
browserstack-local --key YOUR_ACCESS_KEY
```

---

## 🔒 **SECURITY SETUP**

### **Environment Security**

#### **API Key Management**
```bash
# Never commit API keys
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use environment variables
export REACT_APP_API_KEY=your_api_key
```

#### **Local SSL (Optional)**
```bash
# Generate local SSL certificate
mkcert localhost 127.0.0.1 ::1

# Configure Vite for HTTPS
# vite.config.ts
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem')
    }
  }
})
```

### **Code Security**

#### **ESLint Security Rules**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error'
  }
}
```

---

## 📊 **PERFORMANCE MONITORING**

### **Development Performance**

#### **Bundle Analysis**
```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze bundle
npm run build:analyze
```

#### **Performance Monitoring**
```bash
# Lighthouse CI
npm install --save-dev @lhci/cli

# Run Lighthouse
npx lhci autorun
```

### **Real-time Monitoring**

#### **Sentry Integration**
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### **Performance Metrics**
```typescript
// Custom performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

performanceObserver.observe({ entryTypes: ['measure'] });
```

---

## 🚀 **DEPLOYMENT SETUP**

### **Production Build**

#### **Build Process**
```bash
# Production build
npm run build

# Verify build
npm run preview

# Test production build
npm run test:ci
```

#### **Environment Variables**
```bash
# Production environment
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://api.stolen.com
```

### **Deployment Platforms**

#### **Vercel Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### **Netlify Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

#### **Dependencies Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix type issues
npx tsc --noEmit --skipLibCheck
```

#### **Build Errors**
```bash
# Check build configuration
npm run build:dev

# Analyze bundle
npm run build:analyze
```

### **Performance Issues**

#### **Slow Development Server**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Use SWC for faster compilation
# Already configured in vite.config.ts
```

#### **Large Bundle Size**
```bash
# Analyze bundle
npm run build:analyze

# Check for duplicate dependencies
npm ls
```

---

## 📚 **RESOURCES**

### **Documentation**
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Vite**: https://vitejs.dev/
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/

### **Tools**
- **VS Code**: https://code.visualstudio.com/
- **Chrome DevTools**: https://developers.google.com/web/tools/chrome-devtools
- **Postman**: https://www.postman.com/
- **Figma**: https://www.figma.com/

### **Community**
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join our development community
- **Stack Overflow**: Search for solutions
- **Reddit**: r/reactjs, r/typescript

---

## 📞 **SUPPORT**

### **Getting Help**
1. **Check Documentation**: Review this guide and project docs
2. **Search Issues**: Look for similar issues on GitHub
3. **Create Issue**: Report bugs with detailed information
4. **Ask Community**: Post questions in Discord or forums

### **Contact Information**
- **Technical Lead**: [Contact Information]
- **DevOps Engineer**: [Contact Information]
- **Product Manager**: [Contact Information]

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Document Version**: 2.1.0  
**Maintainer**: STOLEN Development Team
