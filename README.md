# TimeLog Web

Family-facing web console for browsing, playing, and managing private stories recorded in TimeLog.

## Tooling

- Node.js 20.19.0
- pnpm 10.33.0
- Next.js 16.2.2
- React 19.2.4

If pnpm is not already available, enable it with Corepack:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

## Environment

Create `.env` from `.env.example` and provide:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Do not expose privileged secrets with a `NEXT_PUBLIC_` prefix.

## Development

```bash
pnpm install
pnpm dev
pnpm dev:host
```

`pnpm dev` uses webpack by default. This is intentional: on some Windows + pnpm setups, Turbopack can mis-detect the project root and fail to resolve `tailwindcss`, causing runaway CPU or memory pressure. Use `pnpm dev:turbo` only when you explicitly want to validate Turbopack behavior.

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## CI

GitHub Actions runs the same `pnpm` quality gates defined locally:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Workflow file:

- `.github/workflows/ci.yml`

## User Role Management

### Appointing Administrators

By default, all new users are registered as `family_member` role. To appoint administrators:

#### Method 1: Through Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **profiles** table
3. Find the user you want to make admin
4. Change the `role` field to `family_owner`
5. Save the changes

#### Method 2: First User Auto-Admin
The first user to sign in after system initialization automatically becomes an administrator.

#### Method 3: Through Application (Admin Only)
Administrators can use the "管理角色" (Manage Role) button in the Family page to change other users' roles.

#### Method 4: SQL Script (Direct Database Access)
Use the provided `supabase-role-management.sql` script in your Supabase SQL Editor:

1. Copy the contents of `supabase-role-management.sql`
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run the desired commands
4. Replace `'user-id-here'` with actual user IDs

**Example**: Make a user admin by their email:
```sql
UPDATE profiles
SET role = 'family_owner'
WHERE email = 'your-admin-email@example.com';
```

### Available Roles
- `family_owner`: Administrator with full access
- `family_member`: Regular family member with standard access
- `guest`: Limited access (not currently used)

## Deployment

Vercel will auto-detect `pnpm` from `pnpm-lock.yaml`. The repo also includes an explicit deploy contract in `vercel.json`:

- `pnpm install --frozen-lockfile`
- `pnpm build`
