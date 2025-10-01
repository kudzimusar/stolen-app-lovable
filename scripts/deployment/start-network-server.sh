#!/bin/bash

# Stolen App Network Server Startup Script
# This script ensures the development server starts with network access by default

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "================================="
    echo "  Stolen App Network Server"
    echo "================================="
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Get local IP address
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1"
    else
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "127.0.0.1"
    fi
}

LOCAL_IP=$(get_local_ip)

print_header
print_info "Starting Stolen App with network access..."

# Kill any existing processes on port 8081
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 8081 is in use. Stopping existing processes..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the server with network access
print_info "Starting development server..."
print_status "Server will be accessible on:"
echo "  • Local: http://localhost:8081"
echo "  • Network: http://$LOCAL_IP:8081"
echo ""

# Start server in background
nohup npm run dev:network > /tmp/stolen-app-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server started successfully
if ps -p $SERVER_PID > /dev/null; then
    print_status "Server started successfully (PID: $SERVER_PID)"
    print_status "Server is running in background continuously"
    echo ""
    print_info "To view logs: tail -f /tmp/stolen-app-server.log"
    print_info "To stop server: kill $SERVER_PID"
    print_info "To restart: ./start-network-server.sh"
else
    print_warning "Server may have failed to start. Check logs: tail /tmp/stolen-app-server.log"
fi
