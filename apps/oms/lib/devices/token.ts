import { createHash, randomBytes } from 'node:crypto';

/**
 * Token crudo del dispositivo: 32 bytes random → 64 hex chars (256 bits entropy).
 * Solo vive en la cookie httpOnly de la tablet. En DB solo se guarda el hash.
 */
export const generateDeviceToken = (): string => randomBytes(32).toString('hex');

/**
 * Hash determinístico para lookup O(1) en pos_devices.device_token_hash (UNIQUE).
 * Justificación: el token tiene 256 bits de entropía — sha256 es suficiente y
 * permite buscar la fila por `.eq('device_token_hash', ...)`. bcrypt obligaría
 * a iterar y comparar cada fila activa.
 */
export const hashDeviceToken = (raw: string): string =>
  createHash('sha256').update(raw).digest('hex');
