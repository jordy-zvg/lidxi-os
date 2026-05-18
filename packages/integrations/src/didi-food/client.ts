import { type Result, err, ok } from '@kobi/shared';
import { apiError, isMockMode } from '../common';
import { mockOrder } from './mock';
import type { DidiOrder, DidiWebhookEvent } from './types';

export interface DidiFoodClient {
  getOrder(orderId: string): Promise<Result<DidiOrder>>;
  confirmOrder(orderId: string, etaMinutes: number): Promise<Result<void>>;
  rejectOrder(orderId: string, reason: string): Promise<Result<void>>;
  markReady(orderId: string): Promise<Result<void>>;
  cancelOrder(orderId: string, reason: string): Promise<Result<void>>;
  set86Status(menuItemExternalId: string, available: boolean): Promise<Result<void>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<DidiWebhookEvent>>;
}

export const createDidiFoodClient = (): DidiFoodClient => {
  if (isMockMode()) {
    return {
      async getOrder(orderId) {
        return ok(mockOrder(orderId));
      },
      async confirmOrder() {
        return ok(undefined);
      },
      async rejectOrder() {
        return ok(undefined);
      },
      async markReady() {
        return ok(undefined);
      },
      async cancelOrder() {
        return ok(undefined);
      },
      async set86Status() {
        return ok(undefined);
      },
      async verifyWebhook() {
        return err(apiError('not_supported', 'Webhook verification disabled in mock mode'));
      },
    };
  }

  // TODO[didi]: una vez con credenciales y NDA, llenar los endpoints reales.
  // El portal de partners de Didi documenta el flujo exacto.
  throw new Error('DidiFood client real no implementado. Activa MOCK_INTEGRATIONS=true.');
};
