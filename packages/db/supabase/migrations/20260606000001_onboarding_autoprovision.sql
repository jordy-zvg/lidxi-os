-- ============================================================================
-- Sprint 16 — FASE 1: Onboarding auto-provisión (P0)
-- ============================================================================
-- Problema: tras signup + wizard, un tenant nuevo queda SIN registro en
-- `restaurants` ni en `branches` legacy. Sin `restaurants` el storefront da 404
-- y el POS no puede crear órdenes (FK orders.branch_id NOT NULL → branches).
--
-- Esta migración resuelve la parte de esquema:
--   1. tenants.slug deja de ser NOT NULL. El trigger de signup ya NO genera el
--      slug feo 'restaurante-<8hex>' (que nunca se usa en URLs públicas — el
--      storefront resuelve por restaurants.slug). El slug de negocio vive en
--      restaurants.slug y lo asigna el wizard de onboarding.
--   2. handle_new_user() se simplifica: crea tenant (sin slug) + user_tenants.
--
-- La creación de restaurants + branches legacy la hace el server action
-- completeOnboarding (paso 4 del wizard), idempotente, fuera de esta migración.
--
-- Idempotente: re-ejecutable sin error.
-- ============================================================================

-- 1. tenants.slug nullable (Postgres permite múltiples NULL en UNIQUE).
alter table public.tenants alter column slug drop not null;

-- 2. Trigger de signup: ya no autogenera slug.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid;
begin
  -- slug intencionalmente omitido (queda NULL). El wizard de onboarding crea
  -- el restaurant con un slug legible derivado del nombre del negocio.
  insert into public.tenants (name, plan, subscription_status)
  values ('Mi Restaurante', 'arranque', 'trial')
  returning id into new_tenant_id;

  insert into public.user_tenants (user_id, tenant_id, role, onboarding_completed)
  values (new.id, new_tenant_id, 'admin', false);

  return new;
end;
$$;
