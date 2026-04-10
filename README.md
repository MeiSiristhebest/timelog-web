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

## Deployment

Vercel will auto-detect `pnpm` from `pnpm-lock.yaml`. The repo also includes an explicit deploy contract in `vercel.json`:

- `pnpm install --frozen-lockfile`
- `pnpm build`
