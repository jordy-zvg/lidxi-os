'use server';

import { signOut as clearOpSession } from '@/lib/auth-actions';
import { requireEmployeeContext } from '@/lib/operations/employee-context';
import { createSupabaseServiceClient } from '@kobi/db';
import { redirect } from 'next/navigation';

export type ShiftResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface ShiftInfo {
  id: string;
  started_at: string;
  employee_name: string;
}

export interface ShiftSummary {
  shift_id: string;
  started_at: string;
  cash_total_cents: number;
  card_total_cents: number;
  total_sold_cents: number;
  orders_count: number;
}

/**
 * Info básica del turno activo + empleado.
 */
export async function loadActiveShift(): Promise<ShiftResult<ShiftInfo>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  if (!ctx.shiftId) return { ok: false, error: 'No hay turno activo en esta estación.' };

  const supabase = createSupabaseServiceClient();
  const [shiftRes, empRes] = await Promise.all([
    supabase
      .from('shifts')
      .select('id, started_at')
      .eq('id', ctx.shiftId)
      .eq('tenant_id', ctx.tenantId)
      .maybeSingle(),
    supabase
      .from('employees_v2')
      .select('name')
      .eq('id', ctx.employeeIdV2)
      .eq('tenant_id', ctx.tenantId)
      .maybeSingle(),
  ]);

  if (!shiftRes.data) return { ok: false, error: 'Turno no encontrado' };
  const shift = shiftRes.data as { id: string; started_at: string };
  const emp = empRes.data as { name: string } | null;

  return {
    ok: true,
    data: {
      id: shift.id,
      started_at: shift.started_at,
      employee_name: emp?.name ?? 'Empleado',
    },
  };
}

/**
 * Snapshot de totales del turno actual (calculados desde order_payments).
 * Se usa para mostrar el corte antes de cerrar y para persistir al cierre.
 */
export async function loadShiftSummary(): Promise<ShiftResult<ShiftSummary>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  if (!ctx.shiftId) return { ok: false, error: 'No hay turno activo' };

  const supabase = createSupabaseServiceClient();

  const [shiftRes, paymentsRes] = await Promise.all([
    supabase
      .from('shifts')
      .select('id, started_at')
      .eq('id', ctx.shiftId)
      .eq('tenant_id', ctx.tenantId)
      .maybeSingle(),
    supabase
      .from('order_payments')
      .select('method, amount_cents, order_id')
      .eq('shift_id', ctx.shiftId)
      .eq('tenant_id', ctx.tenantId),
  ]);

  if (!shiftRes.data) return { ok: false, error: 'Turno no encontrado' };
  const shift = shiftRes.data as { id: string; started_at: string };
  const payments = (paymentsRes.data ?? []) as {
    method: string;
    amount_cents: number;
    order_id: string;
  }[];

  let cash = 0;
  let card = 0;
  const orderIds = new Set<string>();
  for (const p of payments) {
    if (p.method === 'cash') cash += p.amount_cents;
    else if (p.method === 'card') card += p.amount_cents;
    orderIds.add(p.order_id);
  }

  return {
    ok: true,
    data: {
      shift_id: shift.id,
      started_at: shift.started_at,
      cash_total_cents: cash,
      card_total_cents: card,
      total_sold_cents: cash + card,
      orders_count: orderIds.size,
    },
  };
}

/**
 * Cierra el turno: persiste totales calculados desde order_payments +
 * efectivo contado opcional para detectar diferencias.
 */
export async function closeShiftAndCheckout(
  cashCountedCents: number | null,
): Promise<ShiftResult<{ shiftId: string; difference_cents: number | null }>> {
  let ctx: Awaited<ReturnType<typeof requireEmployeeContext>>;
  try {
    ctx = await requireEmployeeContext();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin sesión' };
  }
  if (!ctx.shiftId) return { ok: false, error: 'No hay turno activo' };

  const summary = await loadShiftSummary();
  if (!summary.ok) return summary;

  const supabase = createSupabaseServiceClient();
  const difference =
    cashCountedCents !== null ? cashCountedCents - summary.data.cash_total_cents : null;
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('shifts')
    .update({
      ended_at: now,
      closed_at: now,
      closed_by_employee_id_v2: ctx.employeeIdV2,
      cash_expected_cents: summary.data.cash_total_cents,
      cash_counted_cents: cashCountedCents,
      cash_difference_cents: difference,
      card_total_cents: summary.data.card_total_cents,
      orders_count: summary.data.orders_count,
      total_sold_cents: summary.data.total_sold_cents,
    })
    .eq('id', ctx.shiftId)
    .eq('tenant_id', ctx.tenantId);

  if (error) return { ok: false, error: error.message };

  return { ok: true, data: { shiftId: ctx.shiftId, difference_cents: difference } };
}

/**
 * Conveniencia: cierra el turno + limpia la cookie de operación.
 * Llamado por la UI después de mostrar el corte.
 */
export async function endShiftAndSignOut(cashCountedCents: number | null): Promise<void> {
  const r = await closeShiftAndCheckout(cashCountedCents);
  if (!r.ok) return; // El UI mostró el error.
  await clearOpSession();
  redirect('/login');
}
