'use server';

import { requireEmployeeContext } from '@/lib/operations/employee-context';
import { createSupabaseServiceClient } from '@kobi/db';
import { type CentsMXN, cents, pesos } from '@kobi/shared';
import { revalidatePath } from 'next/cache';
import type { MenuItemData, PaymentMethod, TicketLine } from '../components/pos/types';

export type PosActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Cargar menú del tenant del empleado activo
// ---------------------------------------------------------------------------

export const loadMenu = async (): Promise<PosActionResult<MenuItemData[]>> => {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión operativa' };
  }
  const supabase = createSupabaseServiceClient();

  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, category, base_price, description')
    .eq('tenant_id', ctx.tenantId)
    .eq('active', true)
    .order('category')
    .order('name');

  if (error || !items) return { ok: false, error: 'Error cargando el menú' };

  const menuItems: MenuItemData[] = items.map((item) => {
    const base = (item as { base_price: number }).base_price;
    return {
      id: (item as { id: string }).id,
      name: (item as { name: string }).name,
      category: (item as { category: string }).category,
      basePriceCents: cents(base),
      // Display = base + IVA 16% (sin tocar el precio base; lo desglosamos al cobrar).
      displayPriceCents: pesos((base / 100) * 1.16),
      description: (item as { description: string | null }).description,
    };
  });

  return { ok: true, data: menuItems };
};

// ---------------------------------------------------------------------------
// Crear orden de mostrador (estado inicial: nueva)
// ---------------------------------------------------------------------------

export interface CreateSaleInput {
  customerName: string;
  customerPhone: string | null;
  items: TicketLine[];
  totalCents: CentsMXN;
  taxCents: CentsMXN;
  netCents: CentsMXN;
  /**
   * Cuando se pasa, el flujo es "captura + cobro en una sola transacción"
   * (modo mostrador clásico). Sin paymentMethod, la orden queda 'received'
   * pendiente de cobro posterior desde /pedidos.
   */
  paymentMethod?: PaymentMethod;
  paidCents?: CentsMXN;
  changeCents?: CentsMXN;
}

export const createSaleOrder = async (
  input: CreateSaleInput,
): Promise<PosActionResult<{ orderId: string; folio: string }>> => {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión operativa' };
  }
  const supabase = createSupabaseServiceClient();
  const now = new Date().toISOString();

  // Sprint 14: ctx.branchId ahora es la sucursal V2 explícita de la sesión
  // (employee-context la garantiza desde el JWT post-activación).
  // orders.branch_id es FK NOT NULL a la tabla legacy `branches`, así que
  // necesitamos un branch_id legacy "shim" para satisfacer la FK. orders.branch_id_v2
  // lleva el identificador real (FK a branches_v2). Cuando todos los callers escriban
  // v2 podemos hacer branch_id legacy nullable (ticket aparte).
  const branchIdV2 = ctx.branchId;
  const { data: legacyBranchRow } = await supabase
    .from('branches')
    .select('id, restaurants!inner(tenant_id)')
    .eq('restaurants.tenant_id', ctx.tenantId)
    .limit(1)
    .maybeSingle();
  const legacyBranchId = (legacyBranchRow as { id: string } | null)?.id ?? null;
  if (!legacyBranchId) {
    return { ok: false, error: 'No hay sucursal legacy configurada para satisfacer la FK.' };
  }

  // Si se cobra al crear (modo mostrador clásico), marcamos delivered de una.
  // Si no, queda en 'received' (= nuevo) para avanzar después.
  const willChargeNow = !!input.paymentMethod;
  const initialStatus = willChargeNow ? 'delivered' : 'received';
  const timestamps = willChargeNow
    ? { accepted_at: now, ready_at: now, dispatched_at: now, delivered_at: now }
    : { accepted_at: null, ready_at: null, dispatched_at: null, delivered_at: null };

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      tenant_id: ctx.tenantId,
      branch_id: legacyBranchId,
      branch_id_v2: branchIdV2,
      channel: 'mostrador',
      status: initialStatus,
      customer_name: input.customerName || 'Mostrador',
      customer_phone: input.customerPhone,
      subtotal: input.netCents,
      tax: input.taxCents,
      total: input.totalCents,
      delivery_fee: 0,
      payment_method: willChargeNow ? input.paymentMethod : null,
      payment_ref: null,
      ...timestamps,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return {
      ok: false,
      error: `Error al registrar la venta: ${orderErr?.message ?? 'desconocido'}`,
    };
  }

  type OrderItemInsert = {
    order_id: string;
    menu_item_id: string;
    qty: number;
    unit_price: number;
    modifiers: never[];
    notes: string | null;
  };

  const orderItems: OrderItemInsert[] = input.items.flatMap((line) => {
    if (line.note) {
      // Una row por unidad para que la cocina vea la nota en cada ticket.
      return Array.from<unknown, OrderItemInsert>({ length: line.qty }, () => ({
        order_id: (order as { id: string }).id,
        menu_item_id: line.menuItemId,
        qty: 1,
        unit_price: line.unitPriceCents,
        modifiers: [],
        notes: line.note,
      }));
    }
    return [
      {
        order_id: (order as { id: string }).id,
        menu_item_id: line.menuItemId,
        qty: line.qty,
        unit_price: line.unitPriceCents,
        modifiers: [],
        notes: null,
      },
    ];
  });

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) {
    return { ok: false, error: `Error al guardar los ítems: ${itemsErr.message}` };
  }

  // Si se cobró en la creación, registrar el pago en order_payments.
  if (willChargeNow && input.paymentMethod) {
    const { error: payErr } = await supabase.from('order_payments').insert({
      tenant_id: ctx.tenantId,
      order_id: (order as { id: string }).id,
      shift_id: ctx.shiftId,
      employee_id_v2: ctx.employeeIdV2,
      method: input.paymentMethod,
      amount_cents: input.totalCents,
      cash_received_cents:
        input.paymentMethod === 'cash' ? (input.paidCents ?? input.totalCents) : null,
      change_given_cents: input.paymentMethod === 'cash' ? (input.changeCents ?? 0) : null,
    });
    if (payErr) {
      // La orden ya está creada — devolvemos el id pero reportamos el error.
      return { ok: false, error: `Orden creada pero falló registrar el cobro: ${payErr.message}` };
    }
  }

  revalidatePath('/pedidos');

  const folio = `POS-${(order as { id: string }).id.slice(-6).toUpperCase()}`;
  return { ok: true, data: { orderId: (order as { id: string }).id, folio } };
};
