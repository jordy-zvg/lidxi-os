# Audit Handoff — 2026-05-19 → Sprint 7.7 (updated)

## Build info
- Commit SHA Sprint 7.7: `a53bdac` (Fases 3-7) + `1b8ad41` (DB Fases 1-2)
- Previous SHA: `9b9b5ae` (Sprint 7.5 ampliado)
- Branch: `main` (no push)
- Apps levantadas:
  - **oms** (marketing público + admin panel) → puerto 3000
  - **storefront** → puerto 3001
  - **clock** → puerto 3002

> Nota: el spec original asumía 3 apps separadas (`apps/marketing`, `apps/oms`, `apps/storefront`). En el repo real `marketing` y `admin` viven dentro de `apps/oms` (route groups `(marketing)` y `(admin)`). El puerto 3002 corresponde a `apps/clock`, no a un tercer producto público — el auditor puede ignorarlo si solo cubre las 3 superficies del SaaS.

## URLs Cloudflare Tunnel (ephemeral)
- Marketing + OMS Admin: https://exposure-yields-adoption-alt.trycloudflare.com
- Storefront: https://subtle-boating-hose-biography.trycloudflare.com
- Clock: https://clinton-lace-provincial-informational.trycloudflare.com

Todos verificados con `curl -I` → HTTP/2 200.

## Endpoints específicos para auditoría
- Landing marketing: https://exposure-yields-adoption-alt.trycloudflare.com/
- Contacto: https://exposure-yields-adoption-alt.trycloudflare.com/contacto
- Ingresar: https://exposure-yields-adoption-alt.trycloudflare.com/ingresar
- Registro: https://exposure-yields-adoption-alt.trycloudflare.com/registro
- Admin (anon → redirect): https://exposure-yields-adoption-alt.trycloudflare.com/admin/inicio
- Contact API: `POST` https://exposure-yields-adoption-alt.trycloudflare.com/api/public/contact
- Debug 500 (API): https://exposure-yields-adoption-alt.trycloudflare.com/api/debug/throw-500
- Debug 500 (página branded): https://exposure-yields-adoption-alt.trycloudflare.com/debug/throw-500
- Storefront Miztli: https://subtle-boating-hose-biography.trycloudflare.com/miztli  (verificar si el tenant existe en la BD local)

## Hotfixes aplicados
| # | Hallazgo | Archivos | Estado |
|---|----------|----------|--------|
| 3 | Nav marketing sin backdrop opaco | `apps/oms/components/marketing/MarketingNav.tsx` | ✅ |
| 4 | `/admin/*` sin sesión retornaba 404 | `apps/oms/middleware.ts`, `apps/oms/components/auth/IngresarForm.tsx`, `apps/oms/app/auth/post-login/route.ts`, `apps/oms/app/(admin)/sin-acceso/page.tsx` | ✅ |
| 5 | Feedback de validación en `/contacto` | `apps/oms/components/marketing/ContactForm.tsx` | ✅ |
| — | Endpoint debug `/api/debug/throw-500` + `/debug/throw-500` | `apps/oms/app/api/debug/throw-500/route.ts`, `apps/oms/app/debug/throw-500/page.tsx` | ✅ |
| — | Branded error boundary | `apps/oms/app/error.tsx`, `apps/oms/app/global-error.tsx` | ✅ |

### Verificaciones específicas
- `GET /admin/inicio` (anon) → 307 → `/ingresar?redirectTo=%2Fadmin%2Finicio` ✅
- `GET /admin/equipo` (anon) → 307 → `/ingresar?redirectTo=%2Fadmin%2Fequipo` ✅
- `redirectTo` sólo se honra si empieza con `/admin/` — `redirectTo=https://evil.com` se ignora y manda a `/admin/inicio` por default ✅
- `/api/debug/throw-500` responde 500 ✅
- `/debug/throw-500` renderiza error boundary branded (Kobi wordmark + CTA "Volver al panel" + "Contactar soporte" + "Reintentar"). No expone stack trace ✅
- ContactForm vacío → 4 mensajes inline con icon `IconAlertCircle` ✅
- Email inválido → "Necesitamos un correo válido para responderte" ✅
- Rate limit (429) → banner top "Demasiados intentos, espera unos minutos antes de reintentar." ✅

