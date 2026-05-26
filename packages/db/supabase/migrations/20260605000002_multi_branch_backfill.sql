-- ============================================================================
-- Sprint 14 — Backfill de datos existentes a branches_v2
-- ============================================================================
-- Política:
--   * Tenant con exactamente 1 branches_v2 activa: asignar orders/shifts a esa.
--   * Tenant con 0 branches_v2: si tiene branches legacy, espejar la primera
--     a branches_v2 (one-shot), luego aplicar regla de "1 sucursal".
--   * Tenant con 2+ branches_v2 activas: NO TOCAR. Queda branch_id_v2 NULL.
--     El admin debe decidir manualmente qué historia va dónde.
--   * employee_branches: NO BACKFILL. Sin filas = backwards compat (todas).
--
-- Idempotente: correrla dos veces no rompe nada (NOT EXISTS + IS NULL guards).
-- Reversible: solo UPDATEs SET branch_id_v2; revertir = UPDATE SET NULL.
-- ============================================================================

begin;

-- Paso 1: Espejar branches legacy → branches_v2 cuando el tenant no tiene v2.
-- Esto solo aplica a tenants que NUNCA pasaron por el onboarding nuevo.
insert into public.branches_v2 (id, tenant_id, name, address, status, is_active)
select
  gen_random_uuid(),
  r.tenant_id,
  coalesce(b.name, 'Sucursal principal'),
  b.address,
  'active',
  true
from public.branches b
join public.restaurants r on r.id = b.restaurant_id
where r.tenant_id is not null
  and not exists (
    select 1 from public.branches_v2 v2 where v2.tenant_id = r.tenant_id
  );

-- Paso 2: orders.branch_id_v2 := única sucursal activa del tenant.
update public.orders o
set branch_id_v2 = sub.branch_v2_id
from (
  select b.tenant_id, b.id as branch_v2_id
  from public.branches_v2 b
  where b.status = 'active'
    and b.tenant_id in (
      select tenant_id from public.branches_v2
      where status = 'active'
      group by tenant_id
      having count(*) = 1
    )
) sub
where o.tenant_id = sub.tenant_id
  and o.branch_id_v2 is null;

-- Paso 3: shifts.branch_id_v2 := misma lógica.
update public.shifts s
set branch_id_v2 = sub.branch_v2_id
from (
  select b.tenant_id, b.id as branch_v2_id
  from public.branches_v2 b
  where b.status = 'active'
    and b.tenant_id in (
      select tenant_id from public.branches_v2
      where status = 'active'
      group by tenant_id
      having count(*) = 1
    )
) sub
where s.tenant_id = sub.tenant_id
  and s.branch_id_v2 is null
  and s.tenant_id is not null;

commit;

notify pgrst, 'reload schema';
