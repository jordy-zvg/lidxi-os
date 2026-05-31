/**
 * Tipo de pedido (É14): describe CÓMO se entrega el pedido. Es ortogonal a
 * `channel` (de DÓNDE vino la venta — ver `channels.ts`).
 *
 *   mostrador   = el cliente está presente en el local
 *   para_llevar = el cliente retira en el local (sin datos extra)
 *   envio       = despacho a domicilio → dispara Uber Direct
 *                 (requiere nombre + teléfono + dirección/lat/lng del cliente)
 *
 * Mantén estas keys sincronizadas con el CHECK de la migración
 * 20260607000002_order_type.sql.
 */

export const ORDER_TYPES = {
  mostrador: {
    key: 'mostrador',
    label: 'Mostrador',
    /** ¿Requiere capturar datos de cliente y despacho con Uber Direct? */
    requiresDelivery: false,
  },
  para_llevar: {
    key: 'para_llevar',
    label: 'Para llevar',
    requiresDelivery: false,
  },
  envio: {
    key: 'envio',
    label: 'Envío',
    requiresDelivery: true,
  },
} as const;

export type OrderTypeKey = keyof typeof ORDER_TYPES;

export const ORDER_TYPE_KEYS = Object.keys(ORDER_TYPES) as OrderTypeKey[];

export const DEFAULT_ORDER_TYPE: OrderTypeKey = 'mostrador';

/** Tipos que disparan logística de envío (Uber Direct). */
export const requiresDelivery = (orderType: OrderTypeKey): boolean =>
  ORDER_TYPES[orderType].requiresDelivery;
