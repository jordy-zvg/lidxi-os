'use server';

import { DELIVERY_PROVIDER_IDS, type DeliveryProviderId } from '@/lib/delivery-provider-schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient } from '@kobi/db';
import {
  type UberDirectClient,
  type UberDirectQuote,
  type UberDirectQuoteRequest,
  createUberDirectClient,
} from '@kobi/integrations/uber-direct';
import { revalidatePath } from 'next/cache';

export type DeliveryActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface DeliveryRow {
  id: string;
  tenant_id: string;
  order_id: string;
  provider: DeliveryProviderId;
  external_id: string | null;
  status: string;
  quote_fee_cents: number;
  quote_currency: string;
  pickup_eta: string | null;
  dropoff_eta: string | null;
  courier_name: string | null;
  courier_phone: string | null;
  courier_vehicle: string | null;
  courier_lat: number | null;
  courier_lng: number | null;
  pickup_address: Record<string, unknown> | null;
  dropoff_address: Record<string, unknown> | null;
  assigned_at: string | null;
  pickup_arrived_at: string | null;
  picked_up_at: string | null;
  dropoff_arrived_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Construye el cliente Uber Direct para un tenant. En mock no requiere
 * credenciales; en sandbox/production las carga de delivery_provider_connections.
 */
async function buildUberDirectClientForTenant(tenantId: string): Promise<UberDirectClient> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('delivery_provider_connections')
    .select('credentials, status')
    .eq('tenant_id', tenantId)
    .eq('provider', 'uber_direct')
    .maybeSingle();

  const creds = (data?.credentials ?? {}) as Record<string, string>;
  return createUberDirectClient({
    credentials:
      creds.customer_id && creds.client_id && creds.client_secret
        ? {
            customerId: creds.customer_id,
            clientId: creds.client_id,
            clientSecret: creds.client_secret,
            webhookSecret: process.env.UBER_DIRECT_WEBHOOK_SECRET,
          }
        : undefined,
  });
}

interface OrderForDispatch {
  id: string;
  tenant_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_lat: number | null;
  customer_lng: number | null;
  total: number;
  channel: string;
  status: string;
}

interface TenantForPickup {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  metadata: Record<string, unknown> | null;
}

function buildQuoteRequest(
  order: OrderForDispatch,
  tenant: TenantForPickup,
): UberDirectQuoteRequest {
  const meta = (tenant.metadata ?? {}) as Record<string, unknown>;
  const tenantLat = (meta.lat as number | undefined) ?? 19.4326;
  const tenantLng = (meta.lng as number | undefined) ?? -99.1332;
  const now = new Date();
  const readyAt = new Date(now.getTime() + 5 * 60_000);
  const deadlineAt = new Date(now.getTime() + 20 * 60_000);

  return {
    pickupAddress: {
      street: tenant.address ?? 'Av. Reforma 100',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '06600',
      country: 'MX',
      lat: tenantLat,
      lng: tenantLng,
      notes: tenant.name,
    },
    pickupContact: {
      firstName: tenant.name,
      phone: tenant.phone ?? '+525500000000',
    },
    dropoffAddress: {
      street: order.customer_address ?? 'Sin dirección',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '00000',
      country: 'MX',
      lat: order.customer_lat ?? tenantLat - 0.012,
      lng: order.customer_lng ?? tenantLng - 0.018,
    },
    dropoffContact: {
      firstName: order.customer_name?.split(' ')[0] ?? 'Cliente',
      lastName: order.customer_name?.split(' ').slice(1).join(' '),
      phone: order.customer_phone ?? '+525500000000',
    },
    pickupReadyAt: readyAt.toISOString(),
    pickupDeadlineAt: deadlineAt.toISOString(),
    manifestTotalCents: order.total,
  };
}

async function loadOrderForTenant(
  tenantId: string,
  orderId: string,
): Promise<OrderForDispatch | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('orders')
    .select(
      'id, tenant_id, customer_name, customer_phone, customer_address, customer_lat, customer_lng, total, channel, status',
    )
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .maybeSingle();
  return (data ?? null) as OrderForDispatch | null;
}

async function loadTenantForPickup(tenantId: string): Promise<TenantForPickup | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('tenants')
    .select('id, name, address, phone, metadata')
    .eq('id', tenantId)
    .maybeSingle();
  return (data ?? null) as TenantForPickup | null;
}

// ---------------------------------------------------------------------------
// Tenant resolution: admin (Supabase session) OR operations (employee JWT)
// ---------------------------------------------------------------------------

async function resolveTenantContext(): Promise<{ tenantId: string } | { error: string }> {
  // 1) ¿Hay sesión de admin?
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { tenantId } = await requireTenant();
      return { tenantId };
    }
  } catch {
    // sigue al fallback de empleado
  }
  // 2) Fallback: contexto operativo (PIN/empleado).
  try {
    const { requireEmployeeContext } = await import('@/lib/operations/employee-context');
    const ctx = await requireEmployeeContext();
    return { tenantId: ctx.tenantId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sin sesión válida' };
  }
}

