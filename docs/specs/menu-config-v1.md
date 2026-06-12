# Config de menú v1 — Diseño (Fase 2)

Estado: **propuesta, pendiente de visto bueno**. Migración: [20260611000001_menu_staging_imports.sql](../../packages/db/supabase/migrations/20260611000001_menu_staging_imports.sql) (Jordy la aplica a mano).

Insight rector: tres importadores → UN flujo: **importador → staging editable → revisar/corregir → confirmar a menú activo**. Manual = staging vacío. v1 = manual + fotos (visión); marketplace = v1.5 (el esquema ya lo reserva vía `source`).

---

## 1. Invariante de precios (no negociable)

Nadie consume `menu_channel_prices` en runtime → **`base_price` ES de facto el precio del canal directo**.

| Importador | Escribe |
|---|---|
| Fotos (v1) | `base_price` (un menú impreso tiene un precio = precio base) |
| Marketplace (v1.5) | **SOLO** su columna en `menu_channel_prices`. **NUNCA** `base_price` |

Un precio inflado de Rappi (~+30 %) en `base_price` haría que el storefront cobre de más al cliente directo sin que nadie lo note. v1 solo **almacena** precios por canal; cablear su consumo (storefront/POS leyendo `menu_channel_prices`) es pieza aparte, fuera de v1. Este invariante va como comentario en la migración y en `menu-import-actions.ts`.

---

## 2. Modelo de datos

### `menu_items` (columnas nuevas, todas aditivas)

| Columna | Tipo | Semántica |
|---|---|---|
| `source` | text, default `'manual'`, CHECK `manual\|rappi\|eats\|didi\|foto` | Procedencia por producto. Única pieza de la re-sincronización futura que es esquema |
| `status` | text, default `'active'`, CHECK `draft\|active\|archived` | **Ciclo de vida** (¿publicado?). Convive con `active` boolean = **disponibilidad del día** (¿agotado?). Dos ejes, dos preguntas — no se fusionan |
| `options` | jsonb, default `[]` | Modificadores (shape abajo). NO se auto-extraen en v1; se editan a mano en staging |
| `import_id` | uuid FK → `menu_imports`, `on delete set null` | Ancla del borrador a su corrida. Sobrevive al confirm (traza de procedencia) |
| `review_reasons` | jsonb nullable | `null` = limpio. Array de strings en drafts con campos faltantes/ambiguos. Se limpia al guardar el item en staging |

Default `status='active'`: filas existentes y altas del editor actual no cambian de comportamiento; **solo los importadores insertan `'draft'`**. Sin backfill.

**¿`status` o tabla paralela?** → `status`. Razones contra tabla paralela: el editor existente opera sobre `menu_items` con server actions hardcodeadas — con `status` el staging reusa el MISMO editor con un filtro y "confirmar" es un `UPDATE`; tabla paralela duplicaría editor, RLS, storage de fotos y migración de filas al confirmar. El riesgo de drafts sangrando al menú vivo se cierra en 3 queries + 1 policy RLS (sección 5).

### Shape de `options` (debe generar las 2 formas existentes)

```ts
// menu_items.options: MenuItemOptionGroup[]
type MenuItemOptionGroup = {
  group: string;                 // "Tamaño"
  type: 'single' | 'multi';
  required?: boolean;
  choices: { name: string; price_delta: number }[];  // centavos MXN (CentsMXN)
};
```

Mapeos (helpers en `packages/shared`):
- → `OrderItemModifier {name, priceDelta}` (packages/shared/src/types/order.ts:21): `{name: choice.name, priceDelta: choice.price_delta}` al armar el pedido en POS.
- → `string[]` de impresión (packages/printing/src/types.ts: `modifiers?: string[]`): `choices.map(c => c.name)`.

### `menu_imports`

