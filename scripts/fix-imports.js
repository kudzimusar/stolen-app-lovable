import fs from 'fs';
import path from 'path';

// Map of incorrect paths to correct paths
const pathMappings = {
  // Critical App.tsx imports
  './pages/DeviceRecoveryStatus': './pages/user/DeviceRecoveryStatus',
  './pages/FraudAlerts': './pages/security/FraudAlerts',
  './pages/CommunityBoard': './pages/user/CommunityBoard',
  './pages/LostFoundBoard': './pages/user/LostFoundBoard',
  './pages/Profile': './pages/user/Profile',
  './pages/Wallet': './pages/payment/Wallet',
  './pages/Support': './pages/user/Support',
  './pages/TransferDonate': './pages/user/TransferDonate',
  './pages/SplashWelcome': './pages/user/SplashWelcome',
  './pages/InsuranceHub': './pages/insurance/InsuranceHub',
  './pages/CommunityRewards': './pages/user/CommunityRewards',
  './pages/EscrowPayment': './pages/payment/EscrowPayment',
  './pages/RetailerDashboard': './pages/user/RetailerDashboard',
  './pages/RepairShopDashboard': './pages/repair/RepairShopDashboard',
  './pages/LawEnforcementDashboard': './pages/user/LawEnforcementDashboard',
  './pages/NGODashboard': './pages/ngo/NGODashboard',
  './pages/PsychologyAssistedHelper': './pages/user/PsychologyAssistedHelper',
  './pages/ReverseVerify': './pages/security/ReverseVerify',
  './pages/FeedbackRating': './pages/user/FeedbackRating',
  './pages/AnalyticsInsights': './pages/admin/AnalyticsInsights',
  './pages/NotFound': './pages/user/NotFound',
  './pages/DeviceTransfer': './pages/user/DeviceTransfer',
  './pages/AITransferSuggestions': './pages/ai/AITransferSuggestions',
  './pages/OwnershipHistory': './pages/user/OwnershipHistory',
  './pages/FraudDatabase': './pages/security/FraudDatabase',
  './pages/MyDevices': './pages/user/MyDevices',
  './pages/DeviceLifecycleManager': './pages/user/DeviceLifecycleManager',
  './pages/DeviceWarrantyStatus': './pages/user/DeviceWarrantyStatus',
  './pages/WidgetGenerator': './pages/admin/WidgetGenerator',
  './pages/Learn': './pages/user/Learn',
  './pages/AboutUs': './pages/user/AboutUs',
  './pages/StolenReports': './pages/security/StolenReports',
  './pages/DeviceCertificate': './pages/user/DeviceCertificate',
  './pages/InsuranceDashboard': './pages/insurance/InsuranceDashboard',
  './pages/RetailerProfile': './pages/stakeholders/RetailerProfile',
  './pages/RepairerProfile': './pages/repair/RepairerProfile',
  './pages/InsuranceProfile': './pages/insurance/InsuranceProfile',
  './pages/LawEnforcementProfile': './pages/law-enforcement/LawEnforcementProfile',
  './pages/NGOProfile': './pages/ngo/NGOProfile',
  './pages/UserRepairHistory': './pages/repair/UserRepairHistory',
  './pages/SecurityTesting': './pages/security/SecurityTesting',
  './pages/GeolocationTesting': './pages/user/GeolocationTesting',
  './pages/SystemStatus': './pages/admin/SystemStatus',
  './pages/ProductDetail': './pages/marketplace/ProductDetail',
  './pages/SellerProfile': './pages/stakeholders/SellerProfile',
  './pages/PostPurchase': './pages/marketplace/PostPurchase',
  './pages/Wishlist': './pages/marketplace/Wishlist',
  './pages/TrustBadges': './pages/user/TrustBadges',
  './pages/SellerOnboarding': './pages/stakeholders/SellerOnboarding',
  './pages/BulkListing': './pages/marketplace/BulkListing',
  './pages/ReferralRewards': './pages/user/ReferralRewards',
  './pages/OrderDetails': './pages/marketplace/OrderDetails',
  './pages/RelistDevice': './pages/marketplace/RelistDevice',
  './pages/RepairUpdate': './pages/repair/RepairUpdate',
  './pages/Cart': './pages/marketplace/Cart',
  './pages/ContactSeller': './pages/marketplace/ContactSeller',
  './pages/InsuranceQuote': './pages/insurance/InsuranceQuote',
  './pages/ReportListing': './pages/marketplace/ReportListing',
  './pages/HotDeals': './pages/marketplace/HotDeals',
  './pages/HotDealsFeed': './pages/marketplace/HotDealsFeed',
  './pages/HotDealsHub': './pages/marketplace/HotDealsHub',
  './pages/HotBuyerRequest': './pages/marketplace/HotBuyerRequest',
  './pages/HotDealsChatPage': './pages/marketplace/HotDealsChatPage',
  './pages/ListMyDevice': './pages/marketplace/ListMyDevice',
  './pages/RepairBooking': './pages/repair/RepairBooking',
  './pages/RepairFraudDetection': './pages/repair/RepairFraudDetection',
  './pages/RepairInsuranceIntegration': './pages/repair/RepairInsuranceIntegration',
  './pages/RepairNGOPrograms': './pages/repair/RepairNGOPrograms',
  './pages/RepairSupport': './pages/repair/RepairSupport',
  './pages/RepairCertificates': './pages/repair/RepairCertificates',
  './pages/RepairAnalytics': './pages/repair/RepairAnalytics',
  './pages/RepairCustomers': './pages/repair/RepairCustomers',
  './pages/RepairInventory': './pages/repair/RepairInventory',
  './pages/RepairOrderFlow': './pages/repair/RepairOrderFlow',
  './pages/RepairHistoryManagement': './pages/repair/RepairHistoryManagement',
  './pages/DisputeMediationCenter': './pages/DisputeMediationCenter',
  './pages/RepairMarketplace': './pages/repair/RepairMarketplace',
  './pages/RepairerNotifications': './pages/repair/RepairerNotifications',
  './pages/IndividualNotifications': './pages/user/IndividualNotifications',
  './pages/CompanyProfile': './pages/stakeholders/CompanyProfile',
  './pages/LogNewRepair': './pages/repair/LogNewRepair',
  './pages/AdminDashboard': './pages/admin/AdminDashboard',
  './pages/AdminUsers': './pages/admin/AdminUsers',
  './pages/AdminSystem': './pages/admin/AdminSystem',
  './pages/AdminReports': './pages/admin/AdminReports',
  './pages/AdminProfile': './pages/admin/AdminProfile',
  './pages/PrivacyPolicy': './pages/user/PrivacyPolicy',
  './pages/TermsOfService': './pages/user/TermsOfService',
  './pages/ApiDocumentation': './pages/admin/ApiDocumentation',
  './pages/PaymentDashboard': './pages/payment/PaymentDashboard',
  './pages/PaymentTransactions': './pages/payment/PaymentTransactions',
  './pages/PaymentFraud': './pages/payment/PaymentFraud',
  './pages/PaymentAnalytics': './pages/payment/PaymentAnalytics',
  './pages/PaymentProfile': './pages/payment/PaymentProfile',
  './pages/RetailerInventory': './pages/retailer/RetailerInventory',
  './pages/BulkRegistration': './pages/marketplace/BulkRegistration',
  './pages/RetailerSales': './pages/retailer/RetailerSales',
  './pages/InsuranceClaims': './pages/insurance/InsuranceClaims',
  './pages/NewInsuranceClaim': './pages/insurance/NewInsuranceClaim',
  './pages/InsurancePolicies': './pages/insurance/InsurancePolicies',
  './pages/LawEnforcementSearch': './pages/law-enforcement/LawEnforcementSearch',
  './pages/NewLawReport': './pages/law-enforcement/NewLawReport',
  './pages/LawEnforcementCases': './pages/law-enforcement/LawEnforcementCases',
  './pages/NGODonations': './pages/ngo/NGODonations',
  './pages/NewDonationRequest': './pages/ngo/NewDonationRequest',
  './pages/NGOImpact': './pages/ngo/NGOImpact',
  
  // Component alias imports
  '@/components/STOLENLogo': '@/components/ui/STOLENLogo',
  '@/components/EnhancedSelect': '@/components/forms/EnhancedSelect',
  '@/components/BackButton': '@/components/navigation/BackButton',
  '@/components/LocationSelector': '@/components/ui/LocationSelector',
};

