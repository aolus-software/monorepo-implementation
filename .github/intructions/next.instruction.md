# Frontend Development Instructions (Next.js)

## Next.js App Router Fundamentals

This project uses **Next.js 16** with the **App Router** (not Pages Router). All
routes are defined in the `app/` directory using the file-system based routing.

## Project Structure (Frontend Apps)

```
apps/web-{admin|user}/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (/)
│   ├── globals.css             # Global styles
│   ├── dashboard/              # /dashboard route
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Dashboard page
│   │   └── users/              # /dashboard/users
│   │       └── page.tsx
│   └── api/                    # API routes
│       └── auth/
│           └── route.ts
├── components/                 # Shared components
│   ├── ui/                     # UI components
│   ├── forms/
│   └── layouts/
├── lib/                        # Utilities
│   ├── api/                    # API client functions
│   ├── utils.ts
│   └── hooks/                  # Custom hooks
├── public/                     # Static assets
├── package.json
└── tsconfig.json
```

## Core Patterns

### 1. Server Components (Default)

```typescript
// app/users/page.tsx
import { db } from "@repo/database";
import { users } from "@repo/database/schema";

// This is a Server Component (default)
export default async function UsersPage() {
  // Fetch data directly on the server
  const allUsers = await db.select().from(users);

  return (
    <div>
      <h1>Users</h1>
      <UserList users={allUsers} />
    </div>
  );
}

// Server Components can be async
// No useState, useEffect, or event handlers
// Direct database access is allowed
```

### 2. Client Components

```typescript
// components/user-form.tsx
"use client"; // Mark as Client Component

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@repo/ui";

export function UserForm() {
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ name });
    }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

// Client Components:
// - Use "use client" directive
// - Can use hooks (useState, useEffect, etc.)
// - Can have event handlers
// - No async/await in component function
```

### 3. Layouts

```typescript
// app/layout.tsx (Root Layout)
import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing users",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx (Nested Layout)
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

### 4. Loading and Error States

```typescript
// app/users/loading.tsx
export default function Loading() {
  return <div>Loading users...</div>;
}

// app/users/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/users/not-found.tsx
export default function NotFound() {
  return <div>User not found</div>;
}
```

### 5. Data Fetching with TanStack Query

```typescript
// lib/api/users.ts
export async function getUsers() {
  const response = await fetch("http://localhost:3001/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function createUser(data: { name: string; email: string }) {
  const response = await fetch("http://localhost:3001/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
}

// components/users-list.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser } from "@/lib/api/users";

export function UsersList() {
  const queryClient = useQueryClient();

  // Query
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 6. Forms with Server Actions

```typescript
// app/users/actions.ts
"use server";

import { db } from "@repo/database";
import { users } from "@repo/database/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUserAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  };

  // Validate
  const validated = createUserSchema.parse(data);

  // Insert into database
  await db.insert(users).values(validated);

  // Revalidate the page
  revalidatePath("/users");

  return { success: true };
}

// app/users/page.tsx
import { createUserAction } from "./actions";

export default function UsersPage() {
  return (
    <form action={createUserAction}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Create User</button>
    </form>
  );
}
```

### 7. React Query Provider

```typescript
// components/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Use in app/layout.tsx
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

### 8. Styling with Tailwind CSS

```typescript
// Using utility classes
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
      {children}
    </button>
  );
}

// Using cn() utility for conditional classes
import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "outline" && "border border-blue-600 text-blue-600 hover:bg-blue-50"
      )}
    >
      {children}
    </button>
  );
}
```

### 9. Using Shared UI Components

```typescript
// Import from @repo/ui package
import { Button, Input, Card } from "@repo/ui";

export function UserForm() {
  return (
    <Card>
      <form className="space-y-4">
        <Input
          name="name"
          placeholder="Enter name"
        />
        <Input
          name="email"
          type="email"
          placeholder="Enter email"
        />
        <Button type="submit">Create User</Button>
      </form>
    </Card>
  );
}
```

### 10. Custom Hooks

```typescript
// lib/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, deleteUser } from "@/lib/api/users";

