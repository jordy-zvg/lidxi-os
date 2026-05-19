-- Sprint 7.5 ampliado — H6: extender branches_v2 con sucursal real (Mapbox)
-- Captura del wizard onboarding paso 2.

alter table public.branches_v2
  add column if not exists lat numeric(9,6),
  add column if not exists lng numeric(9,6),
  add column if not exists hours_json jsonb default '{}'::jsonb,
  add column if not exists channels text[] default array[]::text[];

create index if not exists branches_v2_tenant_idx on public.branches_v2 (tenant_id);
