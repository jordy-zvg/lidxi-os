-- Sprint 7.6 — H16 fix: contact_messages.source ausente.
-- El handler /api/public/contact inserta `source` (UTM/origen del lead) pero la columna
-- nunca existió. Agregar idempotente sin tocar data existente.

alter table public.contact_messages
  add column if not exists source text default 'web_contact_form';

comment on column public.contact_messages.source is
  'Origen del mensaje. Valores típicos: web_contact_form, web_contact_form:demo, web_contact_form:soporte, etc. Útil para attribution en growth.';

create index if not exists contact_messages_source_idx on public.contact_messages (source);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
