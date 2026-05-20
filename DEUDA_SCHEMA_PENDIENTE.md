# Deuda de schema pendiente

Registro de columnas / objetos en el schema que están en estado ambiguo y necesitan decisión en sprint de limpieza futuro.

---

## `tenants.onboarding_step` — columna muerta (write-only)

**Origen**: agregada en [packages/db/supabase/migrations/20260518000002_sprint7_init.sql:6](packages/db/supabase/migrations/20260518000002_sprint7_init.sql#L6) para trackear el paso actual del wizard.

**Estado real (Sprint 7.9.1)**:
- El wizard determina el paso actual vía heurísticas sobre campos en `getNextOnboardingStep()` ([apps/oms/lib/supabase/onboarding-state.ts](apps/oms/lib/supabase/onboarding-state.ts)):
  - `tenant.name === 'Mi Restaurante' || !tenant.address` → paso `restaurante`
  - `!tenant.metadata?.canales` → paso `operacion`
  - `!tenant.metadata?.plan_confirmed` → paso `plan`
  - else → paso `listo`
- La columna `onboarding_step` queda **siempre en 1** porque el wizard NO la escribe.
- Lecturas detectadas vía grep: **0** (solo aparece en 2 migrations que la escriben en INSERT).

**Decisión**: eliminar la columna en sprint de limpieza futuro. Las heurísticas sobre campos reales son menos propensas a desincronización que una columna de estado paralela.

**Pre-condiciones para eliminar**:
1. Grep exhaustivo de `onboarding_step` en todo el monorepo (apps, packages, scripts, docs).
2. Confirmar que ningún consumidor externo (Edge Functions, jobs, dashboards) la lee.
3. Migration drop + actualizar migrations previas que la INSERT para no romper idempotencia.

**Disparador**: sprint de limpieza de schema, o cuando se toque el modelo de onboarding (ej. si se decide cablear la columna en lugar de eliminarla).

---

## `menu_items.tenant_id` — backfill obligatorio en migrations futuras

**Origen**: agregada en [packages/db/supabase/migrations/20260521000001_unify_tenant_model.sql:75-83](packages/db/supabase/migrations/20260521000001_unify_tenant_model.sql#L75-L83) para enlazar items legacy al modelo multi-tenant.

**Estado real (Sprint 7.9.1)**: en seed/reset frescos, los `menu_items` insertados por `seed.sql` quedan con `tenant_id NULL` porque la migration `20260521000001` corre antes que el seed. El parche idempotente vive en [packages/db/supabase/migrations/20260521000006_link_miztli_menu_items.sql](packages/db/supabase/migrations/20260521000006_link_miztli_menu_items.sql) y debe ejecutarse después de seed.

**Decisión pendiente**: cuando todos los consumidores se hayan migrado a leer por `tenant_id` (no `restaurant_id`), hacer `NOT NULL` la columna y eliminar el parche.