export function useUsers() {
	return useQuery({
		queryKey: ["users"],
		queryFn: getUsers,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

// Usage in component
("use client");

import { useUsers, useCreateUser } from "@/lib/hooks/use-users";

export function UsersList() {
	const { data: users, isLoading } = useUsers();
	const createUser = useCreateUser();

	// ...
}
```

## Best Practices

### 1. Server vs Client Components

**Use Server Components for:**

- Pages that fetch data
- Layouts
- Static content
- Direct database access
- Authentication checks

**Use Client Components for:**

- Interactive elements (forms, buttons with onClick)
- State management (useState, useReducer)
- Effects (useEffect, useLayoutEffect)
- Event handlers
- Browser APIs (localStorage, window, etc.)

### 2. Data Fetching Strategy

```typescript
// ✅ Good: Fetch on server, pass to client
// app/users/page.tsx (Server Component)
async function getUsersData() {
  const response = await fetch("http://localhost:3001/users", {
    cache: "no-store", // or next: { revalidate: 60 }
  });
  return response.json();
}

export default async function UsersPage() {
  const users = await getUsersData();

  return <UsersList initialData={users} />;
}

// components/users-list.tsx (Client Component)
"use client";

export function UsersList({ initialData }) {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    initialData,
  });

  return <div>{/* Render users */}</div>;
}
```

### 3. Environment Variables

```typescript
// Access client-side env vars (must be prefixed with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Access server-side env vars (in Server Components or API routes)
const dbUrl = process.env.DATABASE_URL;
```

### 4. Image Optimization

```typescript
import Image from "next/image";

export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="rounded-full"
      priority={false} // Set true for above-the-fold images
    />
  );
}
```

### 5. Metadata

```typescript
// Static metadata
export const metadata = {
	title: "Users",
	description: "Manage users",
};

// Dynamic metadata
export async function generateMetadata({ params }) {
	const user = await getUser(params.id);

	return {
		title: user.name,
		description: `Profile of ${user.name}`,
	};
}
```

### 6. Route Handlers (API Routes)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/database";
import { users } from "@repo/database/schema";

export async function GET(request: NextRequest) {
	const allUsers = await db.select().from(users);
	return NextResponse.json(allUsers);
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const [user] = await db.insert(users).values(body).returning();
	return NextResponse.json(user, { status: 201 });
}

// app/api/users/[id]/route.ts
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const user = await db.query.users.findFirst({
		where: eq(users.id, params.id),
	});

	if (!user) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(user);
}
```

### 7. Error Boundaries

```typescript
// app/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### 8. Suspense Boundaries

```typescript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<div>Loading users...</div>}>
        <UsersList />
      </Suspense>

      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>
    </div>
  );
}
```

## Common Patterns

### Optimistic Updates

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function TodoList() {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateTodo,
		onMutate: async (newTodo) => {
			// Cancel ongoing queries
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			// Snapshot previous value
			const previousTodos = queryClient.getQueryData(["todos"]);

			// Optimistically update
			queryClient.setQueryData(["todos"], (old) => [...old, newTodo]);

			return { previousTodos };
		},
		onError: (err, newTodo, context) => {
			// Rollback on error
			queryClient.setQueryData(["todos"], context.previousTodos);
		},
		onSettled: () => {
			// Refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
}
```

### Pagination

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function UsersList() {
  const [page, setPage] = useState(1);

  const { data, isPreviousData } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers(page),
    keepPreviousData: true,
  });

  return (
    <div>
      {data?.users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}

      <button
        onClick={() => setPage((old) => Math.max(old - 1, 1))}
        disabled={page === 1}
      >
        Previous
      </button>

      <button
        onClick={() => setPage((old) => old + 1)}
        disabled={isPreviousData || !data?.hasMore}
      >
        Next
      </button>
    </div>
  );
}
```

## Common Pitfalls

1. **Don't use "use client" unnecessarily** - Server Components are more
   performant
2. **Don't fetch data in Client Components** when you can fetch on the server
3. **Don't forget cache strategies** - Use `cache: "no-store"` or `revalidate`
   appropriately
4. **Remember env var prefix** - Client-side vars need `NEXT_PUBLIC_` prefix
5. **Don't mix async with "use client"** - Client Components can't be async
6. **Use the Image component** for images, not `<img>`
7. **Prefer Server Actions** over API routes for mutations when possible

## Performance Tips

- Use Server Components by default
- Implement proper loading states with `loading.tsx`
- Use `<Suspense>` for granular loading states
- Optimize images with Next.js Image component
- Use dynamic imports for large client-side libraries
- Implement proper caching strategies
- Use React Query for client-side caching

## Development Workflow

1. **Define routes** in `app/` directory
2. **Create layouts** for shared UI
3. **Build components** - Server Components first, Client when needed
4. **Add shared components** to `@repo/ui` if reusable across apps
5. **Implement data fetching** - Server Components or React Query
6. **Add loading/error states**
7. **Style with Tailwind** CSS
8. **Test in development**: `bun run dev`
9. **Type-check**: `bun run typecheck`
10. **Build**: `bun run build`
