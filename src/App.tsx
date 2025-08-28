import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import DeviceCheck from "./pages/DeviceCheck";
import DeviceRegister from "./pages/DeviceRegister";
import DeviceDetails from "./pages/DeviceDetails";
import LostFoundReport from "./pages/LostFoundReport";
import CommunityBoard from "./pages/CommunityBoard";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Support from "./pages/Support";
import TransferDonate from "./pages/TransferDonate";
import SplashWelcome from "./pages/SplashWelcome";
import InsuranceHub from "./pages/InsuranceHub";
import DeviceRecoveryStatus from "./pages/DeviceRecoveryStatus";
import CommunityRewards from "./pages/CommunityRewards";
import EscrowPayment from "./pages/EscrowPayment";
import FraudAlerts from "./pages/FraudAlerts";
import RetailerDashboard from "./pages/RetailerDashboard";
import RepairShopDashboard from "./pages/RepairShopDashboard";
import LawEnforcementDashboard from "./pages/LawEnforcementDashboard";
import NGODashboard from "./pages/NGODashboard";
import PsychologyAssistedHelper from "./pages/PsychologyAssistedHelper";
import ReverseVerify from "./pages/ReverseVerify";
import FeedbackRating from "./pages/FeedbackRating";
import AnalyticsInsights from "./pages/AnalyticsInsights";
import NotFound from "./pages/NotFound";
import DeviceTransfer from "./pages/DeviceTransfer";
import OwnershipHistory from "./pages/OwnershipHistory";
import FraudDatabase from "./pages/FraudDatabase";
import MyDevices from "./pages/MyDevices";
import DeviceLifecycleManager from "./pages/DeviceLifecycleManager";
import DeviceWarrantyStatus from "./pages/DeviceWarrantyStatus";
import WidgetGenerator from "./pages/WidgetGenerator";
import Learn from "./pages/Learn";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import StolenReports from "./pages/StolenReports";
import DeviceCertificate from "./pages/DeviceCertificate";
import InsuranceDashboard from "./pages/InsuranceDashboard";
import RetailerProfile from "./pages/RetailerProfile";
import RepairerProfile from "./pages/RepairerProfile";
import InsuranceProfile from "./pages/InsuranceProfile";
import LawEnforcementProfile from "./pages/LawEnforcementProfile";
import NGOProfile from "./pages/NGOProfile";
import WhyStolen from "./pages/WhyStolen";
import UserRepairHistory from "./pages/UserRepairHistory";
import SecurityTesting from "./pages/SecurityTesting";
import GeolocationTesting from "./pages/GeolocationTesting";
import SystemStatus from "./pages/SystemStatus";
import ProductDetail from "./pages/ProductDetail";
import SellerProfile from "./pages/SellerProfile";
import PostPurchase from "./pages/PostPurchase";
import Wishlist from "./pages/Wishlist";
import TrustBadges from "./pages/TrustBadges";
import SellerOnboarding from "./pages/SellerOnboarding";
import BulkListing from "./pages/BulkListing";
import ReferralRewards from "./pages/ReferralRewards";
import OrderDetails from "./pages/OrderDetails";
import RelistDevice from "./pages/RelistDevice";
import RepairUpdate from "./pages/RepairUpdate";
import Cart from "./pages/Cart";
import ContactSeller from "./pages/ContactSeller";
import InsuranceQuote from "./pages/InsuranceQuote";
import ReportListing from "./pages/ReportListing";
import HotDeals from "./pages/HotDeals";
import HotDealsFeed from "./pages/HotDealsFeed";
import HotDealsHub from "./pages/HotDealsHub";
import HotBuyerRequest from "./pages/HotBuyerRequest";
import HotDealsChatPage from "./pages/HotDealsChatPage";
import ListMyDevice from "./pages/ListMyDevice";
import RepairBooking from "./pages/RepairBooking";
import RepairFraudDetection from "./pages/RepairFraudDetection";
import RepairInsuranceIntegration from "./pages/RepairInsuranceIntegration";
import RepairNGOPrograms from "./pages/RepairNGOPrograms";
import RepairSupport from "./pages/RepairSupport";
import RepairCertificates from "./pages/RepairCertificates";
import RepairAnalytics from "./pages/RepairAnalytics";
import RepairCustomers from "./pages/RepairCustomers";
import RepairInventory from "./pages/RepairInventory";
import RepairOrderFlow from "./pages/RepairOrderFlow";
import RepairHistoryManagement from "./pages/RepairHistoryManagement";
import DisputeMediationCenter from "./pages/DisputeMediationCenter";
import RepairMarketplace from "./pages/RepairMarketplace";
import RepairerNotifications from "./pages/RepairerNotifications";
import IndividualNotifications from "./pages/IndividualNotifications";
import CompanyProfile from "./pages/CompanyProfile";
import LogNewRepair from "./pages/LogNewRepair";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSystem from "./pages/AdminSystem";
import AdminReports from "./pages/AdminReports";
import AdminProfile from "./pages/AdminProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ApiDocumentation from "./pages/ApiDocumentation";
import PaymentDashboard from "./pages/PaymentDashboard";
import PaymentTransactions from "./pages/PaymentTransactions";
import PaymentFraud from "./pages/PaymentFraud";
import PaymentAnalytics from "./pages/PaymentAnalytics";
import PaymentProfile from "./pages/PaymentProfile";

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
          <Route path="/lost-found-board" element={<CommunityBoard />} />
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
           <Route path="/hot-deals-feed" element={<HotDealsFeed />} />
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
           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
