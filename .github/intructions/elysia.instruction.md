# Backend Development Instructions (Elysia.js)

## Elysia.js Fundamentals

Elysia is a modern, ergonomic TypeScript framework for Bun with focus on
performance and developer experience. It uses method chaining and functional
composition for building APIs.

## Project Structure (Backend Apps)

```
apps/api-{admin|user}/
├── src/
│   ├── index.ts              # App entry point
│   ├── routes/               # Route definitions
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── services/             # Business logic
│   │   ├── user-service.ts
│   │   └── auth-service.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts
│   │   └── logger.ts
│   └── utils/                # Utility functions
├── package.json
└── tsconfig.json
```

## Core Patterns

### 1. Route Definition with Elysia

```typescript
import { Elysia } from "elysia";

// Simple routes
export const userRoutes = new Elysia({ prefix: "/users" })
	.get("/", async () => {
		const users = await getAllUsers();
		return users;
	})
	.get("/:id", async ({ params }) => {
		const user = await getUserById(params.id);
		if (!user) throw new Error("User not found");
		return user;
	})
	.post("/", async ({ body }) => {
		const user = await createUser(body);
		return user;
	})
	.put("/:id", async ({ params, body }) => {
		const user = await updateUser(params.id, body);
		return user;
	})
	.delete("/:id", async ({ params, set }) => {
		await deleteUser(params.id);
		set.status = 204;
	});
```

### 2. Request Validation with Zod

```typescript
import { Elysia, t } from "elysia";
import { z } from "zod";

const createUserSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	age: z.number().min(18).optional(),
});

export const userRoutes = new Elysia({ prefix: "/users" }).post(
	"/",
	async ({ body }) => {
		// Validate with Zod
		const validated = createUserSchema.parse(body);
		return await createUser(validated);
	},
	{
		body: t.Object({
			name: t.String({ minLength: 2 }),
			email: t.String({ format: "email" }),
			age: t.Optional(t.Number({ minimum: 18 })),
		}),
	},
);
```

### 3. Error Handling

```typescript
import { Elysia } from "elysia";

export class UserNotFoundError extends Error {
	constructor(id: string) {
		super(`User with id ${id} not found`);
		this.name = "UserNotFoundError";
	}
}

export const userRoutes = new Elysia({ prefix: "/users" })
	.onError(({ code, error, set }) => {
		if (error instanceof UserNotFoundError) {
			set.status = 404;
			return { error: error.message };
		}

		if (code === "VALIDATION") {
			set.status = 400;
			return { error: "Validation failed", details: error };
		}

		set.status = 500;
		return { error: "Internal server error" };
	})
	.get("/:id", async ({ params }) => {
		const user = await getUserById(params.id);
		if (!user) throw new UserNotFoundError(params.id);
		return user;
	});
```

### 4. Middleware

```typescript
import { Elysia } from "elysia";

// Logger middleware
export const logger = new Elysia()
	.onRequest(({ request, path }) => {
		console.log(`${request.method} ${path}`);
	})
	.onResponse(({ request, path }) => {
		console.log(`${request.method} ${path} - completed`);
	});

// Auth middleware
export const authMiddleware = new Elysia()
	.derive(({ headers }) => {
		const token = headers.authorization?.replace("Bearer ", "");
		return { token };
	})
	.resolve(async ({ token, set }) => {
		if (!token) {
			set.status = 401;
			throw new Error("Unauthorized");
		}

		const user = await verifyToken(token);
		return { user };
	});

// Usage
const app = new Elysia()
	.use(logger)
	.use(authMiddleware)
	.get("/protected", ({ user }) => {
		return { message: `Hello ${user.name}` };
	});
```

### 5. Database Integration (Drizzle ORM)

```typescript
import { Elysia } from "elysia";
import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
	.get("/", async () => {
		return await db.select().from(users);
	})
	.get("/:id", async ({ params }) => {
		const [user] = await db.select().from(users).where(eq(users.id, params.id));

		if (!user) throw new Error("User not found");
		return user;
	})
	.post("/", async ({ body }) => {
		const [user] = await db.insert(users).values(body).returning();

		return user;
	})
	.put("/:id", async ({ params, body }) => {
		const [user] = await db
			.update(users)
			.set(body)
			.where(eq(users.id, params.id))
			.returning();

		return user;
	})
	.delete("/:id", async ({ params, set }) => {
		await db.delete(users).where(eq(users.id, params.id));
		set.status = 204;
	});
```

### 6. CORS Configuration

```typescript
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
	.use(
		cors({
			origin: process.env.ALLOWED_ORIGINS?.split(",") || [
				"http://localhost:3000",
			],
			credentials: true,
		}),
	)
	.get("/", () => "API is running");
```

### 7. API Documentation with Swagger

