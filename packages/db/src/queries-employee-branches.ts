import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Queries para employee_branches (asignación many-to-many empleado↔sucursal).
 *
 * Regla de backwards compat (Sprint 14):
 *   Si un empleado NO tiene filas en employee_branches, puede operar en
 *   cualquier sucursal activa del tenant. Esto evita romper a Miztli (que
 *   hoy tiene empleados sin asignar) cuando se despliega el sprint.
 *
 *   En el momento que el admin asigna al menos una sucursal a un empleado,
 *   las filas restringen el set. resolveCandidateBranches refleja esa regla.
 */

export interface EmployeeBranchRow {
  id: string;
  employee_id_v2: string;
  branch_id_v2: string;
  tenant_id: string;
  created_at: string;
}

export const listBranchesForEmployee = async (
  supabase: SupabaseClient,
  employeeId: string,
  tenantId: string,
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('employee_branches')
    .select('branch_id_v2')
    .eq('employee_id_v2', employeeId)
    .eq('tenant_id', tenantId);

  if (error || !data) return [];
  return (data as { branch_id_v2: string }[]).map((r) => r.branch_id_v2);
};

/**
 * Reescribe las asignaciones del empleado (diff: borra las que sobran, inserta
 * las que faltan). NO atómico — si falla a mitad puede dejar estado parcial,
 * pero el siguiente save lo corrige. Para POS de un solo dueño es aceptable.
 */
export const setEmployeeBranches = async (
  supabase: SupabaseClient,
  employeeId: string,
  tenantId: string,
  branchIds: string[],
): Promise<boolean> => {
  const current = await listBranchesForEmployee(supabase, employeeId, tenantId);
  const desired = new Set(branchIds);
  const currentSet = new Set(current);

  const toDelete = current.filter((id) => !desired.has(id));
  const toInsert = branchIds.filter((id) => !currentSet.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('employee_branches')
      .delete()
      .eq('employee_id_v2', employeeId)
      .eq('tenant_id', tenantId)
      .in('branch_id_v2', toDelete);
    if (error) return false;
  }

  if (toInsert.length > 0) {
    const rows = toInsert.map((bid) => ({
      employee_id_v2: employeeId,
      branch_id_v2: bid,
      tenant_id: tenantId,
    }));
    const { error } = await supabase.from('employee_branches').insert(rows);
    if (error) return false;
  }

  return true;
};

/**
 * Resuelve qué sucursales puede operar un empleado en este momento.
 * Implementa la regla de backwards compat:
 *   - Si tiene asignaciones explícitas: intersección con sucursales activas.
 *   - Si no tiene asignaciones: TODAS las sucursales activas del tenant.
 *
 * Devuelve filas mínimas (id, name) ordenadas por created_at del branch.
 */
export const resolveCandidateBranches = async (
  supabase: SupabaseClient,
  employeeId: string,
  tenantId: string,
): Promise<{ id: string; name: string }[]> => {
  const [assignedIds, activeBranchesRes] = await Promise.all([
    listBranchesForEmployee(supabase, employeeId, tenantId),
    supabase
      .from('branches_v2')
      .select('id, name, created_at')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: true }),
  ]);

  const activeBranches = (activeBranchesRes.data ?? []) as {
    id: string;
    name: string;
    created_at: string;
  }[];

  // Sin asignaciones explícitas → todas las activas (backwards compat).
  if (assignedIds.length === 0) {
    return activeBranches.map((b) => ({ id: b.id, name: b.name }));
  }

  const assignedSet = new Set(assignedIds);
  return activeBranches
    .filter((b) => assignedSet.has(b.id))
    .map((b) => ({ id: b.id, name: b.name }));
};
