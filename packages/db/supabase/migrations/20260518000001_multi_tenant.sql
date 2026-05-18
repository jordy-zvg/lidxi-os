-- Migration: multi-tenant provisioning + contact_messages
-- Crea las tablas necesarias para el sistema de tenant admins (Kobi sign-up)
-- separado del esquema de empleados existente (schema 'app').

-- ─────────────────────────────────────────────────
-- TENANTS (restaurantes / operaciones)
-- ─────────────────────────────────────────────────
create table if not exists public.tenants (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  name                 text not null,
  legal_name           text,
  rfc                  text,
  address              text,
  phone                text,
  plan                 text not null default 'arranque',
  trial_ends_at        timestamptz default (now() + interval '14 days'),
  subscription_status  text default 'trial',
  onboarding_completed boolean default false,
  metadata             jsonb default '{}',          -- canales, volumen, etc. del wizard
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  constraint tenants_plan_check   check (plan in ('arranque','crecimiento','escala')),
  constraint tenants_status_check check (subscription_status in ('trial','active','past_due','canceled'))
);

-- ─────────────────────────────────────────────────
-- USER_TENANTS (1 usuario puede pertenecer a varios tenants)
-- ─────────────────────────────────────────────────
create table if not exists public.user_tenants (
  user_id              uuid references auth.users(id) on delete cascade,
  tenant_id            uuid references public.tenants(id) on delete cascade,
  role                 text not null default 'admin',
  onboarding_completed boolean default false,
  created_at           timestamptz default now(),
  primary key (user_id, tenant_id),
  constraint user_tenants_role_check check (role in ('admin','manager','staff'))
);

-- ─────────────────────────────────────────────────
-- BRANCHES_V2 (sucursales físicas por tenant)
-- Usa sufijo _v2 para no colisionar con la tabla branches del schema 'app'
-- ─────────────────────────────────────────────────
create table if not exists public.branches_v2 (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid references public.tenants(id) on delete cascade,
  name       text not null,
  address    text,
  phone      text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────
-- CONTACT_MESSAGES (formulario público de contacto)
-- ─────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  company    text,
  type       text,
  message    text not null,
  status     text default 'new',
  created_at timestamptz default now(),
  constraint contact_messages_status_check check (status in ('new','contacted','qualified','closed'))
);

-- ─────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────
alter table public.tenants          enable row level security;
alter table public.user_tenants     enable row level security;
alter table public.branches_v2      enable row level security;
alter table public.contact_messages enable row level security;

-- tenants: un usuario solo ve sus propios tenants
create policy "users see their tenants" on public.tenants
  for select using (
    id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );
create policy "admins update tenants" on public.tenants
  for update using (
    id in (select tenant_id from public.user_tenants
           where user_id = auth.uid() and role = 'admin')
  );

-- user_tenants: cada usuario ve y modifica solo sus propias membresías
create policy "users see their memberships" on public.user_tenants
  for select using (user_id = auth.uid());
create policy "users update own membership" on public.user_tenants
  for update using (user_id = auth.uid());

-- branches_v2: scoped por tenant del usuario
create policy "users see their branches" on public.branches_v2
  for select using (
    tenant_id in (select tenant_id from public.user_tenants where user_id = auth.uid())
  );
create policy "admins manage branches" on public.branches_v2
  for all using (
    tenant_id in (select tenant_id from public.user_tenants
                  where user_id = auth.uid() and role = 'admin')
  );

-- contact_messages: write-only desde anon (formulario público), read para autenticados
create policy "anyone can insert contact" on public.contact_messages
  for insert with check (true);
create policy "only authenticated can read contact" on public.contact_messages
  for select using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────
-- TRIGGER: auto-provisionar tenant al crear usuario en auth.users
-- Se ejecuta inmediatamente en el INSERT, antes de confirmar email.
-- El tenant queda en estado 'trial' con onboarding_completed=false.
-- El middleware redirige al wizard de onboarding si no está completo.
-- ─────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
  new_slug      text;
begin
  new_slug := 'restaurante-' || left(new.id::text, 8);
  insert into public.tenants (slug, name, plan, subscription_status)
  values (new_slug, 'Mi Restaurante', 'arranque', 'trial')
  returning id into new_tenant_id;
  insert into public.user_tenants (user_id, tenant_id, role, onboarding_completed)
  values (new.id, new_tenant_id, 'admin', false);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
