#!/bin/bash

echo "🔧 Organizing remaining files..."

# Move remaining pages to appropriate folders
echo "📄 Moving remaining pages..."

# User pages
mv -f src/pages/AboutUs.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Profile.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Login.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Register.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/MyDevices.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/OwnershipHistory.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Dashboard.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Index.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/SplashWelcome.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/WhyStolen.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Learn.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/Support.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/PrivacyPolicy.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/TermsOfService.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/NotFound.tsx src/pages/user/ 2>/dev/null || true

# Marketplace pages
mv -f src/pages/Marketplace.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/ProductDetail.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/ListMyDevice.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/BulkListing.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/BulkRegistration.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/Cart.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/Wishlist.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/OrderDetails.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/PostPurchase.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/RelistDevice.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/ReportListing.tsx src/pages/marketplace/ 2>/dev/null || true
mv -f src/pages/ContactSeller.tsx src/pages/marketplace/ 2>/dev/null || true

# Hot Deals pages
mv -f src/pages/HotDeals*.tsx src/pages/marketplace/ 2>/dev/null || true

# Admin pages
mv -f src/pages/Admin*.tsx src/pages/admin/ 2>/dev/null || true
mv -f src/pages/ApiDocumentation.tsx src/pages/admin/ 2>/dev/null || true
mv -f src/pages/WidgetGenerator.tsx src/pages/admin/ 2>/dev/null || true
mv -f src/pages/SystemStatus.tsx src/pages/admin/ 2>/dev/null || true
mv -f src/pages/AnalyticsInsights.tsx src/pages/admin/ 2>/dev/null || true

# Payment pages
mv -f src/pages/Payment*.tsx src/pages/payment/ 2>/dev/null || true
mv -f src/pages/Wallet.tsx src/pages/payment/ 2>/dev/null || true

# Security pages
mv -f src/pages/Security*.tsx src/pages/security/ 2>/dev/null || true
mv -f src/pages/Fraud*.tsx src/pages/security/ 2>/dev/null || true
mv -f src/pages/StolenReports.tsx src/pages/security/ 2>/dev/null || true

# Repair pages
mv -f src/pages/Repair*.tsx src/pages/repair/ 2>/dev/null || true
mv -f src/pages/LogNewRepair.tsx src/pages/repair/ 2>/dev/null || true
mv -f src/pages/UserRepairHistory.tsx src/pages/repair/ 2>/dev/null || true

# Insurance pages
mv -f src/pages/Insurance*.tsx src/pages/insurance/ 2>/dev/null || true

# Law Enforcement pages
mv -f src/pages/LawEnforcement*.tsx src/pages/law-enforcement/ 2>/dev/null || true
mv -f src/pages/NewLawReport.tsx src/pages/law-enforcement/ 2>/dev/null || true

# NGO pages
mv -f src/pages/NGO*.tsx src/pages/ngo/ 2>/dev/null || true
mv -f src/pages/NewDonationRequest.tsx src/pages/ngo/ 2>/dev/null || true

# Stakeholder pages
mv -f src/pages/Retailer*.tsx src/pages/stakeholders/ 2>/dev/null || true
mv -f src/pages/Seller*.tsx src/pages/stakeholders/ 2>/dev/null || true
mv -f src/pages/CompanyProfile.tsx src/pages/stakeholders/ 2>/dev/null || true

# Community pages
mv -f src/pages/Community*.tsx src/pages/user/ 2>/dev/null || true

# Lost and Found pages
mv -f src/pages/LostFound*.tsx src/pages/user/ 2>/dev/null || true

# Device related pages
mv -f src/pages/Device*.tsx src/pages/user/ 2>/dev/null || true

# Transfer pages
mv -f src/pages/Transfer*.tsx src/pages/user/ 2>/dev/null || true
mv -f src/pages/DeviceTransfer.tsx src/pages/user/ 2>/dev/null || true

# Reverse verification pages
mv -f src/pages/ReverseVerify*.tsx src/pages/security/ 2>/dev/null || true

# Compliance pages
mv -f src/pages/Compliance*.tsx src/pages/admin/ 2>/dev/null || true

# Performance pages
mv -f src/pages/Performance*.tsx src/pages/admin/ 2>/dev/null || true

# Psychology pages
mv -f src/pages/Psychology*.tsx src/pages/user/ 2>/dev/null || true

# Referral pages
mv -f src/pages/Referral*.tsx src/pages/user/ 2>/dev/null || true

# Individual pages
mv -f src/pages/Individual*.tsx src/pages/user/ 2>/dev/null || true

# Trust pages
mv -f src/pages/Trust*.tsx src/pages/user/ 2>/dev/null || true

# Feature pages
mv -f src/pages/Feature*.tsx src/pages/user/ 2>/dev/null || true

# Move remaining components
echo "🧩 Moving remaining components..."

# Payment components
mv -f src/components/WithdrawalRequestForm.tsx src/components/payment/ 2>/dev/null || true
mv -f src/components/PaymentMethodManager.tsx src/components/payment/ 2>/dev/null || true
mv -f src/components/TransactionDetailsModal.tsx src/components/payment/ 2>/dev/null || true
mv -f src/components/SPayEcosystemIntegration.tsx src/components/payment/ 2>/dev/null || true

