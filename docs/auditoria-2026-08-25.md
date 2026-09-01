# Auditoría de estado — 2026-08-25

**Alcance**: operar una hamburguesería (un solo negocio) con Uber Eats marketplace como canal prioritario, POS de mostrador, impresión de comandas, seguimiento y entrega. Multi-tenant se conserva pero no se invierte en él.

**Base auditada**: rama `main` @ `8977f31`, sin worktrees adicionales, sin `.git` parásito en `/Users/hibrids`. Working tree con 6 archivos staged sin commitear (trabajo en curso de sucursales): `apps/oms/app/admin/sucursales/{actions.ts,page.tsx}`, `apps/oms/components/sucursales/{SucursalSlideOver.tsx,SucursalesScreen.tsx}`, `packages/db/src/{index.ts,queries-branches.ts}`. No se tocaron.

**Método**: solo lectura de código. Nada de runtime/staging fue verificado (Railway CLI no instalado en esta máquina).

---

## 1. Tabla de capacidades del nuevo alcance

| Capacidad | Estado | Evidencia clave | Observaciones |
|---|---|---|---|
| **1. Recepción de pedidos Uber Eats** | **No existe** (ingesta); piezas sueltas sí | Adaptador `packages/integrations/src/uber-eats/client.ts:6-13` (interfaz `getOrder/acceptOrder/denyOrder/markReady/set86Status/verifyWebhook`); cliente real = `throw` (`client.ts:47`); **0 consumidores en `apps/`** | El valor `eats` YA existe en el CHECK de `orders.channel`; `external_id` con `unique(channel, external_id)` ya existe (`init_schema.sql:146,168`). No hay webhook, ni pantalla de captura, ni camino alguno por el que un pedido de Eats llegue a la tabla `orders`. No existe interfaz genérica `MarketplaceProvider` ni `ingestOrder`/`syncMenu`. UI de credenciales por canal sí existe (`apps/oms/lib/channel-schemas.ts:7,24-91`) pero nadie las consume. |
| **2. POS de mostrador para hamburguesas** | **Parcial** | `apps/oms/components/pos/PosScreen.tsx`; `apps/oms/lib/pos-actions.ts:78-209` (inserta `orders` channel=`mostrador` + `order_items` + `order_payments`) | Captura y cobro reales (efectivo con cambio, tarjeta solo registro). **Sin modificadores estructurados**: `order_items.modifiers` (jsonb, existe en schema) se inserta siempre `[]` (`pos-actions.ts:153,165,175`); único mecanismo = nota de texto libre por línea (`TicketLine.tsx:120-148`), que además parte la línea en 1 fila por unidad (`pos-actions.ts:157-168`). Sin combos (0 referencias en modelo y código). Hamburguesa + 3 modificadores hoy = 1 tap producto + abrir nota + teclear texto libre (~3-4 taps + teclado); sin precio por modificador. |
| **3. Impresión automática de comandas** | **No existe** ruta física | `packages/printing/src/driver/escpos.ts:15-66` (ESC/POS + TCP:9100 funcional; USB = `throw`); plantillas completas en `packages/printing/src/templates/` | **NO hay ruta de impresión física hoy.** `@kobi/printing` está completo (comanda cocina, ticket cliente, etiqueta, corte) pero tiene **0 imports en todo el monorepo** (solo dependencia declarada en `apps/oms/package.json:18`). `apps/agent` no existe; `useLocalAgent`/`8420`/`ws://127.0.0.1` = 0 hits. El botón "Imprimir" del POS es un `alert()` (`PosScreen.tsx:122-124`). `/admin/impresoras` es maqueta 100% mock (`MOCK_PRINTERS`). `OrderDetailSlideOver.tsx:57-64` tiene `window.print()` pero el componente no está montado en ninguna ruta y opera sobre mocks. Sin `@media print` en el repo. Además `kitchen-ticket.tsx:21` y `packing-label.tsx:15` hardcodean "MIZTLI" en el header (las otras 2 plantillas sí son dinámicas). |
| **4. Seguimiento del pedido** | **Parcial** | `/pedidos`: `apps/oms/lib/operations/order-actions.ts:43-145`; `/kds`: `apps/oms/components/kds/KdsScreen.tsx:12` | Lista `/pedidos` es real pero filtra `.in('channel', ['mostrador','direct'])` (`order-actions.ts:56`) — **un pedido de marketplace nunca aparecería**. Sin timers, sin filtro por canal, sin realtime (solo `force-dynamic` + `revalidatePath` tras acción propia; cambios de otros no refrescan). Detalle `/pedidos/[id]` usa `MOCK_ORDERS` hardcodeados (`OrderDetailView.tsx:24-25`: "Por ahora usamos mocks") — muestra datos falsos para cualquier pedido real. `/kds` es 100% mock (badge "Vista previa · datos de ejemplo", `KdsTopbar.tsx:40-43`); sus timers SLA (10/15 min, `KdsTicket.tsx:7-8`) están bien diseñados pero sobre datos falsos y "Marcar listo" solo borra de la UI local. |
| **5. Entrega por modos** | **Parcial** | `order_type` = `mostrador/para_llevar/envio` (`20260607000002_order_type.sql:18-20`); `delivery-actions.ts:316` escribe `dispatched` | La base existe: `order_type` ortogonal a `channel`, estados `dispatched/delivered` con timestamps en `orders`. Pero `/pedidos` avanza con una secuencia lineal única `received→preparing→ready→delivered` (`NEXT_STATUS`, `order-actions.ts:11-17`) **que omite `dispatched`** — no hay ramas por modo de entrega ni acciones tipo "repartidor recogió". Uber Direct: única integración con cliente real completo (`uber-direct/real.ts`: OAuth + quote/create/get/cancel + webhook HMAC cableado en `app/api/webhooks/uber-direct/route.ts`), apagada por `MOCK_INTEGRATIONS=true` + credenciales por tenant en `delivery_provider_connections` (`delivery-actions.ts:55-76`). |
| **6. Caja con desglose por canal** | **No existe** el desglose; base sólida | `apps/oms/lib/operations/shift-actions.ts:77-135`; `20260523000002_order_payments.sql:41-42` | El cierre agrega solo por método `cash`/`card` desde `order_payments`, sin join a `orders.channel`. `order_payments.method` tiene CHECK `('cash','card')` — **un pedido cobrado por plataforma no tiene forma de entrar al corte**, ni existe concepto de comisión/neto (el único cálculo de comisión vive en el mock de Reportes, `ReportesScreen.tsx:262-282`). Lo que sí existe y es real: desglose por denominación en apertura (`OpeningFloatGate.tsx`) y cierre (`CajaScreen.tsx`), tolerancia $50, cierre no bloqueante, persistencia completa en `shifts`. Ojo: botón "Cerrar turno e imprimir" no imprime nada (ver capacidad 3). |
| **7. Menú y disponibilidad** | **Parcial** | `menu-vision.ts:109-148` (visión Anthropic real); `menu_channel_prices` en `init_schema.sql:104-109` | Menu Config v1 completo end-to-end en código (staging `menu_imports`, editor con `DraftScope`, import por fotos → `runPhotoProcessing` → Anthropic con structured outputs, modelo `MENU_VISION_MODEL ?? 'claude-opus-4-8'`). Sin evidencia posible de ejecución en staging desde el repo (llamada disparada fire-and-forget desde `PhotoImportWizard.tsx:52-78`). **`menu_channel_prices`: nadie la consume en el flujo de venta** — POS/storefront/checkout leen solo `base_price` (invariante confirmada, comentario en `menu-import-actions.ts:17-22`); la única pantalla que la toca es `/admin/tarifas`, cuyos canales de UI (`pos/delivery/web/app`) **no coinciden con el CHECK de la tabla** (`direct/eats/rappi/didi/whatsapp`) — un upsert desde esa UI violaría el constraint. Toggle `active` (Pausar/Activar) solo desde admin (`MenuItemCard.tsx:123-124`); POS y KDS no pueden marcar agotado. Ejes `status`/`active` correctamente separados y ambos exigidos en lectura (`pos-actions.ts:24-30`, RLS pública). |
| **8. Estabilidad para operar** | **Parcial** | Ver §3 (bugs) y §4 (Miztli) | Los 2 bugs documentados siguen abiertos. Hardcodes de Miztli en flujos operativos listados en §4 — los críticos para otro tenant: `useTenant()` hardcodeado, detalle de pedido mock, coordenadas del mapa de tracking, credenciales MP single-cuenta, plantillas térmicas "MIZTLI". Con el alcance de un solo negocio, varios dejan de ser bloqueo y pasan a ser "renombrar/reapuntar al tenant real". Onboarding wizard existe (crea tenant + sucursal vía UI); no hay seed dedicado para un tenant nuevo distinto de Miztli. |

