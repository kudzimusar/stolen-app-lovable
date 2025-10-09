import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role?: string;
}

export type { SupabaseUser };

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export class AuthService {
  static async signUp(email: string, password: string, displayName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: 'member'
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            display_name: displayName || data.user.email?.split('@')[0],
            role: 'member',
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      console.log('🔐 AuthService.signIn: Starting authentication...');
      
      // Add timeout to the entire auth call
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => {
          console.error('🔐 AuthService.signIn: Authentication timeout after 10 seconds');
          reject(new Error('Authentication timeout - please check your connection'));
        }, 10000)
      );
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      console.log('🔐 AuthService.signIn: Auth response received:', { hasData: !!data, hasError: !!error });

      if (error) {
        console.error('🔐 AuthService.signIn: Auth error:', error);
        throw error;
      }

      // Get user profile with timeout
      if (data.user) {
        console.log('🔐 AuthService.signIn: Fetching user profile for', data.user.id);
        
        try {
          // Add timeout to profile fetch
          const profilePromise = supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
          );
          
          const { data: profile, error: profileError } = await Promise.race([
            profilePromise,
            timeoutPromise
          ]) as any;

          console.log('🔐 AuthService.signIn: Profile fetch result:', { hasProfile: !!profile, hasError: !!profileError });

          if (profile && !profileError) {
            data.user = { ...data.user, ...profile };
            console.log('🔐 AuthService.signIn: Profile merged successfully');
          } else if (profileError) {
            console.warn('🔐 AuthService.signIn: Profile fetch error (non-fatal):', profileError);
          }
        } catch (profileError) {
          console.warn('🔐 AuthService.signIn: Profile fetch failed (continuing anyway):', profileError);
          // Continue without profile - it's not critical for login
        }
      }

      console.log('🔐 AuthService.signIn: Sign in completed successfully');
      return { data, error: null };
    } catch (error) {
      console.error('🔐 AuthService.signIn: Unexpected error:', error);
      return { data: null, error };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() to avoid errors when profile doesn't exist

      return (profile && !profileError) ? { ...user, ...profile } : user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async updateProfile(updates: Partial<User>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .maybeSingle(); // Use maybeSingle() to avoid errors

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Get current session
  static async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user ?? null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Listen to auth state changes with event filtering
  static onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Only respond to meaningful events
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        console.log(`🔐 Auth event: ${event}`);
        callback(session?.user ?? null);
      }
    });
  }
}

// Standalone function for getting auth token
export async function getAuthToken(): Promise<string | null> {
  return AuthService.getAuthToken();
}

// Hook for React components

export function useAuth() {
  // Separate state variables to prevent object recreation
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Prevent double initialization
  const initialized = useRef(false);

  useEffect(() => {
    // Guard against double initialization
    if (initialized.current) {
      console.log('⚠️ useAuth already initialized - skipping');
      return;
    }
    initialized.current = true;

    let mounted = true;

    console.log('🔐 Initializing auth...');

    // Get initial session
    AuthService.getCurrentUser()
      .then(currentUser => {
        if (mounted) {
          console.log('✅ Initial auth check complete:', currentUser?.id || 'No user');
          setUser(currentUser);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error('❌ Auth initialization error:', err);
          setError(err);
          setLoading(false);
        }
      });

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((newUser) => {
      if (mounted) {
        console.log('🔄 Auth state changed:', newUser?.id || 'No user');
        setUser(newUser);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty deps - runs once per mount

  // Return stable object reference using PRIMITIVE dependencies only
  return useMemo(() => ({
    user,
    loading,
    error,
    signUp: AuthService.signUp,
    signIn: AuthService.signIn,
    signOut: AuthService.signOut,
    updateProfile: AuthService.updateProfile,
    resetPassword: AuthService.resetPassword,
    getAuthToken: AuthService.getAuthToken
  }), [user?.id, loading, error]); // Only primitive values!
}
