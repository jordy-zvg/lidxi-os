import type { ChannelKey } from '../constants/channels.js';
import type { OrderStatus } from '../constants/order-status.js';
import type { CentsMXN } from './money';

/**
 * Tipos de dominio para pedidos. Estos NO son los tipos generados por
 * Supabase (esos viven en `@lidxi/db`). Aquí modelamos la forma que el
 * dominio usa internamente — generalmente un subset enriquecido.
 */

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  qty: number;
  unitPrice: CentsMXN;
  modifiers: OrderItemModifier[];
  notes?: string;
}

export interface OrderItemModifier {
  name: string;
  priceDelta: CentsMXN;
}

export interface Order {
  id: string;
  branchId: string;
  channel: ChannelKey;
  externalId: string | null;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  items: OrderItem[];
  subtotal: CentsMXN;
  tax: CentsMXN;
  deliveryFee: CentsMXN;
  total: CentsMXN;
  createdAt: string;
  acceptedAt: string | null;
  readyAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  slaDeadline: string;
}
