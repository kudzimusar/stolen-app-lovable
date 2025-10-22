import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RoleBasedRedirectProps {
  userRole?: string;
  children: React.ReactNode;
}

export const RoleBasedRedirect = ({ userRole, children }: RoleBasedRedirectProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Mock user role - in real app, get from auth context/Supabase
    const mockRole = userRole || "individual"; // Default to individual user

    // Redirect based on user role when accessing general dashboard
    if (window.location.pathname === "/dashboard" && mockRole !== "individual") {
      switch (mockRole) {
        case "admin":
        case "super_admin":
          navigate("/admin", { replace: true });
          break;
        case "repair_shop":
          navigate("/repair-shop-admin", { replace: true }); // New admin panel
          break;
        case "retailer":
          navigate("/retailer-admin", { replace: true }); // New admin panel
          break;
        case "law_enforcement":
          navigate("/law-enforcement-admin", { replace: true }); // New admin panel
          break;
        case "insurance":
          navigate("/insurance-admin", { replace: true }); // New admin panel
          break;
        case "ngo":
          navigate("/ngo-admin", { replace: true }); // New admin panel
          break;
        default:
          // Individual users can access general dashboard
          break;
      }
    }
  }, [userRole, navigate]);

  return <>{children}</>;
};

export default RoleBasedRedirect;