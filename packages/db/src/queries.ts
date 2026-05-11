import type { Role } from '@lidxi/shared';
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
  employee_id: string;
  branch_id: string;
  type: 'clock_in' | 'pos_activation';
  started_at: string;
  ended_at: string | null;
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

/** Último shift abierto (ended_at IS NULL) del empleado. */
export const getOpenShiftForEmployee = async (
  supabase: SupabaseClient,
  employeeId: string,
): Promise<ShiftRow | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select(
      'id, employee_id, branch_id, type, started_at, ended_at, break_minutes, auto_closed, created_at',
    )
    .eq('employee_id', employeeId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && !isPostgrestSingleNotFound(error)) return null;
  return (data as ShiftRow | null) ?? null;
};

export const openShift = async (
  supabase: SupabaseClient,
  input: { employeeId: string; branchId: string; type: ShiftRow['type'] },
): Promise<ShiftRow | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      employee_id: input.employeeId,
      branch_id: input.branchId,
      type: input.type,
    })
    .select(
      'id, employee_id, branch_id, type, started_at, ended_at, break_minutes, auto_closed, created_at',
    )
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
    .select(
      'id, employee_id, branch_id, type, started_at, ended_at, break_minutes, auto_closed, created_at',
    )
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
