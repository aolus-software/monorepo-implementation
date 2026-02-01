# Frontend Development Instructions (Next.js)

## Next.js App Router Fundamentals

This project uses **Next.js 16** with the **App Router** (not Pages Router). All routes are defined in the `app/` directory using the file-system based routing.

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
│   └── (auth)/                 # Route groups
│       ├── login/
│       └── register/
├── components/                 # App-specific components
│   ├── forms/                  # Form components
│   ├── layouts/                # Layout components
│   └── tables/                 # Table components
├── lib/                        # Utilities
│   ├── api/                    # API client functions
│   ├── utils.ts                # Utility functions
│   └── hooks/                  # Custom hooks
├── public/                     # Static assets
├── package.json
└── tsconfig.json
```

**Important:** Backend API routes are handled by Elysia apps (`api-admin`, `api-user`), not Next.js API routes.

## Before Creating New Code

**ALWAYS check existing packages first:**

1. **Check `packages/types`** before creating new types or interfaces
   - Look in `packages/types/src/` for existing type definitions
   - Reuse existing types from `@repo/types` instead of duplicating

2. **Check `packages/utils`** before creating utility functions
   - Look in `packages/utils/src/` for existing utilities
   - Available categories: date, number, security, string
   - Reuse existing utilities from `@repo/utils` instead of recreating

3. **Check `packages/ui`** before creating UI components
   - Look in `packages/ui/src/components/` for existing components
   - Use shadcn/ui components from `@repo/ui` package
   - Only create new components if they don't exist

## Core Patterns

### 1. Server Components (Default)

```typescript
// app/users/page.tsx
import { getUsers } from "@/lib/api/users";

// This is a Server Component (default)
export default async function UsersPage() {
  // Fetch data from Elysia backend
  const allUsers = await getUsers();

  return (
    <div>
      <h1>Users</h1>
      <UserList users={allUsers} />
    </div>
  );
}

// Server Components can be async
// No useState, useEffect, or event handlers
// All API calls go to Elysia backend
```

### 2. Client Components

```typescript
// components/user-form.tsx
"use client"; // Mark as Client Component

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@repo/ui";
import { createUser } from "@/lib/api/users";

export function UserForm() {
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setName("");
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

**Note:** All API calls go to Elysia backend servers, not Next.js API routes.

```typescript
// lib/api/users.ts
import type { User, NewUser } from "@repo/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      "Authorization": `Bearer ${getAuthToken()}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function createUser(data: NewUser): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
}

function getAuthToken(): string | null {
  // Get token from cookies or localStorage
  return localStorage.getItem("token");
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

### 6. Forms with Zod Validation

Use Zod for client-side and server-side validation:

```typescript
// lib/validations/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// components/forms/user-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@repo/ui";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";
import { createUser } from "@/lib/api/users";

export function UserForm() {
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      form.reset();
      // Show success toast
    },
  });

  function onSubmit(data: CreateUserInput) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
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

### 8. Styling with Tailwind CSS and shadcn/ui

Use Tailwind CSS utility classes and shadcn/ui components from `@repo/ui`:

```typescript
// Using shadcn/ui components
import { Button, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { cn } from "@repo/utils";
import type { User } from "@repo/types";

export function UserCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardContent>
    </Card>
  );
}

