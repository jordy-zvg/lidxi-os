# Pedidos por WhatsApp (tubo de pedidos estructurado) — Research + Spec

> **Track:** TUBO DE PEDIDOS (no es el track de soporte/Chatwoot).
> **Objetivo:** recibir pedidos estructurados por WhatsApp → crear pedido automático en el OMS → cobrar por Mercado Pago igual que el storefront.
> **Estado:** research + spec. **No implementado.** La construcción se autoriza fase por fase.
> **Fecha:** 2026-06-09. Capacidades de Meta verificadas a esta fecha; ver notas de confianza por afirmación.

---

## Resumen ejecutivo (TL;DR)

1. **WhatsApp Pay nativo NO está disponible para negocios en México.** La Payments API oficial de Meta solo documenta **Brasil (`payments-br`)** e **India (`payments-in`)**. → El cobro va por **link de pago de Mercado Pago**, exactamente como el storefront. *(Confianza alta — basado en la estructura oficial de la doc de Meta; los blogs terceros que dicen "México" se refieren a P2P consumidor en testing limitado, no a la Payments API de negocio.)*

2. **Enfoque recomendado: WhatsApp Flows (B), no Catálogo+carrito (A).** El menú de Miztli tiene modificadores (tamaños, "sin cebolla", extras). El carrito nativo de catálogo **no puede representar modificadores** — devuelve solo `retailer_id + cantidad + precio`. Flows sí los captura de forma estructurada.

3. **Bonus de Flows:** elimina la dependencia de sincronizar catálogo Kobi ↔ Meta Commerce. Servimos el menú directo desde nuestra BD al endpoint del Flow. La dependencia se invierte: necesitamos modelar modificadores **en nuestro propio catálogo**, no sincronizar a Meta.

4. **Dos supuestos del brief estaban desactualizados** (verificado en codebase):
   - **MP no está "sin configurar":** la infraestructura está **completa y prod-ready** (webhook con firma HMAC, tabla de auditoría `payment_events`, creación de preferencias, flujo mock+sandbox end-to-end). Falta **solo** poblar credenciales PROD (hoy vacías) + onboarding comercial con MP.
   - **El catálogo Sprint 05 no está "en cola":** `menu_items` + `menu_channel_prices` (precio per-canal) + editor de menú + fotos **ya están activos**. Lo que falta es **modelado de modificadores a nivel de menú** (hoy los modifiers solo existen como `jsonb` en `order_items`) y el canal `whatsapp` en precios.

5. **Se puede construir HOY (sin MP prod, sin verificación Meta):** scaffold del webhook, migración del modelo de datos, servicio `createWhatsappOrder`, mapeo Flow→pedido, idempotencia, y cobro en modo **mock** (ya existe `triggerMockMercadoPagoWebhook`). Todo el tubo es testeable end-to-end en mock antes de tener una sola credencial real.

---

## Decisiones tomadas (Jordy, 2026-06-09)

1. ✅ **Enfoque: WhatsApp Flows (B).** Confirmado.
2. ✅ **Modificadores: `jsonb` en `menu_items`** (opción 3.1.6.a). Campo `options: [{ group, type:'single'|'multi', choices:[{name, price_delta}] }]`. Sin tablas nuevas.
3. ✅ **Alcance v1: solo Miztli** (un WABA, un número). Multi-tenant se generaliza después.
4. ✅ **Cuenta MP: cada restaurante con su propia cuenta** (Lidxi conecta la cuenta MP de cada tenant).

> ⚠️ **Implicación de la decisión #4 (afecta infra COMPARTIDA con storefront):** hoy la integración de MP usa **un solo token** vía env (`resolveMercadoPagoMode` en [client.ts](packages/integrations/src/mercado-pago/client.ts) lee `MERCADO_PAGO_ACCESS_TOKEN_*` global). "Cada restaurante su cuenta" implica el modelo **marketplace/OAuth de Mercado Pago**: la preferencia se crea con el **access token del tenant** (almacenado por tenant, conectado vía OAuth), no con un token global. Esto es un **upgrade de la infra de cobro que el storefront también necesita** (no es exclusivo de WhatsApp). Recomendación: tratarlo como una pieza compartida previa/paralela a la Fase 2, no construir el cobro per-tenant dos veces. *(Para v1-solo-Miztli basta con la cuenta MP de Miztli, así que no bloquea Fase 0/1; sí debe resolverse antes de cobrar a más de un tenant.)*

