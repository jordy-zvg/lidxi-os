# Guía de migración v1 → v2

> **Sprint 01 · Entregable 3** — checklist mecánica para los próximos sprints (Backoffice, Cocina, Catálogo, Insight).
> No sustituye criterio de diseño. Es la lista de detección/reemplazo que tiene que pasar **antes** de mergear cualquier refactor.

---

## Cómo usar este documento

1. Para cada pantalla que entres a refactorizar, corre los grep de la columna **Buscar**.
2. Aplica el reemplazo de la columna **Reemplazar por**.
3. Si el caso no aparece acá, no inventes — anótalo en este archivo bajo "Casos nuevos" al final.
4. Los snippets están en CSS por simplicidad; si el caso está en Tailwind/clase utilitaria, el preset ya lo mapea (ver §7).

---

## 1 · Color — fuga de `#E11D2E` al sistema

**Pantallas afectadas:** Menu (badge Rappi), Analytics (donut UD), CashClose (eyebrow "CIERRE"), Staff (botón eliminar), KDS (--accent definido como rojo en CSS legacy).

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| `background: #E11D2E` en badge de canal Rappi | `background: var(--ch-rappi-soft); color: var(--ch-rappi-text);` | El rojo Miztli es marca cliente, no canal. Rappi tiene su propio token. |
| `background: #E11D2E` o `var(--miztli)` en donut/serie de Uber Direct | `background: var(--ch-direct)` (= brand) | Direct es el canal ganador, debe usar el color de acción del sistema. |
| `color: #E11D2E` en eyebrows tipo `<span class="eyebrow">CIERRE</span>` | `color: var(--ink-5)` | Eyebrows v2 son neutros mono uppercase, no rojos. |
| `background: var(--miztli)` en cualquier botón/CTA del sistema | `background: var(--brand)` (primary) o `.btn-danger` (destructivo) | `--miztli` está reservado a logo y recibo. Jamás en UI sistémica. |
| `border-top: 2px solid var(--miztli)` (tira roja superior sidebar) | Eliminar la tira | La franja roja era marca v1; sidebar v2 es claro sin acento de marca. |

**Grep recomendado:**

```bash
rg -n "#E11D2E|#e11d2e|var\(--miztli\)" apps/ packages/
```

Esperado tras el sprint: cero ocurrencias fuera de `tokens.css`, `Logo.tsx` y `ReceiptHeader.tsx`.

---

## 2 · Sidebar 60px oscuro → 220px claro

**Pantallas afectadas:** CashClose, Staff, Analytics.

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| `<aside class="sidebar" style="width: 60px; background: #0B0B0C">` | `<Sidebar />` de `@lidxi/ui` (220px) | Existe componente; no recrear inline. |
| Sidebar custom con `width: 60px` | Reemplazar por import de `Sidebar` del package | Eliminar duplicación. |
| `--sidebar-bg: #0B0B0C` en globals | Borrar el token | No se usa más. |
| Iconos custom como `<svg>` inline en sidebar | `<i class="ti ti-{nombre}" />` 18px Tabler outline | Sistema usa Tabler en todo lado. |
| Item activo con `background: var(--miztli)` | `background: var(--brand-soft); color: var(--brand-text);` con icono `var(--brand)` | Patrón v2 estándar. |

**Referencia:** ver `Sprint01-Shell.html` §01 para especs completas (brand block, section labels, hover, footer de usuario).

---

## 3 · Topbar — botón "Entrada/Salida" + indicador de sesión

**Pantallas afectadas:** todas las que tienen topbar custom hoy (CashClose, Staff, Analytics, en menor medida POS).

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| Topbar con altura ≠ 56px (varían entre 48 y 72) | Altura fija 56px | Estabiliza la columna de contenido y la alineación de migas. |
| Topbar como hermano del sidebar en el grid raíz | Mover topbar **dentro** de `.main` | Las migas alinean con el primer card del content. |
| Topbar sin botón "Entrada / Salida" | Agregar pill 32px con dot ok + copia "Entrada / Salida" | Siempre visible — requerimiento del producto. |
| Topbar con avatar suelto sin status | Reemplazar por pill `Session` (avatar 24px + nombre + status dot) | Componente unificado, identifica sesión activa. |
| Acción primaria (botón violeta) **en** la topbar | Moverla al content (header de panel o card principal) | Topbar solo lleva utility actions (search, alerts, clock, session). |

---

## 4 · Botones — primary vs danger vs ghost

