'use server';

import { requireEmployeeContext } from '@/lib/operations/employee-context';
import { createSupabaseServiceClient } from '@kobi/db';
import {
  CHANNEL_KEYS,
  type ChannelKey,
  type OrderItemModifier,
  type OrderStatus,
  canTransition,
  isMarketplace,
  modifiersToReceiptStrings,
} from '@kobi/shared';
import { revalidatePath } from 'next/cache';

export type OperationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type { OrderStatus };

/** `channel` viaja como string desde la base; fuera del enum, no es marketplace. */
const esMarketplace = (channel: string): boolean => isMarketplace(channel as ChannelKey);

/** Canales de plataforma, derivados del SSOT en vez de repetir la lista. */
const MARKETPLACE_CHANNELS = CHANNEL_KEYS.filter(isMarketplace);

/**
 * Escalera operativa por canal (Sprint 20, H20.2).
 *
 * El ciclo canónico lo define `@kobi/shared` y es lineal:
 * received → preparing → ready → dispatched → delivered. Lo que cambia por
 * canal es HASTA DÓNDE llega cada pedido y qué pasos recorre, porque el
 * cumplimiento es distinto:
 *
 *   - Marketplace (eats/rappi/didi): termina en `dispatched`. Kobi no sabe
 *     cuándo el pedido llega al cliente — ese dato lo tiene la plataforma.
 *     Fingir `delivered` sería inventar información, así que `dispatched` es
 *     terminal de facto para estos canales.
 *   - `direct`: llega a `delivered`. Uber Direct escribe `dispatched` al
 *     contratar el repartidor y `delivered` cuando su sync lo confirma; el
 *     paso manual dispatched → delivered existe para que el operador pueda
 *     cerrar un pedido cuya confirmación nunca llegó (hoy quedaba atorado en
 *     "esta orden ya no puede avanzar").
 *   - `mostrador`: conserva ready → delivered. Es la venta en barra: no hay
 *     despacho que registrar. Es la ÚNICA divergencia contra la tabla
 *     canónica, que no contempla ese salto — preexistente y deliberada; ver
 *     la nota en `nextOperationalStatus`.
 */
const ADVANCE_MARKETPLACE: Partial<Record<OrderStatus, OrderStatus>> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'dispatched',
};

const ADVANCE_DIRECT: Partial<Record<OrderStatus, OrderStatus>> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'dispatched',
  dispatched: 'delivered',
};

const ADVANCE_MOSTRADOR: Partial<Record<OrderStatus, OrderStatus>> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
};

/**
 * Siguiente estado operativo para un pedido, o null si ya no avanza.
 *
 * Valida contra `canTransition()` del SSOT, con UNA excepción documentada:
 * mostrador ready → delivered. La tabla canónica exige pasar por `dispatched`,
 * que para una venta en barra no significa nada — no hay repartidor al que
 * despachar. Cambiarlo obligaría a un tap extra en cada venta de mostrador,
 * así que se conserva el comportamiento actual y se marca aquí en vez de
 * relajar el ciclo canónico para todos los canales.
 */
const nextOperationalStatus = (current: OrderStatus, channel: string): OrderStatus | null => {
  const ladder = esMarketplace(channel)
    ? ADVANCE_MARKETPLACE
    : channel === 'mostrador'
      ? ADVANCE_MOSTRADOR
      : ADVANCE_DIRECT;

  const next = ladder[current];
  if (!next) return null;

  const saltoDeMostrador = channel === 'mostrador' && current === 'ready' && next === 'delivered';
  if (!saltoDeMostrador && !canTransition(current, next)) return null;

  return next;
};

const STATUS_TIMESTAMP: Partial<Record<OrderStatus, string>> = {
  preparing: 'accepted_at',
  ready: 'ready_at',
  dispatched: 'dispatched_at',
  delivered: 'delivered_at',
};