// Custom component with Tailwind CSS
export function CustomButton({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors font-medium",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}
```

### 9. Using Icons (Tabler Icons)

Use Tabler Icons for all icon needs:

```typescript
// Install: bun add @tabler/icons-react
import { IconUser, IconMail, IconSettings, IconLogout, IconPlus } from "@tabler/icons-react";
import { Button } from "@repo/ui";

export function UserProfile({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconUser className="h-5 w-5 text-muted-foreground" />
        <span>{user.name}</span>
      </div>

      <div className="flex items-center gap-2">
        <IconMail className="h-5 w-5 text-muted-foreground" />
        <span>{user.email}</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <IconSettings className="h-4 w-4 mr-2" />
          Settings
        </Button>

        <Button variant="destructive" size="sm">
          <IconLogout className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

// Icon button
export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} size="icon">
      <IconPlus className="h-4 w-4" />
    </Button>
  );
}
```

**Icon Sizing Guidelines:**
- Small icons (buttons, inline): `h-4 w-4` (16px)
- Medium icons (list items): `h-5 w-5` (20px)
- Large icons (headers, cards): `h-6 w-6` (24px)
- Extra large icons (empty states): `h-8 w-8` or larger

### 10. Custom Hooks

Before creating custom hooks, check `@repo/utils` for existing utilities:

```typescript
// lib/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, deleteUser } from "@/lib/api/users";
import type { User, NewUser } from "@repo/types";

export function useUsers() {
	return useQuery<User[]>({
		queryKey: ["users"],
		queryFn: getUsers,
	});
}

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation<User, Error, NewUser>({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

// Usage in component
"use client"
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
		},Always Check Existing Packages First

Before creating any new code:
- **Types**: Check `@repo/types` first
- **Utilities**: Check `@repo/utils` first  
- **UI Components**: Check `@repo/ui` first
- **Only create new code if it doesn't already exist**

### 2. Server vs Client Components

**Use Server Components for:**

- Pages that fetch data
- Layouts
- Static content
- SEO-critical content
- Authentication checks

**Us3. Data Fetching Strategy

All API calls go to Elysia backend servers:

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// lib/api/users.ts
import { apiClient } from "./client";
import type { User, NewUser } from "@repo/types";

export const getUsers = () => apiClient<User[]>("/users");

export const createUser = (data: NewUser) =>
  apiClient<User>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

// app/users/page.tsx (Server Component)
import { getUsers } from "@/lib/api/users";

async function getUsersData() {
  return await getUsers();
}

export default async function UsersPage() {
  const users = await getUsersData();
  return <UsersList initialData={users} />;
}

// c6mponents/users-list.tsx (Client Component)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/api/users
## B4. Environment Variables

```typescript
// Access client-side env vars (must be prefixed with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side env vars (in Server Components only)
const secretKey = process.env.SECRET_KEY;

// Note: Database access should be done through Elysia backend APIs, not directly in Next.js
- St5. Image Optimization

```typescript
import Image from "next/image";
import { IconUser } from "@tabler/icons-react";

export function UserAvatar({ 
  src, 
  alt, 
  size = 48 
}: { 
  src?: string; 
  alt: string;
  size?: number;
}) {
  // Fallback icon if no image
  if (!src) {
    return (
      <div className="flex items-center justify-center rounded-full bg-muted">
        <IconUser className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      priority={false}
```typescript
// Good: Fetch on server, pass to client
Access server-side env vars (in Server Components or API routes)
const dbUrl = process.env.DATABASE_URL;
```

### 4. Image Optimization

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

1. **Don't create Next.js API routes** - Use Elysia backend for all APIs
2. **Don't access database directly** - Call Elysia APIs instead
3. **Always check existing packages** - `@repo/types`, `@repo/utils`, `@repo/ui` before creating new code
4. **Don't use "use client" unnecessarily** - Server Components are more performant
5. **Don't fetch data in Client Components** when you can fetch on the server
6. **Remember env var prefix** - Client-side vars need `NEXT_PUBLIC_` prefix
7. **Don't mix async with "use client"** - Client Components can't be async
8. **Use Tabler Icons** - Not other icon libraries
9. **Use shadcn/ui components** - From `@repo/ui` package
10. **Use Zod for validation** - Not other validation libraries

## Performance Tips

- Use Server Components by default
- Implement proper loading states with `loading.tsx`
- Use `<Suspense>` for granular loading states
- Optimize images with Next.js Image component
- Use dynamic imports for large client-side libraries
- Use React Query for client-side caching
- Call Elysia backend APIs - never access database directly
- Reuse components from `@repo/ui` to reduce bundle size

## Development Workflow

1. **Check existing packages** - `@repo/types`, `@repo/utils`, `@repo/ui` first
2. **Define routes** in `app/` directory
3. **Create layouts** for shared UI
4. **Build components** - Use `@repo/ui`, Server Components first, Client when needed
5. **Add icons** - Use Tabler Icons
6. **Add validation** - Use Zod schemas in `lib/validations/`
7. **Implement data fetching** - Create API client functions, use React Query
8. **Add loading/error states** - Use `loading.tsx` and `error.tsx`
9. **Style with Tailwind CSS** and shadcn/ui components
10. **Test in development**: `bun run dev`
11. **Type-check**: `bun run typecheck`
12. **Build**: `bun run build`
