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
│   ├── base.ts               # Base Elysia instance with plugins
│   ├── base-auth.ts          # Auth-protected base instance
│   ├── env.ts                # Environment validation
│   ├── db.ts                 # Database connection
│   ├── mailer.ts             # Mailer instance (if applicable)
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication module
│   │   │   └── index.ts      # Auth routes
│   │   ├── home/             # Home module
│   │   │   └── index.ts      # Home routes
│   │   └── settings/         # Settings module
│   │       └── index.ts      # Settings routes
│   └── services/             # Business logic
│       └── email.service.ts
└── storage/logs/             # Application logs
```

## Base Instances

### 1. Base App (base.ts)

Use `baseApp` for public routes that don't require authentication:

```typescript
import {
	ErrorHandlerPlugin,
	LoggerPlugin,
	RequestPlugin,
	SecurityPlugin,
} from "@repo/elysia";
import { Elysia } from "elysia";
import { env } from "./env";

export const baseApp = new Elysia({ name: "base-app" })
	.use(RequestPlugin)
	.use(
		SecurityPlugin({
			corsOptions: {
				origin: env.CORS_ORIGIN,
				methods: env.CORS_METHODS,
				allowedHeaders: env.CORS_ALLOWED_HEADERS,
				credentials: env.CORS_CREDENTIALS,
				maxAge: env.CORS_MAX_AGE,
			},
			rateLimitOptions: undefined,
			helmetOptions: undefined,
		}),
	)
	.use(LoggerPlugin)
	.use(ErrorHandlerPlugin);
```

**Features:**

- Request logging
- CORS configuration
- Rate limiting (optional)
- Security headers (optional)
- Global error handling

### 2. Base Auth App (base-auth.ts)

Use `baseAuthApp` for protected routes that require authentication:

```typescript
import { AuthPlugin } from "@repo/elysia";
import { Elysia } from "elysia";
import { baseApp } from "./base";
import { db } from "./db";
import { env } from "./env";

export const baseAuthApp = new Elysia({ name: "base-auth-app" })
	.use(baseApp)
	.use(
		AuthPlugin({
			jwt: {
				secret: env.JWT_SECRET,
				exp: env.JWT_EXPIRES_IN,
				alg: "HS256",
			},
			db: db,
			requireAuth: true,
			messages: {
				noToken: "Authentication required",
				invalidToken: "Invalid or expired authentication token",
				userNotFound: "User not found or inactive",
			},
		}),
	);
```

**Features:**

- All base app features
- JWT authentication
- Automatic user retrieval
- Role and permission checking
- User context injection

## Core Patterns

### 1. Creating Public Routes

Use `baseApp` for public endpoints:

```typescript
// modules/home/index.ts
import { Elysia } from "elysia";
import { baseApp } from "../../base";

export const HomeModule = new Elysia({ prefix: "/home" })
	.use(baseApp)
	.get("/", () => {
		return { message: "Welcome to the API" };
	})
	.get("/health", () => {
		return { status: "ok", timestamp: new Date() };
	});
```

### 2. Creating Protected Routes

Use `baseAuthApp` for authenticated endpoints:

```typescript
// modules/users/index.ts
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";

export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.get("/", ({ user }) => {
		// user is automatically available and typed
		return { message: `Hello ${user.name}`, userId: user.id };
	})
	.get("/profile", ({ user }) => {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
		};
	});
```

### 3. Role-Based Access Control (RBAC)

Use the `rbac` macro for specific permissions:

```typescript
import { Elysia } from "elysia";
import { baseAuthApp } from "../../base-auth";

export const AdminModule = new Elysia({ prefix: "/admin" })
	.use(baseAuthApp)
	// Require admin role
	.get(
		"/dashboard",
		({ user }) => {
			return { message: "Admin dashboard" };
		},
		{
			rbac: { roles: ["admin"] },
		},
	)
	// Require specific permission
	.get(
		"/sensitive",
		({ user }) => {
			return { data: "sensitive information" };
		},
		{
			rbac: { permissions: ["users.read.sensitive"] },
		},
	)
	// Require either role or permission
	.delete(
		"/:id",
		({ params, user }) => {
			return { message: `Deleted user ${params.id}` };
		},
		{
			rbac: {
				roles: ["admin", "moderator"],
				permissions: ["users.delete"],
			},
		},
	);
