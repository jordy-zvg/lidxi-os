export const metadata = { title: 'Equipo' };

import { EquipoScreen } from '@/components/equipo/EquipoScreen';
import type { EmployeeRecord } from '@/components/equipo/EquipoScreen';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';

export default async function EquipoPage() {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from('employees_v2')
    .select('id, name, role, status, fingerprint_enrolled')
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  const employees: EmployeeRecord[] = (data ?? []).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    role: e.role as string,
    status: (e.status ?? 'activo') as 'activo' | 'pausado',
    fingerprint_enrolled: Boolean(e.fingerprint_enrolled),
  }));

  return <EquipoScreen employees={employees} />;
}