```typescript
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "Admin API Documentation",
					version: "1.0.0",
				},
			},
		}),
	)
	.get(
		"/users",
		() => {
			return { users: [] };
		},
		{
			detail: {
				summary: "Get all users",
				tags: ["Users"],
			},
		},
	);
```

### 8. App Composition

```typescript
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { apiEnvSchema } from "@repo/env";

import { userRoutes } from "./routes/users";
import { authRoutes } from "./routes/auth";
import { logger } from "./middleware/logger";

const env = apiEnvSchema.parse(process.env);

const app = new Elysia()
	.use(cors())
	.use(
		swagger({
			documentation: {
				info: {
					title: "API Documentation",
					version: "1.0.0",
				},
			},
		}),
	)
	.use(logger)
	.get("/health", () => ({ status: "ok" }))
	.use(authRoutes)
	.use(userRoutes)
	.listen(env.PORT);

console.log(`🦊 Server running at http://localhost:${env.PORT}`);
```

## Best Practices

### 1. Environment Variables

```typescript
import { z } from "zod";

// Define in @repo/env
export const apiEnvSchema = z.object({
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string(),
});

// Use in app
import { apiEnvSchema } from "@repo/env";
const env = apiEnvSchema.parse(process.env);
```

### 2. Service Layer Pattern

```typescript
// services/user-service.ts
import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import type { NewUser, User } from "@repo/types";

export class UserService {
	async getAll(): Promise<User[]> {
		return await db.select().from(users);
	}

	async getById(id: string): Promise<User | undefined> {
		const [user] = await db.select().from(users).where(eq(users.id, id));
		return user;
	}

	async create(data: NewUser): Promise<User> {
		const [user] = await db.insert(users).values(data).returning();
		return user;
	}

	async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
		const [user] = await db
			.update(users)
			.set(data)
			.where(eq(users.id, id))
			.returning();
		return user;
	}

	async delete(id: string): Promise<void> {
		await db.delete(users).where(eq(users.id, id));
	}
}

export const userService = new UserService();

// routes/users.ts
import { Elysia } from "elysia";
import { userService } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/users" })
	.get("/", () => userService.getAll())
	.get("/:id", async ({ params }) => {
		const user = await userService.getById(params.id);
		if (!user) throw new Error("User not found");
		return user;
	});
```

### 3. Type Safety

```typescript
// Use shared types from @repo/types
import type { User, NewUser } from "@repo/types";

// Define route-specific types locally
type UserResponse = Omit<User, "password">;

export const userRoutes = new Elysia({ prefix: "/users" }).get(
	"/",
	async (): Promise<UserResponse[]> => {
		const users = await getAllUsers();
		return users.map(({ password, ...user }) => user);
	},
);
```

### 4. Error Classes

```typescript
// utils/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id: string) {
    super(404, `${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(400, message);
    this.name = "ValidationError";
  }
}

// Usage in routes
.onError(({ error, set }) => {
  if (error instanceof ApiError) {
    set.status = error.statusCode;
    return { error: error.message };
  }

  set.status = 500;
  return { error: "Internal server error" };
})
```

### 5. Database Transactions

```typescript
import { db } from "@repo/database";

export const createUserWithProfile = async (
	userData: NewUser,
	profileData: NewProfile,
) => {
	return await db.transaction(async (tx) => {
		const [user] = await tx.insert(users).values(userData).returning();
		const [profile] = await tx
			.insert(profiles)
			.values({
				...profileData,
				userId: user.id,
			})
			.returning();

		return { user, profile };
	});
};
```

## Testing

```typescript
import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { userRoutes } from "./routes/users";

describe("User Routes", () => {
	it("should get all users", async () => {
		const app = new Elysia().use(userRoutes);
		const response = await app.handle(new Request("http://localhost/users"));

		expect(response.status).toBe(200);
		const users = await response.json();
		expect(Array.isArray(users)).toBe(true);
	});
});
```

## Common Pitfalls

1. **Don't forget to parse environment variables** with Zod schema
2. **Always validate input** before processing
3. **Use transactions** for multi-step database operations
4. **Handle errors properly** - return appropriate status codes
5. **Don't expose sensitive data** in error messages
6. **Keep routes thin** - move logic to services
7. **Use TypeScript types** from `@repo/types`
8. **Test your endpoints** manually and with automated tests

## Performance Tips

- Use `.select()` to fetch only needed columns
- Add database indexes for frequently queried fields
- Use connection pooling for database connections
- Implement caching for frequently accessed data
- Use streaming for large responses
- Avoid N+1 queries with proper joins

## Development Workflow

1. **Define types** in `@repo/types` if shared
2. **Update database schema** in `@repo/database` if needed
3. **Generate and run migrations**: `bun run db:generate && bun run db:migrate`
4. **Create service** with business logic
5. **Create routes** using the service
6. **Add validation** with Zod schemas
7. **Test endpoints** with Swagger UI or HTTP client
8. **Handle errors** appropriately
9. **Document** with JSDoc and Swagger decorators
