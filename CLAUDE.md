# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Tech Stack

- **Runtime / Package Manager**: Bun 1.1.38
- **Build Orchestration**: Turborepo
- **API Framework**: Elysia (Bun-native, 2 backends)
- **Frontend**: Next.js 16 with App Router (2 frontends)
- **Database ORM**: Drizzle ORM + PostgreSQL
- **UI**: Tailwind CSS v4 + shadcn/ui, `cn()` for conditional classes
- **Data Fetching (frontend)**: TanStack Query (React Query)
- **Infrastructure**: Docker Compose (Postgres 18 + Redis 8)

## Commands

```bash
bun install                  # Install dependencies

# Development
bun run dev                  # All apps
bun run dev:api              # API apps only
bun run dev:web              # Web apps only

# Building (packages must be built before apps)
make build                   # Full build in correct dependency order
bun run build:packages       # Build only shared packages (not apps)
bun run build --filter="@repo/api-admin"  # Single app/package

# Code quality
bun run lint
bun run lint:fix
bun run format               # Prettier write
bun run format:check         # Prettier check (no writes)
bun run typecheck

# Clean builds
bun run clean                # Remove dist/ and .tsbuildinfo
make clean-build             # Remove dist/ then rebuild all
make fresh                   # Remove node_modules + dist + lockfile, reinstall, rebuild

# Database
bun run db:generate          # Generate Drizzle migrations
bun run db:migrate           # Apply migrations
bun run db:push              # Push schema directly (no migration file)
bun run db:seed              # Seed roles, permissions, users
bun run db:studio            # Open Drizzle Studio UI
make db-reset                # migrate + seed
```

## Repository Layout

```
apps/
  api-admin/    # Elysia admin API (@repo/api-admin)
  api-user/     # Elysia user-facing API (@repo/api-user)
  web-admin/    # Next.js admin dashboard (@repo/web-admin, port 3003)
  web-user/     # Next.js user-facing app (@repo/web-user)
packages/
  config/       # Shared ESLint + TypeScript configs
  database/     # Drizzle schema, client, repositories, seeds, migrations
  elysia/       # Shared Elysia plugins, guards, error classes, response utils
  env/          # Zod-validated env schemas (composed, shared between apps)
  mailer/       # Nodemailer email service
  types/        # Shared TypeScript types (responses, pagination, RBAC, datatable)
  ui/           # Shared React components (shadcn/ui base)
  utils/        # Shared utilities: date, number, security, string
drizzle.config.ts       # Points at packages/database/src/schema/index.ts
docker-compose.yml      # Postgres 18 + Redis 8
```

## API App Architecture

Each API app (`api-admin`, `api-user`) follows this structure:

```
src/
  index.ts        # Entry point — mounts DocsPlugin + bootstraps modules
  base.ts         # baseApp: SecurityPlugin + LoggerPlugin + ErrorHandlerPlugin
  base-auth.ts    # baseAuthApp: extends baseApp + AuthPlugin (JWT)
  db.ts           # Drizzle database client instance
  env.ts          # Parses process.env via @repo/env Zod schemas
  services/       # App-level shared services (e.g. email.service.ts)
  modules/
    <feature>/
      index.ts    # Elysia route definitions (thin handlers only)
      schema.ts   # TypeBox (t.*) validation schemas
      service.ts  # Business logic, database calls
```

- `baseApp` — registers: `RequestPlugin`, `SecurityPlugin` (CORS, helmet,
  rate-limit), `LoggerPlugin` (pino → console + `storage/logs/app.log`),
  `ErrorHandlerPlugin`
- `baseAuthApp` — extends `baseApp` with `AuthPlugin` (JWT verification, user
  lookup, RBAC macro). Supports optional Redis cache for user lookups.
- Routes requiring auth use `baseAuthApp`; public routes use `baseApp`
- `DocsPlugin` mounts OpenAPI docs at `/docs` (disabled in production)

## RBAC

`AuthPlugin` from `@repo/elysia` exposes an `.rbac()` Elysia macro on routes.
The `superuser` role bypasses all checks. The authenticated `user` object (with
`.roles` and `.permissions`) is injected into route context.

```ts
.get('/admin', handler, { rbac: { roles: ['admin'] } })
.get('/data', handler, { rbac: { permissions: ['users.read'] } })
```

For imperative checks inside service functions, use the guard classes:

```ts
import { RoleGuard, PermissionGuard } from "@repo/elysia";

RoleGuard.canActivate(user, ["admin"]); // throws ForbiddenError
PermissionGuard.canActivate(user, ["users.read"]); // throws ForbiddenError
```

## Response Conventions

Use `ResponseUtils` from `@repo/elysia` in handlers. Throw custom error classes
— `ErrorHandlerPlugin` maps them to HTTP responses automatically.

```ts
// Success
ResponseUtils.success(data, "message");
ResponseUtils.created(data, "message");
ResponseUtils.paginated(data, meta, "message");

// Errors (throw, don't return)
throw new NotFoundError("User not found");
throw new BadRequestError("Invalid input");
throw new UnauthorizedError("Auth required");
throw new ForbiddenError("No permission");
```

Route response types use `SuccessResponseSchema(DataSchema)`,
`PaginatedResponseSchema(DataSchema)`, and
`CommonResponseSchemas[400|401|404|422]`.