export interface ActiveOrder {
  id: string;
  folio: string;
  status: OrderStatus;
  channel: string;
  customer_name: string;
  total_cents: number;
  payment_method: string | null;
  created_at: string;
  items_count: number;
  /** Nombres de los platillos, para no tener que ir al papel a saber qué lleva. */
  item_names: string[];
  is_paid: boolean;
  /**
   * ID corto de la plataforma (external_id). Es lo que canta el repartidor al
   * llegar, así que sin él no se puede cerrar un pedido de marketplace.
   */
  external_id: string | null;
}

/**
 * Folio visible del pedido.
 *
 * Para marketplace es el ID corto de la plataforma, que es lo que dice el
 * repartidor al llegar; buscar por un folio interno que él no conoce sería
 * inútil. El prefijo coincide con el que ya emite la ingesta de Eats.
 */
const folioFor = (channel: string, externalId: string | null, id: string): string => {
  if (esMarketplace(channel) && externalId) return `UE-${externalId.toUpperCase()}`;
  return `${channel === 'direct' ? 'WEB' : 'POS'}-${id.slice(-6).toUpperCase()}`;
};

/**
 * Órdenes activas del tenant, de TODOS los canales.
 *
 * Hasta el Sprint 20 esto filtraba `channel IN ('mostrador','direct')`, así que
 * un pedido de Uber Eats se guardaba e imprimía bien pero era invisible: no
 * había forma de verlo en marcha ni de cerrarlo cuando llegaba el repartidor.
 *
 * Activas = todo lo que no está cancelado ni en un estado terminal de su canal.
 * `dispatched` es terminal para marketplace (Kobi no sabe de la entrega final),
 * así que esos pedidos salen de la lista; para `direct` no lo es, porque su
 * flujo sí llega a `delivered`.
 */
export async function loadActiveOrders(): Promise<OperationResult<ActiveOrder[]>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  const supabase = createSupabaseServiceClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, channel, external_id, customer_name, total, payment_method, created_at')
    .eq('tenant_id', ctx.tenantId)
    .neq('status', 'cancelled')
    // `dispatched` es terminal SOLO en marketplace, así que esos salen de
    // activos; un `direct` despachado sigue vivo hasta que se entrega.
    // Equivale a NOT(marketplace AND dispatched).
    .or(`channel.not.in.(${MARKETPLACE_CHANNELS.join(',')}),status.neq.dispatched`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !orders) return { ok: false, error: 'Error cargando órdenes' };

  // Conteo de items + estado de pago para cada orden.
  const orderIds = orders.map((o) => (o as { id: string }).id);
  if (orderIds.length === 0) return { ok: true, data: [] };

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from('order_items').select('order_id, qty, menu_items(name)').in('order_id', orderIds),
    supabase.from('order_payments').select('order_id').in('order_id', orderIds),
  ]);

  const itemsByOrder = new Map<string, number>();
  const namesByOrder = new Map<string, string[]>();
  for (const it of (items ?? []) as {
    order_id: string;
    qty: number;
    menu_items: { name: string } | null;
  }[]) {
    itemsByOrder.set(it.order_id, (itemsByOrder.get(it.order_id) ?? 0) + it.qty);
    const nombre = it.menu_items?.name;
    if (nombre) {
      const previos = namesByOrder.get(it.order_id) ?? [];
      // La ingesta de Eats parte una línea con nota en una fila por unidad, así
      // que el mismo platillo puede venir repetido: se colapsa para la lista.
      if (!previos.includes(nombre)) previos.push(nombre);
      namesByOrder.set(it.order_id, previos);
    }
  }
  const paidOrders = new Set(((payments ?? []) as { order_id: string }[]).map((p) => p.order_id));

  const result: ActiveOrder[] = orders.map((o) => {
    const row = o as {
      id: string;
      status: OrderStatus;
      channel: string;
      external_id: string | null;
      customer_name: string;
      total: number;
      payment_method: string | null;
      created_at: string;
    };
    return {
      id: row.id,
      folio: folioFor(row.channel, row.external_id, row.id),
      status: row.status,
      channel: row.channel,
      external_id: row.external_id,
      customer_name: row.customer_name,
      total_cents: row.total,
      payment_method: row.payment_method,
      created_at: row.created_at,
      items_count: itemsByOrder.get(row.id) ?? 0,
      item_names: namesByOrder.get(row.id) ?? [],
      is_paid: paidOrders.has(row.id) || row.payment_method !== null,
    };
  });

  return { ok: true, data: result };
}

