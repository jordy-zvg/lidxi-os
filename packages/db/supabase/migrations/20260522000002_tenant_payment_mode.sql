-- ============================================================================
-- Sprint 8 — tenants.payment_mode (toggle test vs production)
-- ============================================================================
-- Cada tenant decide en qué modo opera sus pagos: 'test' (credenciales de
-- prueba de MP) o 'production' (credenciales reales). El runtime lee este
-- campo en cada create-preference para elegir token.
--
-- Default 'test': cualquier tenant nuevo nace en sandbox; debe activar
-- producción manualmente desde Admin → Integraciones → Pagos.
-- ============================================================================

begin;

alter table public.tenants
  add column if not exists payment_mode text not null default 'test';

alter table public.tenants
  drop constraint if exists tenants_payment_mode_check;

alter table public.tenants
  add constraint tenants_payment_mode_check
    check (payment_mode in ('test', 'production'));

commit;

notify pgrst, 'reload schema';
