# Sprint 8 — Runbook de ejecución (Railway-only)

Lista de pasos exactos para mañana. **Fase actual**: deploy a Railway con URLs nativas (`*.up.railway.app`). El dominio propio `kobi.mx` queda diferido al demo (sección DIFERIDO abajo).

---

## Antes de arrancar

- [ ] **Crear cuentas externas** (1-2h, jordy solo, sin Claude):
  - Railway (plan Hobby, requiere pago)
  - Supabase prod (proyecto nuevo)
  - Supabase staging (proyecto nuevo)
  - Resend
  - Mercado Pago (verificar cuenta de negocio aprobada)
  - Sentry (2 proyectos: kobi-oms, kobi-storefront)
  - Mapbox (token público)
- [ ] **Copiar plantilla**: `cp SPRINT8_SECRETS.md.example SPRINT8_SECRETS.md` y llenar TODOS los slots
- [ ] **DECIDIR ruta de email** (afecta `RESEND_FROM_EMAIL`):
  - **Ruta A (rápida demo)**: `RESEND_FROM_EMAIL=onboarding@resend.dev` — emails desde dominio Resend, cero DNS, cero Cloudflare. Buena para validar end-to-end rápido.
  - **Ruta B (pro)**: verificar `kobi.mx` en Resend → agregar 3 DNS records (SPF + DKIM + DMARC) en Cloudflare. Aunque el hosting siga en Railway, esto requiere tener el dominio comprado y zona DNS apuntando a Cloudflare. Emails desde `noreply@kobi.mx`.
  - **Nota**: el link de confirmación en el email apunta a `NEXT_PUBLIC_APP_URL` (Railway URL), independiente del remitente.
- [ ] **Validar credenciales**: `pnpm check:env` → debe pasar verde
- [ ] **Build local verde**: `pnpm type-check && pnpm build`
- [ ] **Última verificación local** del mock de pagos:
  - `supabase status` → corriendo
  - `pnpm --filter oms dev` → corriendo
  - `pnpm run mock:mercado-pago <orderId>` → HTTP 200 + row en `payment_events`

---

## Ejecución — fase Railway-only

Pegar el prompt del Sprint 8 real a Claude Code junto con este runbook.

### Fase 0 — Pre-flight

1. `pnpm check:env` → verde
2. `pnpm type-check` → verde
3. `pnpm build` → verde
4. `git status` clean (sin working tree dirty)
5. Confirmar las 6 cuentas creadas y accesibles

### Fase 0.5 — Tests de aislamiento en local

6. Crear 2 tenants sintéticos (`tenant-A`, `tenant-B`) y verificar:
   - Tenant A no ve `menu_items` / `orders` / `payment_events` de B (RLS).
   - Service role sí ve ambos (webhook handler).

### Fase 1 — Supabase prod + staging

7. Crear proyectos prod y staging (si no se hizo en pre-flight).
8. Para cada proyecto: configurar Site URL = `RAILWAY_OMS_URL` y Redirect URLs `${RAILWAY_OMS_URL}/**`, `${RAILWAY_STOREFRONT_URL}/**`.
9. Aplicar migrations a staging (con backup): `pnpm db:backup staging` → `supabase db push`.
10. Aplicar migrations a prod (con backup obligatorio): `pnpm db:backup prod` → `supabase db push`.

### Fase 2 — Resend + SMTP

11. Crear API key.
12. **Ruta A**: usar `onboarding@resend.dev` como `from` — listo. Smoke test: enviar 1 correo de prueba.
13. **Ruta B**: añadir dominio `kobi.mx` en Resend → copiar 3 DNS records → pegarlos en Cloudflare DNS de la zona `kobi.mx` (esto requiere tener el dominio en Cloudflare; si no, posponer a Ruta A). Esperar verificación (~2 min). Smoke test.
14. (Opcional) Configurar Supabase para usar Resend como SMTP custom (auth emails como confirmación de cuenta).

### Fase 3 — Railway: 4 servicios con URLs nativas

15. Crear proyecto Railway.
16. Conectar el repo Git al proyecto.
17. Crear 4 services con su build path:
    - `oms-prod`: build path `apps/oms`
    - `oms-staging`: build path `apps/oms`
    - `storefront-prod`: build path `apps/storefront`
    - `storefront-staging`: build path `apps/storefront`
