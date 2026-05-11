/**
 * Placeholder de tipos generados. Cuando ejecutes:
 *
 *   pnpm db:types
 *
 * se sobreescribe `src/types.gen.ts` con los tipos derivados del esquema
 * Supabase, y este archivo simplemente reexporta. Hasta entonces, `Database`
 * queda como `unknown` para que TypeScript no compile contra una API que aún
 * no existe — y nos obligue a generar antes de usar el cliente.
 */

export type Database = unknown;

// Cuando `pnpm db:types` haya regenerado `types.gen.ts`, reemplaza la línea de
// arriba por:
//   import type * as Gen from './types.gen.js';
//   export type Database = Gen.Database;
//   export type Tables<T extends keyof Database['public']['Tables']> =
//     Database['public']['Tables'][T]['Row'];
