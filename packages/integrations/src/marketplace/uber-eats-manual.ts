import { type Result, err, ok } from '@kobi/shared';
import { apiError } from '../common';
import type { IngestWriter, MarketplaceProvider } from './provider';
import type { IngestOrderInput, MarketplaceDenyReason } from './types';

/**
 * Puente manual de Uber Eats: una persona lee la tablet de Uber y teclea el
 * pedido en Kobi. Es el único adaptador real mientras no haya acceso a la API.
 *
 * Diseño de los no-op: el pedido YA fue aceptado en la tablet antes de que
 * nadie toque Kobi, así que `accept`/`deny`/`markReady` no tienen a dónde
 * viajar. Devuelven ok(undefined) porque la operación es genuinamente
 * innecesaria, no porque haya fallado silenciosamente.
 *
 * Diseño de los `not_supported`: `syncMenu` y `setItemAvailability` SÍ tienen
 * un efecto esperado que este adaptador no puede producir. Fingir éxito ahí
 * haría creer al caller que el catálogo de Uber se actualizó. El error
 * explícito es lo que hace honesto el stub.
 */
export const createUberEatsManualAdapter = (ingest: IngestWriter): MarketplaceProvider => ({
  key: 'uber-eats',
  mode: 'manual',

  async ingestOrder(input: IngestOrderInput) {
    return ingest(input);
  },

  async accept(_externalId: string, _readyInMinutes: number): Promise<Result<void>> {
    // La aceptación ocurrió en la tablet. Pedir un tap extra en Kobi sería
    // ceremonia sin significado.
    return ok(undefined);
  },

  async deny(_externalId: string, _reason: MarketplaceDenyReason): Promise<Result<void>> {
    return ok(undefined);
  },

  async markReady(_externalId: string): Promise<Result<void>> {
    // Uber no se entera; el repartidor ya está en el local o en camino.
    return ok(undefined);
  },

  async cancel(_externalId: string): Promise<Result<void>> {
    // La cancelación local la registra el flujo de pedidos de Kobi; aquí no
    // hay llamada saliente que hacer.
    return ok(undefined);
  },

  async syncMenu(): Promise<Result<void>> {
    return err(
      apiError(
        'not_supported',
        'El puente manual no puede sincronizar el catálogo con Uber. Actualiza el menú en el portal de Uber Eats.',
      ),
    );
  },

  async setItemAvailability(
    _menuItemExternalId: string,
    _available: boolean,
  ): Promise<Result<void>> {
    return err(
      apiError(
        'not_supported',
        'El puente manual no puede marcar 86 en Uber. Hazlo desde la tablet.',
      ),
    );
  },
});
