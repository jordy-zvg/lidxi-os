import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './server';

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  userId: string;
  role: string;
}

/**
 * Returns the authenticated user's tenant context or redirects to /ingresar.
 * Use in Server Components and Server Actions that require tenant isolation.
 */
export async function requireTenant(): Promise<TenantContext> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/ingresar');

  const { data, error } = await supabase
    .from('user_tenants')
    .select('tenant_id, role, tenants(name)')
    .eq('user_id', user.id)
    .single();

  if (error || !data) redirect('/ingresar');

  // Supabase infers foreign-key joins as arrays; cast via unknown since it's a many-to-one.
  const tenants = data.tenants as unknown as { name: string } | null;

  return {
    tenantId: data.tenant_id,
    tenantName: tenants?.name ?? 'Mi Restaurante',
    userId: user.id,
    role: data.role,
  };
}
