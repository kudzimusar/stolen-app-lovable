#!/usr/bin/env node

import os from 'os';
import { createRequire } from 'module';

// Handle chalk import for enhanced colors (optional)
const require = createRequire(import.meta.url);
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  // Chalk not available, will use plain console
}

// Get network interfaces
const getNetworkInfo = () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
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

// Display server information
const displayServerInfo = () => {
  const networkInfo = getNetworkInfo();
  const port = process.env.PORT || 8080;
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 STOLEN Platform Development Server');
  console.log('='.repeat(60));
  
  console.log('\n📱 Network Access URLs:');
  console.log('   Use these URLs to test on different devices\n');
  
  // Local URLs
  console.log('🏠 Local Development:');
  console.log(`   • http://localhost:${port}`);
  console.log(`   • http://127.0.0.1:${port}\n`);
  
  // Network URLs
  console.log('🌐 Network Access (for other devices):');
  if (networkInfo.length === 0) {
    console.log('   ❌ No network interfaces found');
    console.log('   🔧 Check your network connection\n');
  } else {
    networkInfo.forEach(({ interface: iface, address }) => {
      const url = `http://${address}:${port}`;
      console.log(`   • ${iface}: ${url}`);
    });
    console.log('');
  }
  
  // Testing instructions
  console.log('📋 Testing Instructions:');
  console.log('   1. Start the server: npm run dev:network');
  console.log('   2. On mobile/tablet: Connect to same WiFi');
  console.log('   3. Open browser and visit network URL');
  console.log('   4. Test responsive design and features\n');
  
  // Device testing checklist
  console.log('🧪 Device Testing Checklist:');
  console.log('   ✓ Mobile phones (iOS/Android)');
  console.log('   ✓ Tablets (iPad/Android tablets)');
  console.log('   ✓ Different browsers (Chrome, Safari, Firefox)');
  console.log('   ✓ Desktop computers on same network');
  console.log('   ✓ Test bottom navigation on mobile');
  console.log('   ✓ Test responsive breakpoints\n');
  
  // Security note
  console.log('🔒 Security Notes:');
  console.log('   • Development server only - not for production');
  console.log('   • Only accessible on your local network');
  console.log('   • Firewall may block external connections\n');
  
  // Troubleshooting
  console.log('🔧 Troubleshooting:');
  console.log('   • Port in use? Try: npm run dev:local');
  console.log('   • Can\'t connect? Check firewall settings');
  console.log('   • Network issues? Restart router/WiFi');
  console.log('   • Still issues? Use ngrok for tunneling\n');
  
  console.log('='.repeat(60));
  console.log('Starting development server...\n');
};

// Add chalk if available, otherwise use plain text
const chalkAvailable = !!chalk;

if (chalkAvailable) {
  // Enhanced with colors if chalk is available
  const enhancedDisplay = () => {
    const networkInfo = getNetworkInfo();
    const port = process.env.PORT || 8080;
    
    console.log('\n' + chalk.blue('='.repeat(60)));
    console.log(chalk.green.bold('🚀 STOLEN Platform Development Server'));
    console.log(chalk.blue('='.repeat(60)));
    
    console.log('\n' + chalk.yellow.bold('📱 Network Access URLs:'));
    console.log(chalk.gray('   Use these URLs to test on different devices\n'));
    
    console.log(chalk.cyan.bold('🏠 Local Development:'));
    console.log(chalk.white(`   • http://localhost:${port}`));
    console.log(chalk.white(`   • http://127.0.0.1:${port}\n`));
    
    console.log(chalk.green.bold('🌐 Network Access (for other devices):'));
    if (networkInfo.length === 0) {
      console.log(chalk.red('   ❌ No network interfaces found'));
      console.log(chalk.yellow('   🔧 Check your network connection\n'));
    } else {
      networkInfo.forEach(({ interface: iface, address }) => {
        const url = `http://${address}:${port}`;
        console.log(chalk.green(`   • ${chalk.bold(iface)}: ${chalk.underline(url)}`));
      });
      console.log('');
    }
    
    console.log(chalk.magenta.bold('📋 Testing Instructions:'));
    console.log(chalk.white('   1. Start the server: npm run dev:network'));
    console.log(chalk.white('   2. On mobile/tablet: Connect to same WiFi'));
    console.log(chalk.white('   3. Open browser and visit network URL'));
    console.log(chalk.white('   4. Test responsive design and features\n'));
    
    console.log(chalk.blue.bold('🧪 Device Testing Checklist:'));
    console.log(chalk.green('   ✓ Mobile phones (iOS/Android)'));
    console.log(chalk.green('   ✓ Tablets (iPad/Android tablets)'));
    console.log(chalk.green('   ✓ Different browsers (Chrome, Safari, Firefox)'));
    console.log(chalk.green('   ✓ Desktop computers on same network'));
    console.log(chalk.green('   ✓ Test bottom navigation on mobile'));
    console.log(chalk.green('   ✓ Test responsive breakpoints\n'));
    
    console.log(chalk.red.bold('🔒 Security Notes:'));
    console.log(chalk.yellow('   • Development server only - not for production'));
    console.log(chalk.yellow('   • Only accessible on your local network'));
    console.log(chalk.yellow('   • Firewall may block external connections\n'));
    
    console.log(chalk.orange.bold('🔧 Troubleshooting:'));
    console.log(chalk.white('   • Port in use? Try: npm run dev:local'));
    console.log(chalk.white('   • Can\'t connect? Check firewall settings'));
    console.log(chalk.white('   • Network issues? Restart router/WiFi'));
    console.log(chalk.white('   • Still issues? Use ngrok for tunneling\n'));
    
    console.log(chalk.blue('='.repeat(60)));
    console.log(chalk.green.bold('Starting development server...\n'));
  };
  
  // Try to use enhanced version, fall back to basic if needed
  try {
    enhancedDisplay();
  } catch (e) {
    displayServerInfo();
  }
} else {
  displayServerInfo();
}
