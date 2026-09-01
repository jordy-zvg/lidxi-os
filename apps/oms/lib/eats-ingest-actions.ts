'use server';

import { requireEmployeeContext } from '@/lib/operations/employee-context';
import { createSupabaseServiceClient } from '@kobi/db';
import { type CentsMXN, type OrderItemModifier, cents, modifiersDelta } from '@kobi/shared';
import { revalidatePath } from 'next/cache';

/**
 * Ingesta de pedidos de Uber Eats capturados a mano (Sprint 19, H19.3).
 *
 * Es la implementación real de `MarketplaceProvider.ingestOrder` para el
 * adaptador manual. Vive en la capa de app y no en `@kobi/integrations` porque
 * escribe en la base y necesita `requireEmployeeContext()`; el paquete de
 * integraciones no importa `@kobi/db` ni resuelve sesión.
 *
 * Archivo aparte de `pos-actions.ts` a propósito: el POS de mostrador tiene su
 * propio insert y ensanchar su tipo `modifiers: never[]` cambiaría un flujo que
 * hoy funciona y está fuera de alcance. Aquí se COPIA el patrón condicional de
 * filas, no se refactoriza el original.
 */

export type EatsIngestResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface EatsLineInput {
  menuItemId: string;
  qty: number;
  unitPriceCents: CentsMXN;
  /** Nota libre para cocina. Vacío = sin nota. */
  note: string;
  /** Modificadores tecleados. En captura manual el delta es 0: el precio lo fija Uber. */
  modifiers: OrderItemModifier[];
}

export interface IngestEatsOrderInput {
  /** ID corto que muestra la tablet de Uber. Único por canal. */
  externalId: string;
  customerName: string | null;
  items: EatsLineInput[];
  totalCents: CentsMXN;
}

/** Nombre por defecto cuando el cajero omite el del cliente. */
const DEFAULT_CUSTOMER_NAME = 'Cliente Uber Eats';

