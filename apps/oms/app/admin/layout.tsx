import AdminShell from '@/components/admin/AdminShell';
import { requireTenant } from '@/lib/supabase/tenant-guard';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { tenantName } = await requireTenant();

  return <AdminShell tenantName={tenantName}>{children}</AdminShell>;
}
