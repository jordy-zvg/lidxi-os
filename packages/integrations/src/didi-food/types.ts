/**
 * Wrapper para Didi Food Partners API.
 * Documentación bajo NDA; los endpoints exactos se confirman al onboardear.
 */

export type DidiOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled';

export interface DidiOrder {
  id: string;
  reference: string;
  status: DidiOrderStatus;
  customer: { name: string; phone?: string };
  items: DidiOrderItem[];
  totalCents: number;
  currency: 'MXN';
}

export interface DidiOrderItem {
  externalId: string;
  name: string;
  quantity: number;
  priceCents: number;
  options: { name: string; priceCents: number }[];
  notes?: string;
}

export interface DidiWebhookEvent {
  type: 'new_order' | 'order_cancelled' | 'order_delivered';
  orderId: string;
  timestamp: string;
}