Una fila por corrida (foto/manual/marketplace). Ver SQL. Puntos de diseño:
- `status`: `processing → ready → confirmed | discarded`, o `processing → error`. Extiendo el spec original (`processing|ready|error`) con los 2 estados de desenlace: el import registra qué pasó con el staging y habilita "Reintentar"/historial. (Decisión 5.)
- `input jsonb`: `{photo_keys: [...]}` hoy; `{url}` en v1.5 — sin migrar esquema.
- `summary jsonb`: `{pages, items, categories, needs_review}` para la UI de polling.
- RLS: tenant_isolation + service_role, mismo patrón que `menu_items`. Sin lectura anon.
- Polling como `print_jobs`/deliveries: tabla con status + `setInterval` en el cliente (patrón DeliveryTrackingPanel.tsx:42-58, sin lib nueva).

### Canal `whatsapp`

En la MISMA migración, ambos CHECKs (nombres verificados contra pg_constraint local):
- `menu_channel_prices_channel_check` → + `'whatsapp'`
- `orders_channel_check` → + `'whatsapp'` (lo necesitará el tubo de pedidos WA de todos modos)

Lado TS: `CHANNELS` en packages/shared/src/constants/channels.ts gana entrada `whatsapp` + export `PRICE_CHANNELS = ['direct','eats','rappi','didi','whatsapp']` (mostrador queda fuera: usa `base_price`). `isMarketplace()` NO incluye whatsapp.

---

## 3. Método fotos (visión) — server-side

**Greenfield total**: cero LLM en el repo hoy. Estrena `@anthropic-ai/sdk` en apps/oms.

### Flujo

```
UI /admin/menu/importar
 1. createPhotoImport()            → fila menu_imports (processing) → {importId}
 2. uploadImportPhoto(importId, n) → una foto por server action (comprimida cliente)
 3. processMenuImport(importId)    → visión por página (paralelo) → merge/dedup
                                     → INSERT drafts → import ready + summary
 UI pollea getMenuImport(importId) cada 2.5s (independiente de la respuesta de 3)
 → redirect a /admin/menu/imports/[id] (staging)
```

- **Compresión cliente** (reusa `compressImage` de ImageDropzone): máx 2400 px lado largo, JPEG q0.85. Razones: límite high-res de visión es 2576 px (coords 1:1, texto de menú legible) y el body de server actions está limitado — subir **una foto por llamada** + `experimental.serverActions.bodySizeLimit: '5mb'` en apps/oms/next.config.mjs (hoy el default ~1 MB es deuda latente incluso para `uploadMenuImage`).
- **Procesamiento**: server action de varios segundos (precedente: quote/dispatch Uber Direct). Railway no tiene timeout configurado en el repo (verificado: cero `maxDuration`, sin railway.toml) → **confirmar empíricamente** con un menú real; el polling cubre respuestas perdidas. Si el límite real muerde, plan B sin cambiar esquema: route handler + reanudación por página.
- **Idempotencia/error**: si `processMenuImport` truena → `status='error'` + `error`. Botón "Reintentar" borra drafts del import y reprocesa. Guard de reentrada: no procesar si ya existen drafts del import.

### Llamada de visión

- **Una llamada por foto/página**, en paralelo (`Promise.all`). Aísla errores por página y el merge queda en código determinista (testeable), no en el modelo.
- `client.messages.parse()` no requiere zod si pasamos schema crudo → usar `messages.create` + `output_config: {format: {type: 'json_schema', schema}}` (structured outputs, sin dep nueva; sin `temperature` — removido en Opus 4.7+). `max_tokens: 16000`.
- **Modelo**: `MENU_VISION_MODEL` env, default `claude-opus-4-8`. Costo por import (menú de 3 fotos, ~8.5K in / ~3K out):

| Modelo | $/import aprox |
|---|---|
| `claude-opus-4-8` ($5/$25 MTok) | ~$0.12 USD |
| `claude-sonnet-4-6` ($3/$15) | ~$0.07 |
| `claude-haiku-4-5` ($1/$5) | ~$0.02 |

Barato en cualquier caso → sostiene "fotos en todos los planes". Default opus por precisión de precios; el env permite bajar tras probar con menús reales. (Decisión 8.)

