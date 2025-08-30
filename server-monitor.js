#!/usr/bin/env node

import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServerMonitor {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.servers = {
      'stolen-app-dev': { port: 8080, status: 'unknown', uptime: 0, restarts: 0 },
      'stolen-app-preview': { port: 4173, status: 'unknown', uptime: 0, restarts: 0 }
    };
    this.startTime = Date.now();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.startMonitoring();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // API Routes
    this.app.get('/api/status', (req, res) => {
      res.json({
        monitor: {
          uptime: Date.now() - this.startTime,
          status: 'running'
        },
        servers: this.servers
      });
    });

    this.app.post('/api/restart/:server', (req, res) => {
      const serverName = req.params.server;
      if (this.servers[serverName]) {
        this.restartServer(serverName);
        res.json({ success: true, message: `Restarting ${serverName}` });
      } else {
        res.status(404).json({ success: false, message: 'Server not found' });
      }
    });

    this.app.get('/api/logs/:server', (req, res) => {
      const serverName = req.params.server;
      const logFile = `./logs/${serverName}-combined.log`;
      
      if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8');
        res.json({ logs });
      } else {
        res.status(404).json({ error: 'Log file not found' });
      }
    });

    // Dashboard route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  async checkServerStatus(serverName, port) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        this.servers[serverName].status = 'online';
        this.servers[serverName].uptime = Date.now() - this.startTime;
      } else {
        this.servers[serverName].status = 'error';
      }
    } catch (error) {
      this.servers[serverName].status = 'offline';
    }
  }

  async restartServer(serverName) {
    try {
      const pm2 = spawn('pm2', ['restart', serverName]);
      
      pm2.stdout.on('data', (data) => {
        console.log(`PM2 restart output: ${data}`);
      });
      
      pm2.stderr.on('data', (data) => {
        console.error(`PM2 restart error: ${data}`);
      });
      
      pm2.on('close', (code) => {
        if (code === 0) {
          console.log(`Successfully restarted ${serverName}`);
          this.servers[serverName].restarts++;
        } else {
          console.error(`Failed to restart ${serverName}`);
        }
      });
    } catch (error) {
      console.error(`Error restarting ${serverName}:`, error);
    }
  }

  startMonitoring() {
    // Check server status every 10 seconds
    setInterval(() => {
      Object.keys(this.servers).forEach(serverName => {
        const port = this.servers[serverName].port;
        this.checkServerStatus(serverName, port);
      });
    }, 10000);

    // Initial status check
    setTimeout(() => {
      Object.keys(this.servers).forEach(serverName => {
        const port = this.servers[serverName].port;
        this.checkServerStatus(serverName, port);
      });
    }, 2000);
  }

  start() {
    this.app.listen(this.port, () => {
      const localIP = this.getLocalIP();
      console.log('🚀 Server Monitor Dashboard');
      console.log('==========================');
      console.log(`📍 Local: http://localhost:${this.port}`);
      console.log(`🌐 Network: http://${localIP}:${this.port}`);
      console.log(`📊 API: http://localhost:${this.port}/api/status`);
      console.log('');
      console.log('📋 Monitored Servers:');
      Object.keys(this.servers).forEach(serverName => {
        const port = this.servers[serverName].port;
        console.log(`   • ${serverName}: http://localhost:${port}`);
      });
      console.log('');
      console.log('✅ Monitor is running and checking server status every 10 seconds');
    });
  }
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start the monitor
const monitor = new ServerMonitor();
monitor.start();
