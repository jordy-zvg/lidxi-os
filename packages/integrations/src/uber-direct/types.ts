/**
 * Tipos del wrapper de Uber Direct (logística como servicio).
 *
 * Endpoints cubiertos por el wrapper:
 *   - quote: pedir tarifa para una entrega
 *   - createDelivery: contratar la entrega tras aceptar quote
 *   - getDelivery: leer estado actual
 *   - cancelDelivery: cancelar antes de pickup
 *   - verifyWebhook: verificar firma de webhook de Uber
 *
 * Referencia oficial:
 *   https://developer.uber.com/docs/deliveries/api/uber-direct
 *
 * Estados normalizados (Sprint 12):
 *   pending           → entrega creada, sin courier asignado
 *   courier_assigned  → courier aceptó, en camino al pickup
 *   pickup_arrived    → courier llegó al restaurante
 *   picked_up         → courier recogió la orden, en camino al cliente
 *   dropoff_arrived   → courier llegó al cliente
 *   delivered         → entregada
 *   canceled          → cancelada por restaurante, cliente o courier
 *   returned          → courier no entregó, regresa con la orden
 *   error             → error transitorio (ej. courier no disponible)
 *
 * El upstream usa nombres ligeramente distintos (`pickup_complete`, `dropoff`)
 * pero el wrapper normaliza a este enum para evitar churn en el caller.
 */

export interface UberDirectAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: 'MX';
  unit?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface UberDirectContact {
  firstName: string;
  lastName?: string;
  phone: string;
}

export interface UberDirectQuoteRequest {
  pickupAddress: UberDirectAddress;
  pickupContact: UberDirectContact;
  dropoffAddress: UberDirectAddress;
  dropoffContact: UberDirectContact;
  /** ISO timestamp en que la orden estará lista para pickup. */
  pickupReadyAt: string;
  /** ISO timestamp máximo aceptable para pickup. */
  pickupDeadlineAt: string;
  /** Valor del pedido en cents (para seguro). Opcional. */
  manifestTotalCents?: number;
}

export interface UberDirectQuote {
  id: string;
  feeCents: number;
  currency: 'MXN' | 'USD';
  /** Distancia estimada (m). */
  distanceMeters: number;
  /** Duración estimada del viaje (s). */
  durationSeconds: number;
  /** ETA al pickup (cuando el courier llega al restaurante). */
  pickupEta: string;
  /** ETA al dropoff (cuando entrega al cliente). */
  dropoffEta: string;
  /** Cuándo expira esta cotización (típicamente 5 min). */
  expiresAt: string;
}

export type UberDirectDeliveryStatus =
  | 'pending'
  | 'courier_assigned'
  | 'pickup_arrived'
  | 'picked_up'
  | 'dropoff_arrived'
  | 'delivered'
  | 'canceled'
  | 'returned'
  | 'error';

export interface UberDirectCourier {
  name: string;
  phone?: string;
  vehicle?: 'bike' | 'car' | 'motorcycle' | 'scooter';
  plate?: string;
  /** Foto del courier (URL absoluta). */
  photoUrl?: string;
  /** Rating 0-5. */
  rating?: number;
  /** Posición actual del courier. */
  lat?: number;
  lng?: number;
}

export interface UberDirectDelivery {
  id: string;
  status: UberDirectDeliveryStatus;
  /** URL de tracking público (compartible con cliente final). */
  trackingUrl: string;
  courier?: UberDirectCourier;
  pickupEta?: string;
  dropoffEta?: string;
  /** URL del proof-of-delivery (foto/firma) cuando status === 'delivered'. */
  proofOfDeliveryUrl?: string;
  /** Razón de cancelación si status === 'canceled'. */
  cancelReason?: string;
}

export interface UberDirectWebhookEvent {
  type: 'delivery.status' | 'courier.update' | 'delivery.proof';
  deliveryId: string;
  data: UberDirectDelivery;
  timestamp: string;
}