### Schema de salida por página

```ts
{
  categories: string[],
  items: [{
    name: string,
    description?: string,
    price_mxn: number | null,   // pesos como aparecen impresos; null si no se distingue. NUNCA inventar
    category: string,
    needs_review: boolean,
    review_reasons: string[]    // p.ej. "sin precio visible", "nombre parcialmente ilegible"
  }]
}
```

- Servidor convierte `price_mxn` → centavos (`Math.round(p*100)`); `null` → `base_price=0` + `review_reasons += ['sin precio detectado']`.
- **Incertidumbre**: nada de "confianza" autorreportada — el contrato es marcar campos faltantes/ambiguos; el staging es la red de seguridad.
- **Merge multi-página** (código, no modelo): categorías por nombre normalizado (trim+casefold); item duplicado = mismo nombre normalizado + misma categoría → se queda el primero; si los precios difieren → `needs_review`.
- **Límites honestos (texto en la UI)**: saca productos base + precios base + categorías. NO saca foto de platillo, NI modificadores confiables, NI precios por canal. Precio extraído → `base_price` (canal directo); otros canales se ajustan después en Tarifas.

### Env / secretos

`ANTHROPIC_API_KEY` → patrón existente: `process.env` en punto de uso + alta en `REQUIRED_IN_PRODUCTION` de apps/oms/lib/validate-env.ts + .env.example + INFRA.md (Railway).

---

## 4. UI de revisión (staging)

Ruta: `/admin/menu/importar` (wizard subir/procesar) → `/admin/menu/imports/[id]` (revisión). Entrada nueva en NAV_ITEMS no hace falta: botón "Importar menú" dentro de /admin/menu.

Reuso (per inventario Fase 1):
- **Tal cual**: CategorySidebar, MenuItemCard, ImageDropzone (puros, props/callbacks).
- **Parametrizar, no duplicar**:
  - `loadMenuEditorData({importId?})` — con importId filtra `eq('import_id', …).eq('status','draft')`.
  - `createMenuItem(input, opts?: {status, source, importId})` — staging crea drafts `source='manual'`; el editor normal no pasa opts (comportamiento intacto).
  - `updateMenuItem` — al guardar desde staging limpia `review_reasons` (el humano ya revisó).
  - `MenuEditorScreen` gana prop opcional `importScope?: {importId}`; `ItemEditorPanel` gana `draftDefaults?` que baja a createMenuItem. Sin scope, todo igual que hoy.
- **Nuevo**: `MenuImportReviewScreen` = wrapper con barra de import (resumen, badges `review_reasons`, Confirmar/Descartar) + `MenuEditorScreen` scopeado. "Agregar más productos" cae natural: es el mismo editor.

Acciones de confirmación (`menu-import-actions.ts`):
- `confirmMenuImport(importId)`: bloqueado si queda algún draft con `review_reasons != null` o (`source='foto'` y `base_price=0`) — resolver editando o borrando (decisión 7). Promueve `status: draft→active`, limpia `review_reasons`, import → `confirmed`. Visible al instante (storefront es force-dynamic; sin revalidación cross-app que hacer).
- `discardMenuImport(importId)`: **descartar = limpiar filas + storage** (decisión de Jordy, alcance completo). Borra: (1) drafts del import, (2) fotos de platillo de esos drafts en bucket `menu-items`, (3) fotos de input del import en bucket `menu-imports`. Import → `discarded`. Nada de fotos colgando — no se recrea la deuda de huérfanos. "Reintentar" tras `error` solo limpia (1)+(2) y reprocesa con las fotos de input existentes.
- Foto de platillo en staging: el item draft ya existe con uuid real → `uploadMenuImage` usa el id real (la deuda del `photo_key` temporal `new-<timestamp>` solo aplica a items nuevos del panel; no se hereda).

