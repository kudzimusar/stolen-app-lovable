import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

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
          <Route path="/lost-found-board" element={<CommunityBoard />} />
          <Route path="/community-rewards" element={<CommunityRewards />} />
          <Route path="/insurance-hub" element={<InsuranceHub />} />
          <Route path="/escrow-payment" element={<EscrowPayment />} />
          <Route path="/fraud-alerts" element={<FraudAlerts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/support" element={<Support />} />
          <Route path="/transfer-donate" element={<TransferDonate />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