/**
 * Avanza el pedido al siguiente estado de la escalera de SU canal.
 * Filtro explícito por tenant_id para defense in depth.
 */
export async function advanceOrderStatus(orderId: string): Promise<OperationResult<OrderStatus>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  const supabase = createSupabaseServiceClient();

  const { data: order, error: loadErr } = await supabase
    .from('orders')
    .select('id, status, channel')
    .eq('id', orderId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();

  if (loadErr || !order) return { ok: false, error: 'Orden no encontrada' };

  const row = order as { status: OrderStatus; channel: string };
  const currentStatus = row.status;
  const nextStatus = nextOperationalStatus(currentStatus, row.channel);
  if (!nextStatus) return { ok: false, error: 'Esta orden ya no puede avanzar' };

  const updates: Record<string, string> = { status: nextStatus };
  const tsCol = STATUS_TIMESTAMP[nextStatus];
  if (tsCol) updates[tsCol] = new Date().toISOString();

  const { error: updErr } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .eq('tenant_id', ctx.tenantId);

  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath('/pedidos');
  return { ok: true, data: nextStatus };
}

/**
 * Cobrar una orden en efectivo o tarjeta. Registra en order_payments.
 * En efectivo, calcula change_given_cents = cash_received_cents - amount_cents.
 */
export interface ChargeOrderInput {
  orderId: string;
  method: 'cash' | 'card';
  cashReceivedCents?: number; // requerido si method=cash
}

export async function chargeOrder(input: ChargeOrderInput): Promise<OperationResult<null>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  const supabase = createSupabaseServiceClient();

  const { data: order, error: loadErr } = await supabase
    .from('orders')
    .select('id, total, payment_method')
    .eq('id', input.orderId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();

  if (loadErr || !order) return { ok: false, error: 'Orden no encontrada' };

  const orderRow = order as { id: string; total: number; payment_method: string | null };
  if (orderRow.payment_method) return { ok: false, error: 'Esta orden ya fue cobrada' };

  let cashReceived: number | null = null;
  let changeGiven: number | null = null;
  if (input.method === 'cash') {
    if (input.cashReceivedCents === undefined || input.cashReceivedCents < orderRow.total) {
      return { ok: false, error: 'El efectivo recibido debe cubrir el total' };
    }
    cashReceived = input.cashReceivedCents;
    changeGiven = input.cashReceivedCents - orderRow.total;
  }

  const { error: payErr } = await supabase.from('order_payments').insert({
    tenant_id: ctx.tenantId,
    order_id: orderRow.id,
    shift_id: ctx.shiftId,
    employee_id_v2: ctx.employeeIdV2,
    method: input.method,
    amount_cents: orderRow.total,
    cash_received_cents: cashReceived,
    change_given_cents: changeGiven,
  });
  if (payErr) return { ok: false, error: payErr.message };

  await supabase
    .from('orders')
    .update({ payment_method: input.method })
    .eq('id', orderRow.id)
    .eq('tenant_id', ctx.tenantId);

  revalidatePath('/pedidos');
  return { ok: true, data: null };
}

// ---------------------------------------------------------------------------
// Detalle de un pedido (Sprint 20, H20.4)
// ---------------------------------------------------------------------------