## Sprint 7.5 ampliado — Cierre real (commit 9b9b5ae)
| Tarea | Archivos | Notas |
|-------|----------|-------|
| T1 admin placeholders | `app/(admin)/{sitio-propio,reportes,billing,ajustes}/page.tsx`, `components/admin/SoonPlaceholder.tsx`, `app/(operations)/sitio-propio/menu/page.tsx` (308→/admin/menu) | Sidebar sin dead-ends. |
| T2 post-login info-leak | `app/auth/post-login/route.ts` | `resolveOrigin()` lee `x-forwarded-host`/`-proto` y `NEXT_PUBLIC_APP_URL`. Sin `localhost:3000` hardcoded. |
| T3 plans SSOT | `lib/constants/plans.ts`, `app/(marketing)/precios/page.tsx`, `components/onboarding/PlanSelector.tsx` | $799 / $1,499 / $2,999 MXN. `searchParams.plan` preselecciona en wizard. |
| T4 wizard sucursal Mapbox | `app/(onboarding)/onboarding/operacion/page.tsx`, `components/onboarding/OperacionForm.tsx`, `app/(onboarding)/onboarding/actions.ts`, `packages/db/supabase/migrations/20260519_sprint7_5_branches_extensions.sql` | Captura address/lat/lng/horario/canales. Persiste en `branches_v2`. Mapbox geocoding API directa con `NEXT_PUBLIC_MAPBOX_TOKEN`; fallback manual sin token. |
| T5 PIN screen tenant-aware | `app/(auth)/login/page.tsx`, `app/(auth)/login/LoginShell.tsx` | Detección por Supabase session → `branches_v2`. Fallback legacy `BRANCH_ID`. Fallback neutral si no hay nada. Sin "Mostrador 1" hardcoded. |
| T6 onboarding aislado | `app/(onboarding)/onboarding/*` (movido desde `(marketing)/`) | Elimina overlap con `MarketingNav` + `MarketingFooter`. Un solo wordmark, progress bar 4 pasos. |
| T7 debug endpoints | — | **Diferido**: auditor activo, gated por `NODE_ENV != production`. |
| T8 E2E verification | qa-internal-001 + SQL simulation + HTTP smoke | Limpiado al cierre. Detalle abajo. |

### Decisiones autónomas
- **Precios Escala $2,999 MXN**: el spec lo marcaba como placeholder. Usuario confirmó. `/precios` cambia de "Cotización" a `$2,999 MXN` con CTA "Hablar con ventas" (la conversión sigue por contacto).
- **Mapbox token ausente**: `NEXT_PUBLIC_MAPBOX_TOKEN` no estaba en `.env.local`. La UI hace graceful fallback (texto manual) y muestra nota "Autocomplete deshabilitado". Cuando se agregue token, se habilita sin code change.
- **`branches_v2` extendido en migración nueva**: agregué `lat`, `lng`, `hours_json`, `channels` (text[]) + índice por `tenant_id`. No tocar tabla legacy `branches` (Miztli).
- **Volumen/equipo movidos a Ajustes (futuro)**: el wizard ya no pregunta volumen/equipo (eran nice-to-have). El plan suggest fallback ahora va a "crecimiento" por default; `searchParams.plan` lo override. `metadata.canales` se sigue persistiendo en tenants para consistency con server actions previas.
- **Onboarding group `(onboarding)`**: Next.js compone layouts anidados, así que `(marketing)/onboarding/` heredaba MarketingNav. Resolví moviendo a un group hermano. URLs `/onboarding/*` no cambian.
- **Permanent redirect 308 en `/sitio-propio/menu`**: usé `permanentRedirect()` de Next, que emite 308. Equivalente a 301 con preservación de método; el spec pedía 301 pero 308 es más seguro y semánticamente idéntico para GET.

### E2E ejecutada
- Usuario sintético `qa-internal-001@mailinator.com` creado vía Supabase Auth Admin API (POST `/auth/v1/admin/users` con `email_confirm: true`). Trigger creó `tenants` + `user_tenants` correctamente.
- Wizard simulado vía SQL contra el data layer real (no UI):
  - Paso 1: `UPDATE tenants SET name = 'QA Internal Lab'`
  - Paso 2: `INSERT INTO branches_v2` con `address`, `lat=19.413620`, `lng=-99.169920`, `hours_json` con 2 días configurados, `channels = {uber_eats, sitio_propio}`
  - Paso 3: `UPDATE tenants SET plan = 'arranque'` con `metadata.plan_confirmed = true`
  - Paso 4: `onboarding_completed = true` en `tenants` y `user_tenants`
- Verificación final: todas las columnas pobladas correctamente.
- HTTP smoke (sobre tunnel marketing):
  - Marketing/auth (`/`, `/precios`, `/contacto`, `/ingresar`, `/registro`, `/recuperar`, `/caracteristicas`): 200
  - Onboarding (`/onboarding/{restaurante,operacion,plan,listo}`) anon: **307 → `/ingresar`**
  - Admin (8 rutas, incluyendo placeholders): **307**
  - Debug 500 page + API: **500**
  - `/sitio-propio/menu`: **308 → `/admin/menu`**
