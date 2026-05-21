/**
 * Factory + interfaz del cliente de Uber Direct.
 *
 * Selección por `UBER_DIRECT_MODE`:
 *   - mock        → in-process state machine (default cuando MOCK_INTEGRATIONS=true)
 *   - sandbox     → ambiente sandbox de Uber Direct con credenciales sandbox
 *   - production  → API real de Uber Direct con credenciales partner
 *
 * Si UBER_DIRECT_MODE no está set, cae a 'mock' cuando MOCK_INTEGRATIONS=true,
 * y a 'production' en otro caso. Esto preserva el contrato anterior pero
 * agrega granularidad por integración para que MP y UD puedan estar en
 * modos distintos (ej. MP en sandbox, UD en mock todavía).
 */

import { type Result, err, ok } from '@kobi/shared';
import { apiError, isMockMode } from '../common';
import { cancelMockDelivery, createMockDelivery, createMockQuote, getMockDelivery } from './mock';
import { type UberDirectRealCredentials, createRealUberDirectClient } from './real';
import type {
  UberDirectDelivery,
  UberDirectQuote,
  UberDirectQuoteRequest,
  UberDirectWebhookEvent,
} from './types';

export type UberDirectMode = 'mock' | 'sandbox' | 'production';

export interface UberDirectClient {
  mode: UberDirectMode;
  quote(req: UberDirectQuoteRequest): Promise<Result<UberDirectQuote>>;
  createDelivery(quoteId: string): Promise<Result<UberDirectDelivery>>;
  getDelivery(deliveryId: string): Promise<Result<UberDirectDelivery>>;
  cancelDelivery(deliveryId: string, reason?: string): Promise<Result<void>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<UberDirectWebhookEvent>>;
}

export function resolveUberDirectMode(): UberDirectMode {
  const explicit = process.env.UBER_DIRECT_MODE?.toLowerCase();
  if (explicit === 'mock' || explicit === 'sandbox' || explicit === 'production') {
    return explicit;
  }
  return isMockMode() ? 'mock' : 'production';
}

export interface CreateUberDirectClientOptions {
  /** Credenciales del tenant; requerido para sandbox/production. */
  credentials?: UberDirectRealCredentials;
  /** Override del modo (útil en tests). */
  mode?: UberDirectMode;
}

export function createUberDirectClient(opts: CreateUberDirectClientOptions = {}): UberDirectClient {
  const mode = opts.mode ?? resolveUberDirectMode();

  if (mode === 'mock') {
    return {
      mode,
      async quote(req) {
        return ok(createMockQuote(req));
      },
      async createDelivery(quoteId) {
        const d = createMockDelivery(quoteId);
        if (!d) return err(apiError('not_found', 'Quote no encontrada o expirada'));
        return ok(d);
      },
      async getDelivery(deliveryId) {
        const d = getMockDelivery(deliveryId);
        if (!d) return err(apiError('not_found', `Delivery ${deliveryId} no encontrada`));
        return ok(d);
      },
      async cancelDelivery(deliveryId, reason) {
        const ok_ = cancelMockDelivery(deliveryId, reason);
        if (!ok_) return err(apiError('not_cancellable', 'Delivery ya entregada o inexistente'));
        return ok(undefined);
      },
      async verifyWebhook() {
        return err(apiError('not_supported', 'Webhook real desactivado en mock mode'));
      },
    };
  }

  if (!opts.credentials) {
    throw new Error(
      `UberDirect ${mode} requiere credentials. Configura el tenant en /admin/sitio-propio.`,
    );
  }
  const real = createRealUberDirectClient(mode, opts.credentials);
  return {
    mode,
    ...real,
    async cancelDelivery(deliveryId, _reason) {
      // El API real ignora el motivo del lado del cliente (lo registra en
      // notes del manifest si se quiere); por ahora lo dropeamos.
      return real.cancelDelivery(deliveryId);
    },
  };
}