// ---------------------------------------------------------------------------
// Public server actions
// ---------------------------------------------------------------------------

export interface DeliveryQuoteResult {
  quote: UberDirectQuote;
  provider: DeliveryProviderId;
}

/**
 * Cotiza una entrega con Uber Direct. NO crea la delivery — sólo devuelve
 * el fee y ETAs para que el operador decida si despachar.
 */
export async function quoteDeliveryForOrder(
  orderId: string,
  provider: DeliveryProviderId = 'uber_direct',
): Promise<DeliveryActionResult<DeliveryQuoteResult>> {
  if (!DELIVERY_PROVIDER_IDS.includes(provider)) {
    return { ok: false, error: 'Proveedor no soportado' };
  }
  const ctx = await resolveTenantContext();
  if ('error' in ctx) return { ok: false, error: ctx.error };

  const [order, tenant] = await Promise.all([
    loadOrderForTenant(ctx.tenantId, orderId),
    loadTenantForPickup(ctx.tenantId),
  ]);
  if (!order) return { ok: false, error: 'Orden no encontrada' };
  if (!tenant) return { ok: false, error: 'Restaurante no encontrado' };

  const client = await buildUberDirectClientForTenant(ctx.tenantId);
  const req = buildQuoteRequest(order, tenant);
  const r = await client.quote(req);
  if (!r.ok) return { ok: false, error: r.error.message };
  return { ok: true, data: { quote: r.data, provider } };
}

/**
 * Crea la entrega: persiste fila en `deliveries` + llama al proveedor con
 * la quote previa. Cobra al restaurante el fee de envío.
 */
export async function dispatchDelivery(
  orderId: string,
  quoteId: string,
  provider: DeliveryProviderId = 'uber_direct',
): Promise<DeliveryActionResult<DeliveryRow>> {
  if (!DELIVERY_PROVIDER_IDS.includes(provider)) {
    return { ok: false, error: 'Proveedor no soportado' };
  }
  const ctx = await resolveTenantContext();
  if ('error' in ctx) return { ok: false, error: ctx.error };

  const supabase = createSupabaseServiceClient();

  // Evitar dispatch duplicado.
  const { data: existing } = await supabase
    .from('deliveries')
    .select('id, status')
    .eq('order_id', orderId)
    .eq('provider', provider)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: 'Esta orden ya tiene una entrega activa' };
  }

  const [order, tenant] = await Promise.all([
    loadOrderForTenant(ctx.tenantId, orderId),
    loadTenantForPickup(ctx.tenantId),
  ]);
  if (!order) return { ok: false, error: 'Orden no encontrada' };
  if (!tenant) return { ok: false, error: 'Restaurante no encontrado' };

  const client = await buildUberDirectClientForTenant(ctx.tenantId);
  const created = await client.createDelivery(quoteId);
  if (!created.ok) return { ok: false, error: created.error.message };

  const delivery = created.data;
  const req = buildQuoteRequest(order, tenant);
  const now = new Date().toISOString();

  const insertPayload = {
    tenant_id: ctx.tenantId,
    order_id: orderId,
    provider,
    external_id: delivery.id,
    status: delivery.status,
    quote_fee_cents: 0,
    quote_currency: 'MXN',
    pickup_eta: delivery.pickupEta ?? null,
    dropoff_eta: delivery.dropoffEta ?? null,
    courier_name: delivery.courier?.name ?? null,
    courier_phone: delivery.courier?.phone ?? null,
    courier_vehicle: delivery.courier?.vehicle ?? null,
    courier_lat: delivery.courier?.lat ?? null,
    courier_lng: delivery.courier?.lng ?? null,
    pickup_address: req.pickupAddress as unknown,
    dropoff_address: req.dropoffAddress as unknown,
    assigned_at: delivery.status !== 'pending' ? now : null,
    raw_payload: JSON.parse(JSON.stringify(delivery)) as unknown,
    updated_at: now,
  };

  const { data: row, error } = await (
    supabase.from('deliveries') as ReturnType<typeof supabase.from>
  )
    // biome-ignore lint/suspicious/noExplicitAny: tipos no incluyen 'deliveries' aún
    .insert(insertPayload as any)
    .select('*')
    .single();

  if (error || !row) {
    return { ok: false, error: error?.message ?? 'No se pudo persistir la entrega' };
  }

  // Marcar orden como dispatched.
  await supabase
    .from('orders')
    .update({ status: 'dispatched', dispatched_at: now })
    .eq('id', orderId)
    .eq('tenant_id', ctx.tenantId);

  revalidatePath('/sitio-propio');
  revalidatePath('/admin/sitio-propio');
  return { ok: true, data: row as DeliveryRow };
}

