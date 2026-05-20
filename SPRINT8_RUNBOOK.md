# Sprint 8 — Runbook de ejecución

Lista de pasos exactos para mañana. Pega este runbook a Claude Code junto con el brief de Sprint 8.

---

## Antes de arrancar

- [ ] **Crear las 6 cuentas externas** (1-2h, jordy solo, sin Claude):
  - Cloudflare → zona `kobi.mx`
  - Supabase prod (proyecto nuevo)
  - Supabase staging (proyecto nuevo)
  - Resend
  - Mercado Pago (verificar cuenta de negocio aprobada)
  - Sentry (2 proyectos: kobi-oms, kobi-storefront)
  - Mapbox (token público)
  - Railway (proyecto + 2 services oms/storefront)
- [ ] **Copiar plantilla**: `cp SPRINT8_SECRETS.md.example SPRINT8_SECRETS.md` y llenar TODOS los slots
- [ ] **Validar credenciales**: `pnpm check:env` → debe pasar verde
- [ ] **Build local verde**: `pnpm type-check && pnpm build`
- [ ] **Última verificación local** del mock de pagos:
  - `supabase status` → corriendo
  - `pnpm --filter oms dev` → corriendo
  - `pnpm mock:mercado-pago <orderId>` → HTTP 200 + row en `payment_events`

---

## Fase 0 — Pre-flight

1. `pnpm check:env` → verde
2. `pnpm type-check` → verde
3. `pnpm build` → verde
4. Verificar último commit limpio: `git status` (no working tree dirty)

## Fase 0.5 — Tests aislamiento en local

5. Crear 2 tenants sintéticos (`tenant-A`, `tenant-B`) y verificar:
   - Tenant A NO ve menu_items / orders / payment_events de tenant B (RLS)
   - Service role SÍ ve ambos (webhook handler)

## Fase 1 — Cloudflare DNS + Supabase prod/staging

6. Cloudflare: añadir A records `kobi.mx` y `*.kobi.mx` → IPs de Railway
7. Cloudflare: añadir 3 DNS de Resend para DKIM/SPF/DMARC
8. Crear proyectos Supabase prod + staging (si no se hizo en pre-flight)
9. Configurar Site URL y Redirect URLs en ambos proyectos
10. Aplicar migrations (ver `MIGRATIONS.md`):
    - staging primero (con backup)
    - prod después (con backup obligatorio)

## Fase 2 — Resend

11. Verificar dominio `kobi.mx` en `resend.com/domains`
12. Crear sender `hola@kobi.mx`
13. Smoke test: envío de correo de prueba a `jordyvargasgomez@gmail.com`

## Fase 3 — Mercado Pago

14. Configurar webhook URL: `https://kobi.mx/api/webhooks/mercado-pago`
15. Activar firma secreta y guardarla en `SPRINT8_SECRETS.md`
16. Smoke test contra staging: preference de prueba + simular webhook con cURL

## Fase 4 — Sentry

17. Verificar que los 2 proyectos reciben eventos de staging
18. Configurar sourcemap upload en CI

## Fase 5 — Railway deploy

19. Conectar repo a Railway (si no estaba ya)
20. Configurar env vars en cada service (copia de `SPRINT8_SECRETS.md`)
21. Deploy staging primero
22. Smoke test staging:
    - `curl https://staging.kobi.mx/api/health` → 200
    - Login con cuenta de prueba → wizard → admin
    - Crear orden de prueba → preference MP → webhook → orders.payment_status='paid'
23. Deploy prod (solo si staging verde)
24. Smoke test prod:
    - `curl https://kobi.mx/api/health` → 200
    - Sentry sin errores nuevos en 5 min

## Fase 6 — Onboarding Miztli en prod

25. Crear cuenta admin para Miztli en prod
26. Completar wizard de onboarding (renombrar placeholder)
27. Importar menú legacy (script de migración o manual)
28. Activar `payment_mode='production'` desde admin → integraciones → pagos
29. Pago de prueba real (orden de demostración con un peso, después reembolsar)
30. Validar webhook MP llegando a prod

---

## Lo que YA está listo (hecho en preparación, no rehacer)

Verificado y commiteado en local antes del Sprint 8:

- ✅ Migrations `payment_events` + `tenants.payment_mode` (idempotentes, validadas con re-run en local)
- ✅ Código Mercado Pago: `create-preference` endpoint (storefront), webhook handler con HMAC + audit log (oms), toggle UI (admin/integraciones/pagos), validado con `pnpm mock:mercado-pago`
- ✅ Health endpoints: `oms/api/health` y `storefront/api/health` (respondiendo 200 en local)
- ✅ Refactor contact a `service-role` (`runtime='nodejs'`, insert validado en local)
- ✅ Middleware `getSession` → `getUser` (valida JWT contra Supabase server)
- ✅ Scripts: `pnpm check:env`, `pnpm mock:mercado-pago`, `pnpm db:backup`
- ✅ Documentación: `INFRA.md`, `MIGRATIONS.md`, `SPRINT8_SECRETS.md.example`, este runbook

---

## Rollback rápido

Si algo en prod sale mal:

- **DB corrupta tras migration**: restaurar último backup pre-migration (ver `MIGRATIONS.md > Restore desde backup`).
- **Pagos rompiendo órdenes**: toggle `tenants.payment_mode='test'` para Miztli → órdenes nuevas en sandbox; payments_events sigue logueando los webhooks legacy para audit.
- **Deploy roto**: Railway → service → rollback al deploy anterior (UI o `railway rollback`).
- **DNS apuntando mal**: Cloudflare → temporalmente apuntar a página estática de mantenimiento.

---

## Criterios de cierre Sprint 8 real

1. `https://kobi.mx` resuelve, SSL válido, sitio público responde.
2. Admin de Miztli puede loguearse y ver su dashboard.
3. Orden de prueba paga completa el ciclo: preference → checkout MP → webhook → `orders.payment_status='paid'` → `payment_events` con `derived_status='paid'`.
4. Sentry no muestra errores no-triagiados en últimas 24h.
5. Backup automático de prod corriendo (cron diario).
