import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  ShoppingCart, 
  Wallet, 
  User,
  QrCode,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
      active: location.pathname === "/dashboard"
    },
    {
      icon: Search,
      label: "Check",
      href: "/device/check",
      active: location.pathname === "/device/check"
    },
    {
      icon: Plus,
      label: "Register",
      href: "/device/register",
      active: location.pathname === "/device/register",
      highlight: true
    },
    {
      icon: ShoppingCart,
      label: "Market",
      href: "/marketplace",
      active: location.pathname === "/marketplace"
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
      active: location.pathname === "/profile"
    }
  ];

  // Don't show on landing page, splash screen, or PC screens
  if (location.pathname === "/" || location.pathname === "/splash-welcome") return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                "min-w-[60px] min-h-[56px]",
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                item.highlight && !item.active && "text-primary"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1",
                item.highlight && "drop-shadow-lg"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};