---

## 2. Salud del repo y del build

| Check | Resultado |
|---|---|
| `pnpm install` | **OK** (vía `corepack` — `pnpm` no está en el PATH de esta máquina; el repo declara `packageManager: pnpm@9.12.3`) |
| `turbo build` | **OK** — 3 apps (oms, storefront, clock) compilan en ~35 s. Rutas confirmadas en el build: `/pos`, `/pedidos`, `/pedidos/[id]`, `/kds`, `/caja`, `/admin/impresoras`, `/admin/menu/importar`, `/api/webhooks/uber-direct`, `/api/webhooks/mercado-pago`, `/api/orders/[id]/tracking/stream` |
| `type-check` | **OK** — 9/9 paquetes |
| `lint` | **FALLA** — `@kobi/db`: 13 errores + 29 warnings de Biome (`lint/suspicious/noConsole` en `packages/db/scripts/mock-mercado-pago.mjs` y afines; 37 diagnósticos ocultos por límite de Biome). Turbo aborta y 3 paquetes quedan sin lintear. Es ruido de scripts de seed/mock, no código de producto, pero deja el gate rojo. |
| Railway staging | **Pendiente** — CLI `railway` no instalado; no se pudo consultar el último deploy de `kobioms-production.up.railway.app` |

### Variables de entorno (resumen; detalle de lectores archivo:línea disponible)

