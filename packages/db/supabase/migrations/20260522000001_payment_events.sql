-- ============================================================================
-- Sprint 8 — payment_events (Mercado Pago webhook log + audit trail)
-- ============================================================================
-- Inmutable log de eventos de pago entrantes (M3 Sprint 8). Cada webhook MP
-- (payment.created / payment.updated) graba aquí ANTES de procesarse, para
-- auditoría completa incluso si la firma HMAC falla o el body es inválido.
--
-- event_id es único → idempotencia: si MP reintenta el mismo evento, el
-- INSERT con ON CONFLICT no duplica.
--
-- order_id es nullable porque algunos webhooks no resuelven a una orden
-- (eventos de prueba, external_reference desconocido, etc.) — esos casos
-- quedan visibles para debug.
-- ============================================================================

begin;

create table if not exists public.payment_events (
  id              uuid primary key default gen_random_uuid(),
  event_id        text not null unique,
  event_type      text not null,
  provider        text not null default 'mercado_pago',
  order_id        uuid references public.orders(id) on delete set null,
  tenant_id       uuid references public.tenants(id) on delete set null,
  payload         jsonb not null,
  signature_valid boolean,
  derived_status  text,
  error           text,
  received_at     timestamptz not null default now(),
  processed_at    timestamptz
);

create index if not exists payment_events_order_id_idx     on public.payment_events(order_id);
create index if not exists payment_events_tenant_id_idx    on public.payment_events(tenant_id);
create index if not exists payment_events_received_at_idx  on public.payment_events(received_at desc);
create index if not exists payment_events_event_type_idx   on public.payment_events(event_type);

alter table public.payment_events enable row level security;

-- Service role: full access (webhook handler escribe; jobs leen para reprocessing).
drop policy if exists payment_events_service_role on public.payment_events;
create policy payment_events_service_role on public.payment_events
  to service_role using (true) with check (true);

-- Authenticated tenants: solo SELECT de eventos de SUS órdenes (read-only).
drop policy if exists payment_events_tenant_select on public.payment_events;
create policy payment_events_tenant_select on public.payment_events
  for select to authenticated
  using (
    tenant_id in (
      select user_tenants.tenant_id
      from public.user_tenants
      where user_tenants.user_id = auth.uid()
    )
  );

commit;

notify pgrst, 'reload schema';
