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
  /**
   * Precio unitario en unidad MAYOR (pesos con decimales), tal como lo espera MP
   * en `unit_price`. Se obtiene con `toMajorUnits(cents)` de @kobi/shared en la
   * frontera de integración — NO pasar CentsMXN crudos aquí.
   */
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

/**
 * Estado de pago canónico de Kobi — alineado 1:1 con el CHECK de
 * `orders.payment_status` (`pending | paid | failed | refunded`). MP 'cancelled'
 * colapsa a 'failed'; no hay estado 'cancelled' separado en la orden.
 */
export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Pago de MP normalizado al dominio de Kobi. Es el resultado de consultar la API
 * de MP (`payment.get`) en el webhook — la fuente AUTORITATIVA del status. El
 * payload del webhook nunca se confía para decidir el estado.
 */
export interface NormalizedMercadoPagoPayment {
  /** ID del payment en MP. */
  mpPaymentId: string;
  /** external_reference de la preference = id interno de la orden. */
  orderId: string;
  /** Status mapeado al enum interno DB-aligned. */
  status: OrderPaymentStatus;
  /** Status crudo de MP (approved, rejected, in_process, ...). */
  rawStatus: string;
  /** Monto cobrado en CentsMXN. */
  amountCents: number;
  /** Moneda (MXN). */
  currency: string;
  /** tenant_id de metadata, si MP lo devolvió. */
  tenantId: string | null;
}

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
