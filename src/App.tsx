// Restoring working minimal version with our aiTransferEngine fix intact
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { EnhancedUXProvider } from "@/components/providers/EnhancedUXProvider";
import { ProtectedRoute } from "@/components/security/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/security/RoleBasedRedirect";

// Core working pages
import Index from "./pages/user/Index";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Dashboard from "./pages/user/Dashboard";

// Testing imports one by one to find the problematic one
// import Marketplace from "./pages/marketplace/Marketplace"; // PROBLEMATIC IMPORT
const Marketplace = lazy(() => import("./pages/marketplace/Marketplace"));
// Stakeholder dashboards - using existing comprehensive pages
const LawEnforcementDashboard = lazy(() => import("./pages/user/LawEnforcementDashboard"));
const LawEnforcementCases = lazy(() => import("./pages/law-enforcement/LawEnforcementCases"));
const LawEnforcementSearch = lazy(() => import("./pages/law-enforcement/LawEnforcementSearch"));
const NGODashboard = lazy(() => import("./pages/ngo/NGODashboard"));
const NGODonations = lazy(() => import("./pages/ngo/NGODonations"));
const NGOImpact = lazy(() => import("./pages/ngo/NGOImpact"));
const RepairShopDashboard = lazy(() => import("./pages/repair/RepairShopDashboard"));
const RepairBooking = lazy(() => import("./pages/repair/RepairBooking"));
const RepairInventory = lazy(() => import("./pages/repair/RepairInventory"));
const RetailerDashboard = lazy(() => import("./pages/user/RetailerDashboard"));
const RetailerInventory = lazy(() => import("./pages/stakeholders/RetailerInventory"));
const RetailerSales = lazy(() => import("./pages/stakeholders/RetailerSales"));
const InsuranceDashboardEnhanced = lazy(() => import("./pages/insurance/InsuranceDashboardEnhanced"));
const InsuranceClaims = lazy(() => import("./pages/insurance/InsuranceClaims"));
const InsurancePolicies = lazy(() => import("./pages/insurance/InsurancePolicies"));

// Marketplace pages (excluding main Marketplace which is already loaded)
const ProductDetail = lazy(() => import("./pages/marketplace/ProductDetail"));
const ListMyDevice = lazy(() => import("./pages/marketplace/ListMyDevice"));
const HotDealsFeed = lazy(() => import("./pages/marketplace/HotDealsFeed"));
const Cart = lazy(() => import("./pages/marketplace/Cart"));
const Checkout = lazy(() => import("./pages/marketplace/Checkout"));
const Wishlist = lazy(() => import("./pages/marketplace/Wishlist"));

