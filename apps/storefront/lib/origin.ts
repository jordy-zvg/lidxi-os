import { headers } from 'next/headers';

/**
 * Resuelve el origin público del storefront para construir URLs absolutas
 * (back_urls de Mercado Pago, init_point del mock de pago, etc.).
 *
 * Por qué NO usar `process.env.NEXT_PUBLIC_STOREFRONT_URL` directo:
 *   Next.js inlinea las `NEXT_PUBLIC_*` en build-time. Si el build se hace
 *   sin la env var (caso típico del primer despliegue en Railway con env vars
 *   pendientes), queda el fallback `localhost` inlineado y el back_url envía
 *   al cliente a una URL inalcanzable.
 *
 * Por qué NO usar `new URL(request.url).origin`:
 *   Detrás del proxy de Railway, `request.url` puede reflejar el host
 *   interno del contenedor. `x-forwarded-host` refleja el host público real.
 *
 * Prioridad:
 *   1. `x-forwarded-host` + `x-forwarded-proto` (Railway, Cloudflare)
 *   2. `host` header
 *   3. `NEXT_PUBLIC_STOREFRONT_URL` o `NEXT_PUBLIC_APP_URL`
 *   4. `http://localhost:3001` (fallback dev)
 *
 * Este es el espejo del helper en `apps/oms/lib/supabase/origin.ts`. Cuando
 * extraigamos un `@kobi/runtime` package compartido, ambos viven ahí.
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
 * Para usar en server actions y server components. Lee `headers()` de
 * `next/headers` (solo disponible en contexto de request).
 */
export function resolveStorefrontOrigin(): string {
  const envOverride = (
    process.env.NEXT_PUBLIC_STOREFRONT_URL ?? process.env.NEXT_PUBLIC_APP_URL
  )?.replace(/\/$/, '');
  const fallback =
    envOverride && /^https?:\/\//.test(envOverride) ? envOverride : 'http://localhost:3001';
  return buildOrigin(headers(), fallback);
}

/**
 * Resuelve la URL base del OMS para llamadas inter-servicio (webhook MP mock).
 * No se puede derivar de `headers()` porque el OMS es otro servicio en otro
 * dominio — necesariamente viene de env var. Si falta en producción, lanza
 * un error explícito en lugar de apuntar silenciosamente a localhost.
 */
export function resolveOmsBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_OMS_URL?.replace(/\/$/, '');
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_OMS_URL es requerida en producción para el webhook de Mercado Pago. ' +
        'Configúrala en las variables del servicio storefront (Railway).',
    );
  }
  return 'http://localhost:3000';
}