---

# ENTREGABLE 1 — Research + enfoque recomendado

## 1.1 La pregunta que desbloquea todo: ¿WhatsApp Pay en México?

**Verificado:** la documentación oficial de Meta tiene Payments API **solo para dos regiones**:
- `developers.facebook.com/.../payments/payments-br/` (Brasil)
- `developers.facebook.com/.../payments/payments-in/` (India, sobre UPI)

No existe `payments-mx` ni ningún doc oficial de Payments API para México. El mensaje nativo `order_details` (la "factura interactiva" que inicia un pago dentro del chat) es **parte de esa Payments API gated a BR/IN** — no es invocable en una WABA mexicana.

Los blogs terceros se contradicen ("limited testing in Mexico" vs "available in Mexico"). Esa señal es de **P2P consumidor en pruebas**, no de la Payments API de negocio. La fuente autoritativa (la estructura de la doc oficial) es inequívoca: **en México el cobro va por fuera de WhatsApp.**

**Consecuencia de diseño:** el cobro va por **link/preferencia de Mercado Pago** — que es justo lo que el storefront ya hace. No duplicamos nada; reutilizamos el webhook de MP existente (es agnóstico al canal). Adicional, BR descontinuó pagos con tarjeta a negocios el 15-ene-2026, lo que refuerza que apostar a WhatsApp Pay nativo sería frágil incluso si llegara a MX.

> ⚠️ Marca de confianza: **alta** sobre "no hay Payments API de negocio para MX". Si Jordy quiere certeza absoluta, el check definitivo es intentar registrar un método de pago en Commerce Manager para la cuenta MX — pero el diseño no depende de ello porque vamos por MP de todos modos.

## 1.2 A vs B — dentro de "carrito nativo"

### Opción A — WhatsApp Commerce (catálogo + carrito nativo)

| Dimensión | Realidad verificada |
|---|---|
| **Capacidad real** | Subes catálogo a Meta Commerce Manager. Mandas Single/Multi-Product Messages o Product Carousel. El cliente navega y arma el **carrito nativo** de WhatsApp. |
| **Cómo regresa el pedido** | Webhook tipo `order`: `catalog_id` + `product_items[]` donde cada item = `{ product_retailer_id, quantity, item_price, currency }` + `text` opcional. **Sin campo para modificadores.** |
| **Modificadores (Miztli)** | ❌ **No soportado.** El catálogo de Meta es plano: imagen, nombre, precio, descripción, link. Las "variantes" aparecen como **un solo producto**. "Sin cebolla"/extras: imposible de capturar. La única vía sería explotar cada combinación como SKU separado ("Taco pastor chico", "...grande") — inviable con extras combinatorios. |
| **Cobro en MX** | Igual: por MP link (no hay pago nativo). |
| **Sync de catálogo** | **Requerido.** Hay que mantener el catálogo de Meta sincronizado con Kobi (ver §1.4). |
| **Esfuerzo** | Bajo en build de UI (Meta hospeda el carrito), pero **alto en sync** y **techo de producto bajo** por los modificadores. |

### Opción B — WhatsApp Flows

| Dimensión | Realidad verificada |
|---|---|
| **Capacidad real** | Formulario/flujo multi-pantalla **dentro** de WhatsApp, totalmente personalizable (inputs, radio, checkbox, dropdown). Dos modos: `navigate` (estático, un solo webhook al final) y `data_exchange` (cada pantalla llama a TU endpoint, firmado con la Flow public key, respuesta < 10 s → permite menú y precios en vivo + lógica condicional). |
| **Cómo regresa el pedido** | Al completar, llega un webhook tipo `interactive` con `interactive.type = "nfm_reply"` y `nfm_reply.response_json` (string JSON con **el shape que nosotros definimos**). Lo parseamos a líneas de pedido. |
| **Modificadores (Miztli)** | ✅ **Soportado.** Modelamos categoría → producto → selección de tamaño/extras/"sin X" con controles nativos. Controlamos exactamente la estructura de salida. |
| **Cobro en MX** | Por MP link (igual). |
| **Sync de catálogo** | ❌ **No requerido.** En modo `data_exchange` servimos el menú directo desde `menu_items`/`menu_channel_prices`. **No hay catálogo en Meta que sincronizar.** |
| **Esfuerzo** | Mayor: hay que construir el Flow (JSON), el endpoint `data_exchange` firmado con SLA <10s, y el modelado de modificadores a nivel menú. A cambio: producto correcto + sin sync + futuro-compatible con el agente IA. |