```

### 4. Request Validation with TypeBox

Use TypeBox (via Elysia's `t`) for request validation:

```typescript
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";

export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.post(
		"/",
		async ({ body }) => {
			// body is automatically validated and typed
			const user = await createUser(body);
			return user;
		},
		{
			body: t.Object({
				name: t.String({ minLength: 2, maxLength: 100 }),
				email: t.String({ format: "email" }),
				age: t.Optional(t.Number({ minimum: 18, maximum: 120 })),
			}),
		},
	)
	.put(
		"/:id",
		async ({ params, body }) => {
			const user = await updateUser(params.id, body);
			return user;
		},
		{
			params: t.Object({
				id: t.String({ format: "uuid" }),
			}),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 2 })),
				email: t.Optional(t.String({ format: "email" })),
			}),
		},
	);
```

**Common TypeBox patterns:**

```typescript
// String validation
t.String();
t.String({ minLength: 2, maxLength: 100 });
t.String({ format: "email" });
t.String({ format: "uuid" });
t.String({ pattern: "^[a-zA-Z]+$" });

// Number validation
t.Number();
t.Number({ minimum: 0, maximum: 100 });
t.Integer();

// Boolean
t.Boolean();

// Optional fields
t.Optional(t.String());

// Arrays
t.Array(t.String());
t.Array(t.Object({ id: t.String(), name: t.String() }));

// Enums
t.Union([t.Literal("active"), t.Literal("inactive")]);

// Nested objects
t.Object({
	user: t.Object({
		name: t.String(),
		email: t.String({ format: "email" }),
	}),
	settings: t.Optional(
		t.Object({
			theme: t.String(),
		}),
	),
});
```

### 5. Database Integration (Drizzle ORM)

```typescript
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";
import { db } from "../../db";
import { users } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@repo/elysia";

export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.get("/", async () => {
		return await db.select().from(users);
	})
	.get("/:id", async ({ params }) => {
		const [user] = await db.select().from(users).where(eq(users.id, params.id));

		// Throw error for automatic handling
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	})
	.post(
		"/",
		async ({ body }) => {
			const [user] = await db.insert(users).values(body).returning();
			return user;
		},
		{
			body: t.Object({
				name: t.String(),
				email: t.String({ format: "email" }),
			}),
		},
	);
```

### 6. Service Layer Pattern

Keep routes thin, move logic to services:

```typescript
// services/user.service.ts
import { db } from "../db";
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

// modules/users/index.ts
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";
import { userService } from "../../services/user.service";
import { NotFoundError } from "@repo/elysia";

export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.get("/", () => userService.getAll())
	.get("/:id", async ({ params }) => {
		const user = await userService.getById(params.id);
		if (!user) throw new NotFoundError("User not found");
		return user;
	})
	.post(
		"/",
		async ({ body }) => {
			return await userService.create(body);
		},
		{
			body: t.Object({
				name: t.String(),
				email: t.String({ format: "email" }),
			}),
		},
	);
```

### 7. Environment Variables

Environment variables are already validated via `@repo/env`:

```typescript
// env.ts
import { apiEnvSchema } from "@repo/env";

export const env = apiEnvSchema.parse(process.env);

// Usage in any file
import { env } from "./env";

console.log(env.PORT);
console.log(env.DATABASE_URL);
console.log(env.JWT_SECRET);
```

Never access `process.env` directly. Always use the validated `env` object.

### 8. Error Handling

Errors are automatically handled by the `ErrorHandlerPlugin`. Use the provided
error classes from `@repo/elysia`:

```typescript
import { Elysia } from "elysia";
import { baseAuthApp } from "../../base-auth";
import {
	NotFoundError,
	UnauthorizedError,
	BadRequestError,
	ForbiddenError,
	UnprocessableEntityError,
} from "@repo/elysia";