# Security components
mv -f src/components/Security*.tsx src/components/security/ 2>/dev/null || true
mv -f src/components/ProtectedRoute.tsx src/components/security/ 2>/dev/null || true
mv -f src/components/RoleBasedRedirect.tsx src/components/security/ 2>/dev/null || true
mv -f src/components/SecurityVerification.tsx src/components/security/ 2>/dev/null || true

# Form components
mv -f src/components/DeviceRegistrationForm.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/OptimizedDeviceRegistrationForm.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/EnhancedForm.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/EnhancedSelect.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/UploadComponent.tsx src/components/forms/ 2>/dev/null || true
mv -f src/components/OptimizedUploadComponent.tsx src/components/forms/ 2>/dev/null || true

# Modal components
mv -f src/components/CalendarModal.tsx src/components/modals/ 2>/dev/null || true
mv -f src/components/CommunicationModal.tsx src/components/modals/ 2>/dev/null || true
mv -f src/components/AppointmentBookingModal.tsx src/components/modals/ 2>/dev/null || true

# Navigation components
mv -f src/components/AppHeader.tsx src/components/navigation/ 2>/dev/null || true
mv -f src/components/BottomNavigation.tsx src/components/navigation/ 2>/dev/null || true
mv -f src/components/HamburgerMenu.tsx src/components/navigation/ 2>/dev/null || true
mv -f src/components/BackButton.tsx src/components/navigation/ 2>/dev/null || true

# UI components
mv -f src/components/FeatureCard.tsx src/components/ui/ 2>/dev/null || true
mv -f src/components/TrustBadge.tsx src/components/ui/ 2>/dev/null || true
mv -f src/components/STOLENLogo.tsx src/components/ui/ 2>/dev/null || true
mv -f src/components/LiveChatWidget.tsx src/components/ui/ 2>/dev/null || true
mv -f src/components/LocationSelector.tsx src/components/ui/ 2>/dev/null || true
mv -f src/components/Map.tsx src/components/ui/ 2>/dev/null || true
mv -f src/components/QRScanner.tsx src/components/ui/ 2>/dev/null || true

# Community components
mv -f src/components/Community*.tsx src/components/user/ 2>/dev/null || true

# Performance components
mv -f src/components/Performance*.tsx src/components/admin/ 2>/dev/null || true
mv -f src/components/ResponsivePerformanceTest.tsx src/components/admin/ 2>/dev/null || true

# Banking components
mv -f src/components/SABankingIntegration.tsx src/components/payment/ 2>/dev/null || true

# Notification components
mv -f src/components/NotificationPreferences.tsx src/components/user/ 2>/dev/null || true

# Document components
mv -f src/components/DocumentDownloader.tsx src/components/ui/ 2>/dev/null || true

# Move remaining lib files
echo "📚 Moving remaining lib files..."

# AI files
mv -f src/lib/ai-transfer-suggestion-engine.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/smart-transfer-prompt-engine.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/transfer-timing-optimizer.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/ai-ml-system.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/gemini-ai-service.ts src/lib/ai/ 2>/dev/null || true
mv -f src/lib/local-ai-service.ts src/lib/ai/ 2>/dev/null || true

# Service files
mv -f src/lib/google-services-integration.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/google-maps-config.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/twilio-config.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/stripe-config.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/free-email-service.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/free-sms-service.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/free-blockchain-service.ts src/lib/services/ 2>/dev/null || true

# Security files
mv -f src/lib/security-system.ts src/lib/security/ 2>/dev/null || true
mv -f src/lib/security.ts src/lib/security/ 2>/dev/null || true
mv -f src/lib/auth.ts src/lib/security/ 2>/dev/null || true

# Performance files
mv -f src/lib/performance-monitoring.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/performance-optimization.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/api-optimization.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/search-optimization.ts src/lib/performance/ 2>/dev/null || true
mv -f src/lib/image-optimization.ts src/lib/performance/ 2>/dev/null || true

# Blockchain files
mv -f src/lib/blockchain-integration.ts src/lib/blockchain/ 2>/dev/null || true

# Geolocation files
mv -f src/lib/geolocation.ts src/lib/geolocation/ 2>/dev/null || true
mv -f src/lib/open-source-maps.ts src/lib/geolocation/ 2>/dev/null || true

# Optimization files
mv -f src/lib/background-jobs.ts src/lib/optimization/ 2>/dev/null || true
mv -f src/lib/end-to-end-testing.ts src/lib/optimization/ 2>/dev/null || true

# Utility files
mv -f src/lib/utils.ts src/lib/utils/ 2>/dev/null || true

# OCR and QR files
mv -f src/lib/ocr-system.ts src/lib/services/ 2>/dev/null || true
mv -f src/lib/qr-code-scanner.ts src/lib/services/ 2>/dev/null || true

# Reverse verification files
mv -f src/lib/reverse-verification-api.ts src/lib/services/ 2>/dev/null || true

# Redis files
mv -f src/lib/redis.ts src/lib/services/ 2>/dev/null || true

echo "✅ Remaining files organized!"
