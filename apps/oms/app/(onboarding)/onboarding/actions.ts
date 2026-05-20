'use server';

import { resolveSingleMembership } from '@/lib/supabase/membership';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function getTenantId(): Promise<string> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/ingresar');

  const { data: memberships } = await supabase
    .from('user_tenants')
    .select('tenant_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const membership = resolveSingleMembership(memberships, 'onboarding.getTenantId', user.id);
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
  const address = (formData.get('address') as string | null)?.trim() ?? '';
  const latRaw = formData.get('lat') as string | null;
  const lngRaw = formData.get('lng') as string | null;
  const lat = latRaw ? Number(latRaw) : null;
  const lng = lngRaw ? Number(lngRaw) : null;
  const hoursRaw = formData.get('hours_json') as string | null;
  let hours_json: unknown = {};
  if (hoursRaw) {
    try {
      hours_json = JSON.parse(hoursRaw);
    } catch {
      hours_json = {};
    }
  }
  const branchName =
    ((formData.get('branch_name') as string | null) ?? '').trim() || 'Sucursal principal';

  const { data: existing } = await supabase
    .from('tenants')
    .select('metadata')
    .eq('id', tenant_id)
    .single();

  // Upsert manual: una sucursal por tenant en este onboarding (multi-sucursal queda para Ajustes).
  const { data: existingBranch } = await supabase
    .from('branches_v2')
    .select('id')
    .eq('tenant_id', tenant_id)
    .limit(1)
    .maybeSingle();

  if (existingBranch?.id) {
    const { error: branchErr } = await supabase
      .from('branches_v2')
      .update({
        name: branchName,
        address,
        lat,
        lng,
        hours_json,
        channels: canales,
      })
      .eq('id', existingBranch.id);
    if (branchErr) throw new Error(`Error guardando sucursal: ${branchErr.message}`);
  } else {
    const { error: branchErr } = await supabase.from('branches_v2').insert({
      tenant_id,
      name: branchName,
      address,
      lat,
      lng,
      hours_json,
      channels: canales,
      is_active: true,
    });
    if (branchErr) throw new Error(`Error guardando sucursal: ${branchErr.message}`);
  }

  const { error } = await supabase
    .from('tenants')
    .update({
      metadata: {
        ...(existing?.metadata ?? {}),
        canales,
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

  const { data: memberships } = await supabase
    .from('user_tenants')
    .select('tenant_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const membership = resolveSingleMembership(memberships, 'onboarding.completeOnboarding', user.id);
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
