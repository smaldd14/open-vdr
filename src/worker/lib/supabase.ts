import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

/**
 * Create a Supabase client with service role key.
 * 
 * WARNING: This client has elevated privileges and bypasses RLS.
 * Only use for backend operations. Never expose to frontend.
 * 
 * Creates a fresh client per call - optimized for Cloudflare Workers
 * where we cannot persist connections across requests.
 */
export function createServiceRoleClient(env: {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
}): SupabaseClient<Database> {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
