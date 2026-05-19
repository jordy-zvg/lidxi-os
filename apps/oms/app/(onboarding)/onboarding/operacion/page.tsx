import { OperacionForm } from '@/components/onboarding/OperacionForm';
import { getNextOnboardingStep } from '@/lib/supabase/onboarding-state';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Tu operación · Onboarding' };

export default async function OnboardingOperacionPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const next = await getNextOnboardingStep();
  if (next && next.step !== 'operacion') {
    redirect(`/onboarding/${next.step}`);
  }

  const { data: membership } = await supabase
    .from('user_tenants')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  let branchName: string | undefined;
  if (membership) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', membership.tenant_id)
      .single();
    branchName = (tenant?.name as string | undefined) ?? undefined;
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
        Paso 2 de 4
      </p>
      <h1 className="mb-1 text-xl font-semibold text-[#0A2540]">Tu sucursal</h1>
      <p className="mb-8 text-sm text-ink/50">
        Captura la dirección, horario y canales activos. Lo usamos para configurar tu OMS y la
        cobertura de delivery.
      </p>
      <OperacionForm mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} branchName={branchName} />
    </div>
  );
}
