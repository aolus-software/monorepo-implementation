# GitHub Copilot Instructions

## Project Overview

This is a **monorepo example** built with **Turborepo** and **Bun**,
demonstrating clean architecture principles with multiple applications and
shared packages.

### Architecture

- **Monorepo Manager**: Turborepo
- **Package Manager**: Bun
- **Workspace Structure**: Apps and packages pattern
- **Ports Used**: 4 ports total (2 Next.js frontends, 2 Elysia backends)

### Applications

#### Backend Applications (Elysia)

- `apps/api-admin` - Admin API service (Elysia + Bun)
- `apps/api-user` - User-facing API service (Elysia + Bun)
- **Framework**: Elysia.js (modern TypeScript web framework for Bun)
- **Runtime**: Bun

#### Frontend Applications (Next.js)

- `apps/web-admin` - Admin dashboard (Next.js 16 with App Router)
- `apps/web-user` - User-facing web app (Next.js 16 with App Router)
- **Framework**: Next.js 16 with App Router
- **UI Library**: Tailwind CSS v4 + shadcn/ui components
- **Data Fetching**: TanStack Query (React Query)

### Shared Packages

- `packages/database` - Drizzle ORM database client and schema
- `packages/env` - Environment variable validation
- `packages/types` - Shared TypeScript types
- `packages/utils` - Shared utility functions
- `packages/config` - Shared configuration (ESLint, TypeScript)
- `packages/ui` - Shared UI components
- `packages/elysia` - Shared Elysia plugins and utilities
- `packages/mailer` - Email service utilities

## Project Structure

```
monorepo-implementation/
├── apps/
│   ├── api-admin/                  # Backend: Admin API (Elysia)
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   ├── base.ts            # Base Elysia instance
│   │   │   ├── base-auth.ts       # Auth-protected base instance
│   │   │   ├── env.ts             # Environment validation
│   │   │   ├── db.ts              # Database connection
│   │   │   ├── mailer.ts          # Mailer instance
│   │   │   ├── modules/           # Feature modules
│   │   │   │   ├── auth/          # Authentication module
│   │   │   │   ├── home/          # Home module
│   │   │   │   └── settings/      # Settings module
│   │   │   └── services/          # Business logic services
│   │   │       └── email.service.ts
│   │   └── storage/logs/          # Application logs
│   │
│   ├── api-user/                   # Backend: User API (Elysia)
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   ├── base.ts            # Base Elysia instance
│   │   │   ├── base-auth.ts       # Auth-protected base instance
│   │   │   ├── env.ts             # Environment validation
│   │   │   ├── db.ts              # Database connection
│   │   │   └── modules/           # Feature modules
│   │   │       └── home/          # Home module
│   │   └── storage/logs/          # Application logs
│   │
│   ├── web-admin/                  # Frontend: Admin Dashboard (Next.js)
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Home page
│   │   │   └── globals.css        # Global styles
│   │   ├── public/                # Static assets
│   │   └── [config files]
│   │
│   └── web-user/                   # Frontend: User Web App (Next.js)
│       ├── app/                   # Next.js App Router
│       │   ├── layout.tsx         # Root layout
│       │   ├── page.tsx           # Home page
│       │   └── globals.css        # Global styles
│       ├── public/                # Static assets
│       └── [config files]
│
├── packages/
│   ├── config/                    # Shared configs (ESLint, TypeScript)
│   │   ├── eslint.config.mjs
│   │   ├── prettier.config.js
│   │   ├── tsconfig.base.json
│   │   ├── tsconfig.elysia.json
│   │   ├── tsconfig.next.json
│   │   └── src/index.ts
│   │
│   ├── database/                  # Drizzle ORM setup
│   │   ├── src/
│   │   │   ├── client.ts          # Database client
│   │   │   ├── index.ts           # Exports
│   │   │   ├── schema/            # Database schemas
│   │   │   ├── repository/        # Data access layer
│   │   │   └── seed/              # Database seeds
│   │   └── migrations/            # Database migrations
│   │
│   ├── elysia/                    # Shared Elysia utilities
│   │   └── src/
│   │       ├── index.ts           # Exports
│   │       ├── config/            # Shared configs
│   │       ├── errors/            # Error classes
│   │       ├── guards/            # Auth guards
│   │       ├── logger/            # Logger plugin
│   │       ├── plugins/           # Elysia plugins
│   │       └── utils/             # Helper functions
│   │
│   ├── env/                       # Environment validation
│   │   └── src/index.ts           # Zod schemas for env vars
│   │
│   ├── mailer/                    # Email service
│   │   └── src/
│   │       ├── index.ts           # Exports
│   │       └── mailer.service.ts  # Mailer implementation
│   │
│   ├── types/                     # Shared TypeScript types
│   │   └── src/
│   │       ├── index.ts           # Exports
│   │       ├── datatable/         # Datatable types
│   │       ├── default/           # Common types
│   │       ├── elysia/            # Elysia-specific types
│   │       └── repository/        # Repository types
│   │
│   ├── ui/                        # Shared UI components
│   │   ├── src/components/        # React components
│   │   ├── tailwind.config.ts     # Tailwind config
│   │   └── components.json        # shadcn/ui config
│   │
│   └── utils/                     # Shared utility functions
│       └── src/
│           ├── index.ts           # Exports
│           ├── date/              # Date utilities
│           ├── number/            # Number utilities
│           ├── security/          # Security utilities
│           └── string/            # String utilities
│
├── docker-compose.yml             # Docker services
├── drizzle.config.ts              # Drizzle ORM config
├── turbo.json                     # Turborepo config
├── package.json                   # Root package.json
└── tsconfig.json                  # Root TypeScript config
```

## Code Style and Best Practices

### TypeScript

