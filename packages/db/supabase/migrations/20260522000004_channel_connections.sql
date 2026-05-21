-- ============================================================================
-- Sprint 9 — channel_connections (credenciales por canal, estructura)
-- ============================================================================
-- Estructura para conectar el tenant a cada canal externo (Uber Eats, Rappi,
-- Didi Food, Mercado Pago). En Sprint 9 SOLO se guardan credenciales: las
-- llamadas reales a las APIs llegan en sprints futuros con acceso de partner.
--
-- Modelo:
--   - Una fila por (tenant_id, channel). UNIQUE constraint garantiza
--     idempotencia: cada canal aparece a lo más una vez por tenant.
--   - credentials jsonb: las claves dependen del canal (api_key + store_id
--     para Rappi/Didi, client_id+client_secret+store_id para Uber Eats,
--     access_token+public_key+webhook_secret para Mercado Pago).
--   - status:
--       disconnected (default) — el tenant no ha tocado este canal.
--       pending     — credenciales guardadas, validación con API real
--                     pendiente (validación llegará con partner access).
--       connected   — credenciales validadas contra la API real (futuro).
--       error       — última operación falló; ver last_error.
--
-- Seguridad: las credenciales en jsonb son sensibles. RLS estricto las
-- protege a nivel de fila. Deuda: en una fase futura mover a un secrets
-- manager (Supabase Vault, AWS Secrets Manager) o encriptar en reposo con
-- pgsodium/pgcrypto.
-- ============================================================================

begin;

create table if not exists public.channel_connections (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  channel      text not null,
  status       text not null default 'disconnected',
  credentials  jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  last_error   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, channel)
);

alter table public.channel_connections
  drop constraint if exists channel_connections_channel_check;
alter table public.channel_connections
  add constraint channel_connections_channel_check
    check (channel in ('uber_eats', 'rappi', 'didi_food', 'mercado_pago'));

alter table public.channel_connections
  drop constraint if exists channel_connections_status_check;
alter table public.channel_connections
  add constraint channel_connections_status_check
    check (status in ('disconnected', 'pending', 'connected', 'error'));

create index if not exists channel_connections_tenant_id_idx
  on public.channel_connections(tenant_id);

alter table public.channel_connections enable row level security;

-- Service role: full access (jobs de sincronización futuros).
drop policy if exists channel_connections_service_role on public.channel_connections;
create policy channel_connections_service_role on public.channel_connections
  to service_role using (true) with check (true);

-- Authenticated admin/owner del tenant: full access dentro de su tenant.
drop policy if exists channel_connections_tenant_admin on public.channel_connections;
create policy channel_connections_tenant_admin on public.channel_connections
  to authenticated
  using (
    tenant_id in (
      select user_tenants.tenant_id from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.role in ('owner', 'admin')
    )
  )
  with check (
    tenant_id in (
      select user_tenants.tenant_id from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.role in ('owner', 'admin')
    )
  );

commit;

notify pgrst, 'reload schema';
