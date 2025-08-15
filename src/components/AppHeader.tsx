import { Button } from "@/components/ui/button";
import { STOLENLogo } from "@/components/STOLENLogo";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Menu, Bell, Settings, User, LogOut } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
  showBackButton?: boolean;
  backTo?: string;
  rightActions?: React.ReactNode;
}

export const AppHeader = ({ 
  title, 
  showLogo = false, 
  showBackButton = false, 
  backTo = "/dashboard",
  rightActions 
}: AppHeaderProps) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  
  // Authentication state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Dynamic hamburger menu items based on auth state
  const menuItems = isLoggedIn ? [
    { label: `Hi ${userName}`, href: "#", isGreeting: true },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Register New Gadget", href: "/device/register" },
    { label: "Transfer", href: "/device-transfer" },
    { label: "Lost and Found Community", href: "/community-board" },
    { label: "My Devices", href: "/my-devices" },
    { label: "Stolen Reports", href: "/stolen-reports" },
    { label: "Support", href: "/support" }
  ] : [
    { label: "Why STOLEN?", href: "/why-stolen" },
    { label: "Register", href: "/register" },
    { label: "Sign In", href: "/login" },
    { label: "About Us", href: "/about-us" },
    { label: "Support", href: "/support" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="container-responsive py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <BackButton to={backTo} />
            )}
            
            {/* Show logo on landing page or when explicitly requested */}
            {(showLogo || isLandingPage) && (
              <Link to="/">
                <STOLENLogo />
              </Link>
            )}
            
            {/* Show title on non-landing pages when not showing logo */}
            {title && !isLandingPage && !showLogo && (
              <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
            )}
          </div>

          {/* Center - Logo for dashboards */}
          {(location.pathname === "/dashboard" || 
            location.pathname === "/retailer-dashboard" ||
            location.pathname === "/repair-shop-dashboard" ||
            location.pathname === "/insurance-dashboard" ||
            location.pathname === "/law-enforcement-dashboard" ||
            location.pathname === "/ngo-dashboard") && !showLogo && (
            <Link to="/">
              <STOLENLogo />
            </Link>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Custom right actions */}
            {rightActions}
            
            {/* Dashboard specific actions for all dashboard pages and profile pages */}
            {(location.pathname === "/dashboard" || 
              location.pathname === "/retailer-dashboard" ||
              location.pathname === "/repair-shop-dashboard" ||
              location.pathname === "/insurance-dashboard" ||
              location.pathname === "/law-enforcement-dashboard" ||
              location.pathname === "/ngo-dashboard" ||
              location.pathname === "/profile" ||
              location.pathname === "/retailer-profile" ||
              location.pathname === "/repairer-profile" ||
              location.pathname === "/insurance-profile" ||
              location.pathname === "/law-enforcement-profile" ||
              location.pathname === "/ngo-profile") && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/fraud-alerts">
                    <Bell className="w-5 h-5" />
                  </Link>
                </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link to={
                location.pathname === "/retailer-dashboard" || location.pathname === "/retailer-profile" ? "/retailer-profile" :
                location.pathname === "/repair-shop-dashboard" || location.pathname === "/repairer-profile" ? "/repairer-profile" :
                location.pathname === "/insurance-dashboard" || location.pathname === "/insurance-profile" ? "/insurance-profile" :
                location.pathname === "/law-enforcement-dashboard" || location.pathname === "/law-enforcement-profile" ? "/law-enforcement-profile" :
                location.pathname === "/ngo-dashboard" || location.pathname === "/ngo-profile" ? "/ngo-profile" :
                "/profile"
              }>
                <User className="w-5 h-5" />
              </Link>
            </Button>
            <HamburgerMenu 
              dashboardLink={
                location.pathname === "/retailer-dashboard" || location.pathname === "/retailer-profile" ? "/retailer-dashboard" :
                location.pathname === "/repair-shop-dashboard" || location.pathname === "/repairer-profile" ? "/repair-shop-dashboard" :
                location.pathname === "/insurance-dashboard" || location.pathname === "/insurance-profile" ? "/insurance-dashboard" :
                location.pathname === "/law-enforcement-dashboard" || location.pathname === "/law-enforcement-profile" ? "/law-enforcement-dashboard" :
                location.pathname === "/ngo-dashboard" || location.pathname === "/ngo-profile" ? "/ngo-dashboard" :
                "/dashboard"
              }
              profileLink={
                location.pathname === "/retailer-dashboard" || location.pathname === "/retailer-profile" ? "/retailer-profile" :
                location.pathname === "/repair-shop-dashboard" || location.pathname === "/repairer-profile" ? "/repairer-profile" :
                location.pathname === "/insurance-dashboard" || location.pathname === "/insurance-profile" ? "/insurance-profile" :
                location.pathname === "/law-enforcement-dashboard" || location.pathname === "/law-enforcement-profile" ? "/law-enforcement-profile" :
                location.pathname === "/ngo-dashboard" || location.pathname === "/ngo-profile" ? "/ngo-profile" :
                "/profile"
              }
              userRole={
                location.pathname === "/retailer-dashboard" || location.pathname === "/retailer-profile" ? "retailer" :
                location.pathname === "/repair-shop-dashboard" || location.pathname === "/repairer-profile" ? "repairer" :
                location.pathname === "/insurance-dashboard" || location.pathname === "/insurance-profile" ? "insurance" :
                location.pathname === "/law-enforcement-dashboard" || location.pathname === "/law-enforcement-profile" ? "law-enforcement" :
                location.pathname === "/ngo-dashboard" || location.pathname === "/ngo-profile" ? "ngo" :
                "member"
              }
            />
              </>
            )}
            
            {/* Hamburger menu for mobile */}
            {isLandingPage && (
              <>
                {/* Mobile hamburger menu */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72">
                      <div className="flex flex-col gap-4 mt-8">
                        <div className="mb-6">
                          <STOLENLogo />
                        </div>
                        
                         <div className="space-y-2">
                           <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                             Quick Access
                           </h3>
                           {menuItems.map((item) => (
                             item.isGreeting ? (
                               <div key={item.href} className="p-3 bg-primary/10 rounded-lg">
                                 <p className="font-semibold text-primary">{item.label}</p>
                               </div>
                             ) : (
                               <Button
                                 key={item.href}
                                 variant="ghost"
                                 className="w-full justify-start"
                                 asChild
                               >
                                 <Link to={item.href}>{item.label}</Link>
                               </Button>
                             )
                           ))}
                           
                           {/* Logout button for authenticated users */}
                           {isLoggedIn && (
                             <div className="border-t pt-4 mt-4">
                               <Button 
                                 variant="destructive" 
                                 className="w-full justify-start" 
                                 onClick={handleLogout}
                               >
                                 <LogOut className="w-4 h-4 mr-3" />
                                 Sign Out
                               </Button>
                             </div>
                           )}
                         </div>
                        
                        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Need help? Contact our support team for assistance with device registration and verification.
                          </p>
                          <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                            <Link to="/support">Get Support</Link>
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Desktop navigation links */}
                <div className="hidden md:flex items-center gap-4 lg:gap-6">
                  <Link to="/why-stolen" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Why STOLEN?</Link>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Features</a>
                  <Link to="/hot-deals-hub" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Quick Deals</Link>
                  <Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Marketplace</Link>
                  <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors text-sm lg:text-base">Support</Link>
                  
                  {isLoggedIn ? (
                    <>
                      <Button variant="outline" size="sm" asChild className="md:size-default">
                        <Link to="/dashboard">Dashboard</Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="md:size-default" 
                        onClick={handleLogout}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" asChild className="md:size-default">
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button variant="hero" size="sm" asChild className="md:size-default">
                        <Link to="/splash-welcome">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};