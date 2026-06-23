# AGENTS.md - Sistema Control de Activos FIBEX

Repo root; project lives in `sistema-control-activos/`.

## Stack
Next.js 14 App Router, TypeScript, PostgreSQL, Prisma, NextAuth v4 (credentials), TailwindCSS, shadcn/ui.

## Quick Start
```bash
cd sistema-control-activos
npm install
npx prisma generate       # required before seed, after schema changes
npm run db:seed           # creates admin + seed data
npm run dev               # http://localhost:3000
```

## Credenciales (Seed)
- **Email**: `admin@fibex.com` / **Password**: `admin123`

## Base de Datos
```
Host: localhost:5432  |  DB: inventario_db  |  User: admin  |  Pass: Abcd1234
```
`.env` ahora está en `.gitignore` (dejó de versionarse). DB debe estar corriendo para dev.

## Comandos
| Comando | Notas |
|---------|-------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint via `next lint` |
| `npm run db:seed` | Runs `npx tsx prisma/seed.ts` |
| `npx prisma generate` | Regenerate client after schema changes |
| `npx prisma migrate dev` | Create/apply migrations |
| `docker compose up -d --build` | Build & start production containers |
| `docker compose exec app npx tsx prisma/seed.ts` | Seed DB inside container |

## Gotchas (agente, pon atención)
1. **Radix UI Select** no acepta `value=""` — crashea. Usar `value="all"` y mapear a `""` en `onValueChange`.
2. **Middleware** (`src/middleware.ts`) necesita `if (pathname === "/login") return NextResponse.next()` explícito; el matcher solo no basta.
3. **Dos auth routes** coexisten: `app/api/auth/[...nextauth]/route.ts` (self-contained, crea su propio PrismaClient) y `src/app/api/auth/[...nextauth]/route.ts` (importa `src/lib/auth`). La activa es la de `app/`.
4. **Las páginas** están en `app/` (raíz). El middleware está en `src/middleware.ts`. `src/app/` solo tiene auth route (probablemente leftover).
5. **Categorías** tienen `tipo` como string (no enum) — dinámico. Usar `categoria.tipo = "PERIFERICO"` para filtrar periféricos.
6. **QR** se genera automáticamente al crear un `StockItem`.
7. **Seed** se ejecuta con `npx tsx`, no con `prisma db seed` (aunque ambos funcionan porque `package.json` define `"prisma": { "seed": "..." }`).

## Enums Prisma
`EstadoStock`, `CondicionEquipo`, `EstadoAsignacion`, `TipoMantenimiento`, `TipoDespacho`, `EstadoDespacho`, `PrioridadDespacho`, `TipoAccionAuditoria`.
Estados custom adicionales via `TipoParametrico` / `ValorParametrico`.

## Jerarquía producto
`Categoria → Marca → Modelo → Producto`. Formularios de inventario implementan selección en cascada: al cambiar categoría se filtran marcas, etc.

## Periféricos
Relación `StockItem.equipoPadreId` → `StockItem` (self-referencing). Se crea un `StockItem` con `equipoPadreId` apuntando al equipo principal.
