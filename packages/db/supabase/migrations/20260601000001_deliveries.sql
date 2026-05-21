-- ============================================================================
-- Sprint 12 — deliveries (persistencia de entregas activas por tenant)
-- ============================================================================
-- Por qué tabla separada de delivery_tracking:
--   delivery_tracking (Sprint 1.6) almacena el ESTADO MÁS RECIENTE del courier
--   por orden (lat/lng, eta, fotos). Su naturaleza es "snapshot mutable".
--
--   deliveries (Sprint 12) almacena el RECORD INMUTABLE de la entrega:
--     - quote elegida (fee, distancia, eta inicial)
--     - timestamps de transición de estado (assigned/pickup/dropoff)
--     - external_id del proveedor (Uber Direct delivery id)
--     - payload crudo del proveedor para auditoría
--
--   Conviven: delivery_tracking referencia order_id; deliveries también, pero
--   sirve como source of truth de qué pedidos están actualmente en logística
--   y cuánto se pagó por cada entrega.
--
-- Aislamiento: tenant_id NOT NULL + RLS service_role (operación) + tenant_admin
--   (lectura admin). NO se filtra por user_tenants para la zona operación
--   porque ahí no hay auth.uid() — el aislamiento operativo viene del filtro
--   explícito `.eq('tenant_id', tenantId)` derivado del JWT de empleado.
-- ============================================================================

begin;

create table if not exists public.deliveries (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  order_id            uuid not null references public.orders(id) on delete cascade,
  provider            text not null,
  external_id         text,
  status              text not null default 'pending',
  -- Cotización (capturada al crear)
  quote_fee_cents     integer not null default 0 check (quote_fee_cents >= 0),
  quote_currency      text not null default 'MXN',
  pickup_eta          timestamptz,
  dropoff_eta         timestamptz,
  -- Courier asignado
  courier_name        text,
  courier_phone       text,
  courier_vehicle     text,
  courier_lat         numeric(9,6),
  courier_lng         numeric(9,6),
  -- Direcciones (snapshot del momento del dispatch)
  pickup_address      jsonb,
  dropoff_address     jsonb,
  -- Timestamps de transición
  assigned_at         timestamptz,
  pickup_arrived_at   timestamptz,
  picked_up_at        timestamptz,
  dropoff_arrived_at  timestamptz,
  delivered_at        timestamptz,
  canceled_at         timestamptz,
  cancel_reason       text,
  -- Auditoría
  raw_payload         jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (order_id, provider)
);

alter table public.deliveries
  drop constraint if exists deliveries_provider_check;
alter table public.deliveries
  add constraint deliveries_provider_check
    check (provider in ('uber_direct'));

alter table public.deliveries
  drop constraint if exists deliveries_status_check;
alter table public.deliveries
  add constraint deliveries_status_check
    check (status in (
      'pending',
      'courier_assigned',
      'pickup_arrived',
      'picked_up',
      'dropoff_arrived',
      'delivered',
      'canceled',
      'returned',
      'error'
    ));

create index if not exists deliveries_tenant_id_idx on public.deliveries(tenant_id);
create index if not exists deliveries_order_id_idx on public.deliveries(order_id);
create index if not exists deliveries_status_idx on public.deliveries(status);

alter table public.deliveries enable row level security;

-- Service role: full access (operación usa este path con filtro explícito
-- .eq('tenant_id', tenantId) derivado del JWT de empleado).
drop policy if exists deliveries_service_role on public.deliveries;
create policy deliveries_service_role on public.deliveries
  to service_role using (true) with check (true);

-- Authenticated admin/owner del tenant: full access dentro de su tenant.
drop policy if exists deliveries_tenant_admin on public.deliveries;
create policy deliveries_tenant_admin on public.deliveries
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

-- ============================================================================
-- delivery_tracking: backfill tenant_id desde order para futuras RLS.
-- ============================================================================
alter table public.delivery_tracking
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

update public.delivery_tracking dt
  set tenant_id = o.tenant_id
  from public.orders o
  where o.id = dt.order_id
    and dt.tenant_id is null
    and o.tenant_id is not null;

create index if not exists delivery_tracking_tenant_id_idx on public.delivery_tracking(tenant_id);

-- ============================================================================
-- tenants.metadata: opcional config del storefront (radio, subsidio, whatsapp)
-- Ya existe la columna metadata jsonb; no requiere migration adicional.
-- ============================================================================

commit;

notify pgrst, 'reload schema';