- Un solo `.env.example` en la raíz; `.env.local` raíz real y **symlinks** desde las 3 apps (comparten set en dev).
- **Obligatorias de facto en oms** (crash al boot): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` (`validate-env.ts:8-9`, invocado en module scope de `app/layout.tsx:7`). En producción se suman `ANTHROPIC_API_KEY` y `NEXT_PUBLIC_APP_URL` (`REQUIRED_IN_PRODUCTION`, `validate-env.ts:14-23`) — ver Bug 1.
- **Opcionales con fallback/degradación**: `MENU_VISION_MODEL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `MOCK_INTEGRATIONS`, `MP_MODE` + credenciales MP, `UBER_DIRECT_MODE`, `BRANCH_ID`/`STATION_ID`, `JWT_ISSUER`/`JWT_AUDIENCE`.
- **Documentadas en `.env.example` pero muertas (0 lectores)**: `UBER_EATS_CLIENT_ID/SECRET/STORE_ID`, `RAPPI_API_KEY/STORE_ID`, `DIDI_API_KEY/STORE_ID`, `UBER_DIRECT_CLIENT_ID/SECRET/CUSTOMER_ID` (las credenciales Direct reales van por tenant en `delivery_provider_connections`), `RESEND_*`, `SENTRY_*` (4), `NEXT_PUBLIC_CLOCK_URL`.
- **Usadas pero ausentes de `.env.example`**: `UBER_DIRECT_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_VERSION`, `MOCK_PRINTERS`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Al `.env.local` local le faltan (entre otras): `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `MP_MODE` y credenciales MP de prod.

### Bugs documentados — estado

**Bug 1 — `ANTHROPIC_API_KEY` ausente tira toda la app: ABIERTO (solo en producción).** La instanciación del SDK sí es lazy (`menu-vision.ts:113-118`, dentro de función). El problema real es `validateEnv()` llamado en **module scope** de `apps/oms/app/layout.tsx:7`; como `ANTHROPIC_API_KEY` está en `REQUIRED_IN_PRODUCTION` (`validate-env.ts:22`), con `NODE_ENV=production` y la key ausente el throw rompe el layout raíz, que envuelve también todo el route group `(marketing)`. En dev no se manifiesta.

**Bug 2 — "poller" de Supabase Auth provoca 429: ABIERTO.** No existe ningún `setInterval` de auth ni `onAuthStateChange` (0 hits). El mecanismo real: `apps/oms/middleware.ts` **no exporta `config.matcher`** (corre en todas las rutas, incluidas marketing y assets) y llama `supabase.auth.getUser()` incondicionalmente al inicio (`middleware.ts:11-13`) — un roundtrip real al servidor de Auth por cada request. Ya estaba señalado en `AUDIT_HANDOFF.md:117`. A esto se suman ~12 `getUser()` adicionales en actions/páginas dentro del mismo request.

---

## 3. Bugs y riesgos encontrados (además de los 2 anteriores)

1. **Detalle de pedido con datos falsos en ruta real** — `/pedidos/[id]` renderiza `MOCK_ORDERS` en vez del pedido consultado (`OrderDetailView.tsx:8,24-25`). Un operador que abra el detalle ve cliente/ítems/dirección de demo, no los reales.
2. **Dos máquinas de estados TS divergentes** — `order-actions.ts:9-17` (sin `dispatched`) vs `delivery-actions.ts:316` y `OrderDetailSlideOver.tsx:89-93` (con `dispatched`). Un pedido despachado por Uber Direct queda en un estado que `/pedidos` no sabe avanzar ("Esta orden ya no puede avanzar"). No hay validación de transiciones en DB (solo CHECK de valores).
3. **KDS íntegramente mock** — sin lectura de Supabase ni server actions; inutilizable para operar (§1.4).
4. **Sin ninguna ruta de impresión física** — pese a `@kobi/printing` completo (§1.3). El copy "Cerrar turno e imprimir" en `/caja` promete algo que no ocurre.
5. **Marketplace invisible e incontabilizable** — filtro de canales en `/pedidos` + `order_payments` limitado a `cash/card` + cero comisiones en el corte (§1.4, §1.6).
6. **`/admin/tarifas` con canales inválidos** — la UI usa `pos/delivery/web/app` pero el CHECK de `menu_channel_prices` acepta `direct/eats/rappi/didi/whatsapp`; guardar desde esa pantalla debería fallar el constraint (`apps/oms/app/admin/tarifas/page.tsx` vs `init_schema.sql:104-109`).
7. **Credenciales Mercado Pago single-cuenta** — `getCollectorCredentials()` ignora `tenantId` (`packages/integrations/src/mercado-pago/credentials.ts:8,46-63`): "todos los tenants cobran a la cuenta de Miztli". Con el alcance de un solo negocio deja de ser bloqueo, pero la cuenta configurada debe ser la de la hamburguesería.
8. **Lint rojo** en `@kobi/db` (scripts mock/seed con `console.log`), gate CI comprometido.
9. **RLS asimétrica en `order_items`** — la unificación de Sprint 7.7 (`20260521000002`) reemplazó policies de `orders` pero no tocó `order_items`, que conserva policies legacy basadas en `app.current_branch_id()`. Riesgo bajo hoy (la zona operativa usa `service_role` + filtro `tenant_id` explícito del JWT de empleado), pero es deuda documentada ya en `AUDIT_HANDOFF.md:109`.
10. **UUIDs de Miztli inconsistentes entre archivos** — `scripts/create-test-employees.ts:8-9` usa `b27036fa-…` mientras `packages/db/tests/rls-tenant-isolation.sql:18` y la migración `20260521000003` usan `eefd730e-…`. Cuál corresponde a la BD activa no es determinable desde código.
11. **`pnpm` fuera del PATH del sistema** — solo disponible vía corepack; cualquier tooling que invoque `pnpm` a secas (p. ej. turbo lanzando tareas) falla si no se activa corepack primero.

---

## 4. Hardcodes de Miztli en flujos operativos

| Archivo:línea | Qué hardcodea | Efecto con el nuevo tenant |
|---|---|---|
| `apps/oms/lib/tenant.ts:20-25` | `useTenant()` devuelve "Miztli Pardo" + dirección Roma Norte + RFC, todo fijo | Rompe: cualquier consumidor (hoy `WebReceipt.tsx`) muestra el negocio equivocado |
| `apps/oms/components/order-detail/OrderDetailView.tsx:8,24-25` + `orders/mock-orders.ts:41-127` | Detalle de pedido = mocks Miztli (IDs `MZTL-…`, direcciones Roma Norte) | Rompe: pantalla operativa real con datos ajenos |
| `apps/oms/components/order-detail/TrackingPanel.tsx:8-10` | Lat/lng del restaurante demo | Rompe: mapa de tracking centrado en CDMX aunque la cocina esté en otro lado |
| `packages/printing/src/templates/kitchen-ticket.tsx:21`, `packing-label.tsx:15` | Header "MIZTLI" literal | Latente: rompe al conectar impresión (las plantillas `customer-receipt`/`shift-closeout` sí son dinámicas) |
| `packages/integrations/src/mercado-pago/credentials.ts:8,46-63` | Cuenta MP única vía env, ignora `tenantId` | Financiero: los cobros van a la cuenta configurada en env, sea de quien sea |
| `apps/oms/components/SessionMenu.tsx:13` | Prop default `'Demo · Miztli Pardo'` | Cosmético si todos los callers pasan el nombre real |
| `apps/storefront/next.config.mjs:14-27` | Rewrite `miztli.mx → /miztli` (único mapeo dominio→slug) | Storefront: dominio nuevo requiere editar código |
| `apps/storefront/app/layout.tsx:6-9` | Metadata raíz `title: 'Miztli'`, "Roma Norte, CDMX" | Storefront: `<title>` equivocado para cualquier slug |
| `packages/db/supabase/seed.sql:15-204` | Seed completo Miztli: restaurant + sucursal única "Juriquilla" (Roma Norte es solo la dirección matriz, no branch) + 4 empleados + menú + 10 orders | Seed de dev; no hay seed equivalente para el tenant real |
| `scripts/create-test-employees.ts:8-9` / `packages/db/tests/rls-tenant-isolation.sql:18` / migración `20260521000003` | UUIDs de tenant/branch literales (y discrepantes entre sí, ver §3.10) | Scripts de apoyo atados a Miztli |
| `packages/tokens/src/tokens.css:216-217` | `--miztli: #e11d2e` | Correcto por diseño (reservado a branding del cliente, documentado); el rojo de sistema es `#DC2626` |

