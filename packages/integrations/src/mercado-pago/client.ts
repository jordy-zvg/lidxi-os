/**
 * Factory del cliente Mercado Pago. Selección por `MP_MODE`:
 *   - mock        → preferencia falsa que apunta a página interna de pago
 *   - sandbox     → MP test credentials
 *   - production  → MP prod credentials
 *
 * Si MP_MODE no está set:
 *   - cae a 'mock' si MOCK_INTEGRATIONS=true
 *   - cae a 'sandbox' si el access token de TEST está poblado y no el de PROD
 *   - cae a 'production' en otro caso
 */

import { type Result, ok } from '@kobi/shared';
import { isMockMode } from '../common';
import type { MercadoPagoEnvironment } from './credentials';
import { createMockPreference } from './mock';
import { createRealPreference } from './real';
import type { MercadoPagoPreference, MercadoPagoPreferenceRequest } from './types';

export type MercadoPagoEffectiveMode = 'mock' | 'sandbox' | 'production';

export function resolveMercadoPagoMode(): MercadoPagoEffectiveMode {
  const explicit = process.env.MP_MODE?.toLowerCase();
  if (explicit === 'mock' || explicit === 'sandbox' || explicit === 'production') {
    return explicit;
  }
  if (isMockMode()) return 'mock';
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN_PROD) return 'production';
  return 'sandbox';
}

/**
 * Narrowing del modo al ENTORNO real para llamadas que SIEMPRE hablan con MP
 * (p.ej. el fetch del pago en el webhook): 'mock' no aplica ahí, colapsa a
 * 'sandbox'. El webhook nunca debería recibir tráfico real en modo mock, pero
 * si llegara, sandbox es el default seguro.
 */
export function resolveMercadoPagoEnvironment(): MercadoPagoEnvironment {
  return resolveMercadoPagoMode() === 'production' ? 'production' : 'sandbox';
}

export interface MercadoPagoClient {
  mode: MercadoPagoEffectiveMode;
  createPreference(req: MercadoPagoPreferenceRequest): Promise<Result<MercadoPagoPreference>>;
}

export function createMercadoPagoClient(
  modeOverride?: MercadoPagoEffectiveMode,
): MercadoPagoClient {
  const mode = modeOverride ?? resolveMercadoPagoMode();
  return {
    mode,
    async createPreference(req) {
      if (mode === 'mock') {
        return ok(createMockPreference(req));
      }
      return createRealPreference(mode === 'production' ? 'production' : 'sandbox', req);
    },
  };
}
