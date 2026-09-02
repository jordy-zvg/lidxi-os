# Plan de desarrollo — Miztli Burguers / Uber Eats

**Fuente de verdad**: `docs/auditoria-2026-08-25.md` (Fase 0) y `docs/brecha-2026-08-25.md` (Fase 1).
**Base**: `main` @ `8977f31`, con los 6 archivos staged de sucursales descartados antes de arrancar.
**Alcance**: un negocio, una sucursal, una estación de cocina. Canal único en Kobi: Uber Eats marketplace. La venta de mostrador existe pero **se sigue operando fuera de Kobi**.

**Decisiones aplicadas**: D1 solo Uber Eats con `handles_cash` apagado por sucursal · D2 impresión por política `SilentPrintingEnabled` · D3 tenant nuevo vía wizard · D4 alerta de 10 min como constante exportada · D5 se captura el total, no se reporta ingreso.

---

## Estructura general

Dos sprints. El corte no es por capas técnicas sino por **qué se puede demostrar al final de cada uno**:

- **Sprint 19 — "Sale papel"**: al terminar, una comanda real sale de la impresora de la cocina con un pedido guardado en la base de datos. Es el sprint del riesgo.
- **Sprint 20 — "Se opera un turno"**: al terminar, el equipo trabaja un turno completo — captura, seguimiento, cronómetro, cierre del pedido.

**Sin frentes paralelos ni worktrees.** Lo evalué y lo descarto: los dos sprints tocan el mismo conjunto reducido de archivos (`order-actions.ts`, la zona `(operations)`, el shell operativo), y el Sprint 20 depende de que la ingesta del 19 exista. Paralelizar aquí produciría conflictos de merge en los mismos ficheros a cambio de nada. Un worktree se justifica cuando dos frentes no se tocan; no es el caso.

**Por qué la impresión va primero.** Es lo único con riesgo alto y cero validación en hardware real. Todo lo demás son cambios sobre código que ya funciona. Si la impresión resulta imposible en esa PC — versión de Chrome vieja e inamovible, driver que no coopera —, quiero saberlo la primera semana y no la tercera, cuando ya se construyó una captura preciosa que alimenta un papel que nunca sale. **Una comanda de prueba con datos falsos impresa en papel real vale más que una captura perfecta que nunca tocó una impresora.**

---

# Sprint 19 — Sale papel

**Objetivo**: que una comanda de cocina salga impresa automáticamente desde Kobi en la PC de la cocina, con un pedido de Uber Eats capturado y guardado en la base de datos.

## Historias

### H19.1 — Verificación de la PC de cocina (bloqueante, va primero)

> Como cocinero, quiero que la computadora de la cocina esté configurada para imprimir sin diálogos, para que las comandas salgan solas sin que yo toque nada.

Criterios de aceptación:
- Se documenta la versión de Chrome instalada (`chrome://version`).
- Si es 144 o superior: se aplica la política y `chrome://policy` muestra `SilentPrintingEnabled` como activa.
- Si es inferior y no se puede actualizar: se documenta la decisión y se activa el fallback `--kiosk --kiosk-printing`, dejando registrado que la operación queda en pantalla completa.
- La impresora térmica es la predeterminada de Windows e imprime una página de prueba correctamente.
- "Permitir que Windows administre mi impresora predeterminada" está **desactivado**, con captura de pantalla como evidencia.
- Ctrl+P desde Chrome en cualquier página produce papel **sin diálogo**.

**Esta historia la ejecuta Jordy físicamente, no es desarrollo.** Bloquea H19.4.

### H19.2 — Comanda imprimible

> Como cocinero, quiero recibir una comanda en papel que pueda leer a un metro de distancia mientras cocino, para saber qué preparar sin acercarme a la pantalla.

Criterios de aceptación:
- Existe una vista imprimible de comanda en HTML con hoja de estilos `@media print` para 80 mm.
- La comanda incluye: nombre del negocio (como **dato del tenant**, nunca literal), badge de canal (UBER), ID corto de Uber, hora de captura, ítems con cantidad, modificadores y notas.
- **No incluye precios** (la cocina no los necesita) ni dirección de cliente (la maneja la plataforma).
- Cumple la definición de "comanda legible" (ver sección de secuencia crítica).
- Existe una ruta de prueba que renderiza una comanda con datos falsos y permite imprimirla sin pasar por la captura.
- Al imprimir, no se imprime nada del chrome de la app: ni menú lateral, ni barra superior, ni botones.