### Recomendación: **Opción B — WhatsApp Flows**

Razones, en orden de peso:
1. **Corrección del producto.** El objetivo es pedidos *estructurados*. El menú real de Miztli tiene modificadores. A no los representa; B sí. No es un trade-off de esfuerzo — A directamente no cumple el requisito.
2. **Menos acoplamiento, no más.** B elimina la sincronización Kobi↔Meta Commerce (el mantenimiento eterno de catálogos espejo). La complejidad se mueve a un lugar que ya controlamos (nuestro menú).
3. **Mapeo limpio a lo que ya existe.** El `response_json` del Flow mapea 1:1 a `order_items` con su columna `modifiers jsonb` que **ya existe** en el esquema.
4. **Futuro-compatible con el agente IA (Épica 12 / modelo C).** El agente se monta delante (interpreta texto, arma el carrito) y termina llamando **al mismo** servicio de creación de pedido y **al mismo** cobro por MP. El Flow y el agente son intercambiables como "front" sobre el mismo tubo. (Confirmado en §3.6.)

**Matiz / camino híbrido opcional:** podemos usar **Multi-Product Messages del catálogo para *descubrimiento* visual** (tarjetas lindas de producto) y un **Flow para *capturar* el pedido con modificadores**. Solo vale la pena si el descubrimiento visual del catálogo nativo se considera importante; duplica la superficie de sync, así que lo dejo como opción posterior, no para v1.

**MVP rápido opcional (si se quiere validar el tubo antes de modelar modificadores):** lanzar A para un **subconjunto del menú sin modificadores** (bebidas, combos fijos). Valida webhook + cobro end-to-end con mínimo build. Pero como Miztli necesita modificadores sí o sí, B es el destino; A-MVP solo acorta el time-to-first-order si Jordy lo prioriza.

## 1.3 Cómo regresa el pedido — contrato observado (resumen)

```jsonc
// A) Catálogo + carrito → webhook message.type = "order"
{ "type": "order",
  "order": {
    "catalog_id": "...",
    "product_items": [
      { "product_retailer_id": "SKU123", "quantity": 2, "item_price": 75.0, "currency": "MXN" }
    ],
    "text": "nota opcional" } }

// B) Flow completado → webhook message.type = "interactive", interactive.type = "nfm_reply"
{ "type": "interactive",
  "interactive": {
    "type": "nfm_reply",
    "nfm_reply": {
      "name": "flow",
      "response_json": "{...shape que NOSOTROS definimos...}" } } }
```

## 1.4 ¿El catálogo de Meta requiere sync con Kobi? ¿Cómo? ¿Cada cuánto?

- **Con Flows (recomendado): NO.** No hay catálogo en Meta. Servimos menú/precios desde Kobi al endpoint del Flow en vivo.
- **Con Catálogo+carrito (A): SÍ.** Dos vías:
  - **Data feed** (CSV/TSV/XML/Google Sheets) programado: **horario / diario / semanal**. Meta recomienda horario, pero **no es tiempo real** (advertencia explícita en la doc).
  - **Catalog Batch API** (programático): updates casi en tiempo real, ideal si los precios/disponibilidad cambian seguido.
  - En ambos, `product_retailer_id` (lo que regresa en el webhook) = el id interno que tú pongas → mapearíamos `product_retailer_id` ↔ `menu_items.id`. El precio per-canal `whatsapp` tendría que reflejarse en el feed.

## 1.5 Fuentes

**Oficiales (Meta) — confianza alta:**
- Recibir respuesta de Flow (`nfm_reply` / `response_json`): https://developers.facebook.com/docs/whatsapp/flows/guides/receiveflowresponse/
- Webhooks de Flows: https://developers.facebook.com/docs/whatsapp/flows/reference/flowswebhooks/
- WhatsApp Flows (overview): https://developers.facebook.com/docs/whatsapp/flows/
- Crear endpoint de webhook (GET `hub.challenge`, `X-Hub-Signature-256`): https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/
- Referencia de webhooks de mensajes (tipo `order`, `product_items`): https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/
- Payments API — Brasil: https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/overview/
- Payments API — India (UPI): https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-in/pg/
- Catálogos (overview): https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/catalogs-overview/
- Vender productos y servicios (Cloud API): https://developers.facebook.com/docs/whatsapp/cloud-api/guides/sell-products-and-services/

