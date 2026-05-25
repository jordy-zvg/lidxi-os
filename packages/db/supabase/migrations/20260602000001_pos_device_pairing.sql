-- ============================================================================
-- Sprint 13 — pos_devices + pos_pairing_codes
-- ============================================================================
-- Emparejamiento de tablets POS estilo Square/Toast. La tablet se vincula
-- una vez con un código corto generado por admin; después solo PIN+huella.
--
-- pos_pairing_codes:
--   Código de un solo uso, expira ~10 min. device_name viaja con el código
--   desde su creación: el admin nombra el dispositivo al generar el code, y
--   ese nombre se transfiere a pos_devices al consumirlo.
--
-- pos_devices:
--   device_token_hash: sha256 hex de un token de 32 bytes random (256 bits
--   de entropía). El token crudo solo vive en la cookie httpOnly de la
--   tablet. Lookup O(1) por hash UNIQUE.
--
-- Status:
--   'active'   — emparejado y operativo
--   'revoked'  — admin lo revocó; no resuelve tenant en /login. No se borra
--                la fila (audit trail).
--
-- RLS pattern: copia delivery_provider_connections (service_role full +
-- authenticated owner/admin del tenant). Las server actions del admin usan
-- service_role; /login lee pos_devices con service_role porque en ese
-- momento no hay sesión Supabase.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- pos_devices
-- ---------------------------------------------------------------------------
create table if not exists public.pos_devices (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  branch_id          uuid references public.branches_v2(id) on delete set null,
  name               text not null,
  device_token_hash  text not null unique,
  status             text not null default 'active',
  paired_at          timestamptz not null default now(),
  last_seen_at       timestamptz,
  created_at         timestamptz not null default now()
);

alter table public.pos_devices
  drop constraint if exists pos_devices_status_check;
alter table public.pos_devices
  add constraint pos_devices_status_check
    check (status in ('active', 'revoked'));

create index if not exists pos_devices_tenant_id_idx on public.pos_devices(tenant_id);
create index if not exists pos_devices_tenant_status_idx on public.pos_devices(tenant_id, status);

alter table public.pos_devices enable row level security;

drop policy if exists pos_devices_service_role on public.pos_devices;
create policy pos_devices_service_role on public.pos_devices
  to service_role using (true) with check (true);

drop policy if exists pos_devices_tenant_admin on public.pos_devices;
create policy pos_devices_tenant_admin on public.pos_devices
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

comment on table public.pos_devices is
  'Tablets POS emparejadas por tenant. device_token_hash es sha256 hex del token crudo (cookie kobi-device).';

-- ---------------------------------------------------------------------------
-- pos_pairing_codes
-- ---------------------------------------------------------------------------
create table if not exists public.pos_pairing_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  branch_id   uuid references public.branches_v2(id) on delete set null,
  device_name text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists pos_pairing_codes_tenant_id_idx on public.pos_pairing_codes(tenant_id);

alter table public.pos_pairing_codes enable row level security;

drop policy if exists pos_pairing_codes_service_role on public.pos_pairing_codes;
create policy pos_pairing_codes_service_role on public.pos_pairing_codes
  to service_role using (true) with check (true);

drop policy if exists pos_pairing_codes_tenant_admin on public.pos_pairing_codes;
create policy pos_pairing_codes_tenant_admin on public.pos_pairing_codes
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

comment on table public.pos_pairing_codes is
  'Códigos de emparejamiento de un solo uso (~10 min TTL). device_name viaja con el código y se transfiere a pos_devices al consumirlo.';

commit;

notify pgrst, 'reload schema';
