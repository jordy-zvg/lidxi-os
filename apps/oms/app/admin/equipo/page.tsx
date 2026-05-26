export const metadata = { title: 'Equipo' };

import { EquipoScreen } from '@/components/equipo/EquipoScreen';
import type { BranchOption, EmployeeRecord } from '@/components/equipo/EquipoScreen';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { createSupabaseServiceClient, listActiveBranchesForTenant } from '@kobi/db';

export default async function EquipoPage() {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const [employeesRes, branchRows] = await Promise.all([
    supabase
      .from('employees_v2')
      .select('id, name, role, status, fingerprint_enrolled')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true }),
    listActiveBranchesForTenant(createSupabaseServiceClient(), tenantId),
  ]);

  const employees: EmployeeRecord[] = (employeesRes.data ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    role: e.role as string,
    status: (e.status ?? 'activo') as 'activo' | 'pausado',
    fingerprint_enrolled: Boolean(e.fingerprint_enrolled),
  }));

  const branches: BranchOption[] = branchRows.map((b) => ({ id: b.id, name: b.name }));

  return <EquipoScreen employees={employees} branches={branches} />;
}
