'use server';

import {
  createSupabaseServiceClient,
  closeShift as dbCloseShift,
  findEmployeeByPin,
  findEmployeeByPinV2,
  getOpenShiftForEmployee,
  getOpenShiftForEmployeeV2,
  openShift,
  resolveCandidateBranches,
  signEmployeeJWT,
  verifyEmployeeJWT,
} from '@kobi/db';
import type { EmployeeRow } from '@kobi/db';
import type { Role } from '@kobi/shared';
import { cookies } from 'next/headers';
import { getBranchId, getStationId } from './station';

/**
 * Server Actions del flujo de auth.
 *
 *   • activatePosStation   — Login del POS. Solo manager/cashier. Crea sesión
 *                            persistente del dispositivo y abre shift del
 *                            empleado tipo 'pos_activation'.
 *                            tenantId (opcional): si se pasa, usa employees_v2
 *                            (path multi-tenant). Sin él, path legacy (BRANCH_ID env).
 *   • lookupForClock       — Lookup read-only para el ClockOverlay.
 *   • performClockIn       — Crea un shift tipo 'clock_in'.
 *   • performClockOut      — Cierra el shift abierto.
 */

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const ACTIVATABLE_ROLES: ReadonlySet<Role> = new Set(['manager', 'cashier']);
const SESSION_COOKIE = 'kobi-session';
const SESSION_MAX_AGE_S = 60 * 60 * 12;

const setSessionCookie = async (token: string): Promise<void> => {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });
};

const sanitizePin = (raw: string): string | null => {
  const pin = raw.trim();
  if (!/^[0-9]{4,8}$/.test(pin)) return null;
  return pin;
};

/**
 * Resultado de activación v2.
 *   - activated: sesión emitida, abrir POS.
 *   - needsBranchSelection: hay 2+ sucursales candidatas, la UI debe pedir
 *     elección y llamar activatePosStationWithBranch(pin, tenantId, branchId).
 */
export type ActivationOutcome =
  | { kind: 'activated'; employeeName: string }
  | {
      kind: 'needsBranchSelection';
      employeeName: string;
      branches: { id: string; name: string }[];
    };

/**
 * Path v2 común: verifica PIN, resuelve candidatas. Si devuelve activación
 * directa abre shift/JWT; si necesita selección, no muta nada.
 *
 * `forceBranchId` (de pos_devices.branch_id) restringe el set: solo se acepta
 * si está en candidatas; si no, error explícito.
 */
async function activateV2(
  tenantId: string,
  pin: string,
  forceBranchId: string | null,
  chosenBranchId: string | null,
): Promise<ActionResult<ActivationOutcome>> {
  const supabase = createSupabaseServiceClient();

  const employee = await findEmployeeByPinV2(supabase, tenantId, pin);
  if (!employee) return { ok: false, error: 'PIN incorrecto' };
  if (!ACTIVATABLE_ROLES.has(employee.role)) {
    return { ok: false, error: 'Tu rol no permite activar el POS' };
  }

  const candidates = await resolveCandidateBranches(supabase, employee.id, tenantId);
  if (candidates.length === 0) {
    return { ok: false, error: 'No hay sucursales activas asignadas a tu cuenta.' };
  }

  // Force device branch si la tablet está vinculada a una sucursal específica.
  let activeBranchId: string | null = null;
  if (forceBranchId) {
    if (!candidates.some((b) => b.id === forceBranchId)) {
      return {
        ok: false,
        error: 'Esta tablet está vinculada a una sucursal que no puedes operar.',
      };
    }
    activeBranchId = forceBranchId;
  } else if (chosenBranchId) {
    if (!candidates.some((b) => b.id === chosenBranchId)) {
      return { ok: false, error: 'Sucursal inválida.' };
    }
    activeBranchId = chosenBranchId;
  } else if (candidates.length === 1 && candidates[0]) {
    // Caso común (1 sucursal): no hay selector, va directo.
    activeBranchId = candidates[0].id;
  } else {
    // 2+ candidatas, no hay forzado ni elección → la UI pide.
    return {
      ok: true,
      data: {
        kind: 'needsBranchSelection',
        employeeName: employee.full_name,
        branches: candidates,
      },
    };
  }

  // Cierra shift v2 abierto del mismo empleado (multi-dispositivo defense).
  const previousOpen = await getOpenShiftForEmployeeV2(supabase, employee.id);
  if (previousOpen) {
    await dbCloseShift(supabase, previousOpen.id, { autoClosed: true });
  }

  const newShift = await openShift(supabase, {
    employeeIdV2: employee.id,
    branchIdV2: activeBranchId,
    tenantId,
    type: 'pos_activation',
  });
  if (!newShift) return { ok: false, error: 'No se pudo abrir la sesión. Intenta de nuevo.' };

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('tenant_id', tenantId)
    .maybeSingle();
  const restaurantId = (restaurant as { id: string } | null)?.id ?? '';

  const token = await signEmployeeJWT(
    {
      sub: employee.id,
      employee_role: employee.role,
      tenant_id: tenantId,
      branch_id: activeBranchId,
      restaurant_id: restaurantId,
      station_id: getStationId(),
      pos_session_id: newShift.id,
    },
    SESSION_MAX_AGE_S,
  );
  await setSessionCookie(token);

  return { ok: true, data: { kind: 'activated', employeeName: employee.full_name } };
}

