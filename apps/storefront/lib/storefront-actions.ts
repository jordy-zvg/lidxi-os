'use server';

import { resolveOmsBaseUrl, resolveStorefrontOrigin } from '@/lib/origin';
import { createSupabaseServiceClient } from '@kobi/db';
import { MercadoPago } from '@kobi/integrations';
import { revalidatePath } from 'next/cache';

export type StorefrontResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface StorefrontTenant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
}

export interface StorefrontMenuItem {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  category: string | null;
  active: boolean;
}

export async function loadTenantBySlug(slug: string): Promise<StorefrontTenant | null> {
  const supabase = createSupabaseServiceClient();
  // El slug del storefront es restaurants.slug (visible al cliente).
  // tenants.slug es un identificador interno autogenerado (ej. "restaurante-76c0b97c")
  // y NO debe usarse en URLs públicas. Construimos StorefrontTenant directo desde
  // restaurants para que tenant.slug == restaurants.slug en toda la app.
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('tenant_id, name, slug, address')
    .eq('slug', slug)
    .maybeSingle();
  if (!restaurant?.tenant_id) return null;

  return {
    id: (restaurant as { tenant_id: string }).tenant_id,
    name: (restaurant as { name: string }).name,
    slug: (restaurant as { slug: string }).slug,
    address: (restaurant as { address: string | null }).address,
    phone: null,
  };
}

export async function loadTenantMenu(
  tenantId: string,
): Promise<StorefrontResult<StorefrontMenuItem[]>> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, description, base_price, photo_url, category, active')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name', { ascending: true });
  if (error) return { ok: false, error: error.message };
  const items: StorefrontMenuItem[] = (data ?? []).map((row) => {
    const r = row as {
      id: string;
      name: string;
      description: string | null;
      base_price: number;
      photo_url: string | null;
      category: string | null;
      active: boolean;
    };
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      price_cents: r.base_price,
      image_url: r.photo_url,
      category: r.category,
      active: r.active,
    };
  });
  return { ok: true, data: items };
}

export interface StorefrontLanding {
  tenantId: string;
  name: string;
  slug: string;
  brandColor: string | null;
  address: string | null;
  featured: StorefrontMenuItem[];
}

/**
 * Datos para el landing público de un restaurante: identidad (nombre, color de
 * marca, dirección) + items destacados del menú. Resuelve por restaurants.slug
 * (igual que loadTenantBySlug). Prioriza items con foto para los destacados.
 */
export async function loadRestaurantLanding(slug: string): Promise<StorefrontLanding | null> {
  const supabase = createSupabaseServiceClient();
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('tenant_id, name, slug, brand_color, address')
    .eq('slug', slug)
    .maybeSingle();

  const r = restaurant as {
    tenant_id: string | null;
    name: string;
    slug: string;
    brand_color: string | null;
    address: string | null;
  } | null;
  if (!r?.tenant_id) return null;

  const menu = await loadTenantMenu(r.tenant_id);
  const items = menu.ok ? menu.data : [];
  const withPhoto = items.filter((i) => i.image_url);
  const featured = (withPhoto.length >= 3 ? withPhoto : items).slice(0, 6);

  return {
    tenantId: r.tenant_id,
    name: r.name,
    slug: r.slug,
    brandColor: r.brand_color,
    address: r.address,
    featured,
  };
}

export interface CreateDirectOrderInput {
  tenantSlug: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{ menuItemId: string; qty: number }>;
}

export interface CreateDirectOrderResult {
  orderId: string;
  totalCents: number;
  preferenceId: string;
  initPoint: string;
}

/**
 * Crea una orden de canal 'direct' en el OMS + abre una preference de MP.
 * Lo llama el checkout del storefront. Devuelve init_point para redirigir
 * al cliente a la página de pago (real o mock).
 */
