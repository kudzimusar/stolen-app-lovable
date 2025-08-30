import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { ProtectedRoute } from "@/components/security/ProtectedRoute";
import RoleBasedRedirect from "@/components/security/RoleBasedRedirect";
import Index from "./pages/user/Index";
import Login from "./pages/user/Login";
import Dashboard from "./pages/user/Dashboard";
import Marketplace from "./pages/marketplace/Marketplace";
import DeviceCheck from "./pages/user/DeviceCheck";
import DeviceRegister from "./pages/user/DeviceRegister";
import DeviceDetails from "./pages/user/DeviceDetails";
import LostFoundReport from "./pages/user/LostFoundReport";
import CommunityBoard from "./pages/user/CommunityBoard";
import LostFoundBoard from "./pages/user/LostFoundBoard";
import Profile from "./pages/user/Profile";
import Wallet from "./pages/payment/Wallet";
import Support from "./pages/user/Support";
import TransferDonate from "./pages/user/TransferDonate";
import SplashWelcome from "./pages/user/SplashWelcome";
import InsuranceHub from "./pages/insurance/InsuranceHub";
import DeviceRecoveryStatus from "./pages/user/DeviceRecoveryStatus";
import CommunityRewards from "./pages/user/CommunityRewards";
import EscrowPayment from "./pages/payment/EscrowPayment";import FraudAlerts from "./pages/security/FraudAlerts";
import RetailerDashboard from "./pages/user/RetailerDashboard";
import RepairShopDashboard from "./pages/repair/RepairShopDashboard";import LawEnforcementDashboard from "./pages/user/LawEnforcementDashboard";
import NGODashboard from "./pages/ngo/NGODashboard";import PsychologyAssistedHelper from "./pages/user/PsychologyAssistedHelper";
import ReverseVerify from "./pages/security/ReverseVerify";
import FeedbackRating from "./pages/user/FeedbackRating";import AnalyticsInsights from "./pages/admin/AnalyticsInsights";
import NotFound from "./pages/user/NotFound";
import DeviceTransfer from "./pages/user/DeviceTransfer";
import AITransferSuggestions from "./pages/ai/AITransferSuggestions";
import OwnershipHistory from "./pages/user/OwnershipHistory";
import FraudDatabase from "./pages/security/FraudDatabase";
import MyDevices from "./pages/user/MyDevices";
import DeviceLifecycleManager from "./pages/user/DeviceLifecycleManager";
import DeviceWarrantyStatus from "./pages/user/DeviceWarrantyStatus";
import WidgetGenerator from "./pages/admin/WidgetGenerator";
import Learn from "./pages/user/Learn";
import Register from "./pages/user/Register";
import AboutUs from "./pages/user/AboutUs";
import StolenReports from "./pages/security/StolenReports";
import DeviceCertificate from "./pages/user/DeviceCertificate";
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard";import RetailerProfile from "./pages/stakeholders/RetailerProfile";
import RepairerProfile from "./pages/repair/RepairerProfile";
import InsuranceProfile from "./pages/insurance/InsuranceProfile";
import LawEnforcementProfile from "./pages/law-enforcement/LawEnforcementProfile";
import NGOProfile from "./pages/ngo/NGOProfile";
import WhyStolen from "./pages/user/WhyStolen";
import UserRepairHistory from "./pages/repair/UserRepairHistory";
import SecurityTesting from "./pages/security/SecurityTesting";
import GeolocationTesting from "./pages/security/GeolocationTesting";import SystemStatus from "./pages/admin/SystemStatus";
import ProductDetail from "./pages/marketplace/ProductDetail";
import SellerProfile from "./pages/stakeholders/SellerProfile";
import PostPurchase from "./pages/marketplace/PostPurchase";
import Wishlist from "./pages/marketplace/Wishlist";
import TrustBadges from "./pages/user/TrustBadges";
import SellerOnboarding from "./pages/stakeholders/SellerOnboarding";
import BulkListing from "./pages/marketplace/BulkListing";
import ReferralRewards from "./pages/user/ReferralRewards";
import OrderDetails from "./pages/marketplace/OrderDetails";
import RelistDevice from "./pages/marketplace/RelistDevice";
import RepairUpdate from "./pages/repair/RepairUpdate";
import Cart from "./pages/marketplace/Cart";
import ContactSeller from "./pages/marketplace/ContactSeller";
import InsuranceQuote from "./pages/insurance/InsuranceQuote";
import ReportListing from "./pages/marketplace/ReportListing";
import HotDeals from "./pages/marketplace/HotDeals";
import HotDealsFeed from "./pages/marketplace/HotDealsFeed";
import HotDealsHub from "./pages/marketplace/HotDealsHub";
import HotBuyerRequest from "./pages/marketplace/HotBuyerRequest";import HotDealsChatPage from "./pages/marketplace/HotDealsChatPage";
import ListMyDevice from "./pages/marketplace/ListMyDevice";
import RepairBooking from "./pages/repair/RepairBooking";
import RepairFraudDetection from "./pages/repair/RepairFraudDetection";
import RepairInsuranceIntegration from "./pages/repair/RepairInsuranceIntegration";
import RepairNGOPrograms from "./pages/repair/RepairNGOPrograms";
import RepairSupport from "./pages/repair/RepairSupport";
import RepairCertificates from "./pages/repair/RepairCertificates";
import RepairAnalytics from "./pages/repair/RepairAnalytics";
import RepairCustomers from "./pages/repair/RepairCustomers";
import RepairInventory from "./pages/repair/RepairInventory";
import RepairOrderFlow from "./pages/repair/RepairOrderFlow";
import RepairHistoryManagement from "./pages/repair/RepairHistoryManagement";
import DisputeMediationCenter from "./pages/DisputeMediationCenter";
import RepairMarketplace from "./pages/repair/RepairMarketplace";
import RepairerNotifications from "./pages/repair/RepairerNotifications";
import IndividualNotifications from "./pages/user/IndividualNotifications";
import CompanyProfile from "./pages/stakeholders/CompanyProfile";
import LogNewRepair from "./pages/repair/LogNewRepair";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminReports from "./pages/admin/AdminReports";
import AdminProfile from "./pages/admin/AdminProfile";
import PrivacyPolicy from "./pages/user/PrivacyPolicy";
import TermsOfService from "./pages/user/TermsOfService";
import ApiDocumentation from "./pages/admin/ApiDocumentation";
// import PaymentDashboard from "./pages/payment/PaymentDashboard";// File doesn't existimport PaymentTransactions from "./pages/payment/PaymentTransactions";
import PaymentFraud from "./pages/payment/PaymentFraud";
import PaymentAnalytics from "./pages/payment/PaymentAnalytics";
import PaymentProfile from "./pages/payment/PaymentProfile";

