import type { MarketplaceProvider } from './provider';

/**
 * Adaptador de API de Uber Eats — stub tipado.
 *
 * Lanza si no hay credenciales, igual que `uber-eats/client.ts`. Ese
 * comportamiento es deliberado: preferimos fallar al construir el adaptador
 * que descubrir a mitad de un servicio que no había credenciales.
 *
 * Cuando se implemente, `ingestOrder` NO lo llamará el cajero: lo llamará el
 * webhook de Uber al recibir `orders.notification`, con el payload ya
 * verificado. Los verbos salientes (`accept`, `markReady`, `syncMenu`,
 * `setItemAvailability`) se mapean a los endpoints listados en
 * `uber-eats/client.ts`.
 */
export const createUberEatsApiAdapter = (): MarketplaceProvider => {
  // TODO[uber-eats]: implementar sobre createUberEatsClient() cuando existan
  // credenciales. Ver los endpoints y scopes OAuth en uber-eats/client.ts.
  throw new Error(
    'UberEatsApiAdapter no implementado. Usa el adaptador manual (captura en /eats).',
  );
};
