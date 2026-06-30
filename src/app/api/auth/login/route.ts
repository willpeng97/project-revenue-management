import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
  toAuthUser,
} from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return jsonError("請輸入帳號與密碼");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return jsonError("帳號或密碼錯誤", 401);
    }

    const authUser = toAuthUser(user);
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const response = jsonSuccess({ user: authUser, accessToken, refreshToken });
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });
    return response;
  } catch {
    return jsonError("登入失敗", 500);
  }
}
