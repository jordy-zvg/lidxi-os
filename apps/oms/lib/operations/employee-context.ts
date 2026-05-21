import { type EmployeeClaims, verifyEmployeeJWT } from '@kobi/db';
import { cookies } from 'next/headers';

/**
 * Contexto operativo del empleado activo en la estación.
 *
 * Diferencia clave con el contexto de admin (`requireTenant`):
 *   - Admin usa sesión Supabase (`auth.uid()` apunta a `auth.users`).
 *   - Operación usa JWT custom firmado por Kobi (cookie `kobi-session`),
 *     `sub` apunta a `employees_v2.id`. NO está en `auth.users`, así que
 *     las RLS basadas en `user_tenants.user_id = auth.uid()` NO aplican.
 *
 * Implicación de seguridad:
 *   - El código operativo usa service_role (bypass RLS) para conveniencia.
 *   - El aislamiento entre tenants se garantiza por filtros explícitos
 *     `.eq('tenant_id', tenantId)` donde tenantId viene de las claims
 *     verificadas del JWT del empleado. NUNCA del cliente directamente.
 *   - Cualquier server action / route handler operativo DEBE usar este
 *     helper para resolver tenantId, no leer de env (`BRANCH_ID`) ni del
 *     body de la request.
 */
export interface EmployeeContext {
  employeeIdV2: string; // sub del JWT
  tenantId: string;
  branchId: string | null;
  restaurantId: string;
  role: EmployeeClaims['employee_role'];
  shiftId: string | null; // pos_session_id (shifts.id de la activación POS)
  stationId: string | null;
}

const SESSION_COOKIE = 'kobi-session';

export class NoOperationSessionError extends Error {
  constructor() {
    super('No hay sesión de operación activa. Activa el POS con tu PIN.');
    this.name = 'NoOperationSessionError';
  }
}

/**
 * Devuelve el contexto del empleado activo o lanza si no hay sesión válida.
 * Solo llamar desde server actions / route handlers (usa cookies()).
 */
export async function requireEmployeeContext(): Promise<EmployeeContext> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) throw new NoOperationSessionError();

  let claims: EmployeeClaims;
  try {
    claims = await verifyEmployeeJWT(token);
  } catch {
    throw new NoOperationSessionError();
  }

  if (!claims.tenant_id) {
    // JWT viejo emitido antes de Sprint 10 — forzar re-login para obtener
    // un JWT con tenant_id. No confiamos en derivarlo dinámicamente porque
    // habilita la inyección si el JWT viene manipulado.
    throw new NoOperationSessionError();
  }

  return {
    employeeIdV2: claims.sub,
    tenantId: claims.tenant_id,
    branchId: claims.branch_id || null,
    restaurantId: claims.restaurant_id,
    role: claims.employee_role,
    shiftId: claims.pos_session_id ?? null,
    stationId: claims.station_id ?? null,
  };
}

/**
 * Variante non-throwing: devuelve null si no hay contexto. Útil en
 * componentes que pueden renderizar fallback en lugar de redirigir.
 */
export async function getEmployeeContext(): Promise<EmployeeContext | null> {
  try {
    return await requireEmployeeContext();
  } catch {
    return null;
  }
}
