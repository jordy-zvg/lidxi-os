import { type Result, err, ok } from '@lidxi/shared';
import { apiError, isMockMode } from '../common.js';
import { mockOrder } from './mock';
import type { EatsDenyReason, EatsOrder, EatsWebhookEvent } from './types';

export interface UberEatsClient {
  getOrder(orderId: string): Promise<Result<EatsOrder>>;
  acceptOrder(orderId: string, readyInMinutes: number): Promise<Result<void>>;
  denyOrder(orderId: string, reason: EatsDenyReason): Promise<Result<void>>;
  markReady(orderId: string): Promise<Result<void>>;
  set86Status(menuItemExternalId: string, suspendedUntil: string): Promise<Result<void>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<EatsWebhookEvent>>;
}

export const createUberEatsClient = (): UberEatsClient => {
  if (isMockMode()) {
    return {
      async getOrder(orderId) {
        return ok(mockOrder(orderId));
      },
      async acceptOrder() {
        return ok(undefined);
      },
      async denyOrder() {
        return ok(undefined);
      },
      async markReady() {
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

  // TODO[uber-eats]: implementar cliente real.
  // Endpoints clave:
  //   POST /v1/eats/orders/{order_id}/accept_pos_order
  //   POST /v1/eats/orders/{order_id}/deny_pos_order
  //   POST /v1/eats/orders/{order_id}/ready_for_pickup
  //   POST /v2/eats/stores/{store_id}/menus  (sync catálogo)
  //   POST /v2/eats/stores/{store_id}/items/{item_id}/suspend
  // OAuth: client_credentials con scope `eats.pos_provisioning eats.store eats.store.orders.read`.
  throw new Error('UberEats client real no implementado. Activa MOCK_INTEGRATIONS=true.');
};
