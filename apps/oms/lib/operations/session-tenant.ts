import { createSupabaseServiceClient } from '@kobi/db';
import { getEmployeeContext } from './employee-context';

/**
 * Sesión operativa resuelta para el shell (Sprint 19, Fase 3a).
 *
 * El JWT de empleado lleva tenant_id/branch_id pero NO nombres: cualquier
 * texto que el shell o una comanda impriman requiere este fetch. Un solo
 * query con join resuelve sucursal + tenant; el filtro explícito de
 * tenant_id es la garantía de aislamiento (el JWT de empleado no pasa por
 * RLS — ver el comentario de seguridad en employee-context.ts).
 */
export interface OperationSession {
  tenantName: string;
  branchName: string;
  /** true = la sucursal maneja efectivo y el shell monta el gate de fondo inicial. */
  handlesCash: boolean;
  address: string | null;
  phone: string | null;
  rfc: string | null;
}

/**
 * Devuelve la sesión operativa o null si no hay contexto de empleado.
 * Non-throwing a propósito: el shell renderiza sin sesión (build, /login).
 */
export async function getOperationSession(): Promise<OperationSession | null> {
  const ctx = await getEmployeeContext();
  if (!ctx?.branchId) return null;

  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('branches_v2')
    .select('name, handles_cash, tenants(name, address, phone, rfc)')
    .eq('id', ctx.branchId)
    .eq('tenant_id', ctx.tenantId)
    .maybeSingle();

  if (!data) return null;

  const row = data as {
    name: string;
    handles_cash: boolean;
    tenants: {
      name: string;
      address: string | null;
      phone: string | null;
      rfc: string | null;
    } | null;
  };

  return {
    tenantName: row.tenants?.name ?? 'Mi Restaurante',
    branchName: row.name,
    handlesCash: row.handles_cash,
    address: row.tenants?.address ?? null,
    phone: row.tenants?.phone ?? null,
    rfc: row.tenants?.rfc ?? null,
  };
}
