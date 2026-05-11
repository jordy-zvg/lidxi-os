'use server';

import {
  closeShift,
  createSupabaseServiceClient,
  findEmployeeByPin,
  getOpenShiftForEmployee,
  openShift,
  signEmployeeJWT,
} from '@lidxi/db';
import type { Role } from '@lidxi/shared';
import { cookies } from 'next/headers';
import { getBranchId, getStationId } from './station';

/**
 * Server Actions del flujo de auth.
 *
 *   • activatePosStation   — Login del POS. Solo manager/cashier. Crea sesión
 *                            persistente del dispositivo y abre shift del
 *                            empleado tipo 'pos_activation'.
 *   • lookupForClock       — Lookup read-only para el ClockOverlay. Identifica
 *                            al empleado y reporta si hay shift abierto.
 *                            NO escribe nada.
 *   • performClockIn       — Crea un shift tipo 'clock_in' para el empleado.
 *   • performClockOut      — Cierra el shift abierto. Caller debe pasar el id.
 */

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const ACTIVATABLE_ROLES: ReadonlySet<Role> = new Set(['manager', 'cashier']);
const SESSION_COOKIE = 'lidxi-session';
const SESSION_MAX_AGE_S = 60 * 60 * 12; // 12h, alineado con TTL del JWT

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

export const activatePosStation = async (
  pinRaw: string,
): Promise<ActionResult<{ employeeName: string }>> => {
  const pin = sanitizePin(pinRaw);
  if (!pin) return { ok: false, error: 'PIN inválido' };

  const supabase = createSupabaseServiceClient();
  const branchId = getBranchId();
  const employee = await findEmployeeByPin(supabase, branchId, pin);
  if (!employee) return { ok: false, error: 'PIN incorrecto' };

  if (!ACTIVATABLE_ROLES.has(employee.role)) {
    return { ok: false, error: 'Tu rol no permite activar el POS' };
  }

  // Cierra cualquier shift abierto del mismo empleado (multi-dispositivo defense).
  const previousOpen = await getOpenShiftForEmployee(supabase, employee.id);
  if (previousOpen) {
    await closeShift(supabase, previousOpen.id, { autoClosed: true });
  }

  const newShift = await openShift(supabase, {
    employeeId: employee.id,
    branchId,
    type: 'pos_activation',
  });
  if (!newShift) return { ok: false, error: 'No se pudo abrir la sesión. Intenta de nuevo.' };

  // Necesitamos restaurant_id para el JWT (RLS lo lee). Lo sacamos del branch.
  const { data: branch } = await supabase
    .from('branches')
    .select('restaurant_id')
    .eq('id', branchId)
    .single();
  if (!branch) return { ok: false, error: 'Branch no encontrado' };
  const restaurantId = (branch as { restaurant_id: string }).restaurant_id;

  const token = await signEmployeeJWT(
    {
      sub: employee.id,
      employee_role: employee.role,
      branch_id: branchId,
      restaurant_id: restaurantId,
      station_id: getStationId(),
      pos_session_id: newShift.id,
    },
    SESSION_MAX_AGE_S,
  );
  await setSessionCookie(token);

  return { ok: true, data: { employeeName: employee.full_name } };
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
  const shift = await closeShift(supabase, shiftId);
  if (!shift || !shift.ended_at) {
    return { ok: false, error: 'No se pudo registrar la salida' };
  }
  return { ok: true, data: { shiftId: shift.id, endedAt: shift.ended_at } };
};