**Terceros — confianza media/baja (contexto y advertencias de sync, NO usados para afirmaciones de capacidad):**
- Estado de WhatsApp Pay por país: https://aerochat.ai/blog/whatsapp-pay-for-ecommerce-country-by-country-status — *contradictorio sobre MX; no confiable*
- Sync de catálogo (horario/feed): https://chatarmin.com/en/blog/whatsapp-business-catalog
- Variantes aparecen como un solo producto: https://www.zoko.io/post/manage-large-product-catalogs-using-whatsapp-catalog-phoenix
- Flows data_exchange (contexto): https://getkanal.com/blog/whatsapp-flows-guide-ecommerce

---

# ENTREGABLE 2 — Mapa de prerequisitos vs estado actual

> Verificado contra el codebase. ⚠️ marca dónde el supuesto del brief estaba desactualizado.

| Prerequisito | Supuesto en el brief | **Estado real (codebase/infra)** | Qué desbloquea | Qué queda bloqueado sin él |
|---|---|---|---|---|
| **MP vivo (prod)** | "NO configurado aún" | ⚠️ **Infra COMPLETA y prod-ready.** Webhook con firma HMAC + audit-first + service-role en [mercado-pago/route.ts](apps/oms/app/api/webhooks/mercado-pago/route.ts); tabla [payment_events](packages/db/supabase/migrations/20260522000001_payment_events.sql) con idempotencia; creación de preferencia en [storefront-actions.ts](apps/storefront/lib/storefront-actions.ts) + [client.ts](packages/integrations/src/mercado-pago/client.ts); flujo mock+sandbox end-to-end. **Falta solo:** `MERCADO_PAGO_ACCESS_TOKEN_PROD` y public keys (hoy **vacíos** en `.env.local`) + onboarding comercial MP. | Cobro **real** automático | Solo el cobro real. Todo el pipe se construye y prueba en **mock/sandbox HOY**. |
| **Catálogo Sprint 05** | "en cola, no activo" | ⚠️ **Parcialmente activo.** `menu_items` + `menu_channel_prices` (precio per-canal: direct/eats/rappi/didi) + editor [menu-editor](apps/oms/components/menu-editor/) + fotos **ya existen** ([init_schema](packages/db/supabase/migrations/20260511000001_init_schema.sql) líneas 85-109). **Falta:** (a) modelar **modificadores a nivel menú** — hoy solo viven como `order_items.modifiers jsonb`, no hay tabla/estructura de opciones a nivel producto; (b) agregar canal `whatsapp` al CHECK de `menu_channel_prices`. | Servir menú + precios + **modificadores** reales al Flow | Mostrar productos/modificadores reales en el Flow (con mock se construye igual). |
| **Meta Cloud API + WABA** | necesario | ❌ **No existe integración WhatsApp en el codebase** (0 referencias a `retailer_id`/Meta/WABA). **Falta:** app de Meta, WhatsApp Business Account, número, webhook configurado, App Secret, Flow public key. | Recibir Flows/órdenes + enviar el link de pago | Todo el canal WhatsApp en real (el scaffold + lógica se construye sin esto). |
| **Verificación de negocio Meta** | trámite lento | ❌ **No iniciado.** Es el cuello de botella de calendario (mismo blocker que el track de soporte). | **Salir a producción** (envío fuera de límites de prueba, catálogo/flow públicos) | Producción. **No** afecta build ni pruebas en sandbox. |

## 2.1 Qué se puede construir HOY (sin MP prod, sin catálogo de modificadores, sin verificación)

- ✅ **Scaffold del webhook de Meta** (`GET` verify con `hub.challenge` + `POST` audit-first + idempotencia por `wamid`).
- ✅ **Migración del modelo de datos** (canal `whatsapp`, folio `WA-`, tabla de auditoría `whatsapp_events`, regla de dirección). *Jordy la aplica a mano.*
- ✅ **Servicio `createWhatsappOrder(payload)`** que crea el pedido desde un payload (mock al principio) y reutiliza el cálculo de precios server-side.
- ✅ **Mapeo Flow `response_json` → `order_items` (+ `modifiers jsonb`)** con catálogo mock.
- ✅ **Cobro en modo mock** — ya existe `triggerMockMercadoPagoWebhook`; el tubo completo (pedido→preferencia→pago→confirmación) se prueba end-to-end **sin una sola credencial real**.