export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.get("/:id", async ({ params }) => {
		const user = await getUserById(params.id);

		// Throw error for automatic handling
		if (!user) {
			throw new NotFoundError("User not found");
		}

		return user;
	})
	.post("/", async ({ body }) => {
		// Validate business logic
		const existingUser = await findUserByEmail(body.email);
		if (existingUser) {
			throw new BadRequestError("Email already exists", [
				{ field: "email", message: "This email is already registered" },
			]);
		}

		return await createUser(body);
	})
	.delete("/:id", async ({ params, user }) => {
		// Manual permission check
		if (user.id !== params.id && !user.roles.includes("admin")) {
			throw new ForbiddenError("You can only delete your own account");
		}

		const result = await deleteUser(params.id);
		if (!result) {
			throw new NotFoundError("User not found");
		}

		return { success: true };
	});
```

**Available Error Classes:**

```typescript
// 400 Bad Request
throw new BadRequestError("Invalid data", [
	{ field: "email", message: "Invalid email format" },
	{ field: "age", message: "Must be 18 or older" },
]);

// 401 Unauthorized
throw new UnauthorizedError("Invalid credentials");

// 403 Forbidden
throw new ForbiddenError("Insufficient permissions");

// 404 Not Found
throw new NotFoundError("Resource not found");

// 422 Unprocessable Entity
throw new UnprocessableEntityError("Validation failed", [
	{ field: "name", message: "Name is required" },
]);
```

**Error responses are automatically formatted:**

```json
{
	"status": 404,
	"success": false,
	"message": "User not found",
	"data": null
}
```

**For validation errors:**

```json
{
	"status": 422,
	"success": false,
	"message": "Validation failed",
	"errors": [
		{ "field": "email", "message": "Invalid email format" },
		{ "field": "age", "message": "Must be 18 or older" }
	]
}
```

### 9. Database Transactions

```typescript
import { db } from "../../db";
import { users, profiles } from "@repo/database/schema";

