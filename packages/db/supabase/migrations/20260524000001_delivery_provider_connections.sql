-- ============================================================================
-- Sprint 11 — delivery_provider_connections (credenciales de proveedores
-- de logística por tenant)
-- ============================================================================
-- Por qué tabla separada de channel_connections:
--   channel_connections agrupa CANALES DE VENTA (Uber Eats, Rappi, Didi Food,
--   Mercado Pago). Uber Direct es LOGÍSTICA (entrega física para tu sitio
--   propio); semánticamente distinto. Tabla separada evita CHECK constraints
--   crecientes y permite políticas RLS específicas si los modelos divergen.
--
--   Misma estructura general (jsonb credentials, status enum, audit trail).
--
-- Providers soportados en Sprint 11: uber_direct.
-- Otros (lalamove, treggo, rappi_cargo, etc.) entran agregándolos al CHECK.
-- ============================================================================

begin;

create table if not exists public.delivery_provider_connections (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  provider     text not null,
  status       text not null default 'disconnected',
  credentials  jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  last_error   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, provider)
);

alter table public.delivery_provider_connections
  drop constraint if exists delivery_provider_connections_provider_check;
alter table public.delivery_provider_connections
  add constraint delivery_provider_connections_provider_check
    check (provider in ('uber_direct'));

alter table public.delivery_provider_connections
  drop constraint if exists delivery_provider_connections_status_check;
alter table public.delivery_provider_connections
  add constraint delivery_provider_connections_status_check
    check (status in ('disconnected', 'pending', 'connected', 'error'));

create index if not exists delivery_provider_connections_tenant_id_idx
  on public.delivery_provider_connections(tenant_id);

alter table public.delivery_provider_connections enable row level security;

-- Service role: full access (jobs futuros, sincronización con APIs reales).
drop policy if exists delivery_provider_connections_service_role on public.delivery_provider_connections;
create policy delivery_provider_connections_service_role on public.delivery_provider_connections
  to service_role using (true) with check (true);

-- Authenticated admin/owner del tenant: full access dentro de su tenant.
drop policy if exists delivery_provider_connections_tenant_admin on public.delivery_provider_connections;
create policy delivery_provider_connections_tenant_admin on public.delivery_provider_connections
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

commit;

notify pgrst, 'reload schema';
