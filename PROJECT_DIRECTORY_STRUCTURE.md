# STOLEN App - Organized Directory Structure

## Overview

This document outlines the comprehensive directory organization for the STOLEN app project. All files have been organized into logical folders based on their functionality and purpose.

---

## 📁 **Root Directory Structure**

```
stolen-app-lovable/
├── 📚 docs/                          # Documentation
├── 💻 src/                           # Source code
├── ⚙️ config/                        # Configuration files
├── 🔧 scripts/                       # Scripts and utilities
├── 📦 node_modules/                  # Dependencies (auto-generated)
├── 🌐 public/                        # Public assets
├── 🗄️ supabase/                      # Supabase configuration
├── 🧪 cypress/                       # E2E testing
├── 📋 __mocks__/                     # Test mocks
├── 📊 dist/                          # Build output
├── 📝 logs/                          # Application logs
├── 🔐 .husky/                        # Git hooks
├── 📄 README.md                      # Project overview
├── 📦 package.json                   # Dependencies and scripts
├── 📦 package-lock.json              # Locked dependencies
├── 📦 bun.lockb                      # Bun lock file
├── 🚫 .gitignore                     # Git ignore rules
└── 🏠 index.html                     # Entry HTML file
```

---

## 📚 **Documentation Structure (`docs/`)**

### **Analysis Documents (`docs/analysis/`)**
- `STOLEN_APP_COMPREHENSIVE_ANALYSIS.md` - Complete project analysis
- `STOLEN_APP_PRODUCT_DESCRIPTION.md` - Product description and features
- `PAYPASS_PRODUCT_DESCRIPTION.md` - Legacy product description
- `STAKEHOLDER_ANALYSIS.md` - Stakeholder analysis and requirements
- `STAKEHOLDER_TECHNOLOGY_MATRIX.md` - Technology mapping for stakeholders
- `UI_UX_CONSISTENCY_PLAN.md` - UI/UX consistency guidelines
- `PLAN.md` - Original project plan
- `PROJECT_RULES_OVERVIEW.md` - Project rules and guidelines
- `ROADMAP_TO_100_PERCENT_ERROR_FREE.md` - Error-free roadmap

### **Implementation Documents (`docs/implementation/`)**
- `IMPLEMENTATION_SUMMARY.md` - Implementation status and summary
- `S_PAY_ECOSYSTEM_PLAN.md` - S-Pay ecosystem implementation plan
- `S_PAY_ECOSYSTEM_INTEGRATION_PLAN.md` - S-Pay integration details
- `S_PAY_IMPLEMENTATION_PLAN.md` - S-Pay implementation plan
- `S_PAY_IMPLEMENTATION_COMPLETE.md` - S-Pay completion report
- `LOST_AND_FOUND_IMPLEMENTATION_SUMMARY.md` - Lost & Found implementation
- `LOST_AND_FOUND_IMPLEMENTATION_COMPLETE.md` - Lost & Found completion
- `ADVANCED_SECURITY_IMPLEMENTATION_SUMMARY.md` - Security implementation

### **Technical Documents (`docs/technical/`)**
- `API_KEYS_IMPLEMENTATION_SUMMARY.md` - API keys implementation
- `API_KEYS_MANAGEMENT.md` - API keys management guide
- `API_KEYS_REQUIREMENTS_LIST.md` - API keys requirements
- `PERFORMANCE_OPTIMIZATION_FEEDBACK.md` - Performance feedback
- `PERFORMANCE_OPTIMIZATION_SUMMARY.md` - Performance optimization summary
- `REVERSE_VERIFICATION_TOOL.md` - Reverse verification documentation

### **Setup Guides (`docs/guides/`)**
- `DEVELOPMENT_SERVER_GUIDE.md` - Development server setup
- `SERVER_SETUP_GUIDE.md` - Server setup instructions
- `SERVER_SETUP_COMPLETE.md` - Server setup completion
- `README_SERVER_SETUP.md` - Server setup readme
- `ALGOLIA_SETUP_GUIDE.md` - Algolia search setup
- `CLOUDINARY_SETUP_GUIDE.md` - Cloudinary setup
- `REDIS_SETUP_GUIDE.md` - Redis setup
- `SENTRY_SETUP_GUIDE.md` - Sentry error tracking setup

