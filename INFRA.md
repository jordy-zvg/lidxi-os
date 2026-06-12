# INFRA — Mapa de variables × servicio × entorno (fase Railway-only)

Snapshot Sprint 8 prep. Cada celda muestra **dónde se configura** la variable.
Valores reales viven en `SPRINT8_SECRETS.md` (gitignored) y se inyectan a
Railway como env vars del service correspondiente.

**Fase actual**: MVP/demo hospedado en Railway con URLs nativas (`*.up.railway.app`). El dominio propio (`kobi.mx`) está diferido al demo — ver `SPRINT8_RUNBOOK.md` → sección DIFERIDO.

Convenciones:
- ✅ = la app o el servicio lee la variable
- ⚠️ = secret (NUNCA exponer al cliente, no usar prefijo `NEXT_PUBLIC_`)
- (prod) / (staging) sufijos indican el entorno; cada uno tiene su propia copia

---

## Política de URLs (cableada en código)

| Patrón | Quién la usa | Notas |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Cada app, **para apuntar a sí misma** | En OMS → URL de Railway del OMS. En storefront → URL de Railway del storefront. |
| `NEXT_PUBLIC_OMS_URL` | Storefront, para cross-app | Apunta a la URL del OMS (webhook target). |
| `NEXT_PUBLIC_STOREFRONT_URL` | OMS, para cross-app | Apunta a la URL del storefront (tracking links, etc.). |
| `x-forwarded-host` / `req.url` | Server actions / middleware en runtime | Fallback robusto vía headers cuando la env no aplica. |

**Promesa migratoria**: migrar de `*.up.railway.app` → `kobi.mx` después = cambiar estas 3 vars en Railway, sin tocar código.

---

## Matriz por servicio

### Supabase

| Variable | OMS | Storefront | Clock | Notas |
|---|:-:|:-:|:-:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` ⚠️ | ✅ | ✅ | — | Solo server-side. Bypassea RLS |
| `JWT_SECRET` ⚠️ | ✅ | ✅ | ✅ | Mismo valor que el JWT secret de Supabase; firma JWTs de empleados |

En Railway: cada service tiene su propia copia (prod usa `*_PROD`, staging usa `*_STAGING`).

### Mercado Pago

| Variable | OMS | Storefront | Notas |
|---|:-:|:-:|---|
| `MP_MODE` | ✅ | ✅ | Entorno por **deploy**: `mock`\|`sandbox`\|`production`. Decide qué tokens usa el seam (`sandbox`→`_TEST`, `production`→`_PROD`). Reemplazó al toggle `tenants.payment_mode`. |
| `MERCADO_PAGO_ACCESS_TOKEN_PROD` ⚠️ | ✅ | ✅ | Resuelto por el seam `getCollectorCredentials` (no por tenant). **OMS lo necesita** para el `payment.get` del webhook; Storefront para crear la preference. |
| `MERCADO_PAGO_ACCESS_TOKEN_TEST` ⚠️ | ✅ | ✅ | Igual, cuando `MP_MODE=sandbox`. **OMS también lo requiere.** |
| `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_PROD` | — | ✅ | Reservada para Bricks/Checkout API futuro; Checkout Pro por redirect no la usa. |
| `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY_TEST` | — | ✅ | Igual, sandbox. |
| `MERCADO_PAGO_WEBHOOK_SECRET` ⚠️ | ✅ | — | Firma oficial del webhook (`x-signature`: `ts=..,v1=..`). |

### Anthropic (visión — importador de menú por fotos)

| Variable | OMS | Storefront | Notas |
|---|:-:|:-:|---|
| `ANTHROPIC_API_KEY` ⚠️ | ✅ | — | Extracción de menú desde fotos. SOLO server-side; requerida en producción (validate-env). |
| `MENU_VISION_MODEL` | ✅ | — | Opcional. Default `claude-opus-4-8`; bajar a `claude-sonnet-4-6`/`claude-haiku-4-5` si la calidad aguanta. |

### Resend

| Variable | OMS | Storefront | Clock | Notas |
|---|:-:|:-:|:-:|---|
| `RESEND_API_KEY` ⚠️ | ✅ | — | — | Envío de correo transaccional |
| `RESEND_FROM_EMAIL` | ✅ | — | — | Ruta A: `onboarding@resend.dev` · Ruta B: `noreply@kobi.mx` |

DKIM/SPF/DMARC: **solo Ruta B** requiere DNS en Cloudflare → zona `kobi.mx`. En Ruta A no se necesita DNS.

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

### Railway (no se inyecta en runtime; uso operativo)

| Variable | Donde se usa | Notas |
|---|---|---|
| `RAILWAY_TOKEN` ⚠️ | CLI/CI | Deploy y env vars |
| `RAILWAY_PROJECT_ID` | CLI/CI | Project del monorepo |
| `RAILWAY_SERVICE_ID_OMS` | CLI/CI | Service oms |
| `RAILWAY_SERVICE_ID_STOREFRONT` | CLI/CI | Service storefront |
| `RAILWAY_OMS_URL` | docs/op | `https://<oms>.up.railway.app` |
| `RAILWAY_STOREFRONT_URL` | docs/op | `https://<storefront>.up.railway.app` |