/**
 * `order_items.modifiers` es jsonb; se guarda como `[{name, priceDelta}]`.
 * Se normaliza y se pasa por el mapper de `@kobi/shared` para que el texto sea
 * el mismo que ya produce cualquier otra superficie de impresión.
 */
const modifierNames = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  const mods = raw.flatMap((m) =>
    m && typeof m === 'object' && typeof (m as { name?: unknown }).name === 'string'
      ? [{ name: (m as { name: string }).name, priceDelta: 0 } as OrderItemModifier]
      : [],
  );
  return modifiersToReceiptStrings(mods);
};

export interface OrderDetailItem {
  qty: number;
  name: string;
  unit_price_cents: number;
  /** Modificadores tal como se guardaron; vacío en canales que no los capturan. */
  modifiers: string[];
  notes: string | null;
}

export interface OrderDetail {
  id: string;
  folio: string;
  external_id: string | null;
  channel: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  payment_method: string | null;
  is_paid: boolean;
  created_at: string;
  ready_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  items: OrderDetailItem[];
}

/**
 * Carga UN pedido con sus líneas, para la pantalla de detalle y la
 * reimpresión de la comanda.
 *
 * Las filas de `order_items` se devuelven TAL COMO están guardadas, sin
 * reagrupar: la captura ya explotó las líneas con nota o modificadores en una
 * fila por unidad, y reagruparlas aquí perdería notas o ítems — es justo lo
 * que la comanda no debe hacer.
 *
 * `order_items` no tiene `tenant_id`: el aislamiento sale de filtrar el pedido
 * padre por tenant, porque el JWT de empleado no pasa por RLS.
 */
export async function loadOrderDetail(orderId: string): Promise<OperationResult<OrderDetail>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  const supabase = createSupabaseServiceClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      'id, status, channel, external_id, customer_name, customer_phone, customer_address, subtotal, tax, total, payment_method, created_at, ready_at, dispatched_at, delivered_at',
    )
    .eq('id', orderId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();

  // Sin fallback a otro pedido: si no existe o es de otro tenant, se dice.
  if (error || !order) return { ok: false, error: 'Pedido no encontrado' };

  const row = order as {
    id: string;
    status: OrderStatus;
    channel: string;
    external_id: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    subtotal: number | null;
    tax: number | null;
    total: number;
    payment_method: string | null;
    created_at: string;
    ready_at: string | null;
    dispatched_at: string | null;
    delivered_at: string | null;
  };

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase
      .from('order_items')
      .select('qty, unit_price, modifiers, notes, menu_items(name)')
      .eq('order_id', orderId),
    supabase.from('order_payments').select('order_id').eq('order_id', orderId).limit(1),
  ]);

  type ItemRow = {
    qty: number;
    unit_price: number;
    modifiers: unknown;
    notes: string | null;
    menu_items: { name: string } | null;
  };

  const detalleItems: OrderDetailItem[] = ((items ?? []) as ItemRow[]).map((it) => ({
    qty: it.qty,
    name: it.menu_items?.name ?? 'Platillo',
    unit_price_cents: it.unit_price,
    modifiers: modifierNames(it.modifiers),
    notes: it.notes,
  }));

  return {
    ok: true,
    data: {
      id: row.id,
      folio: folioFor(row.channel, row.external_id, row.id),
      external_id: row.external_id,
      channel: row.channel,
      status: row.status,
      customer_name: row.customer_name ?? 'Cliente',
      customer_phone: row.customer_phone,
      customer_address: row.customer_address,
      subtotal_cents: row.subtotal ?? row.total,
      tax_cents: row.tax ?? 0,
      total_cents: row.total,
      payment_method: row.payment_method,
      is_paid: (payments ?? []).length > 0 || row.payment_method !== null,
      created_at: row.created_at,
      ready_at: row.ready_at,
      dispatched_at: row.dispatched_at,
      delivered_at: row.delivered_at,
      items: detalleItems,
    },
  };
}
