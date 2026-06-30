<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single product: a Next.js 16 (App Router) + Prisma + PostgreSQL full-stack app. The Next.js dev server is the only runnable service; PostgreSQL is the one required external dependency. Standard commands live in `package.json`/`README.md`.

### Database & secrets
- The database is **Neon (cloud) PostgreSQL**, provided via the injected Cloud Agent secrets `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. No local Postgres is needed.
- Gotcha: injected secrets are present in the agent's own shell, but **`tmux`/login shells do NOT inherit them**. The app therefore reads them from a gitignored `.env` file. Keep `.env` in sync with the injected secrets — regenerate it from the current environment with:
  ```bash
  { printf 'DATABASE_URL="%s"\n' "$DATABASE_URL"; printf 'JWT_SECRET="%s"\n' "$JWT_SECRET"; printf 'JWT_REFRESH_SECRET="%s"\n' "$JWT_REFRESH_SECRET"; } > .env
  ```
  Run this (from a shell that has the injected secrets) if DB connections fail or after secrets rotate, then restart the dev server.

### Starting the environment
- Run the app with `npm run dev` (http://localhost:3000/login). `npm run lint` for lint.

### Non-obvious gotchas
- `prisma/seed.ts` is an incomplete stub (no inserts), so `npm run db:seed` does nothing. The README's test accounts (`admin@m122.com` … `finance@m122.com`, password `password123`) must be created manually. Create users with `prisma.user.upsert` against the seeded fields (`email`, `name`, `role`, bcrypt-hashed `password`); these accounts already exist in the Neon DB.
- `npm run build` runs `prisma generate && prisma db push && next build`, so it needs a reachable `DATABASE_URL` — it is not a DB-free build.
- After editing `prisma/schema.prisma`, run `npx prisma db push` to sync the Neon DB (no migration files are committed).
- Auth API responses are NOT wrapped in a `data` envelope — `/api/auth/login` returns `{ user, accessToken, refreshToken }` directly. Other resource routes return the entity directly. Pass the JWT as `Authorization: Bearer <accessToken>` (or the `access_token` cookie) on protected routes.
