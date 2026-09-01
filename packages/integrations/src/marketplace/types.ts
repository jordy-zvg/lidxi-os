import type { CentsMXN } from '@kobi/shared';

/**
 * Interfaz genérica de marketplace (Sprint 19).
 *
 * Es la hermana de la interfaz de courier (`quote/create/track/cancel`) pero
 * para el otro lado del negocio: los pedidos que ENTRAN desde una plataforma.
 *
 * Estos verbos son de dominio Kobi, NO de la API de Uber. La diferencia
 * importa: `uber-eats/client.ts` expone `getOrder` —traer un pedido DESDE el
 * proveedor— que es justo lo contrario de lo que hace el puente manual, que
 * empuja un pedido HACIA Kobi. Modelar la interfaz sobre la forma de Uber
 * obligaría a traducir dos veces para siempre.
 *
 * El adaptador manual implementa `ingestOrder` de verdad; el resto son no-op
 * honestos o `not_supported` explícito. Que el stub diga "no soportado" en vez
 * de fingir éxito es lo que hace que, el día que entre la API real, el
 * compilador y los tests señalen cada punto donde el comportamiento cambia.
 */

/** Un modificador tal como llega del marketplace (o lo teclea el cajero). */
export interface MarketplaceModifier {
  name: string;
  /** Delta en centavos. En captura manual siempre 0: el precio lo fija Uber. */
  priceDeltaCents: number;
}

export interface MarketplaceLineInput {
  menuItemId: string;
  /** Nombre para la comanda; puede diferir del catálogo si Uber lo renombra. */
  name: string;
  qty: number;
  unitPriceCents: CentsMXN;
  /** Nota libre para cocina. Vacío = sin nota. */
  note: string;
  modifiers: MarketplaceModifier[];
}

export interface IngestOrderInput {
  /** ID corto que muestra la tablet de Uber. Es el `external_id` del pedido. */
  externalId: string;
  /** Opcional: si se omite, la acción aplica un default. */
  customerName: string | null;
  items: MarketplaceLineInput[];
  /** Total que cobra la plataforma, en centavos. */
  totalCents: CentsMXN;
}

export interface IngestOrderResult {
  orderId: string;
  folio: string;
}

/** Motivo de rechazo, normalizado sobre el enum de Uber. */
export interface MarketplaceDenyReason {
  reason: 'out_of_items' | 'closing_early' | 'too_busy' | 'cannot_complete';
  details?: string;
}
