#!/usr/bin/env node

/**
 * Load environment variables from api.env and run the coherence enforcer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load environment variables from api.env
function loadEnvFile() {
  const envPath = path.join(projectRoot, 'docs', 'api.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Environment file not found:', envPath);
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    }
  }
  
  console.log('✅ Environment variables loaded from docs/api.env');
}

// Load environment and run the coherence enforcer
loadEnvFile();

// Import and run the coherence enforcer
const { spawn } = await import('child_process');

const args = process.argv.slice(2);
const child = spawn('node', ['scripts/ai-coherence-enforcer.js', ...args], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  process.exit(code);
});