### H19.3 — Captura rápida de un pedido de Uber Eats

> Como cocinero, quiero capturar en Kobi el pedido que acaba de entrar en la tablet de Uber en menos de 20 segundos, para no frenar la cocina mientras registro.

Criterios de aceptación:
- Existe una pantalla de captura accesible en un tap desde la zona de operación.
- Campo obligatorio: **ID corto de Uber**. Si se intenta guardar un ID ya capturado, la pantalla lo dice claramente en vez de fallar con un error técnico (la restricción `unique(channel, external_id)` ya existe).
- Los ítems se agregan con botones grandes del menú, un tap por ítem, sin buscador ni categorías anidadas.
- Cada ítem admite texto libre para modificadores y notas.
- Se captura el **total** del pedido (D5).
- Nombre del cliente es opcional; si se omite, cae a un valor por defecto y **no bloquea el guardado**.
- Dirección y teléfono no se piden y quedan nulos.
- El pedido se guarda con `channel='eats'`, `external_id` con el ID de Uber y estado inicial **`preparing`** (la aceptación ya ocurrió en la tablet).
- Al guardar, la pantalla vuelve en blanco lista para el siguiente pedido, sin confirmación intermedia.
- Un cronómetro medido con la carta real confirma ≤20 s para un pedido de 2 ítems con un modificador.

### H19.4 — La comanda se imprime sola al guardar

> Como cocinero, quiero que la comanda salga impresa en el momento en que se guarda el pedido, para no tener que acordarme de imprimir.

Criterios de aceptación:
- Guardar el pedido dispara la impresión sin ningún tap adicional.
- La comanda impresa corresponde al pedido guardado (mismo ID de Uber, mismos ítems).
- Si la impresión falla, el pedido **ya quedó guardado** y la pantalla lo indica — nunca se pierde el pedido por un fallo de papel.
- Verificado físicamente en la impresora de la cocina, no en un PDF.

### H19.5 — `handles_cash` por sucursal, apagado

> Como cocinero, quiero abrir Kobi y entrar directo a trabajar, sin que me pida contar billetes que no manejo.

Criterios de aceptación:
- `branches_v2` tiene una columna `handles_cash` (boolean, default `false`).
- `OpeningFloatGate` en `Chrome.tsx:14` solo se muestra si la sucursal activa tiene `handles_cash = true`.
- Con la sucursal de Miztli Burguers (`handles_cash = false`), abrir cualquier pantalla de operación **no muestra ningún modal de arqueo**.
- El concepto de turno se conserva intacto: la sesión sigue exigiendo PIN y `requireEmployeeContext()` sigue resolviendo `tenant_id`/`branch_id` igual que hoy.
- Poner el flag en `true` restituye el comportamiento actual sin tocar código.

### H19.6 — Tenant Miztli Burguers

> Como dueño, quiero que Kobi tenga el menú y los datos de mi negocio, para que las comandas y los pedidos sean los míos.

Criterios de aceptación:
- Tenant creado vía el wizard de onboarding existente, con una sucursal.
- `useTenant()` (`apps/oms/lib/tenant.ts:20-25`) deja de devolver "Miztli Pardo" fijo y lee el tenant de la sesión.
- El nombre del negocio en la comanda impresa es el real.
- Miztli Pardo queda **intacto** como entorno de demo.
- El menú real está cargado (por importador de fotos si funciona, o captura manual).

## Migración

**Una sola**, mínima:

`packages/db/supabase/migrations/20260826000001_branch_handles_cash.sql`

```sql
-- ============================================================================
-- Sprint 19 — handles_cash por sucursal (arqueo de efectivo opcional)
-- ============================================================================
-- Miztli Burguers opera solo con Uber Eats: la plataforma cobra al cliente y
-- no entra efectivo a la sucursal. El gate de fondo inicial (OpeningFloatGate,
-- montado en el shell de toda la zona operativa) no aplica a ese modo.
--
-- Se apaga por dato, no por código: el día que entre venta de mostrador es un
-- toggle, no otro cambio en el shell.
--
-- Default false: NINGUNA sucursal existente cambia de comportamiento al correr
-- esta migración... salvo que se marque explícitamente. Por eso el backfill de
-- abajo pone true en las sucursales que YA operan con efectivo (las que tienen
-- algún turno con fondo inicial registrado), preservando su conducta actual.
--
-- Idempotente: ADD COLUMN IF NOT EXISTS permite re-correr sin error.
-- ============================================================================

ALTER TABLE public.branches_v2
  ADD COLUMN IF NOT EXISTS handles_cash BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.branches_v2.handles_cash IS
  'true = la sucursal maneja efectivo (muestra arqueo de fondo inicial y cierre de caja). false = cobra la plataforma; sin arqueo.';

-- Backfill: preservar el comportamiento de sucursales que ya usan efectivo.
-- Criterio: existe al menos un turno con fondo inicial establecido.
UPDATE public.branches_v2 b
  SET handles_cash = true
  WHERE EXISTS (
    SELECT 1 FROM public.shifts s
    WHERE s.branch_id_v2 = b.id
      AND s.opening_float_set = true
  );
```

