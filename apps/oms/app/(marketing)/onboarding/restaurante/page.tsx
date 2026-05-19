import { RestauranteForm } from '@/components/onboarding/RestauranteForm';
import { getNextOnboardingStep } from '@/lib/supabase/onboarding-state';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Tu restaurante · Onboarding' };

export default async function OnboardingRestaurantePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const next = await getNextOnboardingStep();
  if (next && next.step !== 'restaurante') {
    redirect(`/onboarding/${next.step}`);
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
        Paso 1 de 4
      </p>
      <h1 className="mb-1 text-xl font-semibold text-[#0A2540]">Cuéntanos de tu restaurante</h1>
      <p className="mb-8 text-sm text-ink/50">
        Esta información aparece en tu recibo y configuración inicial. Puedes cambiarla después en
        Ajustes.
      </p>
      <RestauranteForm />
    </div>
  );
}
