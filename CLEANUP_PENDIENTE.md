# Cleanup pendiente al cierre de auditoría

Cuentas sintéticas creadas durante la auditoría que deben borrarse al cierre formal. **NO ejecutar el cleanup hasta que la auditoría externa haya cerrado** — estas cuentas sirven para reproducir hallazgos.

---

## Cuentas en BD local (Supabase local, `127.0.0.1:54322`)

| Email | Tenant | UUID Tenant | Origen | Acción |
|---|---|---|---|---|
| `jordyvargasgomez@gmail.com` | Mi Restaurante | `2ba4d4b8-…` | Owner real | **CONSERVAR** |
| `joel@gmail.com` | Mi Restaurante | `65de63f6-…` | Auditoría externa | Borrar |
| `joel.c@gmail.com` | Mi Restaurante | `7206dd1f-…` | Auditoría externa | Borrar |
| `wizard-test-7-9@mailinator.com` | Mi Restaurante de Prueba | `9163afab-…` | Sprint 7.9 E2E backend | Borrar |
| `wizard-http-test@mailinator.com` | Mi Restaurante | `0df757f7-…` | Sprint 7.9.1 Tarea 1 setup visual | Borrar (después de validación visual de Jordy) |

## Cuentas de auditoría externa (referencia)

| Email | Tenant | Origen | Acción |
|---|---|---|---|
| `audit-kobi-9b9b5ae@mailinator.com` | Kobi Audit Lab | Auditoría externa Sprint 7.7 | Borrar al cierre auditoría |

---

## Script de cleanup (NO EJECUTAR sin autorización)

```sql
-- Una sola pasada (CASCADE borra user_tenants + tenants placeholder)
DELETE FROM auth.users WHERE email IN (
  'joel@gmail.com',
  'joel.c@gmail.com',
  'wizard-test-7-9@mailinator.com',
  'wizard-http-test@mailinator.com'
);

-- Verificar
SELECT count(*) FROM auth.users;  -- esperado: solo jordyvargasgomez + cuentas de auditoría aún vivas
```

**Riesgo**: `ON DELETE CASCADE` desde `auth.users` se propaga a `user_tenants`. El tenant placeholder asociado queda huérfano si no fue compartido — borrar manualmente después si así se decide. Miztli (UUID `00000000-…001`) **NO** debe tocarse: es producción del PoC.

---

## Disparador de cleanup

Cierre formal de la auditoría externa (definido por Jordy + auditor). Hasta entonces, todas las cuentas viven.
