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
        case "repair_shop":
          navigate("/repair-shop-dashboard", { replace: true });
          break;
        case "retailer":
          navigate("/retailer-dashboard", { replace: true });
          break;
        case "law_enforcement":
          navigate("/law-enforcement-dashboard", { replace: true });
          break;
        case "insurance":
          navigate("/insurance-dashboard", { replace: true });
          break;
        case "ngo":
          navigate("/ngo-dashboard", { replace: true });
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