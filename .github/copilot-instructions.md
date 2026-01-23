# GitHub Copilot Instructions

## Project Overview

This is a **monorepo** built with **Turborepo** and **Bun**, containing multiple applications and shared packages.

### Architecture

- **Monorepo Manager**: Turborepo
- **Package Manager**: Bun
- **Workspace Structure**: Apps and packages pattern

### Applications

#### API Applications (Elysia)
- `apps/api-admin` - Admin API service
- `apps/api-user` - User-facing API service
- **Framework**: Elysia.js (modern TypeScript web framework for Bun)
- **Runtime**: Bun

#### Web Applications (Next.js)
- `apps/web-admin` - Admin dashboard
- `apps/web-user` - User-facing web app
- **Framework**: Next.js 16 with App Router
- **UI Library**: Tailwind CSS v4 + shadcn/ui components
- **Data Fetching**: TanStack Query (React Query)

### Shared Packages

- `packages/database` - Drizzle ORM database client and schema
- `packages/env` - Environment variable validation
- `packages/types` - Shared TypeScript types
- `packages/config` - Shared configuration (ESLint, TypeScript)
- `packages/ui` - Shared UI components

## Code Style and Best Practices

### TypeScript
- Use strict TypeScript configuration
- Always define proper types, avoid `any`
- Use type inference where appropriate
- Prefer interfaces for object shapes
- Use Zod for runtime validation

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
- Use migrations for schema changes (`bun run db:generate`, `bun run db:migrate`)
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
- Use workspace protocol for internal dependencies: `"@repo/database": "workspace:*"`
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
