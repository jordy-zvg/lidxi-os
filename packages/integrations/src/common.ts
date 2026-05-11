import type { ApiError } from '@lidxi/shared';

/**
 * Detecta si el cliente debe operar en modo mock. Usamos la env var sin
 * prefijo NEXT_PUBLIC_ a propósito: los clientes de integraciones SOLO se
 * instancian server-side. Si alguna vez se necesita el flag en cliente, se
 * expone un endpoint que lo lea, en vez de filtrar credenciales por engaño.
 */
export const isMockMode = (): boolean => process.env.MOCK_INTEGRATIONS === 'true';

export const apiError = (
  code: string,
  message: string,
  status?: number,
  cause?: unknown,
): ApiError => ({ code, message, status, cause });
