/**
 * Tipos del wrapper de Uber Direct (logística como servicio).
 * Coberturan los endpoints que necesita el OMS:
 *   - quote: pedir tarifa para una entrega
 *   - createDelivery: contratar la entrega tras aceptar quote
 *   - getDelivery: leer estado actual
 *   - cancelDelivery: cancelar antes de pickup
 *   - handleWebhook: verificar firma y normalizar payloads
 *
 * Referencia: https://developer.uber.com/docs/deliveries/api/uber-direct
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
  pickupReadyAt: string;
  pickupDeadlineAt: string;
}

export interface UberDirectQuote {
  id: string;
  feeCents: number;
  currency: 'MXN' | 'USD';
  pickupEta: string;
  dropoffEta: string;
  expiresAt: string;
}

export interface UberDirectDelivery {
  id: string;
  status:
    | 'pending'
    | 'pickup'
    | 'pickup_complete'
    | 'dropoff'
    | 'delivered'
    | 'canceled'
    | 'returned';
  trackingUrl: string;
  courier?: { name: string; phone?: string; vehicle?: string; lat?: number; lng?: number };
  pickupEta?: string;
  dropoffEta?: string;
  proofOfDeliveryUrl?: string;
}

export interface UberDirectWebhookEvent {
  type: 'delivery.status' | 'courier.update' | 'delivery.proof';
  deliveryId: string;
  data: UberDirectDelivery;
  timestamp: string;
}
