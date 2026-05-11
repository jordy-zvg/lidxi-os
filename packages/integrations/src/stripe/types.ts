/**
 * Wrapper sobre el SDK oficial de Stripe.
 * El objetivo del wrapper es:
 *   - Exponer solo lo que el sitio público y el OMS necesitan.
 *   - Convertir los `Promise<Stripe.X>` en `Result<...>` para mantener
 *     consistencia con el resto de integraciones.
 *   - Permitir mock mode sin que nadie tenga que pasar SDK keys en dev.
 */

export interface CheckoutSessionRequest {
  orderId: string;
  amountCents: number;
  currency: 'MXN';
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  description?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface PaymentIntentRequest {
  amountCents: number;
  currency: 'MXN';
  orderId: string;
  description?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled';
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: unknown;
  createdAt: string;
}