// Additional user pages
const AboutUs = lazy(() => import("./pages/user/AboutUs"));
const WhyStolen = lazy(() => import("./pages/user/WhyStolen"));
const TrustBadges = lazy(() => import("./pages/user/TrustBadges"));
const DeviceTransfer = lazy(() => import("./pages/user/DeviceTransfer"));
const LostFoundBoard = lazy(() => import("./pages/user/LostFoundBoard"));
const LostFoundReport = lazy(() => import("./pages/user/LostFoundReport"));
const LostFoundDetails = lazy(() => import("./pages/user/LostFoundDetails"));
const LostFoundResponses = lazy(() => import("./pages/user/LostFoundResponses"));
const LostFoundContact = lazy(() => import("./pages/user/LostFoundContact"));
const ClaimDevice = lazy(() => import("./pages/user/ClaimDevice"));
const ClaimDevicePublic = lazy(() => import("./pages/user/ClaimDevicePublic"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminOnboarding = lazy(() => import("./pages/admin/AdminOnboarding"));
import Wallet from "./pages/payment/Wallet";
import DeviceCheck from "./pages/user/DeviceCheck";
import DeviceRegister from "./pages/user/DeviceRegister";
import MyDevices from "./pages/user/MyDevices";
import CommunityBoard from "./pages/user/CommunityBoard";
const CommunityRewards = lazy(() => import("./pages/user/CommunityRewards"));
const UnifiedAdminDashboard = lazy(() => import("./pages/admin/UnifiedAdminDashboard"));
import Profile from "./pages/user/Profile";
import DeviceWarrantyStatus from "./pages/user/DeviceWarrantyStatus";
import Support from "./pages/user/Support";
import PaymentHistory from "./pages/payment/PaymentHistory";
import StolenReports from "./pages/security/StolenReports";
import UserRepairHistory from "./pages/repair/UserRepairHistory";
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard";
// RetailerDashboard imported as lazy above

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <EnhancedUXProvider
          enableScrollMemory={false}
          enableCrossDeviceSync={false}
          enableFloatingControls={false}
          enablePageSearch={false}
          enableMicroAnimations={false}
          scrollControlsPosition="right"
        >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/debug" element={<div style={{padding: '20px', minHeight: '100vh', background: 'lightblue'}}><h1>Debug Page</h1><p>This is a test page to verify routing works.</p></div>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedRedirect>
                  <Dashboard />
                </RoleBasedRedirect>
              </ProtectedRoute>
            } 
          />
          
          {/* Testing routes one by one */}
          {/* <Route path="/marketplace" element={<Marketplace />} /> PROBLEMATIC */}
          <Route
            path="/marketplace"
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Marketplace...</div>}>
                <Marketplace />
              </Suspense>
            }
          />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/device/check" element={<ProtectedRoute><DeviceCheck /></ProtectedRoute>} />
          <Route path="/device/register" element={<ProtectedRoute><DeviceRegister /></ProtectedRoute>} />
          <Route path="/my-devices" element={<ProtectedRoute><MyDevices /></ProtectedRoute>} />
          <Route path="/community-board" element={<ProtectedRoute><CommunityBoard /></ProtectedRoute>} />
          <Route path="/community-rewards" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><CommunityRewards /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/device-warranty-status" element={<ProtectedRoute><DeviceWarrantyStatus /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/payment/history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/stolen-reports" element={<ProtectedRoute><StolenReports /></ProtectedRoute>} />
          <Route path="/repairs/history" element={<ProtectedRoute><UserRepairHistory /></ProtectedRoute>} />
          <Route path="/insurance-dashboard" element={<ProtectedRoute><InsuranceDashboard /></ProtectedRoute>} />
          <Route path="/admin/login" element={<Suspense fallback={<div>Loading...</div>}><AdminLogin /></Suspense>} />
          <Route path="/admin/onboarding" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><AdminOnboarding /></Suspense></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Suspense fallback={<div>Loading...</div>}><UnifiedAdminDashboard /></Suspense></ProtectedRoute>} />
          <Route 
            path="/law-enforcement-dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Law Enforcement...</div>}>
                  <LawEnforcementDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/ngo-dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading NGO...</div>}>
                  <NGODashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/repair-shop-dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Repair Shop...</div>}>
                  <RepairShopDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Law Enforcement Pages */}
          <Route 
            path="/law-enforcement/cases" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Cases...</div>}>
                  <LawEnforcementCases />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/law-enforcement/search" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Search...</div>}>
                  <LawEnforcementSearch />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* NGO Pages */}
          <Route 
            path="/ngo/donations" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Donations...</div>}>
                  <NGODonations />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/ngo/impact" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Impact...</div>}>
                  <NGOImpact />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Repair Pages */}
          <Route 
            path="/repair/booking" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Booking...</div>}>
                  <RepairBooking />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/repair/inventory" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Inventory...</div>}>
                  <RepairInventory />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Retailer Pages */}
          <Route 
            path="/retailer/inventory" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Retailer Inventory...</div>}>
                  <RetailerInventory />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/retailer/sales" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Sales...</div>}>
                  <RetailerSales />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          {/* Insurance Pages */}
          <Route 
            path="/insurance/enhanced" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Insurance...</div>}>
                  <InsuranceDashboardEnhanced />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/insurance/claims" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Claims...</div>}>
                  <InsuranceClaims />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/insurance/policies" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Policies...</div>}>
                  <InsurancePolicies />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/retailer-dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Retailer Dashboard...</div>}>
                  <RetailerDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Marketplace Pages */}
          <Route 
            path="/marketplace/product/:id" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Product...</div>}>
                <ProductDetail />
              </Suspense>
            }
          />
          <Route 
            path="/list-my-device" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading List Device...</div>}>
                  <ListMyDevice />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/hot-deals-feed" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Hot Deals...</div>}>
                <HotDealsFeed />
              </Suspense>
            }
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Cart...</div>}>
                  <Cart />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Checkout...</div>}>
                  <Checkout />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Wishlist...</div>}>
                  <Wishlist />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Additional User Pages */}
          <Route 
            path="/about-us" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading About...</div>}>
                <AboutUs />
              </Suspense>
            }
          />
          <Route 
            path="/why-stolen" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Why STOLEN...</div>}>
                <WhyStolen />
              </Suspense>
            }
          />
          <Route 
            path="/trust-badges" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Trust Badges...</div>}>
                <TrustBadges />
              </Suspense>
            }
          />
          <Route 
            path="/device-transfer" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Transfer...</div>}>
                  <DeviceTransfer />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/lost-found-board" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Lost & Found...</div>}>
                <LostFoundBoard />
              </Suspense>
            }
          />
          <Route 
            path="/lost-found-report" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<div style={{ padding: '20px' }}>Loading Report...</div>}>
                  <LostFoundReport />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/lost-found/details/:id" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Details...</div>}>
                <LostFoundDetails />
              </Suspense>
            }
          />
          <Route 
            path="/lost-found/responses/:id" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Responses...</div>}>
                <LostFoundResponses />
              </Suspense>
            }
          />
          <Route 
            path="/lost-found/contact/:id" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Contact...</div>}>
                <LostFoundContact />
              </Suspense>
            }
          />
          <Route 
            path="/lost-found/claim/:id" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Claim Form...</div>}>
                <ClaimDevice />
              </Suspense>
            }
          />
          <Route 
            path="/claim-device" 
            element={
              <Suspense fallback={<div style={{ padding: '20px' }}>Loading Claim Form...</div>}>
                <ClaimDevicePublic />
              </Suspense>
            }
          />

          <Route path="*" element={<div style={{padding: '20px'}}>
            <h2>Page Not Found</h2>
            <a href="/" style={{color: 'blue'}}>Go to Home</a>
          </div>} />
        </Routes>
        {!window.location.pathname.startsWith('/admin') && <BottomNavigation />}
        </EnhancedUXProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;