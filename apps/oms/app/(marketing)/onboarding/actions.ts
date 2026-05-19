'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function getTenantId(): Promise<string> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const { data: membership } = await supabase
    .from('user_tenants')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) redirect('/ingresar');
  return membership.tenant_id as string;
}

export async function saveRestauranteStep(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const tenant_id = await getTenantId();

  const { data: existing } = await supabase
    .from('tenants')
    .select('metadata')
    .eq('id', tenant_id)
    .single();

  const { error } = await supabase
    .from('tenants')
    .update({
      name: formData.get('name') as string,
      rfc: (formData.get('rfc') as string) || null,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      metadata: {
        ...(existing?.metadata ?? {}),
        operation_type: formData.get('operation_type') as string,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenant_id);

  if (error) throw new Error(`Error guardando: ${error.message}`);
  redirect('/onboarding/operacion');
}

export async function saveOperacionStep(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const tenant_id = await getTenantId();

  const canales = formData.getAll('canales') as string[];

  const { data: existing } = await supabase
    .from('tenants')
    .select('metadata')
    .eq('id', tenant_id)
    .single();

  const { error } = await supabase
    .from('tenants')
    .update({
      metadata: {
        ...(existing?.metadata ?? {}),
        canales,
        volumen: formData.get('volumen') as string,
        equipo: formData.get('equipo') as string,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenant_id);

  if (error) throw new Error(`Error guardando: ${error.message}`);
  redirect('/onboarding/plan');
}

export async function savePlanStep(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const tenant_id = await getTenantId();

  const plan = formData.get('plan') as string;
  const needs_sales_contact = plan === 'escala';

  const { data: existing } = await supabase
    .from('tenants')
    .select('metadata')
    .eq('id', tenant_id)
    .single();

  const { error } = await supabase
    .from('tenants')
    .update({
      plan,
      metadata: {
        ...(existing?.metadata ?? {}),
        plan_confirmed: true,
        ...(needs_sales_contact ? { needs_sales_contact: true } : {}),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenant_id);

  if (error) throw new Error(`Error guardando: ${error.message}`);
  redirect('/onboarding/listo');
}

export async function completeOnboarding() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const { data: membership } = await supabase
    .from('user_tenants')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) redirect('/ingresar');
  const tenant_id = membership.tenant_id as string;

  await supabase
    .from('tenants')
    .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
    .eq('id', tenant_id);

  await supabase
    .from('user_tenants')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id)
    .eq('tenant_id', tenant_id);

  // El admin entra a /admin/inicio (Supabase auth).
  // Para operar el POS, KDS, etc., debe usar /login con un PIN de empleado.
  redirect('/admin/inicio');
}
