#!/usr/bin/env node

import http from 'http';
import os from 'os';

// Simple test server for network connectivity
const createTestServer = () => {
  const port = 3001;
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>STOLEN Platform - Network Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            text-align: center;
        }
        h1 {
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .status {
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .info {
            background: rgba(33, 150, 243, 0.2);
            border: 2px solid #2196F3;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        .button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.2em;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 5px 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
        }
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 STOLEN Platform</h1>
        <h2>Network Connectivity Test</h2>
        
        <div class="status">
            <h3>✅ Connection Successful!</h3>
            <p>Your device can successfully connect to the development server.</p>
        </div>
        
        <div class="info">
            <h4>📱 Device Information:</h4>
            <p><strong>User Agent:</strong> <code id="userAgent"></code></p>
            <p><strong>Screen Size:</strong> <code id="screenSize"></code></p>
            <p><strong>Viewport:</strong> <code id="viewport"></code></p>
            <p><strong>Connection Time:</strong> <code id="connectionTime"></code></p>
        </div>
        
        <div class="info">
            <h4>🌐 Server Information:</h4>
            <p><strong>Server:</strong> Node.js Test Server</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <button class="button" onclick="testConnection()">Test Connection</button>
        <button class="button" onclick="goToApp()">Go to STOLEN App</button>
        
        <div class="info">
            <h4>🧪 Next Steps:</h4>
            <p>1. Start the main app: <code>npm run dev:network</code></p>
            <p>2. Visit: <code>http://[YOUR-IP]:8080</code></p>
            <p>3. Test the STOLEN Platform on this device</p>
        </div>
    </div>

    <script>
        // Update device information
        document.getElementById('userAgent').textContent = navigator.userAgent;
        document.getElementById('screenSize').textContent = screen.width + 'x' + screen.height;
        document.getElementById('viewport').textContent = window.innerWidth + 'x' + window.innerHeight;
        document.getElementById('connectionTime').textContent = new Date().toLocaleTimeString();
        
        function testConnection() {
            fetch('${req.headers.host ? 'http://' + req.headers.host : ''}/test')
                .then(response => response.text())
                .then(data => {
                    alert('✅ Test successful! Server responded at: ' + new Date().toLocaleTimeString());
                })
                .catch(error => {
                    alert('❌ Test failed: ' + error.message);
                });
        }
        
        function goToApp() {
            const host = window.location.hostname;
            const appUrl = 'http://' + host + ':8080';
            window.open(appUrl, '_blank');
        }
        
        // Auto-update viewport on resize
        window.addEventListener('resize', () => {
            document.getElementById('viewport').textContent = window.innerWidth + 'x' + window.innerHeight;
        });
    </script>
</body>
</html>`;
    
    if (req.url === '/test') {
      res.end('Test successful at ' + new Date().toISOString());
    } else {
      res.end(html);
    }
  });
  
  return { server, port };
};

// Get network interfaces
const getNetworkInfo = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  
  return addresses;
};

// Start test server
const startTestServer = () => {
  const { server, port } = createTestServer();
  const networkInfo = getNetworkInfo();
  
  server.listen(port, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 STOLEN Platform - Network Test Server');
    console.log('='.repeat(60));
    
    console.log('\n📱 Test URLs (open on any device):');
    console.log(`   • Local: http://localhost:${port}`);
    
    if (networkInfo.length > 0) {
      networkInfo.forEach(({ interface: iface, address }) => {
        console.log(`   • ${iface}: http://${address}:${port}`);
      });
    }
    
    console.log('\n🔧 Instructions:');
    console.log('   1. Open any of the URLs above on your devices');
    console.log('   2. Verify connectivity works');
    console.log('   3. Use the "Go to STOLEN App" button to test main app');
    console.log('   4. Press Ctrl+C to stop this test server\n');
    
    console.log('Server running... Press Ctrl+C to stop');
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping test server...');
    server.close(() => {
      console.log('✅ Test server stopped successfully');
      process.exit(0);
    });
  });
};

// Start test server if this module is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startTestServer();
}

export { startTestServer, getNetworkInfo };
