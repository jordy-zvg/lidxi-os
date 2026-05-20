/**
 * Defensive helper para resolver la membership única de un usuario.
 *
 * Modelo de negocio: un usuario = un tenant. Pero si por una secuela de seed
 * + migration aparecen múltiples filas, no reventamos: tomamos la primera de
 * forma determinista (por created_at ASC) y logueamos un warning para detección.
 */
export function resolveSingleMembership<T>(
  rows: T[] | null,
  context: string,
  userId: string,
): T | null {
  if (!rows || rows.length === 0) return null;
  if (rows.length > 1) {
    console.warn(
      `[${context}] User ${userId} has ${rows.length} memberships (expected 1). Using first by created_at.`,
    );
  }
  return rows[0] ?? null;
}
