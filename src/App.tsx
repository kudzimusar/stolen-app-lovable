// Restoring working minimal version with our aiTransferEngine fix intact
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

// Core working pages
import Index from "./pages/user/Index";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Dashboard from "./pages/user/Dashboard";

// Testing imports one by one to find the problematic one
// import Marketplace from "./pages/marketplace/Marketplace"; // PROBLEMATIC IMPORT
import Wallet from "./pages/payment/Wallet";
import DeviceCheck from "./pages/user/DeviceCheck";
import DeviceRegister from "./pages/user/DeviceRegister";
import MyDevices from "./pages/user/MyDevices";
import CommunityBoard from "./pages/user/CommunityBoard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Testing routes one by one */}
          {/* <Route path="/marketplace" element={<Marketplace />} /> PROBLEMATIC */}
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/device/check" element={<DeviceCheck />} />
          <Route path="/device/register" element={<DeviceRegister />} />
          <Route path="/my-devices" element={<MyDevices />} />
          <Route path="/community-board" element={<CommunityBoard />} />

          <Route path="*" element={<div style={{padding: '20px'}}>
            <h2>Page Not Found</h2>
            <a href="/" style={{color: 'blue'}}>Go to Home</a>
          </div>} />
        </Routes>
        <BottomNavigation />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;