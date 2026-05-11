-- =============================================================================
-- Helpers de auth para RLS.
--
-- El OMS firma sus propios JWTs (PIN custom) usando el mismo secret que
-- Supabase, lo que permite que PostgREST los valide y exponga sus claims vía
-- `current_setting('request.jwt.claims', true)::jsonb`.
--
-- Claims esperados:
--   sub           — employee_id (uuid)
--   role          — 'authenticated' (lo necesita PostgREST)
--   branch_id     — uuid del branch en el que el empleado opera
--   restaurant_id — uuid del restaurant
--   employee_role — uno de 'manager' | 'cashier' | 'cook' | 'courier'
-- =============================================================================

create or replace function app.jwt_claims()
returns jsonb
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

create or replace function app.current_employee_id()
returns uuid
language sql stable as $$
  select nullif(app.jwt_claims() ->> 'sub', '')::uuid;
$$;

create or replace function app.current_branch_id()
returns uuid
language sql stable as $$
  select nullif(app.jwt_claims() ->> 'branch_id', '')::uuid;
$$;

create or replace function app.current_restaurant_id()
returns uuid
language sql stable as $$
  select nullif(app.jwt_claims() ->> 'restaurant_id', '')::uuid;
$$;

create or replace function app.current_employee_role()
returns text
language sql stable as $$
  select app.jwt_claims() ->> 'employee_role';
$$;

create or replace function app.is_manager()
returns boolean
language sql stable as $$
  select app.current_employee_role() = 'manager';
$$;
