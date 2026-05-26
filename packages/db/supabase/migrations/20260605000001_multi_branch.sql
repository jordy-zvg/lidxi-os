-- ============================================================================
-- Sprint 14 — Multi-sucursal (Épica 12)
-- ============================================================================
-- 1. employee_branches: relación many-to-many empleado ↔ sucursal (v2).
--    Un empleado puede operar en varias sucursales (caso dark kitchens).
--    Sin entrada = backwards compat: el empleado puede operar en cualquier
--    sucursal activa del tenant (se filtra en runtime).
--
-- 2. branches_v2.status: alinear con patrón pos_devices ('active'|'inactive').
--    is_active queda deprecado pero funcional para legacy queries.
--
-- 3. orders.branch_id_v2: mirror pattern de shifts.branch_id_v2. orders.branch_id
--    legacy sigue NOT NULL FK a branches (single-tenant), pero a partir de
--    Sprint 14 también escribimos branch_id_v2 (FK a branches_v2). Cuando todos
--    los callers escriban v2, podemos hacer branch_id nullable y eventualmente
--    eliminarlo (ticket aparte).
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. employee_branches
-- ---------------------------------------------------------------------------
create table if not exists public.employee_branches (
  id              uuid primary key default gen_random_uuid(),
  employee_id_v2  uuid not null references public.employees_v2(id) on delete cascade,
  branch_id_v2    uuid not null references public.branches_v2(id) on delete cascade,
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (employee_id_v2, branch_id_v2)
);

create index if not exists employee_branches_tenant_id_idx on public.employee_branches(tenant_id);
create index if not exists employee_branches_employee_idx on public.employee_branches(employee_id_v2);
create index if not exists employee_branches_branch_idx on public.employee_branches(branch_id_v2);

alter table public.employee_branches enable row level security;

drop policy if exists employee_branches_service_role on public.employee_branches;
create policy employee_branches_service_role on public.employee_branches
  to service_role using (true) with check (true);

drop policy if exists employee_branches_tenant_admin on public.employee_branches;
create policy employee_branches_tenant_admin on public.employee_branches
  to authenticated
  using (
    tenant_id in (
      select user_tenants.tenant_id from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.role in ('owner', 'admin')
    )
  )
  with check (
    tenant_id in (
      select user_tenants.tenant_id from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.role in ('owner', 'admin')
    )
  );

comment on table public.employee_branches is
  'Asignación many-to-many empleado↔sucursal. Sin entrada para un empleado = puede operar en cualquier sucursal activa del tenant (backwards compat).';

-- ---------------------------------------------------------------------------
-- 2. branches_v2: añadir status, mantener is_active (deprecado)
-- ---------------------------------------------------------------------------
alter table public.branches_v2
  add column if not exists status text not null default 'active';

alter table public.branches_v2
  drop constraint if exists branches_v2_status_check;
alter table public.branches_v2
  add constraint branches_v2_status_check
    check (status in ('active', 'inactive'));

-- Sincronizar status con is_active existente (transición sin pérdida de data).
update public.branches_v2
  set status = case when is_active = false then 'inactive' else 'active' end
  where status = 'active' and is_active is not null;

create index if not exists branches_v2_tenant_status_idx
  on public.branches_v2(tenant_id, status);

comment on column public.branches_v2.status is
  'active|inactive. is_active queda como bool legacy; ambos sincronizados por aplicación.';

-- ---------------------------------------------------------------------------
-- 3. orders.branch_id_v2 (mirror pattern de shifts)
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists branch_id_v2 uuid references public.branches_v2(id) on delete set null;

create index if not exists orders_tenant_branch_v2_idx
  on public.orders(tenant_id, branch_id_v2, created_at desc);

comment on column public.orders.branch_id_v2 is
  'FK a branches_v2 (multi-tenant). orders.branch_id legacy sigue NOT NULL para retrocompat. Sprint 14+: nuevos INSERTs escriben ambos. Backfill de filas viejas en migración de datos aparte.';

commit;

notify pgrst, 'reload schema';