## Datatable / List Endpoints

For paginated list routes, use the shared helpers from `@repo/elysia`:

```ts
import { DatatableQueryParams, DatatableUtils } from "@repo/elysia";

.get('/', async ({ query }) => {
  const params = DatatableUtils.parseFilter(query); // → { page, perPage, search, orderBy, orderDirection, filter }
  const result = await MyService.findAll(params);
  return ResponseUtils.success(result, "...");
}, { query: DatatableQueryParams })
```

## Database Package

- **Schema**: `packages/database/src/schema/` — one file per table, all exported
  via `index.ts`
- **Repositories**: `packages/database/src/repository/` — functions accepting a
  `DbClient` param
- **Seeds**: `packages/database/src/seed/` — run via `bun run db:seed`
- **Migrations**: generated into `packages/database/migrations/`
- Use `DbClient` and `DbTransaction` types (exported from `@repo/database`) for
  function signatures; pass `db` instance or transaction accordingly
- Use Drizzle query builder; avoid raw SQL unless necessary
- Always use transactions for multi-step database operations

## Environment Configuration

Each app's `src/env.ts` calls the appropriate Zod schema from `@repo/env`:

```ts
import { apiEnvSchema } from "@repo/env";
export const env = apiEnvSchema.parse(process.env);
```

API required vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` (min 32
chars), `APP_NAME`, `NODE_ENV`, `LOG_LEVEL`, `PORT`, CORS vars, and mailer vars
(`MAILER_HOST`, `MAILER_PORT`, `MAILER_USER`, `MAILER_PASSWORD`, `MAILER_FROM`).

Web apps use `webEnvSchema` — requires only `NEXT_PUBLIC_API_URL`.

Never access `process.env` directly — always use the validated `env` object.

## Build Order

Turborepo enforces `dependsOn: ["^build"]`. The Makefile `build` target builds
explicitly in order:
`config → types → utils → env → elysia → database → mailer → ui → api-* → web-*`

Internal dependencies use `workspace:*` protocol. Run `bun install` at the root
after adding any dependency.

## Naming Conventions

| Context                      | Convention           | Example                     |
| ---------------------------- | -------------------- | --------------------------- |
| Files / folders              | kebab-case           | `user-profile.ts`           |
| React components             | PascalCase           | `UserProfile.tsx`           |
| Next.js routes               | lowercase            | `app/user-profile/page.tsx` |
| Variables / functions        | camelCase            | `getUserData`               |
| Classes / interfaces / types | PascalCase           | `ApiResponse`               |
| Constants                    | SCREAMING_SNAKE_CASE | `MAX_RETRIES`               |
| Workspace packages           | `@repo/` prefix      | `@repo/database`            |

## Import Order

```ts
// 1. External packages
import { Elysia } from "elysia";
// 2. Workspace packages
import { db } from "@repo/database";
import type { User } from "@repo/types";
// 3. Relative imports
import { baseAuthApp } from "../../base-auth";
```

## UI Components (shadcn/ui)

All shared UI components live in `packages/ui/src/components/ui/`. The component
authoring workflow uses the [shadcn/ui](https://ui.shadcn.com/) CLI, configured
via `packages/ui/components.json`.

### Adding a new component

```bash
cd packages/ui
bunx shadcn@latest add <component-name>
```

After adding, export the new component from `src/components/ui/index.ts` so it
is available via `@repo/ui`.

### Rules

- Import UI components from `@repo/ui` in apps — never directly from
  `@radix-ui/*`
- Do **not** manually add `@radix-ui/*` packages to `packages/ui/package.json` —
  the shadcn CLI manages them
- shadcn internally uses `@radix-ui` primitives; those packages remain as
  dependencies but are added/updated by the CLI
- The `cn()` utility lives in `packages/ui/src/libs/utils.ts` and is exported
  from `@repo/ui`
- Use `React.ComponentRef` (not `React.ElementRef` — deprecated in React 19)
  when typing refs in new components

## Frontend Conventions (Next.js)

- Default to Server Components; use `"use client"` only when needed
- Use `@tanstack/react-query` for data fetching in Client Components
- Use `@repo/ui` for shared components (shadcn/ui — see section above)
- Extract reusable logic into hooks

### web-admin architecture

- Route structure: `/` = login (public), `(dashboard)/dashboard` = protected
- `proxy.ts` — Next.js route guard; redirects unauthenticated users away from
  `/dashboard` and authenticated users away from `/`
- `lib/context/auth-context.tsx` — `AuthProvider` + `useAuth()` hook; stores
  token in both localStorage (`auth_token`, `auth_user` keys) and a cookie (same
  key, max-age 86400s) so the `proxy.ts` matcher can read it server-side
- `lib/providers/query-provider.tsx` — TanStack Query singleton
- `lib/api/client.ts` — axios instance with `baseURL` from `NEXT_PUBLIC_API_URL`

## Code Style Rules

- **Before creating types**: check `packages/types/src/` and reuse from
  `@repo/types`
- **Before creating utilities**: check `packages/utils/src/` (categories: date,
  number, security, string)
- **Comments**: comment each logical block with its purpose (why, not what); do
  not comment every few lines
- **No emojis or icons** in code files, comments, console logs, error messages,
  or API responses (only in UI when design requires)
- Keep route handlers thin — move logic to `service.ts`