> Verificar el nombre real de la columna de sucursal en `shifts` antes de aplicar (`branch_id_v2` vs `branch_id`); si difiere, ajusto el `WHERE` del backfill. Es la única incógnita del script.

## Archivos y paquetes que se tocan

| Área | Archivos |
|---|---|
| Migración | `packages/db/supabase/migrations/20260826000001_branch_handles_cash.sql` (nuevo) |
| Comanda | Vista imprimible nueva en `apps/oms/components/` + hoja de estilos de impresión (nuevos) |
| Captura | Pantalla de captura + server action de ingesta (nuevos, en la zona `(operations)`) |
| Integraciones | `packages/integrations/src/` — interfaz `MarketplaceProvider` + `UberEatsManualAdapter` (nuevos); `uber-eats/client.ts` se promueve, no se envuelve |
| Shell | `apps/oms/components/Chrome.tsx`, `apps/oms/components/caja/OpeningFloatGate.tsx` |
| Tenant | `apps/oms/lib/tenant.ts` |
| Tipos | `packages/db/src/types.gen.ts` (regenerar tras la migración) |

**No se toca**: `packages/printing` (intacto, para el día que exista impresora de red o cajón), `/admin/tarifas`, `menu_channel_prices`, `apps/agent` (fuera del horizonte: el POS es navegador), `/kds`, `/caja`.

## Riesgos y dependencias externas

| Riesgo | Mitigación |
|---|---|
| **Chrome de la PC por debajo de 144** | H19.1 va primero, antes de escribir código de impresión. Fallback documentado a `--kiosk --kiosk-printing` |
| **La política imprime a PDF en silencio** si la predeterminada no es la térmica | Fijar la predeterminada y desactivar la gestión automática de Windows es criterio de aceptación de H19.1, no higiene opcional |
| **La comanda sale ilegible o mal cortada** | Se prueba en papel real en la semana 1, con datos falsos, antes de la captura |
| **`branch_id` legacy NOT NULL** rompe la ingesta | Se repite el shim ya probado de `pos-actions.ts:91-106`. Decisión tomada: no migrar la FK ahora |
| La captura tarda más de 20 s | Se cronometra con la carta real como criterio de aceptación, no al final |

**Dependencia externa**: ninguna de software. Uber no bloquea nada de este sprint. Jordy ejecuta H19.1 (físico) y carga el menú (H19.6).

## Prueba de punta a punta en staging

1. Aplicar la migración en el SQL Editor y regenerar tipos.
2. Verificar que la sucursal de Miztli Burguers tiene `handles_cash = false` y que abrir la zona de operación **no muestra el modal de arqueo**.
3. Abrir la ruta de comanda de prueba e imprimir con datos falsos en la impresora real de cocina. **Este paso es el hito del sprint.**
4. Capturar un pedido de prueba con 2 ítems y un modificador, cronometrando.
5. Verificar en la base que existe con `channel='eats'`, el `external_id` correcto y estado `preparing`.
6. Confirmar que la comanda salió sola y coincide con lo capturado.
7. Intentar capturar el **mismo ID de Uber** otra vez: debe rechazarlo con un mensaje claro.
8. Reiniciar la PC, abrir Chrome, capturar otro pedido: debe imprimir sin intervención.

## Fases internas con puntos de parada

- **Fase 1 — Verificación física y migración.** H19.1 completa + migración propuesta. **Parada**: reportas el resultado de la verificación y aplicas la migración. Si Chrome está por debajo de 144, aquí se decide el fallback antes de seguir.
- **Fase 2 — Comanda en papel.** H19.2 + ruta de prueba. **Parada**: imprimes la comanda de prueba en cocina y das visto bueno sobre legibilidad. Se ajusta tipografía si hace falta.
- **Fase 3 — Captura e ingesta.** H19.3 + `MarketplaceProvider` + `UberEatsManualAdapter`. **Parada**: revisión de la pantalla y cronometraje.
- **Fase 4 — Unión y limpieza.** H19.4 (impresión automática) + H19.5 (`handles_cash`) + H19.6 (tenant). **Parada**: prueba de punta a punta completa.

