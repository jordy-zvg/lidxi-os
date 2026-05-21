import { headers } from 'next/headers';

/**
 * Resuelve el origin público del request entrante para construir URLs de
 * redirect (emails de Supabase, OAuth callbacks, reset password, callbacks
 * de confirmación).
 *
 * Por qué NO usar `process.env.NEXT_PUBLIC_APP_URL` directo:
 *   Next.js inlinea las `NEXT_PUBLIC_*` en build-time dentro del bundle del
 *   servidor cuando aparecen como `process.env.NEXT_PUBLIC_FOO` literal. Si
 *   el build se hace sin la env var (o con cache stale), queda inlineado el
 *   fallback `'http://localhost:3000'` — el bug visto en Railway.
 *
 * Por qué NO usar `new URL(request.url).origin` directo:
 *   Detrás de un proxy (Railway, Cloudflare), `request.url` puede reflejar
 *   el host interno del contenedor (`localhost:3000`) en lugar del host
 *   público. Hay que mirar `x-forwarded-host` primero.
 *
 * Solución: derivar de los headers del request entrante, que reflejan el host
 * real desde el que llega la petición (localhost en dev, *.up.railway.app en
 * Railway, kobi.mx después de custom domain).
 *
 * Prioridad (idéntica en ambas variantes):
 *   1. `x-forwarded-host` + `x-forwarded-proto` (Railway, Vercel, Cloudflare)
 *   2. `host` header
 *   3. `new URL(request.url).origin` (route handler) o `NEXT_PUBLIC_APP_URL` (server action)
 *   4. `http://localhost:3000` (fallback dev local)
 */

type HeaderGetter = { get(name: string): string | null };

function buildOrigin(h: HeaderGetter, fallback: string): string {
  const forwardedHost = h.get('x-forwarded-host');
  const forwardedProto = h.get('x-forwarded-proto');
  const host = forwardedHost ?? h.get('host');
  if (host) {
    const proto = forwardedProto ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return fallback;
}

/**
 * Para usar en server actions y server components — accede a headers() de
 * next/headers. NO usar en client components ni en route handlers (usar
 * `resolveOriginFromRequest` en ese caso).
 */
export function resolveRequestOrigin(): string {
  // Si por algún motivo no hay header (cron job, RSC sin request), fallback a env.
  const envOverride = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  const envFallback =
    envOverride && /^https?:\/\//.test(envOverride) ? envOverride : 'http://localhost:3000';
  return buildOrigin(headers(), envFallback);
}

/**
 * Para usar en route handlers (`route.ts`) que reciben el `Request` directo.
 * Más confiable que `resolveRequestOrigin()` cuando hay acceso al request,
 * porque no depende de la API de `headers()` (que a veces requiere contextos
 * específicos).
 */
export function resolveOriginFromRequest(request: Request): string {
  return buildOrigin(request.headers, new URL(request.url).origin);
}
