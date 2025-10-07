import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Auth session error:', error);
          setLoading(false);
          setAuthChecked(true);
          navigate("/login");
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          navigate("/login");
        }
        
        setLoading(false);
        setAuthChecked(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
          navigate("/login");
        }
      }
    };

    // Only check auth once on mount
    if (!authChecked) {
      checkAuth();
    }

    // Listen for auth changes only after initial check
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted || !authChecked) return;
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        navigate("/login");
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, authChecked]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};