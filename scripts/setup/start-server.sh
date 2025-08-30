#!/bin/bash

# STOLEN Platform Development Server Startup Script
# This script provides an easy way to start the development server for multi-device testing

echo ""
echo "🚀 STOLEN Platform Development Server"
echo "======================================"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Display menu
echo "Choose an option:"
echo ""
echo "1) 🌐 Start network server (for multi-device testing)"
echo "2) 🏠 Start local server (localhost only)"
echo "3) 📋 Show network information only"
echo "4) 🧪 Start network connectivity test server"
echo "5) 📖 View development guide"
echo "6) ❌ Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Starting network development server..."
        echo "This will show network URLs and start the server for multi-device testing"
        echo ""
        npm run dev:info
        ;;
    2)
        echo ""
        echo "🏠 Starting local development server..."
        echo "Server will only be accessible from localhost"
        echo ""
        npm run dev:local
        ;;
    3)
        echo ""
        echo "📋 Network Information:"
        npm run server:info
        ;;
    4)
        echo ""
        echo "🧪 Starting network connectivity test server..."
        echo "Open the displayed URLs on your devices to test connectivity"
        echo "Press Ctrl+C to stop the test server"
        echo ""
        npm run test:network
        ;;
    5)
        echo ""
        echo "📖 Opening development guide..."
        if command -v cat &> /dev/null; then
            cat DEVELOPMENT_SERVER_GUIDE.md
        else
            echo "Please open DEVELOPMENT_SERVER_GUIDE.md to read the guide"
        fi
        ;;
    6)
        echo ""
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ Invalid option. Please choose 1-6"
        exit 1
        ;;
esac
