import { PlanSelector } from '@/components/onboarding/PlanSelector';
import { getNextOnboardingStep } from '@/lib/supabase/onboarding-state';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Elige tu plan · Onboarding' };

export default async function OnboardingPlanPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const next = await getNextOnboardingStep();
  if (next && next.step !== 'plan') {
    redirect(`/onboarding/${next.step}`);
  }

  // Fetch volumen from step 2 to pre-select the right plan
  const { data: membership } = await supabase
    .from('user_tenants')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  let volumen = '';
  if (membership) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('metadata')
      .eq('id', membership.tenant_id)
      .single();
    volumen = (tenant?.metadata as Record<string, string> | null)?.volumen ?? '';
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
        Paso 3 de 4
      </p>
      <h1 className="mb-1 text-xl font-semibold text-[#0A2540]">Elige tu plan</h1>
      <p className="mb-8 text-sm text-ink/50">
        Empieza gratis 14 días. Si Kobi te funciona, eliges plan al final del trial. Si no, cancelas
        sin costo.
      </p>
      {/* TODO: integrar Stripe Checkout en sprint posterior */}
      <PlanSelector volumen={volumen} />
    </div>
  );
}
