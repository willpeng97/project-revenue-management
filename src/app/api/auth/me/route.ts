import { syncCurrentUser, AuthError } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await syncCurrentUser();
    if (!user) return jsonError("未授權", 401);
    return jsonSuccess({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err instanceof AuthError) return jsonError(err.message, err.status);
    throw err;
  }
}