---

# Sprint 20 — Se opera un turno

**Objetivo**: que el equipo trabaje un turno completo en Kobi — ver los pedidos activos, saber cuáles llevan esperando y cerrarlos cuando el repartidor los recoge.

## Historias

### H20.1 — Los pedidos de Uber aparecen en la lista

> Como cocinero, quiero ver en una sola pantalla todos los pedidos de Uber que están en marcha, para saber qué tengo pendiente.

Criterios de aceptación:
- `/pedidos` deja de filtrar por `mostrador+direct` (`order-actions.ts:56`) y muestra también `eats`.
- Cada pedido muestra su badge de canal (UBER), el ID corto de Uber, la hora y los ítems.
- No se muestra dirección para pedidos de marketplace (no existe).
- Los pedidos cancelados siguen fuera de la lista de activos.

### H20.2 — Una sola máquina de estados

> Como cocinero, quiero que los botones de avance del pedido correspondan a lo que realmente pasa en la cocina, para que ningún pedido se quede atorado.

Criterios de aceptación:
- `order-actions.ts` **elimina** su enum local y su tabla `NEXT_STATUS` (`order-actions.ts:9-17`) y consume el SSOT existente de `packages/shared/src/constants/order-status.ts`.
- La secuencia para Eats es `preparing → ready → dispatched`, usando `canTransition()` para validar.
- La acción de cierre se llama **"Repartidor recogió"** (`ready → dispatched`), no "Entregado".
- `delivered` no se usa en pedidos de Eats: Kobi no sabe cuándo llega al cliente.
- Un pedido en `dispatched` sale de la lista de activos.
- Los pedidos históricos no se tocan: sin cambio de valores ni de constraint.
- El flujo de Uber Direct, que ya escribe `dispatched`, sigue funcionando igual.

### H20.3 — Cronómetro y alerta de "listo sin recoger"

> Como cocinero, quiero ver de un vistazo cuánto lleva esperando cada pedido que ya está listo, para avisar si el repartidor se está tardando demasiado.

Criterios de aceptación:
- Cada pedido en `ready` muestra el tiempo transcurrido desde `ready_at` (columna existente).
- Al superar el umbral, la tarjeta cambia visiblemente (color y peso), legible desde la estación.
- El umbral vive en una **constante única exportada** (D4), no un número suelto en el componente. Valor inicial: 10 minutos.
- El cronómetro avanza sin recargar la página (cálculo en el cliente sobre `ready_at`).
- **Sin Supabase Realtime**: un solo cliente, sin concurrencia real que resolver.

### H20.4 — Detalle real del pedido y reimpresión

> Como cocinero, quiero abrir un pedido y volver a imprimir su comanda cuando el papel se atora o alguien la tira, para no perder el pedido.

Criterios de aceptación:
- `/pedidos/[id]` deja de renderizar `MOCK_ORDERS` (`OrderDetailView.tsx:8,24-25`) y carga el pedido real.
- Muestra los datos que existen y **omite** los que no aplican a marketplace (dirección, teléfono).
- Hay un botón de reimprimir que produce la misma comanda del Sprint 19.
- Reimprimir **no cambia el estado** del pedido ni duplica nada en la base.

### H20.5 — Middleware acotado

> Como cocinero, quiero que Kobi no se ponga lento ni falle en la hora pico, para poder capturar el pedido que tengo enfrente.

Criterios de aceptación:
- `apps/oms/middleware.ts` exporta un `config.matcher` que excluye assets estáticos y rutas públicas.
- Las rutas de operación siguen protegidas exactamente igual (verificado: sin sesión redirige al login).
- Se confirma que las peticiones a assets ya no disparan `getUser()`.

## Migración

**Ninguna.** Todo el sprint se apoya en columnas y valores que ya existen: `ready_at`, `dispatched_at` y el CHECK de `status` con los seis valores. Buena señal — confirma que el modelo de datos ya estaba bien pensado y el problema era de código.

## Archivos y paquetes que se tocan

