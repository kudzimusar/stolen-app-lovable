#!/bin/bash

# 🚀 Real Polygon Blockchain - Quick Start Script
# This script sets up REAL blockchain integration for your Lost & Found feature

set -e  # Exit on error

echo "🚀 Setting up REAL Polygon Blockchain..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing blockchain dependencies...${NC}"

npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Check for .env file
echo -e "${YELLOW}Step 3: Checking environment configuration...${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp blockchain.env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${RED}⚠️  IMPORTANT: You need to add your private key to .env file!${NC}"
    echo ""
    echo "Get your private key from MetaMask:"
    echo "1. Open MetaMask"
    echo "2. Click three dots (...) > Account Details"
    echo "3. Show Private Key"
    echo "4. Copy and paste into .env file as PRIVATE_KEY=your_key_here"
    echo ""
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

# Check if private key is set
if grep -q "PRIVATE_KEY=your_private_key_here" .env; then
    echo -e "${RED}⚠️  WARNING: Default private key detected!${NC}"
    echo -e "${RED}Please update PRIVATE_KEY in .env file with your actual key${NC}"
    echo ""
fi

# Step 4: Get test MATIC
echo -e "${YELLOW}Step 4: Getting FREE test MATIC...${NC}"
echo ""
echo "To get FREE test MATIC:"
echo "1. Install MetaMask: https://metamask.io"
echo "2. Add Mumbai network:"
echo "   - Network Name: Polygon Mumbai"
echo "   - RPC URL: https://rpc-mumbai.maticvigil.com"
echo "   - Chain ID: 80001"
echo "   - Currency: MATIC"
echo "3. Visit faucet: https://faucet.polygon.technology"
echo "4. Request test MATIC (completely FREE!)"
echo ""
read -p "Press Enter once you have test MATIC..."

# Step 5: Deploy smart contract
echo -e "${YELLOW}Step 5: Deploying smart contract to Mumbai testnet...${NC}"
echo ""

# Check if private key is configured
if grep -q "your_private_key_here" .env; then
    echo -e "${RED}❌ Cannot deploy: Please configure PRIVATE_KEY in .env first${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add your private key to .env"
    echo "2. Run: npx hardhat run scripts/deploy.js --network mumbai"
    exit 1
fi

echo "Deploying contract..."
npx hardhat run scripts/deploy.js --network mumbai

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Smart contract deployed successfully!${NC}"
    echo ""
    echo "Copy the contract address and add it to your .env file:"
    echo "VITE_DEVICE_REGISTRY_ADDRESS=0xYOUR_CONTRACT_ADDRESS"
    echo ""
else
    echo -e "${RED}❌ Deployment failed. Please check your configuration.${NC}"
    exit 1
fi

# Step 6: Deploy edge function
echo -e "${YELLOW}Step 6: Deploying Supabase edge function...${NC}"
echo ""

if command -v supabase &> /dev/null; then
    echo "Setting Supabase secrets..."
    
    # Get private key from .env
    PRIVATE_KEY=$(grep PRIVATE_KEY .env | cut -d '=' -f2)
    CONTRACT_ADDRESS=$(grep VITE_DEVICE_REGISTRY_ADDRESS .env | cut -d '=' -f2)
    
    if [ ! -z "$PRIVATE_KEY" ] && [ "$PRIVATE_KEY" != "your_private_key_here" ]; then
        supabase secrets set BLOCKCHAIN_PRIVATE_KEY="$PRIVATE_KEY"
        echo -e "${GREEN}✅ BLOCKCHAIN_PRIVATE_KEY set${NC}"
    fi
    
    if [ ! -z "$CONTRACT_ADDRESS" ]; then
        supabase secrets set DEVICE_REGISTRY_ADDRESS="$CONTRACT_ADDRESS"
        echo -e "${GREEN}✅ DEVICE_REGISTRY_ADDRESS set${NC}"
    fi
    
    supabase secrets set POLYGON_RPC_URL="https://rpc-mumbai.maticvigil.com"
    echo -e "${GREEN}✅ POLYGON_RPC_URL set${NC}"
    
    echo "Deploying edge function..."
    supabase functions deploy blockchain-anchor-real
    
    echo -e "${GREEN}✅ Edge function deployed!${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Skipping edge function deployment.${NC}"
    echo "Install: npm install -g supabase"
    echo "Then run: supabase functions deploy blockchain-anchor-real"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update src/lib/services/lost-found-blockchain-service.ts"
echo "   Change: blockchain-operations → blockchain-anchor-real"
echo "2. Start your app: npm run dev"
echo "3. Test Lost & Found with blockchain enabled"
echo "4. Check transaction on: https://mumbai.polygonscan.com"
echo ""
echo -e "${GREEN}You now have REAL blockchain integration! 🚀${NC}"



