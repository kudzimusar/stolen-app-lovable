// Ultra-minimal App.tsx for final diagnosis
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";

// Original components restored
import Index from "./pages/user/Index";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Dashboard from "./pages/user/Dashboard";

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