18. Para cada service, configurar env vars desde `SPRINT8_SECRETS.md` correspondientes a su entorno.
19. **Importante**: en cada service set:
    - `NEXT_PUBLIC_APP_URL` = su propia `*.up.railway.app`
    - `NEXT_PUBLIC_OMS_URL` = `RAILWAY_OMS_URL`
    - `NEXT_PUBLIC_STOREFRONT_URL` = `RAILWAY_STOREFRONT_URL`
20. Deploy staging primero (4 services en staging).
21. Smoke test staging:
    - `curl ${RAILWAY_STAGING_OMS_URL}/api/health` → 200
    - Login con cuenta de prueba → wizard → admin.
    - Crear orden de prueba → preference MP → webhook → `orders.payment_method='mercado_pago'`.
22. Deploy prod (solo si staging verde).
23. Smoke test prod análogo.

### Fase 4 — Sentry + middleware getUser

24. Verificar que los 2 proyectos Sentry reciben eventos de staging (provocar un error sintético).
25. Configurar sourcemap upload en build (Sentry CLI o webpack plugin).
26. **Verificar middleware getUser** en Railway: una sesión válida pasa, un token manipulado en cookie redirige a `/ingresar`. Ya validado en local (ver Sprint 8 prep), pero confirmar en runtime real.

### Fase 5 — Mercado Pago

27. Configurar webhook URL en MP panel: `${RAILWAY_OMS_URL}/api/webhooks/mercado-pago`.
28. Activar firma secreta → set `MERCADO_PAGO_WEBHOOK_SECRET` en Railway env vars (oms-prod).
29. Smoke test contra staging: preference de prueba + simular webhook con cURL.

### Fase 6 — Tenant sintético "Kobi Test Kitchen" en prod (M1-M4)

30. Crear cuenta admin sintética en prod (`kobi-test-kitchen@mailinator.com`).
31. Completar wizard de onboarding contra el placeholder.
32. Activar `payment_mode='production'` desde admin → integraciones → pagos.
33. Pago real de $5 MXN de demostración → reembolsar después.
34. Validar webhook llegando a prod, `orders.payment_status='paid'`, `payment_events` con `signature_valid=true`.

### Fase 7 — Miztli (solo si Fase 6 verde)

35. Crear cuenta admin Miztli en prod.
36. Completar wizard renombrando placeholder a "Miztli Pardo".
37. Importar menú legacy (script o manual).
38. Activar `payment_mode='production'`.
39. Validación cliente real (Jordy).

---

## Lo que YA está listo (hecho en preparación, commit 53b4270 + actual)