Marketing/landing (fuera de alcance): ~12 hits en `apps/oms/app/(marketing)/*` + `MiztliPOSMockup.tsx`, 95 en `docs/`, 14 en `.md` de raíz. No se detallan.

**Resolución de tenant en runtime (OMS)**: zona operación por JWT de empleado en cookie `kobi-session` (claims `tenant_id/branch_id/restaurant_id`, helper SSOT `requireEmployeeContext()`); zona admin por sesión Supabase + `user_tenants`; storefront por rewrite de dominio hardcodeado. Nada se resuelve por env var en oms (solo fallbacks legacy `BRANCH_ID`/`STATION_ID` en `lib/station.ts`).

---

## 5. Contexto útil del modelo de datos (para Fase 1)

- `orders.channel`: TEXT + CHECK `('direct','eats','rappi','didi','mostrador','whatsapp')` — **`eats` ya existe**, no hace falta migración de canal. Nota: la tabla `channel_connections` usa otra nomenclatura (`uber_eats`, `didi_food`) sin FK a `orders.channel`.
- `orders.external_id` + `unique (channel, external_id)`: listo para el ID corto de Uber.
- `orders.order_type`: `mostrador/para_llevar/envio` — habría que decidir cómo modelar "recoge repartidor de la plataforma".
- `orders.status`: `received/preparing/ready/dispatched/delivered/cancelled` + timestamps por estado (`accepted_at`, `ready_at`, `dispatched_at`, `delivered_at`, `cancelled_at`). Sin validación de transiciones en DB.
- Sin columna de comisión de marketplace en `orders` (solo `delivery_fee`; el fee de Uber Direct vive en `deliveries.quote_fee_cents`).
- `order_items`: `modifiers` jsonb listo pero sin uso; `notes` texto libre; patrón actual de 1 fila por unidad cuando hay nota.
- Pagos: `order_payments` (`cash|card`, ligado a `shifts`, alimenta caja) vs `payment_events` + `orders.payment_status` (`pending/paid/failed/refunded`, webhook MP idempotente con `ALLOWED_SOURCE_STATES`). El dinero online no entra a `order_payments` por diseño explícito (`20260609000001:21-24`).
- Zona operativa usa `service_role` + filtro `tenant_id` explícito (RLS no se ejercita ahí); documentado en `employee-context.ts:6-20`.