**Pantallas afectadas:** Staff (modal con dos primary rojos), CashClose (botón cerrar sin distinción), KDS (algunos botones legacy).

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| `background: var(--accent)` en botón "Guardar" / "Confirmar" | `.btn-primary` (= `background: var(--brand)`) | `--accent` viejo era rojo; el primary v2 es violeta. |
| `background: var(--accent)` o `var(--miztli)` en botón "Eliminar" | `.btn-danger` (texto rojo, fondo blanco, border rojo) | Destructivas son flat con texto rojo, no rojo sólido. Dos botones rojos compiten. |
| Dos botones llenos primary en el mismo formulario | El primario queda violeta; el secundario va a `.btn-secondary` (blanco + border 0.5px) | "Una acción primaria por vista." |
| Botón con `border: 1px solid var(--line-2)` | `border: 0.5px solid var(--line-2)` | Consistencia con resto del sistema. |
| Botón con `border-radius: 4px` | `border-radius: var(--r-md)` (6px) | Token, no número mágico. |
| Botón con `height: 40px` o `44px` (excepto botones large) | `height: 36px` (`.btn`) | Altura base del sistema. |

---

## 5 · Cards y hairlines

**Pantallas afectadas:** todas las v1 (CashClose, Staff, Analytics).

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| `border: 1px solid` cualquier color | `border: 0.5px solid var(--line)` | Hairlines v2 son medio pixel — más sutiles. |
| `background: var(--bg-elev)` en cards | `background: var(--surface)` (= `#FFFFFF`) | Alias legacy; usar el token directo. |
| `background: var(--bg-deep)` en headers de panel | `background: var(--surface-2)` (= `#F1F5F9`) | Mismo motivo. |
| Cards con `box-shadow: 0 2px 8px ...` arbitrarios | `box-shadow: var(--shadow-md)` o `none` | Cards v2 priorizan border sobre sombra; sombra solo en elementos elevados (modal, slide-over). |
| Cards con `border-radius: 4px` | `border-radius: var(--r-lg)` (8px) | Token de card. |
| Cards con `padding: 12px` y muchas filas | `padding: 16px 20px` | Aire es principio v2 #1. |

---

## 6 · Tipografía — sentence case y type ramp

**Pantallas afectadas:** todas las v1 + algunas v2 con divergencias menores.

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| Headers en `TEXT-TRANSFORM: UPPERCASE` (h1, h2) | Sin transform · sentence case | Mayúsculas solo en eyebrows. |
| Headers en Title Case ("Cerrar Caja") | sentence case ("Cerrar caja") | Estándar copy v2. |
| Texto general en JetBrains Mono | Inter | Mono solo para datos: IDs, dinero, timers, SKUs, cantidades, horas. |
| Dinero en `<span>$148.00</span>` con Inter | `<span class="mono">$148.00</span>` con `font-feature-settings: "tnum"` | Tabular nums + fuente mono = alineación vertical en columnas. |
| `font-size: 11px` para body | `font-size: 13px` o `14px` | 11px solo en meta/eyebrows. |
| H1 con `font-weight: 700` | `font-weight: 500` o `600` con `letter-spacing: -0.015em` | Type ramp v2 prefiere weight medio + tracking ajustado, no bold puro. |

---

## 7 · Tailwind preset — patch necesario

El preset (`packages/tokens/src/tailwind.ts`) tiene que extenderse para exponer los tokens nuevos como clases utilitarias. Patch:

```ts
// dentro de theme.extend.colors:

ch: {
  direct: {
    DEFAULT: 'var(--ch-direct)',
    soft: 'var(--ch-direct-soft)',
    text: 'var(--ch-direct-text)',
  },
  eats: {
    DEFAULT: 'var(--ch-eats)',
    soft: 'var(--ch-eats-soft)',
    text: 'var(--ch-eats-text)',
  },
  rappi: {
    DEFAULT: 'var(--ch-rappi)',
    soft: 'var(--ch-rappi-soft)',
    text: 'var(--ch-rappi-text)',
  },
  didi: {
    DEFAULT: 'var(--ch-didi)',
    soft: 'var(--ch-didi-soft)',
    text: 'var(--ch-didi-text)',
  },
  mostrador: {
    DEFAULT: 'var(--ch-mostrador)',
    soft: 'var(--ch-mostrador-soft)',
    text: 'var(--ch-mostrador-text)',
  },
},
dark: {
  canvas: 'var(--dark-canvas)',
  surface: {
    DEFAULT: 'var(--dark-surface)',
    2: 'var(--dark-surface-2)',
  },
  ink: {
    DEFAULT: 'var(--dark-ink)',
    100: 'var(--dark-ink-2)',
    200: 'var(--dark-ink-3)',
    300: 'var(--dark-ink-4)',
    400: 'var(--dark-ink-5)',
  },
  line: {
    DEFAULT: 'var(--dark-line)',
    2: 'var(--dark-line-2)',
  },
  brand: {
    DEFAULT: 'var(--dark-brand)',
    soft: 'var(--dark-brand-soft)',
    text: 'var(--dark-brand-text)',
  },
  ok: {
    DEFAULT: 'var(--dark-ok)',
    soft: 'var(--dark-ok-soft)',
    text: 'var(--dark-ok-text)',
  },
  warn: {
    DEFAULT: 'var(--dark-warn)',
    soft: 'var(--dark-warn-soft)',
    text: 'var(--dark-warn-text)',
  },
  danger: {
    DEFAULT: 'var(--dark-danger)',
    soft: 'var(--dark-danger-soft)',
    text: 'var(--dark-danger-text)',
  },
},
```

