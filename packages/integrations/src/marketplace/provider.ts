import type { Result } from '@kobi/shared';
import type { IngestOrderInput, IngestOrderResult, MarketplaceDenyReason } from './types';

/**
 * Contrato genérico de un marketplace de comida.
 *
 * Implementaciones:
 *   - `UberEatsManualAdapter`  → el puente humano: el cajero teclea lo que ve
 *                                en la tablet de Uber. Implementa `ingestOrder`.
 *   - `UberEatsApiAdapter`     → stub tipado; lanza sin credenciales.
 *
 * Nota sobre `ingestOrder`: la ingesta escribe en la base de Kobi, así que su
 * implementación vive en la capa de app (server action con `requireEmployeeContext`
 * y service client), no aquí. Este paquete no importa `@kobi/db` ni resuelve
 * sesión. El provider recibe la función de escritura por inyección.
 */
export interface MarketplaceProvider {
  readonly key: 'uber-eats';
  /** Cómo entra el pedido: tecleado por una persona o vía API. */
  readonly mode: 'manual' | 'api';

  /** Crea el pedido en Kobi. El manual lo implementa de verdad. */
  ingestOrder(input: IngestOrderInput): Promise<Result<IngestOrderResult>>;

  /** No-op en manual: la aceptación ya ocurrió en la tablet de Uber. */
  accept(externalId: string, readyInMinutes: number): Promise<Result<void>>;

  /** No-op en manual: rechazar en Kobi no le llega a Uber. */
  deny(externalId: string, reason: MarketplaceDenyReason): Promise<Result<void>>;

  /** No-op en manual: Uber no se entera de que el pedido está listo. */
  markReady(externalId: string): Promise<Result<void>>;

  /** En manual registra la cancelación local (no viaja a Uber). */
  cancel(externalId: string): Promise<Result<void>>;

  /** `not_supported` en manual: no hay canal para empujar el catálogo. */
  syncMenu(): Promise<Result<void>>;

  /** `not_supported` en manual: el 86 se hace a mano en la tablet. */
  setItemAvailability(menuItemExternalId: string, available: boolean): Promise<Result<void>>;
}

/** Función de escritura que la capa de app inyecta en el adaptador manual. */
export type IngestWriter = (input: IngestOrderInput) => Promise<Result<IngestOrderResult>>;