export const activatePosStation = async (
  pinRaw: string,
  tenantId?: string,
  forceBranchId?: string | null,
): Promise<ActionResult<ActivationOutcome>> => {
  const pin = sanitizePin(pinRaw);
  if (!pin) return { ok: false, error: 'PIN inválido' };

  // --------------------------------------------------------------------------
  // Path v2: multi-tenant, usa employees_v2
  // --------------------------------------------------------------------------
  if (tenantId) {
    return activateV2(tenantId, pin, forceBranchId ?? null, null);
  }

  const supabase = createSupabaseServiceClient();

  // --------------------------------------------------------------------------
  // Path legacy: single-tenant POS via BRANCH_ID env
  // --------------------------------------------------------------------------
  const branchId = getBranchId();
  const employee = await findEmployeeByPin(supabase, branchId, pin);
  if (!employee) return { ok: false, error: 'PIN incorrecto' };

  if (!ACTIVATABLE_ROLES.has(employee.role)) {
    return { ok: false, error: 'Tu rol no permite activar el POS' };
  }

  const previousOpen = await getOpenShiftForEmployee(supabase, employee.id);
  if (previousOpen) {
    await dbCloseShift(supabase, previousOpen.id, { autoClosed: true });
  }

  // Path legacy: derivar tenant_id desde restaurant.tenant_id (Sprint 7.7
  // pobló restaurants.tenant_id via 20260521000001_unify_tenant_model.sql).
  const { data: branch } = await supabase
    .from('branches')
    .select('restaurant_id, restaurants(tenant_id)')
    .eq('id', branchId)
    .single();
  if (!branch) return { ok: false, error: 'Branch no encontrado' };
  const restaurantId = (branch as { restaurant_id: string }).restaurant_id;
  const legacyTenantId =
    (branch as unknown as { restaurants: { tenant_id: string | null } | null }).restaurants
      ?.tenant_id ?? '';

  const newShift = await openShift(supabase, {
    employeeId: employee.id,
    branchId,
    tenantId: legacyTenantId || undefined,
    type: 'pos_activation',
  });
  if (!newShift) return { ok: false, error: 'No se pudo abrir la sesión. Intenta de nuevo.' };

  const token = await signEmployeeJWT(
    {
      sub: employee.id,
      employee_role: employee.role,
      tenant_id: legacyTenantId,
      branch_id: branchId,
      restaurant_id: restaurantId,
      station_id: getStationId(),
      pos_session_id: newShift.id,
    },
    SESSION_MAX_AGE_S,
  );
  await setSessionCookie(token);

  return { ok: true, data: { kind: 'activated', employeeName: employee.full_name } };
};

/**
 * Segunda fase: el usuario eligió sucursal en el selector. Repite la
 * verificación de PIN (no confiamos en estado de cliente) y activa con
 * la branch elegida.
 */
export const activatePosStationWithBranch = async (
  pinRaw: string,
  tenantId: string,
  branchId: string,
): Promise<ActionResult<ActivationOutcome>> => {
  const pin = sanitizePin(pinRaw);
  if (!pin) return { ok: false, error: 'PIN inválido' };
  if (!tenantId || !branchId) return { ok: false, error: 'Falta tenant o sucursal.' };
  return activateV2(tenantId, pin, null, branchId);
};

