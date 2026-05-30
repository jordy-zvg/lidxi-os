'use server';

import { requireEmployeeContext } from '@/lib/operations/employee-context';
import { createSupabaseServiceClient } from '@kobi/db';
import { revalidatePath } from 'next/cache';

export type OperationResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
};

const STATUS_TIMESTAMP: Partial<Record<OrderStatus, string>> = {
  preparing: 'accepted_at',
  ready: 'ready_at',
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
  is_paid: boolean;
}

/**
 * Órdenes activas del tenant: mostrador (POS presencial) + direct (storefront online).
 * Sin shift_id válido devuelve solo las órdenes creadas en esta sesión por
 * el contexto del tenant — el corte de caja luego suma por shift_id.
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
    .select('id, status, channel, customer_name, total, payment_method, created_at')
    .eq('tenant_id', ctx.tenantId)
    .in('channel', ['mostrador', 'direct'])
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !orders) return { ok: false, error: 'Error cargando órdenes' };

  // Conteo de items + estado de pago para cada orden.
  const orderIds = orders.map((o) => (o as { id: string }).id);
  if (orderIds.length === 0) return { ok: true, data: [] };

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from('order_items').select('order_id, qty').in('order_id', orderIds),
    supabase.from('order_payments').select('order_id').in('order_id', orderIds),
  ]);

  const itemsByOrder = new Map<string, number>();
  for (const it of (items ?? []) as { order_id: string; qty: number }[]) {
    itemsByOrder.set(it.order_id, (itemsByOrder.get(it.order_id) ?? 0) + it.qty);
  }
  const paidOrders = new Set(((payments ?? []) as { order_id: string }[]).map((p) => p.order_id));

  const result: ActiveOrder[] = orders.map((o) => {
    const row = o as {
      id: string;
      status: OrderStatus;
      channel: string;
      customer_name: string;
      total: number;
      payment_method: string | null;
      created_at: string;
    };
    return {
      id: row.id,
      folio: `${row.channel === 'direct' ? 'WEB' : 'POS'}-${row.id.slice(-6).toUpperCase()}`,
      status: row.status,
      channel: row.channel,
      customer_name: row.customer_name,
      total_cents: row.total,
      payment_method: row.payment_method,
      created_at: row.created_at,
      items_count: itemsByOrder.get(row.id) ?? 0,
      is_paid: paidOrders.has(row.id) || row.payment_method !== null,
    };
  });

  return { ok: true, data: result };
}

/**
 * Avanza el estado de una orden al siguiente (received → preparing → ready → delivered).
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
    .select('id, status')
    .eq('id', orderId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();

  if (loadErr || !order) return { ok: false, error: 'Orden no encontrada' };

  const currentStatus = (order as { status: OrderStatus }).status;
  const nextStatus = NEXT_STATUS[currentStatus];
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
