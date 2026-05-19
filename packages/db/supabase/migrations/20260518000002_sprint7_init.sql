-- Sprint 7 — Track B onboarding + Track C employees + tenant assets.
-- Idempotente: multi_tenant (20260518000001) ya crea tenants con plan; aquí solo agregamos columnas faltantes.

-- 1. Columnas extra para onboarding (tenants.plan ya existe vía multi_tenant)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::jsonb;

-- 2. Tabla de empleados multi-tenant — DIFERIDA a Sprint 7.6.
-- Bug de diseño: colisiona con public.employees del init_schema (single-tenant Miztli con branch_id).
-- Cuando Sprint 7.6 resuelva el conflicto, esta tabla pasará a llamarse employees_v2 (paralelo a branches_v2).
-- Mientras tanto el wizard de onboarding y /admin/equipo usan datos mock (sin escritura a DB).

-- 3. Storage: bucket de assets por tenant (logo, fotos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Tenant assets are public" ON storage.objects;
CREATE POLICY "Tenant assets are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-assets');

DROP POLICY IF EXISTS "Tenant users can upload assets" ON storage.objects;
CREATE POLICY "Tenant users can upload assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tenant-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tenant users can update their assets" ON storage.objects;
CREATE POLICY "Tenant users can update their assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tenant-assets' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Tenant users can delete their assets" ON storage.objects;
CREATE POLICY "Tenant users can delete their assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'tenant-assets' AND auth.role() = 'authenticated');
