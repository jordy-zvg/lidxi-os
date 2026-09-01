-- ============================================================================
-- Sprint 19 — handles_cash por sucursal (arqueo de efectivo opcional)
-- ============================================================================
-- Miztli Burguers opera solo con Uber Eats: la plataforma cobra al cliente y
-- no entra efectivo a la sucursal. El gate de fondo inicial (OpeningFloatGate,
-- montado en el shell de TODA la zona operativa, no solo en /caja) no aplica
-- a ese modo de operación.
--
-- Se apaga por dato, no por código: el día que entre venta de mostrador es un
-- toggle en esta columna, no otro cambio en el shell.
--
-- El concepto de turno se conserva intacto — es lo que da sesión e identidad
-- vía requireEmployeeContext(). Lo que se apaga es el ARQUEO DE EFECTIVO.
--
-- Idempotente: ADD COLUMN IF NOT EXISTS permite re-correr sin error.
--
-- ---------------------------------------------------------------------------
-- SOBRE EL CRITERIO DEL BACKFILL (leer antes de modificar)
-- ---------------------------------------------------------------------------
-- Default false + backfill selectivo: ninguna sucursal que HOY maneja efectivo
-- debe perder su gate en silencio al correr esta migración.
--
-- El criterio NO es `shifts.opening_float_set`, aunque parezca el natural.
-- Motivo: el botón "Omitir (fondo $0)" del modal llama submit(0) →
-- setShiftOpeningFloat(0), que también marca opening_float_set = true
-- (apps/oms/lib/operations/shift-actions.ts). Esa bandera significa
-- "el cajero ya vio el modal en este turno", NO "esta sucursal maneja
-- efectivo". Usarla marcaría como cash-handling a cualquier sucursal donde
-- alguien haya omitido el arqueo una vez.
--
-- El criterio real es la evidencia de dinero: existe al menos un cobro en
-- efectivo registrado (order_payments.method = 'cash'). Eso solo puede haber
-- ocurrido si la sucursal efectivamente cobró en efectivo.
--
-- Se cubren las dos formas de ligar un pago a una sucursal, porque conviven:
--   (a) vía el turno donde se cobró  (order_payments.shift_id → shifts)
--   (b) vía la orden cobrada         (order_payments.order_id → orders)
-- Nota de esquema: shifts.branch_id es FK a la tabla LEGACY `branches`
-- (init_schema), mientras que shifts.branch_id_v2 (20260521000004) apunta a
-- branches_v2. Solo se usa branch_id_v2 aquí; lo mismo para orders.branch_id_v2.
-- ============================================================================

ALTER TABLE public.branches_v2
  ADD COLUMN IF NOT EXISTS handles_cash BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.branches_v2.handles_cash IS
  'true = la sucursal maneja efectivo: muestra el gate de fondo inicial y el cierre de caja con arqueo. false = cobra la plataforma (marketplace); sin arqueo. No afecta la apertura de turno.';

-- ---------------------------------------------------------------------------
-- Backfill: preservar el comportamiento de sucursales que YA cobran efectivo.
-- Evidencia = al menos un cobro con method='cash', ligado por turno o por orden.
-- ---------------------------------------------------------------------------
UPDATE public.branches_v2 b
   SET handles_cash = true
 WHERE b.handles_cash = false
   AND (
     EXISTS (
       SELECT 1
         FROM public.order_payments p
         JOIN public.shifts s ON s.id = p.shift_id
        WHERE p.method = 'cash'
          AND s.branch_id_v2 = b.id
     )
     OR EXISTS (
       SELECT 1
         FROM public.order_payments p
         JOIN public.orders o ON o.id = p.order_id
        WHERE p.method = 'cash'
          AND o.branch_id_v2 = b.id
     )
   );

-- ---------------------------------------------------------------------------
-- Verificación post-aplicación (ejecutar a mano, no forma parte del DDL).
-- Esperado para Miztli Burguers: handles_cash = false.
-- Esperado para sucursales de Miztli Pardo con historial de cobros en efectivo:
-- handles_cash = true.
-- ---------------------------------------------------------------------------
--   SELECT b.id, b.name, t.name AS tenant, b.handles_cash
--     FROM public.branches_v2 b
--     LEFT JOIN public.tenants t ON t.id = b.tenant_id
--    ORDER BY t.name, b.name;
