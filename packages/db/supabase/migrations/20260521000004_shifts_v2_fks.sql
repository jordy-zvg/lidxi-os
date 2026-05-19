-- ============================================================================
-- Sprint 7.8 — shifts: FK columns para employees_v2 / branches_v2
-- ============================================================================
-- Estrategia de transición dual-write:
--   • shifts.employee_id  / branch_id  → legacy (employees / branches)
--   • shifts.employee_id_v2 / branch_id_v2 → v2 (employees_v2 / branches_v2)
--
-- Código nuevo escribe solo en _v2 con legacies en NULL.
-- Código legacy (ClockOverlay, lookupForClock) sigue funcionando sin cambios.
-- Sprint 8-9: consolidar a _v2 como canónicas y eliminar las legacy.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Hacer las FK legacy nullable para admitir filas sin employee legacy
-- ----------------------------------------------------------------------------
alter table public.shifts
  alter column employee_id drop not null,
  alter column branch_id   drop not null;

-- ----------------------------------------------------------------------------
-- 2. Agregar columnas _v2 (idempotentes)
-- ----------------------------------------------------------------------------
alter table public.shifts
  add column if not exists employee_id_v2 uuid
    references public.employees_v2(id) on delete set null,
  add column if not exists branch_id_v2 uuid
    references public.branches_v2(id)  on delete set null;

create index if not exists shifts_employee_id_v2_idx  on public.shifts(employee_id_v2);
create index if not exists shifts_employee_v2_open_idx on public.shifts(employee_id_v2)
  where ended_at is null;

-- ----------------------------------------------------------------------------
-- 3. Migrar shifts existentes de Miztli a employee_id_v2
--    La migration 20260521000003 usó ON CONFLICT (id) DO NOTHING con e.id →
--    las filas Miztli en employees_v2 tienen el mismo UUID que en employees.
-- ----------------------------------------------------------------------------
update public.shifts s
set employee_id_v2 = ev.id
from public.employees_v2 ev
where s.employee_id is not null
  and ev.id = s.employee_id
  and s.employee_id_v2 is null;

-- Log para verificación post-apply
do $$
declare
  migrated  bigint;
  total     bigint;
  v2_only   bigint;
begin
  select count(*) into migrated from public.shifts where employee_id_v2 is not null;
  select count(*) into total    from public.shifts;
  select count(*) into v2_only  from public.shifts
    where employee_id is null and employee_id_v2 is not null;

  raise notice 'shifts total: % | con employee_id_v2: % | solo-v2 (legacy NULL): %',
    total, migrated, v2_only;
end $$;

-- ----------------------------------------------------------------------------
-- 4. Invariante de integridad: al menos uno de los dos employee FKs debe ser
--    no-null en cada fila. Previene inserciones huérfanas.
-- ----------------------------------------------------------------------------
alter table public.shifts
  drop constraint if exists shifts_employee_check;

alter table public.shifts
  add constraint shifts_employee_check
  check (employee_id is not null or employee_id_v2 is not null);

commit;

-- Notificar a PostgREST para refrescar el schema cache
notify pgrst, 'reload schema';