- Use strict TypeScript configuration
- Always define proper types, avoid `any`
- Use type inference where appropriate
- Prefer interfaces for object shapes
- Use Zod for runtime validation

### Before Creating New Code

**ALWAYS check existing packages first:**

1. **Check `packages/types`** before creating new types or interfaces
   - Look in `packages/types/src/` for existing type definitions
   - Reuse existing types from `@repo/types` instead of duplicating
2. **Check `packages/utils`** before creating utility functions
   - Look in `packages/utils/src/` for existing utilities
   - Available categories: date, number, security, string
   - Reuse existing utilities from `@repo/utils` instead of recreating

### Code Comments Policy

**Keep comments minimal and meaningful:**

- Comment each **code block** (if, else, switch, function) with its purpose
- Do NOT add comments every 2-10 lines
- Comments should explain **why**, not **what**
- Example of good commenting:

```typescript
// Calculate user discount based on membership tier
function calculateDiscount(user: User): number {
	// Premium members get higher discount
	if (user.tier === "premium") {
		return 0.2;
	}

	// Standard members get basic discount
	if (user.tier === "standard") {
		return 0.1;
	}

	// Free tier gets no discount
	return 0;
}
```

### Documentation and Examples

**DO NOT create unless explicitly requested:**

- README files after implementing features
- Example files after completing tasks
- Documentation files for code changes
- Tutorial or guide files

**Focus on delivering working code only.**

### Icons and Emojis

**NEVER use icons or emojis in:**

- Code files (TypeScript, JavaScript, etc.)
- Comments
- Console logs
- Error messages
- API responses
- UI component code

**Exception**: Icons are acceptable only in:

- UI components where explicitly required by design
- When user specifically requests them

### Backend (Elysia)

- Use functional patterns and composition
- Implement clean architecture principles
- Keep route handlers thin, move logic to services
- Use dependency injection where appropriate
- Validate input with Zod schemas (via `@repo/env` or inline)
- Use proper HTTP status codes
- Document API endpoints with Swagger decorators

### Frontend (Next.js)

- Use Server Components by default, Client Components when needed
- Implement proper loading and error states
- Use React Query for data fetching and caching
- Follow the App Router conventions
- Keep components small and focused
- Extract reusable logic into hooks
- Use the `@repo/ui` package for shared components
- Prefer composition over prop drilling

### Database (Drizzle ORM)

- Define schemas in `packages/database/src/schema`
- Use migrations for schema changes (`bun run db:generate`,
  `bun run db:migrate`)
- Use the Drizzle query builder, avoid raw SQL unless necessary
- Always use transactions for multi-step operations
- Index frequently queried columns

### Styling

- Use Tailwind CSS utility classes
- Follow the `@repo/ui` component patterns
- Use CSS variables for theming (defined in Tailwind config)
- Keep styles colocated with components
- Use `cn()` utility for conditional classes

## Naming Conventions

### Files and Folders

- Use kebab-case for file names: `user-profile.ts`
- Use PascalCase for React components: `UserProfile.tsx`
- Use lowercase for routes in Next.js: `app/user-profile/page.tsx`

### Code

- **Variables/Functions**: camelCase (`getUserData`, `isActive`)
- **Classes/Interfaces/Types**: PascalCase (`UserProfile`, `ApiResponse`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Workspace packages**: Scoped with `@repo/` prefix

## Workspace Commands

```bash
# Development
bun run dev              # Run all apps
bun run dev:web          # Run only web apps
bun run dev:api          # Run only API apps

# Building
bun run build            # Build all apps
bun run build:web        # Build web apps
bun run build:api        # Build API apps

# Database
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations

# Code Quality
bun run lint             # Lint all packages
bun run lint:fix         # Auto-fix lint issues
bun run format           # Format code with Prettier
bun run typecheck        # Type-check all packages
```

## Import Conventions

### Workspace Packages

```typescript
// Shared packages
import { db } from "@repo/database";
import { apiEnvSchema } from "@repo/env";
import { Button } from "@repo/ui";
import type { User } from "@repo/types";
```

### Relative Imports

- Keep imports organized: external → workspace → relative
- Group imports logically
- Use path aliases from `tsconfig.json`

## Environment Variables

- Validate with Zod schemas in `@repo/env`
- Never commit `.env` files
- Use `.env.example` for documentation
- Access via validated env object, not `process.env` directly

## Testing

- Write tests alongside source files: `user.test.ts`
- Use Bun's built-in test runner for backend
- Use appropriate assertions and mocks
- Test edge cases and error scenarios

## Common Patterns

### API Route (Elysia)

```typescript
import { Elysia } from "elysia";

export const userRoutes = new Elysia({ prefix: "/users" })
	.get("/", async () => {
		// Handle GET /users
	})
	.post("/", async ({ body }) => {
		// Handle POST /users
	});
```

### Next.js Server Component

```typescript
export default async function UsersPage() {
  const users = await fetchUsers(); // Server-side fetch
  return <UserList users={users} />;
}
```

### Next.js Client Component

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserList() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers
  });

  return <div>{/* Render users */}</div>;
}
```

## Dependencies

- Add dependencies to the appropriate package/app
- Use workspace protocol for internal dependencies:
  `"@repo/database": "workspace:*"`
- Run `bun install` at the root after adding dependencies
- Consider if a dependency should be in a shared package

## Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors appropriately
- Return proper error responses in APIs
- Show user-friendly errors in UI

## Performance

- Use React Server Components to reduce client bundle
- Implement proper caching strategies
- Use database indexes
- Optimize images with Next.js Image component
- Lazy load components when appropriate

## Security

- Validate all user input
- Sanitize data before database operations
- Use CORS appropriately in APIs
- Never expose sensitive environment variables to client
- Implement proper authentication and authorization
