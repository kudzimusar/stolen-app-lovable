#!/bin/bash

# STOLEN App File Organization Script
# This script organizes all project files into logical folders

echo "🚀 Starting STOLEN App file organization..."

# Create main directory structure
echo "📁 Creating directory structure..."

# Documentation organization
echo "📚 Organizing documentation..."

# Analysis documents
mkdir -p docs/analysis
mv -f STOLEN_APP_COMPREHENSIVE_ANALYSIS.md STOLEN_APP_PRODUCT_DESCRIPTION.md docs/analysis/ 2>/dev/null || true
mv -f STAKEHOLDER_ANALYSIS.md STAKEHOLDER_TECHNOLOGY_MATRIX.md UI_UX_CONSISTENCY_PLAN.md docs/analysis/ 2>/dev/null || true
mv -f PLAN.md PROJECT_RULES_OVERVIEW.md ROADMAP_TO_100_PERCENT_ERROR_FREE.md docs/analysis/ 2>/dev/null || true

# Implementation documents
mkdir -p docs/implementation
mv -f S_PAY_*.md docs/implementation/ 2>/dev/null || true
mv -f LOST_AND_FOUND_*.md docs/implementation/ 2>/dev/null || true
mv -f ADVANCED_SECURITY_IMPLEMENTATION_SUMMARY.md docs/implementation/ 2>/dev/null || true

# Technical documents
mkdir -p docs/technical
mv -f API_KEYS_*.md docs/technical/ 2>/dev/null || true
mv -f PERFORMANCE_OPTIMIZATION_*.md docs/technical/ 2>/dev/null || true
mv -f REVERSE_VERIFICATION_TOOL.md docs/technical/ 2>/dev/null || true

# Guides
mkdir -p docs/guides
mv -f *_SETUP_*.md *_GUIDE.md docs/guides/ 2>/dev/null || true

# AI Enhancement documents
mkdir -p docs/ai-enhancement
mv -f AI_TRANSFER_ENHANCEMENT_*.md TRANSFER_FEATURE_ANALYSIS_*.md docs/ai-enhancement/ 2>/dev/null || true

# Validation documents
mkdir -p docs/validation
mv -f *_VALIDATION_*.md *_TEST_*.md docs/validation/ 2>/dev/null || true

# Source code organization
echo "💻 Organizing source code..."

# Create src subdirectories
mkdir -p src/pages/{stakeholders,admin,user,marketplace,repair,insurance,law-enforcement,ngo,payment,security,ai}
mkdir -p src/components/{stakeholders,admin,user,marketplace,repair,insurance,law-enforcement,ngo,payment,security,ai,ui,forms,modals,navigation}
mkdir -p src/lib/{ai,services,utils,security,performance,blockchain,payment,communication,geolocation,optimization}

# Move pages to appropriate folders
echo "📄 Organizing pages..."

# AI pages
mv -f src/pages/AITransferSuggestions.tsx src/pages/ai/ 2>/dev/null || true

# Admin pages
mv -f src/pages/Admin*.tsx src/pages/admin/ 2>/dev/null || true

# User pages
mv -f src/pages/Dashboard.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Profile.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Login.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Register.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/MyDevices.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/OwnershipHistory.tsx src/pages/user/ 2>/dev/null || true

# Marketplace pages
mv -f src/pages/Marketplace.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/ProductDetail.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/ListMyDevice.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/BulkListing.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/HotDeals*.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/Cart.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/Wishlist.tsx src/pages/marketplace/ 2>/dev/null || true

# Repair pages
mv -f src/pages/Repair*.tsx src/pages/repair/ 2>/dev/null || true
mv -f src/pages/LogNewRepair.tsx src/pages/repair/ 2>/dev/null || true
mv -f src/pages/UserRepairHistory.tsx src/pages/repair/ 2>/dev/null || true

# Insurance pages
mv -f src/pages/Insurance*.tsx src/pages/insurance/ 2>/dev/null || true

# Law Enforcement pages
mv -f src/pages/LawEnforcement*.tsx src/pages/law-enforcement/ 2>/dev/null || true