### URLs públicas (en runtime, set en Railway env vars de cada service)

| Variable | OMS service | Storefront service | Valor (fase Railway) |
|---|:-:|:-:|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | Cada service apunta a su propia `*.up.railway.app` |
| `NEXT_PUBLIC_OMS_URL` | ✅ | ✅ | `RAILWAY_OMS_URL` |
| `NEXT_PUBLIC_STOREFRONT_URL` | ✅ | ✅ | `RAILWAY_STOREFRONT_URL` |
| `NEXT_PUBLIC_CLOCK_URL` | ✅ | — | (si se despliega clock) |

---

## Servicios y endpoints externos (configurados a mano fuera de Railway)

| Servicio | Configuración manual |
|---|---|
| Mercado Pago | Webhook URL: `${RAILWAY_OMS_URL}/api/webhooks/mercado-pago`, eventos `payment.created`, `payment.updated` + firma secreta |
| Resend (Ruta A) | Sender `onboarding@resend.dev` — nada que configurar |
| Resend (Ruta B) | Dominio `kobi.mx` verificado en Resend (3 DNS records en Cloudflare aunque el hosting siga en Railway) |
| Supabase | Site URL: `RAILWAY_OMS_URL`. Redirect URLs: `${RAILWAY_OMS_URL}/**`, `${RAILWAY_STOREFRONT_URL}/**` |
| Sentry | 2 proyectos (kobi-oms, kobi-storefront) con sourcemaps habilitados |

---

## Diferencias prod vs staging

| Servicio | Diferencia |
|---|---|
| Supabase | Proyectos separados (`*_PROD` vs `*_STAGING`). Schemas idénticos, data sintética en staging. |
| Mercado Pago | Mismas credenciales; el entorno lo fija `MP_MODE` por deploy (staging → `sandbox`). |
| Resend | Mismo dominio (o `resend.dev` si Ruta A) pero el `from` opcionalmente puede diferir entre prod y staging. |
| Sentry | Misma org, environments separados (`production` vs `staging`) en el mismo proyecto. |
| Mapbox | Mismo token. |
| Railway | Services duplicados (`oms-prod`, `oms-staging`, `storefront-prod`, `storefront-staging`). |

---

## Migración futura a `kobi.mx` (diferida, ver SPRINT8_RUNBOOK.md)

Cuando llegue el demo:
1. Activar custom domains en Railway por service.
2. Configurar Cloudflare DNS (CNAME por subdominio).
3. Cambiar `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_OMS_URL`, `NEXT_PUBLIC_STOREFRONT_URL` en Railway de `*.up.railway.app` → `https://www.kobi.mx`, `https://app.kobi.mx`, `https://tienda.kobi.mx`.
4. Si email en Ruta A → migrar a Ruta B (verificar dominio en Resend).
5. Reconfigurar webhook URL en Mercado Pago panel.
6. Actualizar Site URL + Redirect URLs en Supabase.

Cero refactor de código requerido por la disciplina de env vars (Sprint 8 prep Tarea 1).