| Área | Archivos |
|---|---|
| Lista | `apps/oms/lib/operations/order-actions.ts`, `apps/oms/components/operations/PedidosScreen.tsx` |
| Estados | `packages/shared/src/constants/order-status.ts` (consumir, no reescribir) |
| Detalle | `apps/oms/app/(operations)/pedidos/[id]/page.tsx`, `apps/oms/components/order-detail/OrderDetailView.tsx` |
| Middleware | `apps/oms/middleware.ts` |
| Constante | Umbral de alerta, junto al SSOT de estados en `@kobi/shared` |

**Se puede borrar al cerrar**: `apps/oms/components/orders/mock-orders.ts` queda sin consumidores reales tras H20.4 — confirmar antes de eliminarlo, porque `WebReceipt.tsx` y `OrderDetailSlideOver.tsx` importan su **tipo**.

## Riesgos y dependencias externas

| Riesgo | Mitigación |
|---|---|
| El `config.matcher` deja una ruta desprotegida por accidente | Verificar explícitamente que `/pedidos`, `/pos`, `/kds`, `/caja` y `/admin/*` sin sesión siguen redirigiendo |
| Quitar el enum local rompe algún caller no previsto | El type-check lo detecta: el SSOT tiene un valor más (`dispatched`) |
| El umbral de 10 min resulta ruidoso | Es una constante: se cambia en un sitio. Se recalibra con datos reales |

**Dependencia externa**: ninguna.

## Prueba de punta a punta en staging

1. Capturar un pedido de Uber (flujo del Sprint 19) y confirmar que **aparece** en `/pedidos`.
2. Avanzarlo a `ready` y ver arrancar el cronómetro.
3. Esperar a superar el umbral y confirmar la alerta visual.
4. Abrir el detalle: datos reales, sin dirección, con botón de reimprimir.
5. Reimprimir y confirmar que sale papel idéntico y el estado no cambió.
6. Marcar "Repartidor recogió" y confirmar que sale de los activos.
7. Sin sesión, confirmar que las rutas de operación siguen redirigiendo al login.
8. **Turno completo simulado**: 5 pedidos seguidos, con uno cancelado y uno reimpreso.

## Fases internas con puntos de parada

- **Fase 1 — Visibilidad y estados.** H20.1 + H20.2. **Parada**: ves los pedidos de Uber en la lista y los avanzas hasta "recogido".
- **Fase 2 — Cronómetro y detalle.** H20.3 + H20.4. **Parada**: revisión de la alerta y de la reimpresión en papel.
- **Fase 3 — Middleware.** H20.5. **Parada**: verificación de que nada quedó desprotegido.
- **Fase 4 — Turno simulado.** Prueba completa. **Parada**: visto bueno para operar con el equipo real.

---

# Secuencia crítica de la impresión

La impresión es el camino crítico: es lo único con riesgo alto y sin nada probado en hardware. El orden está pensado para que **el papel se pruebe antes que la captura**.

## Orden de ejecución

1. **Verificación física de la PC** (H19.1) — antes de escribir una línea de código de impresión.
2. **Comanda HTML con datos falsos** (H19.2) — imprimible desde una ruta de prueba, sin depender de la captura.
3. **Prueba en papel real en cocina** — el hito. Si algo falla, se descubre aquí.
4. **Captura de pedidos** (H19.3) — solo cuando el papel ya sale.
5. **Unión: imprimir al guardar** (H19.4).

## Lista de verificación física en cocina — orden exacto

Cada paso descarta una causa antes de añadir la siguiente variable. **Reporta en qué paso se rompe, si se rompe.**

1. **Versión de Chrome** — `chrome://version`. ¿144 o superior? Si no, actualizar; si no se puede, avisar para activar el fallback.
2. **Página de prueba de Windows** — Configuración → Impresoras → Preferencias → Imprimir página de prueba. Si esto falla, es driver, no Kobi.
3. **Impresora predeterminada fija** — la térmica es la predeterminada **y** "Permitir que Windows administre mi impresora predeterminada" está **desactivado**. Este ajuste es el causante clásico de "ayer imprimía y hoy manda todo a PDF" — y con la política activa, ese fallo es **silencioso**: el trabajo se guarda en Descargas y nadie ve nada.
4. **Ctrl+P desde Chrome** — en cualquier página, con diálogo todavía. Confirma el ancho de 80 mm en el driver.
5. **Aplicar la política** — registro en `SOFTWARE\Policies\Google\Chrome`, DWORD `SilentPrintingEnabled` = 1. Reiniciar Chrome. Verificar en **`chrome://policy`** que aparece activa. Repetir Ctrl+P: debe salir papel **sin diálogo**.
6. **Comanda real de Kobi** — capturar un pedido de prueba y confirmar que sale sola y legible.
7. **Prueba de reinicio** — reiniciar la PC, abrir Chrome, capturar otro pedido. Si sobrevive sin intervención, la ruta está lista.

