import { ListoSuccess } from '@/components/onboarding/ListoSuccess';
import { resolveSingleMembership } from '@/lib/supabase/membership';
import { getNextOnboardingStep } from '@/lib/supabase/onboarding-state';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: '¡Listo! · Onboarding' };

export default async function OnboardingListoPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const next = await getNextOnboardingStep();
  if (next && next.step !== 'listo') {
    redirect(`/onboarding/${next.step}`);
  }

  const { data: rows } = await supabase
    .from('user_tenants')
    .select('tenant_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  const membership = resolveSingleMembership(rows, 'onboarding.listo.page', user.id);

  if (!membership) redirect('/ingresar');

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, trial_ends_at, metadata')
    .eq('id', membership.tenant_id)
    .single();

  if (!tenant) redirect('/ingresar');

  const needsSalesContact =
    (tenant.metadata as Record<string, unknown> | null)?.needs_sales_contact === true;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
      <ListoSuccess
        tenantName={tenant.name as string}
        trialEndsAt={tenant.trial_ends_at as string}
        needsSalesContact={needsSalesContact}
      />
    </div>
  );
}
