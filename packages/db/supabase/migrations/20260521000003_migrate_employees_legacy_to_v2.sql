-- ============================================================================
-- Sprint 7.7 cierre — Fase 3: migrar employees legacy a employees_v2
-- ============================================================================
-- Objetivos:
--   1. Corregir employees_v2.role CHECK: de español a inglés (alinear con
--      @kobi/shared Role y ACTIVATABLE_ROLES del POS).
--   2. Migrar las 4 filas legacy de Miztli a employees_v2 con los hashes
--      bcrypt existentes (no re-hashear). Idempotente: ON CONFLICT DO NOTHING.
--   3. employees legacy permanece intacta como histórica (no DELETE).
--
-- Column mapping legacy → v2:
--   full_name → name
--   role      → role  (ya son valores inglés en legacy: manager/cashier/cook/courier)
--   pin_hash  → pin_hash (bcrypt, compatible)
--   active    → status: true→'activo', false→'pausado'
--   branch_id → NULL (branch_id legacy referencia branches, no branches_v2;
--               tenant_id es el scope canónico en v2)
--   tenant_id → 'eefd730e-52f4-4171-b702-231fb28616d4' (Miztli Pardo)
--
-- Rollback manual:
--   DELETE FROM public.employees_v2
--     WHERE id IN (SELECT id FROM public.employees);
--   ALTER TABLE public.employees_v2
--     DROP CONSTRAINT employees_v2_role_check;
--   ALTER TABLE public.employees_v2
--     ADD CONSTRAINT employees_v2_role_check
--     CHECK (role IN ('Admin operativo','Cajero','Cocinero','Runner'));
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Corregir role CHECK: español → inglés
-- ----------------------------------------------------------------------------
alter table public.employees_v2
  drop constraint if exists employees_v2_role_check;

alter table public.employees_v2
  add constraint employees_v2_role_check
  check (role in ('manager', 'cashier', 'cook', 'courier'));

-- ----------------------------------------------------------------------------
-- 2. Migrar 4 filas legacy → employees_v2 (idempotente)
-- ----------------------------------------------------------------------------
insert into public.employees_v2 (id, tenant_id, branch_id, name, role, pin_hash, status)
select
  e.id,
  'eefd730e-52f4-4171-b702-231fb28616d4'::uuid  as tenant_id,
  null                                           as branch_id,  -- no branches_v2 entry for Miztli yet
  e.full_name                                    as name,
  e.role,
  e.pin_hash,
  case when e.active then 'activo' else 'pausado' end as status
from public.employees e
where e.tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4'
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 3. Verificación
-- ----------------------------------------------------------------------------
do $$
declare
  v2_miztli bigint;
  legacy    bigint;
begin
  select count(*) into v2_miztli from public.employees_v2
    where tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4';
  select count(*) into legacy from public.employees
    where tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4';

  raise notice 'employees_v2 Miztli: %  |  employees legacy: %', v2_miztli, legacy;

  if v2_miztli < legacy then
    raise exception 'Migration incompleta: employees_v2 tiene % filas pero legacy tiene %',
      v2_miztli, legacy;
  end if;
end $$;

commit;
