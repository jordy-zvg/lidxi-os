-- ===========================================================================
-- Menu Editor — Sprint 1.6 Track A
-- Agrega:
--   1. Bucket de storage 'menu-items' para fotos de platillos
--   2. Columna photo_key en menu_items para rastrear el path del storage
-- ===========================================================================

-- Bucket público para imágenes de menú
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-items',
  'menu-items',
  true,
  4194304, -- 4 MB en bytes
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Política: servicio puede subir/borrar, público puede leer
create policy "menu_items_public_read"
  on storage.objects for select
  using (bucket_id = 'menu-items');

create policy "menu_items_service_write"
  on storage.objects for insert
  with check (bucket_id = 'menu-items');

create policy "menu_items_service_delete"
  on storage.objects for delete
  using (bucket_id = 'menu-items');

-- Columna para rastrear el path del objeto en storage (útil para borrado limpio)
alter table public.menu_items
  add column if not exists photo_key text;
