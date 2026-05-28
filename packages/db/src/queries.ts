import type { Role } from '@kobi/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyPin } from './auth';

/**
 * Helpers tipados para las queries que necesitan Login y ClockOverlay.
 *
 * Todos los queries asumen `SupabaseClient` con service role (bypass RLS) —
 * el ClockOverlay y la activación POS son flujos en los que necesitamos leer
 * empleados de un branch ANTES de saber la identidad del usuario, así que no
 * tenemos JWT con qué satisfacer las policies.
 *
 * Tipos definidos localmente porque `types.gen.ts` está incompleto hasta que
 * se corra `pnpm db:reset && pnpm db:types`. Cuando los tipos generados estén
 * al día, podemos reemplazar estos por `Database['public']['Tables']['X']['Row']`.
 */

export interface EmployeeRow {
  id: string;
  branch_id: string;
  full_name: string;
  role: Role;
  pin_hash: string;
  active: boolean;
}

export interface ShiftRow {
  id: string;
  tenant_id: string | null;
  employee_id: string | null;
  employee_id_v2: string | null;
  branch_id: string | null;
  branch_id_v2: string | null;
  type: 'clock_in' | 'pos_activation';
  started_at: string;
  ended_at: string | null;
  closed_at: string | null;
  break_minutes: number;
  auto_closed: boolean;
  created_at: string;
}

export interface BranchWithRestaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  restaurant: { id: string; name: string; slug: string; brand_color: string | null };
}

export interface LastPosActivation {
  employee_full_name: string;
  started_at: string;
}

const isPostgrestSingleNotFound = (e: { code?: string } | null): boolean => e?.code === 'PGRST116';

/**
 * Encuentra el empleado activo del branch cuyo PIN coincide.
 * Itera todos los activos y compara con bcrypt (pin_hash). Devuelve null si
 * no hay match o si la operación falla.
 */
export const findEmployeeByPin = async (
  supabase: SupabaseClient,
  branchId: string,
  pin: string,
): Promise<EmployeeRow | null> => {
  const { data, error } = await supabase
    .from('employees')
    .select('id, branch_id, full_name, role, pin_hash, active')
    .eq('branch_id', branchId)
    .eq('active', true);

  if (error || !data) return null;

  for (const row of data as EmployeeRow[]) {
    if (await verifyPin(pin, row.pin_hash)) return row;
  }
  return null;
};

/**
 * Encuentra el empleado activo del tenant cuyo PIN coincide (employees_v2).
 * Retorna un EmployeeRow-compatible para que el caller no necesite bifurcar.
 * branch_id queda vacío ('') cuando el empleado no tiene asignación de sucursal.
 */
export const findEmployeeByPinV2 = async (
  supabase: SupabaseClient,
  tenantId: string,
  pin: string,
): Promise<EmployeeRow | null> => {
  const { data, error } = await supabase
    .from('employees_v2')
    .select('id, tenant_id, branch_id, name, role, pin_hash, status')
    .eq('tenant_id', tenantId)
    .eq('status', 'activo');

  if (error || !data) return null;

  type V2Row = {
    id: string;
    tenant_id: string;
    branch_id: string | null;
    name: string;
    role: string;
    pin_hash: string;
    status: string;
  };
  for (const row of data as V2Row[]) {
    if (await verifyPin(pin, row.pin_hash)) {
      return {
        id: row.id,
        branch_id: row.branch_id ?? '',
        full_name: row.name,
        role: row.role as Role,
        pin_hash: row.pin_hash,
        active: true,
      };
    }
  }
  return null;
};

const SHIFT_SELECT =
  'id, tenant_id, employee_id, employee_id_v2, branch_id, branch_id_v2, type, started_at, ended_at, closed_at, break_minutes, auto_closed, created_at';

/** Último shift abierto del empleado legacy (employee_id). */
export const getOpenShiftForEmployee = async (
  supabase: SupabaseClient,
  employeeId: string,
): Promise<ShiftRow | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select(SHIFT_SELECT)
    .eq('employee_id', employeeId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isPostgrestSingleNotFound(error)) return null;
  return (data as ShiftRow | null) ?? null;
};

/** Último shift abierto del empleado v2 (employee_id_v2). */
export const getOpenShiftForEmployeeV2 = async (
  supabase: SupabaseClient,
  employeeIdV2: string,
): Promise<ShiftRow | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select(SHIFT_SELECT)
    .eq('employee_id_v2', employeeIdV2)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isPostgrestSingleNotFound(error)) return null;
  return (data as ShiftRow | null) ?? null;
};

/**
 * Turno POS abierto en un (tenant, branch). Sprint 16: el turno es del branch,
 * no del empleado individual — distintos empleados rotan dentro del mismo
 * turno físico-contable. Si esta función devuelve un shift, la activación de
 * un nuevo empleado debe HEREDARLO en vez de crear uno nuevo.
 */
