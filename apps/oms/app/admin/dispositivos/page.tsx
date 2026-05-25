export const metadata = { title: 'Dispositivos' };

import { DispositivosScreen } from '@/components/dispositivos/DispositivosScreen';
import type { DeviceRecord } from '@/components/dispositivos/DispositivosScreen';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient, listDevicesForTenant } from '@kobi/db';

export default async function DispositivosPage() {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();
  const rows = await listDevicesForTenant(supabase, tenantId);

  const devices: DeviceRecord[] = rows.map((d) => ({
    id: d.id,
    name: d.name,
    status: d.status,
    pairedAt: d.paired_at,
    lastSeenAt: d.last_seen_at,
  }));

  return <DispositivosScreen devices={devices} />;
}
