import { type CookieOptions, createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createBaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Helpers para crear clientes Supabase tipados con el `Database` generado.
 *
 *   • createSupabaseBrowserClient() — en Client Components.
 *   • createSupabaseServerClient(cookies) — en Server Components / route handlers.
 *   • createSupabaseServiceClient() — server-only, bypassa RLS. Usar con cuidado.
 *
 * Los clientes browser/server inyectan el JWT custom (firmado por @lidxi/db/auth)
 * vía cookie httpOnly que setea el endpoint /api/auth/pin del OMS.
 */

interface CookieStore {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  remove?(name: string, options?: CookieOptions): void;
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
};

export const createSupabaseBrowserClient = () =>
  createBrowserClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );

export const createSupabaseServerClient = (cookies: CookieStore) =>
  createServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: (name, value, options) => cookies.set(name, value, options),
        remove: (name, options) => cookies.remove?.(name, options),
      },
    },
  );

/**
 * Cliente con el service role key. Bypassa RLS. Úsalo SOLO desde código
 * server-only (webhooks, cron jobs, scripts), NUNCA expuesto al navegador.
 *
 * fetch con cache:'no-store': el data cache de Next cachea los GET REST de
 * supabase-js incluso bajo `dynamic = 'force-dynamic'` (verificado empírico:
 * el storefront servía menú stale tras confirmar staging). Datos operativos
 * nunca deben servirse de caché.
 */
export const createSupabaseServiceClient = () =>
  createBaseClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    },
  );
