'use server';

import {
  DELIVERY_PROVIDER_IDS,
  DELIVERY_PROVIDER_SCHEMAS,
  type DeliveryProviderId,
} from '@/lib/delivery-provider-schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { revalidatePath } from 'next/cache';

export type { DeliveryProviderId, DeliveryProviderStatus } from '@/lib/delivery-provider-schemas';

export interface DeliveryProviderRow {
  provider: DeliveryProviderId;
  status: 'disconnected' | 'pending' | 'connected' | 'error';
  credentials: Record<string, string>;
  connected_at: string | null;
  last_error: string | null;
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function loadDeliveryProviders(): Promise<DeliveryProviderRow[]> {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from('delivery_provider_connections')
    .select('provider, status, credentials, connected_at, last_error')
    .eq('tenant_id', tenantId);

  const byProvider = new Map<DeliveryProviderId, DeliveryProviderRow>();
  for (const row of (data ?? []) as DeliveryProviderRow[]) {
    byProvider.set(row.provider, row);
  }

  return DELIVERY_PROVIDER_IDS.map(
    (id) =>
      byProvider.get(id) ?? {
        provider: id,
        status: 'disconnected',
        credentials: {},
        connected_at: null,
        last_error: null,
      },
  );
}

export async function saveDeliveryProviderConnection(
  provider: DeliveryProviderId,
  credentials: Record<string, string>,
): Promise<ActionResult<DeliveryProviderRow>> {
  if (!DELIVERY_PROVIDER_IDS.includes(provider)) {
    return { ok: false, error: 'Proveedor no soportado.' };
  }

  // Sanitizar: solo guardar las llaves declaradas en el schema del proveedor.
  const allowedKeys = new Set(DELIVERY_PROVIDER_SCHEMAS[provider].fields.map((f) => f.name));
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(credentials)) {
    if (allowedKeys.has(k) && typeof v === 'string' && v.trim().length > 0) {
      clean[k] = v.trim();
    }
  }

  const missing = DELIVERY_PROVIDER_SCHEMAS[provider].fields
    .filter((f) => f.required && !clean[f.name])
    .map((f) => f.label);
  if (missing.length > 0) {
    return { ok: false, error: `Falta completar: ${missing.join(', ')}.` };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('delivery_provider_connections')
    .upsert(
      {
        tenant_id: tenantId,
        provider,
        status: 'pending',
        credentials: clean,
        connected_at: null,
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,provider' },
    )
    .select('provider, status, credentials, connected_at, last_error')
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/sitio-propio');
  revalidatePath('/sitio-propio');
  return { ok: true, data: data as DeliveryProviderRow };
}

export async function disconnectDeliveryProvider(
  provider: DeliveryProviderId,
): Promise<ActionResult<null>> {
  if (!DELIVERY_PROVIDER_IDS.includes(provider)) {
    return { ok: false, error: 'Proveedor no soportado.' };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('delivery_provider_connections')
    .update({
      status: 'disconnected',
      credentials: {},
      connected_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', tenantId)
    .eq('provider', provider);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/sitio-propio');
  revalidatePath('/sitio-propio');
  return { ok: true, data: null };
}
