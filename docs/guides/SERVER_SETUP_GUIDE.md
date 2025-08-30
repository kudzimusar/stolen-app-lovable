# 🚀 Stolen App Server Setup Guide

This guide will help you set up and manage your Stolen App servers with monitoring dashboard and auto-restart capabilities.

## 📋 Overview

The server setup includes:
- **Development Server** (Port 8080) - For development and testing
- **Preview Server** (Port 4173) - For production preview
- **Monitor Dashboard** (Port 3000) - Real-time server monitoring
- **Auto-restart capabilities** - Servers automatically restart if they crash
- **Network accessibility** - Accessible from other devices on your network

## 🛠️ Quick Start

### Option 1: Using PM2 (Recommended)

PM2 provides robust process management with auto-restart capabilities.

```bash
# Start all servers with PM2
./start-servers.sh start

# Or using npm
npm run monitor:pm2
```

### Option 2: Simple Mode (Without PM2)

For quick testing without PM2 installation:

```bash
# Start servers without PM2
./start-servers.sh start:simple

# Or using npm
npm run monitor
```

## 🌐 Access URLs

Once started, you can access your servers at:

### Local Access
- **Dashboard**: http://localhost:3000
- **Development Server**: http://localhost:8080
- **Preview Server**: http://localhost:4173

### Network Access (for other devices)
- **Dashboard**: http://[YOUR_IP]:3000
- **Development Server**: http://[YOUR_IP]:8080
- **Preview Server**: http://[YOUR_IP]:4173

Replace `[YOUR_IP]` with your computer's local IP address (shown in the startup output).

## 📊 Monitor Dashboard

The dashboard provides:
- Real-time server status monitoring
- Uptime tracking
- Restart count and history
- Manual server control (start/stop/restart)
- Auto-refresh every 5 seconds
- Beautiful UI with the Stolen logo

### Dashboard Features
- **Server Status**: Shows if each server is running, stopped, or restarting
- **Uptime**: Displays how long each server has been running
- **Restart Count**: Shows how many times each server has restarted
- **Manual Controls**: Start, stop, or restart servers with one click
- **System Info**: Dashboard URL, last update time, and configuration details

## 🔧 Server Management Commands

### Using the Script
```bash
# Show server status
./start-servers.sh status

# Stop all servers
./start-servers.sh stop

# Restart all servers
./start-servers.sh restart

# Show server logs
./start-servers.sh logs

# Start only the monitor dashboard
./start-servers.sh monitor
```

### Using NPM Scripts (PM2 mode)
```bash
# Check PM2 status
npm run monitor:pm2:status

# View PM2 logs
npm run monitor:pm2:logs

# Stop all servers
npm run monitor:pm2:stop

# Restart all servers
npm run monitor:pm2:restart

# Delete all PM2 processes
npm run monitor:pm2:delete
```

## 🔄 Auto-Restart Features

### PM2 Mode
- **Auto-restart**: Enabled by default
- **Max restarts**: 10 per server
- **Restart delay**: 5 seconds between restarts
- **Memory limit**: 1GB per server (restarts if exceeded)
- **Min uptime**: 10 seconds (prevents rapid restart loops)

### Simple Mode
- **Auto-restart**: Enabled by default
- **Max restarts**: 10 per server
- **Restart delay**: 5 seconds between restarts
- **Graceful shutdown**: Proper cleanup on exit

## 📁 File Structure

```
├── server-monitor.js          # Main monitoring server
├── pm2.config.js             # PM2 configuration
├── start-servers.sh          # Management script
├── public/
│   └── index.html            # Dashboard UI
├── logs/                     # Server logs directory
│   ├── stolen-app-dev-*.log
│   ├── stolen-app-preview-*.log
│   └── server-monitor-*.log
└── package.json              # Updated with new scripts
```

## 🚨 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Find processes using the ports
lsof -i :3000
lsof -i :8080
lsof -i :4173

# Kill the processes
kill -9 [PID]
```

### PM2 Issues
```bash
# Reset PM2
pm2 delete all
pm2 kill
pm2 start pm2.config.js
```

### Permission Issues
```bash
# Make script executable
chmod +x start-servers.sh

# Install PM2 globally (if needed)
npm install -g pm2
```

### Network Access Issues
1. Check your firewall settings
2. Ensure the servers are bound to `0.0.0.0` (not just localhost)
3. Verify your local IP address is correct

## 🔒 Security Considerations

- The servers are configured for development/testing use
- Network access is enabled for easy testing across devices
- Consider using a reverse proxy (like nginx) for production
- Monitor logs for any suspicious activity

## 📈 Performance Monitoring

### Log Files
- Check `logs/` directory for detailed server logs
- Each server has separate error, output, and combined log files
- Logs include timestamps for easy debugging

### Resource Usage
- Monitor memory usage through the dashboard
- PM2 automatically restarts servers if they exceed 1GB memory
- Check system resources using `htop` or Activity Monitor

## 🎯 Testing with Friends

To share your servers with friends for testing:

1. **Start the servers**:
   ```bash
   ./start-servers.sh start
   ```

2. **Find your IP address** (shown in startup output)

3. **Share the URLs**:
   - Dashboard: `http://[YOUR_IP]:3000`
   - App: `http://[YOUR_IP]:8080`

4. **Ensure network access**:
   - Both devices must be on the same network
   - Firewall must allow connections on ports 3000 and 8080

## 🔧 Advanced Configuration

### Customizing Server Ports
Edit `pm2.config.js` or `server-monitor.js` to change ports:

```javascript
// In pm2.config.js
env: {
  PORT: 8080  // Change this to your preferred port
}
```

### Adding More Servers
Add new server configurations to `pm2.config.js`:

```javascript
{
  name: 'my-new-server',
  script: 'npm',
  args: 'run my-script',
  // ... other configuration
}
```

### Custom Auto-restart Rules
Modify restart settings in `pm2.config.js`:

```javascript
max_restarts: 5,        // Maximum restart attempts
min_uptime: '30s',      // Minimum uptime before considering stable
restart_delay: 10000,   // Delay between restarts (ms)
```

## 📞 Support

If you encounter issues:

1. Check the logs in the `logs/` directory
2. Use the dashboard to monitor server status
3. Try restarting the servers
4. Check the troubleshooting section above

## 🎉 Success!

Your Stolen App servers are now running with:
- ✅ Auto-restart capabilities
- ✅ Real-time monitoring dashboard
- ✅ Network accessibility
- ✅ Beautiful UI with your logo
- ✅ Comprehensive logging
- ✅ Easy management commands

Happy testing! 🚀