Uso típico tras el patch:

```tsx
<span className="bg-ch-rappi-soft text-ch-rappi-text px-2 py-0.5 rounded-full text-xs">
  Rappi
</span>

<div className="bg-dark-canvas text-dark-ink p-6">
  <div className="bg-dark-surface border border-dark-line rounded p-4">…</div>
</div>
```

---

## 8 · Iconografía

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| SVG inline custom (heroicons, feather, lucide) | Tabler outline 18px (`<i class="ti ti-{name}"></i>`) o `@tabler/icons-react` | Sistema usa Tabler en todo lado. |
| Iconos `solid`/`filled` | Versión `outline` | v2 prefiere outline para reducir peso visual. |
| Iconos 16px en sidebar | 18px | Especificación shell. |
| Iconos 24px en topbar | 16px dentro de `.icon-btn` 32px | Especificación shell. |

---

## 9 · Status pills

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| Pills con `background: var(--ok)` y `color: white` | `background: var(--ok-soft); color: var(--ok-text);` + dot 6px `var(--ok)` | Pills v2 son soft + dot, no llenas. |
| Pills sin dot | Agregar `<span class="dot" />` 6×6 antes del texto | Patrón consistente del sistema. |
| Pills con `border-radius: 4px` | `border-radius: 999px` (pill completa) | Distintivo de pill vs chip vs badge. |
| Pills con uppercase | sentence case | Excepción: solo eyebrows en uppercase. |

---

## 10 · Animaciones

| Buscar | Reemplazar por | Por qué |
|---|---|---|
| `animation: shake 0.5s` o variantes ad-hoc | `animate-shake` del preset (0.3s) | Ya en preset; no duplicar. |
| Transiciones de página largas (>300ms) | Micro-feedback ≤200ms | v2 prioriza percepción de velocidad. |
| Hover transitions con `transition: all` | Lista explícita (`background, border-color, box-shadow`) | `all` causa reflow innecesarios. |

---

## Checklist de revisión por pantalla

Imprime y tachá antes de mergear:

- [ ] Sidebar 220px claro (no 60px oscuro)
- [ ] Sin franja roja superior
- [ ] Topbar 56px con botón Entrada/Salida + Session pill
- [ ] Ninguna ocurrencia de `#E11D2E` o `var(--miztli)` fuera de logo/recibo
- [ ] Borders 0.5px, no 1px
- [ ] Cards `border-radius: 8px`, botones `6px`
- [ ] Acción primaria única (un botón violeta)
- [ ] Destructivas en `.btn-danger` (no rojo sólido)
- [ ] Iconos Tabler outline 18px (sidebar) / 16px (topbar)
- [ ] Sentence case en headers y botones
- [ ] Mono solo en datos (IDs, dinero, timers, SKUs, cantidades, horas)
- [ ] Pills con dot + soft bg + text-token
- [ ] Sin gradientes decorativos
- [ ] Channels usan `--ch-*` (no colores hard-coded)
- [ ] Si la pantalla es dark (KDS): tokens `--dark-*`, no hex hard-coded

---

## Casos nuevos (anotar aquí durante los sprints)

> Si durante el refactor encontrás un patrón v1 que esta guía no cubre, agregalo abajo con el formato Buscar / Reemplazar / Por qué. Próxima revisión: post-Sprint 02.

_(vacío por ahora)_

---

## Anotado para Sprint 02+ (out of scope acá)

- **Type ramp formal** — tokens de tipografía (`--text-display`, `--text-h1`, etc.). Hoy cada pantalla define sus tamaños inline.
- **Channel palette dark** — los tokens `--ch-*` son solo light. Si KDS llega a mostrar chips de canal, va a necesitar `--dark-ch-direct`, etc.
- **Component-level tokens** — `--btn-height`, `--input-height`. Útil pero no bloquea sprints.
- **Motion tokens** — duraciones y easings nombrados (`--ease-out-fast`, `--dur-quick`). Hoy duraciones ad-hoc.

---

_Última actualización: 2026-05-11 · Sprint 01 · Entregable 3_
