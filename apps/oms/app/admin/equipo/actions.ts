'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { hashPin } from '@kobi/db';
import { revalidatePath } from 'next/cache';

export type EmployeeRole = 'manager' | 'cashier' | 'cook' | 'courier';

export interface InviteEmployeeState {
  error?: string;
  success?: boolean;
}

const VALID_ROLES: EmployeeRole[] = ['manager', 'cashier', 'cook', 'courier'];

export async function inviteEmployee(
  _prev: InviteEmployeeState,
  formData: FormData,
): Promise<InviteEmployeeState> {
  const name = (formData.get('name') as string | null)?.trim();
  const role = formData.get('role') as EmployeeRole | null;
  const pin = formData.get('pin') as string | null;

  if (!name || name.length < 2) return { error: 'El nombre es requerido.' };
  if (!role || !VALID_ROLES.includes(role)) return { error: 'Selecciona un rol válido.' };
  if (!pin || !/^\d{4}$/.test(pin)) return { error: 'El PIN debe ser 4 dígitos.' };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const pinHash = await hashPin(pin);

  const { error } = await supabase.from('employees_v2').insert({
    tenant_id: tenantId,
    name,
    role,
    pin_hash: pinHash,
    status: 'activo',
  });

  if (error) {
    if (error.code === '23505') return { error: 'Ese PIN ya está en uso en este equipo.' };
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidatePath('/admin/equipo');
  return { success: true };
}
