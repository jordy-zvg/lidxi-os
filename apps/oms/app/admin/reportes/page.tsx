export const metadata = { title: 'Reportes' };

import { ReportesScreen } from '@/components/reportes/ReportesScreen';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient, listActiveBranchesForTenant } from '@kobi/db';

export default async function ReportesAdminPage() {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();
  const branchRows = await listActiveBranchesForTenant(supabase, tenantId);
  const branches = branchRows.map((b) => ({ id: b.id, name: b.name }));
  return <ReportesScreen branches={branches} />;
}
