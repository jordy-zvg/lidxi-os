import { type Result, err, ok } from '@kobi/shared';
import { apiError, isMockMode } from '../common';
import { mockDelivery, mockQuote } from './mock';
import type {
  UberDirectDelivery,
  UberDirectQuote,
  UberDirectQuoteRequest,
  UberDirectWebhookEvent,
} from './types';

export interface UberDirectClient {
  quote(req: UberDirectQuoteRequest): Promise<Result<UberDirectQuote>>;
  createDelivery(quoteId: string): Promise<Result<UberDirectDelivery>>;
  getDelivery(deliveryId: string): Promise<Result<UberDirectDelivery>>;
  cancelDelivery(deliveryId: string): Promise<Result<void>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<UberDirectWebhookEvent>>;
}

export const createUberDirectClient = (): UberDirectClient => {
  if (isMockMode()) {
    return {
      async quote(req) {
        return ok(mockQuote(req));
      },
      async createDelivery(quoteId) {
        return ok(mockDelivery(quoteId));
      },
      async getDelivery(deliveryId) {
        return ok({
          id: deliveryId,
          status: 'pickup',
          trackingUrl: `https://track.example.test/${deliveryId}`,
        });
      },
      async cancelDelivery() {
        return ok(undefined);
      },
      async verifyWebhook() {
        return err(apiError('not_supported', 'Webhook verification disabled in mock mode'));
      },
    };
  }

  // TODO[uber-direct]: implementar cliente real. Endpoints documentados en
  // https://developer.uber.com/docs/deliveries/api/uber-direct. Necesitamos:
  //   1. OAuth client_credentials flow contra login.uber.com/oauth/v2/token
  //   2. POST /v1/customers/{customer_id}/delivery_quotes
  //   3. POST /v1/customers/{customer_id}/deliveries
  //   4. GET  /v1/customers/{customer_id}/deliveries/{delivery_id}
  //   5. POST /v1/customers/{customer_id}/deliveries/{delivery_id}/cancel
  //   6. Verificar firma de webhook con X-Uber-Signature (HMAC-SHA256).
  throw new Error(
    'UberDirect client real no implementado. Activa MOCK_INTEGRATIONS=true en desarrollo.',
  );
};