## 2.2 Qué queda explícitamente bloqueado

- 🔒 **Por modelado de modificadores (Kobi-side):** Flow con menú + modificadores **reales** (se desarrolla con mock mientras tanto).
- 🔒 **Por MP prod:** el cobro **real** (sandbox/mock cubre el desarrollo).
- 🔒 **Por Cloud API/WABA:** recibir/enviar mensajes **reales** de WhatsApp.
- 🔒 **Por verificación de negocio Meta:** **producción**.

---

# ENTREGABLE 3 — Spec técnica

## 3.1 Modelo de datos

### 3.1.1 Canal nuevo: `whatsapp`
- **`orders.channel`** — extender el CHECK de [init_schema:145](packages/db/supabase/migrations/20260511000001_init_schema.sql) para incluir `'whatsapp'`:
  ```sql
  -- antes: check (channel in ('direct','eats','rappi','didi','mostrador'))
  ALTER TABLE public.orders DROP CONSTRAINT orders_channel_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_channel_check
    CHECK (channel in ('direct','eats','rappi','didi','mostrador','whatsapp'));
  ```
- **Constante de UI** — agregar `whatsapp` a `CHANNELS` en [channels.ts](packages/shared/src/constants/channels.ts) (label "WhatsApp", short "WA", color de marca).
- **`isMarketplace('whatsapp')` debe ser `false`** (es canal propio). El helper ya lo es por defecto (solo eats/rappi/didi son marketplace) — basta con no agregarlo a esa lista.

### 3.1.2 Folio: prefijo `WA-`
Los folios se generan en código de app (no trigger). Hoy hay **inconsistencia existente** para `direct` (`WEB-` en operaciones [order-actions.ts:90](apps/oms/lib/operations/order-actions.ts), `SP-` en delivery [delivery-actions.ts:531](apps/oms/lib/delivery-actions.ts)). Propuesta: `WA-${id.slice(-6).toUpperCase()}`, consistente con `POS-`/`WEB-`. *(Nota lateral: valdría la pena unificar la lógica de folio en un helper único; fuera de alcance de este tubo.)*

### 3.1.3 Regla de marketplace (dirección completa)
WhatsApp es **canal propio** → **SÍ muestra dirección completa** (como `direct`/Uber Direct, **no** como Eats/Rappi/Didi). Desde el Sprint 20 el detalle real vive en [OrderDetailView.tsx](apps/oms/components/order-detail/OrderDetailView.tsx) y la rama de dirección está condicionada a `!isMarketplace(channel)`, no a `=== 'direct'`: WhatsApp ya la cumple sin cambios. *(El `OrderDetailSlideOver.tsx` que citaba esta línea se borró con sus mocks.)*

### 3.1.4 Campos de cliente
`orders` ya tiene `customer_name`, `customer_phone`, `customer_address`, `customer_lat`, `customer_lng` — suficiente. Decisiones:
- **`customer_phone`** = el `wa_id` (número de WhatsApp del cliente, viene en el webhook). *(Pregunta abierta: ¿guardar `wa_id` crudo en columna propia? Ver Entregable 5.)*
- **Dirección/coords:** si `order_type = 'envio'`, capturarlas **dentro del Flow** (input de texto/dirección). Nota: Google Places autocomplete vive en el cliente web ([AddressAutocomplete.tsx](apps/oms/components/pos/AddressAutocomplete.tsx)); **no** está disponible dentro de un Flow de WhatsApp → el cliente teclea dirección libre, o se geocodifica server-side en el endpoint del Flow.

