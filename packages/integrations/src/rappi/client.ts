import { type Result, err, ok } from '@lidxi/shared';
import { apiError, isMockMode } from '../common.js';
import { mockOrder } from './mock';
import type { RappiOrder, RappiWebhookEvent } from './types';

export interface RappiClient {
  getOrder(orderId: string): Promise<Result<RappiOrder>>;
  takeOrder(orderId: string, etaMinutes: number): Promise<Result<void>>;
  rejectOrder(orderId: string, reason: string): Promise<Result<void>>;
  markReady(orderId: string): Promise<Result<void>>;
  cancelOrder(orderId: string, reason: string): Promise<Result<void>>;
  set86Status(menuItemExternalId: string, available: boolean): Promise<Result<void>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<RappiWebhookEvent>>;
}

export const createRappiClient = (): RappiClient => {
  if (isMockMode()) {
    return {
      async getOrder(orderId) {
        return ok(mockOrder(orderId));
      },
      async takeOrder() {
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

  // TODO[rappi]: implementar cliente real una vez tengamos credenciales del
  // programa de partners. Endpoints aproximados (revisar contra portal del
  // partner cuando esté autorizado):
  //   POST /restaurants-integrations-public-api/api/v2/orders/{id}/take
  //   POST /restaurants-integrations-public-api/api/v2/orders/{id}/reject
  //   POST /restaurants-integrations-public-api/api/v2/orders/{id}/ready
  //   POST /restaurants-integrations-public-api/api/v2/orders/{id}/cancel
  //   POST /restaurants-integrations-public-api/api/v2/menus  (sync catálogo)
  throw new Error('Rappi client real no implementado. Activa MOCK_INTEGRATIONS=true.');
};
