-- 1. Actualización de tabla tenants para el Track B (Onboarding)
ALTER TABLE tenants 
ADD COLUMN onboarding_step INT DEFAULT 1,
ADD COLUMN onboarding_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN plan text DEFAULT 'starter';

-- 2. Tabla de empleados operativos (Track C - Equipo)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin operativo', 'Cajero', 'Cocinero', 'Runner')),
  pin TEXT NOT NULL,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'pausado')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, pin) -- El PIN debe ser único dentro de la misma operación
);

-- RLS para employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are viewable by tenant users" ON employees
  FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));
CREATE POLICY "Employees are insertable by tenant admins" ON employees
  FOR INSERT WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY "Employees are updatable by tenant admins" ON employees
  FOR UPDATE USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
CREATE POLICY "Employees are deletable by tenant admins" ON employees
  FOR DELETE USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- 3. Storage: Bucket para assets del tenant (Logo, etc)
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-assets', 'tenant-assets', true);

CREATE POLICY "Tenant assets are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-assets');

CREATE POLICY "Tenant users can upload assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tenant-assets' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Tenant users can update their assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tenant-assets' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Tenant users can delete their assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tenant-assets' AND 
    auth.role() = 'authenticated'
  );