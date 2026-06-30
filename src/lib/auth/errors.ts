export type AuthErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED_TENANT"
  | "FORBIDDEN_DOMAIN"
  | "MISSING_EMAIL"
  | "MISSING_ROLE"
  | "INSUFFICIENT_PERMISSION";

/**
 * Authentication / authorization failure raised by the auth layer.
 *
 * `status` maps directly to the HTTP status that callers should return:
 * 401 for unauthenticated requests, 403 for authenticated-but-not-allowed.
 */
export class AuthError extends Error {
  readonly status: number;
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export function unauthenticated(message = "未授權") {
  return new AuthError("UNAUTHENTICATED", message, 401);
}

export function unauthorizedTenant(message = "此帳號不屬於授權的 Microsoft Entra 租戶") {
  return new AuthError("UNAUTHORIZED_TENANT", message, 403);
}

export function forbiddenDomain(message = "此帳號的電子郵件網域未獲授權") {
  return new AuthError("FORBIDDEN_DOMAIN", message, 403);
}

export function missingEmail(message = "Microsoft 帳號缺少已驗證的電子郵件") {
  return new AuthError("MISSING_EMAIL", message, 403);
}
