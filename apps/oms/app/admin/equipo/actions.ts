'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import {
  createSupabaseServiceClient,
  hashPin,
  listBranchesForEmployee,
  setEmployeeBranches,
} from '@kobi/db';
import { revalidatePath } from 'next/cache';

export type EmployeeRole = 'manager' | 'cashier' | 'cook' | 'courier';

export type AddEmployeeResult = { ok: true; id: string } | { ok: false; error: string };

const VALID_ROLES: EmployeeRole[] = ['manager', 'cashier', 'cook', 'courier'];

export interface AddEmployeeInput {
  name: string;
  role: EmployeeRole;
  pin: string;
  fingerprintEnrolled: boolean;
  branchIds?: string[];
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

  const employeeId = (data as { id: string }).id;

  // Asignación opcional a sucursales. Si no se pasa, sin filas → backwards
  // compat (puede operar en cualquier sucursal activa).
  if (input.branchIds && input.branchIds.length > 0) {
    const svc = createSupabaseServiceClient();
    await setEmployeeBranches(svc, employeeId, tenantId, input.branchIds);
  }

  revalidatePath('/admin/equipo');
  return { ok: true, id: employeeId };
}

export type UpdateEmployeeResult = { ok: true } | { ok: false; error: string };

export interface UpdateEmployeeInput {
  name: string;
  role: EmployeeRole;
  pin?: string;
  branchIds?: string[];
}

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<UpdateEmployeeResult> {
  if (!id) return { ok: false, error: 'Empleado inválido.' };

  const name = input.name?.trim();
  if (!name || name.length < 2) return { ok: false, error: 'El nombre es requerido.' };
  if (!input.role || !VALID_ROLES.includes(input.role)) {
    return { ok: false, error: 'Selecciona un rol válido.' };
  }
  if (input.pin !== undefined && !/^\d{4}$/.test(input.pin)) {
    return { ok: false, error: 'El PIN debe ser 4 dígitos.' };
  }

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const patch: Record<string, unknown> = {
    name,
    role: input.role,
    updated_at: new Date().toISOString(),
  };
  if (input.pin !== undefined) {
    patch.pin_hash = await hashPin(input.pin);
  }

  const { error } = await supabase
    .from('employees_v2')
    .update(patch)
    .eq('id', id)
    .eq('tenant_id', tenantId);

  if (error) {
    if (error.code === '23505')
      return { ok: false, error: 'Ese PIN ya está en uso en este equipo.' };
    return { ok: false, error: `Error al guardar: ${error.message}` };
  }

  // Asignación opcional a sucursales. undefined = no tocar, [] = limpiar todas.
  if (input.branchIds !== undefined) {
    const svc = createSupabaseServiceClient();
    await setEmployeeBranches(svc, id, tenantId, input.branchIds);
  }

  revalidatePath('/admin/equipo');
  return { ok: true };
}

/**
 * Lee las sucursales asignadas a un empleado. Usado por el slide-over para
 * pre-llenar los checkboxes.
 */
export async function getEmployeeBranches(employeeId: string): Promise<string[]> {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();
  return listBranchesForEmployee(supabase, employeeId, tenantId);
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
