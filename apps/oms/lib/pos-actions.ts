'use server';

import { createSupabaseServiceClient } from '@lidxi/db';
import { type CentsMXN, cents, pesos } from '@lidxi/shared';
import type { MenuItemData, PaymentMethod, TicketLine } from '../components/pos/types';
import { getBranchId } from './station';

export type PosActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Cargar menú
// ---------------------------------------------------------------------------

export const loadMenu = async (): Promise<PosActionResult<MenuItemData[]>> => {
  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();

  const { data: branch, error: branchErr } = await supabase
    .from('branches')
    .select('restaurant_id')
    .eq('id', branchId)
    .single();

  if (branchErr || !branch) return { ok: false, error: 'Branch no encontrado' };

  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, category, base_price, description')
    .eq('restaurant_id', branch.restaurant_id)
    .eq('active', true)
    .order('category')
    .order('name');

  if (error || !items) return { ok: false, error: 'Error cargando el menú' };

  const menuItems: MenuItemData[] = items.map((item) => {
    const base = item.base_price as number;
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      basePriceCents: cents(base),
      displayPriceCents: pesos((base / 100) * 1.16),
      description: item.description,
    };
  });

  return { ok: true, data: menuItems };
};

// ---------------------------------------------------------------------------
// Crear venta
// ---------------------------------------------------------------------------

export interface CreateSaleInput {
  customerName: string;
  customerPhone: string | null;
  items: TicketLine[];
  totalCents: CentsMXN;
  taxCents: CentsMXN;
  netCents: CentsMXN;
  paymentMethod: PaymentMethod;
  paidCents?: CentsMXN;
  changeCents?: CentsMXN;
}

export const createSaleOrder = async (
  input: CreateSaleInput,
): Promise<PosActionResult<{ orderId: string; folio: string }>> => {
  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();
  const now = new Date().toISOString();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      branch_id: branchId,
      channel: 'mostrador',
      status: 'delivered',
      customer_name: input.customerName || 'Mostrador',
      customer_phone: input.customerPhone,
      subtotal: input.netCents,
      tax: input.taxCents,
      total: input.totalCents,
      delivery_fee: 0,
      payment_method: input.paymentMethod,
      payment_ref: input.changeCents ? `cambio:${input.changeCents}` : null,
      accepted_at: now,
      ready_at: now,
      dispatched_at: now,
      delivered_at: now,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return {
      ok: false,
      error: `Error al registrar la venta: ${orderErr?.message ?? 'desconocido'}`,
    };
  }

  // Líneas con nota se guardan con qty=1 cada unidad (para cocina).
  // Líneas sin nota mantienen su qty agrupado.
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
      // Una row por unidad para que la cocina vea la nota en cada ticket
      return Array.from<unknown, OrderItemInsert>({ length: line.qty }, () => ({
        order_id: order.id,
        menu_item_id: line.menuItemId,
        qty: 1,
        unit_price: line.unitPriceCents,
        modifiers: [],
        notes: line.note,
      }));
    }
    return [
      {
        order_id: order.id,
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

  const folio = `POS-${order.id.slice(-6).toUpperCase()}`;
  return { ok: true, data: { orderId: order.id, folio } };
};
