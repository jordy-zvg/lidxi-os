'use server';

import { slugify } from '@/lib/slugify';
import { resolveSingleMembership } from '@/lib/supabase/membership';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@kobi/db';
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
  // Autenticado sin membership → /admin/sin-acceso para evitar loop.
  if (!membership) redirect('/admin/sin-acceso');
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

/**
 * Genera un slug único para restaurants a partir de una base ya slugificada.
 * Si "miztli-pardo" está tomado, devuelve "miztli-pardo-2", etc.
 */
async function uniqueRestaurantSlug(
  admin: ReturnType<typeof createSupabaseServiceClient>,
  base: string,
): Promise<string> {
  const { data } = await admin.from('restaurants').select('slug').like('slug', `${base}%`);
  const taken = new Set(((data ?? []) as { slug: string }[]).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Sprint 16 FASE 1 — Garantiza que el tenant tenga restaurant + branch legacy.
 * Sin restaurant el storefront da 404; sin branch legacy el POS no puede crear
 * órdenes (FK orders.branch_id NOT NULL → branches). Idempotente. Usa service
 * client porque la membership ya fue verificada y estas tablas tienen RLS estricto.
 */
async function ensureRestaurantAndLegacyBranch(tenantId: string): Promise<void> {
  const admin = createSupabaseServiceClient();

  const { data: tenant } = await admin
    .from('tenants')
    .select('name, address')
    .eq('id', tenantId)
    .maybeSingle();
  const tenantName = ((tenant?.name as string | undefined) ?? '').trim() || 'Mi Restaurante';
  const tenantAddress = (tenant?.address as string | null | undefined) ?? null;

  // 1. Restaurant (idempotente por tenant_id).
  let restaurant = (
    await admin.from('restaurants').select('id').eq('tenant_id', tenantId).maybeSingle()
  ).data as { id: string } | null;

  if (!restaurant) {
    const base = slugify(tenantName) || 'restaurante';
    const slug = await uniqueRestaurantSlug(admin, base);
    const { data: created, error } = await admin
      .from('restaurants')
      .insert({ tenant_id: tenantId, name: tenantName, slug, address: tenantAddress })
      .select('id')
      .single();
    if (error) throw new Error(`No se pudo crear el restaurante: ${error.message}`);
    restaurant = created as { id: string };
  }

  // 2. Branch legacy shim (FK orders.branch_id). Espejo de la sucursal v2 inicial.
  const { data: legacyBranch } = await admin
    .from('branches')
    .select('id')
    .eq('restaurant_id', restaurant.id)
    .limit(1)
    .maybeSingle();

  if (!legacyBranch) {
    const { data: branchV2 } = await admin
      .from('branches_v2')
      .select('name, address, lat, lng')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    const b = branchV2 as {
      name?: string;
      address?: string | null;
      lat?: number | null;
      lng?: number | null;
    } | null;
    const { error } = await admin.from('branches').insert({
      restaurant_id: restaurant.id,
      name: (b?.name ?? '').trim() || 'Sucursal principal',
      address: b?.address ?? tenantAddress,
      lat: b?.lat ?? null,
      lng: b?.lng ?? null,
    });
    if (error) throw new Error(`No se pudo crear la sucursal legacy: ${error.message}`);
  }
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
  if (!membership) redirect('/admin/sin-acceso');
  const tenant_id = membership.tenant_id as string;

  // Sprint 16 FASE 1: provisionar restaurant + branch legacy antes de marcar listo.
  await ensureRestaurantAndLegacyBranch(tenant_id);

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