### **Validation Reports (`docs/validation/`)**
- `S_PAY_VALIDATION_TEST_REPORT.md` - S-Pay validation testing

### **AI Enhancement (`docs/ai-enhancement/`)**
- `AI_TRANSFER_ENHANCEMENT_IMPLEMENTATION_SUMMARY.md` - AI transfer enhancement
- `TRANSFER_FEATURE_ANALYSIS_AND_ENHANCEMENT.md` - Transfer feature analysis

---

## 💻 **Source Code Structure (`src/`)**

### **Pages (`src/pages/`)**

#### **User Pages (`src/pages/user/`)**
- `Dashboard.tsx` - Main user dashboard
- `Profile.tsx` - User profile management
- `Login.tsx` - User login
- `Register.tsx` - User registration
- `MyDevices.tsx` - User's device management
- `OwnershipHistory.tsx` - Device ownership history
- `Index.tsx` - Landing page
- `SplashWelcome.tsx` - Welcome screen
- `WhyStolen.tsx` - About STOLEN app
- `Learn.tsx` - Learning center
- `Support.tsx` - Support page
- `PrivacyPolicy.tsx` - Privacy policy
- `TermsOfService.tsx` - Terms of service
- `NotFound.tsx` - 404 error page
- `AboutUs.tsx` - About us page
- `CommunityBoard.tsx` - Community board
- `CommunityRewards.tsx` - Community rewards
- `LostFoundBoard.tsx` - Lost and found board
- `LostFoundReport.tsx` - Lost and found reporting
- `DeviceCertificate.tsx` - Device certificates
- `DeviceCheck.tsx` - Device verification
- `DeviceTransfer.tsx` - Device transfer
- `TransferDonate.tsx` - Transfer and donation
- `PsychologyAssistedHelper.tsx` - Psychology assistance
- `ReferralRewards.tsx` - Referral system
- `IndividualNotifications.tsx` - Individual notifications
- `TrustBadges.tsx` - Trust badges
- `FeatureCard.tsx` - Feature cards

#### **Marketplace Pages (`src/pages/marketplace/`)**
- `Marketplace.tsx` - Main marketplace
- `ProductDetail.tsx` - Product details
- `ListMyDevice.tsx` - Device listing
- `BulkListing.tsx` - Bulk device listing
- `BulkRegistration.tsx` - Bulk device registration
- `Cart.tsx` - Shopping cart
- `Wishlist.tsx` - User wishlist
- `OrderDetails.tsx` - Order details
- `PostPurchase.tsx` - Post-purchase flow
- `RelistDevice.tsx` - Device relisting
- `ReportListing.tsx` - Report listing
- `ContactSeller.tsx` - Contact seller
- `HotDeals.tsx` - Hot deals
- `HotDealsHub.tsx` - Hot deals hub
- `HotDealsFeed.tsx` - Hot deals feed
- `HotDealsChatPage.tsx` - Hot deals chat
- `HotBuyerRequest.tsx` - Buyer requests

#### **Admin Pages (`src/pages/admin/`)**
- `AdminDashboard.tsx` - Admin dashboard
- `AdminProfile.tsx` - Admin profile
- `AdminReports.tsx` - Admin reports
- `AdminSystem.tsx` - System administration
- `AdminUsers.tsx` - User management
- `ApiDocumentation.tsx` - API documentation
- `WidgetGenerator.tsx` - Widget generator
- `SystemStatus.tsx` - System status
- `AnalyticsInsights.tsx` - Analytics insights
- `ComplianceDashboard.tsx` - Compliance dashboard
- `PerformanceDashboard.tsx` - Performance dashboard

#### **Payment Pages (`src/pages/payment/`)**
- `PaymentDashboard.tsx` - Payment dashboard
- `PaymentProfile.tsx` - Payment profile
- `PaymentAnalytics.tsx` - Payment analytics
- `PaymentTransactions.tsx` - Payment transactions
- `PaymentFraud.tsx` - Payment fraud detection
- `Wallet.tsx` - Digital wallet

