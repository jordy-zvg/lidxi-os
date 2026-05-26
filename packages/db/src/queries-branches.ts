import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Queries para branches_v2 multi-sucursal.
 *
 * Sprint 14: branches_v2 ahora tiene `status` ('active'|'inactive') como
 * fuente de verdad. is_active queda como bool legacy, sincronizado.
 */

export interface BranchV2Row {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: 'active' | 'inactive';
  is_active: boolean;
  created_at: string;
}

export const listBranchesForTenant = async (
  supabase: SupabaseClient,
  tenantId: string,
): Promise<BranchV2Row[]> => {
  const { data, error } = await supabase
    .from('branches_v2')
    .select('id, tenant_id, name, address, phone, status, is_active, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as BranchV2Row[];
};

export const listActiveBranchesForTenant = async (
  supabase: SupabaseClient,
  tenantId: string,
): Promise<BranchV2Row[]> => {
  const { data, error } = await supabase
    .from('branches_v2')
    .select('id, tenant_id, name, address, phone, status, is_active, created_at')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as BranchV2Row[];
};

export interface CreateBranchInput {
  tenantId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

export const createBranch = async (
  supabase: SupabaseClient,
  input: CreateBranchInput,
): Promise<{ id: string } | null> => {
  const { data, error } = await supabase
    .from('branches_v2')
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      address: input.address ?? null,
      phone: input.phone ?? null,
      status: 'active',
      is_active: true,
    })
    .select('id')
    .single();

  if (error || !data) return null;
  return { id: data.id as string };
};

export interface UpdateBranchInput {
  name?: string;
  address?: string | null;
  phone?: string | null;
  status?: 'active' | 'inactive';
}

export const updateBranch = async (
  supabase: SupabaseClient,
  branchId: string,
  tenantId: string,
  patch: UpdateBranchInput,
): Promise<boolean> => {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.status !== undefined) {
    update.status = patch.status;
    update.is_active = patch.status === 'active';
  }
  if (Object.keys(update).length === 0) return true;

  const { error } = await supabase
    .from('branches_v2')
    .update(update)
    .eq('id', branchId)
    .eq('tenant_id', tenantId);

  return !error;
};

/**
 * Cuenta órdenes y turnos que referencian la sucursal v2. Se usa para
 * decidir si "eliminar" es realmente posible (no lo es si hay historia).
 */
export const countBranchUsage = async (
  supabase: SupabaseClient,
  branchId: string,
  tenantId: string,
): Promise<{ orders: number; shifts: number; employees: number }> => {
  const [ordersRes, shiftsRes, employeesRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('branch_id_v2', branchId),
    supabase
      .from('shifts')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('branch_id_v2', branchId),
    supabase
      .from('employee_branches')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('branch_id_v2', branchId),
  ]);

  return {
    orders: ordersRes.count ?? 0,
    shifts: shiftsRes.count ?? 0,
    employees: employeesRes.count ?? 0,
  };
};