**Endurecimientos de paso (mismo PR del filtro):**
1. Checkout storefront (apps/storefront/lib/storefront-actions.ts:178): mover el filtro a la query (`.eq('active', true).eq('status','active')`) y dejar el check en memoria (:208) como segunda línea que **rechaza** (hoy descarta silencioso → con drafts en la misma tabla, eso es un pedido cobrado de menos).
2. Página tarifas (apps/oms/app/admin/tarifas/page.tsx:11): `CHANNELS=['pos','delivery','web','app']` hardcodeado no mapea a la BD (UI rota hoy) → usar `PRICE_CHANNELS` de shared; tarifas lista solo `status='active'` (drafts viven en staging).

---

## 5. Lectores en vivo — dónde va el filtro `status='active'`

| Lector | Archivo | Cambio |
|---|---|---|
| Storefront menú | storefront-actions.ts `loadTenantMenu` :56 | `+ .eq('status','active')` |
| Storefront checkout | storefront-actions.ts :178 + :208 | filtro a la query + rechazo en memoria |
| POS | pos-actions.ts `loadMenu` :24 | `+ .eq('status','active')` |
| Editor admin | menu-actions.ts :49 | sin filtro de status (debe ver todo); staging filtra por import |
| Tarifas | tarifas/actions.ts :23 | `+ .eq('status','active')` |
| RLS anon | migración | `active = true AND status = 'active'` (defensa en profundidad) |

KDS es mock y WhatsApp no tiene código → nada que tocar ahí.

---

## 6. Gating por plan

Primer enforcement real del sistema (hoy: cero gating operativo; plans.ts es display). Helper central, no `if plan === ...` sueltos:

```ts
// apps/oms/lib/constants/entitlements.ts
export type FeatureKey = 'menu.editor' | 'menu.import_photos' | 'menu.import_marketplace';
const FEATURES: Record<FeatureKey, PlanId[]> = {
  'menu.editor':              ['arranque', 'crecimiento', 'escala'],
  'menu.import_photos':       ['arranque', 'crecimiento', 'escala'],  // driver de activación
  'menu.import_marketplace':  ['crecimiento', 'escala'],              // v1.5
};
export function canUseFeature(plan: PlanId, feature: FeatureKey): boolean;
```

- Server-side: `requireFeature(feature)` en `createPhotoImport` etc. — para eso `requireTenant()` (apps/oms/lib/supabase/tenant-guard.ts) agrega `plan` a su select y a `TenantContext`.
- UI: ocultar/deshabilitar con candado + CTA de upgrade (consume el mismo helper).
- En v1 fotos = todos los planes, así que el check no bloquea a nadie — pero queda cableado y `menu.import_marketplace` ya gatea v1.5 sin tocar nada.
- Nota: el plan medio se renombra display **"Profesional"** (id `crecimiento` intacto) en plans.ts — pendiente del conflicto de pricing; 1 línea, va de paso o en su propio cambio.

---

## 7. Lista de archivos a tocar (Fase 3)

**Migración / tipos**
1. `packages/db/supabase/migrations/20260611000001_menu_staging_imports.sql` — ya escrita (Jordy aplica)
2. `packages/db/src/types.gen.ts` — regenerar tras aplicar
3. `packages/shared/src/constants/channels.ts` — entrada `whatsapp` + `PRICE_CHANNELS`
4. `packages/shared/src/types/` — tipo `MenuItemOptionGroup` + mappers a `OrderItemModifier` / `string[]`

**Backend nuevo (apps/oms)**
5. `lib/menu-import-actions.ts` — create/uploadPhoto/process/get/confirm/discard (+ invariante de precios en comentario)
6. `lib/menu-vision.ts` — cliente Anthropic, schema, prompt, merge/dedup multi-página
7. `lib/constants/entitlements.ts` — `canUseFeature` + `requireFeature`
8. `lib/supabase/tenant-guard.ts` — `plan` en select y `TenantContext`
9. `lib/validate-env.ts` — `ANTHROPIC_API_KEY` en REQUIRED_IN_PRODUCTION
10. `next.config.mjs` — `serverActions.bodySizeLimit: '5mb'`
11. `package.json` — `@anthropic-ai/sdk`
12. `.env.example` + `INFRA.md` — `ANTHROPIC_API_KEY`, `MENU_VISION_MODEL`

