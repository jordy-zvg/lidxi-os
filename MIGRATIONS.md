# MIGRATIONS — Proceso de despliegue

Cómo aplicar migrations a Supabase **prod** y **staging**, y cómo correr backups.

---

## Lista ordenada (state Sprint 8 prep)

| # | Migration | Sprint | Notas |
|---|---|---|---|
| 1 | `20260511000001_init_schema.sql` | 1 | Schema base (orders, branches, restaurants, menu_items, employees, shifts) |
| 2 | `20260511000002_auth_helpers.sql` | 1 | Funciones auth (`current_employee_id`, `current_branch_id`, etc.) |
| 3 | `20260511000003_rls_policies.sql` | 1 | RLS legacy single-tenant |
| 4 | `20260512000001_shifts_extensions.sql` | 1 | `shifts.type`, `auto_closed`, `pos_session_id` |
| 5 | `20260515000001_menu_editor.sql` | 1.5 | Menu items: `image_url`, `category`, `position` |
| 6 | `20260515000002_delivery_tracking.sql` | 1.6 | Tracking de couriers en tiempo real |
| 7 | `20260518000001_multi_tenant.sql` | 7 | Tablas `tenants`, `user_tenants`, `branches_v2`, RLS multi-tenant + trigger `on_auth_user_created` |
| 8 | `20260518000002_sprint7_init.sql` | 7 | Columnas extra en `tenants` (onboarding_step, plan, trial_ends_at, metadata) |
| 9 | `20260519_sprint7_5_branches_extensions.sql` | 7.5 | Branches: address, lat, lng, channels, hours |
| 10 | `20260520_contact_source_column.sql` | 7.5 | `contact_messages.source` |
| 11 | `20260520_employees_v2.sql` | 7.6 | Tabla `employees_v2` multi-tenant |
| 12 | `20260521000001_unify_tenant_model.sql` | 7.7 | `restaurants/menu_items/employees/orders.tenant_id` + backfill |
| 13 | `20260521000002_unify_rls_policies.sql` | 7.7 | RLS por `tenant_id` en todas las tablas |
| 14 | `20260521000003_migrate_employees_legacy_to_v2.sql` | 7.7 | Copy de employees → employees_v2 |
| 15 | `20260521000004_shifts_v2_fks.sql` | 7.8 | `shifts.employee_id_v2`, `branch_id_v2` |
| 16 | `20260521000006_link_miztli_menu_items.sql` | 7.9.1 | Backfill `menu_items.tenant_id` |
| 17 | `20260522000001_payment_events.sql` | 8 prep | Tabla de webhook log + audit (Mercado Pago) |
| 18 | `20260522000002_tenant_payment_mode.sql` | 8 prep | `tenants.payment_mode` (test/production) toggle |

> Nota: el archivo `20260521000005` no existe (saltado). El siguiente número canónico es `20260521000006`.

---

## Aplicar migrations

### Local (dev)

```bash
# Reset completo (drop + crear desde 0):
pnpm db:reset

# O aplicar manualmente una migration específica:
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
  -f packages/db/supabase/migrations/<filename>.sql
```

### Staging

```bash
# 1. Backup ANTES de migrar:
pnpm db:backup staging

# 2. Apuntar Supabase CLI al proyecto staging:
supabase link --project-ref "$SUPABASE_PROJECT_REF_STAGING"

# 3. Aplicar migrations pendientes:
supabase db push

# 4. Verificar:
PGPASSWORD="$SUPABASE_DB_PASSWORD_STAGING" psql \
  --host="aws-0-us-east-1.pooler.supabase.com" --port=6543 \
  --username="postgres.$SUPABASE_PROJECT_REF_STAGING" --dbname="postgres" \
  -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5;"
```

### Producción

**Pre-condiciones obligatorias**:
1. Migrations aplicadas y verdes en staging.
2. Smoke test del producto en staging.
3. Backup de prod creado **dentro de la última hora**.
4. Ventana de mantenimiento anunciada (si la migration toca data activa).

```bash
# 1. Backup OBLIGATORIO:
pnpm db:backup prod
# → backups/prod-YYYYMMDD-HHMMSS.sql.gz

# 2. Apuntar al proyecto prod:
supabase link --project-ref "$SUPABASE_PROJECT_REF_PROD"

# 3. Aplicar migrations:
supabase db push

# 4. Smoke test post-deploy:
curl https://kobi.mx/api/health
# verificar que health responde y no hay errores en Sentry
```

---

## Restore desde backup

```bash
# Descomprimir e importar:
gunzip -c backups/<env>-YYYYMMDD-HHMMSS.sql.gz | \
  PGPASSWORD="$SUPABASE_DB_PASSWORD_<ENV>" psql \
    --host=aws-0-us-east-1.pooler.supabase.com --port=6543 \
    --username="postgres.$SUPABASE_PROJECT_REF_<ENV>" --dbname="postgres"
```

⚠️ Restore destructivo: confirma con el usuario antes de ejecutar contra una BD con data viva.

---

## Política de cambios destructivos

DROP COLUMN, DROP TABLE, TRUNCATE, ALTER TYPE incompatible → requieren:
1. Migration con `DROP IF EXISTS` (idempotente).
2. Aprobación explícita del usuario en sesión (no autonomous).
3. Backup pre-migration con timestamp del último día.
4. Documentar rollback strategy en el comentario inicial de la migration.

Ver `DEUDA_SCHEMA_PENDIENTE.md` para columnas candidatas a eliminación en sprints futuros.
