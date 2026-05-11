/**
 * Helpers de contexto de estación / branch.
 *
 * Mientras no exista tabla `stations`, la estación se identifica con
 * `STATION_ID` de env y se asocia a `BRANCH_ID` de env. Cuando agreguemos
 * la tabla, reemplazamos esto por una query a `stations` filtrando por el
 * MAC address o el ID del kiosco.
 *
 * Server-only. NO importar desde Client Components.
 */

export const getStationId = (): string => process.env.STATION_ID ?? 'default-station-1';

export const getBranchId = (): string => {
  const id = process.env.BRANCH_ID;
  if (!id) {
    throw new Error(
      'BRANCH_ID no definido. Setea en .env.local con el UUID del branch de esta estación.',
    );
  }
  return id;
};
