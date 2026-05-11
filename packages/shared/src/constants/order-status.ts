/**
 * Estados del ciclo de vida de un pedido.
 *
 *   received   → entró al sistema, pendiente de aceptar
 *   preparing  → cocina trabajando en él
 *   ready      → listo para recoger / despachar
 *   dispatched → entregado a repartidor (camino al cliente)
 *   delivered  → entregado al cliente final
 *   cancelled  → cancelado en cualquier punto
 */

export const ORDER_STATUSES = [
  'received',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  TRANSITIONS[from].includes(to);

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Recibido',
  preparing: 'En preparación',
  ready: 'Listo',
  dispatched: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
