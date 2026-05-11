# Design mockups — LidxiOS

Prototipos HTML estáticos navegables que muestran el diseño visual de las pantallas de LidxiOS. Son **independientes del producto operativo** — funcionan sin servidor, sin base de datos, sin auth.

## Para qué sirven

- **Demos rápidas** sin tener que levantar 3 apps + Docker + Supabase
- **Presentaciones** a clientes potenciales, inversores, equipo nuevo
- **Onboarding visual** para desarrolladores que se unen al proyecto
- **Referencia de diseño** al implementar nuevas pantallas

## Para qué NO sirven

- **No son fuente de verdad técnica.** Esa es `apps/oms/`, `apps/storefront/` y `apps/clock/`.
- **No reflejan la lógica real** del producto. Los datos son demo, hardcoded.
- **No se actualizan en cada cambio de código.** Se actualizan solo cuando hay rediseño significativo.

## Cómo usarlos

Abre cualquier `.html` directamente en el navegador:

```bash
open docs/design-mockups/index.html
```

O navega desde `index.html` que linkea a todos los mockups.

## Inventario actual

| Archivo | Pantalla del producto | Vigente al |
|---|---|---|
| `login.html` | `apps/oms/app/(auth)/login` | 2026-05-11 |
| `clock-overlay.html` | `apps/oms/components/ClockOverlay.tsx` | 2026-05-11 |
| `home-oms.html` | `apps/oms/app/(operations)/pedidos` | 2026-05-11 |
| `storefront.html` | `apps/oms/app/(operations)/sitio-propio` | 2026-05-11 |

## Política de actualización

Se actualizan cuando:
- Hay rediseño significativo (cambio de tokens, nueva sección, rework de flow)
- Se diseña una pantalla nueva

NO se actualizan cuando:
- Hay bugfixes menores
- Hay refactor interno sin cambios visuales
- Hay ajustes de microcopy

Cada mockup tiene en su `<head>` un comentario `<!-- Vigente al {fecha}. Producto real: {ruta} -->` que documenta la última vez que se sincronizó con el código.

## Tokens

`tokens.css` es una copia de `packages/tokens/src/tokens.css`. Si los tokens del producto cambian, actualizar también este archivo.