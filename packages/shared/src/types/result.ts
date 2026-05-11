/**
 * Result discriminado para llamadas a APIs externas (Uber, Rappi, Didi, Stripe).
 * Forzamos al consumidor a manejar el error vía narrowing en lugar de try/catch.
 *
 *   const r = await uberDirect.quote(req);
 *   if (!r.ok) return res.status(502).json({ error: r.error.message });
 *   const quote = r.data;
 */

export type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  cause?: unknown;
}

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });

export const err = <E = ApiError>(error: E): Result<never, E> => ({ ok: false, error });
