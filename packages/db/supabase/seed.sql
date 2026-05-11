-- =============================================================================
-- Seed: Miztli Pardo (Roma Norte, CDMX).
--
-- Datos demo para tener algo con qué arrancar el OMS en local. Los IDs los
-- generamos con UUIDs fijos para que sea fácil referenciarlos en tests y
-- mocks. PINs hashbeados con bcrypt vía pgcrypto (crypt + bf).
--
-- Empleados demo (PIN entre paréntesis):
--   1234  → manager (Jorge)
--   2222  → cashier (Diana)
--   3333  → cook    (Marco)
--   4444  → cook    (Ramón)
-- =============================================================================

insert into public.restaurants (id, name, slug, brand_color, address, timezone, currency)
values (
  '00000000-0000-0000-0000-00000000a001',
  'Miztli Pardo',
  'miztli',
  '#E11D2E',
  'Av. Insurgentes Sur 100, Roma Norte, Cuauhtémoc, 06700 CDMX',
  'America/Mexico_City',
  'MXN'
);

insert into public.branches (id, restaurant_id, name, address, lat, lng, phone)
values (
  '00000000-0000-0000-0000-00000000b001',
  '00000000-0000-0000-0000-00000000a001',
  'Juriquilla',
  'Anillo Vial Junípero Serra 100, Juriquilla, 76230 Querétaro',
  20.703500, -100.435000,
  '+52 442 123 4567'
);

-- --- Employees ---
insert into public.employees (id, branch_id, full_name, role, pin_hash, active) values
  ('00000000-0000-0000-0000-00000000e001', '00000000-0000-0000-0000-00000000b001',
    'Jorge Vargas', 'manager', crypt('1234', gen_salt('bf')), true),
  ('00000000-0000-0000-0000-00000000e002', '00000000-0000-0000-0000-00000000b001',
    'Diana Rivera', 'cashier', crypt('2222', gen_salt('bf')), true),
  ('00000000-0000-0000-0000-00000000e003', '00000000-0000-0000-0000-00000000b001',
    'Marco Pérez',  'cook',    crypt('3333', gen_salt('bf')), true),
  ('00000000-0000-0000-0000-00000000e004', '00000000-0000-0000-0000-00000000b001',
    'Ramón Gómez',  'cook',    crypt('4444', gen_salt('bf')), true);

-- --- Menu items (~15) ---
insert into public.menu_items (id, restaurant_id, category, name, description, base_price, active) values
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000a001', 'Tacos',  'Taco de pastor',          'Cerdo al pastor, piña, cebolla, cilantro',           3500, true),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000a001', 'Tacos',  'Taco de suadero',         'Suadero suave, cebolla, cilantro',                   3500, true),
  ('00000000-0000-0000-0000-00000000c003', '00000000-0000-0000-0000-00000000a001', 'Tacos',  'Taco de bistec',          'Bistec a la plancha',                                3800, true),
  ('00000000-0000-0000-0000-00000000c004', '00000000-0000-0000-0000-00000000a001', 'Tacos',  'Taco vegetariano',        'Champiñones y rajas',                                3400, true),
  ('00000000-0000-0000-0000-00000000c005', '00000000-0000-0000-0000-00000000a001', 'Quesa',  'Quesadilla de queso',     'Tortilla de maíz hecha en casa',                     4500, true),
  ('00000000-0000-0000-0000-00000000c006', '00000000-0000-0000-0000-00000000a001', 'Quesa',  'Quesadilla de huitlacoche','Huitlacoche con queso oaxaca',                       6500, true),
  ('00000000-0000-0000-0000-00000000c007', '00000000-0000-0000-0000-00000000a001', 'Quesa',  'Quesadilla de flor',      'Flor de calabaza',                                   5800, true),
  ('00000000-0000-0000-0000-00000000c008', '00000000-0000-0000-0000-00000000a001', 'Bebidas','Agua de horchata 500ml',  'Horchata casera',                                    3500, true),
  ('00000000-0000-0000-0000-00000000c009', '00000000-0000-0000-0000-00000000a001', 'Bebidas','Agua de jamaica 500ml',   'Jamaica fresca',                                     3500, true),
  ('00000000-0000-0000-0000-00000000c010', '00000000-0000-0000-0000-00000000a001', 'Bebidas','Refresco vidrio',         'Coca-Cola 355ml',                                    3000, true),
  ('00000000-0000-0000-0000-00000000c011', '00000000-0000-0000-0000-00000000a001', 'Bebidas','Cerveza Victoria',        'Cerveza 355ml',                                      4500, true),
  ('00000000-0000-0000-0000-00000000c012', '00000000-0000-0000-0000-00000000a001', 'Postres','Arroz con leche',         'Arroz con leche con canela',                         4500, true),
  ('00000000-0000-0000-0000-00000000c013', '00000000-0000-0000-0000-00000000a001', 'Postres','Flan de coco',            'Flan casero',                                        5500, true),
  ('00000000-0000-0000-0000-00000000c014', '00000000-0000-0000-0000-00000000a001', 'Extras', 'Salsa extra',             'Roja, verde, taquera o habanero',                    1500, true),
  ('00000000-0000-0000-0000-00000000c015', '00000000-0000-0000-0000-00000000a001', 'Extras', 'Guacamole 100g',          'Guacamole fresco',                                   3800, true);