> Efecto secundario esperado y **inofensivo**: Chrome mostrará "Tu navegador está gestionado por tu organización". Es normal al aplicar cualquier política; avisar al equipo para que nadie se asuste.

## Definición de "comanda legible"

El criterio es funcional, no estético: **un cocinero debe poder leerla a un metro de distancia, de reojo, con las manos ocupadas.**

| Elemento | Regla |
|---|---|
| **ID corto de Uber** | El elemento más grande de la comanda. Es lo que canta el repartidor al llegar |
| **Nombre del platillo** | Grande y en negritas. Segundo en jerarquía |
| **Cantidad** | Pegada al nombre y del mismo tamaño (`2× Hamburguesa`), nunca en letra pequeña aparte |
| **Modificadores** | **Indentados y con marca visual** (`+ sin cebolla`), claramente subordinados al platillo pero legibles. Nunca del mismo peso que el nombre: la confusión entre platillo y modificador es el error caro |
| **Notas de cocina** | Marcadas con etiqueta explícita (`NOTA:`) para que no se lean como un ítem más |
| **Badge de canal** | UBER, visible arriba |
| **Hora de captura** | Presente pero discreta |
| **Separadores** | Línea horizontal entre encabezado, ítems y pie — el ojo necesita anclas |
| **Precios** | **Ausentes.** La cocina no los necesita y ocupan espacio útil |

La jerarquía de `packages/printing/src/templates/kitchen-ticket.tsx` ya resuelve bien este problema (ID grande, ítems en negritas al doble de alto, modificadores indentados con `+`, notas con etiqueta). **Se copia esa jerarquía de diseño en HTML**, aunque no se reutilice el código: el package sigue intacto.

La validación es física: imprimir, colgar la comanda donde va a estar, y leerla desde donde se para el cocinero. Si hay que acercarse, la tipografía sube.

---

# Inmediatamente después del Día 1

En cuanto la cocina esté operando, en este orden:

1. **`validateEnv()` fuera del module scope** (`apps/oms/app/layout.tsx:7`). Riesgo de **despliegue**, no de operación: solo estalla en producción con `ANTHROPIC_API_KEY` ausente, y el layout raíz envuelve también las páginas de marketing. `menu-vision.ts:113-116` ya falla sola y de forma correcta cuando la key falta; el principio del proyecto lo dice: una feature opcional nunca tira la app completa.
2. **Lint de `@kobi/db`**: acotar `noConsole` para `packages/db/scripts/**` en `biome.json`. Esos scripts de seed y mock **existen para imprimir en consola** — la regla está mal aplicada al directorio, no el código mal escrito. Hay precedente exacto: el `biome-ignore` de `driver/escpos.ts:22` con el comentario "el sink de mock es la consola por diseño". Desbloquea CI, no la operación.
3. **Renombrar el proyecto de Railway.** `kobioms-production.up.railway.app` es staging; el nombre va a causar un accidente el día que exista producción real. Hacerlo **antes** de que ese día llegue.
4. **Verificar el importador de menú por visión en staging.** Sigue sin evidencia desde la Fase 0. Importa más ahora: es el camino rápido para cargar la carta, y si no funciona, la alternativa es captura manual (media hora, no un bloqueo).

---

# Horizonte posterior

Solo títulos, sin desglosar:

- **Mostrador en Kobi** — activar `handles_cash`, desglose por canal en el corte de caja (hoy agrega solo por método, sin mirar `channel`) y modificadores estructurados. Es el frente grande siguiente; el flag ya queda listo desde el Sprint 19.
- **Uber Eats Marketplace API** — cuando Uber apruebe los scopes. Se implementa el `UberEatsApiAdapter` que ya queda como stub tipado; pantallas, estados e impresión no se enteran. Verificar endpoints, eventos y scopes en la documentación oficial antes de escribir código.
- **Cajón de dinero y `apps/agent`** — solo si el mostrador entra a Kobi y el cajón se vuelve necesario: el navegador no puede abrirlo. Ahí `@kobi/printing` se usa tal como está hoy.
- **KDS** — cuando haya más de una estación de cocina o el volumen haga inmanejable el papel. Con una estación, el papel ya hace ese trabajo.
- **Comisiones y reportes de neto** — desbloquea mostrar ingresos de Eats. Hasta entonces no se muestra ningún reporte de ingresos de ese canal (D5).
- **Precio por canal** — cablear `menu_channel_prices`, **arreglando antes** `/admin/tarifas`, que hoy usa canales que violan el CHECK de la tabla.