### 3.1.5 Tabla de auditoría de webhook de Meta (nueva): `whatsapp_events`
Espejo de [payment_events](packages/db/supabase/migrations/20260522000001_payment_events.sql), idempotencia por `wamid`:
```sql
create table if not exists public.whatsapp_events (
  id              uuid primary key default gen_random_uuid(),
  wamid           text not null unique,        -- id único del mensaje de Meta (dedup)
  message_type    text not null,               -- 'interactive'|'order'|'text'|'status'|...
  payload         jsonb not null,              -- cuerpo crudo (audit trail)
  signature_valid boolean,
  order_id        uuid references public.orders(id) on delete set null,
  tenant_id       uuid references public.tenants(id) on delete set null,
  error           text,
  received_at     timestamptz not null default now(),
  processed_at    timestamptz
);
```
> Alternativa: generalizar `payment_events` → `webhook_events` con columna `provider`. Recomiendo **tabla separada** por ahora (menos riesgo sobre el path de cobro ya productivo); consolidar después si surge un tercer webhook.

### 3.1.6 Modificadores a nivel menú (gap real)
Para servir modificadores al Flow se necesita estructura a nivel **menú**, que hoy no existe (solo `order_items.modifiers jsonb`). Opciones (decisión de Jordy, ver Entregable 5):
- **(a) `jsonb` en `menu_items`** (`options: [{ group, type:'single'|'multi', choices:[{name, price_delta}] }]`) — rápido, sin tablas nuevas.
- **(b) Tablas `menu_modifier_groups` + `menu_modifier_options`** — normalizado, reusable, más build.
- Canal de precio: agregar `'whatsapp'` al CHECK de `menu_channel_prices.channel`.

## 3.2 Contrato del webhook de Meta (Meta → Kobi)

**Ruta nueva:** `apps/oms/app/api/webhooks/whatsapp/route.ts` — **mismo patrón probado** que el de MP.

| Aspecto | MP (existente, a imitar) | WhatsApp (nuevo) |
|---|---|---|
| **GET (verificación)** | n/a | Responder `hub.challenge` si `hub.mode=subscribe` y `hub.verify_token` coincide. **200 + challenge en body.** |
| **Raw body** | `await req.text()` antes de parsear | igual — **verificar firma sobre el raw body antes de `JSON.parse`** |
| **Firma** | `verifySignature` HMAC-SHA256 con `MERCADO_PAGO_WEBHOOK_SECRET`, header `x-signature` (`v1=`), `timingSafeEqual` | HMAC-SHA256 con **App Secret**, header `X-Hub-Signature-256` (prefijo `sha256=`), `timingSafeEqual` |
| **Audit-first** | `upsert payment_events onConflict event_id` **antes** de procesar | `upsert whatsapp_events onConflict wamid` **antes** de procesar |
| **Cliente** | `createSupabaseServiceClient()` (service role) | igual |
| **Idempotencia/dedup** | `event_id` único (Meta/MP reenvían) | **`wamid` único** (Meta reenvía webhooks; el unique constraint absorbe el retry) |
| **Respuesta** | 200 siempre que sea bien-formado | **200 rápido siempre** (Meta reintenta ante no-2xx → procesar async/idempotente; nunca devolver 500 por un pedido inválido) |

**Eventos que importan para el tubo de pedidos:**
1. `interactive` con `interactive.type = "nfm_reply"` → **pedido del Flow** (caso principal).
2. `order` (si algún día se usa A) → pedido del carrito de catálogo.
3. `text`/otros → ignorar en este track (los consumirá el agente IA / soporte).
4. `statuses` (entregado/leído de NUESTROS mensajes salientes) → opcional, para tracking del link de pago.

## 3.3 Mapeo: Flow `response_json` → líneas de pedido de Kobi

```
nfm_reply.response_json (string)  --JSON.parse-->  { items: [{ menu_item_id, qty, modifiers:[{group, choice}] }], order_type, address?, notes? }
        │
        ├─ por cada item → fila en order_items { menu_item_id, qty, modifiers: jsonb, unit_price }
        │     unit_price = SERVER-SIDE desde menu_channel_prices['whatsapp'] (o base_price) + Σ price_delta de modifiers
        │     ⚠️ NUNCA confiar en precios del cliente (igual que storefront recalcula desde menu_items)
        │
        └─ cabecera → orders { channel:'whatsapp', status:'received', order_type, customer_*, subtotal/total recalculados }
```
- **Mapping `retailer_id` ↔ producto Kobi:** con Flows **no aplica** (servimos `menu_item_id` directo). Solo aplicaría con enfoque A, vía feed/Batch API (`product_retailer_id = menu_items.id`). El contrato queda diseñado; el mapping real depende de la decisión A vs B.
- **El pedido inválido** (item inexistente, precio cambiado) → se crea con `error` registrado o se rechaza con mensaje al cliente; nunca crash del webhook.

