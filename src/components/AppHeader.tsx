import { Button } from "@/components/ui/button";
import { STOLENLogo } from "@/components/STOLENLogo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Menu, Bell, Settings } from "lucide-react";
import { BackButton } from "@/components/BackButton";

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
  
  // Check if user is logged in (mock for now)
  const isLoggedIn = false; // This should come from auth context
  const userName = "Kudzie"; // This should come from user profile

  // Dynamic hamburger menu items based on auth state
  const menuItems = isLoggedIn ? [
    { label: `Hi ${userName}`, href: "#", isGreeting: true },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Register New Gadget", href: "/device/register" },
    { label: "Transfer", href: "/device-transfer" },
    { label: "Lost and Found Community", href: "/community-board" },
    { label: "My Devices", href: "/my-devices" },
    { label: "Support", href: "/support" }
  ] : [
    { label: "Register Profile", href: "/login" },
    { label: "Sign In", href: "/login" },
    { label: "About Us", href: "/learn" },
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

          {/* Center - Logo for dashboard */}
          {location.pathname === "/dashboard" && !showLogo && (
            <Link to="/">
              <STOLENLogo />
            </Link>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Custom right actions */}
            {rightActions}
            
            {/* Dashboard specific actions */}
            {location.pathname === "/dashboard" && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/fraud-alerts">
                    <Bell className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/profile">
                    <Settings className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            )}
            
            {/* Hamburger menu for landing page */}
            {isLandingPage && (
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
};