---

## 6. Datos que siguen `[COMPLETAR]` (no asumidos)

Los seis campos del encabezado del prompt siguen sin valor. Las decisiones que dependen de cada uno:

1. **Nombre del negocio/tenant** — necesario para seed/onboarding y para reapuntar los hardcodes de §4.
2. **¿Opera ya con la tablet Uber Eats Orders?** — si sí, el Camino A (puente manual) arranca sin dependencia externa; si no, hay un alta previa con Uber que es camino crítico.
3. **¿App en developer.uber.com con scopes de Eats?** — define si el Camino B es siquiera evaluable a corto plazo. `.env.example` ya reserva `UBER_EATS_CLIENT_ID/SECRET/STORE_ID` sin lectores.
4. **Hardware de cocina (dispositivo + impresora + conexión)** — decide la ruta de impresión: el driver TCP:9100 existente favorece impresora Ethernet/WiFi ESC/POS; USB requeriría el agente local que hoy no existe; navegador requeriría CSS de impresión que hoy no existe.
5. **Modos de entrega día 1** — define cuántas ramas de la máquina de estados hay que construir de inicio.
6. **Rama base y entorno de pruebas** — el repo está en `main`; staging declarado `kobioms-production.up.railway.app` (nombre "production" en la URL: confirmar que es efectivamente staging).

