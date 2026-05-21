-- ============================================================================
-- Sprint 10 — shifts: agregar tenant_id + reemplazar RLS legacy single-tenant
-- ============================================================================
-- Estado previo:
--   - shifts.tenant_id NO existe.
--   - RLS legacy: shifts_select / shifts_update_self_or_manager usan
--     app.current_employee_id() / app.is_manager() + branches.restaurant_id
--     (single-tenant). No aíslan entre tenants.
--   - Zona operativa usa service_role + filtros explícitos, no RLS.
--
-- Estrategia:
--   1. Agregar tenant_id derivado de employee_id_v2 (Sprint 7.8 lo agregó).
--   2. Backfill desde employees_v2.tenant_id o (legacy) branches.restaurant_id
--      → restaurants.tenant_id.
--   3. Reemplazar RLS legacy por tenant_isolation patrón estándar
--      (consistente con orders/menu_items/employees_v2).
--   4. Service role mantiene full access (zona operativa lo usa).
-- ============================================================================

begin;

-- 1. tenant_id columna (nullable inicialmente para backfill).
alter table public.shifts
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

create index if not exists shifts_tenant_id_idx on public.shifts(tenant_id);

-- 2. Backfill desde employee_id_v2 (path v2, multi-tenant).
update public.shifts s
set tenant_id = ev.tenant_id
from public.employees_v2 ev
where s.employee_id_v2 = ev.id
  and s.tenant_id is null;

-- 3. Backfill legacy: shifts con employee_id (legacy) → via branches → restaurants.
update public.shifts s
set tenant_id = r.tenant_id
from public.branches b join public.restaurants r on r.id = b.restaurant_id
where s.branch_id = b.id
  and s.tenant_id is null
  and r.tenant_id is not null;

-- 4. Verificar que no quedaron filas sin tenant_id (raise warning si quedan).
do $$
declare
  orphans bigint;
begin
  select count(*) into orphans from public.shifts where tenant_id is null;
  if orphans > 0 then
    raise warning 'shifts sin tenant_id: % (revisar antes de hacer NOT NULL)', orphans;
  end if;
end $$;

-- 5. Drop policies legacy single-tenant.
drop policy if exists shifts_select                 on public.shifts;
drop policy if exists shifts_insert_self            on public.shifts;
drop policy if exists shifts_update_self_or_manager on public.shifts;

-- 6. Nuevas policies tenant-isolation.
drop policy if exists shifts_service_role on public.shifts;
create policy shifts_service_role on public.shifts
  to service_role using (true) with check (true);

drop policy if exists shifts_tenant_isolation on public.shifts;
create policy shifts_tenant_isolation on public.shifts
  to authenticated
  using (
    tenant_id in (
      select user_tenants.tenant_id from public.user_tenants
      where user_tenants.user_id = auth.uid()
    )
  )
  with check (
    tenant_id in (
      select user_tenants.tenant_id from public.user_tenants
      where user_tenants.user_id = auth.uid()
    )
  );

commit;

notify pgrst, 'reload schema';