#### **Security Pages (`src/pages/security/`)**
- `SecurityTesting.tsx` - Security testing
- `FraudAlerts.tsx` - Fraud alerts
- `StolenReports.tsx` - Stolen device reports
- `ReverseVerify.tsx` - Reverse verification
- `ReverseVerifyEnhanced.tsx` - Enhanced reverse verification

#### **Repair Pages (`src/pages/repair/`)**
- `RepairShopDashboard.tsx` - Repair shop dashboard
- `RepairBooking.tsx` - Repair booking
- `RepairCustomers.tsx` - Repair customers
- `RepairInventory.tsx` - Repair inventory
- `RepairMarketplace.tsx` - Repair marketplace
- `RepairAnalytics.tsx` - Repair analytics
- `RepairHistoryManagement.tsx` - Repair history
- `RepairCertificates.tsx` - Repair certificates
- `RepairInsuranceIntegration.tsx` - Insurance integration
- `RepairFraudDetection.tsx` - Fraud detection
- `RepairNGOPrograms.tsx` - NGO programs
- `RepairOrderFlow.tsx` - Order flow
- `RepairUpdate.tsx` - Repair updates
- `RepairerNotifications.tsx` - Repairer notifications
- `RepairerProfile.tsx` - Repairer profile
- `RepairSupport.tsx` - Repair support
- `LogNewRepair.tsx` - New repair logging
- `UserRepairHistory.tsx` - User repair history

#### **Insurance Pages (`src/pages/insurance/`)**
- `InsuranceDashboard.tsx` - Insurance dashboard
- `InsuranceDashboardEnhanced.tsx` - Enhanced insurance dashboard
- `InsuranceProfile.tsx` - Insurance profile
- `InsurancePolicies.tsx` - Insurance policies
- `InsuranceClaims.tsx` - Insurance claims
- `InsuranceQuote.tsx` - Insurance quotes
- `InsuranceHub.tsx` - Insurance hub
- `NewInsuranceClaim.tsx` - New insurance claim

#### **Law Enforcement Pages (`src/pages/law-enforcement/`)**
- `LawEnforcementDashboard.tsx` - Law enforcement dashboard
- `LawEnforcementProfile.tsx` - Law enforcement profile
- `LawEnforcementCases.tsx` - Law enforcement cases
- `LawEnforcementSearch.tsx` - Law enforcement search
- `NewLawReport.tsx` - New law enforcement report

#### **NGO Pages (`src/pages/ngo/`)**
- `NGODashboard.tsx` - NGO dashboard
- `NGOProfile.tsx` - NGO profile
- `NGOImpact.tsx` - NGO impact
- `NGODonations.tsx` - NGO donations
- `NewDonationRequest.tsx` - New donation request

#### **Stakeholder Pages (`src/pages/stakeholders/`)**
- `RetailerDashboard.tsx` - Retailer dashboard
- `RetailerProfile.tsx` - Retailer profile
- `RetailerSales.tsx` - Retailer sales
- `RetailerInventory.tsx` - Retailer inventory
- `SellerOnboarding.tsx` - Seller onboarding
- `SellerProfile.tsx` - Seller profile
- `CompanyProfile.tsx` - Company profile

#### **AI Pages (`src/pages/ai/`)**
- `AITransferSuggestions.tsx` - AI transfer suggestions

### **Components (`src/components/`)**

#### **UI Components (`src/components/ui/`)**
- All shadcn/ui components (button, card, input, etc.)
- `FeatureCard.tsx` - Feature cards
- `TrustBadge.tsx` - Trust badges
- `STOLENLogo.tsx` - STOLEN logo
- `LiveChatWidget.tsx` - Live chat widget
- `LocationSelector.tsx` - Location selector
- `Map.tsx` - Map component
- `QRScanner.tsx` - QR code scanner
- `DocumentDownloader.tsx` - Document downloader

#### **Navigation Components (`src/components/navigation/`)**
- `AppHeader.tsx` - Application header
- `BottomNavigation.tsx` - Bottom navigation
- `HamburgerMenu.tsx` - Hamburger menu
- `BackButton.tsx` - Back button

