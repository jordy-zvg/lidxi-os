export const metadata = { title: 'Iniciar sesión' };

import { readDeviceCookie } from '@/lib/devices/cookie';
import { hashDeviceToken } from '@/lib/devices/token';
import { getBranchId } from '@/lib/station';
import { resolveSingleMembership } from '@/lib/supabase/membership';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  createSupabaseServiceClient,
  findActiveDeviceByTokenHash,
  getBranchWithRestaurant,
  getLastPosActivation,
  touchDeviceLastSeen,
} from '@kobi/db';
import { LoginShell } from './LoginShell';
import { PairingShell } from './PairingShell';

export default async function LoginPage() {
  // Detect tenant via Supabase session (admin coming from "Abrir la operación").
  const userClient = createSupabaseServerClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (user) {
    const { data: rows } = await userClient
      .from('user_tenants')
      .select('tenant_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    const membership = resolveSingleMembership(rows, 'login.tenantDetect', user.id);
    if (membership?.tenant_id) {
      const { data: tenant } = await userClient
        .from('tenants')
        .select('name')
        .eq('id', membership.tenant_id)
        .single();
      const { data: branch } = await userClient
        .from('branches_v2')
        .select('id,name')
        .eq('tenant_id', membership.tenant_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      return (
        <LoginShell
          stationName={branch?.name ?? 'Estación principal'}
          branch={{
            id: (branch?.id as string | undefined) ?? '',
            name: branch?.name ?? 'Sucursal',
            restaurantName: (tenant?.name as string | undefined) ?? 'Tu restaurante',
          }}
          lastActivation={null}
          tenantId={membership.tenant_id}
        />
      );
    }
  }

  // Camino 2: cookie de dispositivo emparejado.
  // Resuelve tenant por hash del token. Device 'revoked' → tratado como
  // inexistente (la query filtra status='active') → cae al siguiente camino.
  const deviceToken = readDeviceCookie();
  if (deviceToken) {
    const svc = createSupabaseServiceClient();
    const device = await findActiveDeviceByTokenHash(svc, hashDeviceToken(deviceToken));
    if (device) {
      // Resuelve nombre del tenant + branch para el shell (mismo patrón que admin).
      const { data: tenant } = await svc
        .from('tenants')
        .select('name')
        .eq('id', device.tenant_id)
        .single();
      const { data: branch } = await svc
        .from('branches_v2')
        .select('id,name')
        .eq('tenant_id', device.tenant_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Fire-and-forget: actualiza last_seen_at sin bloquear el render.
      void touchDeviceLastSeen(svc, device.id);

      return (
        <LoginShell
          stationName={device.name}
          branch={{
            id: (branch?.id as string | undefined) ?? '',
            name: (branch?.name as string | undefined) ?? 'Sucursal',
            restaurantName: (tenant?.name as string | undefined) ?? 'Tu restaurante',
          }}
          lastActivation={null}
          tenantId={device.tenant_id}
          deviceBranchId={device.branch_id}
        />
      );
    }
  }

  // Camino 3: legacy single-tenant POS via BRANCH_ID env (demo / respaldo).
  // getBranchId() lanza si no está seteado — tratamos la ausencia como "sin
  // respaldo legacy" para que el flujo caiga al PairingShell, no a un 500.
  let legacyBranchId: string | null = null;
  try {
    legacyBranchId = getBranchId();
  } catch {
    legacyBranchId = null;
  }
  if (legacyBranchId) {
    const svc = createSupabaseServiceClient();
    const [branch, lastActivation] = await Promise.all([
      getBranchWithRestaurant(svc, legacyBranchId),
      getLastPosActivation(svc, legacyBranchId),
    ]);
    if (branch) {
      return (
        <LoginShell
          stationName={branch.name}
          branch={{
            id: branch.id,
            name: branch.name,
            restaurantName: branch.restaurant.name,
          }}
          lastActivation={lastActivation}
        />
      );
    }
  }

  // Camino 4: ni admin, ni device, ni legacy → pantalla de emparejar.
  return <PairingShell />;
}
