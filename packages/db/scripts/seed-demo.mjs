#!/usr/bin/env node
/**
 * Seed de datos demo para el tenant Miztli.
 *
 * Objetivo: que el dashboard de Sitio Propio cuente una historia visual
 * (KPIs con números, métrica de ahorro vs marketplaces, inbox poblado)
 * para la demo conducida por Jordy.
 *
 * Datos creados:
 *   - ~26 órdenes del canal 'direct' repartidas en los últimos 7 días
 *     (8 de hoy, decreciendo hasta 1 de hace 7 días).
 *   - Cada orden tiene 2-4 line items del menú real de Miztli.
 *   - Todas marcadas como pagadas (payment_method='mercado_pago').
 *   - Las históricas (antes de hoy) marcadas como 'delivered' con
 *     deliveries asociadas (status='delivered').
 *   - Las de hoy mezclan estados received/preparing/ready/dispatched
 *     para que el inbox tenga variedad visual.
 *
 * Identificación + idempotencia:
 *   - Cada orden lleva `external_id = 'demo-seed-N'` (N = índice).
 *   - `customer_name` lleva el prefijo "[DEMO] " para grep visual.
 *   - El UNIQUE (channel, external_id) garantiza que correr el script
 *     dos veces no duplica órdenes.
 *
 * Limpieza (opcional, después de la demo):
 *   ```sql
 *   delete from public.orders
 *   where tenant_id = '<miztli-tenant-id>' and external_id like 'demo-seed-%';
 *   ```
 *   (las deliveries, order_items, etc. caen en cascada).
 *
 * Uso:
 *   pnpm db:seed-demo            (desde la raíz del monorepo)
 *   node packages/db/scripts/seed-demo.mjs
 *
 * Variables requeridas (lee .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * ⚠️  NUNCA correr contra producción sin autorización explícita.
 *     El script detecta la URL y exige confirmación si apunta a *.supabase.co.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Cargar .env.local desde la raíz del monorepo
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env.local');

try {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
} catch {
  // .env.local missing — rely on process.env being pre-populated
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('✗ Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Guard contra ejecución accidental en producción
// ---------------------------------------------------------------------------
const isProd =
  url.includes('.supabase.co') && !url.includes('127.0.0.1') && !url.includes('localhost');
if (isProd && process.env.ALLOW_SEED_PROD !== 'true') {
  console.error(
    '✗ El SUPABASE_URL apunta a un proyecto cloud (.supabase.co).\n' +
      '  Para correr seed-demo contra ese proyecto, set ALLOW_SEED_PROD=true.\n' +
      '  Asegúrate de tener autorización explícita antes.',
  );
  process.exit(2);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Cargar tenant Miztli + branch + menu items
// ---------------------------------------------------------------------------
const MIZTLI_SLUG = 'miztli';

const { data: tenant, error: tenantErr } = await supabase
  .from('tenants')
  .select('id, name, slug')
  .eq('slug', MIZTLI_SLUG)
  .maybeSingle();

if (tenantErr || !tenant) {
  console.error(`✗ Tenant "${MIZTLI_SLUG}" no existe en este Supabase. Aborto.`);
  process.exit(3);
}

console.log(`✔ Tenant: ${tenant.name} (${tenant.id})`);

const { data: branches } = await supabase
  .from('branches')
  .select('id, restaurant_id, name')
  .limit(20);

const { data: restaurants } = await supabase
  .from('restaurants')
  .select('id, tenant_id, name')
  .eq('tenant_id', tenant.id);

const miztliRestaurantIds = new Set((restaurants ?? []).map((r) => r.id));
const branch = (branches ?? []).find((b) => miztliRestaurantIds.has(b.restaurant_id));

if (!branch) {
  console.error('✗ Miztli no tiene branch asociado. Aborto.');
  process.exit(4);
}
console.log(`✔ Branch: ${branch.name} (${branch.id})`);

const { data: menuItems } = await supabase
  .from('menu_items')
  .select('id, name, base_price, active')
  .eq('tenant_id', tenant.id)
  .eq('active', true);

if (!menuItems || menuItems.length === 0) {
  console.error('✗ Miztli no tiene menu_items activos. Corre el seed base primero.');
  process.exit(5);
}
console.log(`✔ Menu items disponibles: ${menuItems.length}`);

// ---------------------------------------------------------------------------
// Plantilla de generación
// ---------------------------------------------------------------------------
const DEMO_CUSTOMERS = [
  { name: 'Laura M.', phone: '+525511112301', address: 'Av. Álvaro Obregón 145, Roma Norte' },
  { name: 'Pablo R.', phone: '+525511112302', address: 'Calle Orizaba 92, Roma Norte' },
  { name: 'Sofía K.', phone: '+525511112303', address: 'Av. Insurgentes Sur 1602, Del Valle' },
  { name: 'Diego N.', phone: '+525511112304', address: 'Calle Tabasco 248, Roma Norte' },
  { name: 'Ana V.', phone: '+525511112305', address: 'Av. Cuauhtémoc 408, Narvarte' },
  { name: 'Mateo H.', phone: '+525511112306', address: 'Calle Querétaro 152, Roma Norte' },
  { name: 'Camila S.', phone: '+525511112307', address: 'Av. Coyoacán 1018, Del Valle' },
  { name: 'Joaquín T.', phone: '+525511112308', address: 'Calle Sinaloa 28, Roma Norte' },
];

/**
 * Reparto temporal de las órdenes (días atrás → cuántas crear).
 * Suma: 8 + 5 + 4 + 3 + 2 + 2 + 1 + 1 = 26
 */