#### **Form Components (`src/components/forms/`)**
- `DeviceRegistrationForm.tsx` - Device registration form
- `OptimizedDeviceRegistrationForm.tsx` - Optimized registration form
- `EnhancedForm.tsx` - Enhanced form component
- `EnhancedSelect.tsx` - Enhanced select component
- `UploadComponent.tsx` - File upload component
- `OptimizedUploadComponent.tsx` - Optimized upload component

#### **Modal Components (`src/components/modals/`)**
- `CalendarModal.tsx` - Calendar modal
- `CommunicationModal.tsx` - Communication modal
- `AppointmentBookingModal.tsx` - Appointment booking modal

#### **Payment Components (`src/components/payment/`)**
- `WithdrawalRequestForm.tsx` - Withdrawal request form
- `PaymentMethodManager.tsx` - Payment method manager
- `TransactionDetailsModal.tsx` - Transaction details modal
- `SPayEcosystemIntegration.tsx` - S-Pay integration
- `SABankingIntegration.tsx` - South African banking integration

#### **Security Components (`src/components/security/`)**
- `SecurityEnhancement.tsx` - Security enhancement
- `SecurityEnhancements.tsx` - Security enhancements
- `ProtectedRoute.tsx` - Protected route component
- `RoleBasedRedirect.tsx` - Role-based redirect
- `SecurityVerification.tsx` - Security verification

#### **AI Components (`src/components/ai/`)**
- `TransferSuggestionCard.tsx` - Transfer suggestion card
- `TransferSuggestionDashboard.tsx` - Transfer suggestion dashboard

#### **Admin Components (`src/components/admin/`)**
- `PerformanceDashboard.tsx` - Performance dashboard
- `ResponsivePerformanceTest.tsx` - Performance testing

#### **User Components (`src/components/user/`)**
- `CommunityEvents.tsx` - Community events
- `CommunityTipForm.tsx` - Community tip form
- `NotificationPreferences.tsx` - Notification preferences

### **Library Files (`src/lib/`)**

#### **AI Services (`src/lib/ai/`)**
- `ai-transfer-suggestion-engine.ts` - AI transfer suggestion engine
- `smart-transfer-prompt-engine.ts` - Smart transfer prompt engine
- `transfer-timing-optimizer.ts` - Transfer timing optimizer
- `ai-ml-system.ts` - AI/ML system
- `gemini-ai-service.ts` - Google Gemini AI service
- `local-ai-service.ts` - Local AI service

#### **External Services (`src/lib/services/`)**
- `google-services-integration.ts` - Google services integration
- `google-maps-config.ts` - Google Maps configuration
- `twilio-config.ts` - Twilio configuration
- `stripe-config.ts` - Stripe configuration
- `free-email-service.ts` - Free email service
- `free-sms-service.ts` - Free SMS service
- `free-blockchain-service.ts` - Free blockchain service
- `ocr-system.ts` - OCR system
- `qr-code-scanner.ts` - QR code scanner
- `reverse-verification-api.ts` - Reverse verification API
- `redis.ts` - Redis configuration

#### **Security (`src/lib/security/`)**
- `security-system.ts` - Security system
- `security.ts` - Security utilities
- `auth.ts` - Authentication system

#### **Performance (`src/lib/performance/`)**
- `performance-monitoring.ts` - Performance monitoring
- `performance-optimization.ts` - Performance optimization
- `api-optimization.ts` - API optimization
- `search-optimization.ts` - Search optimization
- `image-optimization.ts` - Image optimization

#### **Blockchain (`src/lib/blockchain/`)**
- `blockchain-integration.ts` - Blockchain integration

#### **Geolocation (`src/lib/geolocation/`)**
- `geolocation.ts` - Geolocation services
- `open-source-maps.ts` - Open source maps

#### **Optimization (`src/lib/optimization/`)**
- `background-jobs.ts` - Background jobs
- `end-to-end-testing.ts` - End-to-end testing

#### **Utilities (`src/lib/utils/`)**
- `utils.ts` - Utility functions

---

## ⚙️ **Configuration Structure (`config/`)**

