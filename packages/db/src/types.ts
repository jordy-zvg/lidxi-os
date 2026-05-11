import type * as Gen from './types.gen';

export type Database = Gen.Database;

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];