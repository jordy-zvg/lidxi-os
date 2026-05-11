-- =============================================================================
-- shifts: agregamos `type` y `auto_closed` para distinguir activaciones de POS
-- de fichajes normales (entrada/salida).
--
--   type = 'clock_in'        → fichaje de jornada del empleado
--   type = 'pos_activation'  → quien levantó la estación (manager/cashier);
--                              también cuenta como su entrada al turno
--
-- `auto_closed` marca shifts cerrados automáticamente al detectar que el
-- mismo empleado activó otra estación sin haber registrado salida.
--
-- El índice parcial acelera la query más frecuente del Clock: "¿hay shift
-- abierto del empleado X?".
-- =============================================================================

alter table public.shifts
  add column if not exists type text not null default 'clock_in'
    check (type in ('clock_in', 'pos_activation')),
  add column if not exists auto_closed boolean not null default false;

create index if not exists shifts_employee_open_idx
  on public.shifts(employee_id) where ended_at is null;