/**
 * Sincroniza el estado de una delivery con el proveedor (poll-and-update).
 * Llamado desde el cliente en intervalos cortos mientras la delivery está
 * activa. En modo mock, el state-machine avanza por elapsed time.
 */
export async function syncDelivery(deliveryId: string): Promise<DeliveryActionResult<DeliveryRow>> {
  const ctx = await resolveTenantContext();
  if ('error' in ctx) return { ok: false, error: ctx.error };

  const supabase = createSupabaseServiceClient();
  const { data: rowRaw } = await supabase
    .from('deliveries')
    .select('*')
    .eq('id', deliveryId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();
  const row = rowRaw as DeliveryRow | null;
  if (!row) return { ok: false, error: 'Entrega no encontrada' };

  if (!row.external_id) return { ok: true, data: row };

  const client = await buildUberDirectClientForTenant(ctx.tenantId);
  const r = await client.getDelivery(row.external_id);
  if (!r.ok) {
    return { ok: true, data: row }; // soft-fail: no rompemos UI por blip
  }
  const d = r.data;

  const updates: Partial<DeliveryRow> = {
    status: d.status,
    courier_name: d.courier?.name ?? row.courier_name,
    courier_phone: d.courier?.phone ?? row.courier_phone,
    courier_vehicle: d.courier?.vehicle ?? row.courier_vehicle,
    courier_lat: d.courier?.lat ?? row.courier_lat,
    courier_lng: d.courier?.lng ?? row.courier_lng,
    pickup_eta: d.pickupEta ?? row.pickup_eta,
    dropoff_eta: d.dropoffEta ?? row.dropoff_eta,
    raw_payload: d as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };

  const now = new Date().toISOString();
  if (d.status === 'courier_assigned' && !row.assigned_at) updates.assigned_at = now;
  if (d.status === 'pickup_arrived' && !row.pickup_arrived_at) updates.pickup_arrived_at = now;
  if (d.status === 'picked_up' && !row.picked_up_at) updates.picked_up_at = now;
  if (d.status === 'dropoff_arrived' && !row.dropoff_arrived_at) updates.dropoff_arrived_at = now;
  if (d.status === 'delivered' && !row.delivered_at) {
    updates.delivered_at = now;
    // Cierra la orden tambień.
    await supabase
      .from('orders')
      .update({ status: 'delivered', delivered_at: now })
      .eq('id', row.order_id)
      .eq('tenant_id', ctx.tenantId);
  }
  if (d.status === 'canceled' && !row.canceled_at) {
    updates.canceled_at = now;
    updates.cancel_reason = d.cancelReason ?? null;
  }

  const { data: updated } = await supabase
    .from('deliveries')
    .update(updates as Record<string, unknown>)
    .eq('id', deliveryId)
    .eq('tenant_id', ctx.tenantId)
    .select('*')
    .single();

  return { ok: true, data: (updated ?? row) as DeliveryRow };
}

export async function cancelDeliveryAction(
  deliveryId: string,
  reason?: string,
): Promise<DeliveryActionResult<DeliveryRow>> {
  const ctx = await resolveTenantContext();
  if ('error' in ctx) return { ok: false, error: ctx.error };

  const supabase = createSupabaseServiceClient();
  const { data: rowRaw } = await supabase
    .from('deliveries')
    .select('*')
    .eq('id', deliveryId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();
  const row = rowRaw as DeliveryRow | null;
  if (!row) return { ok: false, error: 'Entrega no encontrada' };
  if (!row.external_id) return { ok: false, error: 'Entrega sin external_id' };

  const client = await buildUberDirectClientForTenant(ctx.tenantId);
  const r = await client.cancelDelivery(row.external_id, reason);
  if (!r.ok) return { ok: false, error: r.error.message };

  const now = new Date().toISOString();
  const { data: updated } = await supabase
    .from('deliveries')
    .update({
      status: 'canceled',
      canceled_at: now,
      cancel_reason: reason ?? null,
      updated_at: now,
    })
    .eq('id', deliveryId)
    .eq('tenant_id', ctx.tenantId)
    .select('*')
    .single();

  revalidatePath('/sitio-propio');
  revalidatePath('/admin/sitio-propio');
  return { ok: true, data: (updated ?? row) as DeliveryRow };
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

export interface DirectOrderWithDelivery {
  id: string;
  folio: string;
  status: string;
  customer_name: string;
  customer_address: string | null;
  total_cents: number;
  is_paid: boolean;
  created_at: string;
  items: { name: string; qty: number; total_cents: number }[];
  delivery: DeliveryRow | null;
}

/**
 * Carga órdenes del canal directo del tenant con la delivery activa
 * (si existe). Las pinta el inbox de sitio propio.
 */
export async function loadDirectOrders(
  tenantIdOverride?: string,
): Promise<DeliveryActionResult<DirectOrderWithDelivery[]>> {
  let tenantId = tenantIdOverride;
  if (!tenantId) {
    const ctx = await resolveTenantContext();
    if ('error' in ctx) return { ok: false, error: ctx.error };
    tenantId = ctx.tenantId;
  }
  const supabase = createSupabaseServiceClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      'id, status, customer_name, customer_address, total, payment_method, created_at, channel',
    )
    .eq('tenant_id', tenantId)
    .eq('channel', 'direct')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { ok: false, error: error.message };
  if (!orders || orders.length === 0) return { ok: true, data: [] };

  const orderIds = orders.map((o) => (o as { id: string }).id);
  const [paymentsRes, itemsRes, deliveriesRes] = await Promise.all([
    supabase.from('order_payments').select('order_id').in('order_id', orderIds),
    supabase
      .from('order_items')
      .select('order_id, menu_item_id, qty, unit_price, menu_items(name)')
      .in('order_id', orderIds),
    supabase.from('deliveries').select('*').in('order_id', orderIds).eq('tenant_id', tenantId),
  ]);

  const paidOrders = new Set(
    ((paymentsRes.data ?? []) as { order_id: string }[]).map((p) => p.order_id),
  );

  const itemsByOrder = new Map<string, { name: string; qty: number; total_cents: number }[]>();
  for (const it of (itemsRes.data ?? []) as {
    order_id: string;
    menu_item_id: string;
    qty: number;
    unit_price: number;
    menu_items: { name: string } | null;
  }[]) {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push({
      name: it.menu_items?.name ?? 'Item',
      qty: it.qty,
      total_cents: it.qty * it.unit_price,
    });
    itemsByOrder.set(it.order_id, arr);
  }

  const deliveryByOrder = new Map<string, DeliveryRow>();
  for (const d of (deliveriesRes.data ?? []) as DeliveryRow[]) {
    deliveryByOrder.set(d.order_id, d);
  }

  const result: DirectOrderWithDelivery[] = orders.map((o) => {
    const row = o as {
      id: string;
      status: string;
      customer_name: string | null;
      customer_address: string | null;
      total: number;
      payment_method: string | null;
      created_at: string;
    };
    return {
      id: row.id,
      folio: `SP-${row.id.slice(-6).toUpperCase()}`,
      status: row.status,
      customer_name: row.customer_name ?? 'Cliente',
      customer_address: row.customer_address,
      total_cents: row.total,
      is_paid: paidOrders.has(row.id) || row.payment_method !== null,
      created_at: row.created_at,
      items: itemsByOrder.get(row.id) ?? [],
      delivery: deliveryByOrder.get(row.id) ?? null,
    };
  });

  return { ok: true, data: result };
}

export interface SitioPropioMetrics {
  ordersTodayCount: number;
  ordersTodayRevenueCents: number;
  avgTicketCents: number;
  estimatedSavingsCents: number;
  /** Comisión equivalente que se hubiera pagado a marketplaces (~28%) */
  marketplaceFeeAvoidedCents: number;
}

/**
 * KPIs reales: ventas hoy por canal directo, ticket promedio, ahorro vs
 * marketplaces (asume 28% si todo se vendiera por Uber/Rappi/Didi).
 */
export async function loadSitioPropioMetrics(
  tenantIdOverride?: string,
): Promise<DeliveryActionResult<SitioPropioMetrics>> {
  let tenantId = tenantIdOverride;
  if (!tenantId) {
    const ctx = await resolveTenantContext();
    if ('error' in ctx) return { ok: false, error: ctx.error };
    tenantId = ctx.tenantId;
  }
  const supabase = createSupabaseServiceClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startISO = startOfDay.toISOString();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, total, channel, status, created_at')
    .eq('tenant_id', tenantId)
    .eq('channel', 'direct')
    .neq('status', 'cancelled')
    .gte('created_at', startISO);

  if (error) return { ok: false, error: error.message };

  const direct = (orders ?? []) as { total: number }[];
  const count = direct.length;
  const revenue = direct.reduce((sum, o) => sum + o.total, 0);
  const avg = count > 0 ? Math.round(revenue / count) : 0;
  // Ahorro = lo que pagarías a marketplace si hubieras vendido todo ahí
  const MARKETPLACE_FEE = 0.28;
  const marketplaceFee = Math.round(revenue * MARKETPLACE_FEE);

  return {
    ok: true,
    data: {
      ordersTodayCount: count,
      ordersTodayRevenueCents: revenue,
      avgTicketCents: avg,
      estimatedSavingsCents: marketplaceFee,
      marketplaceFeeAvoidedCents: marketplaceFee,
    },
  };
}