- ✅ **Hostnames sin hardcodear** — auditados y migrados a env vars (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_OMS_URL`, `NEXT_PUBLIC_STOREFRONT_URL`). Migrar a `kobi.mx` después = cambiar 3 vars en Railway, cero refactor de código.
- ✅ Migrations `payment_events` + `tenants.payment_mode` (idempotentes, validadas con re-run).
- ✅ Código Mercado Pago: `create-preference`, webhook con HMAC + audit log M3, toggle UI, validado con `pnpm run mock:mercado-pago`.
- ✅ Health endpoints (`/api/health` en oms + storefront).
- ✅ Refactor contact a `service-role` + `runtime='nodejs'`.
- ✅ Middleware `getSession` → `getUser` (valida JWT contra Supabase server).
- ✅ Scripts: `pnpm check:env`, `pnpm run mock:mercado-pago`, `pnpm db:backup`.
- ✅ Documentación: `INFRA.md`, `MIGRATIONS.md`, `SPRINT8_SECRETS.md.example`, este runbook.

---

## Rollback rápido

- **DB corrupta tras migration**: restaurar último backup pre-migration (ver `MIGRATIONS.md` → Restore desde backup).
- **Pagos rompiendo órdenes**: toggle `tenants.payment_mode='test'` para el tenant afectado.
- **Deploy roto**: Railway → service → rollback al deploy anterior.
- **Cookie/sesión problemática**: invalidar `kobi-session` (POS) o `sb-<ref>-auth-token` (admin) desde Railway logs.

---

## Criterios de cierre Sprint 8 real (Railway phase)

1. `RAILWAY_OMS_URL` y `RAILWAY_STOREFRONT_URL` resuelven (HTTPS válido).
2. Admin de Kobi Test Kitchen puede loguearse y ver dashboard.
3. Orden de prueba paga completa el ciclo: preference → checkout MP → webhook → `orders.payment_status='paid'` → `payment_events` con `derived_status='paid'`.
4. Sentry no muestra errores no-triagiados en las últimas 24h.
5. Backup automático de prod corriendo (cron diario).
6. Miztli operando si Fase 7 verde.

---

## ===== DIFERIDO — activar en DEMO con dominio `kobi.mx` (NO ejecutar en MVP) =====

Cuando llegue el demo y se quiera levantar `kobi.mx`:

### Cloudflare DNS + custom domains en Railway

1. **Custom domains en Railway**: en cada service → Settings → Custom Domain → agregar:
   - `oms-prod`: `www.kobi.mx` Y `app.kobi.mx`
   - `storefront-prod`: `tienda.kobi.mx`
   - `oms-staging`: `app.staging.kobi.mx`
   - `storefront-staging`: `tienda.staging.kobi.mx`
   - **Verificar límite del plan Hobby**: 2 custom domains por service (alcanza para `www.kobi.mx` + `app.kobi.mx` en oms-prod).
2. Railway emite un **target CNAME** por dominio (algo tipo `<servicio>.up.railway.app` o `<hash>.cnames.railway.app`).
3. **En Cloudflare DNS**, crear CNAME por cada subdominio → target Railway.
4. **SSL inicial**: arrancar con proxy OFF (DNS only, nube gris) para validar que responde por HTTPS vía Railway directamente.
5. Una vez validado:
   - Prender proxy (nube naranja) en Cloudflare.
   - SSL mode = **"Full (strict)"** subdominio por subdominio, verificando cada uno.
   - **NUNCA usar "Flexible"** (causa loop de redirects al doble-HTTPS).
6. **Redirect apex**: page rule en Cloudflare `kobi.mx/*` → `301 https://www.kobi.mx/$1`.
7. **Actualizar env vars en Railway** (cero refactor de código):
   - `oms-prod`: `NEXT_PUBLIC_APP_URL=https://www.kobi.mx`, `NEXT_PUBLIC_OMS_URL=https://www.kobi.mx`
   - `storefront-prod`: `NEXT_PUBLIC_APP_URL=https://tienda.kobi.mx`, `NEXT_PUBLIC_STOREFRONT_URL=https://tienda.kobi.mx`
   - Para cross-app: `NEXT_PUBLIC_STOREFRONT_URL` en oms-prod, `NEXT_PUBLIC_OMS_URL` en storefront-prod.
8. **Si email en Ruta A**: migrar a Ruta B (verificar `kobi.mx` en Resend → 3 DNS records).
9. **Reconfigurar webhook MP**: cambiar URL en el panel de Mercado Pago de `*.up.railway.app` → `https://www.kobi.mx/api/webhooks/mercado-pago`.
10. **Actualizar Supabase**: Site URL + Redirect URLs en cada proyecto de `*.up.railway.app` → dominio kobi.mx.

### Verificación post-dominio

- `curl https://www.kobi.mx/api/health` → 200
- `curl https://app.kobi.mx/<algo>` → respuesta del oms
- `curl https://tienda.kobi.mx` → respuesta del storefront
- SSL Labs grade A por subdominio
- PageSpeed `www.kobi.mx` > 80
- Sentry sin spike de 5xx en las próximas 24h tras el switch.

### Verificaciones de DNS

- `dig CNAME www.kobi.mx +short` → debe apuntar al CNAME de Railway (o al proxy de Cloudflare si la nube está naranja).
- `dig TXT kobi.mx +short` → SPF Resend visible (si Ruta B).
- `dig MX kobi.mx +short` — opcional, solo si se configuran inbox; no necesario para envío saliente vía Resend.

### Rollback dominio

Si algo sale mal con el switch:
- Cloudflare: poner page rule temporal `kobi.mx/*` → 302 a `RAILWAY_OMS_URL/maintenance`.
- O simplemente revertir el cambio de env var `NEXT_PUBLIC_APP_URL` en Railway: vuelve a servir desde `*.up.railway.app`.

# ===== FIN DIFERIDO =====
