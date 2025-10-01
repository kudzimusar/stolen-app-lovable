#!/bin/bash

# Stolen App Server Manager
# This script provides a unified interface for managing the Stolen App servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header() {
    echo -e "${BLUE}"
    echo "================================="
    echo "  Stolen App Server Manager"
    echo "================================="
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_pm2() {
    if command -v pm2 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

create_logs_directory() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_status "Created logs directory"
    fi
}

start_servers() {
    print_header
    print_info "Starting Stolen App servers..."
    
    if ! check_pm2; then
        print_error "PM2 is not installed. Please install it first: npm install -g pm2"
        exit 1
    fi
    
    create_logs_directory
    
    # Check if servers are already running
    if pm2 list | grep -q "stolen-app"; then
        print_warning "Some servers are already running. Stopping them first..."
        pm2 delete all 2>/dev/null || true
    fi
    
    # Start servers using PM2
    print_info "Starting servers with PM2..."
    pm2 start ecosystem.config.cjs
    
    # Wait a moment for servers to start
    sleep 3
    
    # Check server status
    print_info "Checking server status..."
    pm2 status
    
    print_status "Servers started successfully!"
    print_info "Access URLs:"
    echo "  • Dashboard: http://localhost:3000"
    echo "  • Development: http://localhost:8081"
    echo "  • Preview: http://localhost:4173"
    echo "  • Network Access: http://$LOCAL_IP:8081"
}

stop_servers() {
    print_header
    print_info "Stopping all Stolen App servers..."
    
    if check_pm2; then
        pm2 stop ecosystem.config.cjs
        print_status "All servers stopped"
    else
        print_error "PM2 is not installed"
        exit 1
    fi
}

restart_servers() {
    print_header
    print_info "Restarting all Stolen App servers..."
    
    if check_pm2; then
        pm2 restart ecosystem.config.cjs
        print_status "All servers restarted"
    else
        print_error "PM2 is not installed"
        exit 1
    fi
}

show_status() {
    print_header
    print_info "Server Status:"
    
    if check_pm2; then
        pm2 status
    else
        print_error "PM2 is not installed"
        exit 1
    fi
    
    echo ""
    print_info "Port Status:"
    for port in 3000 8081 4173; do
        if check_port $port; then
            print_status "Port $port: In use"
        else
            print_error "Port $port: Available"
        fi
    done
}

show_logs() {
    print_header
    print_info "Showing server logs..."
    
    if check_pm2; then
        pm2 logs
    else
        print_error "PM2 is not installed"
        exit 1
    fi
}

delete_servers() {
    print_header
    print_warning "This will delete all PM2 processes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        if check_pm2; then
            pm2 delete all
            print_status "All servers deleted"
        else
            print_error "PM2 is not installed"
            exit 1
        fi
    else
        print_info "Operation cancelled"
    fi
}

show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all servers"
    echo "  stop      Stop all servers"
    echo "  restart   Restart all servers"
    echo "  status    Show server status"
    echo "  logs      Show server logs"
    echo "  delete    Delete all PM2 processes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start all servers"
    echo "  $0 status     # Check server status"
    echo "  $0 logs       # View server logs"
}

# Main script logic
case "${1:-help}" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    restart)
        restart_servers
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    delete)
        delete_servers
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
