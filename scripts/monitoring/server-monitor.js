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
    this.servers = new Map();
    this.app = express();
    this.port = 3000;
    this.setupExpress();
    this.startServers();
  }

  setupExpress() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // API endpoints for monitoring
    this.app.get('/api/status', (req, res) => {
      const status = Array.from(this.servers.entries()).map(([name, server]) => ({
        name,
        port: server.port,
        status: server.process ? 'running' : 'stopped',
        uptime: server.startTime ? Date.now() - server.startTime : 0,
        restarts: server.restartCount,
        lastRestart: server.lastRestart
      }));
      res.json(status);
    });

    this.app.post('/api/restart/:serverName', (req, res) => {
      const { serverName } = req.params;
      const server = this.servers.get(serverName);
      if (server) {
        this.restartServer(serverName);
        res.json({ success: true, message: `Restarting ${serverName}` });
      } else {
        res.status(404).json({ error: 'Server not found' });
      }
    });

    this.app.post('/api/stop/:serverName', (req, res) => {
      const { serverName } = req.params;
      const server = this.servers.get(serverName);
      if (server) {
        this.stopServer(serverName);
        res.json({ success: true, message: `Stopping ${serverName}` });
      } else {
        res.status(404).json({ error: 'Server not found' });
      }
    });

    this.app.post('/api/start/:serverName', (req, res) => {
      const { serverName } = req.params;
      this.startServer(serverName);
      res.json({ success: true, message: `Starting ${serverName}` });
    });
  }

  startServers() {
    // Define server configurations
    const serverConfigs = [
      {
        name: 'stolen-app-dev',
        port: 8080,
        command: 'npm',
        args: ['run', 'dev:network'],
        cwd: process.cwd(),
        autoRestart: true,
        maxRestarts: 10,
        restartDelay: 5000
      },
      {
        name: 'stolen-app-preview',
        port: 4173,
        command: 'npm',
        args: ['run', 'preview'],
        cwd: process.cwd(),
        autoRestart: true,
        maxRestarts: 10,
        restartDelay: 5000
      }
    ];

    serverConfigs.forEach(config => {
      this.servers.set(config.name, {
        ...config,
        process: null,
        startTime: null,
        restartCount: 0,
        lastRestart: null,
        isRestarting: false
      });
      this.startServer(config.name);
    });
  }

  startServer(serverName) {
    const server = this.servers.get(serverName);
    if (!server || server.process) return;

    console.log(`Starting ${serverName} on port ${server.port}...`);
    
    try {
      const child = spawn(server.command, server.args, {
        cwd: server.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      server.process = child;
      server.startTime = Date.now();
      server.isRestarting = false;

      child.stdout.on('data', (data) => {
        console.log(`[${serverName}] ${data.toString().trim()}`);
      });

      child.stderr.on('data', (data) => {
        console.error(`[${serverName}] ERROR: ${data.toString().trim()}`);
      });

      child.on('close', (code) => {
        console.log(`[${serverName}] Process exited with code ${code}`);
        server.process = null;
        
        if (server.autoRestart && !server.isRestarting && server.restartCount < server.maxRestarts) {
          setTimeout(() => {
            this.restartServer(serverName);
          }, server.restartDelay);
        }
      });

      child.on('error', (error) => {
        console.error(`[${serverName}] Failed to start: ${error.message}`);
        server.process = null;
      });

    } catch (error) {
      console.error(`[${serverName}] Error starting server: ${error.message}`);
    }
  }

  restartServer(serverName) {
    const server = this.servers.get(serverName);
    if (!server) return;

    console.log(`Restarting ${serverName}...`);
    server.isRestarting = true;
    server.restartCount++;
    server.lastRestart = new Date().toISOString();

    if (server.process) {
      server.process.kill('SIGTERM');
    }

    setTimeout(() => {
      this.startServer(serverName);
    }, 2000);
  }

  stopServer(serverName) {
    const server = this.servers.get(serverName);
    if (!server || !server.process) return;

    console.log(`Stopping ${serverName}...`);
    server.autoRestart = false;
    server.process.kill('SIGTERM');
  }

  start() {
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log(`🚀 Server Monitor Dashboard running on http://localhost:${this.port}`);
      console.log(`🌐 Network accessible at http://${this.getLocalIP()}:${this.port}`);
      console.log('📊 Monitor your servers in real-time!');
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
    return 'localhost';
  }
}

// Start the monitor
const monitor = new ServerMonitor();
monitor.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server monitor...');
  monitor.servers.forEach((server, name) => {
    if (server.process) {
      console.log(`Stopping ${name}...`);
      server.process.kill('SIGTERM');
    }
  });
  process.exit(0);
});
