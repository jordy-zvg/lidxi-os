# Kobi OMS — Security Hardening (Sprint 15)

## Implemented Measures

### 1. Environment Variable Validation ✅

**File:** `lib/validate-env.ts`

Validación crítica de env vars al arranque:
- `JWT_SECRET` — signing/verifying employee PINs
- `SUPABASE_SERVICE_ROLE_KEY` — admin database operations
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — client-side auth

**Impact:** Falla explícita en startup si faltan vars críticas. No hay fallos silenciosos en prod.

### 2. Cookie Handling ✅

**File:** `lib/supabase/server.ts`

Try/catch en `setAll()` callback:
- Maneja "Cookies can only be modified" error en Server Components read-only
- Logguea warning en lugar de crashear
- Supabase SSR cliente sigue funcionando sin interrupción

**Impact:** Resilencia a contextos read-only sin perder sesiones válidas.

### 3. Security Headers ✅

**File:** `next.config.mjs`

Headers implementados:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — HTTPS enforcement
- `X-Content-Type-Options: nosniff` — MIME sniffing prevention
- `X-Frame-Options: DENY` — Clickjacking prevention
- `X-XSS-Protection: 1; mode=block` — Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` — Referrer control

**Impact:** Protección contra ataques comunes en navegadores.

### 4. JWT Validation (Employee Sessions) ✅

**File:** `lib/operations/employee-context.ts`

`requireEmployeeContext()` lanza `NoOperationSessionError` si:
- No hay cookie `kobi-session`
- JWT es inválido (firma/expiración)
- `tenant_id` falta (JWT viejo pre-Sprint 10)
- `branch_id` falta (JWT viejo pre-Sprint 14)

**Impact:** Solo sesiones válidas con tenant/branch info completa pueden operar.

### 5. Tenant Isolation ✅

Todas las queries operativas filtran por `tenant_id` verificado del JWT:
- No hay confianza en parámetros de cliente
- `tenant_id` viene de JWT verificado (`claims.tenant_id`)
- Código operativo usa service_role client con filtros explícitos en lugar de RLS

**Files:**
- `lib/operations/order-actions.ts`
- `lib/operations/shift-actions.ts`
- `lib/auth-actions.ts`

**Impact:** Aislamiento de datos entre tenants incluso si RLS falla.

### 6. Input Validation ✅

Admin actions validan:
- Longitud de strings (nombre ≥2 chars)
- Formato de PIN (4-8 dígitos)
- Ranges numéricos (stock ≥ 0, etc.)
- Valores enum (roles válidos)

**Files:**
- `app/admin/equipo/actions.ts`
- `app/admin/inventario/actions.ts`
- `app/admin/tarifas/actions.ts`

**Impact:** No inserts inválidos o malformed data.

### 7. Middleware Guards ✅

**File:** `middleware.ts`

- Admin zone: valida `user` vía Supabase Auth + `user_tenants` role check
- Operation zone: valida `kobi-session` JWT (no decodificación sin verify)
- Redirects no autorizados a `/admin/sin-acceso` o `/login`

**Impact:** No acceso no autorizado a zones.

## Remaining / Future

### 1. Rate Limiting

`/login` endpoint (PIN entry) debería tener rate limiting:
- Protege contra brute force de PINs
- Limitar a X intentos por IP/dispositivo per minuto

**Priority:** Medium (Sprint 16)

### 2. Content Security Policy (CSP)

Headers CSP adicionales para restringir:
- Script sources (solo confiados)
- Style sources
- Frame sources
- etc.

**Priority:** Low (mostly mitigated by Next.js defaults)

### 3. API Rate Limiting

Si hay API pública, implementar rate limiting vía middleware.

**Priority:** Low (no API pública por ahora)

### 4. Audit Logging

Loguear operaciones sensibles:
- Login attempts (exitosos/fallidos)
- Admin changes (empleados, inventario, etc.)
- Large transaction (orders)

**Priority:** Medium (Sprint 16)

### 5. CORS Configuration

Si hay requests cross-origin, configurar CORS headers apropiados:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- etc.

**Priority:** Low (same-origin por ahora)

## Checklist (Sprint 15 ✅)

- ✅ Env var validation at startup
- ✅ Cookie error handling in read-only contexts
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ JWT validation in employee operations
- ✅ Tenant isolation via explicit filtering
- ✅ Input validation in admin actions
- ✅ Middleware guards for auth zones
- ✅ Multi-branch (employee-per-branch) documentation

## Testing

Para verificar medidas:

1. **Env vars:** Start app without `JWT_SECRET` → debe fallar con error claro
2. **Headers:** `curl -I https://localhost:3000` → verificar headers presentes
3. **JWT:** Cookie con JWT inválido → redirect a `/login`
4. **Tenant:** Admin op con tenant X no ve datos de tenant Y → filtrado en query
5. **Validation:** Admin form con nombre vacío → error validación

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/advanced-features/security-headers
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
