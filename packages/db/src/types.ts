/**
 * Tipos generados desde el esquema Supabase.
 *
 * Mientras `types.gen.ts` solo refleje schemas internos (storage, graphql_public)
 * porque aún no se aplicaron las migrations a la base local, dejamos `Database`
 * como `unknown` para que el cliente Supabase se comporte permisivo y los
 * helpers tipados de `queries.ts` controlen la forma esperada con casts puntuales.
 *
 * Cuando corras:
 *   pnpm db:reset    # aplica las 4 migrations + seed
 *   pnpm db:types    # regenera types.gen.ts con las 15 tablas tipadas
 *
 * cambia las dos líneas siguientes por:
 *   import type * as Gen from './types.gen';
 *   export type Database = Gen.Database;
 *   export type Tables<T extends keyof Database['public']['Tables']> =
 *     Database['public']['Tables'][T]['Row'];
 */
export type Database = unknown;