### **Environment Configs (`config/environment/`)**
- `env.example` - Environment variables example
- `env.local` - Local environment variables

### **Security Configs (`config/security/`)**
- `.prettierrc` - Prettier configuration
- `.eslintrc.js` - ESLint configuration
- `.lintstagedrc.js` - Lint-staged configuration

### **Performance Configs (`config/performance/`)**
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `tsconfig.app.json` - TypeScript app configuration
- `tsconfig.node.json` - TypeScript node configuration
- `components.json` - Components configuration
- `cypress.config.ts` - Cypress configuration
- `jest.config.js` - Jest configuration

---

## 🔧 **Scripts Structure (`scripts/`)**

### **Setup Scripts (`scripts/setup/`)**
- `organize_files.sh` - File organization script
- `organize_remaining.sh` - Remaining file organization
- `setup-environment.js` - Environment setup
- `start-server.sh` - Server startup script
- `start-servers.sh` - Multiple server startup

### **Deployment Scripts (`scripts/deployment/`)**
- `ecosystem.config.js` - PM2 ecosystem configuration
- `ecosystem.config.cjs` - PM2 ecosystem configuration (CJS)

### **Monitoring Scripts (`scripts/monitoring/`)**
- `server-monitor.js` - Server monitoring

### **Testing Scripts (`scripts/testing/`)**
- `test-services-simple.js` - Simple service testing
- `test-performance-services.js` - Performance service testing

---

## 🗄️ **Supabase Structure (`supabase/`)**

- `config.toml` - Supabase configuration
- `migrations/` - Database migrations
- `functions/` - Edge functions

---

## 🧪 **Testing Structure**

- `cypress/` - End-to-end testing with Cypress
- `__mocks__/` - Test mocks
- `src/setupTests.ts` - Test setup

---

## 📊 **Build and Output**

- `dist/` - Build output directory
- `public/` - Public assets
- `logs/` - Application logs

---

## 🔐 **Git and Hooks**

- `.git/` - Git repository
- `.husky/` - Git hooks
- `.gitignore` - Git ignore rules

---

## 📦 **Dependencies**

- `node_modules/` - Node.js dependencies
- `package.json` - Package configuration
- `package-lock.json` - Locked dependencies
- `bun.lockb` - Bun lock file

---

## 🎯 **Key Benefits of This Organization**

### **1. Logical Grouping**
- Files are grouped by functionality and purpose
- Related files are kept together for easy navigation
- Clear separation between different types of content

### **2. Scalability**
- Structure supports future growth and additions
- Easy to add new features without cluttering
- Modular organization for team collaboration

### **3. Maintainability**
- Easy to locate specific files
- Clear ownership of different areas
- Reduced cognitive load when working on specific features

### **4. Developer Experience**
- Intuitive folder structure
- Quick access to related files
- Clear documentation organization

### **5. Project Management**
- Easy to track progress in different areas
- Clear separation of concerns
- Simplified code reviews and audits

---

## 📋 **File Naming Conventions**

### **Pages**
- Use PascalCase for component names
- Include functionality in the name (e.g., `UserDashboard.tsx`)
- Group related pages in appropriate folders

### **Components**
- Use PascalCase for component names
- Include component type in the name (e.g., `TransferSuggestionCard.tsx`)
- Group by functionality and type

### **Library Files**
- Use kebab-case for file names
- Include service type in the name (e.g., `ai-transfer-suggestion-engine.ts`)
- Group by service category

### **Documentation**
- Use UPPER_SNAKE_CASE for document names
- Include document type and purpose (e.g., `AI_TRANSFER_ENHANCEMENT_IMPLEMENTATION_SUMMARY.md`)
- Group by document category

---

## 🚀 **Next Steps**

1. **Update Import Paths**: Update all import statements to reflect the new structure
2. **Update Build Configuration**: Ensure build tools can find files in new locations
3. **Update Documentation**: Update any documentation that references old file paths
4. **Team Training**: Ensure team members understand the new structure
5. **CI/CD Updates**: Update any CI/CD pipelines to work with the new structure

---

**This organization provides a clean, scalable, and maintainable structure for the STOLEN app project!** 🎉
