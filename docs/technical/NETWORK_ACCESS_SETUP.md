# Network Access Setup - Permanent Configuration

This document outlines the permanent network access configuration for the Stolen App development server.

## ✅ Current Configuration

### Default Server Settings
- **Port**: 8081 (changed from 8080)
- **Host**: 0.0.0.0 (accessible from all network interfaces)
- **Network Access**: Enabled by default
- **Browser Compatibility**: Fixed for older browsers and mobile devices

### Access URLs
- **Local Access**: http://localhost:8081/
- **Network Access**: http://192.168.11.9:8081/ (your local IP)

## 🔧 Permanent Changes Made

### 1. Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 8081",
    "dev:network": "vite --host 0.0.0.0 --port 8081",
    "dev:local": "vite --host localhost --port 8080"
  }
}
```

### 2. Vite Configuration (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    host: true,        // Enables network access
    port: 8081,        // Consistent port
    fs: {
      strict: false    // Allows file system access
    }
  }
});
```

### 3. PM2 Ecosystem (ecosystem.config.cjs)
```javascript
{
  env: {
    NODE_ENV: 'development',
    PORT: 8081  // Updated to match new port
  }
}
```

### 4. Browser Compatibility Fix
- **Issue**: `crypto.randomUUID()` not available in older browsers
- **Solution**: Added fallback function in `src/lib/utils.ts`
- **Impact**: UI now works on all devices including older browsers

## 🚀 Starting the Server

### Option 1: Quick Start (Recommended)
```bash
./start-network-server.sh
```

### Option 2: NPM Scripts
```bash
npm run dev              # Default (network access)
npm run dev:network      # Explicit network access
npm run dev:local        # Local only
```

### Option 3: PM2 (Production-like)
```bash
npm run monitor:pm2      # Start with PM2
./start-servers.sh start # Use server manager
```

## 📱 Device Access

### From Any Device on Your Network:
1. Connect device to same WiFi network
2. Open browser and navigate to: `http://192.168.11.9:8081/`
3. App will load with full functionality

### Supported Devices:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Older browsers (fallback compatibility)
- ✅ Tablets and other network devices

## 🔄 Automatic Startup

### To make server start automatically on system boot:
```bash
# Add to crontab (macOS/Linux)
crontab -e

# Add this line:
@reboot cd "/Users/shadreckmusarurwa/Project AI/stolen-app-lovable" && ./start-network-server.sh
```

### Or use PM2 startup:
```bash
pm2 startup
pm2 save
pm2 start ecosystem.config.cjs
```

## 🛠️ Troubleshooting

### Server Not Accessible from Network:
1. Check firewall settings
2. Verify IP address: `ifconfig | grep "inet "`
3. Ensure port 8081 is not blocked

### Browser Shows Blank Page:
1. Check browser console for errors
2. Verify server is running: `curl http://localhost:8081`
3. Try different browser or clear cache

### Port Already in Use:
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or restart server
./start-network-server.sh
```

## 📊 Monitoring

### Check Server Status:
```bash
# View logs
tail -f /tmp/stolen-app-server.log

# Check processes
ps aux | grep "npm.*dev"

# Test connectivity
curl http://localhost:8081
curl http://192.168.11.9:8081
```

### PM2 Commands:
```bash
pm2 status              # Check PM2 processes
pm2 logs                # View PM2 logs
pm2 restart all         # Restart all services
pm2 delete all          # Stop all services
```

## 🔒 Security Notes

- This setup is for **development only**
- Network access is limited to your local network
- No external internet access required
- All API calls proxy through Supabase functions

## 📝 Maintenance

### Regular Updates:
1. Server will auto-restart on file changes (Hot Module Replacement)
2. Configuration changes require server restart
3. Browser cache may need clearing after major updates

### Backup Configuration:
All configuration files are version controlled and will persist across:
- System restarts
- Code updates
- Team member setups
- Deployment environments

---

**Last Updated**: $(date)
**Configuration Version**: 1.0
**Status**: ✅ Active and Permanent