export async function createDirectOrderAndPreference(
  input: CreateDirectOrderInput,
): Promise<StorefrontResult<CreateDirectOrderResult>> {
  if (!input.customerName.trim()) {
    return { ok: false, error: 'Captura tu nombre' };
  }
  if (!input.customerPhone.trim()) {
    return { ok: false, error: 'Captura un teléfono de contacto' };
  }
  if (!input.customerEmail.trim()) {
    return { ok: false, error: 'Captura un email para el comprobante' };
  }
  if (!input.customerAddress.trim()) {
    return { ok: false, error: 'Captura la dirección de entrega' };
  }
  if (input.items.length === 0) {
    return { ok: false, error: 'El carrito está vacío' };
  }

  const tenant = await loadTenantBySlug(input.tenantSlug);
  if (!tenant) return { ok: false, error: 'Restaurante no encontrado' };

  const supabase = createSupabaseServiceClient();

  // Cargar items del menú para validar y calcular total con precios server.
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const { data: menuRows, error: menuErr } = await supabase
    .from('menu_items')
    .select('id, name, base_price, active, tenant_id')
    .in('id', menuItemIds)
    .eq('tenant_id', tenant.id);

  if (menuErr || !menuRows) {
    return { ok: false, error: 'No se pudo cargar el catálogo' };
  }

  const menuById = new Map(
    (menuRows as { id: string; name: string; base_price: number; active: boolean }[]).map((r) => [
      r.id,
      r,
    ]),
  );

  let subtotal = 0;
  const orderItemRows: Array<{
    menu_item_id: string;
    qty: number;
    unit_price: number;
  }> = [];
  const mpItems: MercadoPago.MercadoPagoItem[] = [];

  for (const it of input.items) {
    const menuItem = menuById.get(it.menuItemId);
    if (!menuItem) {
      return { ok: false, error: `Item ${it.menuItemId} no disponible` };
    }
    if (!menuItem.active) continue;
    const lineTotal = menuItem.base_price * it.qty;
    subtotal += lineTotal;
    orderItemRows.push({
      menu_item_id: it.menuItemId,
      qty: it.qty,
      unit_price: menuItem.base_price,
    });
    mpItems.push({
      id: it.menuItemId,
      title: menuItem.name,
      quantity: it.qty,
      unitPrice: menuItem.base_price / 100, // MP usa pesos enteros/decimales
    });
  }

  if (orderItemRows.length === 0) {
    return { ok: false, error: 'Ningún item está disponible' };
  }

  // branches legacy no tiene tenant_id — resolvemos vía join con restaurants,
  // igual que pos-actions.ts para satisfacer la FK NOT NULL de orders.branch_id.
  const { data: branchRow } = await supabase
    .from('branches')
    .select('id, restaurants!inner(tenant_id)')
    .eq('restaurants.tenant_id', tenant.id)
    .limit(1)
    .maybeSingle();
  if (!branchRow) {
    return { ok: false, error: 'El restaurante no tiene sucursal configurada' };
  }
  const branchId = (branchRow as { id: string }).id;

  // Crear order.
  const total = subtotal; // sin IVA adicional ni delivery_fee de momento
  const { data: created, error: orderErr } = await supabase
    .from('orders')
    .insert({
      tenant_id: tenant.id,
      branch_id: branchId,
      channel: 'direct',
      status: 'received',
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      customer_address: input.customerAddress.trim(),
      subtotal,
      total,
    })
    .select('id')
    .single();

  if (orderErr || !created) {
    return { ok: false, error: orderErr?.message ?? 'No se pudo crear la orden' };
  }
  const orderId = (created as { id: string }).id;

  const { error: itemsErr } = await supabase.from('order_items').insert(
    orderItemRows.map((row) => ({
      order_id: orderId,
      ...row,
    })),
  );
  if (itemsErr) {
    return { ok: false, error: itemsErr.message };
  }

  // Crear preference (mock o real según MP_MODE).
  // storefrontBase se deriva de headers del request (robusto a env vars
  // faltantes en builds tempranos en Railway). omsBase requiere env var
  // porque es otro servicio — lanza error explícito si falta en prod.
  const mp = MercadoPago.createMercadoPagoClient();
  const storefrontBase = resolveStorefrontOrigin();
  const omsBase = resolveOmsBaseUrl();

  const prefRes = await mp.createPreference({
    orderId,
    tenantId: tenant.id,
    items: mpItems,
    payerEmail: input.customerEmail.trim(),
    storefrontBaseUrl: storefrontBase,
    omsBaseUrl: omsBase,
    restaurantSlug: tenant.slug,
  });

  if (!prefRes.ok) {
    return { ok: false, error: prefRes.error.message };
  }

  revalidatePath(`/${tenant.slug}`);
  return {
    ok: true,
    data: {
      orderId,
      totalCents: total,
      preferenceId: prefRes.data.id,
      initPoint: prefRes.data.initPoint,
    },
  };
}

/**
 * Simula que MP envió el webhook tras un pago exitoso (sólo en mock mode).
 * Llama al endpoint /api/webhooks/mercado-pago del OMS con un payload
 * compatible — la misma ruta que recibirá el webhook real.
 */
export async function triggerMockMercadoPagoWebhook(
  preferenceId: string,
  status: 'paid' | 'failed' | 'cancelled' = 'paid',
): Promise<StorefrontResult<null>> {
  const event = MercadoPago.simulateWebhook(preferenceId, status);
  if (!event) return { ok: false, error: 'Preference no encontrada' };

  const omsBase = resolveOmsBaseUrl();
  // Llamamos al webhook con un header `x-mock-mp: true` para que el endpoint
  // sepa que es un evento simulado (sin firma HMAC).
  try {
    const res = await fetch(`${omsBase}/api/webhooks/mercado-pago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mock-mp': 'true',
      },
      body: JSON.stringify({
        action: 'payment.created',
        type: 'payment',
        data: { id: event.paymentId },
        // Inyectamos los campos que el handler usa:
        _mock: event,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Webhook ${res.status}: ${text}` };
    }
    return { ok: true, data: null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'webhook fetch failed' };
  }
}