function fixImportsInFile(filePath) {
  console.log(`🔧 Fixing imports in: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let changesMade = 0;
  
  // Fix known mappings
  for (const [wrongPath, correctPath] of Object.entries(pathMappings)) {
    const regex = new RegExp(wrongPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = updatedContent.match(regex);
    if (matches) {
      updatedContent = updatedContent.replace(regex, correctPath);
      changesMade += matches.length;
      console.log(`  ✅ Fixed: ${wrongPath} → ${correctPath}`);
    }
  }
  
  if (changesMade > 0) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`  📝 Made ${changesMade} changes to ${filePath}`);
  } else {
    console.log(`  ✅ No changes needed for ${filePath}`);
  }
  
  return changesMade;
}

// Priority files to fix first
const priorityFiles = [
  'src/App.tsx',
  'src/pages/user/Register.tsx',
  'src/pages/user/Login.tsx',
  'src/pages/user/WhyStolen.tsx',
  'src/pages/user/Index.tsx'
];

console.log('🚀 Starting automated import fixing...\n');

let totalChanges = 0;

// Fix priority files first
console.log('📋 Fixing priority files...');
for (const file of priorityFiles) {
  if (fs.existsSync(file)) {
    const changes = fixImportsInFile(file);
    totalChanges += changes;
  }
}

console.log(`\n🎉 Import fixing completed!`);
console.log(`📝 Total changes made: ${totalChanges}`);