export const getOpenShiftForBranchV2 = async (
  supabase: SupabaseClient,
  tenantId: string,
  branchIdV2: string,
): Promise<ShiftRow | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select(SHIFT_SELECT)
    .eq('tenant_id', tenantId)
    .eq('branch_id_v2', branchIdV2)
    .eq('type', 'pos_activation')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isPostgrestSingleNotFound(error)) return null;
  return (data as ShiftRow | null) ?? null;
};

export type OpenShiftInput =
  | { employeeId: string; branchId: string; type: ShiftRow['type']; tenantId?: string }
  | {
      employeeIdV2: string;
      branchIdV2?: string | null;
      type: ShiftRow['type'];
      tenantId: string;
    };

export const openShift = async (
  supabase: SupabaseClient,
  input: OpenShiftInput,
): Promise<ShiftRow | null> => {
  const payload =
    'employeeId' in input
      ? {
          employee_id: input.employeeId,
          branch_id: input.branchId,
          type: input.type,
          tenant_id: input.tenantId ?? null,
        }
      : {
          employee_id_v2: input.employeeIdV2,
          branch_id_v2: input.branchIdV2 ?? null,
          type: input.type,
          tenant_id: input.tenantId,
        };

  const { data, error } = await supabase
    .from('shifts')
    .insert(payload)
    .select(SHIFT_SELECT)
    .single();
  if (error || !data) return null;
  return data as ShiftRow;
};

export const closeShift = async (
  supabase: SupabaseClient,
  shiftId: string,
  opts: { autoClosed?: boolean } = {},
): Promise<ShiftRow | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .update({
      ended_at: new Date().toISOString(),
      auto_closed: opts.autoClosed ?? false,
    })
    .eq('id', shiftId)
    .select(SHIFT_SELECT)
    .single();
  if (error || !data) return null;
  return data as ShiftRow;
};

/**
 * Cierre mínimo de un turno POS: marca ended_at + closed_at sin arqueo de
 * efectivo. Sprint 16: para cerrar turnos POS sin huérfanos cuando no hay
 * datos de caja (auto-close por migración branch-a-branch, fallback de
 * retrocompat, etc.). Usar siempre que se cierre un POS shift sin arqueo
 * en lugar de closeShift, para no dejar closed_at en NULL.
 */
export const closeShiftMinimal = async (
  supabase: SupabaseClient,
  shiftId: string,
  opts: { closedByEmployeeIdV2?: string | null; autoClosed?: boolean } = {},
): Promise<ShiftRow | null> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('shifts')
    .update({
      ended_at: now,
      closed_at: now,
      closed_by_employee_id_v2: opts.closedByEmployeeIdV2 ?? null,
      auto_closed: opts.autoClosed ?? false,
    })
    .eq('id', shiftId)
    .select(SHIFT_SELECT)
    .single();
  if (error || !data) return null;
  return data as ShiftRow;
};

/** Branch + restaurant joined; usado por el Login para pintar la card izquierda. */
export const getBranchWithRestaurant = async (
  supabase: SupabaseClient,
  branchId: string,
): Promise<BranchWithRestaurant | null> => {
  const { data, error } = await supabase
    .from('branches')
    .select(`
      id,
      name,
      address,
      phone,
      restaurant:restaurants ( id, name, slug, brand_color )
    `)
    .eq('id', branchId)
    .single();

  if (error || !data) return null;

  // PostgREST devuelve la relación FK como array salvo que se le diga
  // explícitamente con !inner; normalizamos al primer elemento.
  const raw = data as unknown as {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    restaurant:
      | { id: string; name: string; slug: string; brand_color: string | null }
      | { id: string; name: string; slug: string; brand_color: string | null }[]
      | null;
  };
  const restaurant = Array.isArray(raw.restaurant) ? raw.restaurant[0] : raw.restaurant;
  if (!restaurant) return null;
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    phone: raw.phone,
    restaurant,
  };
};

/** Última activación POS en el branch (para "Última activación" del Login). */
export const getLastPosActivation = async (
  supabase: SupabaseClient,
  branchId: string,
): Promise<LastPosActivation | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select(`
      started_at,
      employee:employees ( full_name )
    `)
    .eq('branch_id', branchId)
    .eq('type', 'pos_activation')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isPostgrestSingleNotFound(error)) return null;
  if (!data) return null;

  const raw = data as unknown as {
    started_at: string;
    employee: { full_name: string } | { full_name: string }[] | null;
  };
  const employee = Array.isArray(raw.employee) ? raw.employee[0] : raw.employee;
  if (!employee) return null;
  return {
    started_at: raw.started_at,
    employee_full_name: employee.full_name,
  };
};