const DISTRIBUTION = [
  { daysAgo: 0, count: 8 }, // hoy
  { daysAgo: 1, count: 5 },
  { daysAgo: 2, count: 4 },
  { daysAgo: 3, count: 3 },
  { daysAgo: 4, count: 2 },
  { daysAgo: 5, count: 2 },
  { daysAgo: 6, count: 1 },
  { daysAgo: 7, count: 1 },
];

const TODAY_STATUS_MIX = [
  'received',
  'received',
  'preparing',
  'preparing',
  'ready',
  'ready',
  'dispatched',
  'delivered',
];

const pickCustomer = (i) => DEMO_CUSTOMERS[i % DEMO_CUSTOMERS.length];

const pickItems = (seed) => {
  // 2-4 items, sin repetir, basados en hash determinístico del seed.
  const count = 2 + (seed % 3);
  const shuffled = [...menuItems].sort((a, b) => {
    const ha = (a.id + seed).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const hb = (b.id + seed).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return ha - hb;
  });
  return shuffled.slice(0, count).map((mi) => ({
    menu_item_id: mi.id,
    name: mi.name,
    unit_price: mi.base_price,
    qty: 1 + (seed % 3), // 1-3 unidades
  }));
};

// ---------------------------------------------------------------------------
// Generar e insertar
// ---------------------------------------------------------------------------
const now = new Date();
let orderIndex = 0;
const generated = [];

for (const slot of DISTRIBUTION) {
  for (let k = 0; k < slot.count; k++) {
    const externalId = `demo-seed-${orderIndex.toString().padStart(3, '0')}`;
    const customer = pickCustomer(orderIndex);
    const items = pickItems(orderIndex + 1);
    const subtotal = items.reduce((sum, it) => sum + it.unit_price * it.qty, 0);

    // Hora del día variando entre 12:00 y 21:00 según el índice
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() - slot.daysAgo);
    const hour = 12 + ((orderIndex * 3) % 9);
    const minute = (orderIndex * 7) % 60;
    baseDate.setHours(hour, minute, 0, 0);

    // status: hoy mezcla, históricos siempre delivered
    const status =
      slot.daysAgo === 0
        ? (TODAY_STATUS_MIX[k % TODAY_STATUS_MIX.length] ?? 'delivered')
        : 'delivered';

    generated.push({
      externalId,
      customer,
      items,
      subtotal,
      createdAt: baseDate.toISOString(),
      status,
      daysAgo: slot.daysAgo,
    });
    orderIndex++;
  }
}

console.log(`\n→ Sembrando ${generated.length} órdenes demo…`);

// Upsert orders + order_items + deliveries
let insertedOrders = 0;
let skippedOrders = 0;
let totalRevenueCents = 0;
let todayRevenueCents = 0;

