'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { hashPin } from '@kobi/db';
import { revalidatePath } from 'next/cache';

export type EmployeeRole = 'manager' | 'cashier' | 'cook' | 'courier';

export type AddEmployeeResult = { ok: true; id: string } | { ok: false; error: string };

const VALID_ROLES: EmployeeRole[] = ['manager', 'cashier', 'cook', 'courier'];

export interface AddEmployeeInput {
  name: string;
  role: EmployeeRole;
  pin: string;
  fingerprintEnrolled: boolean;
}

export async function addEmployee(input: AddEmployeeInput): Promise<AddEmployeeResult> {
  const name = input.name?.trim();
  if (!name || name.length < 2) return { ok: false, error: 'El nombre es requerido.' };
  if (!input.role || !VALID_ROLES.includes(input.role)) {
    return { ok: false, error: 'Selecciona un rol válido.' };
  }
  if (!input.pin || !/^\d{4}$/.test(input.pin)) {
    return { ok: false, error: 'El PIN debe ser 4 dígitos.' };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();
  const pinHash = await hashPin(input.pin);

  const { data, error } = await supabase
    .from('employees_v2')
    .insert({
      tenant_id: tenantId,
      name,
      role: input.role,
      pin_hash: pinHash,
      status: 'activo',
      fingerprint_enrolled: input.fingerprintEnrolled,
      fingerprint_enrolled_at: input.fingerprintEnrolled ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505')
      return { ok: false, error: 'Ese PIN ya está en uso en este equipo.' };
    return { ok: false, error: `Error al guardar: ${error.message}` };
  }

  revalidatePath('/admin/equipo');
  return { ok: true, id: (data as { id: string }).id };
}

export type EnrollFingerprintResult = { ok: true } | { ok: false; error: string };

export async function enrollFingerprint(employeeId: string): Promise<EnrollFingerprintResult> {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('employees_v2')
    .update({
      fingerprint_enrolled: true,
      fingerprint_enrolled_at: new Date().toISOString(),
    })
    .eq('id', employeeId)
    .eq('tenant_id', tenantId);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/equipo');
  return { ok: true };
}
