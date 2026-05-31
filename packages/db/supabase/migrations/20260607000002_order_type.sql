-- ============================================================================
-- Sprint 17 — É14: order_type (tipo de pedido en el POS)
-- ============================================================================
-- mostrador    = el cliente está presente en el local
-- para_llevar  = el cliente retira en el local (sin datos extra)
-- envio        = despacho a domicilio → dispara Uber Direct (requiere
--                customer_name + customer_phone + customer_address/lat/lng)
--
-- Ortogonal a `channel` (origen de la venta: mostrador/direct/eats/rappi/didi):
--   channel    = de DÓNDE vino el pedido (auditoría de origen)
--   order_type = CÓMO se entrega (servicio)
-- Son dimensiones independientes a propósito; no se fusionan.
--
-- Default 'mostrador' para no romper filas existentes ni inserts actuales del POS.
-- Idempotente: ADD COLUMN IF NOT EXISTS permite re-correr sin error.
-- ============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'mostrador'
  CHECK (order_type IN ('mostrador', 'para_llevar', 'envio'));
