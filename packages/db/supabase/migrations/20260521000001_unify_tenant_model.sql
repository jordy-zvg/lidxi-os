-- ============================================================================
-- Sprint 7.7 — Fase 1: Unificación del modelo multi-tenant (schema)
-- ============================================================================
-- Intención:
--   Agregar tenant_id a tablas legacy (restaurants, menu_items, employees,
--   orders) para unirlas bajo el modelo multi-tenant. Las columnas legacy
--   (restaurant_id, branch_id) se preservan: cualquier query existente que
--   las consulte sigue funcionando.
--
-- Rollback strategy (manual):
--   begin;
--   alter table public.restaurants  drop column if exists tenant_id;
--   alter table public.menu_items   drop column if exists tenant_id;
--   alter table public.employees    drop column if exists tenant_id;
--   alter table public.orders       drop column if exists tenant_id;
--   delete from public.tenants where slug = 'miztli';
--   commit;
--
-- Atomicidad: BEGIN/COMMIT envuelven el script. Si una sentencia falla,
-- rollback automático y nada se aplica.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. restaurants.tenant_id
-- ----------------------------------------------------------------------------
alter table public.restaurants
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

create index if not exists restaurants_tenant_id_idx on public.restaurants(tenant_id);

-- ----------------------------------------------------------------------------
-- 2. Crear/asegurar tenant "Miztli Pardo" y ligarlo al restaurant existente.
-- ----------------------------------------------------------------------------
do $$
declare
  miztli_restaurant_id uuid;
  miztli_tenant_id uuid;
begin
  -- a) ¿Existe el restaurant Miztli? (single-tenant legacy seed)
  select id into miztli_restaurant_id
  from public.restaurants
  where slug = 'miztli' or name = 'Miztli Pardo'
  limit 1;

  if miztli_restaurant_id is null then
    raise notice 'Restaurant Miztli no encontrado — saltando data migration (entorno fresh, sin seed legacy)';
    return;
  end if;

  -- b) ¿Ya existe un tenant con slug 'miztli'? Idempotencia.
  select id into miztli_tenant_id from public.tenants where slug = 'miztli' limit 1;

  if miztli_tenant_id is null then
    insert into public.tenants (name, slug, plan, onboarding_completed, onboarding_step)
    values ('Miztli Pardo', 'miztli', 'crecimiento', true, 4)
    returning id into miztli_tenant_id;
    raise notice 'Tenant Miztli creado: %', miztli_tenant_id;
  else
    raise notice 'Tenant Miztli ya existía: %', miztli_tenant_id;
  end if;

  -- c) Ligar restaurant → tenant (idempotente).
  update public.restaurants
  set tenant_id = miztli_tenant_id
  where id = miztli_restaurant_id and tenant_id is distinct from miztli_tenant_id;

  raise notice 'Mapping: restaurant_id=% → tenant_id=%', miztli_restaurant_id, miztli_tenant_id;
end $$;

-- ----------------------------------------------------------------------------
-- 3. menu_items.tenant_id (derivar de restaurant.tenant_id)
-- ----------------------------------------------------------------------------
alter table public.menu_items
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

update public.menu_items mi
set tenant_id = r.tenant_id
from public.restaurants r
where mi.restaurant_id = r.id
  and mi.tenant_id is null
  and r.tenant_id is not null;

create index if not exists menu_items_tenant_id_idx on public.menu_items(tenant_id);

-- ----------------------------------------------------------------------------
-- 4. employees.tenant_id (derivar via branch → restaurant → tenant)
-- ----------------------------------------------------------------------------
alter table public.employees
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

update public.employees e
set tenant_id = r.tenant_id
from public.branches b
join public.restaurants r on r.id = b.restaurant_id
where e.branch_id = b.id
  and e.tenant_id is null
  and r.tenant_id is not null;

create index if not exists employees_tenant_id_idx on public.employees(tenant_id);

-- ----------------------------------------------------------------------------
-- 5. orders.tenant_id (mismo path que employees)
-- ----------------------------------------------------------------------------
alter table public.orders
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

update public.orders o
set tenant_id = r.tenant_id
from public.branches b
join public.restaurants r on r.id = b.restaurant_id
where o.branch_id = b.id
  and o.tenant_id is null
  and r.tenant_id is not null;

create index if not exists orders_tenant_id_idx on public.orders(tenant_id);

-- ----------------------------------------------------------------------------
-- 6. Verificación de integridad — orphans con restaurant/branch pero sin tenant
-- ----------------------------------------------------------------------------
do $$
declare
  orphans integer;
begin
  select count(*) into orphans from public.menu_items
    where tenant_id is null and restaurant_id is not null;
  if orphans > 0 then
    raise warning 'menu_items con restaurant_id pero sin tenant_id: %', orphans;
  end if;

  select count(*) into orphans from public.employees
    where tenant_id is null and branch_id is not null;
  if orphans > 0 then
    raise warning 'employees con branch_id pero sin tenant_id: %', orphans;
  end if;

  select count(*) into orphans from public.orders
    where tenant_id is null and branch_id is not null;
  if orphans > 0 then
    raise warning 'orders con branch_id pero sin tenant_id: %', orphans;
  end if;
end $$;

commit;
