# 🚀 STOLEN Platform - Quick Server Setup

## 🎯 Quick Start Commands

### **Option 1: Interactive Script (Recommended)**
```bash
./start-server.sh
```
Choose from menu options for different server modes.

### **Option 2: Direct Commands**
```bash
# Show network info and start server for multi-device testing
npm run dev:info

# Start network server directly
npm run dev:network

# Start local-only server
npm run dev:local

# Test network connectivity
npm run test:network

# Show network information only
npm run server:info
```

---

## 📱 Testing on Different Devices

### **1. Start Network Server**
```bash
npm run dev:info
```

### **2. Note Your Network URLs**
The script will display URLs like:
- `http://localhost:8080` (local)
- `http://192.168.1.100:8080` (network - your IP will be different)

### **3. Connect Devices**
- **Mobile/Tablet**: Connect to same WiFi network
- **Other Computers**: Connect to same network
- **Open Browser**: Visit the network URL

### **4. Test STOLEN Platform Features**
- ✅ Bottom navigation on mobile
- ✅ Responsive design breakpoints
- ✅ All 8 stakeholder interfaces
- ✅ Device registration flows
- ✅ Marketplace functionality

---

## 🔧 Available Server Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev:info` | Shows network info + starts server | **Recommended for testing** |
| `npm run dev:network` | Starts network-accessible server | Multi-device testing |
| `npm run dev:local` | Starts localhost-only server | Local development |
| `npm run test:network` | Network connectivity test server | Troubleshooting |
| `npm run server:info` | Shows network information only | Check IP addresses |
| `npm run preview:info` | Production build testing | Pre-deployment testing |

---

## 📋 Testing Checklist

### **Stakeholder Navigation Testing**
Test bottom navigation for all 8 stakeholder types:
- ✅ **Individual Users**: Home, Check, Sell, Market, Profile
- ✅ **Repair Shops**: Dashboard, Fraud Check, Log Repair, Parts, Profile
- ✅ **Retailers**: Dashboard, Inventory, Register, Sales, Profile
- ✅ **Insurance**: Dashboard, Claims, New Claim, Policies, Profile
- ✅ **Law Enforcement**: Dashboard, Search, Report, Cases, Profile
- ✅ **NGO Partners**: Dashboard, Donations, Request, Impact, Profile
- ✅ **Platform Administrators**: Dashboard, Users, System, Reports, Profile
- ✅ **Banks/Payment Gateways**: Dashboard, Transactions, Fraud, Analytics, Profile

### **Device Testing**
- ✅ iPhone/Android phones
- ✅ iPads/Android tablets
- ✅ Desktop browsers (Chrome, Firefox, Safari)
- ✅ Different screen sizes
- ✅ Touch interactions

### **Feature Testing**
- ✅ Landing page responsiveness
- ✅ Reverse Verification Tool
- ✅ Device registration
- ✅ Marketplace browsing
- ✅ Admin dashboards
- ✅ Payment provider interfaces

---

## 🚨 Troubleshooting

### **Can't Connect from Other Devices**
1. Ensure all devices are on same WiFi network
2. Check firewall settings
3. Try: `npm run test:network` to verify connectivity
4. Restart router if needed

### **Port Already in Use**
```bash
# Use different port
npm run dev:local

# Or kill process using port 8080
sudo lsof -ti:8080 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8080        # Windows
```

### **Server Won't Start**
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check for syntax errors in code
4. Clear npm cache: `npm cache clean --force`

---

## 🎯 Phase 1 Validation Testing

### **Critical Components to Test**
1. **Platform Administrators** (newly implemented)
2. **Banks/Payment Gateways** (enhanced)
3. **Reverse Verification Tool** (enhanced)
4. **Bottom Navigation** (all stakeholders)
5. **Landing Page** (quality benchmark)

### **Success Criteria**
- ✅ All stakeholder navigation working
- ✅ Mobile-first responsive design
- ✅ Cross-device compatibility
- ✅ Touch-friendly interactions
- ✅ Professional UI/UX consistency

---

## 📖 Full Documentation

For comprehensive setup and testing instructions, see:
- `DEVELOPMENT_SERVER_GUIDE.md` - Complete setup guide
- `PLAN.md` - Strategic implementation plan
- `UI_UX_CONSISTENCY_PLAN.md` - Design standards
- `PHASE_1_VALIDATION_REPORT.md` - Validation results

---

**🎉 Your STOLEN Platform development server is ready for multi-device testing!**
