-- ============================================================================
-- Sprint 10 — shifts: campos de corte de caja al cierre
-- ============================================================================
-- Cuando el empleado cierra el turno, se snapshotean los totales calculados
-- desde order_payments del turno + el efectivo contado por el cajero (para
-- detectar diferencias). Tener los totales persistidos al cierre evita que un
-- pago tardío altere el corte histórico.
--
-- ended_at + closed_by_employee_id_v2 indican que el turno está cerrado.
-- ============================================================================

begin;

alter table public.shifts
  add column if not exists closed_at                timestamptz,
  add column if not exists closed_by_employee_id_v2 uuid references public.employees_v2(id) on delete set null,
  add column if not exists cash_expected_cents      integer,
  add column if not exists cash_counted_cents       integer,
  add column if not exists cash_difference_cents    integer,
  add column if not exists card_total_cents         integer,
  add column if not exists orders_count             integer,
  add column if not exists total_sold_cents         integer;

create index if not exists shifts_closed_at_idx on public.shifts(closed_at);

commit;

notify pgrst, 'reload schema';
