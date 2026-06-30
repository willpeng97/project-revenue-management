<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single product: a Next.js 16 (App Router) + Prisma + PostgreSQL full-stack app. The Next.js dev server is the only runnable service; PostgreSQL is the one required external dependency. Standard commands live in `package.json`/`README.md`.

### Starting the environment
- PostgreSQL runs locally (installed in the VM snapshot, but it does NOT auto-start). Start it each session with: `sudo pg_ctlcluster 16 main start`.
- Local DB is `m122` (role `postgres` / password `postgres`). The repo `.env` (gitignored) already points `DATABASE_URL` at it and sets dev `JWT_SECRET`/`JWT_REFRESH_SECRET`. If `.env` is missing, recreate it from `.env.example` with `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/m122"`.
- Run the app with `npm run dev` (http://localhost:3000/login). `npm run lint` for lint.

### Non-obvious gotchas
- `prisma/seed.ts` is an incomplete stub (no inserts), so `npm run db:seed` does nothing. The README's test accounts (`admin@m122.com` … `finance@m122.com`, password `password123`) must be created manually. Create users with `prisma.user.upsert` against the seeded fields (`email`, `name`, `role`, bcrypt-hashed `password`); the existing accounts are already in the local DB.
- `npm run build` runs `prisma generate && prisma db push && next build`, so it needs a live `DATABASE_URL` (and a running Postgres) — it is not a DB-free build.
- After editing `prisma/schema.prisma`, run `npx prisma db push` to sync the local DB (no migration files are committed).
- Auth API responses are NOT wrapped in a `data` envelope — `/api/auth/login` returns `{ user, accessToken, refreshToken }` directly. Other resource routes return the entity directly. Pass the JWT as `Authorization: Bearer <accessToken>` (or the `access_token` cookie) on protected routes.