---

# Cronograma

Semanas relativas, no fechas. **Las tareas físicas de Jordy están marcadas y sacadas de la estimación de desarrollo** — no están escondidas dentro de ningún número.

| Semana | Desarrollo | 🔧 Jordy (físico / bloqueante) |
|---|---|---|
| **1** | Sprint 19 Fases 1-2: migración propuesta, comanda HTML, ruta de prueba | 🔧 **Verificar Chrome y configurar la impresora** (lista completa, pasos 1-5) · 🔧 Aplicar la migración · 🔧 Crear el tenant en el wizard |
| **2** | Sprint 19 Fase 3: captura, `MarketplaceProvider`, `UberEatsManualAdapter` | 🔧 **Imprimir la comanda de prueba en cocina** y dar visto bueno de legibilidad (paso 6) · 🔧 Cargar el menú real |
| **3** | Sprint 19 Fase 4: impresión automática, `handles_cash`, tenant. Cierre del sprint | 🔧 Prueba de punta a punta, incluido el **reinicio de la PC** (paso 7) |
| **4** | Sprint 20 Fases 1-2: lista sin filtro, SSOT de estados, cronómetro, detalle real | 🔧 Validar la reimpresión en papel |
| **5** | Sprint 20 Fases 3-4: middleware, turno simulado. Cierre del sprint | 🔧 **Turno de prueba con el equipo real** |
| **6** | Bloque "inmediatamente después": `validateEnv`, lint, Railway, importador | — |

## Dependencias

- **H19.1 (verificar Chrome) bloquea H19.4** (impresión automática). Sin saber si la política aplica, no tiene sentido cablear el disparo. Por eso va en la semana 1.
- **H19.2 (comanda) no depende de H19.3 (captura)** — es deliberado: el papel se prueba con datos falsos antes de que exista la captura.
- **H19.3 bloquea todo el Sprint 20**: sin pedidos de Eats en la base, no hay nada que listar ni cronometrar.
- **El menú real bloquea el cronometraje de los 20 s**, no la construcción de la pantalla. Se desarrolla contra el menú de demo y se cronometra con la carta real.
- **Sprint 20 no bloquea nada externo** — cero dependencias de Uber.

**Camino crítico**: verificación de Chrome → comanda en papel → captura → lista y estados. Todo lo demás puede moverse.

---

# Deuda anotada

Recogida de la sección 13 de la brecha, sin re-litigar:

- `/admin/tarifas` usa canales (`pos/delivery/web/app`) que violan el CHECK de `menu_channel_prices` (`direct/eats/rappi/didi/whatsapp`), y no usa `PRICE_CHANNELS`, que ya existe en `@kobi/shared`. **Arreglar antes** de cablear precio por canal, no después.
- `orders.branch_id` es FK NOT NULL a la tabla legacy `branches`; el shim se repite en la ingesta de Eats. La migración a nullable queda pendiente.
- Patrón de 1-fila-por-unidad en `order_items` cuando hay nota: consistente pero subóptimo. El backfill se hace una sola vez, para ambos flujos, el día que se estructuren modificadores.
- `kitchen-ticket.tsx:21` y `packing-label.tsx:15` con "MIZTLI" literal — para cuando aterrice la ruta de impresora de red o cajón. Las otras dos plantillas del package ya reciben el nombre por props.
- `validateEnv()` en module scope — programado en el bloque inmediatamente posterior.
- Lint de `@kobi/db` — mismo bloque.
- RLS de `order_items` desalineada del resto (conserva policies legacy de Sprint 7.7 basadas en `app.current_branch_id()`). Riesgo bajo hoy: la zona operativa usa `service_role` con filtro explícito de `tenant_id`.
- Renombrar el proyecto de Railway antes de que exista producción real.
- Verificar el importador de menú por visión en staging.
- UUIDs de Miztli discrepantes entre `scripts/create-test-employees.ts:8-9` y el test de RLS/migración `20260521000003`. No bloquea con tenant nuevo, pero sigue sin resolverse.
- `apps/oms/components/orders/mock-orders.ts` queda sin consumidores de datos tras H20.4; confirmar antes de borrar porque su **tipo** sí se importa en dos componentes.