export const ingestEatsOrder = async (
  input: IngestEatsOrderInput,
): Promise<EatsIngestResult<{ orderId: string; folio: string }>> => {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión operativa' };
  }

  const externalId = input.externalId.trim();
  if (!externalId) {
    return { ok: false, error: 'El ID de Uber es obligatorio.' };
  }
  if (input.items.length === 0) {
    return { ok: false, error: 'Agrega al menos un ítem al pedido.' };
  }

  const supabase = createSupabaseServiceClient();
  const now = new Date().toISOString();

  // Shim de branch_id legacy — mismo patrón que createSaleOrder en pos-actions.ts.
  // orders.branch_id es FK NOT NULL a la tabla legacy `branches`; branch_id_v2
  // lleva el identificador real. Decisión tomada: no migramos la FK en esta fase.
  const branchIdV2 = ctx.branchId;
  const { data: legacyBranchRow } = await supabase
    .from('branches')
    .select('id, restaurants!inner(tenant_id)')
    .eq('restaurants.tenant_id', ctx.tenantId)
    .limit(1)
    .maybeSingle();
  const legacyBranchId = (legacyBranchRow as { id: string } | null)?.id ?? null;
  if (!legacyBranchId) {
    return {
      ok: false,
      error:
        'No hay sucursal legacy configurada para este restaurante. Créala en Sucursales antes de capturar pedidos de Uber Eats.',
    };
  }

  // status inicial 'preparing', no 'received': la aceptación ya ocurrió en la
  // tablet de Uber. Obligar a un tap de "aceptar" en Kobi sería ceremonia.
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      tenant_id: ctx.tenantId,
      branch_id: legacyBranchId,
      branch_id_v2: branchIdV2,
      channel: 'eats',
      external_id: externalId,
      order_type: 'para_llevar',
      status: 'preparing',
      customer_name: input.customerName?.trim() || DEFAULT_CUSTOMER_NAME,
      // Uber no comparte dirección ni teléfono con el restaurante: el repartidor
      // es quien entrega. Nulos a propósito, no por falta de captura.
      customer_phone: null,
      customer_address: null,
      customer_lat: null,
      customer_lng: null,
      // Guardamos el total tal como lo cobra la plataforma. NO derivamos
      // subtotal/IVA: el bruto de Eats sin comisión descontada es engañoso y no
      // se muestra en ningún reporte hasta que exista el neto.
      subtotal: input.totalCents,
      tax: 0,
      total: input.totalCents,
      delivery_fee: 0,
      payment_method: null,
      payment_ref: null,
      accepted_at: now,
      ready_at: null,
      dispatched_at: null,
      delivered_at: null,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    // unique(channel, external_id) — protección gratuita contra la doble
    // captura cuando dos personas registran el mismo pedido de la tablet.
    if (orderErr?.code === '23505') {
      return {
        ok: false,
        error: `El pedido ${externalId} ya fue capturado. Búscalo en Pedidos.`,
      };
    }
    return {
      ok: false,
      error: `Error al registrar el pedido: ${orderErr?.message ?? 'desconocido'}`,
    };
  }

  const orderId = (order as { id: string }).id;

  // `order_items.modifiers` es jsonb. El tipo generado espera `Json`, y
  // `OrderItemModifier` (interface del dominio) no lo satisface: le falta la
  // index signature que `Json` exige. Serializamos en la frontera en vez de
  // ensanchar el tipo del dominio — la forma guardada es exactamente la que
  // produce el mapper de `@kobi/shared`, solo que como objeto plano.
  // `@kobi/db` no re-exporta `Json`, así que declaramos la forma serializada
  // aquí en vez de tocar el barrel del paquete.
  type SerializedModifier = { name: string; priceDelta: number };
  const toJsonModifiers = (mods: OrderItemModifier[]): SerializedModifier[] =>
    mods.map((m) => ({ name: m.name, priceDelta: m.priceDelta as number }));

  type OrderItemInsert = {
    order_id: string;
    menu_item_id: string;
    qty: number;
    unit_price: number;
    modifiers: SerializedModifier[];
    notes: string | null;
  };

  // Mismo patrón condicional que pos-actions.ts: explotar en filas de qty 1
  // SOLO cuando la línea trae nota o modificadores, para que cocina vea el
  // detalle en cada ticket. Sin detalle, una fila agrupada con qty.
  const orderItems: OrderItemInsert[] = input.items.flatMap((line) => {
    const note = line.note.trim();
    const hasDetail = note.length > 0 || line.modifiers.length > 0;
    // El delta va sobre el precio unitario; en captura manual es 0 porque el
    // precio lo fija Uber, pero el mapper deja la puerta abierta sin rediseño.
    const unitPrice = line.unitPriceCents + modifiersDelta(line.modifiers);

    if (hasDetail) {
      return Array.from<unknown, OrderItemInsert>({ length: line.qty }, () => ({
        order_id: orderId,
        menu_item_id: line.menuItemId,
        qty: 1,
        unit_price: unitPrice,
        modifiers: toJsonModifiers(line.modifiers),
        notes: note || null,
      }));
    }
    return [
      {
        order_id: orderId,
        menu_item_id: line.menuItemId,
        qty: line.qty,
        unit_price: unitPrice,
        modifiers: [],
        notes: null,
      },
    ];
  });

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) {
    return { ok: false, error: `Error al guardar los ítems: ${itemsErr.message}` };
  }

  // TODO[Fase 3]: enganchar aquí el disparo de impresión automática de la
  // comanda. Deliberadamente sin cablear: la validación física del papel es
  // requisito previo.

  revalidatePath('/pedidos');
  revalidatePath('/kds');

  const folio = `UE-${externalId.toUpperCase()}`;
  return { ok: true, data: { orderId, folio } };
};

/** Menú del tenant activo para los botones de captura rápida. */
export interface EatsMenuItem {
  id: string;
  name: string;
  category: string;
  basePriceCents: CentsMXN;
}

export const loadEatsMenu = async (): Promise<EatsIngestResult<EatsMenuItem[]>> => {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión operativa' };
  }
  const supabase = createSupabaseServiceClient();

  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, category, base_price')
    .eq('tenant_id', ctx.tenantId)
    .eq('active', true)
    .eq('status', 'active')
    .order('category')
    .order('name');

  if (error || !items) return { ok: false, error: 'Error cargando el menú' };

  return {
    ok: true,
    data: items.map((item) => ({
      id: (item as { id: string }).id,
      name: (item as { name: string }).name,
      category: (item as { category: string }).category,
      basePriceCents: cents((item as { base_price: number }).base_price),
    })),
  };
};
