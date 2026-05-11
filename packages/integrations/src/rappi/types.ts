/**
 * Wrapper para Rappi Partners API.
 * Documentación: https://dev-portal.rappi.com (acceso bajo invitación al partner).
 *
 * Operaciones core:
 *   - takeOrder: aceptar pedido
 *   - rejectOrder: rechazar
 *   - markReady
 *   - cancelOrder
 *   - syncMenu
 *   - set86Status
 */

export type RappiOrderStatus =
  | 'pending'
  | 'taken'
  | 'rejected'
  | 'in_preparation'
  | 'ready'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled';

export interface RappiOrder {
  id: string;
  reference: string;
  status: RappiOrderStatus;
  customer: { name: string; phone?: string };
  items: RappiOrderItem[];
  totalCents: number;
  currency: 'MXN';
  paymentMethod: 'app' | 'cash_on_delivery';
}

export interface RappiOrderItem {
  externalId: string;
  name: string;
  quantity: number;
  priceCents: number;
  toppings: { name: string; priceCents: number }[];
  comments?: string;
}

export interface RappiWebhookEvent {
  event: 'order.new' | 'order.cancelled' | 'order.delivered';
  orderId: string;
  timestamp: string;
}
