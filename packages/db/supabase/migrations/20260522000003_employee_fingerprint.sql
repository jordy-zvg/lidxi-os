-- ============================================================================
-- Sprint 9 — employees_v2: flags de huella biométrica
-- ============================================================================
-- Placeholder para integración futura de hardware biométrico real (lector de
-- huella en el POS / dispositivos dedicados). Por ahora son flags que se
-- setean desde la UI al "enrolar" (simulación visual) un empleado.
--
-- Cuando llegue el hardware:
--   - Reemplazar la simulación por SDK del dispositivo.
--   - Persistir el template biométrico (probablemente en otra tabla con
--     storage encriptado, NUNCA en columnas json).
--   - Mantener fingerprint_enrolled como flag derivado del estado real.
-- ============================================================================

begin;

alter table public.employees_v2
  add column if not exists fingerprint_enrolled boolean not null default false,
  add column if not exists fingerprint_enrolled_at timestamptz;

comment on column public.employees_v2.fingerprint_enrolled is
  'Flag de placeholder: indica si el empleado completó el "enrolamiento" simulado de huella. En Sprint 9 es solo visual; cuando se conecte hardware real este flag se derivará del estado del SDK.';

commit;

notify pgrst, 'reload schema';
