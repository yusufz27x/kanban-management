# Kanban Task Management

A personal Kanban-style task manager. Each user signs in with email and password and manages an isolated task list with priorities, statuses, optional due dates, filters, drag-and-drop status changes, Realtime updates, and a revocable read-only public link.

**Live demo:** [kanban-management-three.vercel.app](https://kanban-management-three.vercel.app)

**Repository:** [github.com/yusufz27x/kanban-management](https://github.com/yusufz27x/kanban-management)

## Features

- Email/password sign-up, confirmation, sign-in, and sign-out with Supabase Auth
- Protected task dashboard for authenticated users
- Create, view, edit, move, filter, and delete tasks
- `todo`, `in_progress`, and `done` Kanban columns
- `low`, `medium`, and `high` priorities
- Optional calendar due dates with overdue and due-soon indicators
- Status, priority, overdue, and due-soon filters
- Drag-and-drop status changes, with the edit form as a keyboard-accessible alternative
- Optimistic status moves and pending/error feedback
- Realtime refreshes across sessions
- Revocable, high-entropy, read-only public task-list links
- Responsive layouts plus intentional loading, error, empty, and not-found states
- Client-side HTML validation and server-side Zod validation

The application is deliberately single-user in scope: there are no teams, organizations, assignments, comments, or collaboration features.

## Tech stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, Row Level Security, and Realtime Broadcast
- Zod 4
- pnpm
- Vercel

## Local setup

### Prerequisites

- Node.js 20.9 or newer
- pnpm 11
- A Supabase project, or Docker and the Supabase CLI for the local stack

### Install and configure

```bash
git clone https://github.com/yusufz27x/kanban-management.git
cd kanban-management
pnpm install
cp .env.example .env.local
```

Fill `.env.local` with values from the Supabase project's **Connect** dialog:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is intentionally available to the browser. It is not a privileged credential; authorization is enforced by Postgres grants and RLS. This project does not use a service-role key.

### Apply the database migrations

For a hosted Supabase project:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push --dry-run
supabase db push
```

For the local Supabase stack:

```bash
supabase start
supabase db reset
```

Use the local API URL and publishable/anonymous key printed by `supabase status` in `.env.local`. The existing migrations create the tables, constraints, indexes, triggers, grants, RLS policies, public sharing model, and Realtime authorization.

For local email confirmations, open Mailpit at `http://127.0.0.1:54324`. The local Auth configuration permits `http://localhost:3000/auth/confirm`.

### Run the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database and RLS approach

### Task ownership

Every task has a non-null `user_id` referencing `auth.users(id)` with `on delete cascade`. The column defaults to `auth.uid()`, and clients are not granted permission to insert or update it. Priority and status use text columns with `CHECK` constraints; this keeps the migration and generated TypeScript union types simple while still rejecting invalid database values.

RLS is enabled on `tasks`. Policies enforce:

- `SELECT`: `auth.uid() = user_id`
- `INSERT`: the new row's `user_id` must equal `auth.uid()`
- `UPDATE`: both the existing and resulting row must belong to `auth.uid()`
- `DELETE`: the row must belong to `auth.uid()`

Application queries also include `user_id` filters for clarity and query efficiency, but those filters are not treated as an authorization boundary. RLS remains the final database-level protection if a query or Server Action is changed incorrectly.

The database additionally restricts column-level grants. Authenticated clients cannot set ownership or timestamps, and anonymous clients cannot read `user_id` or share tokens.

### Public sharing

`task_shares` stores one random UUID token per user. Owners can enable, disable, or regenerate it. Token regeneration is implemented by a narrowly granted `security definer` function that derives ownership from `auth.uid()`.

The public page creates a server-only Supabase client and supplies the URL token through an `x-task-share-token` PostgREST request header. A private SQL helper validates that header and resolves an owner only when the token exists and is enabled. Anonymous RLS policies can then expose only:

- the matching share's `enabled` flag; and
- the matching owner's permitted task columns.

Anonymous users receive no insert, update, or delete grants. They also cannot list all enabled shares: a request without a matching high-entropy token resolves no owner and therefore returns no rows. No service-role bypass is used.

Disabling a share immediately makes its HTTP reads fail RLS. Regenerating it invalidates the previous token.

## Architecture decisions

### Server Actions for mutations

Task and sharing mutations use Server Actions because the forms live in the App Router and do not need a separate public API. Every action:

1. verifies the Supabase session on the server;
2. validates untrusted input with Zod;
3. derives the user ID from verified claims;
4. performs an RLS-protected database operation;
5. checks the returned Supabase error/result; and
6. revalidates `/tasks` after success.

Route Handlers are used where HTTP semantics are useful: exchanging the email confirmation code and returning a `303` after logout.

### Server and Client Components

Server Components own authentication checks and initial database reads. Client Components are limited to interactive concerns: forms, filters, dialogs, drag-and-drop, optimistic state, clipboard access, local-date calculation, and the Realtime subscription.

Filtering is local because this is a personal, deliberately small task list. It provides instant combinations of status, priority, overdue, and due-soon filters without extra requests. Pagination would be the point at which filtering should move to the database.

### Validation and errors

Native form attributes provide immediate browser validation (`required`, input types, minimum/maximum lengths). Shared Zod schemas repeat all security-relevant validation on the server. SQL constraints provide a final integrity layer.

Expected errors are converted to actionable messages. Unexpected database errors are logged server-side without exposing SQL details, keys, or stack traces to users. App Router loading, error, and not-found boundaries provide route-level fallback UI.

### Due dates

`due_date` is a Postgres `date`, not a timestamp, because it represents a calendar deadline rather than an instant. The UI parses and formats `YYYY-MM-DD` in the visitor's local calendar, preventing the common UTC conversion that shifts a displayed date by one day. Completed tasks are never marked overdue.

## Realtime

Task triggers broadcast changes to a private `tasks:<user-id>` topic. The `realtime.messages` SELECT policy permits a signed-in user to join only the topic containing their own `auth.uid()`.

Enabled public shares receive a second private broadcast on `task-share:<share-token>`. Its Realtime policy validates that the token still maps to an enabled share. Share disablement, deletion, and regeneration broadcast a final refresh event to the previous token so an open public page becomes unavailable promptly.

The client subscribes once per topic, listens for insert/update/delete/change events, debounces `router.refresh()`, reports connection state, and removes the channel during cleanup. Supabase's automatic reconnect behavior handles temporary connection loss.

In the hosted Supabase project, **Allow public access** is disabled under Realtime Settings so channel joins are subject to the private-channel authorization policies.

## Deployment

The production application is deployed on Vercel at [kanban-management-three.vercel.app](https://kanban-management-three.vercel.app).

Required Vercel environment variables:

```dotenv
NEXT_PUBLIC_SITE_URL=https://kanban-management-three.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The hosted Supabase Auth URL Configuration must contain:

- Site URL: `https://kanban-management-three.vercel.app`
- Local redirect allowlist: `http://localhost:3000/**`
- Production redirect allowlist: `https://kanban-management-three.vercel.app/**`
- Vercel previews: `https://*-yusuf-zeybeks-projects.vercel.app/**`

After changing any `NEXT_PUBLIC_*` value in Vercel, redeploy because public environment variables are included in the application build.

To deploy from the CLI:

```bash
vercel link
vercel deploy --prod
```

The GitHub repository is also connected to the Vercel project for deployments from pushed commits.

## Verification

The submission was checked with:

```bash
pnpm lint
pnpm build
pnpm audit --prod
```

ESLint, TypeScript, and the Next.js production build pass. The production dependency audit reports no known vulnerabilities. The Vercel production build also passes.

Read-only security probes against the hosted Supabase API confirmed that anonymous requests without a token or with a random token return no task/share rows, while direct attempts to select `tasks.user_id` or `task_shares.token` are rejected by PostgreSQL permissions.

## Tradeoffs and consciously omitted work

- No automated test suite was added for the project. Core authenticated CRUD, two-user isolation, sharing/revocation, and two-session Realtime behavior were manually exercised during development.
- The dashboard loads a user's task list at once. There is no pagination or virtualization for unusually large lists.
- Filters are intentionally local and are not persisted in the URL.
- Operational error reporting is limited to server/browser logs; no third-party observability service is configured.
- Public links rely on unguessable bearer tokens and do not have separate request rate limiting beyond the platform defaults.

## Migration overview

- `202609030001_create_tasks.sql`: tasks, constraints, indexes, timestamp trigger, grants, and owner RLS
- `202609040001_create_task_shares.sql`: share tokens, token-aware anonymous reads, owner RLS, and column grants
- `202609040002_enable_task_realtime.sql`: authenticated owner-topic authorization and database broadcasts
- `202609040003_enable_shared_task_realtime.sql`: share-topic authorization and revocation broadcasts
- `202609040004_allow_shared_task_updated_order.sql`: anonymous ordering grant for shared boards
