# 🔴 Redis Setup Guide for Performance Optimization

## Option 1: Redis Cloud (Recommended - Free Tier)

### Step 1: Create Redis Cloud Account
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Click "Start Free"
3. Sign up with your email or GitHub account

### Step 2: Create Database
1. Click "Create Database"
2. Choose "Free" plan
3. Select your preferred cloud provider (AWS, GCP, Azure)
4. Choose a region close to your users
5. Click "Create Database"

### Step 3: Get Connection Details
1. Click on your database
2. Go to "Configuration" tab
3. Copy the connection string
4. It will look like: `redis://username:password@host:port`

### Step 4: Update Environment Variables
Add to your `.env` file:
```bash
REDIS_URL=redis://username:password@host:port
```

## Option 2: Upstash Redis (Alternative Free Option)

### Step 1: Create Upstash Account
1. Go to [Upstash](https://upstash.com/)
2. Click "Get Started"
3. Sign up with GitHub or email

### Step 2: Create Database
1. Click "Create Database"
2. Choose "Free" plan
3. Select region
4. Click "Create"

### Step 3: Get Connection String
1. Click on your database
2. Copy the "UPSTASH_REDIS_REST_URL"
3. Format: `redis://username:password@host:port`

## Option 3: Local Redis (Development Only)

### Install Redis Locally
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Windows (WSL)
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Test Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

## Verification

Test your Redis connection:
```bash
# Install redis-cli if needed
npm install -g redis-cli

# Test connection
redis-cli -u YOUR_REDIS_URL ping
```

## Environment Variable
Add to your `.env` file:
```bash
REDIS_URL=your-redis-connection-string
```

## Next Steps
1. Complete Redis setup
2. Move to Cloudinary setup
3. Test connection in your app
