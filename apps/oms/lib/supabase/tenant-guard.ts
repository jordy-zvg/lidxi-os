import { redirect } from 'next/navigation';
import { resolveSingleMembership } from './membership';
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

  const { data: rows, error } = await supabase
    .from('user_tenants')
    .select('tenant_id, role, created_at, tenants(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) redirect('/ingresar');

  const data = resolveSingleMembership(rows, 'tenant-guard.requireTenant', user.id);
  // Sin membership = cuenta autenticada pero sin tenant. Redirige a /admin/sin-acceso
  // (no /ingresar) para evitar loop: ya está logueado, /ingresar lo dejaría re-loguear
  // y volver al mismo lugar.
  if (!data) redirect('/admin/sin-acceso');

  // Supabase infers foreign-key joins as arrays; cast via unknown since it's a many-to-one.
  const tenants = data.tenants as unknown as { name: string } | null;

  return {
    tenantId: data.tenant_id,
    tenantName: tenants?.name ?? 'Mi Restaurante',
    userId: user.id,
    role: data.role,
  };
}