## 3.4 Flujo de cobro (infraestructura COMPARTIDA con storefront)

```
1. Webhook WA recibe el Flow completado
2. createWhatsappOrder(payload) → INSERT orders (status='received', channel='whatsapp', sin pago) + order_items
3. Reutiliza createMercadoPagoClient() / creación de preferencia  (external_reference = order.id)
        → mismo código que storefront: packages/integrations/src/mercado-pago + storefront-actions.ts
4. Envía el init_point de MP al cliente por WhatsApp  (mensaje saliente — ver nota 24h)
5. Cliente paga en el checkout de MP
6. ⭐ EL MISMO webhook de MP (apps/oms/app/api/webhooks/mercado-pago/route.ts) confirma:
        - es AGNÓSTICO al canal: busca el order por external_reference=order.id
        - actualiza payment_method/payment_ref, cierra payment_events
        → CERO cambios necesarios en el webhook de MP. Ya sirve para channel='whatsapp'.
7. Pedido pasa a pagado/confirmado (mismo path que un pedido direct)
```

**Lo único nuevo del lado cobro = enviar el link a WhatsApp** (integración de **envío** saliente, hoy inexistente):
- Mensaje interactivo **CTA URL** (botón "Pagar") o texto con el link, vía endpoint `POST /{phone_number_id}/messages` de la Cloud API.
- **Ventana de 24h:** como el cliente **acaba de** mandarnos el pedido, estamos dentro de la ventana de servicio de 24h → el link se manda como **mensaje libre (sin plantilla)**. Si el pago se reintenta/reenvía **después de 24h**, requiere **plantilla aprobada**. *(Confianza alta — regla estándar de la Cloud API.)*

> **Principio:** el webhook de MP es infraestructura compartida, **no se duplica**. El tubo de WhatsApp solo añade (a) creación del pedido y (b) creación+envío del link; la confirmación reusa lo existente.

## 3.5 Sincronización catálogo Kobi ↔ Meta

- **Con Flows (recomendado): N/A** — no hay catálogo en Meta.
- **Con A:** feed (horario/diario/semanal, no realtime) o Catalog Batch API; `product_retailer_id = menu_items.id`; el precio `whatsapp` debe reflejarse en el feed. (Detalle en §1.4.)

## 3.6 Cómo el agente IA (modelo C, Épica 12) se monta encima SIN reescribir

```
            ┌─────────────── FRONTS intercambiables ───────────────┐
  Cliente → │  v1: WhatsApp Flow (formulario)                       │
            │  C : Agente IA (interpreta texto libre, arma carrito) │
            └───────────────────────┬──────────────────────────────┘
                                    ▼
              createWhatsappOrder(payload)   ← CONTRATO ESTABLE (servicio único)
                                    ▼
              preferencia MP  →  link a WhatsApp  →  webhook MP confirma   ← SIN CAMBIOS
```
**Clave de diseño:** `createWhatsappOrder(payload)` se construye desde v1 como **servicio independiente del transporte**, invocable tanto por el handler del Flow como, después, por el agente. El agente solo reemplaza *cómo se ensambló el carrito*; el webhook de pedidos, la creación de pedido y el cobro por MP son el contrato estable. **Confirmado: C se monta delante, no reescribe el tubo.**

---

# ENTREGABLE 4 — Plan por fases (con bloqueadores explícitos)

> **Nada de esto está autorizado aún.** Orden pensado para maximizar lo construible sin credenciales.

### Fase 0 — Construible HOY (sin MP prod, sin Meta, sin verificación)
- [ ] Migración del modelo de datos *(Jordy aplica a mano)*: `channel='whatsapp'`, tabla `whatsapp_events`, canal `whatsapp` en `menu_channel_prices`, regla de dirección.
- [ ] Scaffold webhook `apps/oms/app/api/webhooks/whatsapp/route.ts`: `GET` verify + `POST` audit-first + firma `X-Hub-Signature-256` + idempotencia `wamid`. (Patrón espejo de MP.)
- [ ] Servicio `createWhatsappOrder(payload)` + cálculo de precio server-side.
- [ ] Mapeo `response_json` → `order_items(+modifiers)` con **catálogo mock**.
- [ ] Cobro **en mock** end-to-end (reusa `triggerMockMercadoPagoWebhook`).
- [ ] UI OMS: badge "WA" + dirección completa en el slide-over.
- **Bloqueadores:** ninguno. Todo testeable en mock.

