import { type Result, err, ok } from '@kobi/shared';
import Stripe from 'stripe';
import { apiError, isMockMode } from '../common';
import { mockCheckoutSession, mockPaymentIntent } from './mock';
import type {
  CheckoutSession,
  CheckoutSessionRequest,
  PaymentIntent,
  PaymentIntentRequest,
  StripeWebhookEvent,
} from './types';

export interface StripeClient {
  createCheckoutSession(req: CheckoutSessionRequest): Promise<Result<CheckoutSession>>;
  createPaymentIntent(req: PaymentIntentRequest): Promise<Result<PaymentIntent>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<StripeWebhookEvent>>;
}

export const createStripeClient = (): StripeClient => {
  if (isMockMode()) {
    return {
      async createCheckoutSession(req) {
        return ok(mockCheckoutSession(req));
      },
      async createPaymentIntent(req) {
        return ok(mockPaymentIntent(req.orderId));
      },
      async verifyWebhook() {
        return err(apiError('not_supported', 'Webhook verification disabled in mock mode'));
      },
    };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_SECRET_KEY no definido.');

  const stripe = new Stripe(secret, { apiVersion: '2024-09-30.acacia' });

  return {
    async createCheckoutSession(req) {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card', 'oxxo'],
          line_items: [
            {
              price_data: {
                currency: req.currency.toLowerCase(),
                product_data: { name: req.description ?? `Orden ${req.orderId}` },
                unit_amount: req.amountCents,
              },
              quantity: 1,
            },
          ],
          metadata: { order_id: req.orderId },
          customer_email: req.customerEmail,
          success_url: req.successUrl,
          cancel_url: req.cancelUrl,
        });
        if (!session.url) {
          return err(apiError('no_url', 'Stripe no devolvió URL de checkout', 500));
        }
        return ok({ id: session.id, url: session.url });
      } catch (e) {
        return err(apiError('stripe_error', (e as Error).message, 500, e));
      }
    },
    async createPaymentIntent(req) {
      try {
        const intent = await stripe.paymentIntents.create({
          amount: req.amountCents,
          currency: req.currency.toLowerCase(),
          metadata: { order_id: req.orderId },
          description: req.description,
        });
        return ok({
          id: intent.id,
          clientSecret: intent.client_secret ?? '',
          status: intent.status as PaymentIntent['status'],
        });
      } catch (e) {
        return err(apiError('stripe_error', (e as Error).message, 500, e));
      }
    },
    async verifyWebhook(rawBody, signature) {
      if (!webhookSecret) {
        return err(apiError('no_webhook_secret', 'STRIPE_WEBHOOK_SECRET no definido', 500));
      }
      try {
        const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        return ok({
          id: event.id,
          type: event.type,
          data: event.data,
          createdAt: new Date(event.created * 1000).toISOString(),
        });
      } catch (e) {
        return err(apiError('invalid_signature', (e as Error).message, 400, e));
      }
    },
  };
};