Añadido tras la Fase 2 del Sprint 19 (ingesta de Eats):

- **`OrderItemModifier` no satisface `Json`** del tipo generado por Supabase: le falta la index signature que `Json` exige. **Esa es la razón de fondo del `modifiers: never[]` en `pos-actions.ts`, no un descuido.** La ingesta de Eats lo resuelve serializando en la frontera del insert (tipo local `SerializedModifier`, misma forma que produce el mapper de `@kobi/shared`). Quien intente "arreglar" el `never[]` va a chocar con el mismo muro: la salida es agregar la index signature al tipo del dominio o serializar en la frontera — **no ensanchar el dominio**.
- **Deriva del ledger de migraciones en staging (`kobi.dev`), en una sola dirección**: hay migraciones aplicadas sin registrar en `supabase_migrations`, y ninguna registrada sin aplicar. Verificado contra `information_schema` el 2026-09-01: `branch_handles_cash`, `menu_staging_imports` y `employee_permissions` están aplicadas pero no constan. **`menu_staging_imports` no es idempotente**, así que un `db reset` o `db push` sobre ese proyecto puede romper. Verificar contra el esquema real antes de aplicar o re-aplicar nada; `list_migrations` no es fuente de verdad ahí.
- **Corrección al registro histórico**: la migración `20260607000001_employee_permissions` crea **cinco booleanos `perm_*`** (`perm_cancel_tickets`, `perm_discounts`, `perm_open_cash`, `perm_view_reports`, `perm_edit_inventory`), **no una columna `permissions`**. Están aplicadas en staging y sus únicos consumidores son de la zona **admin** (`admin/equipo/actions.ts`, `EmployeeSlideOver.tsx`). La zona operativa no las lee y `ChromeSidebarNav` no hace gating por permisos: **no hay fallo heredado** en la zona operativa.

Añadido tras la Fase 3b del Sprint 19 (impresión):

- **`@page { size: <length> auto }` es CSS inválido** y el navegador descarta la declaración ENTERA. La gramática admite `<length>{1,2}` o `auto`, nunca mezclados. El `size: 80mm auto` original hacía que Chrome cayera a tamaño Carta: verificado imprimiendo a PDF, 215.9mm de ancho en vez de 80 — la comanda nunca imprimió al ancho correcto hasta este arreglo. **Cualquier hoja de impresión futura declara las dos dimensiones o solo `auto`.** Como el rollo térmico alimenta hasta el largo de página declarado, el alto se mide del contenido (`printComanda()`) en vez de fijarlo: con 300mm fijos cada comanda desperdiciaría ~20cm de papel en blanco.
- **`DEFAULT_PAPER_WIDTH_MM` es una constante a propósito.** Hoy hay una sola impresora (Ykioea de 58mm). El día que exista una segunda sucursal con otro rollo, pasa a columna de `branches_v2` — el componente ya recibe `paperWidth` parametrizado, así que ese cambio es cambiar de dónde sale el número, no tocar layout. Una columna antes de que existan dos configuraciones distintas es especulación que habría que migrar igual cuando llegue el caso real.
- **`/comanda-prueba` sigue siendo pública a propósito**: el matcher la excluye para poder validar la impresión sin una sesión operativa. Antes de habilitar un ambiente productivo real, hay que **gatearla con una sesión/autorización adecuada o eliminarla**; esta excepción no debe permanecer expuesta en producción.

## Aprendizaje del sprint

**Las auditorías se releen contra el código, no se citan.** Dos veces en este trabajo un dato de una auditoría previa se dio por verdadero sin volver a la fuente:

1. **El número de línea del patrón condicional** de `pos-actions.ts` — dos auditorías previas lo describieron de forma distinta, y la ruta del archivo también estaba mal (`lib/operations/pos-actions.ts` en vez de `lib/pos-actions.ts`).
2. **El nombre de la columna de permisos** — se buscó `employees_v2.permissions`, que nunca existió; la migración crea cinco `perm_*`. El falso negativo se reportó como hecho y se propagó al prompt de la fase siguiente, donde se convirtió en una restricción basada en una premisa falsa.

En ambos casos el costo fue trabajo dirigido por una premisa incorrecta. Un documento de auditoría envejece en cuanto el código se mueve; la fuente de verdad es el archivo.

---

*Fase 2 termina aquí. Sin cambios en código fuente; único archivo creado: este documento. El siguiente prompt es "Sprint 19, Fase 1".*
