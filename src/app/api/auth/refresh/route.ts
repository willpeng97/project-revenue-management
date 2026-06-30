import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken, toAuthUser } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) return jsonError("缺少 refresh token");

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return jsonError("Refresh token 無效", 401);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.refreshToken !== refreshToken) {
      return jsonError("Refresh token 無效", 401);
    }

    const authUser = toAuthUser(user);
    const newAccessToken = signAccessToken(authUser);
    const newRefreshToken = signRefreshToken(authUser);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return jsonSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return jsonError("刷新失敗", 500);
  }
}
