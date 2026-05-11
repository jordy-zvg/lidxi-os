-- =============================================================================
-- Row-Level Security.
--
-- Regla general:
--   * Empleado ve datos de SU branch.
--   * Manager ve datos de TODO su restaurant (todos los branches).
--   * El service role (usado por jobs internos y migrations) bypassa RLS
--     automáticamente — no requiere policies explícitas.
-- =============================================================================

-- Activamos RLS en todas las tablas del schema public.
alter table public.restaurants         enable row level security;
alter table public.branches            enable row level security;
alter table public.employees           enable row level security;
alter table public.shifts              enable row level security;
alter table public.menu_items          enable row level security;
alter table public.menu_channel_prices enable row level security;
alter table public.inventory_items     enable row level security;
alter table public.recipes             enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.couriers            enable row level security;
alter table public.dispatches          enable row level security;
alter table public.printers            enable row level security;
alter table public.print_jobs          enable row level security;
alter table public.automation_rules    enable row level security;

-- ---------------------------------------------------------------------------
-- restaurants — empleados leen su restaurant; solo manager edita.
-- ---------------------------------------------------------------------------
create policy "restaurants_select_own" on public.restaurants
  for select to authenticated
  using (id = app.current_restaurant_id());

create policy "restaurants_update_manager" on public.restaurants
  for update to authenticated
  using (id = app.current_restaurant_id() and app.is_manager());

-- ---------------------------------------------------------------------------
-- branches — empleado ve su branch; manager ve todos los de su restaurant.
-- ---------------------------------------------------------------------------
create policy "branches_select_own" on public.branches
  for select to authenticated
  using (
    id = app.current_branch_id()
    or (app.is_manager() and restaurant_id = app.current_restaurant_id())
  );

create policy "branches_write_manager" on public.branches
  for all to authenticated
  using (app.is_manager() and restaurant_id = app.current_restaurant_id())
  with check (app.is_manager() and restaurant_id = app.current_restaurant_id());

-- ---------------------------------------------------------------------------
-- employees — empleado ve su branch; manager edita su restaurant.
-- ---------------------------------------------------------------------------
create policy "employees_select_branch" on public.employees
  for select to authenticated
  using (
    branch_id = app.current_branch_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

create policy "employees_write_manager" on public.employees
  for all to authenticated
  using (
    app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    )
  )
  with check (
    app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    )
  );

-- ---------------------------------------------------------------------------
-- shifts — empleado ve los suyos; manager ve los de su branch.
-- ---------------------------------------------------------------------------
create policy "shifts_select" on public.shifts
  for select to authenticated
  using (
    employee_id = app.current_employee_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

create policy "shifts_insert_self" on public.shifts
  for insert to authenticated
  with check (employee_id = app.current_employee_id());

create policy "shifts_update_self_or_manager" on public.shifts
  for update to authenticated
  using (
    employee_id = app.current_employee_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

-- ---------------------------------------------------------------------------
-- menu_items y menu_channel_prices — alcance por restaurant.
-- ---------------------------------------------------------------------------
create policy "menu_items_select" on public.menu_items
  for select to authenticated
  using (restaurant_id = app.current_restaurant_id());

create policy "menu_items_write_manager" on public.menu_items
  for all to authenticated
  using (app.is_manager() and restaurant_id = app.current_restaurant_id())
  with check (app.is_manager() and restaurant_id = app.current_restaurant_id());

create policy "menu_channel_prices_select" on public.menu_channel_prices
  for select to authenticated
  using (
    menu_item_id in (
      select id from public.menu_items where restaurant_id = app.current_restaurant_id()
    )
  );

create policy "menu_channel_prices_write_manager" on public.menu_channel_prices
  for all to authenticated
  using (
    app.is_manager() and menu_item_id in (
      select id from public.menu_items where restaurant_id = app.current_restaurant_id()
    )
  )
  with check (
    app.is_manager() and menu_item_id in (
      select id from public.menu_items where restaurant_id = app.current_restaurant_id()
    )
  );

-- ---------------------------------------------------------------------------
-- inventory + recipes — alcance por branch / restaurant.
-- ---------------------------------------------------------------------------
create policy "inventory_select_branch" on public.inventory_items
  for select to authenticated
  using (
    branch_id = app.current_branch_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

create policy "inventory_write_branch" on public.inventory_items
  for all to authenticated
  using (branch_id = app.current_branch_id() or app.is_manager())
  with check (branch_id = app.current_branch_id() or app.is_manager());

create policy "recipes_select" on public.recipes
  for select to authenticated
  using (
    menu_item_id in (
      select id from public.menu_items where restaurant_id = app.current_restaurant_id()
    )
  );

create policy "recipes_write_manager" on public.recipes
  for all to authenticated
  using (app.is_manager())
  with check (app.is_manager());

-- ---------------------------------------------------------------------------
-- orders y order_items — alcance por branch; manager ve todo el restaurant.
-- ---------------------------------------------------------------------------
create policy "orders_select" on public.orders
  for select to authenticated
  using (
    branch_id = app.current_branch_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

create policy "orders_write_branch" on public.orders
  for all to authenticated
  using (branch_id = app.current_branch_id() or app.is_manager())
  with check (branch_id = app.current_branch_id() or app.is_manager());

create policy "order_items_select" on public.order_items
  for select to authenticated
  using (
    order_id in (select id from public.orders)  -- pasa por la policy de orders
  );

create policy "order_items_write" on public.order_items
  for all to authenticated
  using (order_id in (select id from public.orders))
  with check (order_id in (select id from public.orders));

-- ---------------------------------------------------------------------------
-- couriers y dispatches.
-- ---------------------------------------------------------------------------
create policy "couriers_select_all_auth" on public.couriers
  for select to authenticated
  using (true);

create policy "couriers_write_manager" on public.couriers
  for all to authenticated
  using (app.is_manager())
  with check (app.is_manager());

create policy "dispatches_select" on public.dispatches
  for select to authenticated
  using (order_id in (select id from public.orders));

create policy "dispatches_write" on public.dispatches
  for all to authenticated
  using (order_id in (select id from public.orders))
  with check (order_id in (select id from public.orders));

-- ---------------------------------------------------------------------------
-- printers y print_jobs.
-- ---------------------------------------------------------------------------
create policy "printers_select_branch" on public.printers
  for select to authenticated
  using (
    branch_id = app.current_branch_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

create policy "printers_write_manager" on public.printers
  for all to authenticated
  using (app.is_manager())
  with check (app.is_manager());

create policy "print_jobs_select" on public.print_jobs
  for select to authenticated
  using (printer_id in (select id from public.printers));

create policy "print_jobs_write" on public.print_jobs
  for all to authenticated
  using (printer_id in (select id from public.printers))
  with check (printer_id in (select id from public.printers));

-- ---------------------------------------------------------------------------
-- automation_rules — solo manager.
-- ---------------------------------------------------------------------------
create policy "automation_rules_select_branch" on public.automation_rules
  for select to authenticated
  using (
    branch_id = app.current_branch_id()
    or (app.is_manager() and branch_id in (
      select id from public.branches where restaurant_id = app.current_restaurant_id()
    ))
  );

create policy "automation_rules_write_manager" on public.automation_rules
  for all to authenticated
  using (app.is_manager())
  with check (app.is_manager());
