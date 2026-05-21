/**
 * Tipos del wrapper de Mercado Pago.
 *
 * Cubrimos el flujo de Checkout Pro (preference + redirección a init_point)
 * más el webhook de notificación de pagos. Es lo que el storefront necesita
 * para cobrar online sin tener la tarjeta nunca tocando nuestros servers.
 *
 * Referencia oficial:
 *   https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/landing
 */

export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  /** Precio unitario en pesos (no centavos — MP usa el monto en la moneda). */
  unitPrice: number;
}

export interface MercadoPagoPreferenceRequest {
  /** ID interno del pedido (lo usamos como external_reference). */
  orderId: string;
  tenantId: string;
  items: MercadoPagoItem[];
  payerEmail: string;
  /** URL absoluta del storefront para back_urls. */
  storefrontBaseUrl: string;
  /** URL absoluta del OMS para el webhook notification_url. */
  omsBaseUrl: string;
  /** Para identificar de qué restaurante viene el pedido al redirigir. */
  restaurantSlug: string;
}

export interface MercadoPagoPreference {
  id: string;
  /** URL a la que redirigir al cliente para que pague. */
  initPoint: string;
  /** URL del sandbox cuando mode=test. */
  sandboxInitPoint?: string;
}

export type MercadoPagoPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface MercadoPagoWebhookEvent {
  /** Status mapeado al enum interno de Kobi. */
  status: MercadoPagoPaymentStatus;
  /** ID del payment en MP. */
  paymentId: string;
  /** external_reference que pasamos en preference (= order_id). */
  orderId: string;
  /** tenant_id que pasamos en metadata. */
  tenantId: string | null;
  /** Status crudo de MP (approved, in_process, rejected, etc.). */
  rawStatus: string;
  /** Monto cobrado en pesos. */
  amount: number;
  /** Moneda (MXN). */
  currency: string;
  /** ISO timestamp del evento. */
  createdAt: string;
}
