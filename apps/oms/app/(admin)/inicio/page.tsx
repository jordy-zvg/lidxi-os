import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Panel de administración · Kobi' };

export default async function AdminInicioPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const { data: membership } = await supabase
    .from('user_tenants')
    .select('tenant_id, tenants(name, plan, trial_ends_at)')
    .eq('user_id', user.id)
    .single();

  type TenantData = { name: string; plan: string; trial_ends_at: string };
  const tenantRaw = membership?.tenants;
  const tenant = (Array.isArray(tenantRaw) ? tenantRaw[0] : tenantRaw) as
    | TenantData
    | null
    | undefined;

  return (
    <div className="py-8">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
        Panel de administración
      </p>
      <h1 className="mb-1 text-2xl font-semibold text-[#0A2540]">Hola, bienvenido a Kobi</h1>
      {tenant && (
        <p className="mb-8 text-sm text-ink/60">
          Administrando <span className="font-medium text-[#0A2540]">{tenant.name}</span>
          {' · '}
          <span className="capitalize">{tenant.plan}</span>
        </p>
      )}

      {/* TODO: dashboard con KPIs reales — sprint posterior */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {['Ventas hoy', 'Pedidos hoy', 'Comisiones', 'Ahorro'].map((label) => (
          <div key={label} className="rounded-xl border border-ink/10 bg-white p-5">
            <p className="mb-1 text-xs text-ink/40">{label}</p>
            <p className="text-2xl font-semibold text-[#0A2540]">—</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-ink/10 bg-white p-6">
        <p className="mb-4 text-sm font-medium text-[#0A2540]">Próximos pasos</p>
        <ul className="space-y-3 text-sm text-ink/60">
          <li>
            → Configura tus impresoras en{' '}
            <span className="font-medium text-[#0A2540]">Impresoras</span>
          </li>
          <li>
            → Conecta tus marketplaces en{' '}
            <span className="font-medium text-[#0A2540]">Integraciones</span>
          </li>
          <li>
            → Crea tu menú en <span className="font-medium text-[#0A2540]">Menú</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
