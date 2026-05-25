'use server';

import { setDeviceCookie } from '@/lib/devices/cookie';
import { generateDeviceToken, hashDeviceToken } from '@/lib/devices/token';
import { consumePairingCode, createSupabaseServiceClient, registerDevice } from '@kobi/db';

export type PairDeviceResult = { ok: true } | { ok: false; error: string };

const sanitizeCode = (raw: string): string | null => {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return null;
  return code;
};

export async function pairDevice(codeRaw: string): Promise<PairDeviceResult> {
  const code = sanitizeCode(codeRaw);
  if (!code) return { ok: false, error: 'Código inválido.' };

  const supabase = createSupabaseServiceClient();

  const consumed = await consumePairingCode(supabase, code);
  if (!consumed) {
    return { ok: false, error: 'Código no válido, expirado o ya usado.' };
  }

  const rawToken = generateDeviceToken();
  const tokenHash = hashDeviceToken(rawToken);

  const device = await registerDevice(supabase, {
    tenantId: consumed.tenantId,
    branchId: consumed.branchId,
    name: consumed.deviceName,
    tokenHash,
  });
  if (!device) {
    return { ok: false, error: 'No se pudo registrar el dispositivo. Intenta de nuevo.' };
  }

  setDeviceCookie(rawToken);
  return { ok: true };
}
