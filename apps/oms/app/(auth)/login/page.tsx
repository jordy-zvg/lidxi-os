export const metadata = { title: 'Iniciar sesión' };

import { getBranchId } from '@/lib/station';
import { resolveSingleMembership } from '@/lib/supabase/membership';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  createSupabaseServiceClient,
  getBranchWithRestaurant,
  getLastPosActivation,
} from '@kobi/db';
import { LoginShell } from './LoginShell';

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

  // Legacy path: single-tenant POS via BRANCH_ID env (Miztli demo).
  const legacyBranchId = getBranchId();
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

  // Neutral fallback: no session, no legacy branch — pure Kobi UI.
  return (
    <LoginShell
      stationName="Kobi"
      branch={{ id: '', name: '', restaurantName: '' }}
      lastActivation={null}
    />
  );
}
