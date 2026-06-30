# Objective

Refactor the entire authentication system from custom JWT authentication to Clerk + Microsoft Entra ID (Azure AD) SSO.

This is an internal enterprise application.
There is NO requirement to support username/password authentication anymore.

All users are employees of Systex Software.

Authentication must be fully delegated to Clerk + Microsoft Entra ID.

The application must only allow users from our Microsoft Entra tenant.

Do NOT implement a hybrid authentication system.
Remove the existing local authentication implementation completely.

---

# Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma
- PostgreSQL
- Clerk
- Microsoft Entra ID

---

# Goals

Replace

Custom Login
↓

bcrypt

↓

JWT

↓

Refresh Token

↓

Middleware

with

Microsoft Login

↓

Clerk

↓

Session

↓

Prisma User

↓

Role Authorization

---

# High Level Architecture

Authentication

Microsoft Entra ID
↓

Clerk
↓

Session

Authorization

Database(User)
↓

Role
↓

Permission

Business logic MUST NOT directly depend on Clerk.

Create an authentication abstraction layer under:

src/lib/auth

---

# Requirements

## 1. Install Clerk

Configure Clerk for App Router.

Use Clerk middleware.

Protect all authenticated routes.

Replace the current middleware if necessary.

---

## 2. Microsoft SSO

Enable Microsoft provider.

Only Microsoft login should be available.

No Email/Password login.

---

## 3. Restrict Company Accounts

Only allow users belonging to our Microsoft Entra tenant.

Validate Tenant ID instead of only checking email domain.

Also verify email ends with:

@systexsoftware.com.tw

Return HTTP 403 for unauthorized users.

---

## 4. Remove Local Authentication

Delete:

- Login API
- Logout API
- Refresh Token API
- Password hashing
- JWT generation
- JWT verification
- Refresh token storage
- bcrypt usage

Remove unused packages.

---

## 5. Prisma Schema

Update User model.

Remove

- password
- refreshToken

Add

- clerkId (unique)
- email
- name
- role
- lastLoginAt

Keep existing business fields.

Do NOT recreate unrelated models.

Generate migration.

---

## 6. User Synchronization

On first successful login:

If user does not exist

→ create user

If exists

→ update

- name
- email
- lastLoginAt

Never create duplicate users.

Use Clerk User ID as unique identity.

---

## 7. Authorization Layer

Create

src/lib/auth/

Including:

current-user.ts

require-auth.ts

require-role.ts

sync-user.ts

permissions.ts

The rest of the application should import from this layer instead of using Clerk APIs directly.

No business code should call Clerk directly.

---

## 8. API Refactor

Refactor every protected API.

Replace

verifyJWT()

with

requireAuth()

Return

401

when unauthenticated.

Return

403

when authenticated but insufficient permission.

---

## 9. Frontend

Replace Login page.

Show

"Sign in with Microsoft"

using Clerk components.

After login

redirect to Dashboard.

If already authenticated

redirect automatically.

---

## 10. Role System

Do NOT store roles in Clerk.

Roles remain inside Prisma.

Flow

Microsoft Login

↓

Clerk Session

↓

Database User

↓

Role

↓

Permission

---

## 11. Error Handling

Handle

Unauthorized tenant

Inactive user

Missing role

Deleted account

Missing database record

Gracefully.

---

## 12. Cleanup

Remove unused:

JWT utilities

bcrypt

refresh token code

legacy auth helpers

dead code

unused env vars

obsolete middleware

---

## 13. Validation

After refactoring

- project builds successfully
- lint passes
- no dead imports
- no TypeScript errors

---

# Deliverables

1. Complete implementation

2. Prisma migration

3. Updated environment variables

4. README authentication setup

5. Microsoft Entra configuration instructions

6. Clerk configuration instructions

7. Summary of all modified files

8. Summary of deleted files

9. Any manual setup steps that cannot be automated

---

# Constraints

- Follow existing project architecture.
- Make surgical changes.
- Do not refactor unrelated business modules.
- Preserve current coding style.
- Keep code clean and production-ready.
- Do not leave TODO placeholders.
- Do not mock authentication.
- Do not partially migrate.
- Finish the migration completely.

# Execution Strategy

Before modifying code:

1. Analyze the entire authentication flow.
2. Identify every file related to authentication.
3. Produce a migration plan.
4. Then execute the migration.
5. After implementation, perform a final cleanup pass to remove dead code.
6. Finally verify that the application builds successfully.

Do not stop after partial implementation.
Continue until the migration is complete.
