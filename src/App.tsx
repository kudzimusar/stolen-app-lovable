import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
          <Route path="/reverse-verify" element={<ReverseVerify />} />
          <Route path="/support" element={<Support />} />
          <Route path="/transfer-donate" element={<TransferDonate />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/stolen-reports" element={<StolenReports />} />
          <Route path="/why-stolen" element={<WhyStolen />} />
          <Route path="/device-certificate/:deviceId" element={<DeviceCertificate />} />
          <Route path="/security-testing" element={<SecurityTesting />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
