# pool-reservation

## Stack

- **Next.js 16** / React 19 / TypeScript 6 / Tailwind CSS 4
- **pnpm** (workspace config at `pnpm-workspace.yaml`; use `pnpm add`, not npm/yarn)
- **Prisma 7** (PostgreSQL via `@prisma/adapter-pg`) — client generated to `lib/generated/prisma` (gitignored)
- **Better Auth** with email/password, Prisma adapter
- **shadcn** (style: `base-lyra`, icon library: Tabler) + **Base UI React** for primitives
- Fonts: Geist (sans + mono), JetBrains Mono (mono)

## Commands

```bash
pnpm dev          # next dev  — http://localhost:3000
pnpm build        # next build
pnpm lint         # eslint
pnpm db:generate  # prisma generate — outputs to lib/generated/prisma
pnpm db:push      # prisma db push
```

Run `pnpm db:generate` before using the client after schema changes.

## Key files

| Purpose | Path |
|---|---|
| Auth server | `lib/auth.ts` |
| Auth client | `lib/auth-client.ts` |
| DB client | `lib/db.ts` (singleton + PrismaPg adapter) |
| Prisma schema | `prisma/schema.prisma` (models: User, Session, Account, Verification) |
| Auth route handler | `app/api/auth/[...all]/route.ts` |
| CSS entry | `app/globals.css` (Tailwind v4 + shadcn + tw-animate-css) |
| Utils | `lib/utils.ts` (`cn` helper via clsx + tailwind-merge) |
| UI primitives | `components/ui/` (uses `@base-ui/react`, not Radix) |
| Shell/layout | `components/shell/` |
| Dashboard primitives | `components/dashboard/` (generic cards, skeletons, delta) |
| Shared utilities | `components/shared/` (logo, formatting, decor icons) |

## Conventions

- Path alias `@/*` maps to `./*` (e.g. `@/lib/utils`, `@/components/ui`)
- No test infrastructure exists yet
- `.env` is committed (contains `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`)
- No git history (fresh repo, no commits)
