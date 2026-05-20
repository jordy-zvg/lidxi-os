-- ============================================================================
-- Sprint 7.9.1 — Ligar menu_items huérfanos (tenant_id NULL) al tenant del
-- restaurant que ya apuntan. Idempotente, seguro de re-ejecutar.
--
-- Cuándo se ejecuta: en cualquier reset/migration sequence. Para data fresh
-- de seed (que ya inserta menu_items SIN tenant_id), esto los ata al tenant
-- vía restaurant.tenant_id. Para data ya migrada, no toca filas con tenant.
-- ============================================================================

begin;

update public.menu_items mi
set tenant_id = r.tenant_id
from public.restaurants r
where mi.restaurant_id = r.id
  and mi.tenant_id is null
  and r.tenant_id is not null;

do $$
declare
  linked    bigint;
  remaining bigint;
begin
  select count(*) into linked    from public.menu_items where tenant_id is not null;
  select count(*) into remaining from public.menu_items where tenant_id is null;
  raise notice 'menu_items con tenant_id: % | sin tenant_id (huérfanos remanentes): %', linked, remaining;
end $$;

commit;

notify pgrst, 'reload schema';
