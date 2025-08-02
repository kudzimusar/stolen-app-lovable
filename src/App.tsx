import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";
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
          <Route path="/register" element={<Navigate to="/device/register" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/device/check" element={<DeviceCheck />} />
          <Route path="/device/register" element={<DeviceRegister />} />
          <Route path="/device/:id" element={<DeviceDetails />} />
          <Route path="/device/recovery-status" element={<DeviceRecoveryStatus />} />
          <Route path="/lost-found-report" element={<LostFoundReport />} />
          <Route path="/community-board" element={<CommunityBoard />} />
          <Route path="/lost-found-board" element={<CommunityBoard />} />
          <Route path="/community-rewards" element={<CommunityRewards />} />
          <Route path="/insurance-hub" element={<InsuranceHub />} />
          <Route path="/escrow-payment" element={<EscrowPayment />} />
          <Route path="/fraud-alerts" element={<FraudAlerts />} />
          <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
          <Route path="/repair-shop-dashboard" element={<RepairShopDashboard />} />
          <Route path="/law-enforcement-dashboard" element={<LawEnforcementDashboard />} />
          <Route path="/ngo-dashboard" element={<NGODashboard />} />
          <Route path="/psychology-helper" element={<PsychologyAssistedHelper />} />
          <Route path="/reverse-verify" element={<ReverseVerify />} />
          <Route path="/feedback-rating" element={<FeedbackRating />} />
          <Route path="/analytics-insights" element={<AnalyticsInsights />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/support" element={<Support />} />
          <Route path="/transfer-donate" element={<TransferDonate />} />
          <Route path="/device-transfer" element={<DeviceTransfer />} />
          <Route path="/ownership-history" element={<OwnershipHistory />} />
          <Route path="/fraud-database" element={<FraudDatabase />} />
          <Route path="/my-devices" element={<MyDevices />} />
          <Route path="/device-lifecycle-manager" element={<DeviceLifecycleManager />} />
          <Route path="/device-warranty-status" element={<DeviceWarrantyStatus />} />
          <Route path="/widget-generator" element={<WidgetGenerator />} />
          <Route path="/learn" element={<Learn />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
