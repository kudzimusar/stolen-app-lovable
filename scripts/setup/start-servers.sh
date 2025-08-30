#!/bin/bash

# Stolen App Server Management Script
# This script provides easy management of development and preview servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  Stolen App Server Manager${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Function to get local IP address
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    else
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    fi
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check if PM2 is installed
check_pm2() {
    if command -v pm2 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install PM2 if not present
install_pm2() {
    print_warning "PM2 is not installed. Installing PM2..."
    npm install -g pm2
    print_status "PM2 installed successfully!"
}

# Function to start servers with PM2
start_with_pm2() {
    if ! check_pm2; then
        install_pm2
    fi
    
    print_status "Starting servers with PM2..."
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Start all servers using PM2
    pm2 start ecosystem.config.cjs
    
    print_status "All servers started with PM2!"
    print_status "Dashboard: http://localhost:3000"
    print_status "Development server: http://localhost:8080"
    print_status "Preview server: http://localhost:4173"
    
    local_ip=$(get_local_ip)
    if [ "$local_ip" != "localhost" ]; then
        print_status "Network access:"
        print_status "  Dashboard: http://$local_ip:3000"
        print_status "  Development: http://$local_ip:8080"
        print_status "  Preview: http://$local_ip:4173"
    fi
    
    print_status "Use 'npm run monitor:pm2:status' to check server status"
    print_status "Use 'npm run monitor:pm2:logs' to view logs"
}

# Function to start servers without PM2
start_without_pm2() {
    print_status "Starting servers without PM2..."
    
    # Check if ports are available
    if check_port 3000; then
        print_error "Port 3000 is already in use"
        exit 1
    fi
    
    if check_port 8080; then
        print_error "Port 8080 is already in use"
        exit 1
    fi
    
    if check_port 4173; then
        print_error "Port 4173 is already in use"
        exit 1
    fi
    
    # Start the monitor server
    print_status "Starting server monitor..."
    node server-monitor.js &
    MONITOR_PID=$!
    
    print_status "Server monitor started with PID: $MONITOR_PID"
    print_status "Dashboard: http://localhost:3000"
    
    local_ip=$(get_local_ip)
    if [ "$local_ip" != "localhost" ]; then
        print_status "Network access: http://$local_ip:3000"
    fi
    
    # Save PID to file for later cleanup
    echo $MONITOR_PID > .server-monitor.pid
    
    print_status "Servers are starting up..."
    print_status "Press Ctrl+C to stop all servers"
    
    # Wait for user interrupt
    trap 'cleanup' INT
    wait $MONITOR_PID
}

# Function to cleanup processes
cleanup() {
    print_status "Shutting down servers..."
    
    # Kill monitor process if PID file exists
    if [ -f .server-monitor.pid ]; then
        kill $(cat .server-monitor.pid) 2>/dev/null || true
        rm .server-monitor.pid
    fi
    
    # Kill any remaining node processes on our ports
    pkill -f "server-monitor.js" 2>/dev/null || true
    pkill -f "vite.*8080" 2>/dev/null || true
    pkill -f "vite.*4173" 2>/dev/null || true
    
    print_status "All servers stopped"
    exit 0
}

# Function to show status
show_status() {
    print_header
    
    local_ip=$(get_local_ip)
    
    echo -e "${BLUE}Server Status:${NC}"
    echo "=================="
    
    if check_port 3000; then
        echo -e "${GREEN}✓ Dashboard${NC} - http://localhost:3000"
        echo -e "  Network: http://$local_ip:3000"
    else
        echo -e "${RED}✗ Dashboard${NC} - Not running"
    fi
    
    if check_port 8080; then
        echo -e "${GREEN}✓ Development${NC} - http://localhost:8080"
        echo -e "  Network: http://$local_ip:8080"
    else
        echo -e "${RED}✗ Development${NC} - Not running"
    fi
    
    if check_port 4173; then
        echo -e "${GREEN}✓ Preview${NC} - http://localhost:4173"
        echo -e "  Network: http://$local_ip:4173"
    else
        echo -e "${RED}✗ Preview${NC} - Not running"
    fi
    
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo "====================="
    echo "  start          - Start servers with PM2 (recommended)"
    echo "  start:simple   - Start servers without PM2"
    echo "  stop           - Stop all servers"
    echo "  restart        - Restart all servers"
    echo "  status         - Show server status"
    echo "  logs           - Show server logs"
    echo "  monitor        - Start only the monitor dashboard"
}

# Function to show logs
show_logs() {
    if check_pm2; then
        pm2 logs
    else
        print_warning "PM2 not installed. Cannot show logs."
        print_status "Check the logs directory for log files."
    fi
}

# Main script logic
case "${1:-}" in
    "start")
        print_header
        start_with_pm2
        ;;
    "start:simple")
        print_header
        start_without_pm2
        ;;
    "stop")
        print_header
        if check_pm2; then
            pm2 stop ecosystem.config.cjs
            print_status "All servers stopped"
        else
            cleanup
        fi
        ;;
    "restart")
        print_header
        if check_pm2; then
            pm2 restart ecosystem.config.cjs
            print_status "All servers restarted"
        else
            print_warning "PM2 not installed. Use 'start' to start servers with PM2."
        fi
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "monitor")
        print_header
        print_status "Starting monitor dashboard only..."
        node server-monitor.js
        ;;
    *)
        show_status
        ;;
esac
