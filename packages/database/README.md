# @repo/database

Drizzle ORM database client, schema definitions, repositories, and seeding utilities for the monorepo.

## Features

- 🗄️ PostgreSQL database with Drizzle ORM
- 📊 Type-safe schema definitions
- 🔄 Migration management
- 🌱 Database seeding system
- 📦 Reusable repository pattern
- 🔐 RBAC (Role-Based Access Control) schema

## Installation

This package is used internally in the monorepo:

```typescript
import { db } from "@repo/database";
import { users, roles } from "@repo/database";
```

## Database Schema

### Core Tables

- **users** - User accounts with status and authentication
- **roles** - System roles (super_admin, admin, user)
- **permissions** - Granular permissions
- **role_permissions** - Many-to-many relationship between roles and permissions
- **user_roles** - Many-to-many relationship between users and roles
- **email_verifications** - Email verification tokens
- **password_reset_tokens** - Password reset tokens

## Usage

### Getting the Database Client

```typescript
import { getClient } from "@repo/database";

const db = getClient(process.env.DATABASE_URL);
```

### Querying Data

```typescript
import { db } from "@repo/database";
import { users, roles, eq } from "@repo/database";

// Select all users
const allUsers = await db.select().from(users);

// Select user by email
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, "user@example.com"));

// Select with relations
const usersWithRoles = await db.query.users.findMany({
  with: {
    user_roles: {
      with: {
        role: true,
      },
    },
  },
});
```

### Inserting Data

```typescript
// Insert a single user
const [newUser] = await db
  .insert(users)
  .values({
    name: "John Doe",
    email: "john@example.com",
    password: "hashed_password",
    status: "active",
  })
  .returning();

// Insert multiple records
await db.insert(roles).values([
  { name: "admin" },
  { name: "user" },
]);
```

### Updating Data

```typescript
await db
  .update(users)
  .set({ status: "inactive" })
  .where(eq(users.id, userId));
```

### Deleting Data

```typescript
await db
  .delete(users)
  .where(eq(users.id, userId));
```

## Migrations

### Generate Migration

After modifying schema files:

```bash
# From root
bun run db:generate

# Or using Make
make db-generate
```

### Run Migrations

```bash
# From root
bun run db:migrate

# Or using Make
make db-migrate
```

### Database Studio

Open Drizzle Studio for visual database management:

```bash
# From root
bun run db:studio

# Or using Make
make db-studio
```

## Seeding

The package includes a comprehensive seeding system.

### Run Seeders

```bash
# From root
bun run db:seed

# Or using Make
make db-seed

# Reset database (migrate + seed)
make db-reset
```

### Available Seeders

1. **Permissions Seeder** - Seeds system permissions
2. **Roles Seeder** - Seeds roles with assigned permissions
3. **Users Seeder** - Seeds test users with roles

### Default Seed Data

**Users:**
- `superadmin@example.com` (super_admin role)
- `admin@example.com` (admin role)
- `user@example.com` (user role)

Default password for all: `password123`

⚠️ **Change these credentials before deploying to production!**

### Creating Custom Seeders

See [Seed README](./src/seed/README.md) and [example.seed.ts](./src/seed/example.seed.ts) for detailed documentation on creating custom seeders.

Quick example:

```typescript
// src/seed/products.seed.ts
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { schema } from "../schema";
import { products } from "../schema";

export async function seedProducts(db: NodePgDatabase<typeof schema>) {
  console.log("  → Seeding products...");
  
  await db.insert(products).values([
    { name: "Product 1", price: 99.99 },
    { name: "Product 2", price: 149.99 },
  ]);
  
  console.log("  ✓ Products seeded");
}
```

Then add it to `src/seed/index.ts`:

```typescript
import { seedProducts } from "./products.seed";

// In main():
await seedProducts(db);
```

## Scripts

### From the database package:

```bash
bun run seed          # Run seeders
bun run format        # Format code
bun run lint          # Lint code
bun run lint:fix      # Fix linting issues
bun run typecheck     # Type check
```

### From monorepo root:

```bash
bun run db:generate   # Generate migrations
bun run db:migrate    # Run migrations
bun run db:seed       # Run seeders
bun run db:studio     # Open Drizzle Studio
bun run db:push       # Push schema changes
bun run db:pull       # Pull schema from database
```

## Environment Variables

Create a `.env` file in the root of the monorepo:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Schema Structure

```
src/schema/
├── index.ts                 # Schema exports and aggregation
├── user.ts                  # User table and relations
├── rbac.ts                  # RBAC tables (roles, permissions, etc.)
├── email-verification.ts    # Email verification tokens
└── password-reset-token.ts  # Password reset tokens
```

## Repository Pattern

The package supports a repository pattern for data access:

```
src/repository/
└── ... (your repository implementations)
```

## Type Safety

All tables include inferred types:

```typescript
import type { User, Role, Permission } from "@repo/database";

// Or infer from schema
type User = typeof users.$inferSelect;
type InsertUser = typeof users.$inferInsert;
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Index frequently queried columns** in schema definitions
3. **Use prepared statements** for repeated queries
4. **Validate input** before database operations
5. **Use relations** for complex queries instead of manual joins
6. **Keep seeders idempotent** using conflict handling

## Troubleshooting

### Migration Issues

If you encounter migration issues:

```bash
# Check migration status
bunx drizzle-kit up

# Drop and recreate (development only!)
bunx drizzle-kit drop
bun run db:migrate
bun run db:seed
```

### Connection Issues

Verify your `DATABASE_URL` format:

```
postgresql://username:password@host:port/database
```

For local PostgreSQL:
```
postgresql://postgres:postgres@localhost:5432/mydb
```

### Type Errors

After schema changes, rebuild the package:

```bash
# From root
bun run build:packages
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Contributing

When adding new tables:

1. Create schema in `src/schema/[table].ts`
2. Export from `src/schema/index.ts`
3. Add to schema object
4. Generate migration: `bun run db:generate`
5. Run migration: `bun run db:migrate`
6. Create seeder if needed
7. Update documentation
````
