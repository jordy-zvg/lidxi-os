# INFRA — Mapa de variables × servicio × entorno

Snapshot Sprint 8 prep. Cada celda muestra **dónde se configura** la variable.
Valores reales viven en `SPRINT8_SECRETS.md` (gitignored) y se inyectan a
Railway como env vars del service correspondiente.

Convenciones:
- ✅ = la app o el servicio lee la variable
- ⚠️ = secret (NUNCA exponer al cliente, no usar prefijo `NEXT_PUBLIC_`)
- (prod) / (staging) sufijos indican el entorno; cada uno tiene su propia copia

---

## Matriz por servicio

### Supabase

| Variable | OMS | Storefront | Clock | Notas |
|---|:-:|:-:|:-:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` ⚠️ | ✅ | ✅ | — | Solo server-side. Bypassea RLS |
| `JWT_SECRET` ⚠️ | ✅ | ✅ | ✅ | Mismo valor que el JWT secret de Supabase; firma los JWTs de empleados |

En Railway: cada service tiene su propia copia (prod usa `*_PROD`, staging usa `*_STAGING`).

### Mercado Pago

| Variable | OMS | Storefront | Notas |
|---|:-:|:-:|---|
| `MERCADO_PAGO_ACCESS_TOKEN_PROD` ⚠️ | — | ✅ | Usado por `create-preference` cuando `tenants.payment_mode='production'` |
| `MERCADO_PAGO_ACCESS_TOKEN_TEST` ⚠️ | — | ✅ | Usado cuando `tenants.payment_mode='test'` (default) |
| `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_PROD` | — | ✅ | Cliente del checkout |
| `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST` | — | ✅ | Cliente del checkout sandbox |
| `MERCADO_PAGO_WEBHOOK_SECRET` ⚠️ | ✅ | — | HMAC verify del webhook |

### Resend

| Variable | OMS | Storefront | Clock | Notas |
|---|:-:|:-:|:-:|---|
| `RESEND_API_KEY` ⚠️ | ✅ | — | — | Envío de correo transaccional |
| `RESEND_FROM_EMAIL` | ✅ | — | — | `hola@kobi.mx` (verificado en Resend) |

DKIM/SPF/DMARC en Cloudflare → zona kobi.mx.

### Sentry

| Variable | OMS | Storefront | Clock | Notas |
|---|:-:|:-:|:-:|---|
| `NEXT_PUBLIC_SENTRY_DSN_OMS` | ✅ | — | — | DSN del proyecto kobi-oms |
| `NEXT_PUBLIC_SENTRY_DSN_STOREFRONT` | — | ✅ | — | DSN del proyecto kobi-storefront |
| `SENTRY_AUTH_TOKEN` ⚠️ | build | build | build | Subida de source maps en build |
| `SENTRY_ORG` | build | build | build | Organization slug |
| `SENTRY_PROJECT_OMS` | build | — | — | Slug del proyecto |
| `SENTRY_PROJECT_STOREFRONT` | — | build | — | Slug del proyecto |

### Mapbox

| Variable | OMS | Storefront | Notas |
|---|:-:|:-:|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | ✅ | Wizard (geocoder) + tracking storefront |

### Cloudflare (no se inyecta en runtime; uso operativo)

| Variable | Donde se usa | Notas |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | CLI/script | DNS automation |
| `CLOUDFLARE_API_TOKEN` ⚠️ | CLI/script | Zone:DNS:Edit en kobi.mx |
| `CLOUDFLARE_ZONE_ID` | CLI/script | Zona kobi.mx |

### Railway (no se inyecta en runtime; uso operativo)

| Variable | Donde se usa | Notas |
|---|---|---|
| `RAILWAY_TOKEN` ⚠️ | CLI/CI | Deploy y env vars |
| `RAILWAY_PROJECT_ID` | CLI/CI | Project del monorepo |
| `RAILWAY_SERVICE_ID_OMS` | CLI/CI | Service oms |
| `RAILWAY_SERVICE_ID_STOREFRONT` | CLI/CI | Service storefront |

### URLs públicas

| Variable | OMS | Storefront | Clock | Valor prod |
|---|:-:|:-:|:-:|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | ✅ | `https://kobi.mx` |
| `NEXT_PUBLIC_OMS_URL` | ✅ | ✅ | ✅ | `https://kobi.mx` |
| `NEXT_PUBLIC_STOREFRONT_URL` | ✅ | ✅ | — | `https://pedidos.kobi.mx` (o subdomain por tenant) |
| `NEXT_PUBLIC_CLOCK_URL` | ✅ | — | ✅ | `https://reloj.kobi.mx` |

---

## Servicios y endpoints externos (configurados a mano fuera de Railway)

| Servicio | Configuración manual |
|---|---|
| Cloudflare DNS | A/CNAME records para subdominios + 3 registros DKIM/SPF/DMARC de Resend |
| Mercado Pago | Webhook URL: `https://kobi.mx/api/webhooks/mercado-pago`, eventos `payment.created`, `payment.updated` + firma secreta |
| Resend | Dominio kobi.mx verificado, sender `hola@kobi.mx` aprobado |
| Supabase | Site URL: `https://kobi.mx`, Redirect URLs: `https://kobi.mx/**`, `https://pedidos.kobi.mx/**` |
| Sentry | 2 proyectos (kobi-oms, kobi-storefront) con sourcemaps habilitados |

---

## Diferencias prod vs staging

| Servicio | Diferencia |
|---|---|
| Supabase | Proyectos separados (`*_PROD` vs `*_STAGING`). Schemas idénticos, data sintética en staging. |
| Mercado Pago | Mismas credenciales pero `tenants.payment_mode` se setea por entorno (staging siempre `'test'`). |
| Resend | Mismo dominio pero subdomain `staging.kobi.mx` requiere su propia verificación. |
| Sentry | Misma org, environments separados (`production` vs `staging`) en el mismo proyecto. |
| Mapbox | Mismo token (no requiere scoping por entorno en el plan free). |
| Cloudflare | Misma zona, subdomain dedicado para staging. |
