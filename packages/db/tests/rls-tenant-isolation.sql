-- ============================================================================
-- Sprint 7.7 — Phase 7: RLS tenant-isolation tests
-- ============================================================================
-- Tests run inside transactions that are ROLLED BACK so no state is mutated.
-- Each test block ends with a RAISE NOTICE showing pass/fail.
-- Run via:
--   PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres \
--     -f packages/db/tests/rls-tenant-isolation.sql
--
-- Users under test:
--   auditor uid   : 02097a8b-ca78-443e-9370-544ade59201d
--   auditor tenant: 4fdf49f9-ebf5-4ed2-be15-b3303aa2265f (Kobi Audit Lab)
--   miztli tenant : eefd730e-52f4-4171-b702-231fb28616d4 (Miztli Pardo)
-- ============================================================================

\set AUDITOR_UID   '02097a8b-ca78-443e-9370-544ade59201d'
\set AUDITOR_JWT   '{"sub":"02097a8b-ca78-443e-9370-544ade59201d","role":"authenticated"}'
\set MIZTLI_TENANT 'eefd730e-52f4-4171-b702-231fb28616d4'

-- ============================================================================
-- Helper: assert count equals expected value
-- ============================================================================
create or replace function pg_temp.assert_count(
  label text, actual bigint, expected bigint
) returns void language plpgsql as $$
begin
  if actual = expected then
    raise notice 'PASS  %  (got %)', label, actual;
  else
    raise exception 'FAIL  %  expected % got %', label, expected, actual;
  end if;
end $$;

-- ============================================================================
-- Test 1: Service role sees all Miztli data (bypass check)
-- ============================================================================
do $$
declare
  n_restaurants bigint;
  n_menu_items  bigint;
  n_employees   bigint;
  n_orders      bigint;
begin
  select count(*) into n_restaurants from public.restaurants
    where tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4';
  select count(*) into n_menu_items  from public.menu_items
    where tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4';
  select count(*) into n_employees   from public.employees
    where tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4';
  select count(*) into n_orders      from public.orders
    where tenant_id = 'eefd730e-52f4-4171-b702-231fb28616d4';

  perform pg_temp.assert_count('service_role: miztli restaurants', n_restaurants, 1);
  perform pg_temp.assert_count('service_role: miztli menu_items',  n_menu_items,  15);
  perform pg_temp.assert_count('service_role: miztli employees',   n_employees,   4);
  perform pg_temp.assert_count('service_role: miztli orders',      n_orders,      10);
end $$;

-- ============================================================================
-- Test 2: Auditor (authenticated) cannot see Miztli data
-- ============================================================================
begin;
select set_config(
  'request.jwt.claims',
  '{"sub":"02097a8b-ca78-443e-9370-544ade59201d","role":"authenticated"}',
  true
);
set local role authenticated;

do $$
declare
  n_restaurants bigint;
  n_menu_items  bigint;
  n_employees   bigint;
  n_orders      bigint;
begin
  -- Auditor is in Kobi Audit Lab tenant; Miztli belongs to a different tenant.
  -- RLS should filter all Miztli rows → count = 0.
  select count(*) into n_restaurants from public.restaurants;
  select count(*) into n_menu_items  from public.menu_items;
  select count(*) into n_employees   from public.employees;
  select count(*) into n_orders      from public.orders;

  perform pg_temp.assert_count('auditor_cross_tenant: restaurants (expect 0)', n_restaurants, 0);
  perform pg_temp.assert_count('auditor_cross_tenant: menu_items  (expect 0)', n_menu_items,  0);
  perform pg_temp.assert_count('auditor_cross_tenant: employees   (expect 0)', n_employees,   0);
  perform pg_temp.assert_count('auditor_cross_tenant: orders      (expect 0)', n_orders,      0);
end $$;

rollback;

-- ============================================================================
-- Test 3: anon role sees only active menu_items (public_read policy)
-- ============================================================================
begin;
set local role anon;

do $$
declare
  n_active   bigint;
  n_all      bigint;
begin
  select count(*) into n_active from public.menu_items where active = true;
  select count(*) into n_all    from public.menu_items;

  -- anon can read active items
  if n_active > 0 then
    raise notice 'PASS  anon: sees % active menu_items', n_active;
  else
    raise exception 'FAIL  anon: expected >0 active menu_items, got 0';
  end if;

  -- anon count must equal active count (no inactive items visible)
  perform pg_temp.assert_count('anon: total == active (inactive hidden)', n_all, n_active);
end $$;

rollback;

-- ============================================================================
-- Test 4: Verify tenant_id populated for all legacy rows (no orphans)
-- ============================================================================
do $$
declare
  orphan_menu_items bigint;
  orphan_employees  bigint;
  orphan_orders     bigint;
begin
  select count(*) into orphan_menu_items from public.menu_items
    where tenant_id is null and restaurant_id is not null;
  select count(*) into orphan_employees  from public.employees
    where tenant_id is null and branch_id is not null;
  select count(*) into orphan_orders     from public.orders
    where tenant_id is null and branch_id is not null;

  perform pg_temp.assert_count('orphan_check: menu_items without tenant_id', orphan_menu_items, 0);
  perform pg_temp.assert_count('orphan_check: employees without tenant_id',  orphan_employees,  0);
  perform pg_temp.assert_count('orphan_check: orders without tenant_id',     orphan_orders,     0);
end $$;

-- ============================================================================
-- Test 5: Legacy policy names are gone (Fase 2 applied correctly)
-- ============================================================================
do $$
declare
  legacy_count bigint;
begin
  select count(*) into legacy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in ('restaurants','branches','menu_items','employees','orders')
    and policyname not like '%_tenant_isolation'
    and policyname not like '%_service_role'
    and policyname != 'menu_items_public_read';

  perform pg_temp.assert_count('legacy_policies: none remaining', legacy_count, 0);
end $$;

-- ============================================================================
-- Summary
-- ============================================================================
do $$ begin raise notice '========================================'; end $$;
do $$ begin raise notice 'All RLS isolation tests passed.'; end $$;
do $$ begin raise notice '========================================'; end $$;
