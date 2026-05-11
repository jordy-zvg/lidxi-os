/**
 * Wrapper para Uber Eats Marketplace API.
 * Referencia: https://developer.uber.com/docs/eats/overview
 *
 * Operaciones core para el OMS:
 *   - acceptOrder: aceptar pedido entrante
 *   - denyOrder: rechazar con motivo
 *   - markReady: notificar que el pedido está listo para recoger
 *   - getMenu / updateMenu: sync del catálogo
 *   - set86Status: marcar item como 86 (sin stock)
 *   - handleWebhook
 */

export type EatsOrderStatus =
  | 'created'
  | 'accepted'
  | 'denied'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface EatsOrder {
  id: string;
  externalReference: string;
  storeId: string;
  status: EatsOrderStatus;
  customer: { firstName: string; phone?: string };
  items: EatsOrderItem[];
  totalCents: number;
  currency: 'MXN';
  estimatedReadyAt: string;
}

export interface EatsOrderItem {
  id: string;
  externalId: string;
  title: string;
  quantity: number;
  priceCents: number;
  customizations: { title: string; selections: string[] }[];
  specialInstructions?: string;
}

export interface EatsDenyReason {
  reason: 'out_of_items' | 'closing_early' | 'too_busy' | 'cannot_complete';
  details?: string;
}

export interface EatsWebhookEvent {
  eventType: 'orders.notification' | 'orders.cancel' | 'store.provisioned';
  resourceHref: string;
  orderId?: string;
  timestamp: string;
}
