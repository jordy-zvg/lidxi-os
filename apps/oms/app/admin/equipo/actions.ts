'use server';

import { createHash } from 'node:crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/supabase/tenant-guard';
import { revalidatePath } from 'next/cache';

export type EmployeeRole = 'Admin operativo' | 'Cajero' | 'Cocinero' | 'Runner';

export interface InviteEmployeeState {
  error?: string;
  success?: boolean;
}

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

export async function inviteEmployee(
  _prev: InviteEmployeeState,
  formData: FormData,
): Promise<InviteEmployeeState> {
  const name = (formData.get('name') as string | null)?.trim();
  const role = formData.get('role') as EmployeeRole | null;
  const pin = formData.get('pin') as string | null;

  if (!name || name.length < 2) return { error: 'El nombre es requerido.' };
  const VALID_ROLES: EmployeeRole[] = ['Admin operativo', 'Cajero', 'Cocinero', 'Runner'];
  if (!role || !VALID_ROLES.includes(role)) return { error: 'Selecciona un rol válido.' };
  if (!pin || !/^\d{4}$/.test(pin)) return { error: 'El PIN debe ser 4 dígitos.' };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from('employees_v2').insert({
    tenant_id: tenantId,
    name,
    role,
    pin_hash: hashPin(pin),
    status: 'activo',
  });

  if (error) {
    if (error.code === '23505') return { error: 'Ese PIN ya está en uso en este equipo.' };
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidatePath('/admin/equipo');
  return { success: true };
}
