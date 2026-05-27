-- ============================================================================
-- Sprint 16 — FASE 4 (É15): Fondo de caja + arqueo
-- ============================================================================
-- shifts ya tiene las columnas de cierre (cash_expected_cents, cash_counted_cents,
-- cash_difference_cents, card_total_cents, orders_count, total_sold_cents) desde
-- 20260523000003. Falta el FONDO INICIAL para que el arqueo sea correcto:
--
--   esperado_en_caja = fondo_inicial + ventas_en_efectivo
--   diferencia       = contado_fisico - esperado_en_caja
--
--   • opening_float_cents: fondo con el que se abre la caja (default 0).
--   • opening_float_set:   si el cajero ya capturó el fondo (para mostrar el modal
--                          de apertura una sola vez por turno).
--
-- NOT NULL DEFAULT 0/false: los turnos existentes/históricos quedan con fondo 0
-- y se pueden cerrar sin romper (escenario migración).
--
-- Idempotente: re-ejecutable sin error.
-- ============================================================================

alter table public.shifts
  add column if not exists opening_float_cents integer not null default 0,
  add column if not exists opening_float_set boolean not null default false;

comment on column public.shifts.opening_float_cents is
  'Fondo de caja inicial en centavos. esperado = opening_float_cents + ventas efectivo.';
comment on column public.shifts.opening_float_set is
  'true cuando el cajero capturó el fondo inicial del turno (gate del modal de apertura).';
