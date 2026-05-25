import { randomInt } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Queries para emparejamiento de tablets POS.
 *
 * Estos helpers asumen `SupabaseClient` con service role: el flujo /login
 * resuelve tenant antes de tener cualquier sesión Supabase, así que no hay
 * `auth.uid()` para satisfacer las policies de RLS. Las server actions del
 * admin (que sí tienen sesión authenticated) también usan service role por
 * simetría y porque `requireTenant()` ya validó la membresía.
 */

export interface PosDeviceRow {
  id: string;
  tenant_id: string;
  branch_id: string | null;
  name: string;
  status: 'active' | 'revoked';
  paired_at: string;
  last_seen_at: string | null;
  created_at: string;
}

export interface PosPairingCodeRow {
  id: string;
  code: string;
  tenant_id: string;
  branch_id: string | null;
  device_name: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

// Alfabeto sin caracteres ambiguos (O/0, I/1, L). 32 chars → 32^6 ≈ 1B combos.
const PAIRING_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PAIRING_CODE_LENGTH = 6;
const PAIRING_TTL_MIN_DEFAULT = 10;
const PAIRING_CREATE_MAX_RETRIES = 5;

const randomPairingCode = (): string => {
  let out = '';
  for (let i = 0; i < PAIRING_CODE_LENGTH; i++) {
    out += PAIRING_ALPHABET[randomInt(0, PAIRING_ALPHABET.length)];
  }
  return out;
};

export interface CreatePairingCodeInput {
  tenantId: string;
  branchId: string | null;
  deviceName: string;
  ttlMinutes?: number;
}

export const createPairingCode = async (
  supabase: SupabaseClient,
  input: CreatePairingCodeInput,
): Promise<{ code: string; expiresAt: string } | null> => {
  const ttl = input.ttlMinutes ?? PAIRING_TTL_MIN_DEFAULT;
  const expiresAt = new Date(Date.now() + ttl * 60_000).toISOString();

  for (let attempt = 0; attempt < PAIRING_CREATE_MAX_RETRIES; attempt++) {
    const code = randomPairingCode();
    const { data, error } = await supabase
      .from('pos_pairing_codes')
      .insert({
        code,
        tenant_id: input.tenantId,
        branch_id: input.branchId,
        device_name: input.deviceName,
        expires_at: expiresAt,
      })
      .select('code, expires_at')
      .single();

    if (!error && data) {
      return { code: data.code as string, expiresAt: data.expires_at as string };
    }
    // 23505 = unique_violation → colisión de code, reintenta. Otros errores: aborta.
    if (error?.code !== '23505') return null;
  }
  return null;
};

export interface ConsumedPairingCode {
  tenantId: string;
  branchId: string | null;
  deviceName: string;
}

/**
 * Marca el código como usado y devuelve sus datos, atómicamente.
 * UPDATE con guards `used_at IS NULL AND expires_at > now()` previene
 * carreras: si dos requests llegan con el mismo code, solo una matchea.
 */
export const consumePairingCode = async (
  supabase: SupabaseClient,
  code: string,
): Promise<ConsumedPairingCode | null> => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('pos_pairing_codes')
    .update({ used_at: nowIso })
    .eq('code', code)
    .is('used_at', null)
    .gt('expires_at', nowIso)
    .select('tenant_id, branch_id, device_name')
    .maybeSingle();

  if (error || !data) return null;
  return {
    tenantId: data.tenant_id as string,
    branchId: (data.branch_id as string | null) ?? null,
    deviceName: data.device_name as string,
  };
};

export interface RegisterDeviceInput {
  tenantId: string;
  branchId: string | null;
  name: string;
  tokenHash: string;
}

export const registerDevice = async (
  supabase: SupabaseClient,
  input: RegisterDeviceInput,
): Promise<{ id: string } | null> => {
  const { data, error } = await supabase
    .from('pos_devices')
    .insert({
      tenant_id: input.tenantId,
      branch_id: input.branchId,
      name: input.name,
      device_token_hash: input.tokenHash,
    })
    .select('id')
    .single();

  if (error || !data) return null;
  return { id: data.id as string };
};

/**
 * Resuelve un dispositivo ACTIVO por hash del token. Filtra status='active'
 * para que un device revocado se trate exactamente igual que uno inexistente
 * (la tablet caerá a la PairingShell).
 */
export const findActiveDeviceByTokenHash = async (
  supabase: SupabaseClient,
  tokenHash: string,
): Promise<PosDeviceRow | null> => {
  const { data, error } = await supabase
    .from('pos_devices')
    .select('id, tenant_id, branch_id, name, status, paired_at, last_seen_at, created_at')
    .eq('device_token_hash', tokenHash)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return null;
  return data as PosDeviceRow;
};

export const touchDeviceLastSeen = async (
  supabase: SupabaseClient,
  deviceId: string,
): Promise<void> => {
  await supabase
    .from('pos_devices')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', deviceId);
};

export const listDevicesForTenant = async (
  supabase: SupabaseClient,
  tenantId: string,
): Promise<PosDeviceRow[]> => {
  const { data, error } = await supabase
    .from('pos_devices')
    .select('id, tenant_id, branch_id, name, status, paired_at, last_seen_at, created_at')
    .eq('tenant_id', tenantId)
    .order('paired_at', { ascending: false });

  if (error || !data) return [];
  return data as PosDeviceRow[];
};

export const revokeDevice = async (
  supabase: SupabaseClient,
  deviceId: string,
  tenantId: string,
): Promise<boolean> => {
  const { error, count } = await supabase
    .from('pos_devices')
    .update({ status: 'revoked' }, { count: 'exact' })
    .eq('id', deviceId)
    .eq('tenant_id', tenantId)
    .eq('status', 'active');

  if (error) return false;
  return (count ?? 0) > 0;
};
