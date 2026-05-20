import { resolveSingleMembership } from './membership';
import { createSupabaseServerClient } from './server';

export type OnboardingStep = 'restaurante' | 'operacion' | 'plan' | 'listo';

export async function getNextOnboardingStep(): Promise<{
  step: OnboardingStep;
  tenant_id: string;
} | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from('user_tenants')
    .select('tenant_id, onboarding_completed, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const membership = resolveSingleMembership(
    rows,
    'onboarding-state.getNextOnboardingStep',
    user.id,
  );
  if (!membership) return null;
  if (membership.onboarding_completed) return null;

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, address, phone, metadata, plan, onboarding_completed')
    .eq('id', membership.tenant_id)
    .single();

  if (!tenant) return null;

  if (tenant.name === 'Mi Restaurante' || !tenant.address) {
    return { step: 'restaurante', tenant_id: membership.tenant_id };
  }
  if (!tenant.metadata?.canales) {
    return { step: 'operacion', tenant_id: membership.tenant_id };
  }
  if (!tenant.metadata?.plan_confirmed) {
    return { step: 'plan', tenant_id: membership.tenant_id };
  }
  return { step: 'listo', tenant_id: membership.tenant_id };
}
