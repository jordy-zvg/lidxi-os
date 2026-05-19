# Audit Handoff — 2026-05-19 17:25 CST

## Build info
- Commit SHA: `090bb0faae30618f8333f16d8ac3f49d252e12c4`
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

## Pendientes conocidos no resueltos en este sprint
- **#6** El 404 de rutas inexistentes bajo `/admin/*` cuando la sesión es válida y el rol también pero la ruta no existe, todavía renderiza el `not-found.tsx` global (no uno específico de admin). Diferido a **Sprint 9**.
- **Sentry**: `@sentry/nextjs` **no está instalado** en ninguna app (`oms`, `storefront`, `clock`). El error boundary creado en este sprint loggea via `console.error` con `error.digest` y `error.message` para dejar traza mientras tanto. La instalación completa (DSN, `instrumentation.ts`, source maps, performance) queda para **Sprint 8**.
- `apps/oms/middleware.ts` no tiene `config.matcher` explícito — se ejecuta sobre todas las rutas. Pendiente afinar para evitar work en assets estáticos.

## Notas operativas
- Túneles ephemeral expiran al matar el proceso `cloudflared`. PIDs locales: 43476 (3000), 43478 (3001), 43480 (3002). Si reinicias el proceso, las URLs cambian.
- Logs de túneles en `/tmp/tunnel-3000.log`, `/tmp/tunnel-3001.log`, `/tmp/tunnel-3002.log`.
- Cuenta de auditoría sugerida: `auditor+kobi@mailinator.com`. Borrar al cierre desde Supabase Auth + `user_tenants`.
- Dev servers ya estaban corriendo via `turbo run dev` (PIDs 36109/36110/36111). No reiniciar mientras dure la auditoría.
