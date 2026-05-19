import { createBrowserClient } from '@supabase/ssr';

// Client for browser/client-component use (tenant auth only)
export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
