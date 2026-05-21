'use server';

import { CHANNEL_IDS, CHANNEL_SCHEMAS, type ChannelId } from '@/lib/channel-schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { revalidatePath } from 'next/cache';

export type { ChannelId, ChannelStatus } from '@/lib/channel-schemas';

export interface ChannelRow {
  channel: ChannelId;
  status: 'disconnected' | 'pending' | 'connected' | 'error';
  credentials: Record<string, string>;
  connected_at: string | null;
  last_error: string | null;
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function loadChannels(): Promise<ChannelRow[]> {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from('channel_connections')
    .select('channel, status, credentials, connected_at, last_error')
    .eq('tenant_id', tenantId);

  const byChannel = new Map<ChannelId, ChannelRow>();
  for (const row of (data ?? []) as ChannelRow[]) {
    byChannel.set(row.channel, row);
  }

  // Garantizar que cada canal aparece en la lista (rellenar disconnected si no existe).
  return CHANNEL_IDS.map(
    (id) =>
      byChannel.get(id) ?? {
        channel: id,
        status: 'disconnected',
        credentials: {},
        connected_at: null,
        last_error: null,
      },
  );
}

export async function saveChannelConnection(
  channel: ChannelId,
  credentials: Record<string, string>,
): Promise<ActionResult<ChannelRow>> {
  if (!CHANNEL_IDS.includes(channel)) {
    return { ok: false, error: 'Canal no soportado.' };
  }

  // Sanitizar: solo guardar las llaves declaradas en el schema del canal.
  const allowedKeys = new Set(CHANNEL_SCHEMAS[channel].fields.map((f) => f.name));
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(credentials)) {
    if (allowedKeys.has(k) && typeof v === 'string' && v.trim().length > 0) {
      clean[k] = v.trim();
    }
  }

  // Validar required.
  const missing = CHANNEL_SCHEMAS[channel].fields
    .filter((f) => f.required && !clean[f.name])
    .map((f) => f.label);
  if (missing.length > 0) {
    return { ok: false, error: `Falta completar: ${missing.join(', ')}.` };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  // Upsert por (tenant_id, channel). Status queda en 'pending' porque no
  // validamos contra la API real todavía.
  const { data, error } = await supabase
    .from('channel_connections')
    .upsert(
      {
        tenant_id: tenantId,
        channel,
        status: 'pending',
        credentials: clean,
        connected_at: null,
        last_error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,channel' },
    )
    .select('channel, status, credentials, connected_at, last_error')
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/integraciones');
  return { ok: true, data: data as ChannelRow };
}

export async function disconnectChannel(channel: ChannelId): Promise<ActionResult<null>> {
  if (!CHANNEL_IDS.includes(channel)) {
    return { ok: false, error: 'Canal no soportado.' };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('channel_connections')
    .update({
      status: 'disconnected',
      credentials: {},
      connected_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('tenant_id', tenantId)
    .eq('channel', channel);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/integraciones');
  return { ok: true, data: null };
}