export const createUserWithProfile = async (
	userData: NewUser,
	profileData: NewProfile,
) => {
	return await db.transaction(async (tx) => {
		// Insert user
		const [user] = await tx.insert(users).values(userData).returning();

		// Insert profile
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

### 10. App Composition

```typescript
// index.ts
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { env } from "./env";

// Import modules
import { HomeModule } from "./modules/home";
import { AuthModule } from "./modules/auth";
import { UsersModule } from "./modules/users";
import { SettingsModule } from "./modules/settings";

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "API Documentation",
					version: "1.0.0",
					description: "Admin API",
				},
				tags: [
					{ name: "Auth", description: "Authentication endpoints" },
					{ name: "Users", description: "User management" },
					{ name: "Settings", description: "Settings management" },
				],
			},
		}),
	)
	.use(HomeModule)
	.use(AuthModule)
	.use(UsersModule)
	.use(SettingsModule)
	.listen(env.PORT);

console.log(`Server running at http://localhost:${env.PORT}`);
```

## Module Structure

Each module should follow this structure:

```typescript
// modules/users/index.ts
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";
import { userService } from "../../services/user.service";

export const UsersModule = new Elysia({ prefix: "/users", tags: ["Users"] })
	.use(baseAuthApp)
	.get("/", () => userService.getAll(), {
		detail: {
			summary: "Get all users",
			description: "Retrieve a list of all users",
		},
	})
	.get(
		"/:id",
		async ({ params }) => {
			const user = await userService.getById(params.id);
			if (!user) throw new NotFoundError("User not found");
			return user;
		},
		{
			params: t.Object({
				id: t.String({ format: "uuid" }),
			}),
			detail: {
				summary: "Get user by ID",
				description: "Retrieve a specific user by their ID",
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await userService.create(body);
		},
		{
			body: t.Object({
				name: t.String({ minLength: 2 }),
				email: t.String({ format: "email" }),
			}),
			detail: {
				summary: "Create user",
				description: "Create a new user",
			},
		},
	)
	.put(
		"/:id",
		async ({ params, body }) => {
			const user = await userService.update(params.id, body);
			if (!user) throw new NotFoundError("User not found");
			return user;
		},
		{
			params: t.Object({
				id: t.String({ format: "uuid" }),
			}),
			body: t.Object({
				name: t.Optional(t.String({ minLength: 2 })),
				email: t.Optional(t.String({ format: "email" })),
			}),
			detail: {
				summary: "Update user",
				description: "Update an existing user",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params }) => {
			await userService.delete(params.id);
			return { success: true };
		},
		{
			params: t.Object({
				id: t.String({ format: "uuid" }),
			}),
			detail: {
				summary: "Delete user",
				description: "Delete a user by ID",
			},
			rbac: {
				roles: ["admin"],
				permissions: ["users.delete"],
			},
		},
	);
```

## Best Practices

### 1. Always Use Base Instances

Never create raw Elysia instances. Always extend from `baseApp` or
`baseAuthApp`:

```typescript
// Good
export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.get("/", handler);

// Bad - missing plugins and error handling
export const UsersModule = new Elysia({ prefix: "/users" }).get("/", handler);
```

### 2. Module Organization

- One module per feature
- Each module in its own directory
- Export from `index.ts`
- Keep routes thin, logic in services

```
modules/
├── auth/
│   ├── index.ts          # Auth routes
│   └── auth.service.ts   # Auth logic
├── users/
│   ├── index.ts          # User routes
│   └── users.service.ts  # User logic
└── settings/
    ├── index.ts          # Settings routes
    └── settings.service.ts
```

### 3. Type Safety

Use shared types from `@repo/types`:

```typescript
import type { User, NewUser, UpdateUser } from "@repo/types";

// Type service methods
export class UserService {
	async getAll(): Promise<User[]> {
		// ...
	}

	async create(data: NewUser): Promise<User> {
		// ...
	}
}
```

### 4. Validation

Always validate request data with TypeBox:

```typescript
// Define validation schema
const createUserSchema = t.Object({
	name: t.String({ minLength: 2, maxLength: 100 }),
	email: t.String({ format: "email" }),
	age: t.Optional(t.Number({ minimum: 18 })),
});

// Apply to route
.post("/", handler, {
	body: createUserSchema
})
```

### 5. Documentation

Add Swagger documentation to routes:

```typescript
.get("/", handler, {
	detail: {
		summary: "Get all users",
		description: "Retrieve a list of all users in the system",
		tags: ["Users"],
	}
})
```

### 6. RBAC Usage

Apply RBAC where needed:

```typescript
// Role-based
.delete("/:id", handler, {
	rbac: { roles: ["admin"] }
})

// Permission-based
.get("/sensitive", handler, {
	rbac: { permissions: ["users.read.sensitive"] }
})

// Combined (either role OR permission)
.post("/", handler, {
	rbac: {
		roles: ["admin", "moderator"],
		permissions: ["users.create"]
	}
})
```

## Common Pitfalls

1. **Don't create raw Elysia instances** - Always use `baseApp` or `baseAuthApp`
2. **Don't access process.env directly** - Use the validated `env` object
3. **Don't handle errors manually** - Use error classes from `@repo/elysia`
4. **Don't use Zod** - This project uses TypeBox via Elysia's `t`
5. **Don't skip validation** - Always validate request data with TypeBox
6. **Don't put logic in routes** - Move business logic to services
7. **Keep routes thin** - Handler should be one-liners calling services
8. **Use TypeScript types** from `@repo/types` for consistency
9. **Import error classes** from `@repo/elysia`, not custom ones
10. **Use proper error classes** - BadRequestError, NotFoundError,
    UnauthorizedError, ForbiddenError, UnprocessableEntityError

## Available Plugins and Utilities

### Plugins (from `@repo/elysia`)

```typescript
import {
	// Plugins
	AuthPlugin,
	ErrorHandlerPlugin,
	LoggerPlugin,
	RequestPlugin,
	SecurityPlugin,

	// Error Classes
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	RateLimitError,
	UnauthorizedError,
	UnprocessableEntityError,

	// Guards
	requireRoles,
	requirePermissions,
} from "@repo/elysia";
```

**Plugin Descriptions:**

1. **RequestPlugin** - Adds `requestId` and `startedAt` to context
2. **SecurityPlugin** - Configures CORS, rate limiting, and security headers
3. **LoggerPlugin** - Automatic request/response logging with Pino
4. **ErrorHandlerPlugin** - Global error handling for all error types
5. **AuthPlugin** - JWT authentication with RBAC support

### Manual Permission Checks

If you need to check permissions manually inside a handler:

```typescript
import { requireRoles, requirePermissions } from "@repo/elysia";

export const UsersModule = new Elysia({ prefix: "/users" })
	.use(baseAuthApp)
	.post("/special-action", async ({ user, body }) => {
		// Manual role check
		requireRoles(user, ["admin", "moderator"]);

		// Manual permission check
		requirePermissions(user, ["users.special.action"]);

		// Proceed with action
		return await performSpecialAction(body);
	});
```

### Request Context

Every request has access to these properties:

```typescript
.get("/example", ({
	user,           // User information (if authenticated)
	requestId,      // Unique request ID
	startedAt,      // Request start timestamp
	log,            // Pino logger instance
	request,        // Raw Request object
	params,         // URL parameters
	query,          // Query string parameters
	body,           // Request body (validated if schema provided)
	headers,        // Request headers
}) => {
	log.info({ requestId }, "Processing request");
	return { success: true };
});
```

## Performance Tips

- Use `.select()` to fetch only needed columns
- Add database indexes for frequently queried fields
- Use transactions for multi-step operations
- Implement caching in services when needed
- Use proper RBAC to reduce unnecessary database queries
- Lazy load heavy dependencies

## Testing

```typescript
import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { UsersModule } from "./modules/users";

describe("Users Module", () => {
	it("should get all users", async () => {
		const app = new Elysia().use(UsersModule);
		const response = await app.handle(new Request("http://localhost/users"));

		expect(response.status).toBe(200);
		const users = await response.json();
		expect(Array.isArray(users)).toBe(true);
	});

	it("should create a user", async () => {
		const app = new Elysia().use(UsersModule);
		const response = await app.handle(
			new Request("http://localhost/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "John Doe",
					email: "john@example.com",
				}),
			}),
		);

		expect(response.status).toBe(200);
		const user = await response.json();
		expect(user.name).toBe("John Doe");
	});
});
```

## Development Workflow

1. **Check existing types** in `@repo/types` before creating new ones
2. **Check existing utilities** in `@repo/utils` before creating helpers
3. **Update database schema** in `@repo/database` if needed
4. **Generate and run migrations**: `bun run db:generate && bun run db:migrate`
5. **Create service** with business logic in `services/`
6. **Create module** in `modules/` using `baseApp` or `baseAuthApp`
7. **Add validation** with TypeBox schemas
8. **Add documentation** with Swagger detail
9. **Test endpoints** with Swagger UI at `/swagger`
10. **Write tests** in `*.test.ts` files

## Quick Reference

### Creating a Public Module

```typescript
import { Elysia, t } from "elysia";
import { baseApp } from "../../base";

export const PublicModule = new Elysia({ prefix: "/public" })
	.use(baseApp)
	.get("/", () => ({ message: "Public endpoint" }));
```

### Creating a Protected Module

```typescript
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";

export const ProtectedModule = new Elysia({ prefix: "/protected" })
	.use(baseAuthApp)
	.get("/", ({ user }) => ({ message: `Hello ${user.name}` }));
```

### Creating an Admin-Only Module

```typescript
import { Elysia, t } from "elysia";
import { baseAuthApp } from "../../base-auth";

export const AdminModule = new Elysia({ prefix: "/admin" })
	.use(baseAuthApp)
	.get("/", ({ user }) => ({ message: "Admin only" }), {
		rbac: { roles: ["admin"] },
	});
```