**Editor (parametrizar)**
13. `lib/menu-actions.ts` — filtro `importId` en load; opts en create; clear `review_reasons` en update
14. `components/menu-editor/MenuEditorScreen.tsx` — prop `importScope?`
15. `components/menu-editor/ItemEditorPanel.tsx` — `draftDefaults?` + sección de `options` (editor de modificadores a mano)

**UI nueva (apps/oms)**
16. `app/admin/menu/importar/page.tsx` + `app/admin/menu/imports/[id]/page.tsx`
17. `components/menu-import/` — UploadWizard (compresión+progreso), ProcessingPoller, MenuImportReviewScreen
18. `app/admin/menu/page.tsx` (o donde viva el header del editor) — botón "Importar menú"

**Lectores en vivo + tarifas**
19. `apps/storefront/lib/storefront-actions.ts` — :56 filtro; :178/:208 endurecer checkout
20. `apps/oms/lib/pos-actions.ts` — :24 filtro
21. `app/admin/tarifas/actions.ts` — filtro `status='active'` + validar channel contra `PRICE_CHANNELS`
22. `app/admin/tarifas/page.tsx` — canales desde shared (arregla UI rota) + columna whatsapp

**Relacionado opcional**: `lib/constants/plans.ts` — display "Profesional".

**Orden de build propuesto** (cada paso shippeable): (a) migración + tipos + filtros de lectores + RLS → (b) gating helper → (c) editor parametrizado + staging manual → (d) importador de fotos → (e) tarifas fix.

---

## 8. Fuera de v1 (recordatorio)

Marketplace import (v1.5) · consumo de precios por canal · re-sync/merge (v2) · sync continua (v3) · auto-extracción de modificadores · fotos de platillo desde marketplaces · CSV/Excel · POS legacy.

---

## 9. Decisiones para Jordy (resueltas con recomendación — aprobar u objetar)

1. **`status` + `active` como dos ejes** (ciclo de vida vs disponibilidad), default `'active'`, solo importadores insertan draft. → Recomendado, es lo que está en la migración.
2. **RLS `public_read` con `status='active'`** en la misma migración. → Recomendado (defensa en profundidad).
3. **Bucket nuevo `menu-imports` PRIVADO** (8 MB, path `{tenant}/imports/{import_id}/{n}`), separado de `menu-items`. → Recomendado.
4. **Gating central `canUseFeature`** (fotos: todos; marketplace: crecimiento/escala) + `plan` en `requireTenant`. → Recomendado.
5. `menu_imports.status` extendido con `confirmed|discarded`. **Aprobada con alcance ampliado:** descartar elimina drafts + storage asociado (fotos de platillo en `menu-items` Y fotos de input en `menu-imports`).
6. Columna `review_reasons jsonb` en `menu_items` (marca de revisión obligatoria por item; se limpia al editar). → Recomendado sobre guardarlo en el summary del import (evita sincronizar dos entidades al editar).
7. **Confirmar bloqueado** mientras haya drafts con `review_reasons` o precio 0 de foto (se resuelve editando o borrando; sin confirm parcial en v1). → Recomendado: la red de seguridad no debe tener agujeros.
8. **Modelo de visión**: default `claude-opus-4-8` con override `MENU_VISION_MODEL` (~$0.12/import; sonnet ~$0.07, haiku ~$0.02). **Aprobada.** Sin metering/cobro/facturación por uso del importador — gating por plan (acceso sí/no) es lo único; el costo de visión es COGS interno.
9. `serverActions.bodySizeLimit: '5mb'` + compresión cliente a 2400 px (sin esto las fotos no pasan el body limit de server actions; de paso sanea la deuda latente de `uploadMenuImage`). → Recomendado.