// Import missing components for bottom navigation routes
// import RetailerInventory from "./pages/stakeholders/RetailerInventory";// File doesn't existimport BulkRegistration from "./pages/marketplace/BulkRegistration";
// import RetailerSales from "./pages/stakeholders/RetailerSales";// File doesn't existimport InsuranceClaims from "./pages/insurance/InsuranceClaims";
// import NewInsuranceClaim from "./pages/insurance/NewInsuranceClaim";// File doesn't existimport InsurancePolicies from "./pages/insurance/InsurancePolicies";
import LawEnforcementSearch from "./pages/law-enforcement/LawEnforcementSearch";
import NewLawReport from "./pages/law-enforcement/NewLawReport";
import LawEnforcementCases from "./pages/law-enforcement/LawEnforcementCases";
import NGODonations from "./pages/ngo/NGODonations";
import NewDonationRequest from "./pages/ngo/NewDonationRequest";
import NGOImpact from "./pages/ngo/NGOImpact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/splash-welcome" element={<SplashWelcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected routes - require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRedirect>
                <Dashboard />
              </RoleBasedRedirect>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-devices" element={<ProtectedRoute><MyDevices /></ProtectedRoute>} />
          <Route path="/device/register" element={<ProtectedRoute><DeviceRegister /></ProtectedRoute>} />
          <Route path="/device/:id" element={<ProtectedRoute><DeviceDetails /></ProtectedRoute>} />
          <Route path="/device/recovery-status" element={<ProtectedRoute><DeviceRecoveryStatus /></ProtectedRoute>} />
          <Route path="/lost-found-report" element={<ProtectedRoute><LostFoundReport /></ProtectedRoute>} />
          <Route path="/community-rewards" element={<ProtectedRoute><CommunityRewards /></ProtectedRoute>} />
          <Route path="/escrow-payment" element={<ProtectedRoute><EscrowPayment /></ProtectedRoute>} />
          <Route path="/fraud-alerts" element={<ProtectedRoute><FraudAlerts /></ProtectedRoute>} />
          <Route path="/retailer-dashboard" element={<ProtectedRoute><RetailerDashboard /></ProtectedRoute>} />
          <Route path="/repair-shop-dashboard" element={<ProtectedRoute><RepairShopDashboard /></ProtectedRoute>} />
          <Route path="/law-enforcement-dashboard" element={<ProtectedRoute><LawEnforcementDashboard /></ProtectedRoute>} />
          <Route path="/ngo-dashboard" element={<ProtectedRoute><NGODashboard /></ProtectedRoute>} />
          <Route path="/insurance-dashboard" element={<ProtectedRoute><InsuranceDashboard /></ProtectedRoute>} />
          <Route path="/psychology-helper" element={<ProtectedRoute><PsychologyAssistedHelper /></ProtectedRoute>} />
          <Route path="/feedback-rating" element={<ProtectedRoute><FeedbackRating /></ProtectedRoute>} />
          <Route path="/analytics-insights" element={<ProtectedRoute><AnalyticsInsights /></ProtectedRoute>} />
          <Route path="/retailer-profile" element={<ProtectedRoute><RetailerProfile /></ProtectedRoute>} />
          <Route path="/repairer-profile" element={<ProtectedRoute><RepairerProfile /></ProtectedRoute>} />
          <Route path="/insurance-profile" element={<ProtectedRoute><InsuranceProfile /></ProtectedRoute>} />
          <Route path="/law-enforcement-profile" element={<ProtectedRoute><LawEnforcementProfile /></ProtectedRoute>} />
          <Route path="/ngo-profile" element={<ProtectedRoute><NGOProfile /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/device-transfer" element={<ProtectedRoute><DeviceTransfer /></ProtectedRoute>} />
          <Route path="/ai-transfer-suggestions" element={<ProtectedRoute><AITransferSuggestions /></ProtectedRoute>} />
          <Route path="/ownership-history" element={<ProtectedRoute><OwnershipHistory /></ProtectedRoute>} />
          <Route path="/fraud-database" element={<ProtectedRoute><FraudDatabase /></ProtectedRoute>} />
          <Route path="/device-lifecycle-manager" element={<ProtectedRoute><DeviceLifecycleManager /></ProtectedRoute>} />
          <Route path="/device-warranty-status" element={<ProtectedRoute><DeviceWarrantyStatus /></ProtectedRoute>} />
          <Route path="/widget-generator" element={<ProtectedRoute><WidgetGenerator /></ProtectedRoute>} />
          <Route path="/user/repair-history" element={<ProtectedRoute><UserRepairHistory /></ProtectedRoute>} />
          
          {/* Public routes - accessible without authentication */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/device/check" element={<DeviceCheck />} />
          <Route path="/community-board" element={<CommunityBoard />} />
          <Route path="/lost-found-board" element={<LostFoundBoard />} />
           <Route path="/insurance-hub" element={<InsuranceHub />} />
           <Route path="/insurance-quote/:id" element={<InsuranceQuote />} />
          <Route path="/reverse-verify" element={<ReverseVerify />} />
          <Route path="/support" element={<Support />} />
          <Route path="/transfer-donate" element={<TransferDonate />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about-us" element={<AboutUs />} />
           <Route path="/stolen-reports" element={<StolenReports />} />
           <Route path="/report-listing/:id" element={<ReportListing />} />
           <Route path="/hot-deals" element={<ProtectedRoute><HotDeals /></ProtectedRoute>} />
           <Route path="/hot-deals-feed" element={<ProtectedRoute><HotDealsFeed /></ProtectedRoute>} />
           <Route path="/hot-deals-hub" element={<ProtectedRoute><HotDealsHub /></ProtectedRoute>} />
           <Route path="/hot-buyer-request" element={<ProtectedRoute><HotBuyerRequest /></ProtectedRoute>} />
           <Route path="/hot-deals-chat/:dealId" element={<ProtectedRoute><HotDealsChatPage /></ProtectedRoute>} />
           <Route path="/list-my-device" element={<ProtectedRoute><ListMyDevice /></ProtectedRoute>} />
          <Route path="/why-stolen" element={<WhyStolen />} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/trust-badges" element={<TrustBadges />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/api-documentation" element={<ApiDocumentation />} />
          <Route path="/device-certificate/:deviceId" element={<DeviceCertificate />} />
          <Route path="/security-testing" element={<SecurityTesting />} />
          <Route path="/geolocation-testing" element={<GeolocationTesting />} />
          <Route path="/system-status" element={<SystemStatus />} />
          <Route path="/cart" element={<Cart />} />

          {/* Public marketplace detail routes */}
          <Route path="/marketplace/product/:id" element={<ProductDetail />} />
          <Route path="/seller/:sellerId" element={<SellerProfile />} />
          <Route path="/seller/:sellerId/contact" element={<ContactSeller />} />

           {/* Checkout and post-purchase */}
           <Route path="/checkout/:listingId" element={<ProtectedRoute><EscrowPayment /></ProtectedRoute>} />
           <Route path="/order/:orderId/confirmation" element={<ProtectedRoute><PostPurchase /></ProtectedRoute>} />
           <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
           <Route path="/relist/:orderId" element={<ProtectedRoute><RelistDevice /></ProtectedRoute>} />
           <Route path="/repairs/new" element={<ProtectedRoute><RepairUpdate /></ProtectedRoute>} />

           {/* Repairer features */}
           <Route path="/repair-booking" element={<ProtectedRoute><RepairBooking /></ProtectedRoute>} />
           <Route path="/repair-fraud-detection" element={<ProtectedRoute><RepairFraudDetection /></ProtectedRoute>} />
           <Route path="/repair-insurance-integration" element={<ProtectedRoute><RepairInsuranceIntegration /></ProtectedRoute>} />
           <Route path="/repair-support" element={<ProtectedRoute><RepairSupport /></ProtectedRoute>} />
           <Route path="/repair-certificates" element={<ProtectedRoute><RepairCertificates /></ProtectedRoute>} />
           <Route path="/repair-analytics" element={<ProtectedRoute><RepairAnalytics /></ProtectedRoute>} />
           <Route path="/repair-customers" element={<ProtectedRoute><RepairCustomers /></ProtectedRoute>} />
           <Route path="/repair-inventory" element={<ProtectedRoute><RepairInventory /></ProtectedRoute>} />
           <Route path="/repair-order-flow" element={<ProtectedRoute><RepairOrderFlow /></ProtectedRoute>} />
           <Route path="/repair-history-management" element={<ProtectedRoute><RepairHistoryManagement /></ProtectedRoute>} />
           <Route path="/dispute-mediation" element={<ProtectedRoute><DisputeMediationCenter /></ProtectedRoute>} />
            <Route path="/repair-marketplace" element={<ProtectedRoute><RepairMarketplace /></ProtectedRoute>} />
            <Route path="/repairer-notifications" element={<ProtectedRoute><RepairerNotifications /></ProtectedRoute>} />
            <Route path="/individual-notifications" element={<ProtectedRoute><IndividualNotifications /></ProtectedRoute>} />
            <Route path="/company-profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
            <Route path="/log-new-repair" element={<ProtectedRoute><LogNewRepair /></ProtectedRoute>} />

           {/* Platform Administrator routes */}
           <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
           <Route path="/admin-users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
           <Route path="/admin-system" element={<ProtectedRoute><AdminSystem /></ProtectedRoute>} />
           <Route path="/admin-reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
           <Route path="/admin-profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

           {/* Banks/Payment Gateways routes */}
           <Route path="/payment-dashboard" element={<ProtectedRoute><PaymentDashboard /></ProtectedRoute>} />
           <Route path="/payment-transactions" element={<ProtectedRoute><PaymentTransactions /></ProtectedRoute>} />
           <Route path="/payment-fraud" element={<ProtectedRoute><PaymentFraud /></ProtectedRoute>} />
           <Route path="/payment-analytics" element={<ProtectedRoute><PaymentAnalytics /></ProtectedRoute>} />
           <Route path="/payment-profile" element={<ProtectedRoute><PaymentProfile /></ProtectedRoute>} />

           {/* Seller flows */}
           <Route path="/seller-onboarding" element={<ProtectedRoute><SellerOnboarding /></ProtectedRoute>} />
           <Route path="/bulk-listings" element={<ProtectedRoute><BulkListing /></ProtectedRoute>} />
           <Route path="/referrals" element={<ProtectedRoute><ReferralRewards /></ProtectedRoute>} />

           {/* Missing routes from bottom navigation */}
           {/* Retailer routes */}
           <Route path="/retailer-inventory" element={<ProtectedRoute><RetailerInventory /></ProtectedRoute>} />
           <Route path="/bulk-registration" element={<ProtectedRoute><BulkRegistration /></ProtectedRoute>} />
           <Route path="/retailer-sales" element={<ProtectedRoute><RetailerSales /></ProtectedRoute>} />

           {/* Insurance routes */}
           <Route path="/insurance-claims" element={<ProtectedRoute><InsuranceClaims /></ProtectedRoute>} />
           <Route path="/new-insurance-claim" element={<ProtectedRoute><NewInsuranceClaim /></ProtectedRoute>} />
           <Route path="/insurance-policies" element={<ProtectedRoute><InsurancePolicies /></ProtectedRoute>} />

           {/* Law Enforcement routes */}
           <Route path="/law-enforcement-search" element={<ProtectedRoute><LawEnforcementSearch /></ProtectedRoute>} />
           <Route path="/new-law-report" element={<ProtectedRoute><NewLawReport /></ProtectedRoute>} />
           <Route path="/law-enforcement-cases" element={<ProtectedRoute><LawEnforcementCases /></ProtectedRoute>} />

           {/* NGO routes */}
           <Route path="/ngo-donations" element={<ProtectedRoute><NGODonations /></ProtectedRoute>} />
           <Route path="/new-donation-request" element={<ProtectedRoute><NewDonationRequest /></ProtectedRoute>} />
           <Route path="/ngo-impact" element={<ProtectedRoute><NGOImpact /></ProtectedRoute>} />

           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