### Fase 1 — Menú real en el Flow  🔒 *bloqueada por modelado de modificadores (Kobi-side)*
- [ ] Modelar modificadores a nivel menú (decisión a/b de §3.1.6).
- [ ] Construir el Flow (JSON) + endpoint `data_exchange` firmado (<10s) sirviendo menú/precios reales.
- [ ] Mapping real (sin mock).
- **Desbloquea:** display y captura de pedidos con modificadores reales.

### Fase 2 — Cobro real  🔒 *bloqueada por MP prod*
- [ ] Poblar `MERCADO_PAGO_ACCESS_TOKEN_PROD` + public keys; onboarding MP.
- [ ] Integración de **envío** saliente (CTA URL con el link de pago) dentro de ventana 24h.
- [ ] Prueba end-to-end en sandbox → prod.
- **Desbloquea:** cobro real automático.

### Fase 3 — Producción  🔒 *bloqueada por verificación de negocio Meta + Cloud API/WABA*
- [ ] App Meta + WABA + número + webhook en prod + App Secret + Flow public key.
- [ ] Verificación de negocio (trámite lento — arrancar **cuanto antes en paralelo**, es calendario, no build).
- **Desbloquea:** salir a producción con clientes reales.

### Fase 4 — Agente IA (Épica 12, modelo C) — *después, sin reescribir*
- Se monta sobre `createWhatsappOrder` + cobro MP existentes (§3.6).

**Camino crítico de calendario:** la **verificación de negocio Meta** es lo más lento y no depende de build → **iniciarla ya**, en paralelo a la Fase 0.

---

# ENTREGABLE 5 — Preguntas pendientes para Jordy

> **Resueltas el 2026-06-09** (ver bloque "Decisiones tomadas" arriba): #1 → Flows (B); #2 → `jsonb` en `menu_items`; #7 → solo Miztli v1; #9 → cada restaurante su cuenta MP (modelo marketplace/OAuth). **Siguen abiertas: #3, #4, #5, #6, #8.**

1. ~~**A vs B definitivo:**~~ ✅ **Flows (B).** ¿confirmamos **Flows (B)**? ¿O quieres un **MVP rápido con catálogo (A)** para un subconjunto sin modificadores que valide el tubo antes, aceptando rehacer el front después?
2. ~~**Modelado de modificadores (§3.1.6):**~~ ✅ **`jsonb` en `menu_items`** (opción a).
3. **Tabla de auditoría:** ¿`whatsapp_events` separada (mi recomendación) o generalizar `payment_events`→`webhook_events`?
4. **`wa_id` del cliente:** ¿reutilizar `customer_phone` o agregar columna `customer_wa_id` dedicada? ¿Guardamos el `response_json` crudo del Flow en el pedido para auditoría?
5. **Tipos de pedido por WhatsApp:** ¿`envio` + `para_llevar`? Si `envio`, ¿cómo capturamos dirección sin Google Places dentro del Flow — texto libre + geocoding server-side, o pin de ubicación de WhatsApp?
6. **Folio:** ¿`WA-` y de paso unificamos la lógica de folio hoy inconsistente (`WEB-`/`SP-` para `direct`), o solo agregamos `WA-` sin tocar lo demás?
7. ~~**Multi-tenant / Miztli:**~~ ✅ **Solo Miztli v1** (un WABA, un número). Multi-tenant después.
8. **Verificación de negocio Meta:** ¿ya está iniciada por el track de soporte y la reutilizamos, o hay que arrancarla? (Es el bloqueador de calendario más largo.)
9. ~~**Cuenta MP comercial:**~~ ✅ **Cada restaurante con su cuenta MP** (modelo marketplace/OAuth — el dinero entra directo al tenant). Ver implicación de infra compartida en el bloque "Decisiones tomadas".

---

## STOP

Esto es research + spec. **No se implementó nada** (ni scaffold, ni migración). La construcción se autoriza fase por fase, empezando por la **Fase 0** (lo que no depende de MP ni de Meta).
