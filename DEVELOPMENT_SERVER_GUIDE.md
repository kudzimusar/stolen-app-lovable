# STOLEN Platform - Development Server Setup Guide

## Overview
This guide explains how to set up and use the local development server for testing the STOLEN Platform across multiple devices on your network.

---

## 🚀 Quick Start

### 1. **Start Development Server with Network Access**
```bash
npm run dev:info
```
This command will:
- Display your network information and access URLs
- Start the development server accessible from other devices
- Show testing instructions

### 2. **Alternative Commands**
```bash
# Basic development server (network accessible)
npm run dev:network

# Local-only development server
npm run dev:local

# Just show network information
npm run server:info

# Test network connectivity
npm run test:network

# Preview built app (network accessible)
npm run preview:info
```

---

## 📱 Multi-Device Testing Setup

### **Step 1: Start the Server**
```bash
npm run dev:info
```

### **Step 2: Connect Devices to Same Network**
Ensure all testing devices are connected to the same WiFi network as your development machine.

### **Step 3: Access from Other Devices**
Use the network URLs displayed by the `dev:info` command:
- **iPhone/Android**: Open browser, visit `http://[YOUR-IP]:8080`
- **iPad/Tablet**: Same as mobile devices
- **Other Computers**: Visit the network URL in any browser

### **Step 4: Test Responsive Features**
- ✅ Mobile bottom navigation
- ✅ Responsive breakpoints
- ✅ Touch interactions
- ✅ All stakeholder interfaces
- ✅ Form submissions
- ✅ Device registration flows

---

## 🛠 Server Configuration

### **Vite Configuration (vite.config.ts)**
```typescript
server: {
  host: "0.0.0.0", // Allow external connections
  port: 8080,
  strictPort: true, // Exit if port is in use
  open: false, // Don't auto-open browser
  cors: true, // Enable CORS for API requests
  hmr: {
    port: 8081, // Hot Module Replacement port
  },
}
```

### **Network Access Settings**
- **Host**: `0.0.0.0` - Binds to all network interfaces
- **Port**: `8080` - Main development server port
- **HMR Port**: `8081` - Hot module replacement
- **CORS**: Enabled for API requests

---

## 🧪 Testing Scenarios

### **1. Bottom Navigation Testing**
Test the role-specific mobile navigation for all 8 stakeholder types:
- **Individual Users**: Home, Check, Sell, Market, Profile
- **Repair Shops**: Dashboard, Fraud Check, Log Repair, Parts, Profile
- **Retailers**: Dashboard, Inventory, Register, Sales, Profile
- **Insurance**: Dashboard, Claims, New Claim, Policies, Profile
- **Law Enforcement**: Dashboard, Search, Report, Cases, Profile
- **NGO Partners**: Dashboard, Donations, Request, Impact, Profile
- **Platform Administrators**: Dashboard, Users, System, Reports, Profile
- **Banks/Payment Gateways**: Dashboard, Transactions, Fraud, Analytics, Profile

### **2. Responsive Design Testing**
- **Mobile (320px - 768px)**: Test bottom navigation, touch targets, mobile layouts
- **Tablet (768px - 1024px)**: Test hybrid navigation, medium layouts
- **Desktop (1024px+)**: Test full navigation, large layouts

### **3. Cross-Browser Testing**
- **iOS Safari**: iPhone/iPad native browser
- **Chrome Mobile**: Android devices
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge

### **4. Feature Testing Checklist**
- ✅ Device registration flow
- ✅ Marketplace browsing
- ✅ Reverse verification tool
- ✅ Stakeholder dashboards
- ✅ Form submissions
- ✅ Modal interactions
- ✅ Navigation flows
- ✅ Profile management
- ✅ Payment flows (mock)

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **1. Can't Access from Other Devices**
```bash
# Check if server is running on correct host
npm run server:info

# Try restarting with explicit network binding
npm run dev:network

# Check firewall settings (Windows/Mac/Linux)
```

#### **2. Port Already in Use**
```bash
# Use local-only server on different port
npm run dev:local

# Or kill process using port 8080
# Windows: netstat -ano | findstr :8080
# Mac/Linux: lsof -ti:8080 | xargs kill -9
```

#### **3. Network Connectivity Issues**
```bash
# Test basic network connectivity
npm run test:network

# Check if devices are on same network
# Ensure WiFi network allows device-to-device communication
```

#### **4. Hot Module Replacement Not Working**
- Clear browser cache
- Check that port 8081 is also accessible
- Restart development server

#### **5. CORS Issues**
- CORS is enabled by default in the configuration
- If issues persist, check browser developer tools
- Ensure requests are going to correct host/port

---

## 🔒 Security Considerations

### **Development Only**
- This setup is for development and testing only
- Never use in production environments
- Server binds to all network interfaces for testing convenience

### **Network Security**
- Server only accessible on local network
- No external internet access by default
- Firewall may block connections (configure as needed)

### **Data Security**
- Uses mock data for development
- No real payment processing
- All authentication is simulated

---

## 🌐 Advanced Network Setup

### **Using ngrok for External Testing**
For testing from devices not on your local network:

```bash
# Install ngrok
npm install -g ngrok

# Start development server
npm run dev:network

# In another terminal, expose port 8080
ngrok http 8080
```

### **Custom Network Configuration**
Modify `vite.config.ts` for specific network requirements:

```typescript
server: {
  host: "192.168.1.100", // Specific IP address
  port: 3000,            // Custom port
  https: true,           // Enable HTTPS (requires certificates)
}
```

---

## 📊 Performance Monitoring

### **Development Server Performance**
- Monitor server response times
- Check Hot Module Replacement speed
- Observe network request performance

### **Device Performance Testing**
- Test on low-end mobile devices
- Monitor memory usage
- Check touch responsiveness
- Validate smooth animations

---

## 🎯 Testing Workflow

### **1. Daily Testing Routine**
```bash
# Start development server
npm run dev:info

# Test on primary development device
# Test on mobile phone
# Test on tablet
# Test on different browsers
```

### **2. Feature Testing Workflow**
```bash
# After implementing new features:
1. Test locally first
2. Test on mobile devices
3. Test responsive breakpoints
4. Test across different stakeholders
5. Validate UI/UX consistency
```

### **3. Pre-Deployment Testing**
```bash
# Build and test production version
npm run build
npm run preview:info

# Test built version on multiple devices
# Verify all features work in production build
```

---

## 📱 Device-Specific Instructions

### **iPhone/iPad Testing**
- Open Safari browser
- Visit network URL: `http://[YOUR-IP]:8080`
- Add to Home Screen for app-like experience
- Test Safari-specific features and behaviors

### **Android Device Testing**
- Open Chrome browser
- Visit network URL: `http://[YOUR-IP]:8080`
- Test Chrome-specific features
- Test Android back button behavior

### **Desktop Browser Testing**
- Test different screen sizes using browser dev tools
- Verify desktop navigation vs mobile navigation
- Test keyboard navigation and accessibility

---

## 🔄 Continuous Testing

### **Automated Testing Integration**
The development server works with:
- Jest unit tests
- Cypress end-to-end tests
- Manual testing workflows
- Performance monitoring tools

### **CI/CD Integration**
Server configuration supports:
- Automated builds
- Testing pipelines
- Preview deployments
- Production deployments

---

This setup provides a comprehensive development and testing environment for the STOLEN Platform, enabling thorough testing across all target devices and scenarios while maintaining the high quality standards established in Phase 1.
