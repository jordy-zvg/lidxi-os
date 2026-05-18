/**
 * Pub/sub en memoria para eventos de delivery tracking.
 *
 * Abstracción sobre Node.js EventEmitter. Cuando se agregue Redis
 * para despliegues multi-instancia, solo hay que cambiar este módulo.
 *
 * Canal: `order:{orderId}` — emite TrackingSnapshot cada vez que
 * el webhook de Uber Direct actualiza el estado o posición del courier.
 */

import { EventEmitter } from 'node:events';

export interface TrackingSnapshot {
  orderId: string;
  status: string;
  courierLat: number | null;
  courierLng: number | null;
  etaSeconds: number | null;
  courierName: string | null;
  courierPhone: string | null;
  courierVehicle: string | null;
  courierPhoto: string | null;
  courierRating: number | null;
  plate: string | null;
  routeGeometry: string | null;
  lastEventAt: string;
}

// Singleton — compartido por todas las instancias en el mismo proceso
const emitter = new EventEmitter();
emitter.setMaxListeners(200); // muchos clientes SSE simultáneos

export const trackingChannel = (orderId: string) => `order:${orderId}`;

/** Publica un nuevo snapshot (llamado desde el webhook handler) */
export const publishTracking = (snapshot: TrackingSnapshot): void => {
  emitter.emit(trackingChannel(snapshot.orderId), snapshot);
};

/** Suscribe a updates de un pedido; retorna función de cleanup */
export const subscribeTracking = (
  orderId: string,
  handler: (snapshot: TrackingSnapshot) => void,
): (() => void) => {
  const channel = trackingChannel(orderId);
  emitter.on(channel, handler);
  return () => emitter.off(channel, handler);
};