# NGO pages
mv -f src/pages/NGO*.tsx src/pages/ngo/ 2>/dev/null || true

# Payment pages
mv -f src/pages/Payment*.tsx src/pages/payment/ 2>/dev/null || true
mv -f src/pages/Wallet.tsx src/pages/payment/ 2>/dev/null || true

# Security pages
mv -f src/pages/Security*.tsx src/pages/security/ 2>/dev/null || true
mv -f src/pages/Fraud*.tsx src/pages/security/ 2>/dev/null || true

# Stakeholder pages
mv -f src/pages/Retailer*.tsx src/pages/stakeholders/ 2>/dev/null || true
mv -f src/pages/Seller*.tsx src/pages/stakeholders/ 2>/dev/null || true

# Move components to appropriate folders
echo "🧩 Organizing components..."

# AI components
mv -f src/components/ai/* src/components/ai/ 2>/dev/null || true

# UI components
mv -f src/components/ui/* src/components/ui/ 2>/dev/null || true

# Navigation components
mv -f src/components/AppHeader.tsx src/components/navigation/ 2>/dev/null || true
mv -f src/components/BottomNavigation.tsx src/components/navigation/ 2>/dev/null || true
mv -f src/components/HamburgerMenu.tsx src/components/navigation/ 2>/dev/null || true
mv -f src/components/BackButton.tsx src/components/navigation/ 2>/dev/null || true

# Form components
mv -f src/components/DeviceRegistrationForm.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/OptimizedDeviceRegistrationForm.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/EnhancedForm.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/EnhancedSelect.tsx src/components/forms/ 2>/dev/null || true

# Modal components
mv -f src/components/CalendarModal.tsx src/components/modals/ 2>/dev/null || true
mv -f src/components/CommunicationModal.tsx src/components/modals/ 2>/dev/null || true
mv -f src/components/AppointmentBookingModal.tsx src/components/modals/ 2>/dev/null || true
mv -f src/components/TransactionDetailsModal.tsx src/components/modals/ 2>/dev/null || true

# Move lib files to appropriate folders
echo "📚 Organizing library files..."

# AI library files
mv -f src/lib/ai-transfer-suggestion-engine.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/smart-transfer-prompt-engine.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/transfer-timing-optimizer.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/ai-ml-system.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/gemini-ai-service.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/local-ai-service.ts src/lib/ai/ 2>/dev/null || true

# Services
mv -f src/lib/google-services-integration.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/google-maps-config.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/twilio-config.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/stripe-config.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/free-email-service.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/free-sms-service.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/free-blockchain-service.ts src/lib/services/ 2>/dev/null || true

# Security
mv -f src/lib/security-system.ts src/lib/security/ 2>/dev/null || true
mv -f src/lib/security.ts src/lib/security/ 2>/dev/null || true
mv -f src/lib/auth.ts src/lib/security/ 2>/dev/null || true

# Performance
mv -f src/lib/performance-monitoring.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/performance-optimization.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/api-optimization.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/search-optimization.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/image-optimization.ts src/lib/performance/ 2>/dev/null || true

# Blockchain
mv -f src/lib/blockchain-integration.ts src/lib/blockchain/ 2>/dev/null || true

# Payment
mv -f src/lib/payment-*.ts src/lib/payment/ 2>/dev/null || true

# Communication
mv -f src/lib/communication-*.ts src/lib/communication/ 2>/dev/null || true

# Geolocation
mv -f src/lib/geolocation.ts src/lib/geolocation/ 2>/dev/null || true
mv -f src/lib/open-source-maps.ts src/lib/geolocation/ 2>/dev/null || true

# Optimization
mv -f src/lib/background-jobs.ts src/lib/optimization/ 2>/dev/null || true
mv -f src/lib/end-to-end-testing.ts src/lib/optimization/ 2>/dev/null || true

# Utils
mv -f src/lib/utils.ts src/lib/utils/ 2>/dev/null || true

# Configuration files organization
echo "⚙️ Organizing configuration files..."

mkdir -p config/{environment,security,performance}

# Environment configs
mv -f env.example env.local config/environment/ 2>/dev/null || true

# Security configs
mv -f .prettierrc .eslintrc* .lintstagedrc* config/security/ 2>/dev/null || true

# Performance configs
mv -f vite.config.ts tailwind.config.ts postcss.config.js config/performance/ 2>/dev/null || true
mv -f tsconfig*.json config/performance/ 2>/dev/null || true

# Scripts organization
echo "🔧 Organizing scripts..."

mkdir -p scripts/{setup,deployment,monitoring,testing}

# Setup scripts
mv -f setup-environment.js start-server.sh start-servers.sh scripts/setup/ 2>/dev/null || true

# Deployment scripts
mv -f ecosystem.config.* scripts/deployment/ 2>/dev/null || true

# Monitoring scripts
mv -f server-monitor.js scripts/monitoring/ 2>/dev/null || true

# Testing scripts
mv -f test-*.js scripts/testing/ 2>/dev/null || true

# Keep critical files in root
echo "📋 Keeping critical files in root..."

# These files should stay in root
# - package.json
# - README.md
# - .gitignore
# - index.html
# - main.tsx
# - App.tsx

echo "✅ File organization complete!"
echo ""
echo "📁 New directory structure:"
echo "├── docs/"
echo "│   ├── analysis/          # Project analysis documents"
echo "│   ├── implementation/    # Implementation guides"
echo "│   ├── technical/         # Technical documentation"
echo "│   ├── guides/           # Setup and usage guides"
echo "│   ├── validation/       # Test and validation reports"
echo "│   └── ai-enhancement/   # AI feature documentation"
echo "├── src/"
echo "│   ├── pages/"
echo "│   │   ├── stakeholders/  # Retailer, seller pages"
echo "│   │   ├── admin/         # Admin dashboard pages"
echo "│   │   ├── user/          # User dashboard pages"
echo "│   │   ├── marketplace/   # Marketplace pages"
echo "│   │   ├── repair/        # Repair service pages"
echo "│   │   ├── insurance/     # Insurance pages"
echo "│   │   ├── law-enforcement/ # Law enforcement pages"
echo "│   │   ├── ngo/           # NGO pages"
echo "│   │   ├── payment/       # Payment and wallet pages"
echo "│   │   ├── security/      # Security and fraud pages"
echo "│   │   └── ai/            # AI feature pages"
echo "│   ├── components/"
echo "│   │   ├── stakeholders/  # Stakeholder components"
echo "│   │   ├── admin/         # Admin components"
echo "│   │   ├── user/          # User components"
echo "│   │   ├── marketplace/   # Marketplace components"
echo "│   │   ├── repair/        # Repair components"
echo "│   │   ├── insurance/     # Insurance components"
echo "│   │   ├── law-enforcement/ # Law enforcement components"
echo "│   │   ├── ngo/           # NGO components"
echo "│   │   ├── payment/       # Payment components"
echo "│   │   ├── security/      # Security components"
echo "│   │   ├── ai/            # AI components"
echo "│   │   ├── ui/            # UI components"
echo "│   │   ├── forms/         # Form components"
echo "│   │   ├── modals/        # Modal components"
echo "│   │   └── navigation/    # Navigation components"
echo "│   └── lib/"
echo "│       ├── ai/            # AI and ML services"
echo "│       ├── services/      # External service integrations"
echo "│       ├── utils/         # Utility functions"
echo "│       ├── security/      # Security and auth"
echo "│       ├── performance/   # Performance optimization"
echo "│       ├── blockchain/    # Blockchain integration"
echo "│       ├── payment/       # Payment processing"
echo "│       ├── communication/ # Communication services"
echo "│       ├── geolocation/   # Location services"
echo "│       └── optimization/  # General optimization"
echo "├── config/"
echo "│   ├── environment/       # Environment configs"
echo "│   ├── security/          # Security configs"
echo "│   └── performance/       # Performance configs"
echo "└── scripts/"
echo "    ├── setup/             # Setup scripts"
echo "    ├── deployment/        # Deployment scripts"
echo "    ├── monitoring/        # Monitoring scripts"
echo "    └── testing/           # Testing scripts"
