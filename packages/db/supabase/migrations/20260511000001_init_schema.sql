-- =============================================================================
-- LidxiOS — esquema inicial
--
-- Convenciones:
--   * IDs uuid generados por defecto con gen_random_uuid().
--   * Todo monto en cents (integer) — la moneda vive en `restaurants.currency`.
--   * Estados, canales y roles como TEXT + CHECK constraint. Mantenemos en
--     sync con los enums de @lidxi/shared. Preferimos CHECK sobre ENUM nativo
--     de Postgres para no pelearnos con ALTER TYPE en producción.
--   * created_at/updated_at en timestamptz UTC; conversión a TZ del branch en
--     capa de aplicación.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Namespace propio para funciones helper (no chocar con `public`).
create schema if not exists app;

-- ---------------------------------------------------------------------------
-- 1. restaurants
-- ---------------------------------------------------------------------------
create table public.restaurants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  brand_color   text,
  address       text,
  timezone      text not null default 'America/Mexico_City',
  currency      text not null default 'MXN' check (char_length(currency) = 3),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. branches
-- ---------------------------------------------------------------------------
create table public.branches (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name          text not null,
  address       text,
  lat           numeric(9, 6),
  lng           numeric(9, 6),
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index branches_restaurant_id_idx on public.branches(restaurant_id);

-- ---------------------------------------------------------------------------
-- 3. employees
-- ---------------------------------------------------------------------------
create table public.employees (
  id                   uuid primary key default gen_random_uuid(),
  branch_id            uuid not null references public.branches(id) on delete cascade,
  full_name            text not null,
  role                 text not null check (role in ('manager', 'cashier', 'cook', 'courier')),
  pin_hash             text not null,
  fingerprint_template text,                                  -- bytea sería más correcto; lo dejamos en text para que el lector decida formato.
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index employees_branch_id_idx on public.employees(branch_id);
create index employees_role_idx on public.employees(role);

-- ---------------------------------------------------------------------------
-- 4. shifts
-- ---------------------------------------------------------------------------
create table public.shifts (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references public.employees(id) on delete cascade,
  branch_id      uuid not null references public.branches(id) on delete cascade,
  started_at     timestamptz not null default now(),
  ended_at       timestamptz,
  break_minutes  integer not null default 0 check (break_minutes >= 0),
  created_at     timestamptz not null default now()
);
create index shifts_employee_id_idx on public.shifts(employee_id);
create index shifts_branch_started_idx on public.shifts(branch_id, started_at desc);

-- ---------------------------------------------------------------------------
-- 5. menu_items
-- ---------------------------------------------------------------------------
create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category      text not null,
  name          text not null,
  description   text,
  photo_url     text,
  base_price    integer not null check (base_price >= 0),   -- cents
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index menu_items_restaurant_id_idx on public.menu_items(restaurant_id);
create index menu_items_category_idx on public.menu_items(category);

-- ---------------------------------------------------------------------------
-- 6. menu_channel_prices
-- ---------------------------------------------------------------------------
create table public.menu_channel_prices (
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  channel      text not null check (channel in ('direct', 'eats', 'rappi', 'didi')),
  price        integer not null check (price >= 0),  -- cents; null en este nivel = usar base_price
  primary key (menu_item_id, channel)
);

-- ---------------------------------------------------------------------------
-- 7. inventory_items
-- ---------------------------------------------------------------------------
create table public.inventory_items (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references public.branches(id) on delete cascade,
  sku            text not null,
  name           text not null,
  unit           text not null,   -- kg, g, l, ml, pz, etc.
  current_stock  numeric(12, 3) not null default 0,
  min_stock      numeric(12, 3) not null default 0,
  cost_per_unit  integer not null default 0 check (cost_per_unit >= 0),  -- cents
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (branch_id, sku)
);
create index inventory_items_branch_id_idx on public.inventory_items(branch_id);

-- ---------------------------------------------------------------------------
-- 8. recipes (BOM: receta = lista de inventory_items consumidos por menu_item)
-- ---------------------------------------------------------------------------
create table public.recipes (
  menu_item_id      uuid not null references public.menu_items(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity          numeric(12, 3) not null check (quantity > 0),
  primary key (menu_item_id, inventory_item_id)
);

-- ---------------------------------------------------------------------------
-- 9. orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  branch_id        uuid not null references public.branches(id) on delete restrict,
  channel          text not null check (channel in ('direct', 'eats', 'rappi', 'didi', 'mostrador')),
  external_id      text,
  status           text not null default 'received'
                   check (status in ('received', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled')),
  customer_name    text,
  customer_phone   text,
  customer_address text,
  customer_lat     numeric(9, 6),
  customer_lng     numeric(9, 6),
  subtotal         integer not null check (subtotal >= 0),
  tax              integer not null default 0 check (tax >= 0),
  delivery_fee     integer not null default 0 check (delivery_fee >= 0),
  total            integer not null check (total >= 0),
  payment_method   text,           -- cash, card, online, marketplace
  payment_ref      text,
  sla_deadline     timestamptz,
  created_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  ready_at         timestamptz,
  dispatched_at    timestamptz,
  delivered_at     timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  unique (channel, external_id)
);
create index orders_branch_status_idx on public.orders(branch_id, status);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_channel_idx on public.orders(channel);

-- ---------------------------------------------------------------------------
-- 10. order_items
-- ---------------------------------------------------------------------------
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  qty          integer not null check (qty > 0),
  unit_price   integer not null check (unit_price >= 0),  -- cents, ya con canal aplicado
  modifiers    jsonb not null default '[]'::jsonb,
  notes        text,
  created_at   timestamptz not null default now()
);
create index order_items_order_id_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------------
-- 11. couriers
-- ---------------------------------------------------------------------------
create table public.couriers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('uber_direct', 'eats', 'rappi', 'didi', 'internal')),
  phone       text,
  vehicle     text,
  external_id text,                                       -- id en el provider externo
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 12. dispatches (asignación de pedido a repartidor)
-- ---------------------------------------------------------------------------
create table public.dispatches (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  courier_id      uuid references public.couriers(id) on delete set null,
  provider        text not null check (provider in ('uber_direct', 'eats', 'rappi', 'didi', 'internal')),
  quote_amount    integer check (quote_amount >= 0),     -- cents
  eta_minutes     integer check (eta_minutes >= 0),
  tracking_url    text,
  proof_photo_url text,
  created_at      timestamptz not null default now(),
  picked_up_at    timestamptz,
  delivered_at    timestamptz
);
create index dispatches_order_id_idx on public.dispatches(order_id);

-- ---------------------------------------------------------------------------
-- 13. printers
-- ---------------------------------------------------------------------------
create table public.printers (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references public.branches(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('kitchen', 'label', 'cashier')),
  connection  text not null check (connection in ('lan', 'usb', 'wifi')),
  address     text,                                       -- IP, USB path, etc.
  status      text not null default 'unknown' check (status in ('online', 'offline', 'error', 'unknown')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index printers_branch_id_idx on public.printers(branch_id);

-- ---------------------------------------------------------------------------
-- 14. print_jobs
-- ---------------------------------------------------------------------------
create table public.print_jobs (
  id          uuid primary key default gen_random_uuid(),
  printer_id  uuid not null references public.printers(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete cascade,
  template    text not null check (template in ('kitchen-ticket', 'packing-label', 'customer-receipt', 'shift-closeout')),
  status      text not null default 'pending' check (status in ('pending', 'printed', 'failed')),
  error       text,
  created_at  timestamptz not null default now(),
  printed_at  timestamptz
);
create index print_jobs_printer_id_idx on public.print_jobs(printer_id);
create index print_jobs_status_idx on public.print_jobs(status);

-- ---------------------------------------------------------------------------
-- 15. automation_rules
-- ---------------------------------------------------------------------------
create table public.automation_rules (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references public.branches(id) on delete cascade,
  name        text not null,
  trigger     text not null,           -- 'order.created', 'order.ready', 'inventory.below_min', ...
  conditions  jsonb not null default '{}'::jsonb,
  actions     jsonb not null default '[]'::jsonb,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index automation_rules_branch_id_idx on public.automation_rules(branch_id);

-- ---------------------------------------------------------------------------
-- trigger genérico para updated_at
-- ---------------------------------------------------------------------------
create or replace function app.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'restaurants', 'branches', 'employees', 'menu_items',
      'inventory_items', 'printers', 'automation_rules'
    ])
  loop
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I
       for each row execute function app.touch_updated_at()',
      t, t
    );
  end loop;
end$$;
