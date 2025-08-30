#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Stolen App Environment Setup');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  console.log('📝 Please update the following values in your .env file:\n');
} else {
  console.log('📝 Creating new .env file...\n');
}

const envTemplate = `# Stolen App Environment Configuration
# Replace the placeholder values with your actual service credentials

# Existing Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Performance Optimization Services Configuration

# Redis Configuration (Choose one option)
# Option 1: Redis Cloud
REDIS_URL=redis://username:password@host:port
# Option 2: Upstash Redis
# REDIS_URL=redis://username:password@host:port
# Option 3: Local Redis (Development only)
# REDIS_URL=redis://localhost:6379

# Cloudinary Image Optimization
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=stolen-app

# Algolia Search Optimization
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_SEARCH_KEY=your-search-key
VITE_ALGOLIA_ADMIN_KEY=your-admin-key

# Sentry Performance Monitoring
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Performance Settings
VITE_CACHE_TTL=3600
VITE_API_RATE_LIMIT=100
VITE_IMAGE_QUALITY=85
VITE_SEARCH_DEBOUNCE=300

# Development Settings
NODE_ENV=development
VITE_DEBUG_PERFORMANCE=true

# Google Studio API (existing)
GOOGLE_STUDIO_API_KEY=AIzaSyCwGezq21MUjfchf5DxWnRSKXqQd4YxvAI
VITE_GOOGLE_STUDIO_API_KEY=AIzaSyCwGezq21MUjfchf5DxWnRSKXqQd4YxvAI
`;

if (!envExists) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!\n');
}

console.log('🔧 Required Environment Variables:\n');

console.log('1. REDIS_URL');
console.log('   - Get from Redis Cloud or Upstash');
console.log('   - Format: redis://username:password@host:port\n');

console.log('2. CLOUDINARY_CLOUD_NAME');
console.log('   - Get from Cloudinary dashboard');
console.log('   - Example: my-cloud-name\n');

console.log('3. CLOUDINARY_API_KEY');
console.log('   - Get from Cloudinary dashboard');
console.log('   - Example: 123456789012345\n');

console.log('4. CLOUDINARY_API_SECRET');
console.log('   - Get from Cloudinary dashboard');
console.log('   - Example: abcdefghijklmnopqrstuvwxyz\n');

console.log('5. VITE_ALGOLIA_APP_ID');
console.log('   - Get from Algolia dashboard');
console.log('   - Example: ABC123DEF4\n');

console.log('6. VITE_ALGOLIA_SEARCH_KEY');
console.log('   - Get from Algolia dashboard (Search-Only API Key)');
console.log('   - Example: abc123def456ghi789\n');

console.log('7. VITE_ALGOLIA_ADMIN_KEY');
console.log('   - Get from Algolia dashboard (Admin API Key)');
console.log('   - Example: xyz789abc123def456\n');

console.log('8. VITE_SENTRY_DSN');
console.log('   - Get from Sentry project settings');
console.log('   - Format: https://key@sentry.io/project-id\n');

console.log('📋 Setup Checklist:');
console.log('□ Redis Cloud/Upstash account created');
console.log('□ Cloudinary account created');
console.log('□ Algolia account created');
console.log('□ Sentry account created');
console.log('□ All environment variables updated');
console.log('□ Services tested');

console.log('\n📚 Setup Guides:');
console.log('- Redis: REDIS_SETUP_GUIDE.md');
console.log('- Cloudinary: CLOUDINARY_SETUP_GUIDE.md');
console.log('- Algolia: ALGOLIA_SETUP_GUIDE.md');
console.log('- Sentry: SENTRY_SETUP_GUIDE.md');

console.log('\n🎯 Next Steps:');
console.log('1. Follow the setup guides for each service');
console.log('2. Update your .env file with real credentials');
console.log('3. Test each service connection');
console.log('4. Restart your development server');
console.log('5. Monitor performance improvements');

console.log('\n🚀 Happy optimizing!');
