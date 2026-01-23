# Antigravity AI Assistant Instructions

## Project Context

You are working with a **Turborepo monorepo** for a clean architecture
implementation using modern TypeScript technologies. The project follows clean
architecture principles with clear separation between applications and shared
packages.

## Technology Stack

### Backend APIs

- **Framework**: Elysia.js (modern TypeScript framework for Bun)
- **Runtime**: Bun
- **Apps**: `api-admin`, `api-user`

### Frontend Web Apps

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Apps**: `web-admin`, `web-user`

### Shared Infrastructure

- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Package Manager**: Bun
- **Monorepo**: Turborepo

## Architectural Principles

### Clean Architecture

1. **Separation of Concerns**: Keep business logic, data access, and
   presentation layers separate
2. **Dependency Rule**: Dependencies point inward; inner layers never depend on
   outer layers
3. **Workspace Packages**: Use shared packages (`@repo/*`) for cross-cutting
   concerns
4. **Domain-Driven Design**: Organize code by domain/feature, not by technical
   layer

### Code Organization

- **Apps**: Independent applications with minimal shared code
- **Packages**: Reusable libraries and configurations
- **Colocation**: Keep related files close (components, hooks, utils)
- **Barrel Exports**: Use `index.ts` for clean public APIs

## Development Guidelines

### When Creating New Features

1. **Start with types** - Define interfaces in `@repo/types` if shared
2. **Database schema** - Add/update schema in `@repo/database` if needed
3. **Backend API** - Implement in appropriate Elysia app
4. **Frontend UI** - Build in Next.js app, use `@repo/ui` for shared components
5. **Validation** - Use Zod schemas for all data validation

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: Follow ESLint configuration from `@repo/config`
- **Formatting**: Use Prettier (run `bun run format`)
- **Testing**: Write tests for business logic and critical paths
- **Type Safety**: Prefer type inference, explicit types for public APIs

### Performance Considerations

- **Next.js**: Prefer Server Components, use Client Components only when needed
- **Database**: Use indexes, avoid N+1 queries
- **Caching**: Leverage React Query for client-side caching
- **Bundle Size**: Use dynamic imports for large dependencies

### Security Best Practices

- **Input Validation**: Always validate with Zod schemas
- **Environment Variables**: Use `@repo/env` for type-safe env access
- **CORS**: Configure properly in Elysia apps
- **Error Messages**: Don't expose sensitive information in client errors

## Workspace Structure

```
monorepo-implementation/
├── apps/
│   ├── api-admin/      # Elysia admin API
│   ├── api-user/       # Elysia user API
│   ├── web-admin/      # Next.js admin dashboard
│   └── web-user/       # Next.js user web app
├── packages/
│   ├── config/         # Shared configs (ESLint, TS)
│   ├── database/       # Drizzle ORM + schemas
│   ├── env/            # Environment validation
│   ├── types/          # Shared TypeScript types
│   └── ui/             # Shared UI components
```

## Common Commands

```bash
# Development
bun run dev              # All apps
bun run dev:web          # Web apps only
bun run dev:api          # API apps only

# Database
bun run db:generate      # Generate migrations
bun run db:migrate       # Apply migrations

# Quality
bun run lint:fix         # Auto-fix linting issues
bun run format           # Format with Prettier
bun run typecheck        # Type-check all packages
```

## Working with This Codebase

### Before Making Changes

1. **Understand the domain**: Review related code in the affected app/package
2. **Check dependencies**: Understand which packages depend on what you're
   changing
3. **Review types**: Check `@repo/types` for existing type definitions
4. **Database schema**: Review `@repo/database` schema if working with data

### During Development

1. **Run type checking**: Keep `bun run typecheck` passing
2. **Test changes**: Manually test in the running app
3. **Check build**: Ensure `bun run build` succeeds
4. **Review console**: No warnings or errors

### File Naming

- **Components**: PascalCase - `UserProfile.tsx`
- **Utilities**: camelCase - `formatDate.ts`
- **Routes**: lowercase - `app/user-profile/page.tsx`
- **Types**: PascalCase - `User.ts` or `user.types.ts`

### Import Organization

```typescript
// 1. External dependencies
import { Elysia } from "elysia";
import { z } from "zod";

// 2. Workspace packages
import { db } from "@repo/database";
import type { User } from "@repo/types";

// 3. Relative imports
import { userService } from "./services/user-service";
import type { UserFormData } from "./types";
```

## Error Handling Patterns

### Backend (Elysia)

```typescript
import { Elysia } from "elysia";

new Elysia().post("/users", async ({ body, set }) => {
	try {
		const user = await createUser(body);
		return user;
	} catch (error) {
		set.status = 500;
		return { error: "Failed to create user" };
	}
});
```

### Frontend (Next.js)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* Render data */}</div>;
}
```

## Communication with User

When working on tasks:

1. **Be proactive**: Fix related issues you notice
2. **Explain decisions**: Share reasoning for non-obvious choices
3. **Ask when unclear**: Don't assume requirements
4. **Show progress**: Update task status regularly
5. **Validate changes**: Test before marking complete

## Additional Context

- **Bun Runtime**: This project uses Bun for both package management and running
  backend services
- **Workspace Protocol**: Internal dependencies use `workspace:*` in
  package.json
- **Shared Config**: ESLint and TypeScript configs are centralized in
  `@repo/config`
- **Docker**: `docker-compose.yml` available for local database setup
- **Git**: Follow conventional commits for clear history

## When Stuck

1. Check package.json scripts in the relevant app/package
2. Review README.md files in apps and packages
3. Look for similar patterns in existing code
4. Check Turborepo docs for monorepo-specific issues
5. Verify environment variables are properly configured
