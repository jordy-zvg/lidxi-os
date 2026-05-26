export const metadata = { title: 'Sucursales' };

import { SucursalesScreen } from '@/components/sucursales/SucursalesScreen';
import type { BranchRecord } from '@/components/sucursales/SucursalesScreen';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient, listBranchesForTenant } from '@kobi/db';

export default async function SucursalesPage() {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();
  const rows = await listBranchesForTenant(supabase, tenantId);

  const branches: BranchRecord[] = rows.map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    status: b.status,
    createdAt: b.created_at,
  }));

  return <SucursalesScreen branches={branches} />;
}
