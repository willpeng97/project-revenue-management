import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { forbiddenDomain, missingEmail, unauthorizedTenant } from "./errors";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;
type SessionClaims = Awaited<ReturnType<typeof auth>>["sessionClaims"];

const ALLOWED_EMAIL_DOMAIN = (
  process.env.ALLOWED_EMAIL_DOMAIN ?? "systexsoftware.com.tw"
).toLowerCase();

const ALLOWED_TENANT_ID = process.env.MICROSOFT_TENANT_ID?.trim();

/**
 * Resolve the Microsoft Entra tenant id (the `tid` claim) for the current user.
 *
 * Clerk surfaces this through the session token when the instance is configured
 * to forward the Microsoft `tid` claim (see README for the dashboard setup), and
 * we also accept it from the Clerk user's public metadata as a fallback.
 */
function extractTenantId(claims: SessionClaims, clerkUser: ClerkUser): string | null {
  const claimRecord = (claims ?? {}) as Record<string, unknown>;
  const candidateKeys = ["tid", "tenant_id", "tenantId", "azp_tid"];
  for (const key of candidateKeys) {
    const value = claimRecord[key];
    if (typeof value === "string" && value.length > 0) return value;
  }

  const metadataTenant = clerkUser.publicMetadata?.tenantId;
  if (typeof metadataTenant === "string" && metadataTenant.length > 0) {
    return metadataTenant;
  }

  return null;
}

function resolvePrimaryEmail(clerkUser: ClerkUser): string | null {
  const primary =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null;
  return primary ? primary.toLowerCase() : null;
}

function resolveName(clerkUser: ClerkUser, fallbackEmail: string): string {
  const full = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return clerkUser.fullName?.trim() || full || fallbackEmail;
}

function assertCompanyAccount(email: string, tenantId: string | null) {
  if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
    throw forbiddenDomain();
  }

  if (ALLOWED_TENANT_ID) {
    if (!tenantId || tenantId !== ALLOWED_TENANT_ID) {
      throw unauthorizedTenant();
    }
  } else if (process.env.NODE_ENV === "production") {
    // Tenant validation is mandatory in production; refuse rather than
    // silently downgrading to domain-only checks.
    throw unauthorizedTenant("缺少 MICROSOFT_TENANT_ID 設定，無法驗證租戶");
  }
}

/**
 * Synchronize the currently authenticated Clerk user with the Prisma `User`
 * table, enforcing the Microsoft Entra tenant + company email-domain policy.
 *
 * - Returns `null` when there is no active Clerk session.
 * - Throws an {@link AuthError} (HTTP 403) for users outside the tenant/domain.
 * - Creates the user on first login, otherwise refreshes name/email/lastLoginAt.
 *
 * Clerk's user id is used as the stable unique identity (`clerkId`), so the same
 * person never produces duplicate rows.
 */
export async function syncCurrentUser(): Promise<PrismaUser | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = resolvePrimaryEmail(clerkUser);
  if (!email) throw missingEmail();

  const tenantId = extractTenantId(sessionClaims, clerkUser);
  assertCompanyAccount(email, tenantId);

  const name = resolveName(clerkUser, email);

  return prisma.user.upsert({
    where: { clerkId: userId },
    create: { clerkId: userId, email, name, lastLoginAt: new Date() },
    update: { email, name, lastLoginAt: new Date() },
  });
}
