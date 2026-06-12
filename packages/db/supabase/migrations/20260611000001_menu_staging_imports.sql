-- ===========================================================================
-- Config de menú v1 — staging + importadores (Sprint 18)
-- Agrega:
--   1. Tabla menu_imports (ancla de cada corrida de importación / sesión de staging)
--   2. menu_items: source, status, options, import_id, review_reasons
--   3. RLS: menu_items_public_read ahora exige status='active'; RLS de menu_imports
--   4. 'whatsapp' en los CHECKs de menu_channel_prices.channel y orders.channel
--   5. Bucket PRIVADO 'menu-imports' (fotos del menú impreso) + storage policies
--
-- Aditiva, sin backfill (los defaults cubren filas existentes).
-- Invariante de precios: los importadores de marketplace (v1.5) escriben SOLO
-- su columna en menu_channel_prices y NUNCA base_price — base_price ES el
-- precio del canal directo mientras nadie consuma menu_channel_prices.
-- Ver docs/specs/menu-config-v1.md.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. menu_imports — una fila por corrida de importación (foto/manual/marketplace)
--    La UI crea la fila (processing), procesa async y pollea hasta ready|error.
--    confirmed|discarded registran el desenlace del staging.
-- ---------------------------------------------------------------------------
create table if not exists public.menu_imports (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  source      text not null check (source in ('manual', 'foto', 'rappi', 'eats', 'didi')),
  status      text not null default 'processing'
              check (status in ('processing', 'ready', 'error', 'confirmed', 'discarded')),
  input       jsonb not null default '{}'::jsonb,  -- insumo: {photo_keys: [...]} hoy; {url: ...} en v1.5
  summary     jsonb not null default '{}'::jsonb,  -- {pages, items, categories, needs_review}
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists menu_imports_tenant_id_idx on public.menu_imports(tenant_id);

drop trigger if exists menu_imports_touch_updated_at on public.menu_imports;
create trigger menu_imports_touch_updated_at
  before update on public.menu_imports
  for each row execute function app.touch_updated_at();

alter table public.menu_imports enable row level security;

create policy "menu_imports_tenant_isolation" on public.menu_imports
  for all to authenticated
  using (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );

create policy "menu_imports_service_role" on public.menu_imports
  for all to service_role
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- 2. menu_items — procedencia, ciclo de vida y modificadores
--    status (draft|active|archived) = ciclo de vida (¿publicado?).
--    active (boolean existente)     = disponibilidad del día (¿agotado?).
--    Son ejes distintos y conviven: el menú en vivo exige ambos.
--    Default status='active': las filas existentes y los altas del editor
--    siguen publicándose igual; solo los importadores insertan 'draft'.
-- ---------------------------------------------------------------------------
alter table public.menu_items
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'rappi', 'eats', 'didi', 'foto')),
  add column if not exists status text not null default 'active'
    check (status in ('draft', 'active', 'archived')),
  add column if not exists options jsonb not null default '[]'::jsonb
    check (jsonb_typeof(options) = 'array'),
  add column if not exists import_id uuid references public.menu_imports(id) on delete set null,
  add column if not exists review_reasons jsonb;  -- null = limpio; array de strings en drafts dudosos

create index if not exists menu_items_import_id_idx
  on public.menu_items(import_id) where import_id is not null;

-- ---------------------------------------------------------------------------
-- 3. RLS pública: los borradores no existen para anon (defensa en profundidad;
--    las queries de app también filtran status='active')
-- ---------------------------------------------------------------------------
drop policy if exists "menu_items_public_read" on public.menu_items;
create policy "menu_items_public_read" on public.menu_items
  for select to anon
  using (active = true and status = 'active');

-- ---------------------------------------------------------------------------
-- 4. Canal 'whatsapp' en ambos CHECKs (nombres verificados en pg_constraint).
--    Patrón drop+add ya usado en 20260609000001_orders_mp_payment_tracking.sql
-- ---------------------------------------------------------------------------
alter table public.menu_channel_prices
  drop constraint if exists menu_channel_prices_channel_check;
alter table public.menu_channel_prices
  add constraint menu_channel_prices_channel_check
    check (channel in ('direct', 'eats', 'rappi', 'didi', 'whatsapp'));

alter table public.orders
  drop constraint if exists orders_channel_check;
alter table public.orders
  add constraint orders_channel_check
    check (channel in ('direct', 'eats', 'rappi', 'didi', 'mostrador', 'whatsapp'));

-- ---------------------------------------------------------------------------
-- 5. Bucket privado para fotos del menú impreso (insumo del importador).
--    Separado de 'menu-items' (fotos de platillo, público): otro propósito,
--    otro ciclo de vida, y sin heredar la deuda del photo_key temporal.
--    Path: {tenant_id}/imports/{import_id}/{page}.{ext}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-imports',
  'menu-imports',
  false,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

drop policy if exists "menu_imports_storage_tenant_read" on storage.objects;
create policy "menu_imports_storage_tenant_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'menu-imports'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.user_tenants where user_id = auth.uid()
    )
  );

drop policy if exists "menu_imports_storage_tenant_insert" on storage.objects;
create policy "menu_imports_storage_tenant_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'menu-imports'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.user_tenants where user_id = auth.uid()
    )
  );

drop policy if exists "menu_imports_storage_tenant_delete" on storage.objects;
create policy "menu_imports_storage_tenant_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'menu-imports'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.user_tenants where user_id = auth.uid()
    )
  );
