'use server';

import { requireTenant } from '@/lib/supabase/tenant-guard';
import {
  countBranchUsage,
  createBranch,
  createSupabaseServiceClient,
  updateBranch,
} from '@kobi/db';
import { revalidatePath } from 'next/cache';

export type CreateBranchResult = { ok: true; id: string } | { ok: false; error: string };

export type UpdateBranchResult = { ok: true } | { ok: false; error: string };
export type DeactivateBranchResult = { ok: true } | { ok: false; error: string };

export interface BranchInput {
  name: string;
  address?: string;
  phone?: string;
}

const NAME_MAX = 80;
const ADDRESS_MAX = 200;

function validate(input: BranchInput): string | null {
  const name = input.name?.trim();
  if (!name || name.length < 2) return 'El nombre es requerido (mín. 2 caracteres).';
  if (name.length > NAME_MAX) return `Nombre máx. ${NAME_MAX} caracteres.`;
  if (input.address && input.address.length > ADDRESS_MAX)
    return `Dirección máx. ${ADDRESS_MAX} caracteres.`;
  return null;
}

export async function createBranchAction(input: BranchInput): Promise<CreateBranchResult> {
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();

  const result = await createBranch(supabase, {
    tenantId,
    name: input.name.trim(),
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
  });
  if (!result) return { ok: false, error: 'No se pudo crear la sucursal.' };

  revalidatePath('/admin/sucursales');
  return { ok: true, id: result.id };
}

export async function updateBranchAction(
  branchId: string,
  input: BranchInput,
): Promise<UpdateBranchResult> {
  if (!branchId) return { ok: false, error: 'Sucursal inválida.' };
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();

  const ok = await updateBranch(supabase, branchId, tenantId, {
    name: input.name.trim(),
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
  });
  if (!ok) return { ok: false, error: 'No se pudo guardar.' };

  revalidatePath('/admin/sucursales');
  return { ok: true };
}

/**
 * "Desactivar" en vez de DELETE: si la sucursal tiene historia (orders, shifts)
 * NO se puede borrar. Status='inactive' la oculta de las listas operativas
 * pero preserva el historial.
 */
export async function deactivateBranchAction(branchId: string): Promise<DeactivateBranchResult> {
  if (!branchId) return { ok: false, error: 'Sucursal inválida.' };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();

  const ok = await updateBranch(supabase, branchId, tenantId, { status: 'inactive' });
  if (!ok) return { ok: false, error: 'No se pudo desactivar.' };

  revalidatePath('/admin/sucursales');
  return { ok: true };
}

export async function activateBranchAction(branchId: string): Promise<DeactivateBranchResult> {
  if (!branchId) return { ok: false, error: 'Sucursal inválida.' };

  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();

  const ok = await updateBranch(supabase, branchId, tenantId, { status: 'active' });
  if (!ok) return { ok: false, error: 'No se pudo reactivar.' };

  revalidatePath('/admin/sucursales');
  return { ok: true };
}

/**
 * Devuelve uso de la sucursal para que la UI decida si mostrar "Desactivar"
 * vs "Eliminar" (eliminar real solo si no tiene uso).
 */
export async function getBranchUsageAction(
  branchId: string,
): Promise<{ orders: number; shifts: number; employees: number }> {
  const { tenantId } = await requireTenant();
  const supabase = createSupabaseServiceClient();
  return countBranchUsage(supabase, branchId, tenantId);
}
