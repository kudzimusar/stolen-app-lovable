import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const TestAuth = () => {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setAuthState({
          session: session ? 'Present' : 'None',
          user: session?.user?.email || 'None',
          error: error?.message || 'None'
        });
      } catch (error) {
        setAuthState({
          session: 'Error',
          user: 'Error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
        
        <div className="space-y-2 mb-4">
          <p><strong>Session:</strong> {authState?.session}</p>
          <p><strong>User:</strong> {authState?.user}</p>
          <p><strong>Error:</strong> {authState?.error}</p>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full"
          >
            Go to Login
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
          
          <Button 
            onClick={handleSignOut} 
            variant="destructive"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestAuth;

