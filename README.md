# LidxiOS

Order Management System (OMS) para dark kitchens y restaurantes multi-canal. Integra Uber Eats, Rappi, Didi Food y Uber Direct con un único panel de operación. Primer cliente: **Miztli Pardo** (Roma Norte, CDMX).

## Stack

- **Monorepo** — Turborepo + pnpm workspaces
- **Runtime** — Node 20 LTS, pnpm 9
- **Frontend** — Next.js 14 (App Router), React 18, TypeScript estricto
- **Backend** — Supabase (Postgres + Auth custom + Realtime + Storage + Edge Functions)
- **UI** — Tailwind CSS, shadcn-style components, Tabler Icons
- **Estado** — Supabase Realtime + Zustand local
- **Pagos** — Stripe (sitio público)
- **Tooling** — Biome (lint+format), Husky, lint-staged, commitlint

## Estructura

```
lidxi-os/
├── apps/
│   ├── oms/          # Sistema operativo (Kanban, KDS, POS, admin)
│   ├── storefront/   # Sitio público del cliente (miztli.mx)
│   └── clock/        # PWA de fichaje por huella (tablet entrada)
├── packages/
│   ├── tokens/       # Design tokens v2 (Tailwind preset + CSS vars)
│   ├── ui/           # Componentes compartidos (Button, OrderCard, ...)
│   ├── db/           # Cliente Supabase tipado + migrations + seed
│   ├── integrations/ # Uber Eats, Rappi, Didi, Uber Direct, Stripe
│   ├── printing/     # Impresión térmica 80mm (templates + driver)
│   └── shared/       # Tipos, constantes, utilidades
└── .github/workflows/ci.yml
```

## Quickstart

Requisitos: Node 20+, pnpm 9+, Docker (para Supabase local), Supabase CLI.

```bash
# 1. Instalar dependencias
pnpm install
pnpm init:env   # crea symlinks de .env.local en cada app
pnpm dev

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Arrancar Supabase local (Postgres + Studio + Realtime en Docker)
pnpm db:start

# 4. Aplicar migrations y seed (lo hace automático supabase db reset)
pnpm db:reset

# 5. Generar tipos TypeScript del esquema
pnpm db:types

# 6. Arrancar todas las apps en modo dev
pnpm dev
```

Apps locales:
- OMS — http://localhost:3000
- Storefront — http://localhost:3001
- Clock — http://localhost:3002
- Supabase Studio — http://localhost:54323

## Convenciones

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/). Husky + commitlint validan cada mensaje.

Ejemplos:
- `feat(oms): kanban de pedidos en vivo`
- `fix(integrations): retry en quotes de uber direct con backoff`
- `chore(db): migración para columna sla_deadline`

### Código
- **TypeScript estricto.** Cero `any` (lint error). Tipos discriminados para resultados de API.
- **Server Components por defecto.** `'use client'` solo cuando hay estado o handlers.
- **Mono para números.** Toda cifra numérica (dinero, IDs, timers, SKUs) usa `font-mono`.
- **Miztli rojo solo en branding.** Acciones del sistema usan brand violeta.
- **Sin comentarios decorativos.** Solo cuando el _why_ no se deduce del código.

### Diseño
La paleta y tokens están en [`packages/tokens`](packages/tokens/). Ver `tokens.css` para CSS vars y `tailwind.config.ts` para el preset. Cualquier color o radio fuera del sistema requiere justificación.

## Scripts útiles

```bash
pnpm dev                # Todas las apps en paralelo
pnpm --filter oms dev   # Solo OMS
pnpm build              # Build de todo el monorepo
pnpm lint               # Biome check + per-package lint
pnpm lint:fix           # Auto-fix lo que se pueda
pnpm type-check         # tsc --noEmit en cada paquete
pnpm db:reset           # Drop + recrear DB local + correr seed
pnpm db:types           # Regenerar types.gen.ts desde el esquema
```

## Estado del proyecto

Scaffolding inicial. Las rutas de OMS son shells; la primera pantalla en implementar es el Kanban de pedidos (`/pedidos`) a partir del mockup HTML.