for (const g of generated) {
  // Existe ya?
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('channel', 'direct')
    .eq('external_id', g.externalId)
    .maybeSingle();

  let orderId;
  if (existing) {
    orderId = existing.id;
    skippedOrders++;
  } else {
    const acceptedAt = ['preparing', 'ready', 'dispatched', 'delivered'].includes(g.status)
      ? new Date(new Date(g.createdAt).getTime() + 60_000).toISOString()
      : null;
    const readyAt = ['ready', 'dispatched', 'delivered'].includes(g.status)
      ? new Date(new Date(g.createdAt).getTime() + 18 * 60_000).toISOString()
      : null;
    const dispatchedAt = ['dispatched', 'delivered'].includes(g.status)
      ? new Date(new Date(g.createdAt).getTime() + 22 * 60_000).toISOString()
      : null;
    const deliveredAt =
      g.status === 'delivered'
        ? new Date(new Date(g.createdAt).getTime() + 45 * 60_000).toISOString()
        : null;

    const { data: created, error: orderErr } = await supabase
      .from('orders')
      .insert({
        tenant_id: tenant.id,
        branch_id: branch.id,
        channel: 'direct',
        external_id: g.externalId,
        status: g.status,
        customer_name: `[DEMO] ${g.customer.name}`,
        customer_phone: g.customer.phone,
        customer_address: g.customer.address,
        subtotal: g.subtotal,
        total: g.subtotal,
        payment_method: 'mercado_pago',
        payment_ref: `demo-pay-${g.externalId}`,
        created_at: g.createdAt,
        accepted_at: acceptedAt,
        ready_at: readyAt,
        dispatched_at: dispatchedAt,
        delivered_at: deliveredAt,
      })
      .select('id')
      .single();

    if (orderErr || !created) {
      console.error(`  ✗ ${g.externalId}: ${orderErr?.message ?? 'no se creó'}`);
      continue;
    }
    orderId = created.id;
    insertedOrders++;

    const { error: itemsErr } = await supabase.from('order_items').insert(
      g.items.map((it) => ({
        order_id: orderId,
        menu_item_id: it.menu_item_id,
        qty: it.qty,
        unit_price: it.unit_price,
      })),
    );
    if (itemsErr) {
      console.error(`  ✗ items de ${g.externalId}: ${itemsErr.message}`);
    }

    // Para órdenes entregadas históricas, agregar delivery completada.
    if (g.status === 'delivered' && g.daysAgo > 0) {
      await supabase.from('deliveries').insert({
        tenant_id: tenant.id,
        order_id: orderId,
        provider: 'uber_direct',
        external_id: `demo-del-${g.externalId}`,
        status: 'delivered',
        quote_fee_cents: 4500 + (g.subtotal % 5000),
        quote_currency: 'MXN',
        courier_name: 'Demo Courier',
        courier_vehicle: 'motorcycle',
        assigned_at: new Date(new Date(g.createdAt).getTime() + 19 * 60_000).toISOString(),
        picked_up_at: new Date(new Date(g.createdAt).getTime() + 25 * 60_000).toISOString(),
        delivered_at: deliveredAt,
        created_at: new Date(new Date(g.createdAt).getTime() + 18 * 60_000).toISOString(),
        updated_at: deliveredAt,
      });
    }
  }

  totalRevenueCents += g.subtotal;
  if (g.daysAgo === 0) todayRevenueCents += g.subtotal;
}

// ---------------------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------------------
const MARKETPLACE_FEE = 0.28;
const totalSavingsCents = Math.round(totalRevenueCents * MARKETPLACE_FEE);
const todaySavingsCents = Math.round(todayRevenueCents * MARKETPLACE_FEE);
const avgTicketTodayCents =
  todayRevenueCents > 0 ? Math.round(todayRevenueCents / DISTRIBUTION[0].count) : 0;

const pesos = (cents) => `$${(cents / 100).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;

console.log('\n┌──────────────────────────────────────────────────────────────┐');
console.log('│ Seed completado                                              │');
console.log('├──────────────────────────────────────────────────────────────┤');
console.log(
  `│  Insertadas:   ${insertedOrders.toString().padStart(3)}                                           │`,
);
console.log(
  `│  Ya existían:  ${skippedOrders.toString().padStart(3)} (idempotencia OK)                          │`,
);
console.log('├──────────────────────────────────────────────────────────────┤');
console.log('│ Métricas que mostrará Sitio Propio:                          │');
console.log('│                                                              │');
console.log(
  `│  Órdenes hoy:           ${DISTRIBUTION[0].count.toString().padStart(3)}                                  │`,
);
console.log(
  `│  Ticket promedio hoy:   ${pesos(avgTicketTodayCents).padStart(8)}                              │`,
);
console.log('│  Comisión promedio:     0% (solo logística)                  │');
console.log(
  `│  Ahorro hoy:            ${pesos(todaySavingsCents).padStart(8)}                              │`,
);
console.log('│                                                              │');
console.log(
  `│  Total 7 días:          ${pesos(totalRevenueCents).padStart(9)}                            │`,
);
console.log(
  `│  Ahorro 7 días vs 28%:  ${pesos(totalSavingsCents).padStart(9)}                            │`,
);
console.log('└──────────────────────────────────────────────────────────────┘');

console.log('\nPara limpiar después de la demo:');
console.log('  delete from public.orders');
console.log(`  where tenant_id = '${tenant.id}'`);
console.log("    and external_id like 'demo-seed-%';");