-- --- Channel pricing: marketplace cobra 15% más para absorber comisión ---
insert into public.menu_channel_prices (menu_item_id, channel, price)
select id, c, round(base_price * 1.15)::int
from public.menu_items, unnest(array['eats', 'rappi', 'didi']) as c
where restaurant_id = '00000000-0000-0000-0000-00000000a001';

insert into public.menu_channel_prices (menu_item_id, channel, price)
select id, 'direct', base_price
from public.menu_items
where restaurant_id = '00000000-0000-0000-0000-00000000a001';

-- --- Inventory (~30 SKUs) ---
insert into public.inventory_items (branch_id, sku, name, unit, current_stock, min_stock, cost_per_unit) values
  ('00000000-0000-0000-0000-00000000b001', 'INV-001', 'Cerdo al pastor',        'kg',  18.500, 5,   18000),
  ('00000000-0000-0000-0000-00000000b001', 'INV-002', 'Suadero',                'kg',  12.000, 4,   19500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-003', 'Bistec de res',          'kg',  10.000, 3,   24000),
  ('00000000-0000-0000-0000-00000000b001', 'INV-004', 'Champiñones',            'kg',   6.000, 2,    8500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-005', 'Tortilla de maíz',       'pz', 800.000, 200,    180),
  ('00000000-0000-0000-0000-00000000b001', 'INV-006', 'Queso oaxaca',           'kg',   8.000, 2,   16500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-007', 'Huitlacoche',            'kg',   2.500, 1,   22000),
  ('00000000-0000-0000-0000-00000000b001', 'INV-008', 'Flor de calabaza',       'manojo', 12, 4,    3500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-009', 'Cebolla blanca',         'kg',   5.000, 2,    2200),
  ('00000000-0000-0000-0000-00000000b001', 'INV-010', 'Cilantro',               'manojo', 24, 6,     500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-011', 'Piña',                   'pz',     8, 3,    4500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-012', 'Limón',                  'kg',   6.000, 2,    2800),
  ('00000000-0000-0000-0000-00000000b001', 'INV-013', 'Salsa roja',             'l',    4.500, 1,    4500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-014', 'Salsa verde',            'l',    4.500, 1,    4500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-015', 'Salsa habanero',         'l',    2.500, 1,    5500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-016', 'Aguacate',               'kg',   8.000, 2,    7500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-017', 'Arroz',                  'kg',  10.000, 3,    3500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-018', 'Leche entera',           'l',   12.000, 4,    2800),
  ('00000000-0000-0000-0000-00000000b001', 'INV-019', 'Azúcar',                 'kg',   6.000, 2,    2500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-020', 'Canela en raja',         'kg',   0.500, 0.2, 35000),
  ('00000000-0000-0000-0000-00000000b001', 'INV-021', 'Flor de jamaica',        'kg',   2.000, 0.5, 22000),
  ('00000000-0000-0000-0000-00000000b001', 'INV-022', 'Coca-Cola 355ml',        'pz',    72, 24,    2200),
  ('00000000-0000-0000-0000-00000000b001', 'INV-023', 'Cerveza Victoria 355ml', 'pz',    48, 24,    2800),
  ('00000000-0000-0000-0000-00000000b001', 'INV-024', 'Coco rallado',           'kg',   1.000, 0.3, 12000),
  ('00000000-0000-0000-0000-00000000b001', 'INV-025', 'Huevo',                  'pz',    60, 24,     300),
  ('00000000-0000-0000-0000-00000000b001', 'INV-026', 'Vaso 16oz',              'pz',   500, 100,    180),
  ('00000000-0000-0000-0000-00000000b001', 'INV-027', 'Tapa para vaso',         'pz',   500, 100,    120),
  ('00000000-0000-0000-0000-00000000b001', 'INV-028', 'Servilletas',            'paquete', 40, 10,  1500),
  ('00000000-0000-0000-0000-00000000b001', 'INV-029', 'Bolsa kraft delivery',   'pz',   300, 80,     250),
  ('00000000-0000-0000-0000-00000000b001', 'INV-030', 'Etiqueta térmica',       'pz',  1000, 200,     50);

-- --- Orders demo (~10, mezclados en estados) ---
-- Helper: ahora, restamos minutos según la edad del pedido.
do $$
declare
  now_ts timestamptz := now();
  o_id uuid;
begin
  -- 1. Recién recibido — Eats
  insert into public.orders (id, branch_id, channel, external_id, status, customer_name, customer_phone, subtotal, tax, delivery_fee, total, sla_deadline, created_at, payment_method)
  values ('00000000-0000-0000-0000-00000000d001', '00000000-0000-0000-0000-00000000b001', 'eats', 'EATS-A1B2C3', 'received',
          'Laura M.', '+5255111111', 8050, 1288, 0, 9338, now_ts + interval '15 minutes', now_ts - interval '1 minute', 'marketplace')
  returning id into o_id;
  insert into public.order_items (order_id, menu_item_id, qty, unit_price, modifiers) values
    (o_id, '00000000-0000-0000-0000-00000000c001', 2, 4025, '[]'::jsonb),
    (o_id, '00000000-0000-0000-0000-00000000c008', 1, 4025, '[]'::jsonb);

  -- 2. En preparación — Rappi
  insert into public.orders (id, branch_id, channel, external_id, status, customer_name, customer_phone, subtotal, tax, total, sla_deadline, created_at, accepted_at, payment_method)
  values ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000b001', 'rappi', 'RAP-91A2', 'preparing',
          'Carlos T.', '+5255222222', 11800, 1888, 13688, now_ts + interval '8 minutes', now_ts - interval '7 minutes', now_ts - interval '6 minutes', 'marketplace')
  returning id into o_id;
  insert into public.order_items (order_id, menu_item_id, qty, unit_price) values
    (o_id, '00000000-0000-0000-0000-00000000c006', 1, 7475),
    (o_id, '00000000-0000-0000-0000-00000000c009', 1, 4025),
    (o_id, '00000000-0000-0000-0000-00000000c014', 1, 1725);

  -- 3. En preparación — Didi
  insert into public.orders (id, branch_id, channel, external_id, status, customer_name, customer_phone, subtotal, total, sla_deadline, created_at, accepted_at, payment_method)
  values ('00000000-0000-0000-0000-00000000d003', '00000000-0000-0000-0000-00000000b001', 'didi', 'DIDI-77FF', 'preparing',
          'Pablo G.', '+5255333333', 9650, 11198, now_ts + interval '12 minutes', now_ts - interval '5 minutes', now_ts - interval '4 minutes', 'marketplace')
  returning id into o_id;
  insert into public.order_items (order_id, menu_item_id, qty, unit_price) values
    (o_id, '00000000-0000-0000-0000-00000000c003', 2, 4370),
    (o_id, '00000000-0000-0000-0000-00000000c010', 1, 3450);

  -- 4. Listo — Eats (al borde de SLA, naranja)
  insert into public.orders (id, branch_id, channel, external_id, status, subtotal, total, sla_deadline, created_at, accepted_at, ready_at, payment_method)
  values ('00000000-0000-0000-0000-00000000d004', '00000000-0000-0000-0000-00000000b001', 'eats', 'EATS-B7C9', 'ready',
          7000, 8120, now_ts + interval '3 minutes', now_ts - interval '17 minutes', now_ts - interval '16 minutes', now_ts - interval '1 minute', 'marketplace')
  returning id into o_id;
  insert into public.order_items (order_id, menu_item_id, qty, unit_price) values
    (o_id, '00000000-0000-0000-0000-00000000c002', 2, 4025);

  -- 5. Listo — sitio propio
  insert into public.orders (id, branch_id, channel, external_id, status, customer_name, customer_phone, customer_address, subtotal, tax, delivery_fee, total, sla_deadline, created_at, accepted_at, ready_at, payment_method, payment_ref)
  values ('00000000-0000-0000-0000-00000000d005', '00000000-0000-0000-0000-00000000b001', 'direct', null, 'ready',
          'Sofía R.', '+5255444444', 'Av. Tamaulipas 200, Condesa', 15800, 2528, 5500, 23828, now_ts + interval '20 minutes', now_ts - interval '12 minutes', now_ts - interval '11 minutes', now_ts, 'online', 'pi_stripe_demo_001')
  returning id into o_id;
  insert into public.order_items (order_id, menu_item_id, qty, unit_price) values
    (o_id, '00000000-0000-0000-0000-00000000c007', 2, 5800),
    (o_id, '00000000-0000-0000-0000-00000000c015', 1, 3800),
    (o_id, '00000000-0000-0000-0000-00000000c008', 1, 3500);

  -- 6. En camino — Rappi
  insert into public.orders (id, branch_id, channel, external_id, status, subtotal, total, created_at, accepted_at, ready_at, dispatched_at, payment_method)
  values ('00000000-0000-0000-0000-00000000d006', '00000000-0000-0000-0000-00000000b001', 'rappi', 'RAP-44ZZ', 'dispatched',
          12300, 14268, now_ts - interval '30 minutes', now_ts - interval '29 minutes', now_ts - interval '8 minutes', now_ts - interval '7 minutes', 'marketplace')
  returning id into o_id;
  insert into public.order_items (order_id, menu_item_id, qty, unit_price) values
    (o_id, '00000000-0000-0000-0000-00000000c005', 1, 5175),
    (o_id, '00000000-0000-0000-0000-00000000c006', 1, 7475);

  -- 7. Entregado — sitio propio (caja)
  insert into public.orders (id, branch_id, channel, status, subtotal, tax, delivery_fee, total, created_at, accepted_at, ready_at, dispatched_at, delivered_at, payment_method, payment_ref)
  values ('00000000-0000-0000-0000-00000000d007', '00000000-0000-0000-0000-00000000b001', 'direct', 'delivered',
          22500, 3600, 5500, 31600, now_ts - interval '1 hour 10 minutes', now_ts - interval '1 hour 9 minutes', now_ts - interval '50 minutes', now_ts - interval '49 minutes', now_ts - interval '35 minutes', 'online', 'pi_stripe_demo_002');

  -- 8. Entregado — Mostrador
  insert into public.orders (id, branch_id, channel, status, subtotal, tax, total, created_at, accepted_at, ready_at, delivered_at, payment_method)
  values ('00000000-0000-0000-0000-00000000d008', '00000000-0000-0000-0000-00000000b001', 'mostrador', 'delivered',
          7000, 1120, 8120, now_ts - interval '2 hours', now_ts - interval '1 hour 59 minutes', now_ts - interval '1 hour 50 minutes', now_ts - interval '1 hour 49 minutes', 'cash');

  -- 9. Cancelado — Didi
  insert into public.orders (id, branch_id, channel, external_id, status, subtotal, total, created_at, cancelled_at, cancel_reason, payment_method)
  values ('00000000-0000-0000-0000-00000000d009', '00000000-0000-0000-0000-00000000b001', 'didi', 'DIDI-CC11', 'cancelled',
          9200, 10672, now_ts - interval '45 minutes', now_ts - interval '40 minutes', 'cliente_no_responde', 'marketplace');

  -- 10. Recibido — sitio propio (acaba de entrar)
  insert into public.orders (id, branch_id, channel, status, customer_name, customer_phone, subtotal, tax, delivery_fee, total, sla_deadline, created_at, payment_method, payment_ref)
  values ('00000000-0000-0000-0000-00000000d010', '00000000-0000-0000-0000-00000000b001', 'direct', 'received',
          'Andrea L.', '+5255555555', 8900, 1424, 5500, 15824, now_ts + interval '24 minutes', now_ts - interval '30 seconds', 'online', 'pi_stripe_demo_003');
end$$;

-- --- Printers demo ---
insert into public.printers (branch_id, name, type, connection, address, status) values
  ('00000000-0000-0000-0000-00000000b001', 'Cocina caliente', 'kitchen', 'lan', '192.168.1.50', 'online'),
  ('00000000-0000-0000-0000-00000000b001', 'Etiquetas',       'label',   'usb', 'usb://0x04b8/0x0e15', 'online'),
  ('00000000-0000-0000-0000-00000000b001', 'Caja',            'cashier', 'lan', '192.168.1.51', 'online');

-- --- Automation rule demo ---
insert into public.automation_rules (branch_id, name, trigger, conditions, actions) values
  ('00000000-0000-0000-0000-00000000b001',
   'Imprimir comanda al aceptar',
   'order.accepted',
   '{"channel": ["direct", "eats", "rappi", "didi", "mostrador"]}',
   '[{"type": "print", "template": "kitchen-ticket", "printer_type": "kitchen"}]');
