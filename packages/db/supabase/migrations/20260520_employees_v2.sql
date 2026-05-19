-- Sprint 7.6 — Bug C: introducir employees_v2 (multi-tenant).
--
-- Decisión consciente: NO tocar public.employees legacy (single-tenant, branch_id,
-- referenced por shifts con FK + 4 filas de data Miztli). Renombrar/dropear con
-- data viva + FK arrastra mucho riesgo. Crear paralelo (employees_v2 ←→ branches_v2).
--
-- Cuando /admin/equipo conecte a DB real (Sprint 8+), apuntar a esta tabla.
-- Plan de consolidación final (Sprint 9 o posterior, sin urgencia):
--   1. Migrar data legacy a employees_v2 mapeando branch_id→tenant_id via branches.tenant_id (cuando branches.tenant_id exista)
--   2. Rename shifts.employee_id FK target
--   3. Drop employees legacy, rename employees_v2 → employees

create table if not exists public.employees_v2 (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  branch_id   uuid references public.branches_v2(id) on delete set null,
  name        text not null,
  role        text not null check (role in ('Admin operativo', 'Cajero', 'Cocinero', 'Runner')),
  pin_hash    text not null,
  status      text default 'activo' check (status in ('activo', 'pausado')),
  last_login  timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (tenant_id, pin_hash)
);

create index if not exists employees_v2_tenant_idx on public.employees_v2 (tenant_id);
create index if not exists employees_v2_branch_idx on public.employees_v2 (branch_id);

alter table public.employees_v2 enable row level security;

drop policy if exists "employees_v2_select_tenant" on public.employees_v2;
create policy "employees_v2_select_tenant" on public.employees_v2
  for select using (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );

drop policy if exists "employees_v2_write_admin" on public.employees_v2;
create policy "employees_v2_write_admin" on public.employees_v2
  for all using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

comment on table public.employees_v2 is
  'Empleados operativos multi-tenant. Paralela a employees legacy (single-tenant); ver Sprint 9 para consolidación.';
