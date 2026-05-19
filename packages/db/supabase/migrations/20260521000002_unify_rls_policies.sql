-- ============================================================================
-- Sprint 7.7 — Fase 2: RLS unificada al modelo multi-tenant
-- ============================================================================
-- Reemplaza policies legacy basadas en app.current_restaurant_id() /
-- app.current_branch_id() por policies basadas en user_tenants.tenant_id.
--
-- Cierra el cross-tenant leak (H23/H24): cualquier user con sesión Supabase
-- solo ve filas del tenant donde tiene membresía en user_tenants.
--
-- Service role bypassea para queries server-side autorizadas (cron, webhooks,
-- admin scripts). Storefront público lee menu_items con active=true sin auth.
--
-- Rollback strategy (manual):
--   Las policies legacy se pueden recrear desde
--   packages/db/supabase/migrations/20260511000003_rls_policies.sql.
-- ============================================================================

begin;

-- ============================================================================
-- restaurants
-- ============================================================================
drop policy if exists "restaurants_select_own"     on public.restaurants;
drop policy if exists "restaurants_update_manager" on public.restaurants;
drop policy if exists "restaurants_tenant_isolation" on public.restaurants;
drop policy if exists "restaurants_service_role"   on public.restaurants;

create policy "restaurants_tenant_isolation" on public.restaurants
  for all to authenticated
  using (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );

create policy "restaurants_service_role" on public.restaurants
  for all to service_role
  using (true) with check (true);

-- ============================================================================
-- branches (legacy)
-- ============================================================================
drop policy if exists "branches_select_own"        on public.branches;
drop policy if exists "branches_write_manager"     on public.branches;
drop policy if exists "branches_tenant_isolation"  on public.branches;
drop policy if exists "branches_service_role"      on public.branches;

create policy "branches_tenant_isolation" on public.branches
  for all to authenticated
  using (
    restaurant_id in (
      select r.id from public.restaurants r
      where r.tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
    )
  )
  with check (
    restaurant_id in (
      select r.id from public.restaurants r
      where r.tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
    )
  );

create policy "branches_service_role" on public.branches
  for all to service_role
  using (true) with check (true);

-- ============================================================================
-- menu_items
-- ============================================================================
drop policy if exists "menu_items_select"          on public.menu_items;
drop policy if exists "menu_items_write_manager"   on public.menu_items;
drop policy if exists "menu_items_tenant_isolation" on public.menu_items;
drop policy if exists "menu_items_service_role"    on public.menu_items;
drop policy if exists "menu_items_public_read"     on public.menu_items;

create policy "menu_items_tenant_isolation" on public.menu_items
  for all to authenticated
  using (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );

create policy "menu_items_service_role" on public.menu_items
  for all to service_role
  using (true) with check (true);

-- Storefront público: lectura de items activos sin auth (clientes finales).
-- Nota: columna real es `active` (no `available`).
create policy "menu_items_public_read" on public.menu_items
  for select to anon
  using (active = true);

-- ============================================================================
-- employees
-- ============================================================================
drop policy if exists "employees_select_branch"        on public.employees;
drop policy if exists "employees_write_manager"        on public.employees;
drop policy if exists "employees_tenant_isolation"     on public.employees;
drop policy if exists "employees_service_role"         on public.employees;

create policy "employees_tenant_isolation" on public.employees
  for all to authenticated
  using (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    tenant_id in (
      select tenant_id from public.user_tenants
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "employees_service_role" on public.employees
  for all to service_role
  using (true) with check (true);

-- ============================================================================
-- orders
-- ============================================================================
drop policy if exists "orders_select"               on public.orders;
drop policy if exists "orders_write_branch"         on public.orders;
drop policy if exists "orders_tenant_isolation"     on public.orders;
drop policy if exists "orders_service_role"         on public.orders;

create policy "orders_tenant_isolation" on public.orders
  for all to authenticated
  using (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );

create policy "orders_service_role" on public.orders
  for all to service_role
  using (true) with check (true);

commit;
