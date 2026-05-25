'use server';

import { requireTenant } from '@/lib/supabase/tenant-guard';
import {
  createPairingCode,
  createSupabaseServiceClient,
  revokeDevice as dbRevokeDevice,
} from '@kobi/db';
import { revalidatePath } from 'next/cache';

export type GeneratePairingCodeResult =
  | { ok: true; code: string; expiresAt: string }
  | { ok: false; error: string };

export type RevokeDeviceResult = { ok: true } | { ok: false; error: string };

const DEVICE_NAME_MAX = 80;

export async function generatePairingCode(
  deviceNameRaw: string,
): Promise<GeneratePairingCodeResult> {
  const deviceName = deviceNameRaw?.trim();
  if (!deviceName || deviceName.length < 2) {
    return { ok: false, error: 'Dale un nombre al dispositivo (mín. 2 caracteres).' };
  }
  if (deviceName.length > DEVICE_NAME_MAX) {
    return { ok: false, error: `Máximo ${DEVICE_NAME_MAX} caracteres.` };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();

  const result = await createPairingCode(supabase, {
    tenantId,
    branchId: null,
    deviceName,
  });
  if (!result) {
    return { ok: false, error: 'No se pudo generar el código. Intenta de nuevo.' };
  }

  revalidatePath('/admin/dispositivos');
  return { ok: true, code: result.code, expiresAt: result.expiresAt };
}

export async function revokeDevice(deviceId: string): Promise<RevokeDeviceResult> {
  if (!deviceId) return { ok: false, error: 'Dispositivo inválido.' };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();

  const ok = await dbRevokeDevice(supabase, deviceId, tenantId);
  if (!ok) {
    return { ok: false, error: 'No se pudo revocar (ya estaba revocado o no existe).' };
  }

  revalidatePath('/admin/dispositivos');
  return { ok: true };
}