---

## 7. Preguntas que no se pudieron resolver leyendo código

1. **¿Dónde vive `kobi-backlog-competitivo.md`?** No está en el repo (búsqueda exhaustiva). La Fase 1 pide cruzar contra sus épicas 7, 10.2 y 14 — necesito el archivo o su ubicación.
2. **¿La migración `20260611000001_menu_staging_imports.sql` ya se aplicó en staging/prod?** Se aplica a mano; desde el repo no es verificable.
3. **¿La extracción por visión (Anthropic) se ha ejecutado con éxito en staging?** El código está completo y conectado; no hay logs en el repo que lo demuestren (el pendiente de la memoria del proyecto sigue abierto).
4. **¿Cuál es el UUID real del tenant Miztli en la BD activa** (`b27036fa-…` vs `eefd730e-…`), y sobre qué BD corre staging (¿Free Plan? — relevante para el 429 del Bug 2)?
5. **¿Hay credenciales reales cargadas en `delivery_provider_connections`** (Uber Direct) en algún entorno, o todo opera en `MOCK_INTEGRATIONS=true`?
6. **Estado del último deploy de Railway** — CLI no instalado localmente.
7. **¿El tenant real de la hamburguesería ya existe en producción** (creado vía onboarding wizard) o se parte de cero?
8. **¿Los 6 archivos staged de sucursales** (trabajo en curso) deben considerarse parte de la base para planear, o van a commitearse/descartarse antes?

---

*Fase 0 termina aquí. Sin cambios en código fuente; único archivo creado: este documento. Esperando aprobación para Fase 1 (análisis de brecha).*
