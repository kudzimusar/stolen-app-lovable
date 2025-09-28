import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  ShoppingCart, 
  Wallet, 
  User,
  QrCode,
  Plus,
  Shield,
  FileText,
  BarChart3,
  Package,
  Heart,
  Building,
  Wrench,
  Gavel,
  Users,
  Settings,
  CreditCard,
  TrendingUp,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();
  
  // Mock authentication state and user role - in real app would come from auth context
  const isLoggedIn = true; // This should come from auth context
  const userRole: string = "member"; // Mock role - should come from auth context
  
  // Role-specific navigation items
  const getNavItems = () => {
    switch (userRole) {
      case "retailer":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/retailer-dashboard",
            active: location.pathname === "/retailer-dashboard"
          },
          {
            icon: Search,
            label: "Inventory",
            href: "/retailer-inventory",
            active: location.pathname === "/retailer-inventory"
          },
          {
            icon: Plus,
            label: "Register",
            href: "/bulk-registration",
            active: location.pathname === "/bulk-registration",
            highlight: true
          },
          {
            icon: ShoppingCart,
            label: "Sales",
            href: "/retailer-sales",
            active: location.pathname === "/retailer-sales"
          },
          {
            icon: User,
            label: "Profile",
            href: "/retailer-profile",
            active: location.pathname === "/retailer-profile"
          }
        ];

      case "repair_shop":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/repair-shop-dashboard",
            active: location.pathname === "/repair-shop-dashboard"
          },
          {
            icon: Search,
            label: "Fraud Check",
            href: "/repair-fraud-detection",
            active: location.pathname === "/repair-fraud-detection"
          },
          {
            icon: Plus,
            label: "Log Repair",
            href: "/log-new-repair",
            active: location.pathname === "/log-new-repair",
            highlight: true
          },
          {
            icon: ShoppingCart,
            label: "Parts",
            href: "/repair-inventory",
            active: location.pathname === "/repair-inventory"
          },
          {
            icon: User,
            label: "Profile",
            href: "/repairer-profile",
            active: location.pathname === "/repairer-profile"
          }
        ];

      case "insurance":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/insurance-dashboard",
            active: location.pathname === "/insurance-dashboard"
          },
          {
            icon: Search,
            label: "Claims",
            href: "/insurance-claims",
            active: location.pathname === "/insurance-claims"
          },
          {
            icon: Plus,
            label: "New Claim",
            href: "/new-insurance-claim",
            active: location.pathname === "/new-insurance-claim",
            highlight: true
          },
          {
            icon: FileText,
            label: "Policies",
            href: "/insurance-policies",
            active: location.pathname === "/insurance-policies"
          },
          {
            icon: User,
            label: "Profile",
            href: "/insurance-profile",
            active: location.pathname === "/insurance-profile"
          }
        ];

      case "law_enforcement":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/law-enforcement-dashboard",
            active: location.pathname === "/law-enforcement-dashboard"
          },
          {
            icon: Search,
            label: "Search",
            href: "/law-enforcement-search",
            active: location.pathname === "/law-enforcement-search"
          },
          {
            icon: Plus,
            label: "Report",
            href: "/new-law-report",
            active: location.pathname === "/new-law-report",
            highlight: true
          },
          {
            icon: Shield,
            label: "Cases",
            href: "/law-enforcement-cases",
            active: location.pathname === "/law-enforcement-cases"
          },
          {
            icon: User,
            label: "Profile",
            href: "/law-enforcement-profile",
            active: location.pathname === "/law-enforcement-profile"
          }
        ];

      case "ngo":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/ngo-dashboard",
            active: location.pathname === "/ngo-dashboard"
          },
          {
            icon: Package,
            label: "Donations",
            href: "/ngo-donations",
            active: location.pathname === "/ngo-donations"
          },
          {
            icon: Plus,
            label: "Request",
            href: "/new-donation-request",
            active: location.pathname === "/new-donation-request",
            highlight: true
          },
          {
            icon: Heart,
            label: "Impact",
            href: "/ngo-impact",
            active: location.pathname === "/ngo-impact"
          },
          {
            icon: User,
            label: "Profile",
            href: "/ngo-profile",
            active: location.pathname === "/ngo-profile"
          }
        ];

      case "platform_admin":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/admin-dashboard",
            active: location.pathname === "/admin-dashboard"
          },
          {
            icon: Users,
            label: "Users",
            href: "/admin-users",
            active: location.pathname === "/admin-users"
          },
          {
            icon: Settings,
            label: "System",
            href: "/admin-system",
            active: location.pathname === "/admin-system",
            highlight: true
          },
          {
            icon: BarChart3,
            label: "Reports",
            href: "/admin-reports",
            active: location.pathname === "/admin-reports"
          },
          {
            icon: User,
            label: "Profile",
            href: "/admin-profile",
            active: location.pathname === "/admin-profile"
          }
        ];

      case "payment_gateway":
        return [
          {
            icon: Home,
            label: "Dashboard",
            href: "/payment-dashboard",
            active: location.pathname === "/payment-dashboard"
          },
          {
            icon: CreditCard,
            label: "Transactions",
            href: "/payment-transactions",
            active: location.pathname === "/payment-transactions"
          },
          {
            icon: Shield,
            label: "Fraud",
            href: "/payment-fraud",
            active: location.pathname === "/payment-fraud",
            highlight: true
          },
          {
            icon: TrendingUp,
            label: "Analytics",
            href: "/payment-analytics",
            active: location.pathname === "/payment-analytics"
          },
          {
            icon: User,
            label: "Profile",
            href: "/payment-profile",
            active: location.pathname === "/payment-profile"
          }
        ];

      case "member":
      default:
        return [
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
            label: "Sell",
            href: "/list-my-device",
            active: location.pathname === "/list-my-device" || location.pathname === "/seller-onboarding",
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
    }
  };

  const navItems = getNavItems();

  // Don't show on landing page, splash screen, or authentication pages
  const hideOnPaths = [
    "/", 
    "/splash-welcome", 
    "/login", 
    "/register",
    "/forgot-password",
    "/reset-password"
  ];
  
  // Debug logs removed for production
  
  if (hideOnPaths.includes(location.pathname)) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTop: '1px solid #e5e7eb',
        padding: '8px 16px',
        height: '80px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: '600px', margin: '0 auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                minWidth: '60px',
                minHeight: '56px',
                textDecoration: 'none',
                color: item.active ? '#3b82f6' : '#6b7280',
                backgroundColor: item.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon style={{ width: '20px', height: '20px', marginBottom: '4px' }} />
              <span style={{ fontSize: '12px', fontWeight: '500' }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};