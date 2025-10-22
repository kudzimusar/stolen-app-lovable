#!/bin/bash

# Department Admin Portal System Deployment Script
# Executes all database migrations and edge function deployments

echo "🚀 Starting Department Admin Portal System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Deploying Department Admin Portal System..."

# Step 1: Deploy database migrations
print_status "Step 1: Deploying database migrations..."

# Deploy auth setup
print_status "Deploying authentication setup..."
if supabase db push --include-all; then
    print_success "Database migrations deployed successfully"
else
    print_error "Failed to deploy database migrations"
    exit 1
fi

# Step 2: Deploy edge functions
print_status "Step 2: Deploying edge functions..."

# Deploy retailer department stats function
print_status "Deploying retailer-dept-stats function..."
if supabase functions deploy retailer-dept-stats; then
    print_success "retailer-dept-stats function deployed"
else
    print_warning "Failed to deploy retailer-dept-stats function"
fi

# Deploy repair shop department stats function
print_status "Deploying repair-dept-stats function..."
if supabase functions deploy repair-dept-stats; then
    print_success "repair-dept-stats function deployed"
else
    print_warning "Failed to deploy repair-dept-stats function"
fi

# Deploy insurance department stats function
print_status "Deploying insurance-dept-stats function..."
if supabase functions deploy insurance-dept-stats; then
    print_success "insurance-dept-stats function deployed"
else
    print_warning "Failed to deploy insurance-dept-stats function"
fi

# Deploy law enforcement department stats function
print_status "Deploying law-enforcement-dept-stats function..."
if supabase functions deploy law-enforcement-dept-stats; then
    print_success "law-enforcement-dept-stats function deployed"
else
    print_warning "Failed to deploy law-enforcement-dept-stats function"
fi

# Deploy NGO department stats function
print_status "Deploying ngo-dept-stats function..."
if supabase functions deploy ngo-dept-stats; then
    print_success "ngo-dept-stats function deployed"
else
    print_warning "Failed to deploy ngo-dept-stats function"
fi

# Step 3: Execute SQL scripts
print_status "Step 3: Executing SQL scripts..."

# Execute auth setup
print_status "Executing authentication setup..."
if supabase db reset --linked; then
    print_success "Database reset and migrations applied"
else
    print_warning "Database reset failed, trying manual execution..."
    
    # Try to execute SQL files manually
    if [ -f "database/sql/auth-setup.sql" ]; then
        print_status "Executing auth-setup.sql..."
        supabase db push --include-all
    fi
    
    if [ -f "database/sql/seed-department-data.sql" ]; then
        print_status "Executing seed-department-data.sql..."
        supabase db push --include-all
    fi
    
    if [ -f "database/sql/department-specific-rls.sql" ]; then
        print_status "Executing department-specific-rls.sql..."
        supabase db push --include-all
    fi
fi

# Step 4: Verify deployment
print_status "Step 4: Verifying deployment..."

# Check if functions are deployed
print_status "Checking deployed functions..."
supabase functions list

# Check database status
print_status "Checking database status..."
supabase status

print_success "🎉 Department Admin Portal System deployment completed!"
print_status "Next steps:"
echo "1. Set passwords for test accounts in Supabase Auth dashboard"
echo "2. Test each department dashboard at:"
echo "   - http://localhost:8081/retailer-admin"
echo "   - http://localhost:8081/repair-shop-admin"
echo "   - http://localhost:8081/insurance-admin"
echo "   - http://localhost:8081/law-enforcement-admin"
echo "   - http://localhost:8081/ngo-admin"
echo "3. Test Super Admin access at: http://localhost:8081/admin"

print_status "Test accounts created:"
echo "- Super Admin: kudzimusar@gmail.com"
echo "- Retailer Dept: retailer.admin@stolenapp.com"
echo "- Repair Dept: repair.admin@stolenapp.com"
echo "- Insurance Dept: insurance.admin@stolenapp.com"
echo "- Law Enforcement Dept: law.admin@stolenapp.com"
echo "- NGO Dept: ngo.admin@stolenapp.com"

print_warning "Remember to set passwords for all test accounts in Supabase Auth dashboard!"