export interface LookupForClockResult {
  employee: { id: string; full_name: string; role: Role };
  openShift: { id: string; started_at: string } | null;
}

export const lookupForClock = async (
  pinRaw: string,
): Promise<ActionResult<LookupForClockResult>> => {
  const pin = sanitizePin(pinRaw);
  if (!pin) return { ok: false, error: 'PIN inválido' };

  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();
  const employee = await findEmployeeByPin(supabase, branchId, pin);
  if (!employee) return { ok: false, error: 'PIN incorrecto' };

  const openShiftRow = await getOpenShiftForEmployee(supabase, employee.id);
  return {
    ok: true,
    data: {
      employee: { id: employee.id, full_name: employee.full_name, role: employee.role },
      openShift: openShiftRow ? { id: openShiftRow.id, started_at: openShiftRow.started_at } : null,
    },
  };
};

export const performClockIn = async (
  employeeId: string,
): Promise<ActionResult<{ shiftId: string; startedAt: string }>> => {
  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();
  const shift = await openShift(supabase, {
    employeeId,
    branchId,
    type: 'clock_in',
  });
  if (!shift) return { ok: false, error: 'No se pudo registrar la entrada' };
  return { ok: true, data: { shiftId: shift.id, startedAt: shift.started_at } };
};

export const performClockOut = async (
  shiftId: string,
): Promise<ActionResult<{ shiftId: string; endedAt: string }>> => {
  const supabase = createSupabaseServiceClient();
  const shift = await dbCloseShift(supabase, shiftId);
  if (!shift || !shift.ended_at) {
    return { ok: false, error: 'No se pudo registrar la salida' };
  }
  return { ok: true, data: { shiftId: shift.id, endedAt: shift.ended_at } };
};

const clearSessionCookie = (): void => {
  cookies().delete(SESSION_COOKIE);
};

export const signOut = async (): Promise<ActionResult<null>> => {
  clearSessionCookie();
  return { ok: true, data: null };
};

export const closeShiftAndSignOut = async (): Promise<ActionResult<{ shiftId: string }>> => {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const claims = await verifyEmployeeJWT(token);
      const employeeId = claims.sub;
      const supabase = createSupabaseServiceClient();

      // Buscar shift abierto: primero en v2 (nuevo path), luego legacy.
      const openShiftRow =
        (await getOpenShiftForEmployeeV2(supabase, employeeId)) ??
        (await getOpenShiftForEmployee(supabase, employeeId));

      if (openShiftRow) {
        const closed = await dbCloseShift(supabase, openShiftRow.id);
        cookieStore.delete(SESSION_COOKIE);
        if (!closed) return { ok: false, error: 'No se pudo cerrar el turno' };
        return { ok: true, data: { shiftId: closed.id } };
      }
    } catch {
      // JWT inválido — solo borrar cookie
    }
  }

  cookieStore.delete(SESSION_COOKIE);
  return { ok: true, data: { shiftId: '' } };
};

// ---------------------------------------------------------------------------
// Demo fingerprint — identifica al empleado por ID sin verificar PIN.
// ---------------------------------------------------------------------------

const DEMO_EMPLOYEE_ID = '00000000-0000-0000-0000-00000000e001';

export const fingerprintDemoLookup = async (): Promise<ActionResult<LookupForClockResult>> => {
  const supabase = createSupabaseServiceClient();

  const { data: lastShift } = await supabase
    .from('shifts')
    .select('employee_id')
    .eq('type', 'clock_in')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const employeeId = lastShift?.employee_id ?? DEMO_EMPLOYEE_ID;

  const { data: emp, error } = await supabase
    .from('employees')
    .select('id, full_name, role')
    .eq('id', employeeId)
    .maybeSingle();

  if (error || !emp) {
    return { ok: false, error: 'Empleado demo no encontrado' };
  }

  const employee = emp as Pick<EmployeeRow, 'id' | 'full_name' | 'role'>;
  const openShiftRow = await getOpenShiftForEmployee(supabase, employee.id);

  return {
    ok: true,
    data: {
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        role: employee.role as Role,
      },
      openShift: openShiftRow ? { id: openShiftRow.id, started_at: openShiftRow.started_at } : null,
    },
  };
};
