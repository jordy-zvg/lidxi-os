export const metadata = { title: 'Ajustes' };

import { AjustesScreen } from '@/components/ajustes/AjustesScreen';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';

export const dynamic = 'force-dynamic';

export default async function AjustesAdminPage() {
  const { tenantId, tenantName } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, rfc, address, phone, plan, metadata')
    .eq('id', tenantId)
    .maybeSingle();

  const row = (tenant ?? {}) as {
    name?: string | null;
    rfc?: string | null;
    address?: string | null;
    phone?: string | null;
    plan?: string | null;
    metadata?: Record<string, unknown> | null;
  };

  return (
    <AjustesScreen
      tenant={{
        name: row.name ?? tenantName,
        rfc: row.rfc ?? null,
        address: row.address ?? null,
        phone: row.phone ?? null,
        plan: row.plan ?? null,
        operation_type: ((row.metadata ?? {}) as Record<string, unknown>).operation_type as
          | string
          | undefined,
      }}
    />
  );
}
