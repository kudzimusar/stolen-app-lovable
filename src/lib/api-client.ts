import { supabase } from "@/integrations/supabase/client";

/**
 * Standardized API Client for calling Supabase Edge Functions.
 * Replaces direct fetch calls to /api/v1/... to ensure production compatibility.
 */
export const apiClient = {
  /**
   * Invoke a Supabase Edge Function
   * @param functionName The name of the function (e.g., 'law-enforcement-access')
   * @param body The JSON body to send
   * @param options Additional options (headers, etc.)
   */
  async invoke<T = any>(functionName: string, body?: any, options?: any): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        ...options,
      });

      if (error) {
        console.error(`API Call Failed [${functionName}]:`, error);
        return { data: null, error };
      }

      return { data: data as T, error: null };
    } catch (err) {
      console.error(`Unexpected API Error [${functionName}]:`, err);
      return { data: null, error: err };
    }
  },

  /**
   * Legacy wrapper to ease migration from fetch('/api/v1/...')
   * Maps /api/v1/some-path to function 'some-path' (simplified)
   */
  async get<T = any>(endpoint: string): Promise<T> {
    // Extract function name from endpoint
    // e.g. /api/v1/lost-found/reports -> lost-found-reports
    const cleanPath = endpoint.replace('/api/v1/', '');
    const functionName = cleanPath.split('/')[0]; // simple heuristic

    // This is a naive implementation for migration.
    // Prefer using invoke() directly.
    console.warn(`Using legacy API wrapper for ${endpoint}. Please migrate to apiClient.invoke('${functionName}')`);

    const { data, error } = await this.invoke<T>(functionName, {}, { method: 'GET' });
    if (error) throw error;
    return data as T;
  },

  async post<T = any>(endpoint: string, body: any): Promise<T> {
    const cleanPath = endpoint.replace('/api/v1/', '');
    const functionName = cleanPath.split('/')[0];

    const { data, error } = await this.invoke<T>(functionName, body, { method: 'POST' });
    if (error) throw error;
    return data as T;
  }
};
