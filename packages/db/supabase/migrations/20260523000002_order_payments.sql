-- ============================================================================
-- Sprint 10 — order_payments: registro canónico de cobros del turno
-- ============================================================================
-- Modelo del cobro de mostrador:
--   - Una orden puede tener uno o más payment events (split de cuenta, refund,
--     etc.). En el MVP de Sprint 10 hacemos un cobro por orden, pero el modelo
--     soporta varios.
--   - Cada pago se liga a la orden Y al turno (shift) donde se cobró — el
--     corte de caja del turno suma exactamente sus pagos.
--
-- Cobro de mostrador:
--   - method ∈ {cash, card}.
--   - amount_cents: monto total del cobro (= orden.total cuando es pago único).
--   - cash_received_cents: solo aplica si method=cash; cuánto entregó el cliente.
--   - change_given_cents: cash_received_cents - amount_cents (si cash).
--   - card payments en MVP NO se procesan online (no hay terminal). Se registra
--     el método para que entre al corte.
--
-- Aislamiento: tenant_id + shift_id obligatorios para que el corte se calcule
-- por turno y la RLS aísle entre tenants.
-- ============================================================================

begin;

create table if not exists public.order_payments (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references public.tenants(id) on delete cascade,
  order_id              uuid not null references public.orders(id) on delete cascade,
  shift_id              uuid references public.shifts(id) on delete set null,
  employee_id_v2        uuid references public.employees_v2(id) on delete set null,
  method                text not null,
  amount_cents          integer not null,
  cash_received_cents   integer,
  change_given_cents    integer,
  notes                 text,
  created_at            timestamptz not null default now()
);

-- CHECKs (idempotentes via drop+add).
alter table public.order_payments drop constraint if exists order_payments_method_check;
alter table public.order_payments add constraint order_payments_method_check
  check (method in ('cash', 'card'));

alter table public.order_payments drop constraint if exists order_payments_amount_check;
alter table public.order_payments add constraint order_payments_amount_check
  check (amount_cents >= 0);

alter table public.order_payments drop constraint if exists order_payments_cash_check;
alter table public.order_payments add constraint order_payments_cash_check
  check (
    (method = 'cash' and cash_received_cents is not null and change_given_cents is not null)
    or method <> 'cash'
  );

create index if not exists order_payments_order_id_idx on public.order_payments(order_id);
create index if not exists order_payments_shift_id_idx on public.order_payments(shift_id);
create index if not exists order_payments_tenant_id_idx on public.order_payments(tenant_id);

alter table public.order_payments enable row level security;

drop policy if exists order_payments_service_role on public.order_payments;
create policy order_payments_service_role on public.order_payments
  to service_role using (true) with check (true);

drop policy if exists order_payments_tenant_isolation on public.order_payments;
create policy order_payments_tenant_isolation on public.order_payments
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
