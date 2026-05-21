import { headers } from 'next/headers';

/**
 * Resuelve el origin público del request entrante para construir URLs de
 * redirect (emails de Supabase, OAuth callbacks, reset password).
 *
 * Por qué NO usar `process.env.NEXT_PUBLIC_APP_URL` directo:
 *   Next.js inlinea las `NEXT_PUBLIC_*` en build-time dentro del bundle del
 *   servidor cuando aparecen como `process.env.NEXT_PUBLIC_FOO` literal. Si
 *   el build se hace sin la env var (o con cache stale), queda inlineado el
 *   fallback `'http://localhost:3000'` — que es exactamente el bug que vimos
 *   en producción de Railway.
 *
 * Solución: derivar de los headers del request entrante, que reflejan el host
 * real desde el que llega la petición (localhost, *.up.railway.app, kobi.mx).
 *
 * Prioridad:
 *   1. `x-forwarded-host` + `x-forwarded-proto` (Railway, Vercel, Cloudflare)
 *   2. `host` header
 *   3. `NEXT_PUBLIC_APP_URL` (fallback build-time, último recurso)
 *   4. `http://localhost:3000` (fallback dev local)
 *
 * Solo llamar desde contexto que tenga acceso a headers (server actions,
 * route handlers, server components). NO usar en client components.
 */
export function resolveRequestOrigin(): string {
  const h = headers();
  const forwardedHost = h.get('x-forwarded-host');
  const forwardedProto = h.get('x-forwarded-proto');
  const host = forwardedHost ?? h.get('host');

  if (host) {
    const proto = forwardedProto ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }

  // Si por algún motivo no hay header (cron job, RSC sin request), fallback a env.
  const envOverride = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (envOverride && /^https?:\/\//.test(envOverride)) return envOverride;

  return 'http://localhost:3000';
}