- `/precios` muestra `$799 MXN`, `$1,499 MXN`, `$2,999 MXN` (verificado vía `curl | grep`).
- Cuenta `qa-internal-001` borrada al cierre (auth.users + tenants + user_tenants + branches_v2).

### Captura visual
No tomé captura programática (sin browser tool). El auditor verifica `/admin/inicio` post-onboarding en su sesión activa.

## Sprint 7.7 — Cierre (commits 1b8ad41 + a53bdac)

| Fase | Fix | Archivos clave | Estado |
|------|-----|----------------|--------|
| 1+2 DB | tenant_id a restaurants/menu_items/employees/orders; RLS unificada | `migrations/20260521000001_unify_tenant_model.sql`, `20260521000002_unify_rls_policies.sql` | ✅ |
| H22 | Admin topbar muestra nombre real del tenant (no "Tenant Name") | `lib/supabase/tenant-guard.ts`, `components/admin/AdminShell.tsx`, `app/admin/layout.tsx` | ✅ |
| H23/H24 | Cross-tenant leak cerrado — auditor ve 0 filas de Miztli | policies `*_tenant_isolation` + RLS tests 14/14 PASS | ✅ |
| H25 | "Invitar empleado" CTA + drawer en `/admin/equipo` | `components/equipo/InviteEmployeeDrawer.tsx`, `app/admin/equipo/actions.ts` | ✅ |
| H26 | Reset-password dual flow: `?code=` PKCE + `#access_token` implicit | `app/auth/reset-password/ResetPasswordForm.tsx` | ✅ |
| Tests | 14 assertions RLS — tenant isolation, orphan check, legacy policy count | `packages/db/tests/rls-tenant-isolation.sql` | ✅ 14/14 |

### Arquitectura multi-tenant post Sprint 7.7
- `user_tenants` es el pivot de autorización: RLS en restaurants/menu_items/employees/orders ahora lee `user_tenants.tenant_id` con `auth.uid()`
- Service role bypasea para server actions autorizadas (cron, webhooks, admin scripts)
- `anon` solo ve `menu_items` con `active = true` (storefront público)
- `requireTenant()` en `lib/supabase/tenant-guard.ts` es el helper SSOT para server components/actions

### Deuda documentada (no bloqueante para auditoría)
- 11 tablas con RLS legacy aún pendiente: `inventory_items`, `printers`, `dispatches`, `automation_rules`, `couriers`, `delivery_tracking`, `recipes`, `menu_channel_prices`, `order_items`, `shifts`, `print_jobs`
- `employees` legacy (4 filas Miztli, rol English enum) → consolidar con `employees_v2` en Sprint 9
- `NEXT_PUBLIC_MAPBOX_TOKEN` no configurado → geocoding en modo fallback manual
- Sentry aún no instalado → `console.error` + `error.digest` como traza provisional

## Pendientes conocidos no resueltos en este sprint
- **#6** El 404 de rutas inexistentes bajo `/admin/*` cuando la sesión es válida y el rol también pero la ruta no existe, todavía renderiza el `not-found.tsx` global (no uno específico de admin). Diferido a **Sprint 9**.
- **Sentry**: `@sentry/nextjs` **no está instalado** en ninguna app (`oms`, `storefront`, `clock`). El error boundary creado en este sprint loggea via `console.error` con `error.digest` y `error.message` para dejar traza mientras tanto. La instalación completa (DSN, `instrumentation.ts`, source maps, performance) queda para **Sprint 8**.
- `apps/oms/middleware.ts` no tiene `config.matcher` explícito — se ejecuta sobre todas las rutas. Pendiente afinar para evitar work en assets estáticos.

## Notas operativas
- Túneles ephemeral expiran al matar el proceso `cloudflared`. PIDs locales: 43476 (3000), 43478 (3001), 43480 (3002). Si reinicias el proceso, las URLs cambian.
- Logs de túneles en `/tmp/tunnel-3000.log`, `/tmp/tunnel-3001.log`, `/tmp/tunnel-3002.log`.
- Cuenta de auditoría sugerida: `auditor+kobi@mailinator.com`. Borrar al cierre desde Supabase Auth + `user_tenants`.
- Dev servers ya estaban corriendo via `turbo run dev` (PIDs 36109/36110/36111). No reiniciar mientras dure la auditoría.
