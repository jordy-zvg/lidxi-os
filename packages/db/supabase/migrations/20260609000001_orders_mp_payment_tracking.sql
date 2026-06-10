-- ============================================================================
-- Sprint 17 — orders: tracking de pago Mercado Pago (Checkout Pro online)
-- ============================================================================
-- Estado autoritativo y consultable del pago online de una orden, más los
-- identificadores de MP para reconciliación de retornos/abandonos e
-- idempotencia del webhook.
--
--   payment_status   : estado de pago canónico. Default 'pending'.
--                      Las transiciones las hace SOLO el webhook MP (server-side,
--                      tras el fetch autoritativo a la API de MP):
--                        pending → paid      (pago aprobado)
--                        pending → failed    (rechazado / cancelado)
--                        paid    → refunded  (reembolso / contracargo)
--   mp_preference_id : id de la preference de Checkout Pro. Se llena al crear el
--                      checkout. Permite reconciliar si el comensal vuelve o
--                      abandona el pago.
--   mp_payment_id    : id del payment en MP. Se llena en el webhook tras el
--                      fetch autoritativo. UNIQUE parcial → un payment no puede
--                      aplicarse a dos órdenes (idempotencia dura ante reenvíos).
--
-- NOTA DE MODELO: el dinero online NO entra a `order_payments` (ese es el ledger
-- de caja/corte: method ∈ {cash,card}, acoplado a shift_id). El detalle del
-- cobro online ya vive en `payment_events` por order_id. Esta migración NO toca
-- `order_payments` ni el path de corte de turno (Sprint 10).
--
-- Aplicar a mano en Supabase SQL Editor (prueba y producción). Aditiva e
-- idempotente: re-correrla no rompe nada.
-- ============================================================================

begin;

alter table public.orders
  add column if not exists payment_status   text not null default 'pending',
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id    text;

alter table public.orders
  drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
    check (payment_status in ('pending', 'paid', 'failed', 'refunded'));

-- Idempotencia dura: un payment de MP mapea a exactamente una orden. Si el
-- webhook se reenvía, el segundo intento de escribir el mismo mp_payment_id
-- en otra orden falla; el update condicional (WHERE payment_status='pending')
-- ya evita la doble-transición sobre la misma orden.
create unique index if not exists orders_mp_payment_id_uniq
  on public.orders(mp_payment_id)
  where mp_payment_id is not null;

-- Consultas operativas: "órdenes pagadas / pendientes de pago".
create index if not exists orders_payment_status_idx
  on public.orders(payment_status);

-- Reconciliación por preference (retorno del comensal, jobs de barrido).
create index if not exists orders_mp_preference_id_idx
  on public.orders(mp_preference_id)
  where mp_preference_id is not null;

commit;

notify pgrst, 'reload schema';
