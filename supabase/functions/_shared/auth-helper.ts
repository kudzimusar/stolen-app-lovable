import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface AuthenticatedContext {
  supabaseClient: any;
  user: any;
  token: string;
}

/**
 * Creates an authenticated Supabase client with user context
 * This ensures RLS policies work correctly
 */
export function createAuthenticatedClient(token: string): any {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}

/**
 * Authenticates a request and returns user context
 * Use this in all edge functions for consistent authentication
 */
export async function authenticateRequest(req: Request): Promise<AuthenticatedContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Authorization header required");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseClient = createAuthenticatedClient(token);

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  return {
    supabaseClient,
    user,
    token
  };
}

/**
 * Creates a service client for admin operations
 * Use sparingly and only when you need to bypass RLS
 */
export function createServiceClient(): any {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
