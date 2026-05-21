-- ============================================================================
-- Sprint 9 — Storage: bucket menu-items con policies aisladas por tenant
-- ============================================================================
-- Modelo de path: {tenant_id}/menu/{item_id}.{ext}
-- El primer segmento del path es el tenant_id; las policies validan que el
-- caller pertenece a ese tenant via user_tenants. Cualquier intento de leer
-- o escribir bajo un tenant_id que NO le pertenece falla.
--
-- Lecturas públicas (storefront, marketplaces) usan getPublicUrl directo —
-- las policies de SELECT cubren ese caso con `bucket_id = 'menu-items'` sin
-- restricción de auth (público read-only).
--
-- Service role bypassa todo (uploads desde server actions vía
-- createSupabaseServiceClient).
-- ============================================================================

begin;

-- 0. Borrar policies legacy demasiado permisivas (Sprint 7 menu editor).
--    `menu_items_service_write` permitía INSERT a cualquier rol sin filtro
--    (with check NULL implícito), y `menu_items_service_delete`/`_public_read`
--    abrían todo el bucket. Las reemplazamos por las tenant-isolated más
--    abajo. Service role bypasea RLS, así que las server actions del OMS
--    (que usan createSupabaseServiceClient) siguen funcionando.
drop policy if exists "menu_items_service_write"   on storage.objects;
drop policy if exists "menu_items_service_delete"  on storage.objects;
drop policy if exists "menu_items_public_read"     on storage.objects;

-- 1. Crear bucket si no existe (public read).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-items',
  'menu-items',
  true,
  4194304,                                              -- 4 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. SELECT público: cualquier visitante (storefront) puede leer.
drop policy if exists "menu_items_storage_public_read" on storage.objects;
create policy "menu_items_storage_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'menu-items');

-- 3. INSERT: solo authenticated users del tenant del primer segmento del path.
drop policy if exists "menu_items_storage_tenant_insert" on storage.objects;
create policy "menu_items_storage_tenant_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'menu-items'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.user_tenants where user_id = auth.uid()
    )
  );

-- 4. UPDATE: solo authenticated del tenant dueño del objeto.
drop policy if exists "menu_items_storage_tenant_update" on storage.objects;
create policy "menu_items_storage_tenant_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'menu-items'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.user_tenants where user_id = auth.uid()
    )
  );

-- 5. DELETE: solo authenticated del tenant dueño del objeto.
drop policy if exists "menu_items_storage_tenant_delete" on storage.objects;
create policy "menu_items_storage_tenant_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'menu-items'
    and (storage.foldername(name))[1]::uuid in (
      select tenant_id from public.user_tenants where user_id = auth.uid()
    )
  );

commit;
